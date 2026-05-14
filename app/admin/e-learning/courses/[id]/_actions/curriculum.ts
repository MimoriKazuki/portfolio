'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/app/lib/supabase/server'
import { requireAdmin } from '@/app/lib/auth/admin-guard'

/**
 * C008 カリキュラム編集：Server Action 群。
 *
 * 各操作は requireAdmin で認証ガード後、Supabase で UPSERT/DELETE を実行。
 * 並び替えは display_order を整数で一括更新（DEFERRABLE UNIQUE はないため、二段階更新で衝突回避）。
 */

export type CurriculumResult =
  | { success: true }
  | { success: false; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'NOT_FOUND' | 'CONFLICT' | 'DB_ERROR'; message?: string }

async function authGuard(): Promise<CurriculumResult | null> {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    return { success: false, code: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN' }
  }
  return null
}

function revalidateAll(courseId: string, slug?: string | null) {
  revalidatePath(`/admin/e-learning/courses/${courseId}/edit`)
  revalidatePath(`/admin/e-learning/courses`)
  if (slug) {
    revalidatePath(`/e-learning/lp/courses/${slug}`)
  }
}

// ---- 章 ----

export async function createChapterAction(
  courseId: string,
  title: string,
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail
  if (!title.trim()) return { success: false, code: 'CONFLICT', message: '章名は必須です' }

  const supabase = await createClient()
  // 末尾に追加（最大 display_order + 1）
  const { data: maxRow } = await supabase
    .from('e_learning_course_chapters')
    .select('display_order')
    .eq('course_id', courseId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (maxRow?.display_order ?? 0) + 1

  const { error } = await supabase
    .from('e_learning_course_chapters')
    .insert({ course_id: courseId, title: title.trim(), display_order: nextOrder })
  if (error) {
    console.error('[c008] createChapter failed', { code: error.code, courseId })
    return { success: false, code: 'DB_ERROR' }
  }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

export async function updateChapterTitleAction(
  chapterId: string,
  courseId: string,
  title: string,
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail
  if (!title.trim()) return { success: false, code: 'CONFLICT', message: '章名は必須です' }

  const supabase = await createClient()
  const { error } = await supabase
    .from('e_learning_course_chapters')
    .update({ title: title.trim() })
    .eq('id', chapterId)
  if (error) return { success: false, code: 'DB_ERROR' }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

export async function deleteChapterAction(
  chapterId: string,
  courseId: string,
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail

  const supabase = await createClient()
  const { error } = await supabase
    .from('e_learning_course_chapters')
    .delete()
    .eq('id', chapterId)
  if (error) {
    console.error('[c008] deleteChapter failed', { code: error.code, chapterId })
    return { success: false, code: 'DB_ERROR' }
  }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

export async function reorderChaptersAction(
  courseId: string,
  orderedChapterIds: string[],
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail

  const supabase = await createClient()
  // (course_id, display_order) UNIQUE 制約があるため、二段階更新で衝突回避：
  // 1. 全章を 1000 + index に退避（衝突域から外す）
  // 2. 改めて 1..N に振り直す
  for (let i = 0; i < orderedChapterIds.length; i++) {
    const { error } = await supabase
      .from('e_learning_course_chapters')
      .update({ display_order: 1000 + i })
      .eq('id', orderedChapterIds[i])
    if (error) {
      console.error('[c008] reorderChapters stage1 failed', { code: error.code })
      return { success: false, code: 'DB_ERROR' }
    }
  }
  for (let i = 0; i < orderedChapterIds.length; i++) {
    const { error } = await supabase
      .from('e_learning_course_chapters')
      .update({ display_order: i + 1 })
      .eq('id', orderedChapterIds[i])
    if (error) {
      console.error('[c008] reorderChapters stage2 failed', { code: error.code })
      return { success: false, code: 'DB_ERROR' }
    }
  }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

// ---- 動画 ----

export type VideoInput = {
  title: string
  video_url: string
  description?: string | null
  duration?: string | null
  is_free: boolean
}

function validateVideo(input: VideoInput): string | null {
  if (!input.title.trim()) return 'タイトルは必須です'
  if (input.title.length > 200) return 'タイトルは 200 文字以内'
  if (!input.video_url.trim()) return '動画 URL は必須です'
  if (input.duration && input.duration.length > 20) return '動画長は 20 文字以内'
  return null
}

export async function createVideoAction(
  chapterId: string,
  courseId: string,
  input: VideoInput,
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail
  const v = validateVideo(input)
  if (v) return { success: false, code: 'CONFLICT', message: v }

  const supabase = await createClient()
  const { data: maxRow } = await supabase
    .from('e_learning_course_videos')
    .select('display_order')
    .eq('chapter_id', chapterId)
    .order('display_order', { ascending: false })
    .limit(1)
    .maybeSingle()
  const nextOrder = (maxRow?.display_order ?? 0) + 1

  const { error } = await supabase.from('e_learning_course_videos').insert({
    chapter_id: chapterId,
    title: input.title.trim(),
    description: input.description?.trim() || null,
    video_url: input.video_url.trim(),
    duration: input.duration?.trim() || null,
    is_free: input.is_free,
    display_order: nextOrder,
  })
  if (error) return { success: false, code: 'DB_ERROR' }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

export async function updateVideoAction(
  videoId: string,
  courseId: string,
  input: VideoInput,
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail
  const v = validateVideo(input)
  if (v) return { success: false, code: 'CONFLICT', message: v }

  const supabase = await createClient()
  const { error } = await supabase
    .from('e_learning_course_videos')
    .update({
      title: input.title.trim(),
      description: input.description?.trim() || null,
      video_url: input.video_url.trim(),
      duration: input.duration?.trim() || null,
      is_free: input.is_free,
    })
    .eq('id', videoId)
  if (error) return { success: false, code: 'DB_ERROR' }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

export async function deleteVideoAction(
  videoId: string,
  courseId: string,
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail

  const supabase = await createClient()
  const { error } = await supabase
    .from('e_learning_course_videos')
    .delete()
    .eq('id', videoId)
  if (error) return { success: false, code: 'DB_ERROR' }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}

export async function reorderVideosAction(
  chapterId: string,
  courseId: string,
  orderedVideoIds: string[],
): Promise<CurriculumResult> {
  const fail = await authGuard()
  if (fail) return fail

  const supabase = await createClient()
  // (chapter_id, display_order) UNIQUE のため二段階更新
  for (let i = 0; i < orderedVideoIds.length; i++) {
    const { error } = await supabase
      .from('e_learning_course_videos')
      .update({ display_order: 1000 + i })
      .eq('id', orderedVideoIds[i])
    if (error) return { success: false, code: 'DB_ERROR' }
  }
  for (let i = 0; i < orderedVideoIds.length; i++) {
    const { error } = await supabase
      .from('e_learning_course_videos')
      .update({ display_order: i + 1 })
      .eq('id', orderedVideoIds[i])
    if (error) return { success: false, code: 'DB_ERROR' }
  }

  const { data: course } = await supabase
    .from('e_learning_courses')
    .select('slug')
    .eq('id', courseId)
    .maybeSingle()
  revalidateAll(courseId, course?.slug ?? null)
  return { success: true }
}
