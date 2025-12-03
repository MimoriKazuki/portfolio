import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  const redirectTo = requestUrl.searchParams.get('redirect_to') || '/e-learning'

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error('Error exchanging code for session:', error)
      return NextResponse.redirect(`${origin}/auth/login?error=auth_error`)
    }

    if (data.user) {
      // e_learning_usersテーブルにユーザーが存在するか確認
      const { data: existingUser, error: fetchError } = await supabase
        .from('e_learning_users')
        .select('id')
        .eq('auth_user_id', data.user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // ユーザーが存在しない場合、新規作成
        const { error: insertError } = await supabase
          .from('e_learning_users')
          .insert({
            auth_user_id: data.user.id,
            email: data.user.email || '',
            display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            is_active: true,
          })

        if (insertError) {
          console.error('Error creating e_learning_user:', insertError)
          // ユーザー作成に失敗してもログインは許可
        }
      }
    }
  }

  // リダイレクト先へ遷移
  return NextResponse.redirect(`${origin}${redirectTo}`)
}
