# フロントエンドコンポーネントとページ構造

## ページ構造

### 1. ホームページ (`/`)
**ファイル**: `app/page.tsx`

**構成**:
- MainLayout（右サイドバー非表示）
- HomeContent: メインコンテンツ
  - AITrainingLP: AI研修のランディングページ

**特徴**:
- AI研修サービスの紹介
- ヒーローセクション（アニメーション背景）
- サービス概要カルーセル
- 対象者カード
- お問い合わせ/資料ダウンロードCTA

---

### 2. プロジェクト一覧 (`/projects`)
**ファイル**: `app/projects/page.tsx`

**主要コンポーネント**:
- ProjectsClient: クライアントサイドコンポーネント
  - カテゴリフィルタ（All, Homepage, Landing Page, Web App, Mobile App, Video）
  - ProjectCard: プロジェクトカード
  - ProjectGridSkeleton: ローディング状態

**データ取得**:
- Server Component内でSupabaseから取得
- カテゴリ別フィルタ機能

---

### 3. プロジェクト詳細 (`/projects/[id]`)
**ファイル**: `app/projects/[id]/page.tsx`

**主要機能**:
- プロジェクト詳細情報表示
- VideoPlayer: 動画埋め込み（video_url）
- プロンプト請求リンク (`/projects/[id]/prompt`)
- 関連サービス表示（右サイドバー）
- OGP画像動的生成 (`opengraph-image.tsx`)

**動的メタデータ**:
```typescript
export async function generateMetadata({ params }): Promise<Metadata> {
  // プロジェクト情報からメタデータ生成
}
```

---

### 4. プロンプト請求 (`/projects/[id]/prompt`)
**ファイル**: `app/projects/[id]/prompt/page.tsx`

**主要コンポーネント**:
- PromptRequestClient: フォームコンポーネント
  - 会社名、お名前、メールアドレス、電話番号
  - 部署、役職、メッセージ

**処理**:
- POST `/api/prompt-request`
- 成功時: 完了ページへリダイレクト

---

### 5. コラム一覧 (`/columns`)
**ファイル**: `app/columns/page.tsx`

**主要コンポーネント**:
- ColumnsClient: クライアントサイドコンポーネント
  - カテゴリタブ（全て、AIツール、業界動向、トピックス・ニュース）
  - 注目記事セクション
  - 記事一覧グリッド

**データ取得**:
- Server Component内でSupabaseから取得
- is_published = true
- カテゴリフィルタ

---

### 6. コラム詳細 (`/columns/[id]`)
**ファイル**: `app/columns/[id]/page.tsx`

**主要機能**:
- リッチテキスト表示（TipTap HTML）
- TableOfContents: 自動生成目次
- AudioPlayer: 音声再生（audio_url）
- ビュー目標表示（base_goal, stretch_goal）
- 関連サービス表示（右サイドバー）
- OGP画像動的生成

**ColumnStyles**:
- TipTapで生成されたHTMLのスタイリング
- タイポグラフィ、リスト、テーブル、コードブロック

---

### 7. ドキュメント一覧 (`/documents`)
**ファイル**: `app/documents/page.tsx`

**主要機能**:
- 注目資料セクション（is_featured = true）
- 資料一覧グリッド
- 資料請求リンク

---

### 8. 資料請求 (`/documents/request/[id]`)
**ファイル**: `app/documents/request/[id]/page.tsx`

**主要コンポーネント**:
- DocumentRequestClient: フォームコンポーネント

**処理**:
- POST `/api/document-request`
- 成功時: `/documents/request/complete` へリダイレクト

---

### 9. お知らせ一覧 (`/notices`)
**ファイル**: `app/notices/page.tsx`

**主要コンポーネント**:
- NoticesClient: クライアントサイドコンポーネント
  - カテゴリフィルタ
  - お知らせカード

---

### 10. お知らせ詳細 (`/notices/[id]`)
**ファイル**: `app/notices/[id]/page.tsx`

**特徴**:
- site_urlがある場合は外部リンクへリダイレクト
- ない場合は詳細ページ表示

---

### 11. サービスページ (`/services/*`)

**共通構造** (`ServiceTrainingLP`):
1. ヒーローセクション
2. サービス概要（3項目）
3. 中間CTA
4. カリキュラム
5. 研修のメリット
6. 対象者
7. 研修形式
8. 導入フロー
9. FAQ
10. 料金プラン
11. 最終CTA
12. 他の研修プログラム

**サービスページ一覧**:
- `/services/comprehensive-ai-training` - 生成AI総合研修
- `/services/ai-writing-training` - AIライティング研修
- `/services/ai-video-training` - AI動画生成研修
- `/services/ai-coding-training` - AIコーディング研修
- `/services/practical-ai-training` - 生成AI実務活用研修
- `/services/ai-talent-development` - AI人材育成所

