import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET() {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
          })
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return NextResponse.json({ user: null, hasPaidAccess: false, error: error?.message }, { status: 200 })
  }

  // e_learning_usersテーブルから有料アクセス状態を確認
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('has_paid_access')
    .eq('auth_user_id', user.id)
    .single()

  const hasPaidAccess = eLearningUser?.has_paid_access ?? false

  return NextResponse.json({ user, hasPaidAccess }, { status: 200 })
}
