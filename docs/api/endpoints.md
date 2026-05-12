# API エンドポイント定義（Phase 1）

> 担当：be-plan-mate
> 対象：Eラーニング刷新スコープ（コース＋単体動画の買い切りモデル）
> 前提：DB 物理設計（`docs/backend/database/schema.dbml`）／業務確定（`docs/phase1/gate1-confirmed-decisions.md`）を満たす
> 参照：認証フロー `docs/auth/flow.md` ／エラーコード `docs/error-handling/errors.md`

---

## 0. 共通仕様

### Base URL
- 開発環境：`http://localhost:3000/api`
- 本番環境：`https://www.landbridge.ai/api`

### 認証方式
- Supabase Auth セッション（Cookie 経由・既存 `middleware.ts` で `updateSession` を全パスに適用）
- Server-Side では `createClient` で `auth.getUser()` を用いてユーザー識別
- 詳細は `docs/auth/flow.md` を参照

### リクエスト形式
- Content-Type：`application/json`
- 文字コード：UTF-8

### レスポンス形式

成功時：
```json
{
  "data": { ... },
  "meta": { "page": 1, "per_page": 20, "total": 100 }
}
```

エラー時：
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title は必須です",
    "details": { "field": "title" }
  }
}
```

### ページング・フィルタ既定
- `page`：1 始まり（デフォルト 1）
- `per_page`：デフォルト 20、上限 100
- `sort`：`-created_at`（降順は `-` プレフィクス）

### URL 動詞の許容方針
- REST 原則は名詞ベースだが、以下のサブリソース URL は「操作の意味を明示するための動詞」として例外的に許容する：
  - `POST /api/courses/:slug/videos/:videoId/complete`（視聴完了マーク）
  - `POST /api/contents/:id/complete`（視聴完了マーク）
  - `GET  /api/contents/:id/play`（視聴用 URL 取得・副作用：view_count +1）
  - `POST /api/admin/courses/:courseId/reorder`（章・動画の並び順一括更新）
- 上記以外の業務 API は名詞 + HTTP メソッドで表現する。動詞 URL の追加は plan-lead に相談する。

### 日時パラメータ表記
- クエリ／レスポンスとも ISO 8601（例：`2026-05-12T01:23:45.000Z`）
- 期間フィルタの命名は `from` / `to`（含む両端） を基本とする

### 認証要件の表記
- `public`：未ログイン可
- `auth`：ログイン必須（`e_learning_users` 自動連携）
- `admin`：管理者必須（`auth.users` 存在＝管理者・ロール分離なし）
- `service`：サービス内部呼び出し（Stripe Webhook 等）

### コンテンツ視聴権限の優先順位（全エンドポイント共通）

```
① has_full_access = true → 全動画視聴可
② 対象コースの purchase（status=completed）あり → そのコース内動画視聴可
③ 対象単体動画の purchase（status=completed）あり → その単体動画視聴可
④ 対象動画の is_free = true → ログインユーザー全員視聴可
⑤ それ以外 → 403 FORBIDDEN_NO_ACCESS
```

未ログインの場合は 401 UNAUTHORIZED（LP のみ未ログイン可、それ以外の e-learning API はログイン必須）。

### エラーコード一覧
`docs/error-handling/errors.md` 参照。

---

## カテゴリ A：認証・自分自身

> 既存実装活用：`app/api/auth/logout`、`app/api/auth/user`、`app/auth/callback`、`app/auth/login`

### GET /api/auth/user
- 概要：現在ログイン中ユーザーのプロフィール取得
- 認証：auth
- レスポンス（200）：
  ```json
  {
    "data": {
      "id": "uuid",
      "auth_user_id": "uuid",
      "email": "user@example.com",
      "display_name": "山田太郎",
      "avatar_url": "https://...",
      "has_full_access": false,
      "is_active": true,
      "created_at": "2026-05-12T00:00:00Z"
    }
  }
  ```
- エラー：401 UNAUTHORIZED

### POST /api/auth/logout
- 概要：ログアウト（Supabase セッション破棄）
- 認証：auth
- リクエスト：なし
- レスポンス（200）：`{ "data": { "ok": true } }`
- エラー：401 UNAUTHORIZED

### POST /api/me/withdraw
- 概要：退会（`e_learning_users.deleted_at` セット ＋ 個人情報マスキング ＋ Supabase セッション破棄）
- 認証：auth
- リクエスト：なし（body 不要）
- 処理フロー：
  1. controllers で `auth.getUser` から `userId` 取得
  2. `user-service.withdraw(userId)` を呼ぶ（`deleted_at`／`display_name=NULL`／`avatar_url=NULL`／`is_active=false` を単一 UPDATE。email は L1 確定により保持＝マスキングしない）
  3. 成功後 `supabase.auth.signOut()` で Cookie をクリア（services 内では呼ばない・Controller の責務）
- レスポンス（200）：`{ "data": { "ok": true } }`
- 業務ルール：
  - 既に `deleted_at IS NOT NULL` のユーザーが呼んでも成功扱い（冪等・200 OK）
  - 購入履歴・進捗・ブックマーク等は保持（user-service.withdraw の責務範囲）
  - 再ログイン時は `user-service.syncFromAuth` 側で `deleted_at = null` に戻し履歴を引き継ぐ
- エラー：401 UNAUTHORIZED、500 INTERNAL_ERROR

### GET /api/me/access
- 概要：自分のアクセス権限サマリ（フルアクセス・購入済みコース/動画 ID 配列）
- 認証：auth
- クエリパラメータ：
  - `session_id?: string`（任意・Stripe Checkout Session ID）
    - 用途：B009「決済完了ページ」からのポーリングで、特定の Stripe Checkout Session に対応する購入レコードの反映状況を確認するため
    - 動作：通常レスポンスに加え、`session_status` フィールドを返す（後述）
    - 形式：`cs_` プレフィクスを持つ varchar(255) 想定。形式が極端に不正（空文字・極端な長さ）なら 400 VALIDATION_ERROR、それ以外は DB 検索の結果で判定
- レスポンス（200）：
  ```json
  {
    "data": {
      "has_full_access": false,
      "purchased_course_ids": ["uuid1", "uuid2"],
      "purchased_content_ids": ["uuid3"],
      "session_status": {
        "session_id": "cs_xxx",
        "reflected": true,
        "purchase": {
          "id": "uuid",
          "target_type": "course",
          "target_id": "uuid",
          "status": "completed"
        }
      }
    }
  }
  ```
- `session_status` の挙動：
  - `session_id` クエリ未指定 → `session_status` フィールドは返さない（オブジェクトキー自体を省略）
  - `session_id` 指定かつ `e_learning_purchases.stripe_session_id` に該当レコードが**当該ユーザーで**見つかる：
    - `reflected = true`、`purchase` に当該レコードの要約（`id` / `target_type` / `target_id` / `status`）をセット
    - FE は `reflected=true` を確認した時点でポーリングを終了し、コース／単体動画詳細へリダイレクト可
  - `session_id` 指定だが該当レコードが**まだ存在しない**（Webhook 未到達）：
    - `reflected = false`、`purchase = null`
    - FE はリトライ（既存 2 秒間隔・最大 N=10 回方針）
  - `session_id` が**他人の購入レコードに該当**する場合：他人レコードを覗かせないため `reflected = false` を返す（404 にはしない・存在隠蔽）
- 取得元：
  - `has_full_access`：`e_learning_users.has_full_access`（`user_id` = ログインユーザーの `e_learning_users.id`）
  - `purchased_course_ids`：`e_learning_purchases` のうち `user_id = :me AND status='completed' AND course_id IS NOT NULL` を集約した `course_id` 配列（重複排除）
  - `purchased_content_ids`：同上で `content_id IS NOT NULL` を集約した `content_id` 配列（重複排除）
  - `refunded` 状態のレコードは除外（access-service の判定優先順位と整合）
  - `e_learning_legacy_purchases` は本 API では参照しない（has_full_access に吸収済のため）
- エラー：400 VALIDATION_ERROR（`session_id` 形式不正）、401 UNAUTHORIZED
- 備考：FE がコース一覧／動画詳細で「購入済み」表示を出すための一括取得 API。キャッシュせず常に DB 最新値を返す（決済完了直後ポーリングに利用されるため）

### （未公開）GET /api/me/progress（B013 視聴履歴）
- **Phase 1 では公開しない**。FE 設計の B013「視聴履歴ページ」用データ取得は **Supabase 直クエリ（Server Component）で対応**：
  - 対応テーブル：`e_learning_progress`（必要に応じて `e_learning_course_videos` / `e_learning_contents` を JOIN）
  - 取得位置：FE 側の Server Component / Server Action（`createClient()` で RLS 経由のユーザーセッションを使用）
  - **Route Handler（`/api/me/progress`）は Phase 1 では作成しない**
  - 集計（完了率・コース完了判定）は services 層の `progress-service` の SQL ロジックを Server Component から RPC 経由で呼べるよう Phase 2 で整理可
- 理由：個人別の進捗データは外部からの再利用想定がなく、Server Component 直クエリで FE と密結合させた方がコード量が少なく性能も良い
- 注意：レンダリングを跨ぐ複数 FE コンポーネントが進捗データを共有する場合のみ、Phase 2 以降で本 API を公開する

---

## カテゴリ B：公開系（LP・カテゴリ・公開コンテンツ）

### GET /api/categories
- 概要：公開カテゴリ一覧
- 認証：public
- クエリパラメータ：
  - `q`：名称部分一致（任意）
- レスポンス（200）：
  ```json
  {
    "data": [
      { "id": "uuid", "name": "AI基礎", "slug": "ai-basics", "description": "...", "display_order": 1 }
    ]
  }
  ```
- 取得条件：`is_active = true AND deleted_at IS NULL`、`display_order ASC, name ASC`
- **ページング対象外・全件返却**：カテゴリは数十件規模で増減せず、FE 側でフィルタ UI に全件展開する必要があるため。件数が運用上の上限（例：100 件）を超えた場合は Phase 2 以降でページングまたはサーバ側フィルタ拡張を検討
- エラー：なし（空配列を返す）

### GET /api/landing/summary
- 概要：LP 表示用集計（注目コース／注目単体動画／受講生数 等）
- 認証：public
- レスポンス（200）：
  ```json
  {
    "data": {
      "featured_courses": [ { "id": "...", "title": "...", "thumbnail_url": "...", "price": 19800, "is_free": false } ],
      "featured_contents": [ { "id": "...", "title": "...", "thumbnail_url": "...", "price": 4980, "is_free": false } ],
      "stats": { "total_users": 109, "total_courses": 5, "total_contents": 15 }
    }
  }
  ```
- 備考：`is_published = true AND deleted_at IS NULL AND is_featured = true` を上位 N 件返す。
- エラー：500 INTERNAL_ERROR（集計失敗）

---

## カテゴリ C：コース（一覧・詳細・章/動画）

### GET /api/courses
- 概要：公開コース一覧（コース一覧ページ `/e-learning/courses` の主データ）
- 認証：**auth**（詳細・責務分離は `docs/backend/logic/controllers/README.md` §「未認証時の方針（明文化）」を **唯一の正**とする。本ファイルでは「ログイン必須・401 JSON を返す」一行のみとし、内訳は controllers 側に集約）
- 関連：未ログイン UI 経路（`/auth/login?returnTo=...` リダイレクト）は `middleware.ts` の担当領域・API Route は JSON のみ
- クエリパラメータ：
  - `category_id`：UUID（任意）
  - `q`：タイトル部分一致（任意）
  - `is_featured`：`true|false`（任意）
  - `page`、`per_page`、`sort`
- レスポンス（200）：
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "コース名",
        "slug": "course-slug",
        "thumbnail_url": "...",
        "category": { "id": "...", "name": "AI基礎", "slug": "..." },
        "is_free": false,
        "price": 19800,
        "stripe_price_id": "price_xxx",
        "is_featured": false,
        "video_count": 12,
        "total_duration": "3:21:15"
      }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 5 }
  }
  ```
