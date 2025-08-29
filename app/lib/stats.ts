/**
 * 統計計算ユーティリティ
 */

/**
 * パーセンタイルを計算
 * @param xs 数値配列
 * @param p パーセンタイル (0-1)
 * @returns パーセンタイル値
 */
export function percentile(xs: number[], p: number): number {
  if (!xs.length) return 0
  
  const arr = [...xs].sort((a, b) => a - b)
  const idx = (arr.length - 1) * p
  const lo = Math.floor(idx)
  const hi = Math.ceil(idx)
  
  if (lo === hi) return arr[lo]
  
  // 線形補間
  return arr[lo] + (arr[hi] - arr[lo]) * (idx - lo)
}

/**
 * 中央値を計算
 * @param xs 数値配列
 * @returns 中央値
 */
export function median(xs: number[]): number {
  return percentile(xs, 0.5)
}

/**
 * 90パーセンタイルを計算
 * @param xs 数値配列
 * @returns 90パーセンタイル値
 */
export function p90(xs: number[]): number {
  return percentile(xs, 0.9)
}

/**
 * 99パーセンタイルを計算
 * @param xs 数値配列
 * @returns 99パーセンタイル値
 */
export function p99(xs: number[]): number {
  return percentile(xs, 0.99)
}

/**
 * 平均値を計算
 * @param xs 数値配列
 * @returns 平均値
 */
export function mean(xs: number[]): number {
  if (!xs.length) return 0
  return xs.reduce((a, b) => a + b, 0) / xs.length
}

/**
 * 最大値を取得
 * @param xs 数値配列
 * @returns 最大値
 */
export function max(xs: number[]): number {
  if (!xs.length) return 0
  return Math.max(...xs)
}

/**
 * 最小値を取得
 * @param xs 数値配列
 * @returns 最小値
 */
export function min(xs: number[]): number {
  if (!xs.length) return 0
  return Math.min(...xs)
}

/**
 * 標準偏差を計算
 * @param xs 数値配列
 * @returns 標準偏差
 */
export function stddev(xs: number[]): number {
  if (!xs.length) return 0
  
  const avg = mean(xs)
  const squareDiffs = xs.map(x => Math.pow(x - avg, 2))
  const avgSquareDiff = mean(squareDiffs)
  
  return Math.sqrt(avgSquareDiff)
}

/**
 * 外れ値を除外
 * @param xs 数値配列
 * @param threshold P99を超える値を除外するかどうか
 * @returns 外れ値を除外した配列
 */
export function removeOutliers(xs: number[], threshold: boolean = true): number[] {
  if (!threshold || xs.length < 10) return xs
  
  const p99Value = p99(xs)
  return xs.filter(x => x <= p99Value)
}

/**
 * ビュー目標値を計算
 * @param views ビュー数の配列
 * @param outlierFilter 外れ値フィルタを適用するか
 * @returns 目標値オブジェクト
 */
export interface ViewGoals {
  baseGoal: number
  stretchGoal: number
  mean: number
  median: number
  p90: number
  max: number
  sampleCount: number
}

export function calculateViewGoals(views: number[], outlierFilter: boolean = true): ViewGoals {
  // 元の最大値を保持（外れ値フィルタ前）
  const originalMax = max(views)
  const originalSampleCount = views.length
  
  // 外れ値を除外（統計計算用）
  const filteredViews = removeOutliers(views, outlierFilter)
  
  // サンプル数が少ない場合のフォールバック
  if (originalSampleCount < 10) {
    const avgValue = mean(filteredViews)
    
    return {
      baseGoal: Math.ceil(avgValue),
      stretchGoal: Math.ceil(originalMax * 0.8),
      mean: Math.ceil(avgValue),
      median: Math.ceil(median(filteredViews)),
      p90: Math.ceil(p90(filteredViews)),
      max: Math.ceil(originalMax), // 常に元の最大値を使用
      sampleCount: originalSampleCount // ビューが1以上ある記事数
    }
  }
  
  // 通常の計算
  const medianValue = median(filteredViews)
  const p90Value = p90(filteredViews)
  
  return {
    baseGoal: Math.ceil(medianValue),
    stretchGoal: Math.ceil(p90Value),
    mean: Math.ceil(mean(filteredViews)),
    median: Math.ceil(medianValue),
    p90: Math.ceil(p90Value),
    max: Math.ceil(originalMax), // 常に元の最大値を使用
    sampleCount: originalSampleCount // ビューが1以上ある記事数
  }
}