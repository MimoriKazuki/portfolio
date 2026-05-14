import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import { Button } from '@/app/components/atoms/Button'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/app/components/molecules/Tabs'
import { AdminPageHeader } from '@/app/components/organisms/AdminPageHeader'
import { AdminFormTemplate } from '@/app/components/templates/AdminFormTemplate'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { CourseFormClient } from '../../_lib/CourseFormClient'
import { getAdminCategories } from '../../_lib/get-admin-courses'
import { CurriculumEditorClient } from '../_lib/CurriculumEditorClient'
import { getCourseCurriculum } from '../_lib/get-course-curriculum'

/**
 * C007 管理画面：コース編集（/admin/e-learning/courses/[id]/edit）
 *
 * 起点：
 * - docs/frontend/screens.md C007
 * - docs/frontend/page-templates.md §AdminFormTemplate
 *
 * 設計：
 * - 既存コース取得 + フォーム初期値投入
 * - 更新は updateCourseAction、論理削除は softDeleteCourseAction（CourseFormClient 内）
 * - 章・動画・資料の編集は別タスク（C008）
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function AdminELearningCourseEditPage({
  params,
  searchParams,
}: PageProps) {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    redirect(guard.status === 401 ? '/auth/login' : '/admin/e-learning')
  }

  const { id } = await params
  const sp = (await searchParams) ?? {}
  const wasCreated = sp.created === '1'

  const supabase = await createClient()
  const { data: course, error } = await supabase
    .from('e_learning_courses')
    .select(
      'id, title, slug, description, thumbnail_url, category_id, is_free, price, stripe_price_id, is_published, is_featured',
    )
    .eq('id', id)
    .maybeSingle()

  if (error) {
    console.error('[c007] fetch course failed', { code: error.code, id })
  }
  if (!course) notFound()

  const [categories, curriculum] = await Promise.all([
    getAdminCategories(),
    getCourseCurriculum(course.id as string),
  ])
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <AdminFormTemplate
      header={
        <AdminPageHeader
          title="コース編集"
          description={
            wasCreated
              ? 'コースを作成しました。続けて公開設定や章の追加を行えます。'
              : 'タブを切り替えて基本情報・カリキュラムを編集します。'
          }
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/e-learning/courses">一覧に戻る</Link>
            </Button>
          }
        />
      }
    >
      <Tabs defaultValue="basic">
        <TabsList>
          <TabsTrigger value="basic">基本情報</TabsTrigger>
          <TabsTrigger value="curriculum">カリキュラム</TabsTrigger>
        </TabsList>
        <TabsContent value="basic">
          <CourseFormClient
            mode="edit"
            courseId={course.id as string}
            initial={{
              title: course.title as string,
              slug: course.slug as string,
              description: (course.description as string | null) ?? '',
              thumbnail_url: (course.thumbnail_url as string | null) ?? '',
              category_id: course.category_id as string,
              is_free: !!course.is_free,
              price: (course.price as number | null) ?? null,
              stripe_price_id: (course.stripe_price_id as string | null) ?? '',
              is_published: !!course.is_published,
              is_featured: !!course.is_featured,
            }}
            categories={categoryOptions}
          />
        </TabsContent>
        <TabsContent value="curriculum">
          <CurriculumEditorClient
            courseId={course.id as string}
            chapters={curriculum}
          />
        </TabsContent>
      </Tabs>
    </AdminFormTemplate>
  )
}