- 取得条件：`is_published = true AND deleted_at IS NULL`
- エラー：400 VALIDATION_ERROR（page/per_page 不正）

### GET /api/courses/:slug
- 概要：コース詳細（章＋動画一覧含む）
- 認証：public（購入判定はログイン時のみ反映）
- パスパラメータ：`slug`
- レスポンス（200）：
  ```json
  {
    "data": {
      "id": "uuid",
      "title": "...",
      "slug": "course-slug",
      "description": "...",
      "thumbnail_url": "...",
      "category": { "id": "...", "name": "..." },
      "is_free": false,
      "price": 19800,
      "stripe_price_id": "price_xxx",
      "is_published": true,
      "chapters": [
        {
          "id": "...",
          "title": "第1章",
          "display_order": 1,
          "videos": [
            { "id": "...", "title": "イントロ", "duration": "10:30", "display_order": 1, "is_free": true, "view_count": 124 }
          ]
        }
      ],
      "materials": [ { "id": "...", "title": "資料A.pdf", "file_url": "...", "display_order": 1 } ],
      "viewer": {
        "is_authenticated": true,
        "has_access": false,
        "access_reason": "not_purchased"
      }
    }
  }
  ```
- 取得条件：`is_published = true AND deleted_at IS NULL`
- 備考：
  - `viewer.has_access` は §0 の優先順位で算出（未ログインは null）
  - `access_reason`：`full_access` / `course_purchased` / `content_purchased` / `free_course` / `free_course_video` / `free_content` / `not_purchased` / `unauthenticated`（`docs/backend/logic/services/access-service.md` の `AccessReason` 型と一致。`free_course` = コース全体が無料、`free_course_video` = 個別のコース内動画が `is_free` のときに使う・意味が異なるため両方を保持）
  - **`video_count` / `total_duration`**：レスポンスのトップ階層には**載せない**。`chapters[].videos[]` を全て返すので、FE 側で `chapters.flatMap(c => c.videos).length` および `duration` の合算で算出する（一覧 `GET /api/courses` 側ではトップ階層に持つ理由＝サマリ表示用なので、用途を分離する）
- エラー：404 NOT_FOUND

### GET /api/courses/:slug/videos/:videoId
- 概要：コース内動画の視聴用メタ取得（再生用 URL を返す）
- 認証：auth
- 視聴可否：§0 の優先順位で判定
- レスポンス（200）：
  ```json
  {
    "data": {
      "id": "uuid",
      "title": "...",
      "video_url": "https://...",
      "duration": "10:30",
      "is_free": false,
      "chapter": { "id": "...", "title": "第1章", "display_order": 1 },
      "course": { "id": "...", "slug": "..." },
      "next_video": { "id": "...", "title": "次の動画", "chapter_display_order": 1, "video_display_order": 2 } ,
      "is_completed": false
    }
  }
  ```
- 副作用：`view_count` を +1（同一ユーザー同一動画の重複カウントは Phase 1 では許容＝既存の単体動画と同じ運用）。
- エラー：401 UNAUTHORIZED、403 FORBIDDEN_NO_ACCESS、404 NOT_FOUND

### POST /api/courses/:slug/videos/:videoId/complete
- 概要：コース内動画の視聴完了マーキング（プレーヤー側で末尾到達時に呼ぶ）
- 認証：auth
- リクエスト：なし
- レスポンス（200）：
  ```json
  { "data": { "completed_at": "2026-05-12T01:23:00Z", "course_completed": false } }
  ```
- 備考：
  - `e_learning_progress` に `(user_id, course_video_id)` で UPSERT（重複時は最初の `completed_at` を保持）
  - `course_completed` はそのコースの全動画完了時 true
- エラー：401 UNAUTHORIZED、403 FORBIDDEN_NO_ACCESS、404 NOT_FOUND