**データファイル**:
- `app/lib/services/data/comprehensive-ai-training.ts`
- `app/lib/services/data/ai-writing-training.ts`
- `app/lib/services/data/ai-video-training.ts`
- `app/lib/services/data/ai-coding-training.ts`
- `app/lib/services/data/practical-ai-training.ts`
- `app/lib/services/data/ai-talent-development.ts`

---

### 12. お問い合わせ (`/contact`)
**ファイル**: `app/contact/page.tsx`

**主要機能**:
- お問い合わせフォーム
- お問い合わせ種別選択
- ContactCompletionModal: 送信完了モーダル

**処理**:
- POST `/api/contact`
- Slack通知送信

---

### 13. ログイン (`/login`)
**ファイル**: `app/login/page.tsx`

**主要コンポーネント**:
- LoginForm: ログインフォーム

**認証**:
- Supabase Auth（メール/パスワード）
- Server Actions (`app/login/actions.ts`)

---

### 14. 管理画面 (`/admin`)
**ファイル**: `app/admin/page.tsx`

**レイアウト**:
- AdminSidebar: サイドバーナビゲーション
- AdminHeader: ヘッダー

**機能**:
- GoogleAnalyticsDashboard: GA4ダッシュボード
- UserActivityTrend: ユーザー活動トレンド

**サブページ**:
- `/admin/projects` - プロジェクト管理
- `/admin/projects/new` - プロジェクト新規作成
- `/admin/projects/[id]/edit` - プロジェクト編集
- `/admin/columns` - コラム管理
- `/admin/columns/new` - コラム新規作成
- `/admin/columns/[id]/edit` - コラム編集
- `/admin/documents` - ドキュメント管理
- `/admin/notices` - お知らせ管理
- `/admin/contacts` - お問い合わせ管理
- `/admin/analytics/column-goals` - コラム目標管理

---

## 主要コンポーネント

### レイアウトコンポーネント

#### MainLayout
**ファイル**: `app/components/MainLayout.tsx`

**Props**:
```typescript
{
  children: React.ReactNode
  hideRightSidebar?: boolean
}
```

**構成**:
- Header: グローバルヘッダー
- Sidebar: 左サイドバー（ナビゲーション）
- RightSidebar: 右サイドバー（動的コンテンツ）
- FloatingButtons: フローティングボタン
- Footer: フッター

---

#### Header
**ファイル**: `app/components/Header.tsx`

**機能**:
- ロゴ表示
- グローバルナビゲーション
- レスポンシブ対応（モバイルメニュー）

---

#### Sidebar
**ファイル**: `app/components/Sidebar.tsx`

**ナビゲーション項目**:
- ホーム
- 実績紹介
- サービス
- コラム
- お知らせ
- 資料ダウンロード
- お問い合わせ

---

#### RightSidebar
**ファイル**: `app/components/RightSidebar.tsx`

**動的コンテンツ**:
- 注目プロジェクト
- 最新コラム
- 最新お知らせ
- 資料ダウンロード

**DynamicRightSidebar**:
- ページ別のカスタムサイドバー
- 関連サービス表示（プロジェクト/コラム詳細）

---

### UIコンポーネント

#### ProjectCard
**ファイル**: `app/components/ProjectCard.tsx`

**Props**:
```typescript
{
  project: Project
  onClick?: () => void
}
```

**表示内容**:
- サムネイル画像
- タイトル
- 説明
- 技術スタック
- カテゴリバッジ

---

#### ColumnStyles
**ファイル**: `app/components/ColumnStyles.tsx`

**用途**: TipTapで生成されたHTMLのスタイリング

**スタイル適用**:
- 見出し（h1-h6）
- 段落
- リスト（ul, ol）
- テーブル
- コードブロック
- 引用
- リンク
- 画像

---

#### TableOfContents
**ファイル**: `app/components/TableOfContents.tsx`

**機能**:
- HTML内のh2, h3タグから目次を自動生成
- アンカーリンク生成
- スクロール時のアクティブ状態管理

---

#### AudioPlayer / AudioPlayerWrapper
**ファイル**: `app/columns/AudioPlayer.tsx`, `AudioPlayerWrapper.tsx`

**機能**:
- .m4a音声ファイルの再生
- 再生/一時停止
- シークバー
- 再生速度調整

---

#### ShareButton
**ファイル**: `app/components/ShareButton.tsx`

**機能**:
- Web Share API対応
- フォールバック（Twitter, Facebook, LINE）

---

#### ContactButton
**ファイル**: `app/components/ContactButton.tsx`

