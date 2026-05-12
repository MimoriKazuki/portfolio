# API クライアント設計

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装完了後に `app/lib/api/**` / `app/lib/supabase/**` / 各 `actions.ts` の実装パスを記載）

## 概要

Eラーニング刷新スコープにおける FE 側 API クライアントの設計。
書き込みは原則 Server Actions、複雑な統合（Stripe Webhook）と外部呼び出しは Route Handler を採用する。
読み取りは Server Component で Supabase クライアント直接利用が基本。クライアントから直接 Supabase を叩くケースは最小化する。

**重要**：本ドキュメントは「FE 側から見た呼び出し口」を整理するもので、エンドポイント本体の仕様確定は be-plan-mate が `docs/api/endpoints/` で行う。本書では FE から呼び出すサーフェスのみ記述する。

## 使用場面・責務

### 0. クライアント／サーバーの呼び出し境界

| 種別 | 利用方法 | 主な対象 |
|------|---------|---------|
| Supabase（Server Component） | `createClient()`（既存 `app/lib/supabase/server.ts`） | 公開・会員ページの読み取り |
| Supabase（Static） | `createStaticClient()`（既存 `app/lib/supabase/static.ts`） | カテゴリ等のキャッシュ可な読み取り |
| Supabase（Client） | `createClient()`（既存 `app/lib/supabase/client.ts`） | 楽観 UI（ブックマーク toggle 等・最小限） |
| Server Actions | `'use server'` 関数 | ブックマーク／進捗／管理 CRUD／Checkout Session 発行 |
| Route Handler（Webhook） | `app/api/stripe/webhook/route.ts` 等（BE 側担当） | Stripe Webhook 受信 |
| Route Handler（任意） | `app/api/e-learning/.../route.ts` | クライアントからの fetch が必要な場合（極力使わない） |

### 1. 読み取り（Server Component から）

Supabase クライアントで直接テーブル参照。詳細クエリ列・JOIN は画面要件に従う。

#### 1-1. 公開／LP（B001）

- カテゴリ（`is_active = true, deleted_at IS NULL`）
- 公開コース（`is_published = true, deleted_at IS NULL`）+ 章数・動画本数
- 公開単体動画（`is_published = true, deleted_at IS NULL`）

#### 1-2. 会員一覧（B002 / B003 / B006）

- 公開コース／単体動画一覧（フィルタ：カテゴリ、無料／有料、並び替え、ページ）
- ユーザーのブックマーク（`e_learning_bookmarks`）
- ユーザーの進捗（`e_learning_progress`：完了済 ID セット）
- ユーザーの `has_full_access`

#### 1-3. コース詳細（B004）

- コース本体 + カテゴリ
- 章一覧 + 章ごとの動画一覧（`is_free` 含む）
- コース直下の資料（`e_learning_materials.course_id`）
- ユーザーの購入状態（`(user_id, course_id)`）
- ユーザーの進捗（章内動画ごとの完了マップ）
- ユーザーのコースブックマーク（`(user_id, course_id)`）
- 関連コース（同カテゴリ）

#### 1-4. コース視聴（B005）

- コース＋章一覧（サイドバー用）
- 対象動画（`e_learning_course_videos.id`）
- コース直下の資料（タブ用）
- 視聴権限判定結果（横断ヘルパ）
- 進捗（コース全体マップ）

#### 1-5. 単体動画詳細／視聴（B007）

- 単体動画本体 + カテゴリ
- 単体動画直下の資料（`e_learning_materials.content_id`）
- ユーザーの購入状態（`(user_id, content_id)`）
- ユーザーの進捗（`(user_id, content_id)`）
- ユーザーの単体動画ブックマーク
- 関連単体動画

#### 1-6. マイページ（B011 / B012 / B013 / B014）

- B011：購入履歴（`e_learning_purchases` + 関連コース／動画名 + Stripe 領収書 URL）
- B012：ブックマーク（`e_learning_bookmarks` + コース／単体動画）
- B013：進捗（コース完了率 = 完了動画数 / コース動画総数、単体動画完了一覧）
- B014：`e_learning_users` レコード（プロフィール情報）

