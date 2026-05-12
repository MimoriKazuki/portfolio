# Controllers 層（Phase 1）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装時には `app/api/**/route.ts` が controllers の実体・場合により `app/lib/controllers/` に共通ヘルパを置く）

## 概要

Next.js App Router の `route.ts` が controllers の実体。HTTP リクエストを受け取り、services を呼び、結果を整形してレスポンスを返す。

## 使用場面・責務

- HTTP メソッドごとに分岐（GET / POST / PATCH / DELETE）
- リクエストの型・必須項目バリデーション（zod 等を想定・Phase 1 では未確定）
- 認証ガード（auth.getUser）
- 管理者ガード（auth.users に存在＝管理者）
- services 呼び出し
- 例外を `code` / HTTP ステータスに翻訳
- レスポンスの共通形式（`{ data }` / `{ error }`）への整形

## controllers の薄さ

- 1 route.ts は概ね 50〜100 行程度に収める
- ビジネスロジックは絶対に書かない（services に委譲）
- repositories を直接呼ばない

---

## 共通方針

### バリデーション

- 型チェック（zod 等）でリクエストの shape を検証
- 失敗時：400 VALIDATION_ERROR、`details` にフィールド名を載せる
- DB 制約（varchar(N)・NOT NULL）と完全整合させる
- バリデーションスキーマは services のドメインモデルに紐付けて配置（FE と共有可能な形を志向）

### 認証ガード

```
const supabase = await createClient()
const { data: { user } } = await supabase.auth.getUser()
if (!user) return errorResponse(401, 'UNAUTHORIZED', 'ログインが必要です')
```

- `e_learning_users.id` が必要な場合は `user-service.syncFromAuth(user)` で取得（冪等）

### 管理者ガード（/admin/**）

- middleware.ts での `/admin` 認証ガード（auth.getUser != null）を信頼
- API ルート側でも冗長的に `auth.getUser != null` をチェック（多層防御）
- ロール分離はしない（auth.users に存在＝管理者）

### Stripe Webhook ガード

```
const body = await request.text()
const signature = request.headers.get('stripe-signature')
const event = stripe.webhooks.constructEvent(body, signature, STRIPE_WEBHOOK_SECRET)
// 失敗時：400 STRIPE_SIGNATURE_INVALID
```

- body は **文字列のまま** services に渡す（再パースを避ける）

### エラー翻訳テーブル

| サービス層が throw | controllers の HTTP / code |
|------------------|--------------------------|
| ValidationError | 400 VALIDATION_ERROR |
| BadRequestError | 400 BAD_REQUEST |
| UnauthorizedError | 401 UNAUTHORIZED |
| ForbiddenError | 403 FORBIDDEN |
| ForbiddenNoAccessError | 403 FORBIDDEN_NO_ACCESS |
| NotFoundError | 404 NOT_FOUND |
| AlreadyExistsError | 409 ALREADY_EXISTS |
| DuplicateSlugError | 409 DUPLICATE_SLUG |
| AlreadyPurchasedError | 409 ALREADY_PURCHASED |
| AlreadyFullAccessError | 409 ALREADY_FULL_ACCESS |
| InUseError | 409 IN_USE |
| StripeApiError | 502 STRIPE_API_ERROR |
| StripeSignatureInvalidError | 400 STRIPE_SIGNATURE_INVALID |
| その他例外 | 500 INTERNAL_ERROR（Slack 通知） |

---

## controllers 一覧（route.ts のマッピング）

### 認証要否の表記

- **必須**：未ログインなら 401 UNAUTHORIZED を返す
- **任意**：未ログインでも 200 で応答する。ログインしていればユーザー個別情報（viewer 等）を返す
- **不要**：未ログイン前提で公開（誰でも 200）
- **管理者**：`/admin/**` 共通。auth.users 存在チェック（middleware ＋ controllers の二重防御）
- **service**：Stripe Webhook（署名検証）

### 認証・自分

| メソッド | パス | 認証要否 | 呼び出し先 |
|---------|------|---------|----------|
| GET | `/api/auth/user` | 必須 | `user-service.getMe` |
| POST | `/api/auth/logout` | 必須 | `supabase.auth.signOut()` |
| GET | `/api/me/access` | 必須 | `access-service.getViewerAccess` |
| GET | `/api/me/purchases` | 必須 | `admin-purchase-service.listForUser`（自分のみ） |
| GET | `/api/me/bookmarks` | 必須 | `bookmark-service.list` |

### 公開系

| メソッド | パス | 認証要否 | 未認証時の挙動 | 呼び出し先 |
|---------|------|---------|--------------|----------|
| GET | `/api/categories` | **不要** | 200・全件返却 | `category-service.listActive` |
| GET | `/api/landing/summary` | **不要** | 200・集計返却（個人情報は含まない） | `landing-service.getSummary` |
| GET | `/api/courses` | **必須** | 401（`/auth/login?returnTo=...` へ） | `course-service.listPublished` |
| GET | `/api/courses/:slug` | **任意** | 200・`viewer.is_authenticated=false` で返却 | `course-service.getPublishedBySlug(slug, userId?)` |
| GET | `/api/courses/:slug/videos/:videoId` | 必須 | 401 | `course-service.getCourseVideo` |
| POST | `/api/courses/:slug/videos/:videoId/complete` | 必須 | 401 | `progress-service.markCourseVideoCompleted` |
| GET | `/api/courses/:slug/materials` | 必須 + 権限要 | 401 / 403 | `material-service.listForCourse` |
| GET | `/api/contents` | **不要** | 200・viewer 情報は含めない | `content-service.listPublished` |
| GET | `/api/contents/:id` | **任意** | 200・`viewer.is_authenticated=false` で返却 | `content-service.getPublishedById` |
| GET | `/api/contents/:id/play` | 必須 | 401 | `content-service.playSingle` |
| POST | `/api/contents/:id/complete` | 必須 | 401 | `progress-service.markContentCompleted` |
| GET | `/api/contents/:id/materials` | 必須 + 権限要 | 401 / 403 | `material-service.listForContent` |

