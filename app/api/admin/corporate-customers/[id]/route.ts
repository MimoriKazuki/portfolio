import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Admin用クライアント
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

// 契約企業を更新
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
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
      .update({
        company_name,
        contact_person: contact_person || null,
        contact_email: contact_email || null,
        contact_phone: contact_phone || null,
        contract_status: contract_status || 'active',
        contract_start_date: contract_start_date || null,
        contract_end_date: contract_end_date || null,
        notes: notes || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Failed to update corporate customer:', error)
      return NextResponse.json(
        { error: 'Failed to update corporate customer' },
        { status: 500 }
      )
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error updating corporate customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 契約企業を削除
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const { error } = await supabaseAdmin
      .from('e_learning_corporate_customers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Failed to delete corporate customer:', error)
      return NextResponse.json(
        { error: 'Failed to delete corporate customer' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting corporate customer:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
