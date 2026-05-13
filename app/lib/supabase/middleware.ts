import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// 認証必須ルートの判定。
// 既存稼働パブリック画面（/, /projects, /columns, /documents 等）は false を返してガード対象外。
// 参照：docs/auth/flow.md §C
const requiresAuth = (pathname: string): boolean => {
  // 認証ページ自体・OAuth コールバック・認証 API は除外
  if (pathname.startsWith('/auth/')) return false
  if (pathname.startsWith('/login')) return false
  if (pathname.startsWith('/api/auth/')) return false
  // Stripe Webhook は外部からの Cookie なしコールバック・ガード対象外
  if (pathname.startsWith('/api/stripe/webhook')) return false

  // /e-learning は LP として未ログイン可・配下（コース・動画詳細等）はガード
  if (pathname === '/e-learning') return false
  if (pathname.startsWith('/e-learning/')) return true

  // 管理画面 + 管理 API（多層防御は各 route.ts 側でも requireAdmin で検証）
  if (pathname.startsWith('/admin')) return true
  if (pathname.startsWith('/api/admin/')) return true

  // 視聴・進捗・購入・退会
  if (pathname.startsWith('/play')) return true
  if (pathname.startsWith('/videos/')) return true
  if (pathname === '/complete' || pathname.startsWith('/complete/')) return true
  if (pathname.startsWith('/api/checkout')) return true
  if (pathname.startsWith('/api/me/')) return true

  return false
}

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const pathname = request.nextUrl.pathname

  // 認証ページ自体や旧 /login への直アクセスは Supabase クライアント生成不要
  if (pathname.startsWith('/auth/') || pathname.startsWith('/login')) {
    return supabaseResponse
  }

  // 開発環境で Supabase 環境変数が未設定なら認証チェックをスキップ
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not set - skipping authentication')
    return supabaseResponse
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user && requiresAuth(pathname)) {
    const url = request.nextUrl.clone()
    url.pathname = '/auth/login'
    url.search = ''
    url.searchParams.set('returnTo', pathname + request.nextUrl.search)
    return NextResponse.redirect(url)
  }

  // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
  // creating a new response object with NextResponse.next() make sure to:
  // 1. Pass the request in it, like so:
  //    const myNewResponse = NextResponse.next({ request })
  // 2. Copy over the cookies, like so:
  //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
  // 3. Change the myNewResponse object to fit your needs, but avoid changing
  //    the cookies!
  // 4. Finally:
  //    return myNewResponse
  // If this is not done, you may be causing the browser and server to go out
  // of sync and terminate the user's session prematurely!

  return supabaseResponse
}
