'use client'

import { useState, useEffect } from 'react'
import { BarChart2, RefreshCw, Target, TrendingUp, Users, Activity, AlertCircle } from 'lucide-react'
import { Line, LineChart, Bar, BarChart, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Cell } from 'recharts'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import TopColumnsList from './TopColumnsList'

interface ColumnGoals {
  scope: string
  baseGoal: number
  stretchGoal: number
  mean: number
  median: number
  p90: number
  max: number
  sampleCount: number
  rangeDays: number
  filterRegex: string
  excludeBotTraffic: boolean
  outlierFilter: boolean
}

interface ComputeParams {
  days: number
  filterRegex: string
  excludeBotTraffic: boolean
  outlierFilter: boolean
}

export default function ColumnGoalsPage() {
  const [goals, setGoals] = useState<ColumnGoals | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [recomputing, setRecomputing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [distribution, setDistribution] = useState<any[]>([])
  const [topPages, setTopPages] = useState<any[]>([])
  const [columns, setColumns] = useState<any[]>([])
  const [params, setParams] = useState<ComputeParams>({
    days: 90,
    filterRegex: '^/column/[^/]+/?$', // columnsからcolumnに変更
    excludeBotTraffic: false, // 初期値をfalseに変更
    outlierFilter: true,
  })

  // 最新の目標値を取得
  const fetchGoals = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch('/api/analytics/column/goals')
      
      if (!response.ok) {
        if (response.status === 404) {
          setError('目標値がまだ計算されていません。「再計算」ボタンを押してください。')
        } else {
          throw new Error('Failed to fetch goals')
        }
        return
      }

      const data = await response.json()
      setGoals(data.data)
      
      // パラメータを既存の設定で更新
      if (data.data) {
        setParams({
          days: data.data.rangeDays,
          filterRegex: data.data.filterRegex,
          excludeBotTraffic: data.data.excludeBotTraffic,
          outlierFilter: data.data.outlierFilter,
        })
      }
    } catch (err) {
      console.error('Error fetching goals:', err)
      setError('目標値の取得に失敗しました')
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  // 目標値を再計算
  const recomputeGoals = async () => {
    try {
      setRecomputing(true)
      setError(null)
      setLoading(true) // 再計算時もローディング表示
      setGoals(null) // 既存データをクリア
      
      const response = await fetch('/api/analytics/column/recompute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
      })

      if (!response.ok) {
        const errorData = await response.json()
        console.error('Recompute error:', errorData)
        throw new Error(errorData.message || 'Failed to recompute goals')
      }

      const data = await response.json()
      
      // 最新のデータを取得
      await fetchGoals()
      
      // 分布データも再取得
      await fetchDistribution()
      
      // トースト通知の代わりに簡易的なアラート
      alert('目標値の再計算が完了しました')
    } catch (err) {
      console.error('Error recomputing goals:', err)
      setError(`再計算に失敗しました: ${err.message}`)
    } finally {
      setRecomputing(false)
    }
  }

  // 分布データを取得
  const fetchDistribution = async () => {
    try {
      const response = await fetch(`/api/analytics/column/distribution?days=${params.days}&filterRegex=${encodeURIComponent(params.filterRegex)}`)
      if (response.ok) {
        const data = await response.json()
        if (data.data) {
          if (data.data.distribution) {
            setDistribution(data.data.distribution)
          }
          if (data.data.topPages) {
            setTopPages(data.data.topPages)
          }
        }
      }
    } catch (err) {
      console.error('Error fetching distribution:', err)
    }
  }

  // コラムデータを取得
  const fetchColumns = async () => {
    try {
      const response = await fetch('/api/columns')
      if (response.ok) {
        const data = await response.json()
        setColumns(data.columns || [])
      }
    } catch (err) {
      console.error('Error fetching columns:', err)
    }
  }

  // テーブルの存在確認
  const checkTable = async () => {
    try {
      const response = await fetch('/api/analytics/column/check-table')
      const data = await response.json()
      
      if (!data.exists) {
        setError('データベーステーブルが存在しません。マイグレーションを実行してください。')
        return false
      }
      
      return true
    } catch (err) {
      console.error('Error checking table:', err)
      return false
    }
  }

  useEffect(() => {
    const init = async () => {
      const tableExists = await checkTable()
      if (tableExists) {
        fetchGoals()
        fetchDistribution()
        fetchColumns()
      }
    }
    init()
  }, [])

  // ヒストグラムデータを取得
  const histogramData = distribution.length > 0 ? distribution : []
  
  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
      <h3 className="text-sm font-medium text-gray-600 mb-1">{title}</h3>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
    </div>
  )

  if (loading && initialLoad) {
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">コラム分析</h1>
          <p className="text-gray-600 mt-1">過去のコラムのパフォーマンスから目標値を自動算出</p>
        </div>
        
        <button
          onClick={recomputeGoals}
          disabled={recomputing}
          className="flex items-center gap-2 bg-portfolio-blue text-white px-4 py-2 rounded-lg hover:bg-portfolio-darkblue transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <RefreshCw className={`h-4 w-4 ${recomputing ? 'animate-spin' : ''}`} />
          {recomputing ? '計算中...' : '再計算'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
          <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {loading && !initialLoad ? (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mr-3"></div>
            <span className="text-gray-600">データを更新中...</span>
          </div>
        </div>
      ) : goals ? (
        <>
          {/* 統計サマリーカード */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="ベース目標"
              value={goals.baseGoal.toLocaleString()}
              icon={Target}
              color="bg-blue-500"
              subtitle="中央値（Median）"
            />
            <StatCard
              title="ストレッチ目標"
              value={goals.stretchGoal.toLocaleString()}
              icon={TrendingUp}
              color="bg-green-500"
              subtitle="90パーセンタイル"
            />
            <StatCard
              title="平均値"
              value={goals.mean.toLocaleString()}
              icon={Activity}
              color="bg-purple-500"
              subtitle="Mean"
            />
            <StatCard
              title="最大値"
              value={goals.max.toLocaleString()}
              icon={BarChart2}
              color="bg-orange-500"
              subtitle="Max"
            />
            <StatCard
              title="ビューされた記事数"
              value={`${goals.sampleCount} / ${columns?.length || '-'}`}
              icon={Users}
              color="bg-gray-500"
              subtitle={`過去${goals.rangeDays}日間`}
            />
          </div>

          {/* ビュー分布ヒストグラム */}
          <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
            <h2 className="text-lg font-semibold mb-4">ビュー数分布</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={histogramData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6">
                  {histogramData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 1 ? '#10B981' : '#3B82F6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* ビュー数TOP10 */}
          {topPages.length > 0 && (
            <TopColumnsList topPages={topPages} columns={columns} />
          )}
        </>
      ) : null}
    </div>
  )
}