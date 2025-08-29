import { NextRequest, NextResponse } from 'next/server'
import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { initializeAnalyticsClient } from '@/app/lib/google-analytics'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/all-paths
 * 全ページパスを取得してコラムページを特定
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
    
    if (!credentials || !propertyId) {
      throw new Error('GA4 configuration missing')
    }

    const parsedCredentials = JSON.parse(credentials)
    const client = initializeAnalyticsClient(parsedCredentials)
    
    // 全ページのビューを取得（制限なし）
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ 
        startDate: '90daysAgo', 
        endDate: 'yesterday' 
      }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 1000, // より多くのページを取得
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true
        }
      ]
    })
    
    const allPages = response.rows?.map(row => ({
      path: row.dimensionValues?.[0]?.value || '',
      views: Number(row.metricValues?.[0]?.value || 0)
    })) || []
    
    // パスパターンごとに分類
    const patterns = {
      columnsWithId: allPages.filter(p => p.path.match(/^\/columns\/[^\/]+\/?$/)),
      columnsIndex: allPages.filter(p => p.path === '/columns' || p.path === '/columns/'),
      columnWithId: allPages.filter(p => p.path.match(/^\/column\/[^\/]+\/?$/)),
      columnIndex: allPages.filter(p => p.path === '/column' || p.path === '/column/'),
      other: allPages.filter(p => 
        !p.path.match(/^\/columns?\//) && 
        p.path !== '/' &&
        p.views > 10 // 10ビュー以上のページのみ
      ).slice(0, 20)
    }

    return NextResponse.json({
      success: true,
      totalPages: allPages.length,
      patterns: {
        'コラム詳細 (/columns/[id])': patterns.columnsWithId.length,
        'コラム一覧 (/columns)': patterns.columnsIndex.length,
        'コラム詳細 (/column/[id])': patterns.columnWithId.length,
        'コラム一覧 (/column)': patterns.columnIndex.length,
      },
      sampleData: {
        columnsWithId: patterns.columnsWithId.slice(0, 5),
        columnsIndex: patterns.columnsIndex,
        columnWithId: patterns.columnWithId.slice(0, 5),
        columnIndex: patterns.columnIndex,
        otherPages: patterns.other
      }
    })

  } catch (error: any) {
    console.error('All paths endpoint error:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch all paths',
        message: error?.message || 'Unknown error',
        details: error?.details
      },
      { status: 500 }
    )
  }
}