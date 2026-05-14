import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Button } from '@/app/components/atoms/Button'
import { AdminPageHeader } from '@/app/components/organisms/AdminPageHeader'
import { AdminListTemplate } from '@/app/components/templates/AdminListTemplate'
import { requireAdmin } from '@/app/lib/auth/admin-guard'
import { AdminCoursesFilterClient } from './_lib/AdminCoursesFilterClient'
import { AdminCoursesTableClient } from './_lib/AdminCoursesTableClient'
import {
  getAdminCategories,
  getAdminCourses,
  type AdminCoursesFilters,
} from './_lib/get-admin-courses'

/**
 * C005 管理画面：コース一覧（/admin/e-learning/courses）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md C005
 * - docs/frontend/page-templates.md §AdminListTemplate
 *
 * 設計：
 * - 管理者認証：middleware + requireAdmin 多層防御
 * - URL query 連動フィルタ（status / category / q）
 * - 既存 admin（projects / columns / documents）完全非破壊・新規 path /admin/e-learning/courses/* で並走
 */

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

function parseFilters(
  sp: Record<string, string | string[] | undefined>,
): AdminCoursesFilters {
  const get = (key: string): string | undefined => {
    const v = sp[key]
    return Array.isArray(v) ? v[0] : v
  }

  const statusParam = get('status')
  const status: AdminCoursesFilters['status'] =
    statusParam === 'draft' || statusParam === 'deleted' || statusParam === 'all'
      ? statusParam
      : 'published'

  const cat = get('category')
  const categoryIds = cat ? [cat] : undefined

  return { status, categoryIds, keyword: get('q') }
}

export default async function AdminELearningCoursesPage({ searchParams }: PageProps) {
  const guard = await requireAdmin()
  if (guard.ok === false) {
    redirect(guard.status === 401 ? '/auth/login' : '/admin/e-learning')
  }

  const sp = await searchParams
  const filters = parseFilters(sp)
  const [courses, categories] = await Promise.all([
    getAdminCourses(filters),
    getAdminCategories(),
  ])

  const categoryOptions = categories.map(c => ({ value: c.id, label: c.name }))

  return (
    <AdminListTemplate
      header={
        <AdminPageHeader
          title="コース管理"
          description="Eラーニングのコース一覧。新規作成・編集・公開／非公開切替を行えます。"
          actions={
            <Button asChild>
              <Link href="/admin/e-learning/courses/new">新規作成</Link>
            </Button>
          }
        />
      }
      filterBar={<AdminCoursesFilterClient categories={categoryOptions} />}
      table={<AdminCoursesTableClient courses={courses} />}
    />
  )
}
