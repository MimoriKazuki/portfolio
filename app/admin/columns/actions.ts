'use server'

import { createClient } from '@/app/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function createColumn(columnData: any) {
  try {
    console.log('[Server Action] Creating column with data:', columnData)
    
    const supabase = await createClient()
    
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log('[Server Action] Auth check:', { user: user?.email, authError })
    
    if (!user) {
      return { error: '認証されていません' }
    }

    // データ挿入
    const { data, error } = await supabase
      .from('columns')
      .insert([columnData])
      .select()
      .single()

    console.log('[Server Action] Insert result:', { data, error })

    if (error) {
      console.error('[Server Action] Create column error:', error)
      return { error: error.message }
    }

    revalidatePath('/admin/columns')
    return { data }
  } catch (err) {
    console.error('[Server Action] Unexpected error:', err)
    return { error: err instanceof Error ? err.message : 'Unknown server error' }
  }
}

export async function updateColumn(columnId: string, columnData: any) {
  const supabase = await createClient()
  
  // 認証確認
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { error: '認証されていません' }
  }

  // データ更新
  const { data, error } = await supabase
    .from('columns')
    .update(columnData)
    .eq('id', columnId)
    .select()
    .single()

  if (error) {
    console.error('Update column error:', error)
    return { error: error.message }
  }

  revalidatePath('/admin/columns')
  revalidatePath(`/admin/columns/${columnId}/edit`)
  return { data }
}