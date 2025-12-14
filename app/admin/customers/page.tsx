import { createClient as createServerClient } from '@supabase/supabase-js'
import CustomersClient from './CustomersClient'

export default async function AdminCustomersPage() {
  // Admin用クライアント（auth.usersアクセス用、RLSバイパス）
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // auth.usersからログインユーザー一覧を取得
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.listUsers({
    page: 1,
    perPage: 1000,
  })

  if (authError) {
    console.error('Error fetching auth users:', authError)
  }

  // eラーニングユーザーデータを取得（購入履歴も含む）
  // 注意: supabaseAdminを使用（RLSをバイパス）- 管理画面では全ユーザーデータが必要
  const { data: eLearningUsers, error: usersError } = await supabaseAdmin
    .from('e_learning_users')
    .select(`
      *,
      purchases:e_learning_purchases (
        id,
        amount,
        status,
        created_at,
        content:e_learning_contents (
          id,
          title
        )
      )
    `)
    .order('created_at', { ascending: false })

  if (usersError) {
    console.error('Error fetching e_learning_users:', usersError)
  }

  // auth.usersとe_learning_usersを結合
  const authUsers = authData?.users || []
  const eLearningMap = new Map(
    (eLearningUsers || []).map((u) => [u.auth_user_id, u])
  )

  // 顧客データを構築（auth.usersをベースにe_learning_usersの情報を結合）
  const customers = authUsers.map((authUser) => {
    const eLearningUser = eLearningMap.get(authUser.id)
    return {
      id: eLearningUser?.id || authUser.id,
      auth_user_id: authUser.id,
      email: authUser.email || '',
      display_name: eLearningUser?.display_name || authUser.user_metadata?.full_name || null,
      avatar_url: eLearningUser?.avatar_url || authUser.user_metadata?.avatar_url || null,
      is_active: eLearningUser?.is_active ?? true,
      has_paid_access: eLearningUser?.has_paid_access ?? false,
      created_at: authUser.created_at,
      updated_at: eLearningUser?.updated_at || authUser.updated_at || authUser.created_at,
      last_accessed_at: eLearningUser?.last_accessed_at || null,
      purchases: eLearningUser?.purchases || [],
    }
  })

  // 登録日の新しい順にソート
  customers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

  // 契約企業を取得（紐づくユーザーも含む）
  const { data: corporateCustomers, error: corporateError } = await supabaseAdmin
    .from('e_learning_corporate_customers')
    .select(`
      *,
      users:e_learning_corporate_users (
        id,
        email,
        created_at
      )
    `)
    .order('created_at', { ascending: false })

  if (corporateError) {
    console.error('Error fetching corporate customers:', corporateError)
  }

  return (
    <CustomersClient
      customers={customers}
      corporateCustomers={corporateCustomers || []}
    />
  )
}
