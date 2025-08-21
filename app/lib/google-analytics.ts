import { BetaAnalyticsDataClient } from '@google-analytics/data'

// Google Analytics認証情報の型定義
interface GoogleCredentials {
  type: string
  project_id: string
  private_key_id: string
  private_key: string
  client_email: string
  client_id: string
  auth_uri: string
  token_uri: string
  auth_provider_x509_cert_url: string
  client_x509_cert_url: string
}

// Google Analytics Data APIクライアントの初期化
export function initializeAnalyticsClient(credentials: GoogleCredentials) {
  return new BetaAnalyticsDataClient({
    credentials: credentials,
  })
}

// 基本的なレポートデータを取得
export async function getAnalyticsData(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
) {
  try {
    // ユーザー数、セッション数、ページビューなどの基本メトリクス
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'date' }],
      metrics: [
        { name: 'activeUsers' },
        { name: 'sessions' },
        { name: 'screenPageViews' },
        { name: 'bounceRate' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ dimension: { dimensionName: 'date' } }],
    })

    return response
  } catch (error) {
    console.error('Error fetching analytics data:', error)
    throw error
  }
}

// リアルタイムデータを取得
export async function getRealtimeData(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string
) {
  try {
    const [response] = await analyticsDataClient.runRealtimeReport({
      property: `properties/${propertyId}`,
      metrics: [{ name: 'activeUsers' }],
    })

    return response
  } catch (error) {
    console.error('Error fetching realtime data:', error)
    throw error
  }
}

// トラフィックソースを取得
export async function getTrafficSources(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'sessionDefaultChannelGroup' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
    })

    return response
  } catch (error) {
    console.error('Error fetching traffic sources:', error)
    throw error
  }
}

// デバイス別データを取得
export async function getDeviceData(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'deviceCategory' }],
      metrics: [{ name: 'sessions' }],
    })

    return response
  } catch (error) {
    console.error('Error fetching device data:', error)
    throw error
  }
}

// 人気ページを取得
export async function getTopPages(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today',
  limit: number = 10
) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [
        { name: 'pagePath' },
        { name: 'pageTitle' },
      ],
      metrics: [
        { name: 'screenPageViews' },
        { name: 'averageSessionDuration' },
      ],
      orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
      limit,
    })

    return response
  } catch (error) {
    console.error('Error fetching top pages:', error)
    throw error
  }
}

// 地域別データを取得
export async function getLocationData(
  analyticsDataClient: BetaAnalyticsDataClient,
  propertyId: string,
  startDate: string = '30daysAgo',
  endDate: string = 'today'
) {
  try {
    const [response] = await analyticsDataClient.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [{ startDate, endDate }],
      dimensions: [{ name: 'country' }],
      metrics: [{ name: 'sessions' }],
      orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
      limit: 10,
    })

    return response
  } catch (error) {
    console.error('Error fetching location data:', error)
    throw error
  }
}