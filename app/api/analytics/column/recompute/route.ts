import { NextRequest, NextResponse } from 'next/server'
import { computeColumnGoals } from '@/app/services/computeColumnGoals'
import { createClient } from '@/app/lib/supabase/server'

/**
 * POST /api/analytics/column/recompute
 * コラム目標値を再計算
 */
export async function POST(request: NextRequest) {
  try {
    // 認証確認
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // リクエストボディから設定を取得
    const body = await request.json().catch(() => ({}))
    
    const {
      days = 90,
      filterRegex = '^/columns/[^/]+/?$',
      excludeBotTraffic = true,
      outlierFilter = true,
    } = body

    console.log('Starting column goals recomputation with params:', {
      days,
      filterRegex,
      excludeBotTraffic,
      outlierFilter
    })

    // 目標値を計算
    const result = await computeColumnGoals({
      days,
      filterRegex,
      excludeBotTraffic,
      outlierFilter,
    })

    return NextResponse.json({
      success: true,
      data: result,
      message: 'Column goals recomputed successfully'
    })

  } catch (error: any) {
    console.error('Error recomputing column goals:', error)
    console.error('Error stack:', error?.stack)
    
    // エラーメッセージを含めて返す
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    const errorDetails = {
      message: errorMessage,
      code: error?.code,
      details: error?.details,
      stack: process.env.NODE_ENV === 'development' ? error?.stack : undefined
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to recompute column goals',
        message: errorMessage,
        details: errorDetails
      },
      { status: 500 }
    )
  }
}