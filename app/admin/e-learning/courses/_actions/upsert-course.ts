'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { requireAdmin } from '@/app/lib/auth/admin-guard'

/**
 * C006/C007 コース新規作成・編集 Server Action。
 *
 * 共通項目（schema.dbml / docs/backend/database 準拠）：
 * - title（VARCHAR(200) NOT NULL）
 * - slug（VARCHAR(100) NOT NULL UNIQUE）
 * - description（TEXT）
 * - thumbnail_url（TEXT）
 * - category_id（UUID NOT NULL・M2 確定）
 * - is_free（boolean）
 * - price（INT・nullable）
 * - stripe_price_id（VARCHAR(64)・nullable・UNIQUE）
 * - is_published（boolean）
 * - is_featured（boolean）
 *
 * 設計：
 * - Phase 3 では基本情報のみ。章＋動画＋資料は C008 で詳細実装
 * - 論理削除：deleted_at セット用に別 Action（soft-delete）
 */

export type UpsertCourseResult =
  | { success: true; course_id: string; slug: string }
  | {
      success: false
      code:
        | 'UNAUTHORIZED'
        | 'FORBIDDEN'
        | 'VALIDATION_ERROR'
        | 'CONFLICT_SLUG'
        | 'CONFLICT_STRIPE_PRICE'
        | 'DB_ERROR'
      message?: string
    }

export type UpsertCourseInput = {
  title: string
  slug: string
  description?: string | null
  thumbnail_url?: string | null
  category_id: string
  is_free: boolean
  price: number | null
  stripe_price_id?: string | null
  is_published: boolean
  is_featured: boolean
}

function validate(input: UpsertCourseInput): string | null {
  if (!input.title || input.title.trim() === '') return 'タイトルは必須です'
  if (input.title.length > 200) return 'タイトルは 200 文字以内で入力してください'
  if (!input.slug || !/^[a-z0-9-]{1,100}$/.test(input.slug))
    return 'スラッグは英数字 + ハイフンで 1〜100 文字'
  if (!input.category_id) return 'カテゴリは必須です'
  if (!input.is_free) {
    if (input.price === null || input.price <= 0)
      return '有料コースは価格を正の整数で入力してください'
  }
  if (input.stripe_price_id && input.stripe_price_id.length > 64)
    return 'Stripe Price ID は 64 文字以内'
  return null
}

function normalize(input: UpsertCourseInput) {
  return {
    title: input.title.trim(),
    slug: input.slug.trim(),
    description: input.description?.trim() || null,
    thumbnail_url: input.thumbnail_url?.trim() || null,
    category_id: input.category_id,
    is_free: input.is_free,
    price: input.is_free ? null : input.price,
    stripe_price_id: input.is_free ? null : input.stripe_price_id?.trim() || null,
    is_published: input.is_published,
    is_featured: input.is_featured,
  }
}

export async function createCourseAction(
  input: UpsertCourseInput,
): Promise<UpsertCourseResult> {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    return { success: false, code: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN' }
  }

  const validation = validate(input)
  if (validation) return { success: false, code: 'VALIDATION_ERROR', message: validation }

  const supabase = await createClient()
  const row = normalize(input)

  const { data, error } = await supabase
    .from('e_learning_courses')
    .insert(row)
    .select('id, slug')
    .single()

  if (error) {
    const code = (error as { code?: string }).code
    const msg = error.message ?? ''
    if (code === '23505') {
      if (msg.includes('slug')) return { success: false, code: 'CONFLICT_SLUG' }
      if (msg.includes('stripe_price_id'))
        return { success: false, code: 'CONFLICT_STRIPE_PRICE' }
    }
    console.error('[c006] createCourseAction failed', { code, msg })
    return { success: false, code: 'DB_ERROR' }
  }
  if (!data) return { success: false, code: 'DB_ERROR' }

  revalidatePath('/admin/e-learning/courses')
  return { success: true, course_id: data.id as string, slug: data.slug as string }
}

export async function updateCourseAction(
  courseId: string,
  input: UpsertCourseInput,
): Promise<UpsertCourseResult> {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    return { success: false, code: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN' }
  }

  const validation = validate(input)
  if (validation) return { success: false, code: 'VALIDATION_ERROR', message: validation }

  const supabase = await createClient()
  const row = normalize(input)

  const { data, error } = await supabase
    .from('e_learning_courses')
    .update(row)
    .eq('id', courseId)
    .select('id, slug')
    .single()

  if (error) {
    const code = (error as { code?: string }).code
    const msg = error.message ?? ''
    if (code === '23505') {
      if (msg.includes('slug')) return { success: false, code: 'CONFLICT_SLUG' }
      if (msg.includes('stripe_price_id'))
        return { success: false, code: 'CONFLICT_STRIPE_PRICE' }
    }
    console.error('[c007] updateCourseAction failed', { code, msg, courseId })
    return { success: false, code: 'DB_ERROR' }
  }
  if (!data) return { success: false, code: 'DB_ERROR' }

  revalidatePath('/admin/e-learning/courses')
  revalidatePath(`/admin/e-learning/courses/${courseId}/edit`)
  revalidatePath(`/e-learning/lp/courses/${data.slug}`)
  return { success: true, course_id: data.id as string, slug: data.slug as string }
}

export type SoftDeleteResult =
  | { success: true }
  | { success: false; code: 'UNAUTHORIZED' | 'FORBIDDEN' | 'DB_ERROR' }

export async function softDeleteCourseAction(courseId: string): Promise<SoftDeleteResult> {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    return { success: false, code: guard.status === 401 ? 'UNAUTHORIZED' : 'FORBIDDEN' }
  }

  const supabase = await createClient()
  const { error } = await supabase
    .from('e_learning_courses')
    .update({ deleted_at: new Date().toISOString(), is_published: false })
    .eq('id', courseId)

  if (error) {
    console.error('[c007] softDeleteCourseAction failed', { code: error.code, courseId })
    return { success: false, code: 'DB_ERROR' }
  }

  revalidatePath('/admin/e-learning/courses')
  redirect('/admin/e-learning/courses')
}
