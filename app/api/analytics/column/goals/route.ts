import { NextRequest, NextResponse } from 'next/server'
import { getLatestColumnGoals } from '@/app/services/computeColumnGoals'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/goals
 * 最新のコラム目標値を取得
 */
export async function GET(request: NextRequest) {
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

    // 管理者権限の確認（必要に応じて）
    // if (!user.email?.endsWith('@landbridge.ai')) {
    //   return NextResponse.json(
    //     { error: 'Forbidden' },
    //     { status: 403 }
    //   )
    // }

    // 最新の目標値を取得
    const goals = await getLatestColumnGoals()

    if (!goals) {
      return NextResponse.json(
        { error: 'No goals found. Please run computation first.' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: goals
    })

  } catch (error) {
    console.error('Error fetching column goals:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}