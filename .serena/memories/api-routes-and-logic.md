# APIルートとビジネスロジック

## APIルート一覧

### 1. POST /api/contact
**ファイル**: `app/api/contact/route.ts`

**機能**: お問い合わせフォームからの送信を処理

**リクエストボディ**:
```typescript
{
  name: string
  company?: string
  email: string
  message: string
  inquiry_type?: 'service' | 'partnership' | 'recruit' | 'other'
}
```

**処理フロー**:
1. バリデーション（必須フィールド、メール形式）
2. Supabaseのcontactsテーブルに保存
3. Slack Webhook経由で通知送信
4. レスポンス返却

**Slack通知内容**:
- お名前、会社名、メールアドレス
- メッセージ本文
- 送信日時（JST）

**エラーハンドリング**:
- 必須項目不足: 400エラー
- メール形式不正: 400エラー
- DB保存失敗: 500エラー
- Slack送信失敗: ログ出力（処理継続）

---

### 2. GET /api/projects
**ファイル**: `app/api/projects/route.ts`

**機能**: プロジェクト一覧取得

**クエリパラメータ**:
- `category`: プロジェクトカテゴリでフィルタ

**レスポンス**:
```typescript
{
  projects: Project[]
}
```

**ソート順**: `display_order` ASC

---

### 3. GET /api/notices
**ファイル**: `app/api/notices/route.ts`

**機能**: 公開済みお知らせ一覧取得

**フィルタ条件**:
- `is_published = true`

**ソート順**: `published_date` DESC

---

### 4. GET /api/columns
**ファイル**: `app/api/columns/route.ts`

**機能**: 公開済みコラム一覧取得

**クエリパラメータ**:
- `category`: コラムカテゴリでフィルタ
- `featured`: 注目記事のみ取得

**フィルタ条件**:
- `is_published = true`

**ソート順**: `published_date` DESC

---

### 5. POST /api/document-request
**ファイル**: `app/api/document-request/route.ts`

**機能**: 資料請求の受付

**リクエストボディ**:
```typescript
{
  document_id: string
  company_name: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  message?: string
}
```

**処理フロー**:
1. バリデーション
2. document_requestsテーブルに保存
3. documentsテーブルのdownload_count更新
4. レスポンス返却

---

### 6. POST /api/prompt-request
**ファイル**: `app/api/prompt-request/route.ts`

**機能**: プロジェクトのプロンプト請求

**リクエストボディ**:
```typescript
{
  project_id: string
  company_name: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  message?: string
}
```

**処理**: document-requestと類似

---

### 7. GET /api/analytics/user-activity
**ファイル**: `app/api/analytics/user-activity/route.ts`

**機能**: Google Analytics 4からユーザー活動データ取得

**クエリパラメータ**:
- `days`: 集計期間（デフォルト: 7日間）

**レスポンス**:
```typescript
{
  dates: string[]
  activeUsers: number[]
  newUsers: number[]
  sessionsPerUser: number[]
}
```

**GA4 Metrics**:
- `activeUsers`: アクティブユーザー数
- `newUsers`: 新規ユーザー数
- `sessionsPerUser`: ユーザーあたりセッション数

**Dimensions**:
- `date`: 日付

---

### 8. GET /api/analytics/column/goals
**ファイル**: `app/api/analytics/column/goals/route.ts`

**機能**: コラム記事のビュー目標データ取得

**レスポンス**:
```typescript
{
  scope: string
  base_goal: number
  stretch_goal: number
  mean: number
  median: number
  p90: number
  max: number
  sample_count: number
  computed_at: string
}[]
```

**データソース**: content_goalsテーブル

---

### 9. POST /api/analytics/column/recompute
**ファイル**: `app/api/analytics/column/recompute/route.ts`

**機能**: コラム記事のビュー目標を再計算

**リクエストボディ**:
```typescript
{
  scope: string  // 'column_all' または 'article:/columns/[id]'
}
```

**処理フロー**:
1. GA4から過去30日間のデータ取得
2. ボットトラフィック除外
3. 外れ値フィルタリング（99パーセンタイル以上）
4. 統計値計算（mean, median, p90, max）
5. base_goal = median, stretch_goal = p90として設定
6. content_goalsテーブルに保存またはアップデート

**計算パラメータ**:
- `range_days`: 30日
- `exclude_bot_traffic`: true
- `outlier_filter`: true
- `filter_regex`: scope別のパスパターン

---