#### 1-7. 管理（C\*）

- C001：単体動画一覧（フィルタ：検索・カテゴリ・公開状態）
- C002/C003：単体動画 + 関連資料
- C004：カテゴリ一覧 + `deleted_at` 状態
- C005：コース一覧（フィルタ：検索・カテゴリ・公開状態）
- C006/C007：コース + 章 + 動画 + 資料
- C009：購入履歴（フィルタ：期間・ステータス・ユーザー・対象種別）
- C010：ユーザー一覧（検索 + フルアクセスフラグ）
- C011：レガシー購入（読み取り専用）

### 2. 書き込み（Server Actions）

FE が呼び出す Server Action の名前を仮置き。実装詳細・引数・戻り値は be-plan-mate の `docs/api/endpoints/` で確定する。

#### 2-1. 会員操作

| Action 名（仮） | 用途 | 入力（仮） | 出力（仮） |
|---------------|------|-----------|-----------|
| `toggleCourseBookmark` | コースブックマーク追加／削除 | `courseId` | `{ bookmarked: boolean }` |
| `toggleContentBookmark` | 単体動画ブックマーク追加／削除 | `contentId` | `{ bookmarked: boolean }` |
| `markCourseVideoCompleted` | コース内動画の視聴完了登録 | `courseVideoId` | `{ ok: true }` |
| `markContentCompleted` | 単体動画の視聴完了登録 | `contentId` | `{ ok: true }` |
| `requestCourseCheckout` | コース買い切りの Stripe Checkout Session 発行 | `courseId` | `{ url: string }` |
| `requestContentCheckout` | 単体動画買い切りの Stripe Checkout Session 発行 | `contentId` | `{ url: string }` |
| `requestUserWithdraw` | 退会申請（マスキング処理 + Supabase Auth セッション破棄） | （なし） | `{ ok: true, redirectTo: '/e-learning' }`（FE は受領後 LP（B001）へリダイレクト） |

#### 2-2. 管理操作

| Action 名（仮） | 用途 | 入力（仮） |
|---------------|------|-----------|
| `createCourse` / `updateCourse` / `softDeleteCourse` / `publishCourse` | コース CRUD・公開切替 | フォーム値 |
| `createCourseChapter` / `updateCourseChapter` / `deleteCourseChapter` / `reorderCourseChapters` | 章 CRUD・並び替え | 章 ID / `course_id` / 新順序配列 |
| `createCourseVideo` / `updateCourseVideo` / `deleteCourseVideo` / `reorderCourseVideos` / `toggleCourseVideoFree` | 章内動画 CRUD・並び替え | 動画 ID 等 |
| `createContent` / `updateContent` / `softDeleteContent` / `publishContent` | 単体動画 CRUD | フォーム値 |
| `createCategory` / `updateCategory` / `softDeleteCategory` | カテゴリ CRUD | フォーム値 |
| `createMaterial` / `updateMaterial` / `deleteMaterial` / `reorderMaterials` | 資料 CRUD | フォーム値 + ファイル |
| `setUserHasFullAccess` | フルアクセス切替 | `userId`, `value` |
| `listUserPurchases` | 指定ユーザーの購入履歴一覧取得（C010 フルアクセス管理の詳細表示で利用・対応エンドポイント：`GET /api/admin/users/:id/purchases`・レスポンスは `GET /api/admin/purchases` と同形式で `user_id` 絞り込み済） | `userId` |
| `listPurchasesForCsv` | 購入履歴 CSV エクスポート（**Phase 1 任意**） | フィルタ |

> **Phase 1 任意機能の整合**：CSV エクスポートは Phase 1 では任意機能。実装する場合は BE 側に `GET /api/admin/purchases/export.csv`（または同等の Route Handler）を追加する必要があり、FE から `listPurchasesForCsv` 経由で呼ぶ。Phase 1 スコープに含めない場合、本 Action 自体を実装せず、画面（C009）の CSV ボタンも非表示で良い。BE/FE 間の整合は plan-lead が仲介する。