---

## カテゴリ D：単体動画

### GET /api/contents
- 概要：単体動画一覧
- 認証：public
- クエリパラメータ：`category_id`、`q`、`is_featured`、`exclude_id`、`page`、`per_page`、`sort`
  - `exclude_id`：UUID（任意・指定された単体動画 ID を結果から除外）
    - 用途：B007「単体動画詳細画面」の `RelatedContentsSection` が `GET /api/contents?category_id={現動画の category_id}&exclude_id={現動画 ID}` で「同カテゴリの関連動画（自分自身を除く）」を取得するため
    - 動作：他の絞り込み条件（`category_id` / `q` / `is_featured`）と AND で合成。`exclude_id` の単体動画が存在しない場合でも 400 にはせず、単純に除外条件として無視（結果は通常通り）
    - 形式が UUID として不正な場合は 400 VALIDATION_ERROR
- レスポンス（200）：
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "title": "...",
        "thumbnail_url": "...",
        "duration": "12:34",
        "category": { "id": "...", "name": "..." },
        "is_free": false,
        "price": 4980,
        "stripe_price_id": "price_xxx",
        "is_featured": false,
        "view_count": 230
      }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 15 }
  }
  ```
- 取得条件：`is_published = true AND deleted_at IS NULL`
- エラー：400 VALIDATION_ERROR

### GET /api/contents/:id
- 概要：単体動画詳細（視聴 URL は別エンドポイントで取得）
- 認証：public
- レスポンス（200）：
  ```json
  {
    "data": {
      "id": "uuid",
      "title": "...",
      "description": "...",
      "thumbnail_url": "...",
      "duration": "12:34",
      "category": { "id": "...", "name": "..." },
      "is_free": false,
      "price": 4980,
      "stripe_price_id": "price_xxx",
      "materials": [ { "id": "...", "title": "...", "file_url": "...", "display_order": 1 } ],
      "viewer": {
        "is_authenticated": true,
        "has_access": false,
        "access_reason": "not_purchased"
      }
    }
  }
  ```
- 取得条件：`is_published = true AND deleted_at IS NULL`
- エラー：404 NOT_FOUND

### GET /api/contents/:id/play
- 概要：単体動画の視聴用メタ取得（再生用 URL を返す）
- 認証：auth
- 視聴可否：§0 の優先順位で判定
- レスポンス（200）：
  ```json
  {
    "data": {
      "id": "uuid",
      "title": "...",
      "video_url": "https://...",
      "duration": "12:34",
      "is_free": false,
      "is_completed": false
    }
  }
  ```
- 副作用：`view_count` を +1（既存運用踏襲）。
- エラー：401 UNAUTHORIZED、403 FORBIDDEN_NO_ACCESS、404 NOT_FOUND

### POST /api/contents/:id/complete
- 概要：単体動画の視聴完了マーキング
- 認証：auth
- リクエスト：なし
- レスポンス（200）：`{ "data": { "completed_at": "..." } }`
- 副作用：`e_learning_progress` に `(user_id, content_id)` で UPSERT。
- エラー：401 UNAUTHORIZED、403 FORBIDDEN_NO_ACCESS、404 NOT_FOUND

---

## カテゴリ E：購入・Stripe

### POST /api/checkout
- 概要：Stripe Checkout Session を作成（コース／単体動画の買い切り）
- 認証：auth
- リクエスト：
  ```json
  {
    "target_type": "course",
    "target_id": "uuid",
    "cancel_return_url": "/e-learning/courses/some-slug"
  }
  ```
  - `target_type`：`course` または `content`
  - `target_id`：対象の UUID（必須）
  - `cancel_return_url`：サイト内パスのみ許容（`/` 始まり・`://` 含まない・既存実装踏襲）
- バリデーション：
  - target は `is_published = true AND deleted_at IS NULL`
  - target が `is_free = true` の場合 400 BAD_REQUEST（無料商品は購入不可）
  - 同一ユーザーが target を既購入（`status=completed`）の場合 409 ALREADY_PURCHASED
  - `has_full_access = true` のユーザーは 409 ALREADY_FULL_ACCESS（テスト課金は管理画面側で別系統）
- レスポンス（200）：
  ```json
  {
    "data": {
      "checkout_url": "https://checkout.stripe.com/...",
      "stripe_session_id": "cs_xxx"
    }
  }
  ```
- Stripe Session 設定：
  - `mode: 'payment'`（One-time）
  - `line_items[0].price = target.stripe_price_id`
  - `metadata`：
    ```
    target_type: "course" | "content"
    target_id:   <uuid>
    user_id:     <e_learning_users.id>
    ```
  - `success_url`：**FE 設計 B009「決済完了ページ」へ統一**：`${BASE_URL}/e-learning/checkout/complete?session_id={CHECKOUT_SESSION_ID}`
    - Stripe の `{CHECKOUT_SESSION_ID}` プレースホルダ機能で確定 session.id に置換
    - 完了ページ側で `GET /api/me/access` をポーリングして購入反映を待機・確認後にコース／単体動画詳細へリダイレクト（詳細は `docs/backend/logic/services/access-service.md` §「購入完了直後の視聴権限確認フロー」）
  - `cancel_url`：`cancel_return_url`（無効なら `/e-learning`）
- エラー：400 VALIDATION_ERROR、401 UNAUTHORIZED、404 NOT_FOUND、409 ALREADY_PURCHASED / ALREADY_FULL_ACCESS、502 STRIPE_API_ERROR

### POST /api/stripe/webhook
- 概要：Stripe Webhook 受信エンドポイント
- 認証：service（`Stripe-Signature` ヘッダで署名検証）
- リクエスト：Stripe Event Object（生 body 必須）
- 処理対象イベント：
  - `checkout.session.completed`：購入レコード作成（status=`completed`、`refunded_at = NULL`）
  - `charge.refunded`：購入レコードを `status='refunded'` に更新。**同時に `refunded_at = to_timestamp(charge.created)`（Stripe Charge object の `created` Unix epoch 秒を timestamptz に変換）を必ずセット**。DB 側 CHECK 制約 `(status='refunded' AND refunded_at IS NOT NULL) OR (status<>'refunded' AND refunded_at IS NULL)` を満たすため、`status` と `refunded_at` は **同一 UPDATE 文で**セットすること
- 冪等性：`stripe_session_id`（UNIQUE）／`stripe_payment_intent_id` を一意キーに重複処理を防止
- レスポンス（200）：`{ "received": true }`
- エラー時の HTTP ステータス方針：
  - 署名検証失敗 → 400（Stripe 側はリトライしない）
  - 処理失敗（DB 書き込み失敗等）→ 500（Stripe 側がリトライ・最大 72 時間）
- ログ：
  - 受信した event.id と type を必ずログに残す
  - 失敗時は Slack 通知（既存 `SLACK_WEBHOOK_URL` を再利用）
- 詳細フローは `docs/backend/logic/services/stripe-webhook-service.md`

