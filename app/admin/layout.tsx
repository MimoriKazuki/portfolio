import { redirect } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import AdminHeader from './components/AdminHeader'

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
    <div className="min-h-screen bg-youtube-dark">
      <AdminHeader user={user} />
      <main className="p-6 mt-16">
        {children}
      </main>
    </div>
  )
}