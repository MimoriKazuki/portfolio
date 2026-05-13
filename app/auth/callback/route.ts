import { createServerClient } from '@supabase/ssr'
import { NextRequest, NextResponse } from 'next/server'
import { syncFromAuth } from '@/app/lib/services/user-service'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin

  // Open Redirect 対策：先頭が `/` で始まり、`//` `/\` で始まらない内部パスのみ許容。
  // - 外部 URL（http://evil.com）・protocol-relative（//evil.com）を弾く
  // - バックスラッシュ始まり（/\evil.com）はブラウザによって `/` 扱いされる挙動を弾く（security 再チェック [注意]）
  const rawRedirectTo = requestUrl.searchParams.get('redirect_to') || '/e-learning'
  const redirectTo = /^\/(?![\/\\])/.test(rawRedirectTo) ? rawRedirectTo : '/e-learning'

  // リダイレクト先URLを先に準備
  const redirectUrl = `${origin}${redirectTo}`

  if (!code) {
    // Supabase OAuth のエラー戻り（同意拒否・state 失敗等）は /auth/login にエラー表示で戻す
    const oauthError = requestUrl.searchParams.get('error')
    if (oauthError) {
      return NextResponse.redirect(`${origin}/auth/login?error=oauth_error`)
    }
    return NextResponse.redirect(redirectUrl)
  }

  // Route HandlerではNextResponseにCookieを設定する必要がある
  // cookies()を使うと、その後のNextResponse.redirect()にCookieが引き継がれない
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    // PII 漏洩対策：error オブジェクト全体ではなく message のみ出力
    console.error('Error exchanging code for session:', error.message)
    return NextResponse.redirect(`${origin}/auth/login?error=auth_error`)
  }

  if (data.user) {
    // e_learning_users 同期は user-service に集約（業務ロジック単一責務化）
    // 失敗してもログインは継続させる（syncFromAuth 内部でエラーログ済）
    await syncFromAuth({
      id: data.user.id,
      email: data.user.email || '',
      user_metadata: data.user.user_metadata,
    })
  }

  // Cookieが設定されたresponseオブジェクトを返す（これが重要！）
  return response
}
