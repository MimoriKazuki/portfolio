# Repositories 層（Phase 1）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装時には `app/lib/repositories/` 配下を想定）

## 概要

Supabase JS クライアントを介した DB アクセスを集約する層。ビジネスロジックは持たず「SQL 1 本相当のクエリ」を models 型で返す。

## 使用場面・責務

- services 層のみが repositories を呼ぶ（controllers から直接呼ばない）
- 1 メソッド = 1 SQL（または 1 トランザクション）が原則
- 戻り値は必ず models 型または `null` / 配列
- 例外は repository では握り潰さず、エラー種別を分かるように rethrow

## 一覧（Phase 1）

| Repository | 主要メソッド | 対応テーブル |
|-----------|------------|------------|
| `UserRepository` | `findByAuthUserId` `findById` `upsertFromAuth` `updateFullAccess` `softDelete` | `e_learning_users` |
| `CategoryRepository` | `findAll` `findById` `findActiveAll` `create` `update` `softDelete` | `e_learning_categories` |
| `ContentRepository` | `findPublishedList` `findPublishedById` `findById` `create` `update` `softDelete` `incrementViewCount` | `e_learning_contents` |
| `CourseRepository` | `findPublishedList` `findPublishedBySlug` `findById` `findBySlug` `create` `update` `softDelete` | `e_learning_courses` |
| `ChapterRepository` | `findByCourseId` `create` `update` `delete` `reorder` | `e_learning_course_chapters` |
| `CourseVideoRepository` | `findById` `findByChapterId` `findByCourseId` `create` `update` `delete` `incrementViewCount` | `e_learning_course_videos` |
| `MaterialRepository` | `findByContentId` `findByCourseId` `findById` `create` `update` `delete` | `e_learning_materials` |
| `PurchaseRepository` | `findCompletedByUser` `findById` `insertFromWebhook` `markRefunded` `existsCompleted` | `e_learning_purchases` |
| `LegacyPurchaseRepository` | `findByUserId` `findAll` | `e_learning_legacy_purchases`（読み取りのみ） |
| `BookmarkRepository` | `findByUser` `findById` `existsByUserTarget` `create` `delete` | `e_learning_bookmarks` |
| `ProgressRepository` | `upsertCourseVideoCompletion` `upsertContentCompletion` `findByUserAndCourse` `findByUserAndContent` `countCompletedInCourse` | `e_learning_progress` |

## ルール・ビジネスロジック

### Supabase クライアントの使い分け

- 通常 API：`createClient()`（リクエストごとに生成・RLS 経由のユーザーセッションで動作）
- Stripe Webhook 内：Service Role Key で別クライアントを生成（RLS を迂回）
- リポジトリ内では「どちらのクライアントを使うか」を引数で受ける。デフォルトは通常クライアント

### クエリ規約

- 一覧取得は必ず `is_published`／`deleted_at` のフィルタを明示
- `display_order ASC, id ASC` でタイブレーク
- ページング：`range(offset, offset + limit - 1)` を使う
- 件数：`select('*', { count: 'exact' })` で総件数を取得
- JOIN 相当：Supabase の `select('..., e_learning_categories(*)')` 形式を使う（多重 JOIN は services 層で組み合わせる）

### 冪等性

- `PurchaseRepository.insertFromWebhook`：`stripe_session_id` UNIQUE 違反時は SELECT に切り替えて既存レコードを返す
- `BookmarkRepository.create`：UNIQUE 違反を 409 に翻訳するのは services 層の責務

### トランザクション

- Supabase JS は明示的トランザクションを持たないため、複数操作は RPC（PL/pgSQL 関数）で原子化する
- Phase 1 で RPC を使う箇所：
  - L3 移行スクリプト（既存 6 件の legacy 退避）
  - M5 安全順序の段階移行（カラム追加・データ移行・カラム削除）
  - 章・動画の `display_order` 一括入替（DEFERRABLE INITIALLY DEFERRED の UNIQUE と組み合わせ）

### 戻り値の規約

- 単一取得：`Promise<EModel | null>`
- 一覧：`Promise<{ items: EModel[]; total: number }>`
- 作成：`Promise<EModel>`
- 更新：`Promise<EModel>`（更新後の行を返す）
- 削除：`Promise<{ ok: true }>` または例外

## NG

- repositories でビジネスルール判定を書かない（権限チェック・価格計算 等）
- repositories で HTTP ステータスを意識しない（例外は素のまま rethrow）
- 1 メソッド内で複数の独立したクエリを混ぜない（必要なら別メソッドに分割）
- `select('*')` 既定でカラム漏れを許容しない場合は明示列挙する（Phase 1 では `*` 許容・ただし views の URL など機密に近いカラムは services 側で除外）
- Service Role Key を通常 API のリポジトリ呼び出しから渡さない（権限昇格を Webhook 等の限られた箇所に限定）
