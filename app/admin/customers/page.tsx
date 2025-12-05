import { createClient } from '@/app/lib/supabase/server'
import CustomersClient from './CustomersClient'

export default async function AdminCustomersPage() {
  const supabase = await createClient()

  // eラーニングユーザーを取得（購入履歴も含む）
  const { data: users, error: usersError } = await supabase
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

  return <CustomersClient customers={users || []} />
}