### 10. GET /api/analytics/column/distribution
**ファイル**: `app/api/analytics/column/distribution/route.ts`

**機能**: コラムページビューの分布データ取得（デバッグ用）

---

### 11. GET /api/analytics/column/all-paths
**ファイル**: `app/api/analytics/column/all-paths/route.ts`

**機能**: すべてのコラムページパスを取得（デバッグ用）

---

## ビジネスロジック

### Google Analytics 4連携

**ライブラリ**: `app/lib/google-analytics.ts`, `app/lib/ga4-column-analytics.ts`

**認証**:
- Service Accountキー（環境変数: `GOOGLE_APPLICATION_CREDENTIALS`）
- Property ID: 438842851

**主要関数**:

#### `getAnalyticsData()`
GA4からデータ取得の基本関数

```typescript
async function getAnalyticsData(
  startDate: string,
  endDate: string,
  metrics: string[],
  dimensions?: string[]
): Promise<any[]>
```

#### `computeColumnGoals()`
コラム記事のビュー目標を計算

```typescript
async function computeColumnGoals(
  scope: string,
  rangeDays: number = 30,
  excludeBotTraffic: boolean = true,
  outlierFilter: boolean = true
): Promise<GoalMetrics>
```

**計算ロジック**:
1. GA4 Data API経由でデータ取得
   - Metric: `screenPageViews`
   - Dimension: `pagePath`
   - Filter: scope別のパスパターン
   - Date Range: 過去30日間

2. データクリーニング
   - ボットトラフィック除外（User-Agentフィルタ）
   - 外れ値除外（99パーセンタイル以上）

3. 統計値計算
   - `mean`: 平均値
   - `median`: 中央値（50パーセンタイル）
   - `p90`: 90パーセンタイル
   - `max`: 最大値
   - `sample_count`: サンプル数

4. 目標設定
   - `base_goal` = `median`
   - `stretch_goal` = `p90`

### Supabaseクライアント

**ファイル構成**:
- `app/lib/supabase/client.ts`: クライアントサイド用
- `app/lib/supabase/server.ts`: サーバーサイド用（Cookie対応）
- `app/lib/supabase/middleware.ts`: ミドルウェア用（セッション更新）
- `app/lib/supabase/static.ts`: 静的サイト生成用

**使い分け**:
- Client Components: `createClient()` from `client.ts`
- Server Components, API Routes: `createClient()` from `server.ts`
- Middleware: `updateSession()` from `middleware.ts`
- Static Site Generation: `createClient()` from `static.ts`

### サービスセレクター

**ファイル**: `app/lib/services/service-selector.ts`

**目的**: プロジェクト/コラムに紐付けられたサービスを取得

**主要関数**:

```typescript
// サービスIDからサービス情報を取得
function getServiceById(serviceId: string): OtherTrainingProgram | undefined

// プロジェクト/コラムの関連サービスを取得
function getSelectedServices(
  enterpriseServiceId?: string,
  individualServiceId?: string
): {
  enterprise: OtherTrainingProgram | undefined
  individual: OtherTrainingProgram | undefined
}
```

**デフォルト値**:
- `DEFAULT_ENTERPRISE_SERVICE`: 'comprehensive-ai-training'
- `DEFAULT_INDIVIDUAL_SERVICE`: 'individual-coaching'

### 研修プログラムデータ

**ファイル**: `app/lib/services/training-programs.ts`

**全研修プログラム**:
1. comprehensive-ai-training（生成AI総合研修）- 法人
2. ai-writing（AIライティング研修）- 法人
3. ai-video（AI動画生成研修）- 法人
4. ai-coding（AIコーディング研修）- 法人
5. practical-ai（生成AI実務活用研修）- 法人
6. individual-coaching（AI人材育成所）- 個人

**主要関数**:

```typescript
// 現在のページ以外の研修プログラムを取得
function getOtherTrainingPrograms(currentPageId: string): OtherTrainingProgram[]

// 他研修プログラムセクション用データ生成
function generateOtherTrainingProgramsData(currentPageId: string)
```

### ユーティリティ関数

**ファイル**: `app/lib/utils.ts`

```typescript
// Tailwind CSSクラスの結合
function cn(...inputs: ClassValue[]): string
```

**ファイル**: `app/lib/stats.ts`

```typescript
// 統計値計算
function calculatePercentile(values: number[], percentile: number): number
function calculateMean(values: number[]): number
function calculateMedian(values: number[]): number
```
