'use client'

import { useState } from 'react'
import { TrendingUp, TrendingDown, Minus, Users, UserPlus, Activity } from 'lucide-react'

interface DailyActivity {
  date: string
  originalDate: string
  activeUsers: number
  newUsers: number
  sessions: number
}

interface UserGrowth {
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

interface UserActivityData {
  dailyActivity: DailyActivity[]
  userGrowth: UserGrowth
}

interface UserActivityTrendProps {
  timeRange?: string
  userActivityData?: UserActivityData | null
}

export default function UserActivityTrend({ timeRange = '30daysAgo', userActivityData }: UserActivityTrendProps) {
  const [hoveredPoint, setHoveredPoint] = useState<{ 
    index: number
    activeUsers: number
    newUsers: number
    sessions: number
    date: string
  } | null>(null)
  const showActiveUsers = true
  const showNewUsers = true
  const showSessions = true

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ja-JP').format(num)
  }

  const getMetricColor = (metric: string) => {
    switch (metric) {
      case 'activeUsers': return '#3b82f6' // blue
      case 'newUsers': return '#10b981' // green
      case 'sessions': return '#8b5cf6' // purple
      default: return '#6b7280'
    }
  }

  const getMetricLabel = (metric: string) => {
    switch (metric) {
      case 'activeUsers': return 'アクティブユーザー'
      case 'newUsers': return '新規ユーザー'
      case 'sessions': return 'セッション'
      default: return metric
    }
  }

  // データがない場合は何も表示しない
  if (!userActivityData) {
    return null
  }

  const { dailyActivity, userGrowth } = userActivityData
  
  // Calculate max values for scaling
  const maxActiveUsers = Math.max(...dailyActivity.map(d => d.activeUsers))
  const maxNewUsers = Math.max(...dailyActivity.map(d => d.newUsers))
  const maxSessions = Math.max(...dailyActivity.map(d => d.sessions))
  
  // スケール調整のため、すべての指標の最大値を取得
  const getMaxValue = () => {
    const values = []
    if (showActiveUsers) values.push(maxActiveUsers)
    if (showNewUsers) values.push(maxNewUsers)
    if (showSessions) values.push(maxSessions)
    return Math.max(...values, 1)
  }

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900">ユーザーのアクティビティ推移</h3>

