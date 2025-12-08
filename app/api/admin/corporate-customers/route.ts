import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin用クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 契約企業一覧を取得
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('e_learning_corporate_customers')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Failed to fetch corporate customers:', error)
      return NextResponse.json(
        { error: 'Failed to fetch corporate customers' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching corporate customers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 契約企業を追加
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      company_name,
      contact_person,
      contact_email,
      contact_phone,
      contract_status,
      contract_start_date,
      contract_end_date,
      notes,
    } = body

    if (!company_name) {
      return NextResponse.json(
        { error: 'company_name is required' },
        { status: 400 }
      )
    }

    const { data, error } = await supabaseAdmin
      .from('e_learning_corporate_customers')
      .insert({
        company_name,
        contact_person: contact_person || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        contract_status: contract_status || 'active',
        contract_start_date: contract_start_date || null,
        contract_end_date: contract_end_date || null,
        notes: notes || null,
      })
      .select()
      .single()

    if (error) {
      console.error('Failed to create corporate customer:', error)
      return NextResponse.json(
        { error: 'Failed to create corporate customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error('Error creating corporate customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
