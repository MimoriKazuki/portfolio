import { NextRequest, NextResponse } from 'next/server'
import { unstable_cache } from 'next/cache'
import {
  initializeAnalyticsClient,
  getAnalyticsData,
  getRealtimeData,
  getTrafficSources,
  getDeviceData,
  getTopPages,
  getLocationData,
  getUserAcquisitionData,
  getHourlyData,
  getBrowserData,
  getTopPagesWithEngagement,
} from '@/app/lib/google-analytics'

export async function GET(request: NextRequest) {
  // 環境変数から認証情報を取得
  const credentials = process.env.GOOGLE_ANALYTICS_CREDENTIALS
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  
  try {
    console.log('Analytics API called with:', {
      type: request.nextUrl.searchParams.get('type'),
      startDate: request.nextUrl.searchParams.get('startDate'),
      endDate: request.nextUrl.searchParams.get('endDate'),
      hasCredentials: !!credentials,
      hasPropertyId: !!propertyId
    })

    if (!credentials || !propertyId) {
      console.error('Missing credentials or propertyId')
      return NextResponse.json(
        { error: 'Missing Google Analytics configuration' },
        { status: 500 }
      )
    }

    // 認証情報をパース
    let parsedCredentials
    try {
      parsedCredentials = JSON.parse(credentials)
    } catch (parseError) {
      console.error('Failed to parse credentials:', parseError)
      return NextResponse.json(
        { error: 'Invalid credentials format', details: parseError.message },
        { status: 500 }
      )
    }

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
      case 'user-acquisition':
        data = await getUserAcquisitionData(analyticsClient, propertyId, startDate, endDate)
        break
      case 'hourly':
        data = await getHourlyData(analyticsClient, propertyId, startDate, endDate)
        break
      case 'browsers':
        data = await getBrowserData(analyticsClient, propertyId, startDate, endDate)
        break
      case 'pages-engagement':
        data = await getTopPagesWithEngagement(analyticsClient, propertyId, startDate, endDate)
        break
      case 'overview':
      default:
        data = await getAnalyticsData(analyticsClient, propertyId, startDate, endDate)
        break
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error('Analytics API error:', error)
    console.error('Full error:', JSON.stringify(error, Object.getOwnPropertyNames(error), 2))
    
    // より詳細なエラー情報を返す
    let errorMessage = 'Failed to fetch analytics data'
    let errorDetails = 'Unknown error'
    
    if (error instanceof Error) {
      errorDetails = error.message
      
      // Google Analytics特有のエラーをチェック
      if (error.message.includes('Request had insufficient authentication scopes')) {
        errorMessage = 'Google Analytics APIの権限が不足しています'
        errorDetails = 'サービスアカウントにGoogle Analytics Data APIの権限を付与してください'
      } else if (error.message.includes('The caller does not have permission')) {
        errorMessage = 'Google Analytics プロパティへのアクセス権限がありません'
        errorDetails = `プロパティID: ${propertyId} へのアクセス権限を確認してください`
      } else if (error.message.includes('Property')) {
        errorMessage = 'Google Analytics プロパティが見つかりません'
        errorDetails = `プロパティID: ${propertyId} が正しいか確認してください`
      }
    }
    
    return NextResponse.json(
      { 
        error: errorMessage,
        details: errorDetails,
        propertyId: process.env.GOOGLE_ANALYTICS_PROPERTY_ID
      },
      { status: 500 }
    )
  }
}