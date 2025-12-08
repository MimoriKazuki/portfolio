import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin用クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 企業に紐づくユーザー一覧を取得
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { data, error } = await supabaseAdmin
      .from('e_learning_corporate_users')
      .select('*')
      .eq('corporate_customer_id', id)
      .order('created_at', { ascending: true })

    if (error) {
      console.error('Failed to fetch corporate users:', error)
      return NextResponse.json(
        { error: 'Failed to fetch corporate users' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching corporate users:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 企業にユーザー（メールアドレス）を追加
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { email } = body

    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    // メールアドレスの簡易バリデーション
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('e_learning_corporate_users')
      .insert({
        corporate_customer_id: id,
        email: email.toLowerCase().trim(),
      })
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'このメールアドレスは既に登録されています' },
          { status: 409 }
        )
      }
      console.error('Failed to add corporate user:', error)
      return NextResponse.json(
        { error: 'Failed to add corporate user' },
        { status: 500 }
      )
    }

    // 既存のe_learning_usersにこのメールアドレスのユーザーがいれば、has_paid_accessをtrueに更新
    await supabaseAdmin
      .from('e_learning_users')
      .update({ has_paid_access: true })
      .eq('email', email.toLowerCase().trim())

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error adding corporate user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 企業からユーザー（メールアドレス）を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'email is required' },
        { status: 400 }
      )
    }

    const { error } = await supabaseAdmin
      .from('e_learning_corporate_users')
      .delete()
      .eq('corporate_customer_id', id)
      .eq('email', email.toLowerCase().trim())

    if (error) {
      console.error('Failed to delete corporate user:', error)
      return NextResponse.json(
        { error: 'Failed to delete corporate user' },
        { status: 500 }
      )
    }

    // 他の企業にも登録されていないか確認
    const { data: otherCorps } = await supabaseAdmin
      .from('e_learning_corporate_users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1)

    // 他の企業にも登録されていなければ、has_paid_accessをfalseに戻す（購入履歴がない場合のみ）
    if (!otherCorps || otherCorps.length === 0) {
      const { data: user } = await supabaseAdmin
        .from('e_learning_users')
        .select('id, purchases:e_learning_purchases(id)')
        .eq('email', email.toLowerCase().trim())
        .single()

      if (user && (!user.purchases || user.purchases.length === 0)) {
        await supabaseAdmin
          .from('e_learning_users')
          .update({ has_paid_access: false })
          .eq('email', email.toLowerCase().trim())
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting corporate user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