**機能**:
- お問い合わせページへのリンク
- フローティングボタン表示

---

#### FloatingButtons
**ファイル**: `app/components/FloatingButtons.tsx`

**機能**:
- お問い合わせボタン
- ページトップへ戻るボタン

---

### 管理画面コンポーネント

#### ProjectForm
**ファイル**: `app/admin/projects/ProjectForm.tsx`

**機能**:
- プロジェクト作成/編集フォーム
- サムネイル画像アップロード
- 動画ファイルアップロード（Supabase Storage）
- プロンプトファイルアップロード
- サービスセレクター（企業向け/個人向け）

---

#### RichTextEditor (TipTap)
**ファイル**: `app/admin/columns/RichTextEditor.tsx`

**拡張機能**:
- StarterKit（基本機能）
- Image（画像挿入）
- Link（リンク）
- TextAlign（テキスト整列）
- Underline（下線）
- Color（文字色）
- Highlight（ハイライト）
- Placeholder（プレースホルダー）
- Button（カスタム拡張: ボタン挿入）

**ツールバー機能**:
- 見出し（H2, H3）
- 太字、斜体、下線
- 箇条書き、番号付きリスト
- リンク挿入
- 画像挿入
- テキスト整列
- 文字色、ハイライト
- ボタン挿入

**ButtonExtension**:
- カスタムボタン要素の挿入
- `<button-component>`タグで保存
- テキスト、URL、スタイル設定可能

---

#### ColumnForm
**ファイル**: `app/admin/columns/ColumnForm.tsx`

**機能**:
- コラム作成/編集フォーム
- RichTextEditor統合
- サムネイル画像アップロード
- 音声ファイルアップロード（.m4a）
- カテゴリ選択
- タグ入力
- SEO設定
- サービスセレクター

---

#### DocumentForm
**ファイル**: `app/admin/documents/DocumentForm.tsx`

**機能**:
- ドキュメント作成/編集フォーム
- サムネイル画像アップロード
- PDFファイルアップロード

---

#### NoticeForm
**ファイル**: `app/admin/notices/NoticeForm.tsx`

**機能**:
- お知らせ作成/編集フォーム
- サムネイル画像アップロード
- カテゴリ選択
- 外部リンク設定

---

#### GoogleAnalyticsDashboard
**ファイル**: `app/admin/GoogleAnalyticsDashboard.tsx`

**機能**:
- GA4データの可視化
- ユーザー活動トレンド（recharts）
- 期間選択（7日、30日、90日）
- メトリクス表示（アクティブユーザー、新規ユーザー、セッション/ユーザー）

---

#### TopColumnsList
**ファイル**: `app/admin/analytics/column-goals/TopColumnsList.tsx`

**機能**:
- コラム記事のビュー目標一覧
- base_goal, stretch_goal表示
- 目標再計算ボタン

---

### スケルトンコンポーネント

#### ProjectCardSkeleton
**ファイル**: `app/components/skeletons/ProjectCardSkeleton.tsx`

#### ColumnCardSkeleton
**ファイル**: `app/components/skeletons/ColumnCardSkeleton.tsx`

#### DocumentCardSkeleton
**ファイル**: `app/components/skeletons/DocumentCardSkeleton.tsx`

#### RightSidebarSkeleton
**ファイル**: `app/components/skeletons/RightSidebarSkeleton.tsx`

---

## 背景エフェクトコンポーネント

### NeuralShaderBackground
**ファイル**: `app/components/ui/neural-shader-background.tsx`

**技術**: WebGL / GLSL Shader
**用途**: ヒーローセクションの背景アニメーション

### PlasmaBackground
**ファイル**: `app/components/ui/plasma-background.tsx`

**技術**: WebGL / GLSL Shader
**用途**: サービスページの背景

### CSSNeuralBackground
**ファイル**: `app/components/ui/css-neural-background.tsx`

**技術**: CSS Animation
**用途**: 軽量な背景アニメーション

---

## レスポンシブ対応

### ブレークポイント
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

### モバイル対応
- MobileHeader: モバイル用ヘッダー
- ハンバーガーメニュー
- タッチ操作対応
- フローティングボタン位置調整

---

## アクセシビリティ

### ARIA属性
- `aria-label`: ボタン、リンクの説明
- `aria-hidden`: 装飾要素の非表示
- `role`: セマンティックな役割定義

### キーボードナビゲーション
- タブキーでのフォーカス移動
- Enterキーでのアクション実行
- Escapeキーでのモーダルクローズ

### SEO最適化
- 動的メタデータ生成
- 構造化データ（JSON-LD）
- OGP画像動的生成
- サイトマップ生成 (`app/sitemap.ts`)
