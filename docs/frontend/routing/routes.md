# ルーティング設計

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装完了後に `app/e-learning/**` と `app/admin/e-learning/**` の Route 構成を記載）

## 概要

Eラーニング刷新スコープにおけるルート設計。Next.js 15.5 App Router を採用。
既存稼働中のルート構成を踏襲しつつ、コース機能・マイページ・管理画面拡張を追加する。
スコープ外（projects / columns / documents / contacts / youtube_videos 等）は既存のまま維持。

## 使用場面・責務

- 各画面 ID（`screens.md` の A-D）の URL を一元管理
- middleware による認証ガードの境界を明示
- ログイン誘導 `returnTo` クエリの仕様統一

## ルール・ビジネスロジック

### 公開（未ログイン可）

| ルート | 画面 ID | レンダリング | 備考 |
|-------|--------|------------|------|
| `/e-learning` | B001（LP） | `force-dynamic`（ログイン状態で出し分けるため） | 未ログイン：LP 表示／ログイン済：`/e-learning/home` へリダイレクト |
| `/auth/login` | A001 | Server Component + Client Form | `returnTo` クエリ対応 |
| `/auth/callback` | A002 | Route Handler（既存） | OAuth コールバック処理 |

### 認証必須（一般ユーザー）

middleware で `auth.users` セッションを必須化する範囲：

| ルート | 画面 ID | 備考 |
|-------|--------|------|
| `/e-learning/home` | B002 | コース＋単体動画の統合ホーム |
| `/e-learning/courses` | B003 | コース一覧 |
| `/e-learning/courses/[slug]` | B004 | コース詳細（slug は `e_learning_courses.slug`） |
| `/e-learning/courses/[slug]/videos/[videoId]` | B005 | コース内動画視聴（videoId は `e_learning_course_videos.id`） |
| `/e-learning/videos` | B006 | 単体動画一覧 |
| `/e-learning/[id]` | B007 | 単体動画詳細／視聴（id は `e_learning_contents.id`・既存ルート維持） |
| `/e-learning/checkout/complete` | B009 | Stripe Checkout 完了後（session_id クエリ） |
| `/e-learning/checkout/cancel` | B010 | Stripe Checkout キャンセル後 |
| `/e-learning/mypage` | B014 | プロフィール |
| `/e-learning/mypage/purchases` | B011 | 購入履歴 |
| `/e-learning/mypage/bookmarks` | B012 | ブックマーク |
| `/e-learning/mypage/progress` | B013 | 視聴履歴 |

未認証で上記アクセス → `/auth/login?returnTo=<エンコード済 URL>` へリダイレクト。

### 管理者認証必須（`/admin/**` 既存ガード継続）

middleware は既存通り「auth.users セッション存在＝管理者」。Phase 1 でロール分離なし（確定事項 §9）。

| ルート | 画面 ID | 備考 |
|-------|--------|------|
| `/admin/e-learning` | C001 | 単体動画一覧（既存・整理） |
| `/admin/e-learning/new` | C002 | 単体動画 新規 |
| `/admin/e-learning/[id]/edit` | C003 | 単体動画 編集 |
| `/admin/e-learning/categories` | C004 | カテゴリ管理 |
| `/admin/e-learning/courses` | C005 | コース一覧 |
| `/admin/e-learning/courses/new` | C006 | コース 新規 |
| `/admin/e-learning/courses/[id]/edit` | C007 | コース 編集（C008 カリキュラム編集タブ含む） |
| `/admin/e-learning/purchases` | C009 | 購入履歴 |
| `/admin/e-learning/users` | C010 | フルアクセス管理 |
| `/admin/e-learning/legacy-purchases` | C011 | レガシー購入（読み取り専用） |

### Phase 1 スコープ外（管理側で新規ルートを追加しない）

N10 確定により、以下は **Phase 1 で新規追加しない**：

- `/admin/e-learning/dashboard`（コース別売上・受講者数・進捗集計サマリ画面）
- `/admin/e-learning/analytics/*`（Eラーニング専用集計画面群）

→ 既存の GA4 ベース管理画面（`/admin/analytics/*` 等）を継続利用する。必要な売上・購入数の確認は C009 購入履歴一覧のフィルタ + CSV エクスポートで代替する。

### returnTo クエリ仕様

- 未ログインで認証必須ルートに到達 → middleware が `307` リダイレクト `/auth/login?returnTo=<元 URL のパス + クエリ>` を返す
- `/auth/callback` 後に `returnTo` 値が安全（同一オリジン・パスのみ）か検証して遷移
- 不正値・空値 → `/e-learning/home`

### 視聴権限不足時の挙動

- `/e-learning/courses/[slug]/videos/[videoId]` で視聴権限なし → サーバーで判定し `/e-learning/courses/[slug]?prompt=purchase` にリダイレクト → B004 が `prompt=purchase` を見て購入確認モーダルを自動 Open
- `/e-learning/[id]` で視聴権限なし → サーバーで判定し B007 の現状挙動（購入モーダル自動 Open）を継続

### 動的レンダリング方針

- LP（B001）／会員系（B002〜B014）：`force-dynamic`（ユーザー状態に依存）
- 管理系（C\*）：`force-dynamic`
- 既存 Stripe Webhook（Route Handler）は本書スコープ外（BE 側で管理）

### 既存ルートとの整合

- `/e-learning/courses` は既存・既存実装はリスト枠のみ → コース対応に再構築（B003）
- `/e-learning/[id]` は既存・既存実装は単体動画詳細 → 改修（B007）
- 新規追加ルート：
  - `/e-learning/home`
  - `/e-learning/videos`
  - `/e-learning/courses/[slug]`
  - `/e-learning/courses/[slug]/videos/[videoId]`
  - `/e-learning/checkout/complete`
  - `/e-learning/checkout/cancel`
  - `/e-learning/mypage`
  - `/e-learning/mypage/purchases`
  - `/e-learning/mypage/bookmarks`
  - `/e-learning/mypage/progress`
  - `/admin/e-learning/courses`
  - `/admin/e-learning/courses/new`
  - `/admin/e-learning/courses/[id]/edit`
  - `/admin/e-learning/purchases`
  - `/admin/e-learning/users`
  - `/admin/e-learning/legacy-purchases`

### middleware 改修ポイント

- 既存：`app/lib/supabase/middleware.ts` で `/admin` 配下のセッション必須化
- Phase 1 追加：
  - `/e-learning/home` 以下の認証必須ルートを `returnTo` リダイレクト付きでガード（`/e-learning`（LP）と `/auth/*` は除外）
  - middleware の判定はパス前方一致 + 公開ホワイトリスト方式に揃える（実装詳細は be-plan-mate の `auth/flow.md` と整合）

## NG

- ルートの直書き禁止：FE 共通の `routes.ts`（Phase 2 で作成）から参照する
- 視聴権限判定をクライアント側だけに任せない：Server Component / middleware で必ず一次判定する
- 既存ルート（`/e-learning/courses` / `/e-learning/[id]`）を Phase 1 で削除しない：互換維持しつつ機能改修
- middleware で `/admin` を非管理者に公開しない：既存挙動を維持

---

## 参照

- 画面一覧：`docs/frontend/screens.md`
- 既存 middleware：`middleware.ts` / `app/lib/supabase/middleware.ts`
- 認証フロー：（BE 側 `docs/api/auth/flow.md`：be-plan-mate 作成）
