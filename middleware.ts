import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/app/lib/supabase/middleware'

export async function middleware(request: NextRequest) {
  const response = await updateSession(request)
  
  // プロジェクト、コラム、ドキュメントの詳細ページに対してキャッシュ制御ヘッダーを追加
  const pathname = request.nextUrl.pathname
  if (
    pathname.startsWith('/projects/') ||
    pathname.startsWith('/columns/') ||
    pathname.startsWith('/documents/')
  ) {
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}