#### 2-3. 横断ヘルパ（FE 側ユーティリティ・サーバー実行）

- `getViewableStatus({ user, target })`：横断視聴権限判定（`has_full_access` / 購入済 / `is_free` の優先順位）
- `requireE_LearningUser()`：認証 + `e_learning_users` 取得・未存在時は作成
- `bundleMaterialsZip(courseId)` / `bundleMaterialsZip(contentId)`：zip 一括 DL（業務分析 M1）。実装は Route Handler（ストリーム返却）にする可能性あり

### 3. Route Handler（FE が直接 fetch するケース）

原則 Server Action 優先だが、以下のみ Route Handler を許容：

| ルート | 用途 | 備考 |
|-------|------|------|
| `/api/stripe/webhook` | Stripe Webhook 受信 | BE 側担当（FE は呼ばない） |
| `/api/e-learning/materials/download` | 単体資料／zip 一括 DL のストリーム | クエリ：`courseId` or `contentId` / 認可：視聴権限と同等 |

### 4. クライアント側 Supabase の利用範囲

最小限とする。具体的には：
- ブックマーク・進捗の楽観 UI 経路（既存 `ELearningDetailClient` 踏襲）
- リアルタイム購読は Phase 1 では使わない（ユーザー数規模・要件に対し過剰）

書き込みはなるべく Server Action 経由に揃え、RLS の検証を強化する。

### 5. クライアントの fetch ヘルパ

Phase 2 で `app/lib/api/` 下に薄いラッパを置く想定。Phase 1 では構造のみ提示：

- `client/bookmarks.ts`：toggle 系
- `client/progress.ts`：mark 系
- `client/checkout.ts`：Stripe URL 取得
- `admin/courses.ts` / `admin/chapters.ts` / `admin/videos.ts` / `admin/contents.ts` / `admin/categories.ts` / `admin/materials.ts` / `admin/purchases.ts` / `admin/users.ts`

実装方針：それぞれ Server Action を呼ぶだけのシン薄ラッパ。エラーは throw、UI 側で toast 表示。

### 6. Phase 1 スコープ外（呼び出し口を作らない）

N10 確定により、以下は **Phase 1 スコープ外** とする（FE 側に呼び出し口を作らない・BE 側 H-8 も削除予定）：

- `GET /api/admin/dashboard/summary`（コース別売上・受講者数・進捗集計サマリ）
- `GET /api/admin/dashboard/courses/:id/progress`（コース別の受講進捗集計）
- その他 Eラーニング専用の管理者ダッシュボード／集計向け API・Server Action 全般

代替方針：
- 既存の GA4 ベース管理画面（`/admin/analytics/*` 等）を継続利用
- 売上・購入数の確認は C009 購入履歴一覧のフィルタ + CSV エクスポート（軽微4 参照）で代替
- 将来必要になった場合は Phase 2 以降で plan-lead 経由で別途設計

## NG

- クライアントから Supabase で書き込みを実装しない（Server Action 経由に揃える・最小例外あり）
- 視聴権限判定をクライアント単独で行わない
- Stripe Price ID をクライアントに直書きしない（DB の `stripe_price_id` を参照）
- Route Handler を増やさない（必要最小限）。新設は plan-lead 経由で be-plan-mate と協議
- `revalidatePath` の対象を細かく指定し、過剰な失効を避ける
- 横断視聴権限ヘルパを各画面で再実装しない（一箇所に集約）

---

## 参照

- 状態管理：`docs/frontend/state-management/stores.md`
- ルーティング：`docs/frontend/routing/routes.md`
- 物理設計：`docs/backend/database/schema.dbml`
- BE API 設計（be-plan-mate 側）：`docs/api/endpoints/`（作成中）
- 既存 Supabase ヘルパ：`app/lib/supabase/server.ts` / `static.ts` / `client.ts` / `middleware.ts`
