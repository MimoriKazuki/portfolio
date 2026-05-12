# エラーコード定義（Phase 1）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装完了後に埋まる：`app/lib/errors/`、`app/api/**/route.ts` の各 try-catch）

## 概要

E ラーニング機能（Phase 1）で API が返す統一エラーレスポンスのコード体系と HTTP ステータスマッピング。
ユーザー表示文言と開発者向けログを分離する方針。

## レスポンス共通フォーマット

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "title は必須です",
    "details": { "field": "title" }
  }
}
```

- `code`：SCREAMING_SNAKE_CASE。下表で定義されたものに限る。
- `message`：エンドユーザー向け日本語文言（PII 含めない）。
- `details`：任意。フィールド名・上限値など追加情報。

## エラーコード一覧

### 共通（HTTP 4xx 系）

| code | HTTP | 説明・発生条件 | message 例 |
|------|------|--------------|-----------|
| `VALIDATION_ERROR` | 400 | リクエスト Body / クエリ / パスのバリデーション失敗 | `入力内容に誤りがあります` |
| `BAD_REQUEST` | 400 | バリデーション以外の不正リクエスト（例：無料商品の購入） | `このリクエストは処理できません` |
| `UNAUTHORIZED` | 401 | 認証情報なし／無効 | `ログインが必要です` |
| `FORBIDDEN` | 403 | 認証は通ったが操作権限なし（管理者専用 API へ一般 User 等） | `この操作を行う権限がありません` |
| `FORBIDDEN_NO_ACCESS` | 403 | コンテンツ視聴・資料 DL の権限なし（§視聴権限優先順位で不可） | `このコンテンツを視聴する権限がありません` |
| `NOT_FOUND` | 404 | リソース不在／公開対象外（is_published=false や deleted_at IS NOT NULL も含む） | `指定されたコンテンツが見つかりません` |
| `METHOD_NOT_ALLOWED` | 405 | 該当メソッド未実装 | `このメソッドは許可されていません` |
| `CONFLICT` | 409 | 状態競合（汎用） | `現在の状態では処理できません` |
| `ALREADY_EXISTS` | 409 | 既存と重複（ブックマーク重複等） | `既に登録されています` |
| `DUPLICATE_SLUG` | 409 | コース等の slug 重複 | `この URL 識別子は既に使われています` |
| `DUPLICATE_DISPLAY_ORDER` | 409 | 章／コース内動画の `display_order` 重複（部分 UNIQUE 違反） | `表示順が他の項目と重複しています` |
| `DUPLICATE_STRIPE_PRICE_ID` | 409 | コース／単体動画の `stripe_price_id` UNIQUE 違反 | `この Stripe Price ID は既に他の商品で使われています` |
| `ALREADY_PURCHASED` | 409 | 同一 user × 同一 target を再購入 | `既にご購入済みです` |
| `ALREADY_FULL_ACCESS` | 409 | フルアクセス権者が新規購入を試みた | `既に全コンテンツ視聴可能です` |
| `IN_USE` | 409 | 削除対象が他レコードから参照されている（カテゴリにコース紐付き等） | `このカテゴリは使用中のため削除できません` |
| `RATE_LIMITED` | 429 | レート制限（実装は Phase 2 以降） | `しばらく時間をおいて再試行してください` |

### サーバ・外部連携（HTTP 5xx 系）

| code | HTTP | 説明・発生条件 | message 例 |
|------|------|--------------|-----------|
| `INTERNAL_ERROR` | 500 | 予期しないサーバエラー（捕捉漏れ含む） | `サーバ内部エラーが発生しました` |
| `DB_ERROR` | 500 | DB クエリ失敗（FK 違反・CHECK 違反 等） | `データベースエラーが発生しました` |
| `STRIPE_API_ERROR` | 502 | Stripe SDK 例外（ネットワーク・タイムアウト含む） | `決済サービスに接続できませんでした` |
| `STRIPE_SIGNATURE_INVALID` | 400 | Webhook 署名検証失敗（リトライ無効化のため 400 を返す） | `署名検証に失敗しました` |
| `SERVICE_UNAVAILABLE` | 503 | 一時的な利用不可（メンテナンス等・Phase 1 では未使用） | `現在ご利用いただけません` |

## エラーコード ←→ エンドポイント対応（主要）

| エンドポイント | 返し得るコード（主要） |
|--------------|----------------------|
| `GET /api/categories` | INTERNAL_ERROR |
| `GET /api/courses` | VALIDATION_ERROR、INTERNAL_ERROR |
| `GET /api/courses/:slug` | NOT_FOUND、INTERNAL_ERROR |
| `GET /api/courses/:slug/videos/:videoId` | UNAUTHORIZED、FORBIDDEN_NO_ACCESS、NOT_FOUND |
| `POST /api/courses/:slug/videos/:videoId/complete` | UNAUTHORIZED、FORBIDDEN_NO_ACCESS、NOT_FOUND |
| `GET /api/contents` / `:id` / `:id/play` / `:id/complete` | 同上（NOT_FOUND・FORBIDDEN_NO_ACCESS 等） |
| `POST /api/checkout` | VALIDATION_ERROR、UNAUTHORIZED、BAD_REQUEST、NOT_FOUND、ALREADY_PURCHASED、ALREADY_FULL_ACCESS、STRIPE_API_ERROR |
| `POST /api/stripe/webhook` | STRIPE_SIGNATURE_INVALID、INTERNAL_ERROR（リトライさせる場合 5xx） |
| `GET /api/me/access` `/me/purchases` `/me/bookmarks` | UNAUTHORIZED |
| `POST /api/me/bookmarks` | VALIDATION_ERROR、UNAUTHORIZED、NOT_FOUND、ALREADY_EXISTS |
| `DELETE /api/me/bookmarks/:id` | UNAUTHORIZED、NOT_FOUND |
| `/api/admin/**` | UNAUTHORIZED、FORBIDDEN、VALIDATION_ERROR、NOT_FOUND、CONFLICT、DUPLICATE_SLUG、DUPLICATE_DISPLAY_ORDER、DUPLICATE_STRIPE_PRICE_ID、IN_USE |

## ルール・ビジネスロジック

### A. ユーザー向け文言と内部ログの分離

- `message` には PII を含めない（メールアドレス・カード情報・Stripe ID 等）
- 詳細な原因（DB 制約名・Stripe Event ID 等）は `console.error` ＋ Slack 通知に送り、`details` には最小限のフィールド名のみ載せる
- 例：
  - NG：`message: "user user@example.com は既にコース uuid-xxxx を購入しています"`
  - OK：`message: "既にご購入済みです"` + `details: { target_type: "course" }`

### B. NOT_FOUND と FORBIDDEN_NO_ACCESS の使い分け

- リソース自体が `is_published = false` ／ `deleted_at IS NOT NULL` の場合：**NOT_FOUND**（存在隠蔽）
- リソースは公開中だが、当該ユーザーには視聴権限がない場合：**FORBIDDEN_NO_ACCESS**
- これにより「未公開コンテンツの存在」を権限なしユーザーに漏らさない

### C. 自分以外のリソース操作（ブックマーク等）

- DELETE 等で他人のリソースを指定された場合：**404 NOT_FOUND**（存在隠蔽・403 にしない）
- 「他人のもの」と分かるレスポンスを返さないことでスキャン攻撃の難易度を上げる

### D. Stripe Webhook の HTTP ステータス指針

- 署名検証失敗：**400 STRIPE_SIGNATURE_INVALID**（Stripe は 4xx ではリトライしない＝悪意あるリクエストを無限リトライさせない）
- 一時的処理失敗（DB ロック等）：**500 INTERNAL_ERROR**（Stripe は 5xx で最大 72 時間自動リトライ）
- 既に処理済みイベントの重複受信：**200 OK**（冪等性のため）
- 業務的に処理対象外のイベント type：**200 OK**（無視・ログのみ）

### E. CHECK 制約違反の翻訳

- `e_learning_purchases` 排他 CHECK 違反 → BAD_REQUEST + `details.constraint: "purchases_target_exclusive"`
- `e_learning_bookmarks` 排他 CHECK 違反 → BAD_REQUEST 同上
- 通常はバリデーションで先回りキャッチして VALIDATION_ERROR を返す。CHECK 違反まで到達した場合は DB_ERROR ではなく BAD_REQUEST 扱い（業務的に防止可能）

### F. UNIQUE 制約違反の翻訳

- `e_learning_courses.slug` / `e_learning_categories.slug` UNIQUE → 409 DUPLICATE_SLUG
- `e_learning_courses.stripe_price_id` / `e_learning_contents.stripe_price_id` UNIQUE → 409 DUPLICATE_STRIPE_PRICE_ID
- `e_learning_course_chapters.(course_id, display_order)` UNIQUE（DEFERRABLE） → 409 DUPLICATE_DISPLAY_ORDER
- `e_learning_course_videos.(chapter_id, display_order)` UNIQUE（DEFERRABLE） → 409 DUPLICATE_DISPLAY_ORDER
- `e_learning_purchases.stripe_session_id` UNIQUE：Webhook 内で重複受信を意味する → 200 OK で終了（冪等）
- `e_learning_bookmarks` 部分 UNIQUE → 409 ALREADY_EXISTS

### G. ログ／監視

- 全 5xx は Slack 通知（既存 `SLACK_WEBHOOK_URL` を流用）
- 全 4xx は通常のサーバログのみ（429 が短時間に集中する場合のみアラート）
- Stripe Webhook の処理失敗は Slack に「event.id・event.type・error.message」を必ず含めて通知

### H. クライアント側の汎用ハンドリング

- 401 受信時：自動で `/auth/login?returnTo=...` へリダイレクト
- 5xx 受信時：トースト「サーバエラー」＋管理者向けには Slack 通知済の旨を案内
- 409 ALREADY_PURCHASED / ALREADY_FULL_ACCESS：購入ボタンを「視聴へ」に切替

## NG

- 同じ業務的意味で 2 種類のコードを使い分けない（例：購入済を ALREADY_EXISTS と ALREADY_PURCHASED で並走させない）
- `details` に `password` `email` `stripe_customer_id` 等の PII を含めない
- HTTP ステータス無視で 200 + `error` を返さない（成功とエラーの区別を保つ）
- カスタムエラーフィールド（`success: false` 等）を追加しない。`error` キーの有無のみで判定する
- `INTERNAL_ERROR` をデフォルト返しにしない（捕捉漏れの兆候を見逃さないため、原因不明な箇所は明示的に 500 を投げる前にログで原因特定）
