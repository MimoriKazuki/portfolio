import { BetaAnalyticsDataClient } from '@google-analytics/data'
import { initializeAnalyticsClient } from './google-analytics'

/**
 * GA4接続テスト - 全ページのPVを取得
 */
export async function testGA4Connection() {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
  
  if (!credentials || !propertyId) {
    throw new Error('GA4 configuration missing')
  }

  const parsedCredentials = JSON.parse(credentials)
  const client = initializeAnalyticsClient(parsedCredentials)
  
  try {
    // シンプルなリクエスト - 全ページのPV
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ 
        startDate: '90daysAgo', 
        endDate: 'yesterday' 
      }],
      dimensions: [{ name: 'pagePath' }],
      metrics: [{ name: 'screenPageViews' }],
      limit: 50,
      orderBys: [
        {
          metric: { metricName: 'screenPageViews' },
          desc: true
        }
      ]
    })
    
    console.log('GA4 Test Results:')
    console.log('Row Count:', response.rows?.length || 0)
    
    if (response.rows) {
      console.log('Top 10 pages:')
      response.rows.forEach((row, index) => {
        const path = row.dimensionValues?.[0]?.value || 'Unknown'
        const views = row.metricValues?.[0]?.value || '0'
        console.log(`${index + 1}. ${path}: ${views} views`)
      })
    }
    
    return response
  } catch (error: any) {
    console.error('GA4 Test Error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details
    })
    throw error
  }
}