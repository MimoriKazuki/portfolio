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
    <div className="min-h-screen bg-gray-50" style={{ overscrollBehavior: 'none' }}>
      <div className="flex">
        <AdminSidebar user={user} />
        <main className="flex-1 p-6 overflow-x-hidden ml-56" style={{ overscrollBehavior: 'none' }}>
          {children}
        </main>
      </div>
    </div>
  )
}