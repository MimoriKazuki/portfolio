import { createClient } from '@/app/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { NextRequest, NextResponse } from 'next/server'

// 契約企業のユーザーかどうかを確認（RLSをバイパスするためservice role使用）
async function checkCorporateUser(email: string): Promise<boolean> {
  const supabaseAdmin = createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // 契約中の企業に紐づくメールアドレスかチェック
  const { data } = await supabaseAdmin
    .from('e_learning_corporate_users')
    .select(`
      id,
      corporate_customer:e_learning_corporate_customers!inner (
        id,
        contract_status
      )
    `)
    .eq('email', email.toLowerCase())
    .eq('corporate_customer.contract_status', 'active')
    .limit(1)

  return data !== null && data.length > 0
}

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
      const userEmail = data.user.email || ''

      // 契約企業のユーザーかチェック
      const isCorporateUser = userEmail ? await checkCorporateUser(userEmail) : false

      // e_learning_usersテーブルにユーザーが存在するか確認
      const { data: existingUser, error: fetchError } = await supabase
        .from('e_learning_users')
        .select('id, has_paid_access')
        .eq('auth_user_id', data.user.id)
        .single()

      if (fetchError && fetchError.code === 'PGRST116') {
        // ユーザーが存在しない場合、新規作成
        const { error: insertError } = await supabase
          .from('e_learning_users')
          .insert({
            auth_user_id: data.user.id,
            email: userEmail,
            display_name: data.user.user_metadata?.full_name || data.user.user_metadata?.name || null,
            avatar_url: data.user.user_metadata?.avatar_url || null,
            is_active: true,
            has_paid_access: isCorporateUser, // 企業ユーザーの場合は有料アクセス付与
          })

        if (insertError) {
          console.error('Error creating e_learning_user:', insertError)
          // ユーザー作成に失敗してもログインは許可
        }
      } else if (existingUser && isCorporateUser && !existingUser.has_paid_access) {
        // 既存ユーザーで企業ユーザーなのにhas_paid_accessがfalseの場合、更新
        await supabase
          .from('e_learning_users')
          .update({ has_paid_access: true })
          .eq('id', existingUser.id)
      }
    }
  }

  // リダイレクト先へ遷移
  return NextResponse.redirect(`${origin}${redirectTo}`)
}
