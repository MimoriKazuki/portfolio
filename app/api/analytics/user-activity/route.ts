import { NextResponse } from 'next/server'
import { initializeAnalyticsClient } from '@/app/lib/google-analytics'
import { createClient } from '@/app/lib/supabase/server'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || '30daysAgo'
    
    console.log('User activity API called with timeRange:', timeRange)
    
    // 認証確認
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      console.error('Auth error:', authError)
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // GA4の認証情報を取得
    const credentialsJson = process.env.GOOGLE_ANALYTICS_CREDENTIALS
    const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID

    if (!credentialsJson || !propertyId) {
      console.error('GA4 config missing - credentialsJson:', !!credentialsJson, 'propertyId:', !!propertyId)
      throw new Error('Google Analytics configuration missing')
    }

    let parsedCredentials
    try {
      parsedCredentials = JSON.parse(credentialsJson)
    } catch (parseError) {
      console.error('Failed to parse GA credentials:', parseError)
      throw new Error('Invalid Google Analytics credentials format')
    }
    
    const client = initializeAnalyticsClient(parsedCredentials)
    console.log('GA4 client initialized')

    // 指定期間の日別データを取得
    console.log('Running GA4 report...')
    const [response] = await client.runReport({
      property: `properties/${propertyId}`,
      dateRanges: [
        {
          startDate: timeRange,
          endDate: 'today'
        }
      ],
      dimensions: [
        { name: 'date' }
      ],
      metrics: [
        { name: 'activeUsers' },
        { name: 'newUsers' },
        { name: 'sessions' }
      ],
      orderBys: [
        {
          dimension: { dimensionName: 'date' },
          desc: false
        }
      ]
    })
    console.log('GA4 report completed, rows:', response.rows?.length || 0)

    // APIから取得したデータをマップに変換
    const dataMap = new Map()
    response.rows?.forEach((row: any) => {
      const dateValue = row.dimensionValues?.[0]?.value || ''
      if (dateValue) {
        dataMap.set(dateValue, {
          activeUsers: Number(row.metricValues?.[0]?.value || 0),
          newUsers: Number(row.metricValues?.[1]?.value || 0),
          sessions: Number(row.metricValues?.[2]?.value || 0)
        })
      }
    })

    // 期間に基づいて全日付を生成
    const days = timeRange === '7daysAgo' ? 7 : 
                timeRange === '30daysAgo' ? 30 : 90
    
    const dailyActivity = []
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
        activeUsers: 0,
        newUsers: 0,
        sessions: 0
      }
      
      // 日付をMM/DD形式に変換
      const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`
      
      dailyActivity.push({
        date: formattedDate,
        originalDate: dateStr,
        activeUsers: data.activeUsers,
        newUsers: data.newUsers,
        sessions: data.sessions
      })
    }

    // 増減を計算（前日比）
    const todayData = dailyActivity[dailyActivity.length - 1] || { activeUsers: 0, newUsers: 0 }
    const yesterdayData = dailyActivity[dailyActivity.length - 2] || { activeUsers: 0, newUsers: 0 }
    
    const userGrowth = {
      activeUsers: {
        value: todayData.activeUsers,
        change: todayData.activeUsers - yesterdayData.activeUsers,
        changePercent: yesterdayData.activeUsers > 0 
          ? ((todayData.activeUsers - yesterdayData.activeUsers) / yesterdayData.activeUsers * 100).toFixed(1)
          : '0'
      },
      newUsers: {
        value: todayData.newUsers,
        change: todayData.newUsers - yesterdayData.newUsers,
        changePercent: yesterdayData.newUsers > 0 
          ? ((todayData.newUsers - yesterdayData.newUsers) / yesterdayData.newUsers * 100).toFixed(1)
          : '0'
      }
    }

    return NextResponse.json({
      dailyActivity,
      userGrowth
    })

  } catch (error: any) {
    console.error('Error fetching user activity:', error)
    return NextResponse.json(
      { 
        error: 'Failed to fetch user activity data',
        details: error.message || error.toString()
      },
      { status: 500 }
    )
  }
}