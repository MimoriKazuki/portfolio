import { createClient } from '@/app/lib/supabase/server'
import { fetchColumnViewsGA4 } from '@/app/lib/ga4-column-analytics'
import { calculateViewGoals } from '@/app/lib/stats'

export interface ComputeColumnGoalsParams {
  days?: number
  filterRegex?: string
  excludeBotTraffic?: boolean
  outlierFilter?: boolean
}

export interface ColumnGoalResult {
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

/**
 * コラムのビュー目標を計算してデータベースに保存
 */
export async function computeColumnGoals({
  days = 90,
  filterRegex = '^/column/[^/]+/?$', // columnsからcolumnに変更
  excludeBotTraffic = false, // ボットフィルタを無効化
  outlierFilter = true,
}: ComputeColumnGoalsParams = {}): Promise<ColumnGoalResult> {
  const propertyId = process.env.GOOGLE_ANALYTICS_PROPERTY_ID
  
  if (!propertyId) {
    throw new Error('GOOGLE_ANALYTICS_PROPERTY_ID not configured')
  }

  try {
    // GA4からデータを取得
    console.log('Fetching column views from GA4...')
    console.log('Parameters:', { propertyId, days, filterRegex, excludeBotTraffic })
    
    const pageViews = await fetchColumnViewsGA4({
      propertyId,
      days,
      filterRegex,
      excludeBotTraffic,
    })

    console.log(`Found ${pageViews.length} page views matching filter`)
    
    if (pageViews.length === 0) {
      // データがない場合は、デフォルト値で保存
      console.warn('No column views found, using default values')
      
      const defaultResult: ColumnGoalResult = {
        scope: 'column_all',
        baseGoal: 100,
        stretchGoal: 200,
        mean: 150,
        median: 100,
        p90: 200,
        max: 300,
        sampleCount: 0,
        rangeDays: days,
        filterRegex,
        excludeBotTraffic,
        outlierFilter,
      }
      
      // デフォルト値をデータベースに保存
      const supabase = await createClient()
      
      await supabase
        .from('content_goals')
        .insert({
          scope: defaultResult.scope,
          base_goal: defaultResult.baseGoal,
          stretch_goal: defaultResult.stretchGoal,
          mean: defaultResult.mean,
          median: defaultResult.median,
          p90: defaultResult.p90,
          max: defaultResult.max,
          sample_count: defaultResult.sampleCount,
          range_days: defaultResult.rangeDays,
          filter_regex: defaultResult.filterRegex,
          exclude_bot_traffic: defaultResult.excludeBotTraffic,
          outlier_filter: defaultResult.outlierFilter,
          computed_at: new Date().toISOString(),
        })
      
      return defaultResult
    }

    console.log(`Found ${pageViews.length} columns with views`)

    // ビュー数の配列を作成
    const views = pageViews.map(pv => pv.views)

    // 統計値を計算
    const goals = calculateViewGoals(views, outlierFilter)

    // 結果を準備
    const result: ColumnGoalResult = {
      scope: 'column_all',
      baseGoal: goals.baseGoal,
      stretchGoal: goals.stretchGoal,
      mean: goals.mean,
      median: goals.median,
      p90: goals.p90,
      max: goals.max,
      sampleCount: goals.sampleCount,
      rangeDays: days,
      filterRegex,
      excludeBotTraffic,
      outlierFilter,
    }

    // データベースに保存
    const supabase = await createClient()
    
    console.log('Attempting to save to database:', result)
    
    const { data: insertedData, error } = await supabase
      .from('content_goals')
      .insert({
        scope: result.scope,
        base_goal: result.baseGoal,
        stretch_goal: result.stretchGoal,
        mean: result.mean,
        median: result.median,
        p90: result.p90,
        max: result.max,
        sample_count: result.sampleCount,
        range_days: result.rangeDays,
        filter_regex: result.filterRegex,
        exclude_bot_traffic: result.excludeBotTraffic,
        outlier_filter: result.outlierFilter,
        computed_at: new Date().toISOString(),
      })
      .select()

    if (error) {
      console.error('Error saving content goals:', error)
      console.error('Error details:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      })
      throw new Error(`Database save failed: ${error.message}`)
    }
    
    console.log('Successfully saved to database:', insertedData)

    console.log('Content goals saved successfully')
    return result
    
  } catch (error: any) {
    console.error('Error computing column goals:', error)
    console.error('Error details:', {
      message: error?.message,
      code: error?.code,
      stack: error?.stack
    })
    
    // より詳細なエラーメッセージを提供
    if (error.message?.includes('GA4 API Error')) {
      throw error
    }
    
    throw new Error(`Failed to compute column goals: ${error?.message || 'Unknown error'}`)
  }
}

/**
 * 最新のコラム目標値を取得
 */
export async function getLatestColumnGoals(): Promise<ColumnGoalResult | null> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('content_goals')
    .select('*')
    .eq('scope', 'column_all')
    .order('computed_at', { ascending: false })
    .limit(1)
    .single()

  if (error) {
    console.error('Error fetching latest goals:', error)
    return null
  }

  if (!data) {
    return null
  }

  return {
    scope: data.scope,
    baseGoal: data.base_goal,
    stretchGoal: data.stretch_goal,
    mean: data.mean,
    median: data.median,
    p90: data.p90,
    max: data.max,
    sampleCount: data.sample_count,
    rangeDays: data.range_days,
    filterRegex: data.filter_regex,
    excludeBotTraffic: data.exclude_bot_traffic,
    outlierFilter: data.outlier_filter,
  }
}

/**
 * 個別記事のビュー目標を計算（将来の拡張用）
 */
export async function computeArticleGoals(
  pagePath: string,
  params: ComputeColumnGoalsParams = {}
): Promise<ColumnGoalResult> {
  // 個別記事の場合、その記事のカテゴリや公開からの経過日数を考慮した
  // より精密な目標設定を行うことができる
  // 現時点では全体の目標値を返す
  return computeColumnGoals(params)
}