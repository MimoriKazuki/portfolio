import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { initializeAnalyticsClient } from './google-analytics'

export interface PageViewData {
  pagePath: string
  views: number
  avgEngagementTime?: number // 平均エンゲージメント時間（秒）
}

/**
 * GA4からコラム記事のビューデータを取得
 */
export async function fetchColumnViewsGA4({
  propertyId,
  days = 90,
  filterRegex = '^/column/[^/]+/?$', // columnsからcolumnに変更
  excludeBotTraffic = false, // デフォルトをfalseに変更
}: {
  propertyId: string
  days?: number
  filterRegex?: string
  excludeBotTraffic?: boolean
}): Promise<PageViewData[]> {
  // 環境変数から認証情報を取得
  const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
  if (!credentials) {
    throw new Error('GOOGLE_ANALYTICS_CREDENTIALS not found')
  }

  const parsedCredentials = JSON.parse(credentials)
  const client = initializeAnalyticsClient(parsedCredentials)
  
  try {
    // 基本的なディメンションとメトリクス
    const dimensions = [{ name: 'pagePath' }]
    const metrics = [
      { name: 'screenPageViews' },
      { name: 'userEngagementDuration' } // ユーザーエンゲージメント時間
    ]
    
    // ボットトラフィックを除外するフィルタ（デバイスカテゴリベース）
    const dimensionFilter = excludeBotTraffic ? {
      filter: {
        fieldName: 'deviceCategory',
        inListFilter: {
          values: ['desktop', 'mobile', 'tablet']
        }
      }
    } : undefined

    // レポートリクエスト
    const request = {
      property: `properties/${propertyId}`,
      dateRanges: [{ 
        startDate: `${days}daysAgo`, 
        endDate: 'yesterday' 
      }],
      dimensions,
      metrics,
      ...(dimensionFilter && { dimensionFilter }),
      limit: 100000,
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true
        }
      ]
    }

    const [response] = await client.runReport(request)
    const rows = response.rows ?? []
    
    console.log(`GA4 returned ${rows.length} rows`)
    
    // 正規表現フィルタの適用
    const regex = new RegExp(filterRegex)
    const pageViews: PageViewData[] = []
    
    // デバッグ用に最初の10件のパスを出力
    const samplePaths = rows.slice(0, 10).map(row => row.dimensionValues?.[0]?.value ?? '')
    console.log('Sample paths from GA4:', samplePaths)
    
    for (const row of rows) {
      const pagePath = row.dimensionValues?.[0]?.value ?? ''
      const views = Number(row.metricValues?.[0]?.value ?? 0)
      const engagementDuration = Number(row.metricValues?.[1]?.value ?? 0)
      
      if (regex.test(pagePath) && views > 0) {
        // 平均エンゲージメント時間を計算（総時間÷ビュー数）
        const avgEngagementTime = views > 0 ? Math.round(engagementDuration / views) : 0
        pageViews.push({ pagePath, views, avgEngagementTime })
        console.log(`Matched: ${pagePath} (${views} views, ${avgEngagementTime}s avg engagement)`)
      }
    }
    
    return pageViews
  } catch (error: any) {
    console.error('Error fetching column views from GA4:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      stack: error?.stack
    })
    
    // リトライ可能なエラーの場合
    if (error?.code === 429 || error?.code === 503) {
      // 簡単なリトライロジック（本番環境では exponential backoff を推奨）
      await new Promise(resolve => setTimeout(resolve, 5000))
      return fetchColumnViewsGA4({ propertyId, days, filterRegex, excludeBotTraffic })
    }
    
    // エラーメッセージを詳しく
    const errorMessage = error?.message || 'Unknown error in GA4 API'
    throw new Error(`GA4 API Error: ${errorMessage}`)
  }
}

/**
 * ページネーションを考慮した大量データの取得
 */
export async function fetchColumnViewsWithPagination({
  propertyId,
  days = 90,
  filterRegex = '^/columns/[^/]+/?$',
  excludeBotTraffic = true,
  pageSize = 10000,
}: {
  propertyId: string
  days?: number
  filterRegex?: string
  excludeBotTraffic?: boolean
  pageSize?: number
}): Promise<PageViewData[]> {
  const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
  if (!credentials) {
    throw new Error('GOOGLE_ANALYTICS_CREDENTIALS not found')
  }

  const parsedCredentials = JSON.parse(credentials)
  const client = initializeAnalyticsClient(parsedCredentials)
  
  const allPageViews: PageViewData[] = []
  let offset = 0
  let hasMore = true
  const regex = new RegExp(filterRegex)
  
  while (hasMore) {
    try {
      const [response] = await client.runReport({
        property: `properties/${propertyId}`,
        dateRanges: [{ 
          startDate: `${days}daysAgo`, 
          endDate: 'yesterday' 
        }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        limit: pageSize,
        offset,
        orderBys: [
          {
            metric: { metricName: 'screenPageViews' },
            desc: true
          }
        ]
      })
      
      const rows = response.rows ?? []
      
      if (rows.length === 0) {
        hasMore = false
        break
      }
      
      for (const row of rows) {
        const pagePath = row.dimensionValues?.[0]?.value ?? ''
        const views = Number(row.metricValues?.[0]?.value ?? 0)
        
        if (regex.test(pagePath) && views > 0) {
          allPageViews.push({ pagePath, views })
        }
      }
      
      offset += pageSize
      hasMore = rows.length === pageSize
      
    } catch (error) {
      console.error(`Error fetching page ${offset / pageSize}:`, error)
      
      if (error?.code === 429) {
        await new Promise(resolve => setTimeout(resolve, 5000))
        continue
      }
      
      throw error
    }
  }
  
  return allPageViews
}