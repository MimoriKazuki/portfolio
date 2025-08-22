import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import AdminSidebar from './components/AdminSidebar'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  
  const {
    data: { user },
    error
  } = await supabase.auth.getUser()

  console.log('Admin layout auth check:', { user: user?.email, error })

  if (!user) {
    console.log('No user found, redirecting to login')
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="fixed inset-0 bg-gray-50" style={{ zIndex: -1 }} aria-hidden="true" />
      <div className="flex">
        <AdminSidebar user={user} />
        <main className="flex-1 p-6 overflow-x-hidden ml-56">
          {children}
        </main>
      </div>
    </div>
  )
}