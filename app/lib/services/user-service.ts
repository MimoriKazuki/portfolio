import { createClient as createServiceClient } from '@supabase/supabase-js'

/**
 * user-service：OAuth コールバック時の e_learning_users 同期を担う。
 *
 * 起点：
 * - docs/auth/flow.md §F（アカウント自動連携の冪等性）/ §G（退会の再活性化フロー）
 * - docs/backend/logic/services/auxiliary-services.md / user-service
 *
 * 重要な設計判断（M5 安全順序 Step3）：
 * - 新規コードからは `has_paid_access` を一切参照・更新しない
 * - 旧カラムは Sub 2f で削除予定。それまでは DB 上に残存するが本サービスからは touch しない
 * - has_full_access のみ操作する
 *
 * ログ方針（PII 保護）：
 * - 出力は構造化（`{ code, auth_user_id }` 形式）
 * - email / display_name は記録しない
 * - DB エラーメッセージ本文も記録せず error.code のみ（PostgreSQL のメッセージにカラム名や PII を含むリスク回避）
 */

type AuthUserLike = {
  id: string
  email: string
  user_metadata?: {
    full_name?: string
    name?: string
    avatar_url?: string
  } | null
}

type SyncResult = {
  id: string
  has_full_access: boolean
}

const UNIQUE_VIOLATION = '23505'
const NOT_FOUND = 'PGRST116'

function getServiceClient() {
  return createServiceClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

/**
 * 契約中の企業に紐づくメールかどうかを判定（RLS バイパスのため service-role を使用）。
 */
export async function isCorporateUserEmail(email: string): Promise<boolean> {
  if (!email) return false
  const supabaseAdmin = getServiceClient()
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

/**
 * OAuth ログイン時に呼ぶ：e_learning_users への冪等 upsert。
 *
 * 動作：
 * - 該当 auth_user_id のレコードが無い → INSERT
 *   - 企業ユーザー（active な corporate_customers 配下にメール登録あり）→ has_full_access=true
 *   - それ以外 → has_full_access=false
 * - 既存 + deleted_at IS NOT NULL → 再活性化（deleted_at=NULL に戻し、is_active=true、display_name / avatar_url を再設定）
 *   - has_full_access は維持（L1 確定：再登録で履歴引継）
 *   - ただし企業ユーザーで現状 false なら true に昇格
 * - 既存 + deleted_at IS NULL → 何もしない（冪等）
 *   - 企業ユーザーで has_full_access が false の場合のみ true に更新
 *
 * UNIQUE(auth_user_id) 違反は同時並行ログイン時に発生し得るため、捕捉して SELECT を再実行する。
 */
export async function syncFromAuth(authUser: AuthUserLike): Promise<SyncResult> {
  const supabaseAdmin = getServiceClient()
  const email = authUser.email || ''
  const displayName =
    authUser.user_metadata?.full_name || authUser.user_metadata?.name || null
  const avatarUrl = authUser.user_metadata?.avatar_url || null

  const isCorporate = email ? await isCorporateUserEmail(email) : false

  // 既存レコード取得（deleted_at も読む）
  const { data: existingUser, error: fetchError } = await supabaseAdmin
    .from('e_learning_users')
    .select('id, has_full_access, deleted_at')
    .eq('auth_user_id', authUser.id)
    .single()

  if (fetchError && fetchError.code === NOT_FOUND) {
    // 新規 INSERT
    const { data: inserted, error: insertError } = await supabaseAdmin
      .from('e_learning_users')
      .insert({
        auth_user_id: authUser.id,
        email,
        display_name: displayName,
        avatar_url: avatarUrl,
        is_active: true,
        has_full_access: isCorporate,
      })
      .select('id, has_full_access')
      .single()

    if (insertError) {
      // 並行ログインで他リクエストが先に INSERT した場合（UNIQUE 違反）→ SELECT を再実行
      if (insertError.code === UNIQUE_VIOLATION) {
        const { data: refetched } = await supabaseAdmin
          .from('e_learning_users')
          .select('id, has_full_access')
          .eq('auth_user_id', authUser.id)
          .single()
        if (refetched) {
          return { id: refetched.id, has_full_access: !!refetched.has_full_access }
        }
      }
      console.error('[user-service] insert failed', {
        code: insertError.code,
        auth_user_id: authUser.id,
      })
      // INSERT 失敗でもログインは許可するため最小限の戻り値を返すが、
      // 安全側に倒す：DB エラー時は has_full_access=false で返す（権限を与えすぎない）
      console.warn('[user-service] fallback to has_full_access=false', {
        auth_user_id: authUser.id,
        isCorporate,
        code: insertError.code,
      })
      return { id: authUser.id, has_full_access: false }
    }
    console.info('[user-service] user created', {
      auth_user_id: authUser.id,
      has_full_access: isCorporate,
    })
    return { id: inserted.id, has_full_access: !!inserted.has_full_access }
  }

  if (existingUser) {
    const needsReactivation = existingUser.deleted_at !== null
    const needsCorporatePromotion =
      isCorporate && !existingUser.has_full_access

    if (needsReactivation || needsCorporatePromotion) {
      const update: Record<string, unknown> = {}
      if (needsReactivation) {
        update.deleted_at = null
        update.is_active = true
        update.display_name = displayName
        update.avatar_url = avatarUrl
      }
      if (needsCorporatePromotion) {
        update.has_full_access = true
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('e_learning_users')
        .update(update)
        .eq('id', existingUser.id)
        .select('id, has_full_access')
        .single()

      if (updateError) {
        console.error('[user-service] update failed', {
          code: updateError.code,
          auth_user_id: authUser.id,
        })
        return { id: existingUser.id, has_full_access: !!existingUser.has_full_access }
      }
      if (needsReactivation) {
        console.info('[user-service] user reactivated', { auth_user_id: authUser.id })
      }
      if (needsCorporatePromotion) {
        console.info('[user-service] user promoted to corporate', {
          auth_user_id: authUser.id,
        })
      }
      return { id: updated.id, has_full_access: !!updated.has_full_access }
    }

    // 何もしない（冪等）
    return { id: existingUser.id, has_full_access: !!existingUser.has_full_access }
  }

  // ここに来るのは想定外（fetchError があるが NOT_FOUND でないケース）
  // 安全側に倒す：DB エラー時は has_full_access=false で返す（権限を与えすぎない）
  console.error('[user-service] fetch failed', {
    code: fetchError?.code,
    auth_user_id: authUser.id,
  })
  console.warn('[user-service] fallback to has_full_access=false', {
    auth_user_id: authUser.id,
    isCorporate,
    code: fetchError?.code,
  })
  return { id: authUser.id, has_full_access: false }
}
