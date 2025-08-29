import { NextRequest, NextResponse } from 'next/server'
import { fetchColumnViewsGA4 } from '@/app/lib/ga4-column-analytics'
import { createClient } from '@/app/lib/supabase/server'

/**
 * GET /api/analytics/column/distribution
 * コラムビューの分布データを取得
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
    if (!propertyId) {
      throw new Error('GOOGLE_ANALYTICS_PROPERTY_ID not configured')
    }

    // パラメータを取得
    const searchParams = request.nextUrl.searchParams
    const days = parseInt(searchParams.get('days') || '90')
    const filterRegex = searchParams.get('filterRegex') || '^/column/[^/]+/?$'

    // GA4からデータを取得
    const pageViews = await fetchColumnViewsGA4({
      propertyId,
      days,
      filterRegex,
      excludeBotTraffic: false,
    })

    // 全コラム数を取得（ビューが0の記事を含む）
    let columnsWithZeroViews = 0
    const { data: allColumns } = await supabase
      .from('columns')
      .select('id')
      .eq('is_published', true)
    
    if (allColumns) {
      const totalPublishedColumns = allColumns.length
      const columnsWithViews = pageViews.length
      columnsWithZeroViews = Math.max(0, totalPublishedColumns - columnsWithViews)
    }

    // 最大ビュー数を確認
    const maxViews = Math.max(...pageViews.map(pv => pv.views), 0)
    
    // ビュー分布のヒストグラムを作成
    let bins
    if (maxViews <= 50) {
      // 50以下の場合は0を単独で表示し、その後10単位で表示
      bins = [
        { range: '0', min: 0, max: 0, count: columnsWithZeroViews },
        { range: '1-10', min: 1, max: 10, count: 0 },
        { range: '11-20', min: 11, max: 20, count: 0 },
        { range: '21-30', min: 21, max: 30, count: 0 },
        { range: '31-40', min: 31, max: 40, count: 0 },
        { range: '41-50', min: 41, max: 50, count: 0 },
      ]
    } else {
      // 51以上の場合は0を単独で表示し、その後通常のビン
      bins = [
        { range: '0', min: 0, max: 0, count: columnsWithZeroViews },
        { range: '1-50', min: 1, max: 50, count: 0 },
        { range: '51-100', min: 51, max: 100, count: 0 },
        { range: '101-200', min: 101, max: 200, count: 0 },
        { range: '201-500', min: 201, max: 500, count: 0 },
        { range: '501-1000', min: 501, max: 1000, count: 0 },
        { range: '1000+', min: 1001, max: Infinity, count: 0 },
      ]
    }

    // 各ビンにカウント（0は既にカウント済みなのでスキップ）
    pageViews.forEach(pv => {
      const views = pv.views
      if (views > 0) {
        const bin = bins.find(b => views >= b.min && views <= b.max)
        if (bin) {
          bin.count++
        }
      }
    })

    // 上位10件のページビューデータを取得
    const topPages = pageViews
      .sort((a, b) => b.views - a.views)
      .slice(0, 10)
    
    // デバッグ: トップページのパスを確認
    // console.log('Top GA4 pages:', topPages.map(p => ({ path: p.pagePath, views: p.views })))

    return NextResponse.json({
      success: true,
      data: {
        pageViews,
        distribution: bins.map(({ range, count }) => ({ range, count })),
        total: pageViews.length,
        topPages,
        totalPublishedColumns: allColumns?.length || 0,
        columnsWithZeroViews,
      }
    })

  } catch (error: any) {
    console.error('Error fetching distribution:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch distribution',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}