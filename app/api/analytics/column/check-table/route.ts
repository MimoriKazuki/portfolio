import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/check-table
 * content_goalsテーブルの存在確認と作成
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // テーブルの存在確認
    const { data: existingData, error: checkError } = await supabase
      .from('content_goals')
      .select('id')
      .limit(1)

    // テーブルが存在しない場合のエラー
    if (checkError && checkError.code === '42P01') {
      return NextResponse.json({
        exists: false,
        message: 'content_goals table does not exist. Please run the migration.',
        migrationPath: '/supabase/migrations/20250829_create_content_goals_table.sql'
      })
    }

    return NextResponse.json({
      exists: true,
      message: 'content_goals table exists',
      rowCount: existingData?.length || 0
    })

  } catch (error: any) {
    console.error('Error checking table:', error)
    return NextResponse.json(
      { 
        error: 'Failed to check table',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}