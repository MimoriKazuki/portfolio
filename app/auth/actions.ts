'use server'

import { createClient } from '@/app/lib/supabase/server'
import { redirect } from 'next/navigation'

export async function signOut() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/e-learning')
}

export async function getUser() {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // e_learning_usersテーブルからユーザー情報を取得
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('*')
    .eq('auth_user_id', user.id)
    .single()

  return {
    ...user,
    e_learning_user: eLearningUser,
  }
}

export async function checkPurchase(contentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return false
  }

  // e_learning_usersからユーザーIDを取得
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  if (!eLearningUser) {
    return false
  }

  // 購入履歴を確認
  const { data: purchase } = await supabase
    .from('e_learning_purchases')
    .select('id')
    .eq('user_id', eLearningUser.id)
    .eq('content_id', contentId)
    .eq('status', 'completed')
    .single()

  return !!purchase
}
