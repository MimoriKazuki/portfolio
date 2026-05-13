import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { requireAdmin, isAdminGuardErr } from '@/app/lib/auth/admin-guard'

// Admin用クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 全動画視聴可フラグ（has_full_access）を管理画面から手動切替
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const guard = await requireAdmin()
  if (isAdminGuardErr(guard)) {
    return NextResponse.json({ error: guard.error }, { status: guard.status })
  }

  try {
    const { id } = await params
    const body = await request.json()
    const { has_full_access } = body

    if (typeof has_full_access !== 'boolean') {
      return NextResponse.json(
        { error: 'has_full_access must be a boolean' },
        { status: 400 }
      )
    }

    // e_learning_users を更新（M5 安全順序 Step3：has_paid_access は touch しない）
    const { error } = await supabaseAdmin
      .from('e_learning_users')
      .update({ has_full_access, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to update user status:', error.message)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, has_full_access })
  } catch (error) {
    console.error('Error updating user status:', error instanceof Error ? error.message : String(error))
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
