import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { getViewerAccess } from '@/app/lib/services/access-service'

/**
 * GET /api/me/access
 *
 * 起点：
 * - docs/api/endpoints.md GET /api/me/access
 * - docs/backend/logic/services/access-service.md §getViewerAccess
 *
 * 用途：
 * - B009 購入完了画面の Webhook 反映ポーリング先（2 秒間隔・最大 10 回）
 * - 複数視聴可否を 1 リクエストで判定する FE 集約取得
 *
 * 設計：
 * - キャッシュなし（毎リクエスト fresh）— access-service.md §「BE 側の責務」準拠
 * - has_full_access + purchased_course_ids + purchased_content_ids を返す
 * - 個人別情報のため認証必須
 */

export const dynamic = 'force-dynamic'

export async function GET() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: { code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .maybeSingle()

  if (!eLearningUser) {
    // 未同期ユーザー：安全側で空アクセスを返す（401 ではない・/auth/callback がまだ動いていない場合の暫定）
    return NextResponse.json({
      has_full_access: false,
      purchased_course_ids: [],
      purchased_content_ids: [],
    })
  }

  const access = await getViewerAccess(eLearningUser.id)
  return NextResponse.json(access, {
    headers: { 'Cache-Control': 'no-store' },
  })
}
