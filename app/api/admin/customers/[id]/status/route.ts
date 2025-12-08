import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin用クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 購入ステータス（has_paid_access）を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { has_paid_access } = body

    if (typeof has_paid_access !== 'boolean') {
      return NextResponse.json(
        { error: 'has_paid_access must be a boolean' },
        { status: 400 }
      )
    }

    // e_learning_usersテーブルを更新
    const { error } = await supabaseAdmin
      .from('e_learning_users')
      .update({ has_paid_access, updated_at: new Date().toISOString() })
      .eq('id', id)

    if (error) {
      console.error('Failed to update user status:', error)
      return NextResponse.json(
        { error: 'Failed to update user status' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, has_paid_access })
  } catch (error) {
    console.error('Error updating user status:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
