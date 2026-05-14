import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/app/components/atoms/Button'
import { AdminPageHeader } from '@/app/components/organisms/AdminPageHeader'
import { AdminFormTemplate } from '@/app/components/templates/AdminFormTemplate'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { CourseFormClient } from '../_lib/CourseFormClient'
import { getAdminCategories } from '../_lib/get-admin-courses'

/**
 * C006 管理画面：コース新規作成（/admin/e-learning/courses/new）
 *
 * 起点：
 * - docs/frontend/screens.md C006
 * - docs/frontend/page-templates.md §AdminFormTemplate
 *
 * 設計：
 * - 基本情報のみ Phase 3 で実装
 * - 章＋動画＋資料の DnD は C008 別タスク（編集画面のタブとして実装予定）
 * - 作成成功後は /admin/e-learning/courses/[id]/edit?created=1 へ遷移
 */

export const dynamic = 'force-dynamic'

export default async function AdminELearningCourseNewPage() {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    redirect(guard.status === 401 ? '/auth/login' : '/admin/e-learning')
  }

  const categories = await getAdminCategories()
  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <AdminFormTemplate
      header={
        <AdminPageHeader
          title="コース新規作成"
          description="基本情報を入力してコースを作成します。章・動画・資料は作成後の編集画面で追加してください。"
          actions={
            <Button asChild variant="outline">
              <Link href="/admin/e-learning/courses">一覧に戻る</Link>
            </Button>
          }
        />
      }
    >
      <CourseFormClient
        mode="create"
        initial={{
          title: '',
          slug: '',
          description: '',
          thumbnail_url: '',
          category_id: categoryOptions[0]?.value ?? '',
          is_free: false,
          price: null,
          stripe_price_id: '',
          is_published: false,
          is_featured: false,
        }}
        categories={categoryOptions}
      />
    </AdminFormTemplate>
  )
}
