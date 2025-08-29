import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/test-insert
 * データベース挿入テスト
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

    // シンプルなテストデータ
    const testData = {
      scope: 'test_' + Date.now(),
      base_goal: 100,
      stretch_goal: 200,
      mean: 150,
      median: 100,
      p90: 200,
      max: 300,
      sample_count: 10,
      range_days: 90,
      filter_regex: '^/column/[^/]+/?$',
      exclude_bot_traffic: false,
      outlier_filter: true,
      computed_at: new Date().toISOString(),
    }

    console.log('Attempting test insert:', testData)

    // 挿入を試みる
    const { data: insertedData, error: insertError } = await supabase
      .from('content_goals')
      .insert(testData)
      .select()

    if (insertError) {
      console.error('Insert error:', insertError)
      
      // RLSエラーの可能性をチェック
      if (insertError.code === '42501') {
        return NextResponse.json({
          error: 'RLS Policy Error',
          message: 'Row Level Security policy is blocking the insert',
          userEmail: user.email,
          details: insertError
        }, { status: 403 })
      }
      
      return NextResponse.json({
        error: 'Insert failed',
        message: insertError.message,
        code: insertError.code,
        details: insertError.details,
        hint: insertError.hint
      }, { status: 500 })
    }

    // 挿入成功したデータを削除（テストなので）
    if (insertedData && insertedData[0]) {
      await supabase
        .from('content_goals')
        .delete()
        .eq('id', insertedData[0].id)
    }

    return NextResponse.json({
      success: true,
      message: 'Test insert successful',
      userEmail: user.email,
      insertedData
    })

  } catch (error: any) {
    console.error('Test insert error:', error)
    
    return NextResponse.json(
      { 
        error: 'Test insert failed',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}