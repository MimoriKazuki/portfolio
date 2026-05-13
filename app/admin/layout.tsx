import { redirect } from 'next/navigation'
import { requireAdmin, isAdminGuardErr } from '@/app/lib/auth/admin-guard'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const guard = await requireAdmin()

  if (isAdminGuardErr(guard)) {
    if (guard.status === 401) {
      redirect('/auth/login?returnTo=' + encodeURIComponent('/admin'))
    }
    // 403：認証済だが管理者ではない → e-learning に戻す
    redirect('/e-learning')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-0 bg-gray-50" style={{ zIndex: -1 }} aria-hidden="true" />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6 overflow-x-hidden ml-56">
          {children}
        </main>
      </div>
    </div>
  )
}
