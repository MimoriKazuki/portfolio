import { NextRequest, NextResponse } from 'next/server'
import { testGA4Connection } from '@/app/lib/ga4-test'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/test
 * GA4接続テスト
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

    // GA4テスト実行
    const result = await testGA4Connection()

    // コラムページを探す
    const columnPages = result.rows?.filter(row => {
      const path = row.dimensionValues?.[0]?.value || ''
      return path.includes('/columns/') || path.includes('/column/')
    }) || []

    return NextResponse.json({
      success: true,
      message: 'GA4 connection test completed',
      rowCount: result.rows?.length || 0,
      columnPagesCount: columnPages.length,
      topPages: result.rows?.map(row => ({
        path: row.dimensionValues?.[0]?.value || 'Unknown',
        views: row.metricValues?.[0]?.value || '0'
      })),
      columnPages: columnPages.map(row => ({
        path: row.dimensionValues?.[0]?.value || 'Unknown',
        views: row.metricValues?.[0]?.value || '0'
      }))
    })

  } catch (error: any) {
    console.error('Test endpoint error:', error)
    
    return NextResponse.json(
      { 
        error: 'GA4 test failed',
        message: error?.message || 'Unknown error',
        details: error?.details
      },
      { status: 500 }
    )
  }
}