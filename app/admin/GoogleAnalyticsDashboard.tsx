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

// データの型定義
interface AnalyticsData {
  overview: {
    users: number
    newUsers: number
    sessions: number
    bounceRate: number
    pageViews: number
    avgSessionDuration: string
  }
  realTimeUsers: number
  last30Days: Array<{
    date: string
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
  }>
  locations: Array<{
    country: string
    sessions: number
    percentage: number
  }>
}

export default function GoogleAnalyticsDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [timeRange, setTimeRange] = useState('30daysAgo')
  const [realTimeUsers, setRealTimeUsers] = useState(0)

  // データ取得関数
  const fetchAnalyticsData = async () => {
    try {
      setLoading(true)
      setError(null)

      // 各種データを並行して取得
      const [overview, realtime, traffic, devices, pages, locations] = await Promise.all([
        fetch(`/api/analytics?type=overview&startDate=${timeRange}`).then(res => res.json()),
        fetch('/api/analytics?type=realtime').then(res => res.json()),
        fetch(`/api/analytics?type=traffic&startDate=${timeRange}`).then(res => res.json()),
        fetch(`/api/analytics?type=devices&startDate=${timeRange}`).then(res => res.json()),
        fetch(`/api/analytics?type=pages&startDate=${timeRange}`).then(res => res.json()),
        fetch(`/api/analytics?type=locations&startDate=${timeRange}`).then(res => res.json())
      ])

      // データを整形
      const processedData = processAnalyticsResponse(
        overview,
        realtime,
        traffic,
        devices,
        pages,
        locations
      )

      setData(processedData)
      setRealTimeUsers(processedData.realTimeUsers)
    } catch (err) {
      console.error('Failed to fetch analytics data:', err)
      setError('アナリティクスデータの取得に失敗しました')
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
    locations: any
  ): AnalyticsData => {
    // 基本メトリクスの集計
    const overviewMetrics = {
      users: 0,
      newUsers: 0,
      sessions: 0,
      bounceRate: 0,
      pageViews: 0,
      avgSessionDuration: '0:00'
    }

    if (overview.rows && overview.rows.length > 0) {
      let totalBounceRate = 0
      let totalDuration = 0
      let bounceRateCount = 0
      
      overview.rows.forEach((row: any) => {
        overviewMetrics.users += parseInt(row.metricValues[0]?.value || 0)
        overviewMetrics.sessions += parseInt(row.metricValues[1]?.value || 0)
        overviewMetrics.pageViews += parseInt(row.metricValues[2]?.value || 0)
        
        const bounceRate = parseFloat(row.metricValues[3]?.value || 0)
        if (bounceRate > 0) {
          totalBounceRate += bounceRate
          bounceRateCount++
        }
        
        totalDuration += parseFloat(row.metricValues[4]?.value || 0)
      })
      
      // 直帰率の平均
      overviewMetrics.bounceRate = bounceRateCount > 0 ? totalBounceRate / bounceRateCount : 0
      
      // 平均セッション時間の計算
      const avgDuration = overview.rows.length > 0 ? totalDuration / overview.rows.length : 0
      
      const minutes = Math.floor(avgDuration / 60)
      const seconds = Math.floor(avgDuration % 60)
      overviewMetrics.avgSessionDuration = `${minutes}:${seconds.toString().padStart(2, '0')}`
    }

    // 日別データ
    const dailyData = overview.rows?.map((row: any) => {
      const dateValue = row.dimensionValues?.[0]?.value || ''
      return {
        date: formatDate(dateValue),
        pageViews: parseInt(row.metricValues[2]?.value || 0),
        users: parseInt(row.metricValues[0]?.value || 0),
        sessions: parseInt(row.metricValues[1]?.value || 0)
      }
    }).filter(item => item.date !== '') || []

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

    // 人気ページ
    const topPagesData = pages.rows?.map((row: any) => ({
      page: row.dimensionValues[0]?.value || '/',
      title: row.dimensionValues[1]?.value || 'ページ',
      views: parseInt(row.metricValues[0]?.value || 0),
      avgTime: formatDuration(parseFloat(row.metricValues[1]?.value || 0))
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

    // リアルタイムユーザー
    const realtimeCount = realtime.rows?.[0]?.metricValues[0]?.value || 0

    return {
      overview: overviewMetrics,
      realTimeUsers: parseInt(realtimeCount),
      last30Days: dailyData,
      trafficSources: trafficData,
      devices: deviceData,
      topPages: topPagesData,
      locations: locationData
    }
  }

  // ヘルパー関数
  const formatDate = (dateStr: string) => {
    if (!dateStr || dateStr.length !== 8) return ''
    const year = dateStr.substring(0, 4)
    const month = dateStr.substring(4, 6)
    const day = dateStr.substring(6, 8)
    return new Date(`${year}-${month}-${day}`).toLocaleDateString('ja-JP', { 
      month: 'short', 
      day: 'numeric' 
    })
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

  if (error || (!loading && !data)) {
    return (
      <div className="w-full">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-semibold text-red-800 mb-1">エラーが発生しました</h3>
            <p className="text-sm text-red-700">{error || 'データの取得に失敗しました'}</p>
            <p className="text-sm text-red-600 mt-2">
              Google Analytics の設定を確認してください。
            </p>
          </div>
        </div>
      </div>
    )
  }

  // デフォルトデータ構造を定義
  const defaultData = {
    overview: {
      users: 0,
      newUsers: 0,
      sessions: 0,
      bounceRate: 0,
      pageViews: 0,
      avgSessionDuration: '0:00'
    },
    last30Days: [],
    trafficSources: [],
    devices: [],
    topPages: [],
    locations: []
  }

  // loadingの場合もデータをマージして表示
  const displayData = data || defaultData

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">ダッシュボード</h1>
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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Page Views Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">ページビューの推移</h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {displayData.last30Days.length > 0 ? (
              displayData.last30Days.map((day, index) => {
                const maxViews = Math.max(...displayData.last30Days.map(d => d.pageViews), 1)
                const height = maxViews > 0 ? (day.pageViews / maxViews) * 100 : 0
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-portfolio-blue rounded-t hover:bg-portfolio-blue-dark transition-colors cursor-pointer"
                      style={{ height: `${Math.max(height, 5)}%` }}
                      title={`${day.date}: ${formatNumber(day.pageViews)} ビュー`}
                    />
                    <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">{day.date}</span>
                  </div>
                )
              })
            ) : (
              <div className="w-full flex items-center justify-center text-gray-500">
                データがありません
              </div>
            )}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">トラフィックソース</h3>
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
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Top Pages */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">人気ページ</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="text-sm text-gray-600 border-b border-gray-200">
                <tr>
                  <th className="text-left pb-2">ページ</th>
                  <th className="text-right pb-2">ビュー数</th>
                  <th className="text-right pb-2">平均滞在時間</th>
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
                    <td className="text-right py-3 text-gray-700">{page.avgTime}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Device Breakdown */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">デバイス別</h3>
          <div className="space-y-4">
            {displayData.devices.map((device) => {
              const Icon = device.icon
              return (
                <div key={device.type} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Icon className="h-5 w-5 text-gray-600" />
                    <span className="text-sm text-gray-700">{device.type}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-portfolio-blue h-2 rounded-full"
                        style={{ width: `${device.value}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-900 w-12 text-right">{device.value}%</span>
                  </div>
                </div>
              )
            })}
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="text-sm font-semibold mb-3 text-gray-900">地域別セッション</h4>
            <div className="space-y-2">
              {displayData.locations.slice(0, 5).map((location) => (
                <div key={location.country} className="flex justify-between text-sm">
                  <span className="text-gray-700">{location.country}</span>
                  <span className="text-gray-900">{formatNumber(location.sessions)} ({location.percentage}%)</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}