      {/* Chart */}
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
            {dailyActivity.length > 1 && (() => {
              const maxValue = getMaxValue()
              const minValue = 0
              const range = Math.max(maxValue - minValue, 1)
              // パディングなしで0から開始
              const padding = 0
              
              // 各メトリックのポイントを計算
              const createPoints = (getValue: (day: DailyActivity) => number) => {
                return dailyActivity.map((day, index) => {
                  const x = (index / Math.max(dailyActivity.length - 1, 1)) * 400
                  const value = getValue(day)
                  const normalizedValue = (value - minValue + padding) / (range + padding * 2)
                  const y = 90 - (normalizedValue * 80)
                  return { x, y, value }
                })
              }

              const activeUsersPoints = showActiveUsers ? createPoints(d => d.activeUsers) : []
              const newUsersPoints = showNewUsers ? createPoints(d => d.newUsers) : []
              const sessionsPoints = showSessions ? createPoints(d => d.sessions) : []

              const createPath = (points: any[]) => {
                if (points.length === 0) return ''
                let path = `M${points[0].x},${points[0].y}`
                for (let i = 1; i < points.length; i++) {
                  path += ` L${points[i].x},${points[i].y}`
                }
                return path
              }

              return (
                <g>
                  {/* Active Users */}
                  {showActiveUsers && (
                    <path
                      d={createPath(activeUsersPoints)}
                      fill="none"
                      stroke="#3b82f6"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* New Users */}
                  {showNewUsers && (
                    <path
                      d={createPath(newUsersPoints)}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* Sessions */}
                  {showSessions && (
                    <path
                      d={createPath(sessionsPoints)}
                      fill="none"
                      stroke="#8b5cf6"
                      strokeWidth="1"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  )}
                  
                  {/* Interactive overlay */}
                  {dailyActivity.map((day, idx) => {
                    const x = (idx / Math.max(dailyActivity.length - 1, 1)) * 400
                    return (
                      <rect
                        key={idx}
                        x={x - 10}
                        y="0"
                        width="20"
                        height="100"
                        fill="transparent"
                        className="cursor-pointer"
                        onMouseEnter={() => setHoveredPoint({ 
                          index: idx,
                          activeUsers: day.activeUsers,
                          newUsers: day.newUsers,
                          sessions: day.sessions,
                          date: day.date
                        })}
                        onMouseLeave={() => setHoveredPoint(null)}
                      />
                    )
                  })}
                  
                  {/* Hover indicators */}
                  {hoveredPoint && (() => {
                    const x = (hoveredPoint.index / Math.max(dailyActivity.length - 1, 1)) * 400
                    return (
                      <>
                        <line
                          x1={x}
                          y1="0"
                          x2={x}
                          y2="100"
                          stroke="#e5e7eb"
                          strokeWidth="0.5"
                          strokeDasharray="2 2"
                        />
                        
                        {/* Show dots for active lines at hover position */}
                        {showActiveUsers && (() => {
                          const point = activeUsersPoints[hoveredPoint.index]
                          return (
                            <circle
                              cx={x}
                              cy={point.y}
                              r="3"
                              fill="#3b82f6"
                              stroke="white"
                              strokeWidth="2"
                            />
                          )
                        })()}
                        
                        {showNewUsers && (() => {
                          const point = newUsersPoints[hoveredPoint.index]
                          return (
                            <circle
                              cx={x}
                              cy={point.y}
                              r="3"
                              fill="#10b981"
                              stroke="white"
                              strokeWidth="2"
                            />
                          )
                        })()}
                        
                        {showSessions && (() => {
                          const point = sessionsPoints[hoveredPoint.index]
                          return (
                            <circle
                              cx={x}
                              cy={point.y}
                              r="3"
                              fill="#8b5cf6"
                              stroke="white"
                              strokeWidth="2"
                            />
                          )
                        })()}
                      </>
                    )
                  })()}
                </g>
              )
            })()}
          </svg>
        </div>
        
        {/* Y-axis labels */}
        <div className="absolute left-0 top-0 h-full flex flex-col justify-between py-1">
          {[0, 1, 2, 3, 4].map((i) => {
            const maxValue = getMaxValue()
            const value = Math.round(maxValue * (4 - i) / 4)
            
            return (
              <span key={i} className="text-xs text-gray-500 text-right w-10">
                {formatNumber(value)}
              </span>
            )
          })}
        </div>
        
        {/* X-axis labels */}
        <div className="absolute bottom-0 left-12 right-0 pr-2">
          {(() => {
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
                {dailyActivity.map((day, index) => {
                  const shouldShow = index % skipInterval === 0 || index === dailyActivity.length - 1
                  
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
                            : index === dailyActivity.length - 1 
                            ? 'auto' 
                            : `${(index / (dailyActivity.length - 1)) * 100}%`,
                          right: index === dailyActivity.length - 1 ? '0' : 'auto',
                          transform: index === 0 || index === dailyActivity.length - 1 ? 'none' : 'translateX(-50%)'
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
        {hoveredPoint && dailyActivity.length > 1 && (() => {
          const xPosition = (hoveredPoint.index / Math.max(dailyActivity.length - 1, 1)) * 100
          
          // 画面右端での位置調整
          let transform = 'translateX(-50%)'
          let leftPosition = `${xPosition}%`
          
          if (xPosition > 80) {
            // 右端80%以降は右寄せ
            transform = 'translateX(-100%)'
          } else if (xPosition < 20) {
            // 左端20%以前は左寄せ
            transform = 'translateX(0%)'
          }
          
          return (
            <div
              className="absolute pointer-events-none z-20"
              style={{
                left: leftPosition,
                top: '5px',
                transform,
                marginLeft: '48px'
              }}
            >
            <div className="bg-gray-900 text-white px-4 py-3 rounded-lg shadow-xl min-w-[180px]">
              <div className="text-xs text-gray-400 mb-2">
                {(() => {
                  const originalData = dailyActivity[hoveredPoint.index]
                  if (!originalData || !originalData.originalDate) return hoveredPoint.date
                  
                  const dateStr = originalData.originalDate
                  if (dateStr.length === 8) {
                    const month = parseInt(dateStr.substring(4, 6), 10)
                    const day = parseInt(dateStr.substring(6, 8), 10)
                    return `${month}月${day}日`
                  }
                  return hoveredPoint.date
                })()}
              </div>
              
              <div className="space-y-1.5">
                {showActiveUsers && (() => {
                  const prevDay = dailyActivity[hoveredPoint.index - 1]
                  const change = prevDay ? hoveredPoint.activeUsers - prevDay.activeUsers : 0
                  const changePercent = prevDay && prevDay.activeUsers > 0 
                    ? ((change / prevDay.activeUsers) * 100).toFixed(1) 
                    : '0'
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                          <span className="text-xs text-gray-300">アクティブ</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatNumber(hoveredPoint.activeUsers)}
                        </span>
                      </div>
                      {prevDay && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change} ({change >= 0 ? '+' : ''}{changePercent}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}
                
                {showNewUsers && (() => {
                  const prevDay = dailyActivity[hoveredPoint.index - 1]
                  const change = prevDay ? hoveredPoint.newUsers - prevDay.newUsers : 0
                  const changePercent = prevDay && prevDay.newUsers > 0 
                    ? ((change / prevDay.newUsers) * 100).toFixed(1) 
                    : '0'
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                          <span className="text-xs text-gray-300">新規</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatNumber(hoveredPoint.newUsers)}
                        </span>
                      </div>
                      {prevDay && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change} ({change >= 0 ? '+' : ''}{changePercent}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}
                
                {showSessions && (() => {
                  const prevDay = dailyActivity[hoveredPoint.index - 1]
                  const change = prevDay ? hoveredPoint.sessions - prevDay.sessions : 0
                  const changePercent = prevDay && prevDay.sessions > 0 
                    ? ((change / prevDay.sessions) * 100).toFixed(1) 
                    : '0'
                  
                  return (
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                          <span className="text-xs text-gray-300">セッション</span>
                        </div>
                        <span className="text-sm font-semibold text-white">
                          {formatNumber(hoveredPoint.sessions)}
                        </span>
                      </div>
                      {prevDay && (
                        <div className="flex items-center justify-end gap-1 mt-0.5">
                          <span className={`text-xs ${change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {change >= 0 ? '+' : ''}{change} ({change >= 0 ? '+' : ''}{changePercent}%)
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            </div>
            </div>
          )
        })()}
      </div>
    </div>
  )
}