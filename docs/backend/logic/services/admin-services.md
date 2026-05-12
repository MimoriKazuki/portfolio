# admin-* services

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

管理画面（/admin/**）向けのサービス群。共通方針：「auth.users に存在＝管理者」のロールガードは controllers 側で行い、services 層はガード後の業務ロジックに専念する。

## 構成

| service | 主な責務 |
|---------|---------|
| `admin-course-service` | コース・章・動画の CRUD と業務ルール検証、reorder（順序入替） |
| `admin-content-service` | 単体動画の CRUD（業務ルール検証含む） |
| `admin-category-service` | カテゴリの CRUD、deleted_at / is_active の使い分け、参照ありなら IN_USE |
| `admin-material-service` | 資料の追加・更新・削除（排他的 FK 整合チェック） |
| `admin-user-service` | ユーザー一覧・詳細・has_full_access 切替 |
| `admin-purchase-service` | 購入履歴の閲覧（読み取りのみ） |
| ~~`admin-dashboard-service`~~ | ~~売上・購入件数・進捗集計（読み取りのみ）~~ — **N10 確定・Phase 1 スコープ外**（既存 GA4 ベース管理画面を継続） |

---

## ルール・ビジネスロジック（共通）

### バリデーション規約

- 文字列長：schema.dbml の varchar(N) と完全一致
- 必須／任意：schema の NOT NULL と完全一致
- 区分値：CHECK 制約に列挙された値のみ受理
- UNIQUE：違反時は 409 系コード（DUPLICATE_SLUG 等）に翻訳

### 業務ルール

- コース公開（is_published true 化）の前提：
  - `category_id` 必須
  - `is_free=false` の場合：`price` 正の整数、`stripe_price_id` varchar(64) 必須
  - 章 0 件のコースを公開してよいかは plan-lead 経由で確認事項（Phase 1 案では「OK」とする＝段階的に動画追加可能）
- カテゴリの論理削除（deleted_at セット）：
  - 紐付くコース／単体動画があれば 409 IN_USE
  - is_active=false で「一時非表示」、deleted_at で「廃止」
- ユーザーの `has_full_access` 切替：
  - 既購入レコードはマスキングしない（履歴として残す）
  - 切替時のログは Phase 1 では監査ログ未実装（Slack 通知のみ・どのユーザーが切替えたかを記録）

### reorder（順序一括更新）

- `admin-course-service.reorder(courseId, payload)` で章・動画の display_order を一括更新
- 1 トランザクション内で実施（RPC）
- DEFERRABLE INITIALLY DEFERRED の UNIQUE 制約を活用して一時重複を許容

---

## admin-course-service 詳細

### メソッド

- `list(filter)`：管理画面用一覧（未公開含む）
- `getDetail(id)`：ツリー取得（章・動画含む）
- `create(input)`：コース新規作成
- `update(id, input)`：コース更新（title / slug / category_id / is_free / price / stripe_price_id / is_published / is_featured / display_order / description / thumbnail_url）
- `softDelete(id)`：deleted_at セット
- `createChapter(courseId, input)` / `updateChapter(...)` / `deleteChapter(...)`
- `createCourseVideo(chapterId, input)` / `updateCourseVideo(videoId, input)` / `deleteCourseVideo(videoId)`
- `reorder(courseId, payload)`：章＋動画の display_order 一括更新（RPC）

### 公開ルール

- `update(id, { is_published: true, ... })` の業務チェック：
  - category_id 存在
  - is_free=false なら price > 0 かつ stripe_price_id != null
- 不整合があれば throw `ValidationError`

---

## admin-content-service 詳細

### メソッド

- `list(filter)`：単体動画一覧（未公開・論理削除済含む）
- `getDetail(id)`：単体動画詳細
- `create(input)` / `update(id, input)` / `softDelete(id)`

### バリデーション

- title varchar(200)、video_url text、duration varchar(20)、price 整数、stripe_price_id varchar(64) UNIQUE
- is_free=true のとき price / stripe_price_id は NULL

---

## admin-category-service 詳細

- 一覧（is_active false / deleted_at セット済を含む）
- create / update（name / slug / description / display_order / is_active）
- softDelete：紐付くコース／単体動画があれば 409 IN_USE
- 既存 6 件は deleted_at = NULL で維持

---

## admin-material-service 詳細

- create：`target_type ∈ {content, course}`、片方のみ NOT NULL（CHECK と整合）
- update：title / display_order の変更（target_id 変更は不可）
- delete：物理削除（個別資料は親 CASCADE 対象＝親削除で自動消滅）

---

## admin-user-service 詳細

- list：email / display_name 検索、ページング
- getDetail：has_full_access / purchases / 進捗サマリ
- updateFullAccess(userId, value)：has_full_access 切替のみ Phase 1 で許可
- listPurchases(userId)：当該ユーザーの購入履歴

### updateFullAccess の冪等性

- 入力：`userId: string` / `value: boolean`
- 業務ルール：
  - **冪等動作**：現在の `has_full_access` と同じ値を渡された場合、DB 更新は行わずレスポンスとして `{ id, has_full_access, changed: false }` を返す（409 は返さない）
  - 値が変わる場合のみ DB を UPDATE し、`changed: true` を返す
  - 切替時は Slack に「実行者 email / 対象 user / before→after」を必ず通知（監査ログ代替）
- 戻り値：`Promise<{ id: string; has_full_access: boolean; changed: boolean }>`

---

## admin-purchase-service 詳細

- listAll(filter)：user_id / status / 期間でフィルタ
- getDetail(id)：購入レコード詳細（Stripe Session ID / Payment Intent ID 含む）
- listLegacy()：legacy_purchases 一覧（読み取りのみ）

---

## admin-dashboard-service 詳細（Phase 1 スコープ外）

**N10 ディレクター判断（2026-05-12）**：
管理者ダッシュボードは既存（GA4 ベース）のまま継続。Eラーニング専用集計画面は Phase 1 では作らない。
本サービスは **Phase 1 では実装しない**。下記の構想は将来用のメモとして残す。

~~### メソッド（将来用・Phase 1 では未実装）~~

- `getSummary()`：
  - 売上：`SUM(amount) WHERE status='completed'`（refund 分は引かない・別途表示）
  - 購入件数：`COUNT(*) WHERE status='completed'`
  - アクティブユーザー数：`COUNT(DISTINCT user_id) WHERE last_accessed_at >= now() - interval '30 days'`
  - コース別完了率分布（上位）

- `getCourseProgressDistribution(courseId)`：
  - 全動画完了ユーザー数
  - 部分完了ユーザー数（1動画以上完了）
  - 未着手ユーザー数

### 集計の正

- 売上：自前 DB を正（Stripe Dashboard は補助）
- アクティブユーザー：`last_accessed_at` を基準（プレースホルダ。Phase 2 で詳細化）

---

## NG（共通）

- services でガード（管理者判定）を行わない（controllers 側）
- バリデーションを controllers で重複実装しない（services を信頼境界とする）
- 既存 `has_paid_access` を新規ロジックから参照しない
- 監査ログを Phase 1 で実装しない（必要なら Slack 通知のみ）
- 売上集計を Stripe Dashboard API から取得しない（自前 DB を正とする）
- **`ADMIN_EMAIL` 環境変数への依存を Phase 1 で除去する**（設計負債6・confirmed-decisions.md §7 参照）。コード未参照のためコード側変更は不要だが、Vercel／本番環境変数からの削除と `.env.local.template` からの除去が Phase 2 マイグレーションでの対象。新規実装は本変数を参照しない。
- 管理者ダッシュボード API（旧 H-8）は Phase 1 では実装しない（N10 確定）。既存 GA4 ベース管理画面に変更を加えない。