### GET /api/me/purchases
- 概要：自分の購入履歴
- 認証：auth
- クエリパラメータ：`status`（`completed|refunded|all`、デフォルト `completed`）、`page`、`per_page`
- レスポンス（200）：
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "target_type": "course",
        "target": { "id": "...", "title": "...", "slug": "..." },
        "amount": 19800,
        "status": "completed",
        "stripe_session_id": "cs_xxx",
        "created_at": "2026-04-01T00:00:00Z",
        "refunded_at": null
      }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 3 }
  }
  ```
- 備考：
  - `has_full_access = true` でも本人の `e_learning_purchases` レコードは正直に返す（マスキングしない）
  - **`e_learning_legacy_purchases`（旧 6 件）は本エンドポイントには含めない**（新ルールの購入レコードのみを返す）。レガシー履歴の参照は管理画面側 `GET /api/admin/legacy-purchases` 経由のみ
- エラー：401 UNAUTHORIZED

---

## カテゴリ F：ブックマーク

### GET /api/me/bookmarks
- 概要：自分のブックマーク一覧（コース・単体動画混在）
- 認証：auth
- クエリパラメータ：`type`（`course|content|all`、デフォルト `all`）、`page`、`per_page`
- レスポンス（200）：
  ```json
  {
    "data": [
      { "id": "uuid", "type": "course", "target": { "id": "...", "title": "...", "slug": "..." }, "created_at": "..." },
      { "id": "uuid", "type": "content", "target": { "id": "...", "title": "..." }, "created_at": "..." }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 3 }
  }
  ```
- エラー：401 UNAUTHORIZED

### POST /api/me/bookmarks
- 概要：ブックマーク追加（コース or 単体動画。コース内動画はブックマーク不可）
- 認証：auth
- パス：**`/api/me/bookmarks` に統一**（一覧 `GET /api/me/bookmarks` と揃え、`/api/me/**` 配下を「自分自身に紐付くリソース」名前空間として一貫させる）
- リクエスト：
  ```json
  { "target_type": "course", "target_id": "uuid" }
  ```
- バリデーション：
  - `target_type ∈ {course, content}`（**`course_video` は M4 確定により不可**＝コース内動画はブックマーク対象外）
  - 対象は `is_published = true AND deleted_at IS NULL`
  - 既にブックマーク済みなら 409 ALREADY_EXISTS（部分 UNIQUE 制約と整合）
- レスポンス（201）：`{ "data": { "id": "uuid", "created_at": "..." } }`
- エラー：400 VALIDATION_ERROR、401 UNAUTHORIZED、404 NOT_FOUND、409 ALREADY_EXISTS

### DELETE /api/me/bookmarks/:id
- 概要：ブックマーク削除
- 認証：auth
- パス：**`/api/me/bookmarks/:id` に統一**（一覧／追加と同名前空間に揃える）
- レスポンス（200）：`{ "data": { "ok": true } }`
- ガード：自分のブックマークでない場合 404 NOT_FOUND（403 を返さず存在隠蔽）
- エラー：401 UNAUTHORIZED、404 NOT_FOUND

---

## カテゴリ G：資料ダウンロード

### GET /api/courses/:slug/materials
- 概要：コースの資料一覧
- 認証：auth + has_access（§0 優先順位で判定。フルアクセス／コース購入済のみ）
- レスポンス（200）：
  ```json
  { "data": [ { "id": "...", "title": "...", "file_url": "...", "file_size": 123456, "display_order": 1 } ] }
  ```
- エラー：401 UNAUTHORIZED、403 FORBIDDEN_NO_ACCESS、404 NOT_FOUND

### GET /api/contents/:id/materials
- 概要：単体動画の資料一覧
- 認証：auth + has_access
- レスポンス（200）：同上
- エラー：同上

> 備考：複数資料の zip 一括ダウンロードは FE 側で個別 file_url をまとめてダウンロード。バックエンドでの zip 生成 API は Phase 1 では出さない。

---

## カテゴリ H：管理者 API（/api/admin/**）

> 全エンドポイント `admin` 認証必須。`auth.users` に存在＝管理者（ロール分離なし）。
> 監査ログは Phase 1 では出さない。

### H-1. 管理者向けコース管理

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/courses` | コース一覧（未公開・論理削除済み含む） |
| POST   | `/api/admin/courses` | コース新規作成 |
| GET    | `/api/admin/courses/:id` | コース詳細（章・動画ツリー含む） |
| PATCH  | `/api/admin/courses/:id` | コース更新（タイトル・価格・公開状態 等） |
| DELETE | `/api/admin/courses/:id` | コース論理削除（`deleted_at` セット） |

#### POST /api/admin/courses（詳細）
- リクエスト：
  ```json
  {
    "title": "...",
    "slug": "course-slug",
    "description": "...",
    "thumbnail_url": "...",
    "category_id": "uuid",
    "is_free": false,
    "price": 19800,
    "stripe_price_id": "price_xxx",
    "is_published": false,
    "is_featured": false,
    "display_order": 0
  }
  ```
- バリデーション：
  - `title`：必須 / varchar(200)
  - `slug`：必須 / varchar(100) / UNIQUE（重複時 409 DUPLICATE_SLUG）
  - `category_id`：必須 / 存在チェック / `deleted_at IS NULL`
  - `is_free = true` のとき `price` と `stripe_price_id` は NULL 必須
  - `is_free = false` のとき `price` は必須・正の整数、`stripe_price_id` は varchar(64) 必須・UNIQUE（重複時 409 DUPLICATE_STRIPE_PRICE_ID）
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND（category）、409 DUPLICATE_SLUG、409 DUPLICATE_STRIPE_PRICE_ID

#### PATCH /api/admin/courses/:id（業務ルール）
- リクエスト：POST と同じフィールドを部分更新可能（提供されたフィールドのみ検証）。`slug` 変更時は再度 UNIQUE チェック。
- `is_published` を false→true にする時、`category_id`／`price`／`stripe_price_id`（有料時）が揃っていること（業務ルール）
- 既に購入者がいる状態で `is_free` や `price` を変更しても既購入者の権利は維持（業務ルール：既得権保護）
- `stripe_price_id` の変更可。既存購入は紐付け済の Session 由来なので影響なし。新値が UNIQUE 違反なら 409 DUPLICATE_STRIPE_PRICE_ID
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND、409 DUPLICATE_SLUG、409 DUPLICATE_STRIPE_PRICE_ID

#### DELETE /api/admin/courses/:id（論理削除）
- 効果：`deleted_at = now()` をセット（物理削除しない）
- 業務ルール：
  - **二重削除**：既に `deleted_at IS NOT NULL` のコースを再度 DELETE → 200 OK / `data.already_deleted = true`（冪等）
  - **購入者あり**：`status = 'completed'` の購入が 1 件以上ある場合でも論理削除は許容（既購入者の視聴権限は権利判定側で維持・コースは新規表示から外れる）。ただし FE 側で確認ダイアログを出すため、レスポンスに `purchased_user_count` を含める
- レスポンス（200）：
  ```json
  { "data": { "ok": true, "already_deleted": false, "purchased_user_count": 0 } }
  ```
- エラー：403 FORBIDDEN、404 NOT_FOUND（コース不在）

### H-2. 章・動画管理

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/courses/:courseId/chapters` | 章一覧 |
| POST   | `/api/admin/courses/:courseId/chapters` | 章新規作成 |
| PATCH  | `/api/admin/courses/:courseId/chapters/:chapterId` | 章更新（順序入替も含む） |
| DELETE | `/api/admin/courses/:courseId/chapters/:chapterId` | 章削除（CASCADE で動画も削除） |
| POST   | `/api/admin/courses/:courseId/chapters/:chapterId/videos` | コース内動画作成 |
| PATCH  | `/api/admin/course-videos/:videoId` | コース内動画更新 |
| DELETE | `/api/admin/course-videos/:videoId` | コース内動画削除 |
| POST   | `/api/admin/courses/:courseId/reorder` | 章・動画の順序一括更新（DEFERRABLE） |

#### POST /api/admin/courses/:courseId/chapters（章新規作成）
- リクエスト：
  ```json
  {
    "title": "第1章 基礎編",
    "description": "...",
    "display_order": 1
  }
  ```
- バリデーション：
  - `title`：必須 / varchar(200)
  - `description`：任意 / text
  - `display_order`：必須 / integer / 0 以上 / **同一 `course_id` 内で重複不可**
- レスポンス（201）：`{ "data": { "id": "uuid", "course_id": "uuid", "title": "...", "display_order": 1, "created_at": "..." } }`
- エラー：
  - 400 VALIDATION_ERROR
  - 403 FORBIDDEN
  - 404 NOT_FOUND（親 course が存在しない／論理削除済）
  - **409 DUPLICATE_DISPLAY_ORDER**（`(course_id, display_order)` 部分 UNIQUE 違反）

#### PATCH /api/admin/courses/:courseId/chapters/:chapterId（章更新）
- リクエスト（部分更新・全フィールド任意）：
  ```json
  { "title": "...", "description": "...", "display_order": 2 }
  ```
- バリデーション：上記 POST と同じ（提供されたフィールドのみ検証）
- 単独 PATCH で `display_order` を変更する場合：他章と重複したら **409 DUPLICATE_DISPLAY_ORDER**。複数章の並び替えは `/reorder` 一括 API を使用すること（推奨）
- レスポンス（200）：更新後の章オブジェクト
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND、409 DUPLICATE_DISPLAY_ORDER

#### DELETE /api/admin/courses/:courseId/chapters/:chapterId（章削除）
- 副作用：章配下の動画は CASCADE で削除（schema.dbml 参照）
- 備考（カスケード影響）：
  - 章削除に伴い `e_learning_course_videos` が CASCADE 削除され、さらに `e_learning_progress` の当該 `course_video_id` 行も CASCADE で削除される
  - **購入済みコースの視聴権限への影響なし**：購入レコード（`e_learning_purchases`）は `course_id` 単位で保持され、章・動画削除では失効しない。FE では「視聴済み動画が削除された」状態を `progress` 行欠落として扱う（再受講時は新しい動画構成で再進捗）
- レスポンス（200）：`{ "data": { "ok": true } }`
- エラー：403 FORBIDDEN、404 NOT_FOUND

#### POST /api/admin/courses/:courseId/chapters/:chapterId/videos（コース内動画作成）
- リクエスト：
  ```json
  {
    "title": "イントロダクション",
    "description": "...",
    "thumbnail_url": "https://...",
    "video_url": "https://...",
    "duration": "10:30",
    "is_free": false,
    "display_order": 1
  }
  ```
- バリデーション：
  - `title`：必須 / varchar(200)
  - `description`：任意 / text
  - `thumbnail_url`：任意 / text
  - `video_url`：必須 / text
  - `duration`：任意 / varchar(20)
  - `is_free`：必須 / boolean（デフォルト false）
  - `display_order`：必須 / integer / **同一 `chapter_id` 内で重複不可**
- レスポンス（201）：作成後の動画オブジェクト
- エラー：
  - 400 VALIDATION_ERROR
  - 403 FORBIDDEN
  - 404 NOT_FOUND（親 chapter が存在しない／親 course が論理削除済）
  - **409 DUPLICATE_DISPLAY_ORDER**（`(chapter_id, display_order)` 部分 UNIQUE 違反）

#### PATCH /api/admin/course-videos/:videoId（コース内動画更新）
- リクエスト（部分更新・全フィールド任意）：
  ```json
  { "title": "...", "description": "...", "thumbnail_url": "...", "video_url": "...", "duration": "...", "is_free": true, "display_order": 2, "chapter_id": "uuid" }
  ```
- 備考：`chapter_id` を変更すると章の付け替え。新 chapter_id 内で `display_order` が重複したら 409 DUPLICATE_DISPLAY_ORDER
- 複数動画の並び替えは `/reorder` 一括 API を使用すること（推奨）
- レスポンス（200）：更新後の動画オブジェクト
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND、409 DUPLICATE_DISPLAY_ORDER

#### DELETE /api/admin/course-videos/:videoId（コース内動画削除）
- 副作用：当該動画の進捗（`e_learning_progress`）も CASCADE で消える
- レスポンス（200）：`{ "data": { "ok": true } }`
- エラー：403 FORBIDDEN、404 NOT_FOUND

#### POST /api/admin/courses/:courseId/reorder（一括順序更新）
- 概要：章と動画の `display_order` を一括更新
- リクエスト：
  ```json
  {
    "chapters": [
      { "id": "uuid", "display_order": 1, "videos": [{ "id": "uuid", "display_order": 1 }] }
    ]
  }
  ```
- 備考：単一トランザクションで実行。DB 側で `(course_id, display_order)` と `(chapter_id, display_order)` の UNIQUE 制約は DEFERRABLE INITIALLY DEFERRED（schema.dbml）なので、順序入替時の一時重複を許容。COMMIT 時に最終状態で UNIQUE を検証する。
- レスポンス（200）：`{ "data": { "ok": true } }`
- エラー：
  - 400 VALIDATION_ERROR（章・動画 ID が当該 course に紐付かない 等）
  - 403 FORBIDDEN
  - 404 NOT_FOUND
  - 409 DUPLICATE_DISPLAY_ORDER（COMMIT 時の最終状態で重複が残った場合のみ）

### H-3. 単体動画管理

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/contents` | 単体動画一覧（未公開・論理削除済み含む） |
| POST   | `/api/admin/contents` | 単体動画新規作成 |
| GET    | `/api/admin/contents/:id` | 詳細 |
| PATCH  | `/api/admin/contents/:id` | 更新 |
| DELETE | `/api/admin/contents/:id` | 論理削除 |

#### POST /api/admin/contents（単体動画新規作成）
- リクエスト：
  ```json
  {
    "title": "AI 入門：プロンプトの基本",
    "description": "...",
    "thumbnail_url": "https://...",
    "video_url": "https://...",
    "duration": "12:34",
    "category_id": "uuid",
    "is_free": false,
    "price": 4980,
    "stripe_price_id": "price_xxx",
    "display_order": 0,
    "is_published": true,
    "is_featured": false
  }
  ```
- バリデーション：
  - `title`：**必須** / varchar(200)
  - `description`：任意 / text
  - `thumbnail_url`：任意 / text
  - `video_url`：**必須** / text
  - `duration`：任意 / varchar(20)（例：`"12:34"`）
  - `category_id`：任意 / 存在チェック / `deleted_at IS NULL`（NULL も許容＝既存運用と整合）
  - `is_free`：必須 / boolean（デフォルト false）
  - `price`：`is_free=true` のとき NULL 必須 / `is_free=false` のとき必須・正の整数
  - `stripe_price_id`：`is_free=true` のとき NULL 必須 / `is_free=false` のとき必須・varchar(64)・UNIQUE
  - `display_order`：必須 / integer / 0 以上（デフォルト 0）。**単体動画の `display_order` は UNIQUE 制約なし**（業務上、同一順序値の重複を許容＝表示順は単なるソートヒントとして扱う・schema.dbml と整合）
  - `is_published`：必須 / boolean（既存運用と整合・デフォルト true）
  - `is_featured`：必須 / boolean（デフォルト false）
- 業務ルール：
  - `is_published=true` で作成する場合：`is_free=false` なら `price` と `stripe_price_id` が揃っていること（バリデーションで先回り確認）
- レスポンス（201）：作成後の単体動画オブジェクト（全フィールド ＋ `id` / `view_count=0` / `created_at` / `updated_at` / `deleted_at=null`）
- エラー：
  - 400 VALIDATION_ERROR（必須欠落・型不正・`is_free` と `price`/`stripe_price_id` の整合不正 等）
  - 403 FORBIDDEN
  - 404 NOT_FOUND（`category_id` 指定時にカテゴリ不在／論理削除済）
  - **409 DUPLICATE_STRIPE_PRICE_ID**（`stripe_price_id` UNIQUE 違反）

#### PATCH /api/admin/contents/:id（単体動画更新）
- リクエスト：POST と同じフィールドを部分更新可能（提供されたフィールドのみ検証）
  ```json
  {
    "title": "...",
    "description": "...",
    "thumbnail_url": "...",
    "video_url": "...",
    "duration": "...",
    "category_id": "uuid",
    "is_free": false,
    "price": 4980,
    "stripe_price_id": "price_xxx",
    "display_order": 0,
    "is_published": true,
    "is_featured": false
  }
  ```
- バリデーション：H-1 のコースと同等
  - `title`：varchar(200) / `category_id`：存在チェック / `is_free=false` のとき `price`（正の整数）と `stripe_price_id`（varchar(64) UNIQUE）必須
  - 既に購入者がいる状態で `price` を変更しても既購入者の権利は維持（既得権保護）
- レスポンス（200）：更新後の単体動画オブジェクト
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND、409 DUPLICATE_STRIPE_PRICE_ID

#### DELETE /api/admin/contents/:id（論理削除）
- 効果：`deleted_at = now()` をセット（物理削除しない・H-1 のコース DELETE と同等）
- 業務ルール：
  - **二重削除**：既に `deleted_at IS NOT NULL` の単体動画を再度 DELETE → 200 OK / `data.already_deleted = true`（冪等）
  - **購入者あり**：`status = 'completed'` の購入が 1 件以上ある場合でも論理削除は許容（既購入者の視聴権限は権利判定側で維持・単体動画は新規表示から外れる）。FE 側で確認ダイアログを出すため、レスポンスに `purchased_user_count` を含める
- レスポンス（200）：
  ```json
  { "data": { "ok": true, "already_deleted": false, "purchased_user_count": 0 } }
  ```
- エラー：403 FORBIDDEN、404 NOT_FOUND（単体動画不在）

### H-4. カテゴリ管理

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/categories` | カテゴリ一覧（is_active false / deleted_at 設定済含む） |
| GET    | `/api/admin/categories/:id` | カテゴリ詳細（紐付くコース／単体動画件数も含む） |
| POST   | `/api/admin/categories` | 新規作成 |
| PATCH  | `/api/admin/categories/:id` | 更新（受け入れフィールドは下記） |
| DELETE | `/api/admin/categories/:id` | 論理削除（紐付くコースがある場合 409 IN_USE） |

#### GET /api/admin/categories/:id（カテゴリ詳細）
- 概要：単一カテゴリの詳細＋利用状況（紐付くコース／単体動画の件数）を返す。一覧側は集計を返さないため、編集時の参照用に詳細 API を分離
- レスポンス（200）：
  ```json
  {
    "data": {
      "id": "uuid",
      "name": "AI基礎",
      "slug": "ai-basics",
      "description": "...",
      "display_order": 1,
      "is_active": true,
      "deleted_at": null,
      "course_count": 3,
      "content_count": 5
    }
  }
  ```
- エラー：403 FORBIDDEN、404 NOT_FOUND

#### POST /api/admin/categories（新規作成）
- リクエスト：
  ```json
  { "name": "新カテゴリ", "slug": "new-category", "description": "...", "display_order": 10, "is_active": true }
  ```
- バリデーション：
  - `name`：必須 / varchar(100)
  - `slug`：必須 / varchar(100) / UNIQUE（重複時 409 DUPLICATE_SLUG）
  - `description`：任意 / text
  - `display_order`：必須 / integer / 0 以上
  - `is_active`：必須 / boolean
- レスポンス（201）：作成後のカテゴリ
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、409 DUPLICATE_SLUG

#### PATCH /api/admin/categories/:id（更新）
- 受け入れフィールド（全て任意・部分更新）：
  - `name`：varchar(100)
  - `slug`：varchar(100)・**変更可**（UNIQUE。SEO 影響に注意・FE 側で確認ダイアログを出す）
  - `description`：text
  - `display_order`：integer
  - `is_active`：boolean（一時非表示の切替）
  - `deleted_at`：明示的に `null` を渡すと「廃止解除（再活性化）」。廃止確定は DELETE エンドポイント経由で行うこと
- 業務ルール：
  - `is_active=false`：一時非表示（再表示可能）
  - `deleted_at IS NOT NULL`：廃止確定（DELETE 経由のみ）
  - 両者は併用可（schema.dbml L4 確定）
  - **廃止解除（`deleted_at = null` 指定）のバリデーション制限なし**：解除時の必須項目チェック・所属コース整合チェック等は行わない（カテゴリは独立性が高く、解除後の `slug`／`name` 重複は別途 UNIQUE 制約で守られる）。解除直後の表示は `is_active` の現在値に依存する（解除しても `is_active=false` のままなら一覧非表示）
- レスポンス（200）：更新後のカテゴリ
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND、409 DUPLICATE_SLUG

#### DELETE /api/admin/categories/:id（論理削除）
- 業務ルール：
  - 紐付くコース（`category_id` 一致 かつ `deleted_at IS NULL`）または単体動画があれば **409 IN_USE**。レスポンス `details.referenced_course_count` / `referenced_content_count` を含める
  - 既に `deleted_at IS NOT NULL` の場合：200 OK / `data.already_deleted = true`（冪等）
- レスポンス（200）：`{ "data": { "ok": true, "already_deleted": false } }`
- エラー：403 FORBIDDEN、404 NOT_FOUND、409 IN_USE

### H-5. 資料管理

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/materials` | 資料一覧（content_id or course_id でフィルタ） |
| POST   | `/api/admin/materials` | 資料追加（target_type=`content` or `course`） |
| PATCH  | `/api/admin/materials/:id` | 更新（title／display_order） |
| DELETE | `/api/admin/materials/:id` | 削除 |

> 詳細 GET（`GET /api/admin/materials/:id`）は Phase 1 では出さない：
> 一覧 GET でフィルタすれば 1 件特定は容易（resource size が小さい）。資料は title・display_order のみが運用上重要で、詳細画面を別途必要としない。
> 必要になれば次フェーズで追加する。

#### POST /api/admin/materials
- リクエスト：
  ```json
  { "target_type": "course", "target_id": "uuid", "title": "資料A.pdf", "file_url": "https://...", "file_size": 123456, "display_order": 1 }
  ```
- バリデーション：
  - `target_type ∈ {content, course}`、片方のみ NOT NULL（CHECK 制約と整合）
  - `title`：必須 / varchar(200)
  - `file_url`：必須 / text
  - `display_order`：必須 / integer / `(content_id, display_order)` または `(course_id, display_order)` 部分 UNIQUE（DEFERRABLE INITIALLY DEFERRED）違反時 409 DUPLICATE_DISPLAY_ORDER
- レスポンス（201）：作成後の資料オブジェクト
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND（target 不在）、409 DUPLICATE_DISPLAY_ORDER

#### PATCH /api/admin/materials/:id
- 概要：資料の `title` および `display_order` を更新（`target_id` の付け替えは不可）
- リクエスト（部分更新・全フィールド任意）：
  ```json
  { "title": "改訂版 資料A.pdf", "display_order": 2 }
  ```
- 受け入れフィールド：
  - `title`：任意 / varchar(200)
  - `display_order`：任意 / integer / 同一 target（content_id or course_id）内で部分 UNIQUE（DEFERRABLE INITIALLY DEFERRED）
- 受け付けない（変更不可）フィールド：
  - `target_type` / `target_id`（誤紐付け防止のため・必要なら DELETE → POST で対応）
  - `file_url` / `file_size`（差し替えは DELETE → POST で対応）
- 業務ルール：
  - 単独 PATCH で `display_order` を変更する場合、同一 target 内で重複したら **409 DUPLICATE_DISPLAY_ORDER**（COMMIT 時の最終状態で重複が残った場合のみ）
  - 複数資料の並び替えが必要な場合は、Phase 1 では PATCH を順次呼び出す（FE 側で逐次更新）。一括 reorder API は Phase 2 以降で検討
- レスポンス（200）：更新後の資料オブジェクト
  ```json
  { "data": { "id": "uuid", "target_type": "course", "target_id": "uuid", "title": "改訂版 資料A.pdf", "file_url": "...", "file_size": 123456, "display_order": 2, "updated_at": "..." } }
  ```
- エラー：
  - 400 VALIDATION_ERROR（型不正・受け付けないフィールド指定）
  - 403 FORBIDDEN
  - 404 NOT_FOUND
  - 409 DUPLICATE_DISPLAY_ORDER

#### DELETE /api/admin/materials/:id
- 概要：資料の物理削除（個別資料は親 CASCADE 対象＝親 content/course 削除でも自動消滅するため、明示削除はこの API のみ）
- レスポンス（200）：`{ "data": { "ok": true } }`
- エラー：403 FORBIDDEN、404 NOT_FOUND

### H-6. ユーザー管理（フルアクセス切替・購入履歴閲覧）

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/users` | ユーザー一覧（email・display_name 検索可） |
| GET    | `/api/admin/users/:id` | ユーザー詳細（フルアクセス状態・購入履歴・進捗サマリ） |
| PATCH  | `/api/admin/users/:id` | 更新（`has_full_access` の切替のみ Phase 1 スコープ） |
| GET    | `/api/admin/users/:id/purchases` | 該当ユーザーの購入履歴 |

#### GET /api/admin/users（ユーザー一覧）
- クエリパラメータ：
  - `q`：email / display_name の部分一致（任意）
  - `has_full_access`：`true | false`（任意）
  - `is_active`：`true | false`（任意・デフォルト `true`）
  - `include_deleted`：`true | false`（任意・デフォルト `false`。退会済を含めるか）
  - `page`：1 始まり（デフォルト 1）
  - `per_page`：デフォルト 20 / 上限 100
  - `sort`：`-created_at`（デフォルト）/ `created_at` / `-last_accessed_at` / `email`
- レスポンス（200）：
  ```json
  {
    "data": [
      { "id": "uuid", "email": "...", "display_name": "...", "has_full_access": false, "is_active": true, "last_accessed_at": "...", "created_at": "..." }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 109 }
  }
  ```

#### PATCH /api/admin/users/:id
- 認証：**admin**（`auth.users` に存在＝管理者）
- リクエスト：
  ```json
  { "has_full_access": true }
  ```
- 業務ルール：
  - **冪等**：既に `has_full_access = true` のユーザーに `true` を再セット → 200 OK / `data.changed = false`（409 を返さない・運用の利便性優先）
  - 同様に false → false も冪等
  - **自身の `has_full_access` 変更可**：運用上、管理者自身も「フルアクセス会員」として登録される（弊社メンバー扱い）ため、対象 `:id` が認証ユーザー自身であっても許可する。自己変更も Slack 通知の対象に含める
- レスポンス（200）：
  ```json
  { "data": { "id": "uuid", "has_full_access": true, "changed": true } }
  ```
- 備考：運営メンバー手動切替を想定。Phase 1 では他フィールド更新は不可。
- 通知：切替時は Slack に「実行者 email / 対象 user / before→after」を必ず通知（監査ログ代替）
- エラー：400 VALIDATION_ERROR、403 FORBIDDEN、404 NOT_FOUND

#### GET /api/admin/users/:id/purchases（該当ユーザーの購入履歴）
- 概要：管理者が特定ユーザーの購入履歴を確認するための専用 API。`GET /api/admin/purchases?user_id=:id` と等価だが、ユーザー詳細画面からの導線をシンプルにするためパスベースで提供
- パスパラメータ：`id`（`e_learning_users.id`）
- 仕様：**レスポンスは `GET /api/admin/purchases` と同形式（user_id で絞り込み済）**。下記の差分のみ：
  - クエリパラメータから `user_id` は受け付けない（パスで一意決定済のため・指定された場合 400 VALIDATION_ERROR）
  - その他のクエリパラメータ（`target_type` / `target_id` / `status` / `from` / `to` / `page` / `per_page` / `sort`）は `GET /api/admin/purchases` と同一仕様
- 含めるレコード：`e_learning_purchases` のみ。`e_learning_legacy_purchases`（旧 6 件）は本エンドポイントには含めない（`GET /api/admin/legacy-purchases` で別途閲覧）
- レスポンス（200）：購入レコード配列 + meta（`GET /api/admin/purchases` と同形式）
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "target_type": "course",
        "target": { "id": "...", "title": "...", "slug": "..." },
        "amount": 19800,
        "status": "completed",
        "stripe_session_id": "cs_xxx",
        "stripe_payment_intent_id": "pi_xxx",
        "created_at": "...",
        "refunded_at": null
      }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 3 }
  }
  ```
- エラー：
  - 400 VALIDATION_ERROR（クエリで `user_id` 指定・ISO 8601 不正 等）
  - 403 FORBIDDEN
  - 404 NOT_FOUND（指定ユーザー不在）

### H-7. 購入履歴・返金照会

| メソッド | パス | 概要 |
|---------|------|------|
| GET    | `/api/admin/purchases` | 購入履歴一覧（user_id / status / 期間 でフィルタ） |
| GET    | `/api/admin/purchases/:id` | 購入詳細 |
| GET    | `/api/admin/legacy-purchases` | 旧購入レコード（6件）の閲覧（読み取りのみ） |

#### GET /api/admin/purchases（クエリパラメータ仕様）
- クエリパラメータ：
  - `user_id`：UUID（任意）
  - `target_type`：`course | content`（任意）
  - `target_id`：UUID（任意）
  - `status`：`completed | refunded | all`（任意・デフォルト `all`）
  - `from`：ISO 8601 日時（任意・`created_at >= from`）
  - `to`：ISO 8601 日時（任意・`created_at <= to`）
  - `page`：1 始まり / `per_page`：デフォルト 20 / 上限 100
  - `sort`：`-created_at`（デフォルト）/ `created_at` / `-amount` / `amount`
- レスポンス（200）：購入レコード配列 + meta
- エラー：400 VALIDATION_ERROR（from/to の ISO 8601 不正・from > to 等）、403 FORBIDDEN

> 返金実行は Stripe Dashboard 側で行う想定（Phase 1）。Webhook `charge.refunded` を受けて自動で `e_learning_purchases.status` を更新する設計。

#### GET /api/admin/legacy-purchases（旧購入レコード閲覧・読み取り専用）
- 概要：M5 安全順序の Step 1 で `e_learning_legacy_purchases` に退避した旧購入 6 件の閲覧専用 API。読み取りのみ（INSERT/UPDATE/DELETE は提供しない・移行スクリプトのみ書き込み権限を持つ）
- 認証：admin
- クエリパラメータ：
  - `user_id`：UUID（任意・特定ユーザーの旧購入レコードに絞り込み）
  - `page`：1 始まり（デフォルト 1）
  - `per_page`：デフォルト 20 / 上限 100
  - `sort`：`-original_created_at`（デフォルト）/ `original_created_at` / `-migrated_at`
- レスポンス（200）：
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "user_id": "uuid",
        "content_id": null,
        "stripe_session_id": "cs_xxx",
        "amount": 198000,
        "status": "completed",
        "original_created_at": "2024-03-15T10:00:00Z",
        "migrated_at": "2026-05-12T00:00:00Z",
        "note": "全コンテンツ買い切り旧仕様（has_full_access=true に吸収済）"
      }
    ],
    "meta": { "page": 1, "per_page": 20, "total": 6 }
  }
  ```
- 取得元：`e_learning_legacy_purchases`（`e_learning_purchases` ではない）
- 備考：
  - `content_id = NULL` のレコードは「旧 全コンテンツ買い切り仕様」を表す（M5 確定）
  - 本 API では `e_learning_purchases`（新ルールの購入）は **含めない**（新ルール側は `GET /api/admin/purchases` を使用）
  - `e_learning_users.has_full_access = true` への吸収は移行スクリプトで実施済のため、本 API で操作はしない（参照のみ）
  - **legacy_purchases は Phase 1 では返金未対応**：旧 6 名は `has_full_access = true` に吸収済のため、業務上「旧購入レコードに対する返金処理」は発生しない。よって本 API は返金関連フィールド（`refunded_at`）を意図的に**返さない**（仮に DB 側にカラムが残存していても API 層で投影しない）。DB 側のカラム実在有無・退避方針の詳細は `docs/backend/database/schema-rationale.md` を参照
- エラー：401 UNAUTHORIZED、403 FORBIDDEN、400 VALIDATION_ERROR（`user_id` の UUID 不正等）

### H-8. ダッシュボード集計（Phase 1 スコープ外・削除）

> **N10 ディレクター判断（2026-05-12）**：管理者ダッシュボードは既存（GA4 ベース）のまま継続。Eラーニング専用集計画面は Phase 1 では作らない。
>
> 当初想定していた以下のエンドポイントは **Phase 1 では実装しない**：
> - ~~`GET /api/admin/dashboard/summary`~~
> - ~~`GET /api/admin/dashboard/courses/:id/progress`~~
>
> 将来必要になれば再設計（Phase 2 以降）。既存の GA4 ベース管理画面は触らない。

---

## CRUD 網羅性チェック

| テーブル | GET一覧 | GET詳細 | POST | PATCH/PUT | DELETE | 備考 |
|---------|---------|---------|------|-----------|--------|------|
| e_learning_users               | H-6 ✓ | H-6 ✓ | -    | H-6 ✓ | -    | 作成は OAuth コールバック側で自動作成・削除は退会時のサービス層 |
| e_learning_categories          | B / H-4 ✓ | H-4 ✓ | H-4 ✓ | H-4 ✓ | H-4 ✓ | 論理削除 |
| e_learning_contents            | D / H-3 ✓ | D / H-3 ✓ | H-3 ✓ | H-3 ✓ | H-3 ✓ | 論理削除 |
| e_learning_courses             | C / H-1 ✓ | C / H-1 ✓ | H-1 ✓ | H-1 ✓ | H-1 ✓ | 論理削除 |
| e_learning_course_chapters     | H-2 ✓ | -（コース詳細 GET に内包・一覧で十分） | H-2 ✓ | H-2 ✓ | H-2 ✓ | 親コース CASCADE |
| e_learning_course_videos       | C ✓（コース詳細に内包） | C ✓ | H-2 ✓ | H-2 ✓ | H-2 ✓ | 章 CASCADE |
| e_learning_materials           | G / H-5 ✓ | -（Phase 1 では出さない・一覧フィルタで代替） | H-5 ✓ | H-5 ✓ | H-5 ✓ | 一覧は target ごとに分離 |
| e_learning_purchases           | E / H-7 ✓ | H-7 ✓ | (Stripe Webhook 経由) | (Webhook 経由・status のみ) | -    | 物理削除不可 |
| e_learning_legacy_purchases    | H-7 ✓ | -    | (移行スクリプトのみ) | -    | -    | 閲覧のみ |
| e_learning_bookmarks           | F ✓ | -    | F ✓ | -    | F ✓ | 個人データ |
| e_learning_progress            | -（B013 視聴履歴は FE Server Component の Supabase 直クエリで対応・`/api/me/progress` 非公開） | -    | C / D「complete」✓ | -    | -    | 完了マーキングのみ・Route Handler は POST `/complete` のみ |
| e_learning_corporate_customers | -    | -    | -    | -    | -    | Phase 1 スコープ外（0件継続） |
| e_learning_corporate_users     | -    | -    | -    | -    | -    | 同上 |

---

## 認証要件マトリクス

> **※ admin 系エンドポイントの 401 UNAUTHORIZED は本マトリクスで一括定義のため、各 admin エンドポイント解説の「エラー」欄では原則として 401 を省略する**（マトリクスで「未ログイン: 401」を一律宣言済）。auth 系（`/api/me/**` 等）の 401 についても同様に本マトリクスを正とし、個別欄での重複記載は省略可。`403 FORBIDDEN` などコンテキスト依存のエラーは各エンドポイントで個別に列挙する。


| エンドポイント群 | 未ログイン | ログイン済 | 管理者 |
|----------------|-----------|-----------|-------|
| LP `/api/landing/summary` / カテゴリ `/api/categories` | ✓ | ✓ | ✓ |
| **コース一覧 `GET /api/courses`** | **-（401）** | ✓ | ✓ |
| コース詳細 `GET /api/courses/:slug` / 単体動画一覧 `GET /api/contents` / 単体動画詳細 `GET /api/contents/:id` | ✓ | ✓（viewer 情報も返却） | ✓ |
| 視聴用 `/play` `/videos/:videoId` `/complete` | -（401） | ✓（権限要・403 あり） | ✓ |
| 資料 GET `/courses/:slug/materials` `/contents/:id/materials` | -（401） | ✓（権限要・403 あり） | ✓ |
| `/api/me/**`（access / purchases / bookmarks GET・POST・DELETE / withdraw 含む） | -（401） | ✓ | ✓ |
| `/api/checkout` | -（401） | ✓ | ✓ |
| `/api/stripe/webhook` | service（署名検証） | service（署名検証） | service（署名検証） |
| `/api/admin/**` | -（401） | -（401） | ✓ |

詳細な未認証時の挙動は `docs/backend/logic/controllers/README.md` の「未認証時の方針（明文化）」を参照。コース一覧のログイン必須は gate1-confirmed-decisions §2（案A確定）と整合。

---

## DB スキーマとの整合確認

| schema.dbml の制約 | API 側のバリデーション | 整合 |
|------------------|----------------------|------|
| `e_learning_courses.slug` UNIQUE / varchar(100) NOT NULL | POST/PATCH で varchar(100)・UNIQUE 違反は 409 DUPLICATE_SLUG | ✓ |
| `e_learning_courses.category_id` NOT NULL | POST/PATCH で必須＋存在チェック | ✓ |
| `e_learning_courses.title` varchar(200) NOT NULL | POST/PATCH で 必須＋200字以内 | ✓ |
| `e_learning_courses.price` integer NULL（`is_free` 連動） | `is_free=false` 時に price 必須・正の整数 | ✓ |
| `e_learning_courses.stripe_price_id` varchar(64) UNIQUE NULL | `is_free=false` 時に必須・varchar(64)・違反時 409 DUPLICATE | ✓ |
| `e_learning_contents.stripe_price_id` varchar(64) UNIQUE NULL | `is_free=false` 時に必須・違反時 409 DUPLICATE_STRIPE_PRICE_ID | ✓ |
| `e_learning_course_chapters.(course_id, display_order)` UNIQUE（DEFERRABLE） | POST/PATCH で重複時 409 DUPLICATE_DISPLAY_ORDER、reorder API で DEFERRABLE 活用 | ✓ |
| `e_learning_course_videos.(chapter_id, display_order)` UNIQUE（DEFERRABLE） | POST/PATCH で重複時 409 DUPLICATE_DISPLAY_ORDER、reorder API で DEFERRABLE 活用 | ✓ |
| `e_learning_purchases.stripe_session_id` UNIQUE NOT NULL | Webhook 内のみ INSERT、UNIQUE 違反は冪等とみなして 200 終了 | ✓ |
| `e_learning_purchases.status` CHECK IN (`completed`, `refunded`) | API/Webhook 内で値固定 | ✓ |
| `e_learning_purchases` 排他的 CHECK（course_id XOR content_id） | `/api/checkout` で target_type に応じて片方のみ設定 | ✓ |
| `e_learning_bookmarks` 排他的 CHECK＋部分 UNIQUE | POST 側で target_type 排他＋既存時 409 | ✓ |
| `e_learning_materials` 排他的 CHECK | POST で `content_id` or `course_id` 片方のみ | ✓ |
| `e_learning_progress` 排他的 CHECK＋部分 UNIQUE | `/complete` 系で UPSERT（最初の completed_at を保持） | ✓ |
| `e_learning_users.has_full_access` NOT NULL DEFAULT false | デフォルト false／管理者 H-6 で切替 | ✓ |

---

## サブエージェントチェック結果

`@api-design-reviewer` 起動後に追記する：

- [ ] エンドポイント定義の完全性
- [ ] REST 命名規則
- [ ] DB スキーマ整合性
- [ ] CRUD 網羅性
- [ ] 認証・認可
- [ ] エラーレスポンス
- [ ] ページング・フィルタ
- [ ] レスポンス形式の一貫性