**未認証時の方針（明文化）**：
- `GET /api/landing/summary`：誰でも閲覧可。個人情報・viewer 情報を含まない集計のみ
- `GET /api/courses/[slug]` / `GET /api/contents/[id]`：未ログインでも詳細を閲覧可（章一覧・無料サンプル動画の存在を見せる）。viewer.is_authenticated=false で返す。視聴 API はログイン強制
- **`GET /api/courses`**：**ログイン必須**。コース一覧ページ `/e-learning/courses` は Udemy 同様の方針（gate1-confirmed-decisions §2 案A確定）で未ログインなら 401 → `/auth/login?returnTo=/e-learning/courses` へリダイレクト
- `GET /api/contents`：未ログインでも一覧を閲覧可（カード型 UI で「ログインして購入」ボタンが出せる）

### 購入・ブックマーク

| メソッド | パス | 認証要否 | 呼び出し先 |
|---------|------|---------|----------|
| POST | `/api/checkout` | 必須 | `checkout-service.startCheckout` |
| POST | `/api/bookmarks` | 必須 | `bookmark-service.add` |
| DELETE | `/api/bookmarks/:id` | 必須 | `bookmark-service.remove` |

### Stripe Webhook

| メソッド | パス | 認証要否 | 処理 |
|---------|------|---------|------|
| POST | `/api/stripe/webhook` | **service**（署名検証） | 下記分岐 |

- 署名検証 → 失敗時 400 STRIPE_SIGNATURE_INVALID（Stripe リトライ無効化）
- event.type 分岐：
  - `checkout.session.completed` → `stripe-webhook-service.handleCheckoutCompleted`
  - `charge.refunded` → `stripe-webhook-service.handleChargeRefunded`
  - その他 → 200 OK（無視・ログのみ）
- 既存実装の Slack 通知ロジックは services 側に移管

### 管理者

> 全 `/api/admin/**` は **管理者** 認証必須。middleware で `/admin` 配下を認証ガード ＋ 各 route 内で `auth.getUser != null` を多層防御で確認する。

| メソッド | パス | 呼び出し先 |
|---------|------|----------|
| GET / POST | `/api/admin/courses` | `admin-course-service.list / create` |
| GET / PATCH / DELETE | `/api/admin/courses/[id]` | `getDetail / update / softDelete` |
| GET / POST | `/api/admin/courses/[courseId]/chapters` | `list / createChapter` |
| PATCH / DELETE | `/api/admin/courses/[courseId]/chapters/[chapterId]` | `updateChapter / deleteChapter` |
| POST | `/api/admin/courses/[courseId]/chapters/[chapterId]/videos` | `createCourseVideo` |
| PATCH / DELETE | `/api/admin/course-videos/[videoId]` | `updateCourseVideo / deleteCourseVideo` |
| POST | `/api/admin/courses/[courseId]/reorder` | `admin-course-service.reorder` |
| GET / POST | `/api/admin/contents` | `admin-content-service.list / create` |
| GET / PATCH / DELETE | `/api/admin/contents/[id]` | `getDetail / update / softDelete` |
| GET / POST | `/api/admin/categories` | `admin-category-service.list / create` |
| GET | `/api/admin/categories/[id]` | `admin-category-service.getDetail` |
| PATCH / DELETE | `/api/admin/categories/[id]` | `update / softDelete` |
| GET / POST | `/api/admin/materials` | `admin-material-service.list / create` |
| PATCH / DELETE | `/api/admin/materials/[id]` | `update / delete` |
| GET | `/api/admin/users` | `admin-user-service.list` |
| GET / PATCH | `/api/admin/users/[id]` | `getDetail / updateFullAccess` |
| GET | `/api/admin/users/[id]/purchases` | `admin-user-service.listPurchases` |
| GET | `/api/admin/purchases` | `admin-purchase-service.listAll` |
| GET | `/api/admin/purchases/[id]` | `admin-purchase-service.getDetail` |
| GET | `/api/admin/legacy-purchases` | `admin-purchase-service.listLegacy` |

> ~~`/api/admin/dashboard/summary` / `/api/admin/dashboard/courses/[id]/progress`~~ は **Phase 1 スコープ外（N10 確定）**：既存 GA4 ベース管理画面を継続するため、専用ダッシュボード API は実装しない。

---

## NG

- controllers でビジネスロジック・SQL を書かない
- controllers から repositories を直接呼ばない（必ず services 経由）
- 認証情報を `localStorage` / `URL クエリ` から取らない
- 同じバリデーションを controllers と services で二重実装しない（services 側に寄せる）
- エラー文言を直接 `NextResponse.json` に書き散らさない（共通 `errorResponse(code, message)` ヘルパを使う）
- middleware と controllers で重複する重い処理（DB アクセス等）を入れない
