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
  Activity
} from 'lucide-react'
import Link from 'next/link'

// Mock data for demonstration
const generateMockData = () => {
  const now = new Date()
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date(now)
    date.setDate(date.getDate() - (29 - i))
    return {
      date: date.toLocaleDateString('ja-JP', { month: 'short', day: 'numeric' }),
      pageViews: Math.floor(Math.random() * 500) + 100,
      users: Math.floor(Math.random() * 200) + 50,
      sessions: Math.floor(Math.random() * 300) + 80,
    }
  })
  
  return {
    overview: {
      users: 3847,
      newUsers: 2156,
      sessions: 5234,
      bounceRate: 45.2,
      pageViews: 12847,
      avgSessionDuration: '2:34',
      totalRevenue: 0,
      conversionRate: 3.2
    },
    realTimeUsers: Math.floor(Math.random() * 50) + 10,
    last30Days,
    trafficSources: [
      { source: 'Organic Search', value: 45, color: 'bg-blue-500' },
      { source: 'Direct', value: 25, color: 'bg-green-500' },
      { source: 'Social', value: 20, color: 'bg-purple-500' },
      { source: 'Referral', value: 10, color: 'bg-yellow-500' }
    ],
    devices: [
      { type: 'Desktop', value: 58, icon: Monitor },
      { type: 'Mobile', value: 35, icon: Smartphone },
      { type: 'Tablet', value: 7, icon: Tablet }
    ],
    topPages: [
      { page: '/', title: 'ホーム', views: 4532, avgTime: '1:45' },
      { page: '/projects', title: 'プロジェクト', views: 2341, avgTime: '3:12' },
      { page: '/columns/web-development-trends', title: 'Web開発トレンド2024', views: 1876, avgTime: '4:23' },
      { page: '/contact', title: 'お問い合わせ', views: 1234, avgTime: '2:01' },
      { page: '/documents', title: 'ドキュメント', views: 987, avgTime: '2:45' }
    ],
    locations: [
      { country: '日本', sessions: 3421, percentage: 65.4 },
      { country: 'アメリカ', sessions: 876, percentage: 16.7 },
      { country: '中国', sessions: 432, percentage: 8.3 },
      { country: 'その他', sessions: 505, percentage: 9.6 }
    ]
  }
}

export default function AdminDashboard() {
  const [data, setData] = useState(generateMockData())
  const [timeRange, setTimeRange] = useState('30days')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => ({
        ...prev,
        realTimeUsers: Math.floor(Math.random() * 50) + 10
      }))
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num)
  }

  const getChangeIndicator = (value: number) => {
    const change = (Math.random() - 0.5) * 20
    return {
      value: Math.abs(change).toFixed(1),
      isPositive: change > 0
    }
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-gray-900">アナリティクス ダッシュボード</h1>
          <p className="text-gray-600">ウェブサイトのパフォーマンスとユーザー行動を分析</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
          >
            <option value="7days">過去7日間</option>
            <option value="30days">過去30日間</option>
            <option value="90days">過去90日間</option>
          </select>
          <Link
            href="/"
            target="_blank"
            className="flex items-center gap-2 bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Eye className="h-5 w-5" />
            サイトを見る
          </Link>
        </div>
      </div>

      {/* Real-time users indicator */}
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Activity className="h-6 w-6 text-green-600 animate-pulse" />
          <div>
            <p className="text-sm text-green-700">アクティブユーザー</p>
            <p className="text-2xl font-bold text-green-800">{data.realTimeUsers}</p>
          </div>
        </div>
        <p className="text-sm text-green-600">リアルタイム</p>
      </div>

      {/* Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Users className="h-8 w-8 text-blue-500" />
            <span className={`text-xs ${getChangeIndicator(data.overview.users).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {getChangeIndicator(data.overview.users).isPositive ? '↑' : '↓'} {getChangeIndicator(data.overview.users).value}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.users)}</div>
          <div className="text-sm text-gray-600">ユーザー</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <Eye className="h-8 w-8 text-green-500" />
            <span className={`text-xs ${getChangeIndicator(data.overview.pageViews).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {getChangeIndicator(data.overview.pageViews).isPositive ? '↑' : '↓'} {getChangeIndicator(data.overview.pageViews).value}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.pageViews)}</div>
          <div className="text-sm text-gray-600">ページビュー</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <BarChart3 className="h-8 w-8 text-purple-500" />
            <span className={`text-xs ${getChangeIndicator(data.overview.sessions).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {getChangeIndicator(data.overview.sessions).isPositive ? '↑' : '↓'} {getChangeIndicator(data.overview.sessions).value}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{formatNumber(data.overview.sessions)}</div>
          <div className="text-sm text-gray-600">セッション</div>
        </div>
        
        <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <TrendingUp className="h-8 w-8 text-yellow-500" />
            <span className={`text-xs ${!getChangeIndicator(data.overview.bounceRate).isPositive ? 'text-green-600' : 'text-red-600'}`}>
              {!getChangeIndicator(data.overview.bounceRate).isPositive ? '↓' : '↑'} {getChangeIndicator(data.overview.bounceRate).value}%
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900">{data.overview.bounceRate}%</div>
          <div className="text-sm text-gray-600">直帰率</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Page Views Chart */}
        <div className="lg:col-span-2 bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">ページビューの推移</h3>
          <div className="h-64 flex items-end justify-between gap-1">
            {data.last30Days.slice(-14).map((day, index) => (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div 
                  className="w-full bg-portfolio-blue rounded-t hover:bg-portfolio-blue-dark transition-colors cursor-pointer"
                  style={{ height: `${(day.pageViews / 600) * 100}%` }}
                  title={`${day.date}: ${formatNumber(day.pageViews)} ビュー`}
                />
                <span className="text-xs text-gray-500 mt-2 rotate-45 origin-left">{day.date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-lg p-6 border border-gray-200">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">トラフィックソース</h3>
          <div className="space-y-4">
            {data.trafficSources.map((source) => (
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
                {data.topPages.map((page) => (
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
            {data.devices.map((device) => {
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
              {data.locations.map((location) => (
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