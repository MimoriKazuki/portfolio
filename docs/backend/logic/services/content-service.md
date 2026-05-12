# content-service

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

単体動画（コースに属さない販売単位）の取得と視聴メタ提供。既存 15 件はそのまま単体動画として継続。

## 使用場面・責務

- 公開単体動画一覧
- 単体動画詳細（資料・viewer 情報含む）
- 視聴用メタ取得（権限判定込み）

## ルール・ビジネスロジック

### メソッド

| メソッド | 用途 |
|---------|------|
| `listPublished(query)` | 公開単体動画一覧 |
| `getPublishedById(id, viewerUserId?)` | 単体動画詳細 |
| `playSingle(id, userId)` | 視聴用メタ取得＋view_count インクリメント |

### `listPublished(query)`

- フィルタ：`category_id` `q` `is_featured`
- 取得条件：`is_published = true AND deleted_at IS NULL`
- ソート：`display_order ASC, created_at DESC, id ASC`
- JOIN：カテゴリ
- 戻り値：`{ items: EContentListItem[]; total: number }`

### `getPublishedById(id, viewerUserId?)`

- 取得条件：`is_published = true AND deleted_at IS NULL`
- 資料：`MaterialRepository.findByContentId(id)`
- viewer 情報（ログイン時のみ）：`access-service.canViewContent(userId, id)` で算出
- access_reason：`full_access` / `content_purchased` / `free_content` / `not_purchased` / `unauthenticated`

### `playSingle(id, userId)`

1. `ContentRepository.findById(id)` で取得（is_published / deleted_at チェック）
2. `access-service.canViewContent(userId, id)` で許可確認
3. `allowed = false` → throw `ForbiddenNoAccessError`
4. 視聴用 URL を含むレスポンスを返却
5. `view_count` インクリメント（同一ユーザー連続再生でも +1：既存運用踏襲）
6. 進捗の完了状態を返却（`ProgressRepository.findByUserAndContent`）

### `view_count` の精度方針

- Phase 1 は「再生 API 呼び出し回数」をそのままカウント
- ユニーク視聴数集計は Phase 2 以降で進捗テーブルベースに切替検討
- 既存運用と同じため、ここでロジック変更しない

## NG

- 単体動画をコースの動画と混同しない（ECourseVideo とは別エンティティ）
- 単体動画の購入レコードを `course_id` 経由で作成しない（PurchaseRepository 側で排他保証）
- 視聴可否を access-service 以外で判定しない
- `view_count` インクリメントを `/complete` 側で行わない
