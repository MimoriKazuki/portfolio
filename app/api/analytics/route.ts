import { NextRequest, NextResponse } from 'next/server'
import {
  initializeAnalyticsClient,
  getAnalyticsData,
  getRealtimeData,
  getTrafficSources,
  getDeviceData,
  getTopPages,
  getLocationData,
} from '@/app/lib/google-analytics'

export async function GET(request: NextRequest) {
  try {
    // 環境変数から認証情報を取得
    const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID

    if (!credentials || !propertyId) {
      return NextResponse.json(
        { error: 'Missing Google Analytics configuration' },
        { status: 500 }
      )
    }

    // 認証情報をパース
    const parsedCredentials = JSON.parse(credentials)
    const analyticsClient = initializeAnalyticsClient(parsedCredentials)

    // クエリパラメータから期間を取得
    const searchParams = request.nextUrl.searchParams
    const startDate = searchParams.get('startDate') || '30daysAgo'
    const endDate = searchParams.get('endDate') || 'today'
    const dataType = searchParams.get('type') || 'overview'

    let data

    switch (dataType) {
      case 'realtime':
        data = await getRealtimeData(analyticsClient, propertyId)
        break
      case 'traffic':
        data = await getTrafficSources(analyticsClient, propertyId, startDate, endDate)
        break
      case 'devices':
        data = await getDeviceData(analyticsClient, propertyId, startDate, endDate)
        break
      case 'pages':
        data = await getTopPages(analyticsClient, propertyId, startDate, endDate)
        break
      case 'locations':
        data = await getLocationData(analyticsClient, propertyId, startDate, endDate)
        break
      case 'overview':
      default:
        data = await getAnalyticsData(analyticsClient, propertyId, startDate, endDate)
        break
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    )
  }
}