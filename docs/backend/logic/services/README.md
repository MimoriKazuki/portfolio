# Services 層（Phase 1）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装時には `app/lib/services/` 配下を想定）

## 概要

ビジネスロジックを集約する層。controllers から呼ばれ、repositories を通じて DB アクセスする。
services 間の相互呼び出しは「単方向」を守る（双方向呼び出しを作らない）。

## 使用場面・責務

- 視聴権限判定（access-service が唯一の権限ロジック）
- Stripe Checkout 開始（checkout-service）
- Stripe Webhook 処理（stripe-webhook-service）
- 視聴進捗の記録・コース完了判定（progress-service）
- コース／単体動画／カテゴリの集約取得（course-service / content-service）
- 管理操作の業務ルール検証（admin-* service）

## 一覧

| Service | 主要メソッド | 依存 Repository |
|---------|------------|----------------|
| `user-service` | `syncFromAuth(authUser)` `getMe(authUser)` | `UserRepository` |
| `access-service` | `getViewerAccess(userId)` `canViewCourseVideo(userId, courseId)` `canViewContent(userId, contentId)` `canDownloadCourseMaterials(...)` `canDownloadContentMaterials(...)` | `UserRepository` `PurchaseRepository` |
| `course-service` | `listPublished` `getPublishedWithTree(slug, viewerUserId?)` `getAdminTree(id)` | `CourseRepository` `ChapterRepository` `CourseVideoRepository` `MaterialRepository` `access-service` |
| `content-service` | `listPublished` `getPublishedById(id, viewerUserId?)` `playSingle(id, userId)` | `ContentRepository` `MaterialRepository` `access-service` |
| `category-service` | `listActive` `listAdmin` `create` `update` `softDelete` | `CategoryRepository` `CourseRepository` `ContentRepository` |
| `checkout-service` | `startCheckout(userId, targetType, targetId, cancelReturnUrl)` | `UserRepository` `CourseRepository` `ContentRepository` `PurchaseRepository`（Stripe SDK） |
| `stripe-webhook-service` | `handleCheckoutCompleted(event)` `handleChargeRefunded(event)` `dispatch(event)` | `PurchaseRepository` `UserRepository`（Service Role） |
| `progress-service` | `markCourseVideoCompleted(userId, courseVideoId)` `markContentCompleted(userId, contentId)` `getCourseProgress(userId, courseId)` | `ProgressRepository` `CourseVideoRepository` |
| `bookmark-service` | `list(userId, type)` `add(userId, targetType, targetId)` `remove(userId, bookmarkId)` | `BookmarkRepository` `CourseRepository` `ContentRepository` |
| `material-service` | `listForCourse(slug, userId)` `listForContent(id, userId)` `adminCreate/Update/Delete(...)` | `MaterialRepository` `access-service` |
| `admin-course-service` | コース・章・動画・順序更新の業務ルール検証 | `CourseRepository` `ChapterRepository` `CourseVideoRepository` `CategoryRepository` |
| `admin-content-service` | 単体動画の業務ルール検証 | `ContentRepository` `CategoryRepository` |
| `admin-user-service` | フルアクセス切替 / ユーザー詳細 | `UserRepository` `PurchaseRepository` `ProgressRepository` |
| ~~`admin-dashboard-service`~~ | ~~売上・購入件数・進捗集計~~ | **Phase 1 スコープ外（N10 確定）**：既存 GA4 ベース管理画面を継続 |
| `landing-service` | LP 表示用集計 | `CourseRepository` `ContentRepository` `UserRepository` |

### Phase 1 で除去するもの（既存実装からの差分）

- `STRIPE_E_LEARNING_PRICE_ID` 固定方式 → DB の `stripe_price_id` 参照に切替（checkout-service / stripe-webhook-service）
- `e_learning_users.has_paid_access` → `has_full_access` への段階移行（access-service が唯一の参照点）
- **`ADMIN_EMAIL` 環境変数 → Phase 1 で除去**（設計負債6 / confirmed-decisions §7）。コード未参照のため新規実装で参照しない・Vercel 等の本番環境変数からの削除と `.env.local.template` からの除去は Phase 2 マイグレーションのスコープ
- 旧管理者ダッシュボード集計の構想 → Phase 1 スコープ外（N10）。既存 GA4 ベース管理画面に変更を加えない

## ルール・ビジネスロジック

### 依存方向

- controllers → services → repositories → DB
- services 間：一方向のみ。代表的な依存：
  ```
  course-service / content-service / material-service → access-service
  admin-* service →（必要時）access-service / 各 repository
  checkout-service → access-service（フルアクセス／既購入チェック）
  stripe-webhook-service → user-service（has_full_access 操作はしない・購入レコード操作のみ）
  ```

### 純粋関数として書く

- 入出力は明示する（暗黙のグローバル状態を持たない）
- 副作用がある場合は戻り値で表明する（例：`{ created: EPurchase }`）

### エラー処理

- repositories から投げられた DB エラー（UNIQUE 違反・CHECK 違反）を、業務的なエラー（例：`AlreadyExistsError`／`AlreadyPurchasedError`）に翻訳する
- controllers 側で `code` に対応する HTTP ステータスを返す

### トランザクション境界

- 複数 repository を跨ぐ更新は services でまとめ、RPC を呼ぶか「失敗時の補償」を明示する
- Phase 1 で主にトランザクションが必要な箇所：
  - checkout：DB 書き込み無し（Stripe Session 作成のみ）→ 不要
  - webhook checkout.session.completed：購入 INSERT 1 本 → 単一クエリで完結
  - webhook charge.refunded：UPDATE 1 本 → 単一クエリで完結
  - admin reorder：章・動画の display_order 一括更新 → RPC（DEFERRABLE 制約と組み合わせ）

### Webhook 順序逆転対策

- charge.refunded が checkout.session.completed より先に届いた場合、PurchaseRepository.markRefunded で対象が見つからない
- 対応：services で 200 OK を返しつつ Slack に「未対応イベント・後続イベントを待機」と通知。Stripe の再送リトライで後発イベントが届いた後、整合性が取れる
- 実運用：Stripe Dashboard で手動再処理する管理画面 UI は Phase 2 以降。Phase 1 ではログのみ。

## NG

- services から `app/api/**` の Next.js コンテキスト（`request` `response`）を参照しない
- repositories を経由せず Supabase クライアントを直接叩かない
- services 同士で双方向依存を作らない（必要なら共通の小さなヘルパに切り出す）
- ビジネスロジックを controllers に書かない（controllers はバリデーション・呼び出し・整形のみ）
