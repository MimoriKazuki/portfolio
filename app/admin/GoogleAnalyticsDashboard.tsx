'use client'

import { useState, useEffect } from 'react'
import { 
  Users, 
  Eye, 
  Clock, 
  TrendingUp, 
  Monitor, 
  Smartphone, 
  Tablet,
  Globe,
  BarChart3,
  Activity,
  AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import UserActivityTrend from './UserActivityTrend'
import AnalyticsButtons from './components/AnalyticsButtons'

// データの型定義
interface AnalyticsData {
  overview: {
    users: number
    newUsers: number
    sessions: number
    bounceRate: number
    pageViews: number
    avgSessionDuration: string
    engagementRate: number
    engagedSessions: number
  }
  realTimeUsers: number
  last30Days: Array<{
    date: string
    originalDate?: string
    pageViews: number
    users: number
    sessions: number
  }>
  trafficSources: Array<{
    source: string
    value: number
    color: string
  }>
  devices: Array<{
    type: string
    value: number
    icon: any
  }>
  topPages: Array<{
    page: string
    title: string
    views: number
    avgTime: string
    engagementTime: string
    bounceRate: number
  }>
  locations: Array<{
    country: string
    sessions: number
    percentage: number
  }>
  userAcquisition: Array<{
    type: string
    users: number
    sessions: number
    percentage: number
  }>
  hourlyData: Array<{
    hour: string
    users: number
    sessions: number
  }>
  browsers: Array<{
    browser: string
    sessions: number
    percentage: number
  }>
  userActivity?: {
    dailyActivity: Array<{
      date: string
      originalDate: string
      activeUsers: number
      newUsers: number
      sessions: number
    }>
    userGrowth: {
      activeUsers: {
        value: number
        change: number
        changePercent: string
      }
      newUsers: {
        value: number
        change: number
        changePercent: string
      }
    }
  }
}

export default function GoogleAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30daysAgo')
  const [realTimeUsers, setRealTimeUsers] = useState(0)
  const [hoveredPoint, setHoveredPoint] = useState<{ value: number; date: string; index: number } | null>(null)

  // データ取得関数
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)
      
      // 最小ローディング時間を設定（UXの一貫性のため）
      const startTime = Date.now()
      const minLoadingTime = 1000 // 1秒

      console.log('Fetching analytics data...')

      // 各APIエンドポイントを個別に呼び出してエラーをチェック
      const fetchWithErrorHandling = async (url: string) => {
        const response = await fetch(url)
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(`API Error: ${errorData.error || response.statusText}`)
        }
        return response.json()
      }

      // 各種データを並行して取得（デフォルトは過去30日間）
      const [overview, realtime, traffic, devices, pages, locations, userAcquisition, hourly, browsers, userActivity] = await Promise.all([
        fetchWithErrorHandling(`/api/analytics?type=overview&startDate=${timeRange}`),
        fetchWithErrorHandling('/api/analytics?type=realtime'),
        fetchWithErrorHandling(`/api/analytics?type=traffic&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics?type=devices&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics?type=pages-engagement&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics?type=locations&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics?type=user-acquisition&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics?type=hourly&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics?type=browsers&startDate=${timeRange}`),
        fetchWithErrorHandling(`/api/analytics/user-activity?timeRange=${timeRange}`)
      ])

      // データを整形
      const processedData = processAnalyticsResponse(
        overview,
        realtime,
        traffic,
        devices,
        pages,
        locations,
        userAcquisition,
        hourly,
        browsers,
        userActivity,
        timeRange
      )

      setData(processedData)
      setRealTimeUsers(processedData.realTimeUsers)
      console.log('Analytics data loaded successfully', processedData)
      
      // 最小ローディング時間を確保
      const elapsedTime = Date.now() - startTime
      if (elapsedTime < minLoadingTime) {
        await new Promise(resolve => setTimeout(resolve, minLoadingTime - elapsedTime))
      }
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      const errorMessage = err instanceof Error ? err.message : 'アナリティクスデータの取得に失敗しました'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  // レスポンスデータを整形
  const processAnalyticsResponse = (
    overview: any,
    realtime: any,
    traffic: any,
    devices: any,
    pages: any,
    locations: any,
    userAcquisition: any,
    hourly: any,
    browsers: any,
    userActivity: any,
    timeRange: string
  ): AnalyticsData => {
    console.log('Processing analytics response:', { overview, realtime, traffic, devices, pages, locations, userAcquisition, hourly, browsers })
    // 基本メトリクスの集計
    const overviewMetrics = {
      users: 0,
      newUsers: 0,
      sessions: 0,
      bounceRate: 0,
      pageViews: 0,
      avgSessionDuration: '0:00',
      engagementRate: 0,
      engagedSessions: 0
    }

    // overview.totalsから総計データを取得（新しい形式）
    if (overview.totals && overview.totals.rows && overview.totals.rows.length > 0) {
      const totalsRow = overview.totals.rows[0]
      // メトリクスの順序: activeUsers, newUsers, sessions, screenPageViews, bounceRate, averageSessionDuration, engagementRate, engagedSessions
      overviewMetrics.users = parseInt(totalsRow.metricValues[0]?.value || 0)
      overviewMetrics.newUsers = parseInt(totalsRow.metricValues[1]?.value || 0)
      overviewMetrics.sessions = parseInt(totalsRow.metricValues[2]?.value || 0)
      overviewMetrics.pageViews = parseInt(totalsRow.metricValues[3]?.value || 0)
      overviewMetrics.bounceRate = parseFloat(totalsRow.metricValues[4]?.value || 0) * 100 // パーセンテージに変換
      
      const avgDuration = parseFloat(totalsRow.metricValues[5]?.value || 0)
      const minutes = Math.floor(avgDuration / 60)
      const seconds = Math.floor(avgDuration % 60)
      overviewMetrics.avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`
      
      overviewMetrics.engagementRate = parseFloat(totalsRow.metricValues[6]?.value || 0) * 100 // パーセンテージに変換
      overviewMetrics.engagedSessions = parseInt(totalsRow.metricValues[7]?.value || 0)
    } else if (overview.rows && overview.rows.length > 0) {
      let totalBounceRate = 0
      let totalDuration = 0
      let bounceRateCount = 0
      
      overview.rows.forEach((row: any) => {
        overviewMetrics.users += parseInt(row.metricValues[0]?.value || 0)
        overviewMetrics.newUsers += parseInt(row.metricValues[1]?.value || 0)
        overviewMetrics.sessions += parseInt(row.metricValues[2]?.value || 0)
        overviewMetrics.pageViews += parseInt(row.metricValues[3]?.value || 0)
        
        const bounceRate = parseFloat(row.metricValues[4]?.value || 0)
        if (bounceRate > 0) {
          totalBounceRate += bounceRate
          bounceRateCount++
        }
        
        totalDuration += parseFloat(row.metricValues[5]?.value || 0)
        
        overviewMetrics.engagementRate += parseFloat(row.metricValues[6]?.value || 0)
        overviewMetrics.engagedSessions += parseInt(row.metricValues[7]?.value || 0)
      })
      
      // 直帰率の平均
      overviewMetrics.bounceRate = bounceRateCount > 0 ? totalBounceRate / bounceRateCount : 0
      
      // 平均セッション時間の計算
      const avgDuration = overview.rows.length > 0 ? totalDuration / overview.rows.length : 0
      
      const minutes = Math.floor(avgDuration / 60)
      const seconds = Math.floor(avgDuration % 60)
      overviewMetrics.avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // 日別データ（新しい形式に対応）
    const dailyRows = overview.daily ? overview.daily.rows : overview.rows
    
    // APIから取得したデータをマップに変換
    const dataMap = new Map()
    dailyRows?.forEach((row: any) => {
      const dateValue = row.dimensionValues?.[0]?.value || ''
      if (dateValue) {
        dataMap.set(dateValue, {
          pageViews: parseInt(row.metricValues[3]?.value || 0),
          users: parseInt(row.metricValues[0]?.value || 0),
          sessions: parseInt(row.metricValues[2]?.value || 0)
        })
      }
    })

    // 期間に基づいて全日付を生成
    const days = timeRange === '7daysAgo' ? 7 : 
                timeRange === '30daysAgo' ? 30 : 90
    
    const dailyData = []
    const today = new Date()
    today.setHours(23, 59, 59, 999) // 今日の終わりに設定
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(today.getDate() - i)
      
      const year = date.getFullYear()
      const month = (date.getMonth() + 1).toString().padStart(2, '0')
      const day = date.getDate().toString().padStart(2, '0')
      const dateStr = `${year}${month}${day}`
      
      const data = dataMap.get(dateStr) || {
        pageViews: 0,
        users: 0,
        sessions: 0
      }
      
      dailyData.push({
        date: formatDate(dateStr),
        originalDate: dateStr,
        pageViews: data.pageViews,
        users: data.users,
        sessions: data.sessions
      })
    }

    // トラフィックソース
    const trafficData = traffic.rows?.map((row: any) => {
      const source = row.dimensionValues[0]?.value || 'Unknown'
      const sessions = parseInt(row.metricValues[0]?.value || 0)
      const totalSessions = traffic.rows.reduce((sum: number, r: any) => 
        sum + parseInt(r.metricValues[0]?.value || 0), 0
      )
      
      return {
        source: translateSource(source),
        value: Math.round((sessions / totalSessions) * 100),
        color: getSourceColor(source)
      }
    }) || []

    // デバイス別データ
    const deviceData = devices.rows?.map((row: any) => {
      const device = row.dimensionValues[0]?.value || 'Unknown'
      const sessions = parseInt(row.metricValues[0]?.value || 0)
      const totalSessions = devices.rows.reduce((sum: number, r: any) => 
        sum + parseInt(r.metricValues[0]?.value || 0), 0
      )
      
      return {
        type: translateDevice(device),
        value: Math.round((sessions / totalSessions) * 100),
        icon: getDeviceIcon(device)
      }
    }) || []

    // 人気ページ（エンゲージメント情報付き）
    const topPagesData = pages.rows?.map((row: any) => ({
      page: row.dimensionValues[0]?.value || '/',
      title: row.dimensionValues[1]?.value || 'ページ',
      views: parseInt(row.metricValues[0]?.value || 0),
      avgTime: formatDuration(parseFloat(row.metricValues[1]?.value || 0)),
      engagementTime: formatDuration(parseFloat(row.metricValues[2]?.value || 0)),
      bounceRate: parseFloat(row.metricValues[3]?.value || 0) * 100
    })) || []

    // 地域別データ
    const locationData = locations.rows?.map((row: any) => {
      const sessions = parseInt(row.metricValues[0]?.value || 0)
      const totalSessions = locations.rows.reduce((sum: number, r: any) => 
        sum + parseInt(r.metricValues[0]?.value || 0), 0
      )
      
      return {
        country: translateCountry(row.dimensionValues[0]?.value || 'Unknown'),
        sessions,
        percentage: Math.round((sessions / totalSessions) * 100 * 10) / 10
      }
    }) || []

    // ユーザー獲得データ（新規 vs リピーター）
    const userAcquisitionData = userAcquisition.rows?.reduce((acc: any[], row: any, index: number) => {
      const type = row.dimensionValues[0]?.value || 'unknown'
      const users = parseInt(row.metricValues[0]?.value || 0)
      const sessions = parseInt(row.metricValues[1]?.value || 0)
      const totalUsers = userAcquisition.rows.reduce((sum: number, r: any) => 
        sum + parseInt(r.metricValues[0]?.value || 0), 0
      )
      
      const translatedType = type === 'new' ? '新規ユーザー' : 'リピーター'
      
      // 重複を避けるため、既に存在するタイプはスキップ
      if (acc.find(item => item.type === translatedType)) {
        return acc
      }
      
      acc.push({
        type: translatedType,
        users,
        sessions,
        percentage: Math.round((users / totalUsers) * 100)
      })
      
      return acc
    }, []) || []

    // 時間帯別データ
    const hourlyDataProcessed = Array.from({ length: 24 }, (_, hour) => {
      const hourStr = hour.toString().padStart(2, '0')
      const hourData = hourly.rows?.find((row: any) => row.dimensionValues[0]?.value === hourStr)
      return {
        hour: hourStr,
        users: parseInt(hourData?.metricValues[0]?.value || 0),
        sessions: parseInt(hourData?.metricValues[1]?.value || 0)
      }
    })

    // ブラウザ別データ
    const browserData = browsers.rows?.map((row: any) => {
      const browser = row.dimensionValues[0]?.value || 'Unknown'
      const sessions = parseInt(row.metricValues[0]?.value || 0)
      const totalSessions = browsers.rows.reduce((sum: number, r: any) => 
        sum + parseInt(r.metricValues[0]?.value || 0), 0
      )
      
      return {
        browser,
        sessions,
        percentage: Math.round((sessions / totalSessions) * 100)
      }
    }) || []

    // リアルタイムユーザー
    const realtimeCount = realtime.rows?.[0]?.metricValues[0]?.value || 0

    const result = {
      overview: overviewMetrics,
      realTimeUsers: parseInt(realtimeCount),
      last30Days: dailyData,
      trafficSources: trafficData,
      devices: deviceData,
      topPages: topPagesData,
      locations: locationData,
      userAcquisition: userAcquisitionData,
      hourlyData: hourlyDataProcessed,
      browsers: browserData,
      userActivity: userActivity || null
    }
    
    console.log('Processed data:', result)
    return result
  }

  // ヘルパー関数
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return ''
    const day = dateStr.substring(6, 8)
    // 日付の先頭の0を削除して「日」を追加
    return `${parseInt(day, 10)}日`
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }

  const translateSource = (source: string) => {
    const translations: { [key: string]: string } = {
      'Organic Search': '自然検索',
      'Direct': 'ダイレクト',
      'Social': 'ソーシャル',
      'Referral': 'リファラル',
      'Email': 'メール',
      'Paid Search': '有料検索',
      'Display': 'ディスプレイ',
      'Other': 'その他'
    }
    return translations[source] || source
  }

  const getSourceColor = (source: string) => {
    const colors: { [key: string]: string } = {
      'Organic Search': 'bg-blue-500',
      'Direct': 'bg-green-500',
      'Social': 'bg-purple-500',
      'Referral': 'bg-yellow-500',
      'Email': 'bg-pink-500',
      'Paid Search': 'bg-red-500',
      'Display': 'bg-indigo-500',
      'Other': 'bg-gray-500'
    }
    return colors[source] || 'bg-gray-500'
  }

  const translateDevice = (device: string) => {
    const translations: { [key: string]: string } = {
      'desktop': 'デスクトップ',
      'mobile': 'モバイル',
      'tablet': 'タブレット'
    }
    return translations[device.toLowerCase()] || device
  }

  const getDeviceIcon = (device: string) => {
    const icons: { [key: string]: any } = {
      'desktop': Monitor,
      'mobile': Smartphone,
      'tablet': Tablet
    }
    return icons[device.toLowerCase()] || Monitor
  }

  const translateCountry = (country: string) => {
    const translations: { [key: string]: string } = {
      'Japan': '日本',
      'United States': 'アメリカ',
      'China': '中国',
      'South Korea': '韓国',
      'Taiwan': '台湾',
      'United Kingdom': 'イギリス',
      'Germany': 'ドイツ',
      'France': 'フランス',
      'Canada': 'カナダ',
      'Australia': 'オーストラリア'
    }
    return translations[country] || country
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num)
  }

  const getChangeIndicator = (current: number, previous: number) => {
    const change = ((current - previous) / previous) * 100
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    }
  }

  // より自然な曲線を生成する関数
  const createSmoothPath = (points: { x: number; y: number }[]) => {
    if (points.length < 2) return ''
    
    let path = `M${points[0].x},${points[0].y}`
    
    for (let i = 1; i < points.length; i++) {
      const current = points[i]
      const previous = points[i - 1]
      
      // シンプルな線形補間でより自然な曲線を作成
      if (i === points.length - 1) {
        // 最後の点は直線で接続
        path += ` L${current.x},${current.y}`
      } else {
        const next = points[i + 1]
        // 緩やかな制御点を計算
        const controlX1 = previous.x + (current.x - previous.x) * 0.5
        const controlY1 = previous.y
        const controlX2 = current.x - (next.x - current.x) * 0.2
        const controlY2 = current.y
        
        path += ` C${controlX1},${controlY1} ${controlX2},${controlY2} ${current.x},${current.y}`
      }
    }
    
    return path
  }

  // 初回読み込み
  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange])

  // リアルタイムデータの定期更新
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const response = await fetch('/api/analytics?type=realtime')
        const data = await response.json()
        const count = data.rows?.[0]?.metricValues[0]?.value || 0
        setRealTimeUsers(parseInt(count))
      } catch (err) {
        console.error('Failed to update realtime users:', err)
      }
    }, 30000) // 30秒ごとに更新
    
    return () => clearInterval(interval)
  }, [])

  if (error) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">エラーが発生しました</h3>
            <p className="text-sm text-red-700">{error}</p>
            <p className="text-sm text-red-600 mt-2">
              以下の点を確認してください：
            </p>
            <ul className="text-sm text-red-600 mt-1 list-disc list-inside">
              <li>Google Analytics プロパティIDが正しく設定されているか</li>
              <li>サービスアカウントの認証情報が正しいか</li>
              <li>サービスアカウントがプロパティへのアクセス権限を持っているか</li>
            </ul>
            <button
              onClick={() => fetchAnalyticsData()}
              className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 text-sm"
            >
              再試行
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-4 text-sm text-gray-600">データを読み込み中...</p>
          </div>
        </div>
      </div>
    )
  }

  // デフォルトデータ構造を定義
  const defaultData: AnalyticsData = {
    overview: {
      users: 0,
      newUsers: 0,
      sessions: 0,
      bounceRate: 0,
      pageViews: 0,
      avgSessionDuration: '0:00',
      engagementRate: 0,
      engagedSessions: 0
    },
    realTimeUsers: 0,
    last30Days: [],
    trafficSources: [],
    devices: [],
    topPages: [],
    locations: [],
    userAcquisition: [],
    hourlyData: [],
    browsers: []
  }

  // loadingの場合もデータをマージして表示
  const displayData = data || defaultData

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
        <div className="flex items-center gap-4">
          <AnalyticsButtons />
          <div className="relative">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="appearance-none px-4 py-2 pr-10 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
          >
            <option value="7daysAgo">過去7日間</option>
            <option value="30daysAgo">過去30日間</option>
            <option value="90daysAgo">過去90日間</option>
          </select>
          <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
            <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        </div>
      </div>

      {/* Real-time users indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-green-600 animate-pulse" />
          <div>
            <p className="text-sm text-green-700">アクティブユーザー</p>
            <p className="text-2xl font-bold text-green-800">{realTimeUsers}</p>
          </div>
        </div>
        <p className="text-sm text-green-600">リアルタイム</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(displayData.overview.users)}</div>
          <div className="text-sm text-gray-600">ユーザー</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-8 w-8 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(displayData.overview.pageViews)}</div>
          <div className="text-sm text-gray-600">ページビュー</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-8 w-8 text-purple-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(displayData.overview.sessions)}</div>
          <div className="text-sm text-gray-600">セッション</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{displayData.overview.bounceRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">直帰率</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Activity className="h-8 w-8 text-pink-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{displayData.overview.engagementRate.toFixed(1)}%</div>
          <div className="text-sm text-gray-600">エンゲージメント率</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-8 w-8 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(displayData.overview.engagedSessions)}</div>
          <div className="text-sm text-gray-600">エンゲージメントセッション</div>
        </div>
      </div>

      {/* Page Views Trend and User Activity Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Page Views Trend Line Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-2 text-gray-900">ページビュー推移</h3>
          <div className="bg-gray-50 rounded-lg p-4 mb-4">
            {displayData.last30Days.length > 0 && (() => {
              const todayData = displayData.last30Days[displayData.last30Days.length - 1]
              const yesterdayData = displayData.last30Days[displayData.last30Days.length - 2]
              const change = yesterdayData ? todayData.pageViews - yesterdayData.pageViews : 0
              const changePercent = yesterdayData && yesterdayData.pageViews > 0 
                ? ((change / yesterdayData.pageViews) * 100).toFixed(1) 
                : '0'
              const isPositive = change >= 0
              
              return (
                <div>
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-xs text-gray-600">本日のページビュー</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="text-3xl font-bold text-gray-900">{formatNumber(todayData.pageViews)}</div>
                    {yesterdayData && (
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-gray-600">前日比</span>
                        <span className={`font-semibold ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          {isPositive ? '▲' : '▼'} {Math.abs(change).toLocaleString()}
                        </span>
                        <span className={`text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
                          ({isPositive ? '+' : ''}{changePercent}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })()}
          </div>
          <div className="relative h-64 pl-12 pb-6">
            <div className="relative w-full h-full">
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 400 100" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 1, 2, 3, 4].map((i) => (
                <line
                  key={i}
                  x1="0"
                  y1={10 + i * 20}
                  x2="400"
                  y2={10 + i * 20}
                  stroke="#f3f4f6"
                  strokeWidth="0.5"
                />
              ))}
              
              {/* Chart Area */}
              {displayData.last30Days.length > 1 && (() => {
                // データは既に期間に応じて生成されているので、全データを使用
                const chartData = displayData.last30Days
                const maxViews = Math.max(...chartData.map(d => d.pageViews))
                const minViews = Math.min(...chartData.map(d => d.pageViews))
                const range = Math.max(maxViews - minViews, 1)
                const padding = range * 0.1 // 10%のパディング
                
                const points = chartData.map((day, index) => {
                  const x = (index / Math.max(chartData.length - 1, 1)) * 400
                  const normalizedValue = (day.pageViews - minViews + padding) / (range + padding * 2)
                  const y = 90 - (normalizedValue * 80)
                  return { x, y, value: day.pageViews, date: day.date, index }
                })

                // より自然な線形補間パス
                let pathData = `M${points[0].x},${points[0].y}`
                for (let i = 1; i < points.length; i++) {
                  pathData += ` L${points[i].x},${points[i].y}`
                }

                const areaPath = pathData + ` L${points[points.length - 1].x},90 L${points[0].x},90 Z`

                return (
                  <g>
                    <defs>
                      <linearGradient id="pageViewGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.2)" />
                        <stop offset="100%" stopColor="rgba(59, 130, 246, 0.02)" />
                      </linearGradient>
                    </defs>
                    
                    {/* Area under curve */}
                    <path
                      d={areaPath}
                      fill="url(#pageViewGradient)"
                    />
                    
                    {/* Line */}
                    <path
                      d={pathData}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="0.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    
                    {/* Interactive data points */}
                    {points.map((point, idx) => (
                      <g key={idx}>
                        {/* Hover area - vertical line for better interaction */}
                        <rect
                          x={point.x - 10}
                          y="0"
                          width="20"
                          height="100"
                          fill="transparent"
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredPoint({ 
                            value: point.value, 
                            date: point.date,
                            index: idx
                          })}
                          onMouseLeave={() => setHoveredPoint(null)}
                        />
                        
                        {/* Vertical line on hover */}
                        {hoveredPoint?.index === idx && (
                          <line
                            x1={point.x}
                            y1="0"
                            x2={point.x}
                            y2="100"
                            stroke="#e5e7eb"
                            strokeWidth="0.5"
                            strokeDasharray="2 2"
                          />
                        )}
                        
                      </g>
                    ))}
                  </g>
                )
              })()}
              
              </svg>
            </div>
            
            {/* Y-axis labels - positioned outside SVG */}
            <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-1">
              {[0, 1, 2, 3, 4].map((i) => {
                const chartData = displayData.last30Days
                if (chartData.length === 0) return <span key={i} className="text-xs text-gray-500 text-right w-10">0</span>
                
                const maxViews = Math.max(...chartData.map(d => d.pageViews), 1)
                const minViews = Math.min(...chartData.map(d => d.pageViews), 0)
                const range = maxViews - minViews || 1
                const value = Math.round(maxViews - (range * i / 4))
                
                return (
                  <span key={i} className="text-xs text-gray-500 text-right w-10">
                    {formatNumber(Math.max(0, value))}
                  </span>
                )
              })}
            </div>
            
            {/* X-axis labels - positioned below SVG */}
            <div className="absolute bottom-0 left-12 right-0 pr-2">
              {(() => {
                const chartData = displayData.last30Days
                
                // 期間に応じた表示間隔の設定
                let skipInterval = 1
                let showMonthOnFirst = false
                
                if (timeRange === '7daysAgo') {
                  // 7日間：すべて表示
                  skipInterval = 1
                } else if (timeRange === '30daysAgo') {
                  // 30日間：5日ごとに表示
                  skipInterval = 5
                  showMonthOnFirst = true
                } else {
                  // 90日間：15日ごとに表示
                  skipInterval = 15
                  showMonthOnFirst = true
                }
                
                return (
                  <div className="flex justify-between relative h-4">
                    {chartData.map((day, index) => {
                      const shouldShow = index % skipInterval === 0 || index === chartData.length - 1
                      
                      // 月日形式で表示（最初の日付のみ）
                      let displayText = day.date
                      if (showMonthOnFirst && index === 0 && day.originalDate) {
                        const month = parseInt(day.originalDate.substring(4, 6), 10)
                        const dayNum = parseInt(day.originalDate.substring(6, 8), 10)
                        displayText = `${month}/${dayNum}`
                      }
                      
                      if (timeRange === '7daysAgo') {
                        // 7日間はflex表示
                        return (
                          <span 
                            key={index} 
                            className="text-xs text-gray-500 font-medium whitespace-nowrap"
                          >
                            {displayText}
                          </span>
                        )
                      } else {
                        // 30日・90日は絶対位置
                        return (
                          <span 
                            key={index} 
                            className={`text-xs font-medium absolute whitespace-nowrap ${shouldShow ? 'text-gray-500' : 'text-transparent'}`}
                            style={{ 
                              left: index === 0
                                ? '12px'
                                : index === chartData.length - 1 
                                ? 'auto' 
                                : `${(index / (chartData.length - 1)) * 100}%`,
                              right: index === chartData.length - 1 ? '0' : 'auto',
                              transform: index === 0 || index === chartData.length - 1 ? 'none' : 'translateX(-50%)'
                            }}
                          >
                            {displayText}
                          </span>
                        )
                      }
                    })}
                  </div>
                )
              })()}
            </div>
            
            {/* Hover tooltip */}
            {hoveredPoint && displayData.last30Days.length > 1 && (() => {
              const chartData = displayData.last30Days
              const point = chartData[hoveredPoint.index]
              const prevPoint = chartData[hoveredPoint.index - 1]
              if (!point) return null
              
              // Calculate position based on actual chart area (considering left padding)
              const xPosition = (hoveredPoint.index / Math.max(chartData.length - 1, 1)) * 100
              
              // Calculate change from previous day
              let change = 0
              let changePercent = '0'
              if (prevPoint && prevPoint.pageViews > 0) {
                change = point.pageViews - prevPoint.pageViews
                changePercent = ((change / prevPoint.pageViews) * 100).toFixed(1)
              }
              
              // 画面端での位置調整
              let transform = 'translateX(-50%)'
              let leftPosition = `${xPosition}%`
              
              if (xPosition > 80) {
                // 右端80%以降は右寄せ
                transform = 'translateX(-100%)'
              } else if (xPosition < 20) {
                // 左端20%以前は左寄せ
                transform = 'translateX(0%)'
              }
              
              // Position tooltip above the chart
              return (
                <div
                  className="absolute pointer-events-none z-20"
                  style={{
                    left: leftPosition,
                    top: '5px',
                    transform,
                    marginLeft: '48px' // Account for pl-12
                  }}
                >
                  <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl min-w-[180px]">
                    <div className="text-xs text-gray-400 mb-2">
                      {(() => {
                        // Get the original date string from the data
                        const originalData = displayData.last30Days[hoveredPoint.index]
                        if (!originalData || !originalData.originalDate) return `${hoveredPoint.date}日`
                        
                        // Parse the date properly for tooltip
                        const dateStr = originalData.originalDate
                        if (dateStr.length === 8) {
                          const month = parseInt(dateStr.substring(4, 6), 10)
                          const day = parseInt(dateStr.substring(6, 8), 10)
                          return `${month}月${day}日`
                        }
                        return `${hoveredPoint.date}日`
                      })()}
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs text-gray-300">ページビュー</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatNumber(hoveredPoint.value)}
                        </span>
                      </div>
                      
                      {/* Previous day comparison */}
                      {prevPoint && (
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-gray-400">前日比</span>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs font-medium ${
                              change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {change >= 0 ? '+' : ''}{change.toLocaleString()}
                            </span>
                            <span className={`text-xs ${
                              change >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              ({change >= 0 ? '+' : ''}{changePercent}%)
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>

        {/* User Activity Trend */}
        <UserActivityTrend timeRange={timeRange} userActivityData={displayData.userActivity} />
      </div>

      {/* Top Pages - Full Width */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">人気ページ（エンゲージメント詳細）</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="text-sm text-gray-600 border-b border-gray-200">
              <tr>
                <th className="text-left pb-2">ページ</th>
                <th className="text-right pb-2">ビュー数</th>
                <th className="text-right pb-2">エンゲージメント時間</th>
                <th className="text-right pb-2">直帰率</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {displayData.topPages.slice(0, 5).map((page) => (
                <tr key={page.page} className="border-b border-gray-100">
                  <td className="py-3">
                    <div>
                      <p className="font-medium text-gray-900">{page.title}</p>
                      <p className="text-xs text-gray-500">{page.page}</p>
                    </div>
                  </td>
                  <td className="text-right py-3 text-gray-700">{formatNumber(page.views)}</td>
                  <td className="text-right py-3 text-gray-700">{page.engagementTime}</td>
                  <td className="text-right py-3 text-gray-700">{page.bounceRate.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Device Breakdown, Traffic Sources, and User Acquisition - Three Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Device Breakdown */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">デバイス別</h3>
          <div className="space-y-4">
            {displayData.devices.map((device) => {
              const Icon = device.icon
              return (
                <div key={device.type}>
                  <div className="flex justify-between text-sm mb-1">
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4 text-gray-600" />
                      <span className="text-gray-700">{device.type}</span>
                    </div>
                    <span className="font-medium">{device.value}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${device.value}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">トラフィックソース</h3>
          <div className="space-y-4">
            {displayData.trafficSources.map((source) => (
              <div key={source.source}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{source.source}</span>
                  <span className="font-medium">{source.value}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${source.color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${source.value}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* User Acquisition Pie Chart */}
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-6 text-gray-900">新規 vs リピーター</h3>
          <div className="flex items-center justify-center">
            {displayData.userAcquisition.length > 0 && (() => {
              const newUser = displayData.userAcquisition.find(u => u.type === '新規ユーザー') || { percentage: 0 }
              const returningUser = displayData.userAcquisition.find(u => u.type === 'リピーター') || { percentage: 0 }
              const newUserAngle = (newUser.percentage / 100) * 360
              const returningUserAngle = (returningUser.percentage / 100) * 360
              
              const radius = 60
              const centerX = 80
              const centerY = 80
              
              const newUserPath = `M ${centerX} ${centerY} L ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${newUserAngle > 180 ? 1 : 0} 1 ${centerX + radius * Math.sin((newUserAngle * Math.PI) / 180)} ${centerY - radius * Math.cos((newUserAngle * Math.PI) / 180)} Z`
              const returningUserPath = `M ${centerX} ${centerY} L ${centerX + radius * Math.sin((newUserAngle * Math.PI) / 180)} ${centerY - radius * Math.cos((newUserAngle * Math.PI) / 180)} A ${radius} ${radius} 0 ${returningUserAngle > 180 ? 1 : 0} 1 ${centerX} ${centerY - radius} Z`

              return (
                <div className="flex items-center gap-6">
                  <svg width="160" height="160" viewBox="0 0 160 160">
                    {/* New Users */}
                    <path
                      d={newUserPath}
                      fill="#3b82f6"
                    />
                    {/* Returning Users */}
                    <path
                      d={returningUserPath}
                      fill="#10b981"
                    />
                  </svg>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">新規ユーザー</div>
                        <div className="text-lg font-bold text-blue-600">{newUser.percentage}%</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">リピーター</div>
                        <div className="text-lg font-bold text-green-600">{returningUser.percentage}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>
        </div>
      </div>

      {/* Hourly Access - Full Width */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mb-6">
        <h3 className="text-lg font-semibold mb-6 text-gray-900">時間帯別アクセス</h3>
        <div className="grid grid-cols-8 lg:grid-cols-12 gap-2">
          {displayData.hourlyData.map((hourData) => {
            const maxUsers = Math.max(...displayData.hourlyData.map(h => h.users))
            const percentage = maxUsers > 0 ? Math.round((hourData.users / maxUsers) * 100) : 0
            const color = parseInt(hourData.hour) < 6 ? 'bg-blue-500' : 
                         parseInt(hourData.hour) < 12 ? 'bg-green-500' :
                         parseInt(hourData.hour) < 18 ? 'bg-yellow-500' : 'bg-purple-500'
            return (
              <div key={hourData.hour} className="flex flex-col items-center gap-1">
                <span className="text-xs text-gray-600">{hourData.hour}時</span>
                <div className="w-full max-w-[3rem] bg-gray-200 rounded-full h-2">
                  <div 
                    className={`${color} h-2 rounded-full transition-all duration-500`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-xs font-medium text-gray-900">{hourData.users}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Locations and Browsers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Locations */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">地域別セッション</h3>
          <div className="space-y-2">
            {displayData.locations.slice(0, 5).map((location) => (
              <div key={location.country} className="flex justify-between text-sm">
                <span className="text-gray-700">{location.country}</span>
                <span className="text-gray-900">{formatNumber(location.sessions)} ({location.percentage}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Browsers */}
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">ブラウザ別</h3>
          <div className="space-y-2">
            {displayData.browsers.slice(0, 5).map((browser) => (
              <div key={browser.browser}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-700">{browser.browser}</span>
                  <span className="font-medium">{browser.percentage}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-1.5">
                  <div 
                    className="bg-purple-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${browser.percentage}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}