import { NextRequest, NextResponse } from 'next/server'
import { fetchColumnViewsGA4 } from '@/app/lib/ga4-column-analytics'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/test-compute
 * 計算処理のテスト（DB保存なし）
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

    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
    const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
    
    // 環境変数チェック
    if (!propertyId) {
      return NextResponse.json({
        error: 'GOOGLE_ANALYTICS_PROPERTY_ID not configured',
        hasPropertyId: false,
        hasCredentials: !!credentials
      }, { status: 500 })
    }
    
    if (!credentials) {
      return NextResponse.json({
        error: 'GOOGLE_ANALYTICS_CREDENTIALS not configured',
        hasPropertyId: !!propertyId,
        hasCredentials: false
      }, { status: 500 })
    }

    // GA4からデータ取得を試みる
    console.log('Testing GA4 data fetch...')
    
    try {
      const pageViews = await fetchColumnViewsGA4({
        propertyId,
        days: 90,
        filterRegex: '^/column/[^/]+/?$',
        excludeBotTraffic: false,
      })
      
      return NextResponse.json({
        success: true,
        message: 'GA4 data fetch successful',
        pageViewsCount: pageViews.length,
        sampleData: pageViews.slice(0, 5),
        totalViews: pageViews.reduce((sum, pv) => sum + pv.views, 0)
      })
      
    } catch (ga4Error: any) {
      console.error('GA4 fetch error:', ga4Error)
      
      return NextResponse.json({
        error: 'GA4 data fetch failed',
        message: ga4Error?.message || 'Unknown GA4 error',
        code: ga4Error?.code,
        details: ga4Error?.details,
        hasPropertyId: true,
        hasCredentials: true
      }, { status: 500 })
    }

  } catch (error: any) {
    console.error('Test compute error:', error)
    
    return NextResponse.json(
      { 
        error: 'Test compute failed',
        message: error?.message || 'Unknown error',
        details: error?.details
      },
      { status: 500 }
    )
  }
}