# EContent / ECategory / EMaterial モデル

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

単体動画（EContent）・カテゴリ（ECategory）・PDF 資料（EMaterial）のモデル定義。

## 使用場面・責務

- EContent：コースに含めない販売単位（単体購入対象）。既存 15 件はそのまま単体動画として継続
- ECategory：コースと単体動画の分類
- EMaterial：コースまたは単体動画に紐付く資料（排他的 FK）

## ルール・ビジネスロジック

### EContent フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `title` | string | ✓ | varchar(200) |
| `description` `thumbnail_url` | string \| null |  | text |
| `video_url` | string | ✓ | text |
| `duration` | string \| null |  | varchar(20) |
| `category_id` | string \| null |  | FK（任意） |
| `is_free` | boolean | ✓ | デフォルト false |
| `price` | number \| null |  | 円・NULL=無料 |
| `stripe_price_id` | string \| null |  | varchar(64)・UNIQUE |
| `display_order` | number | ✓ | |
| `is_published` | boolean | ✓ | デフォルト true（既存通り） |
| `is_featured` | boolean | ✓ | デフォルト false |
| `view_count` | number | ✓ | 既存 |
| `deleted_at` | string \| null |  | Phase 1 追加 |

### ECategory フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | |
| `name` | string | ✓ | varchar(100) |
| `slug` | string | ✓ | UNIQUE。varchar(100) |
| `description` | string \| null |  | |
| `display_order` | number | ✓ | |
| `is_active` | boolean | ✓ | デフォルト true |
| `deleted_at` | string \| null |  | L4 確定：Phase 1 追加 |

L4：`is_active=false`＝一時非表示、`deleted_at`＝廃止確定。併用する。

### EMaterial フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | |
| `content_id` | string \| null |  | 排他的 FK |
| `course_id` | string \| null |  | 排他的 FK（M1 確定・Phase 1 追加） |
| `title` | string | ✓ | varchar(200) |
| `file_url` | string | ✓ | text |
| `file_size` | number \| null |  | バイト |
| `display_order` | number | ✓ | 部分 UNIQUE（target ごと） |

### 不変条件（モデル＋DB CHECK で保証）

- `EMaterial`：`(content_id IS NOT NULL AND course_id IS NULL) OR (content_id IS NULL AND course_id IS NOT NULL)`
- `EContent`：`is_free=true` のとき `price` と `stripe_price_id` は NULL 必須
- `ECategory.deleted_at IS NOT NULL` のカテゴリは新規コース／単体動画から参照禁止（services 層でガード）

### 表示順タイブレーク

- 全エンティティ共通：`ORDER BY display_order ASC, created_at ASC, id ASC`

## NG

- EMaterial の `content_id` と `course_id` を同時に NOT NULL にしない（CHECK 違反）
- 単体動画とコース内動画を同一モデルで表現しない（ECourseVideo は別モデル・販売単位の違い）
- ECategory の物理削除を実装しない（既存運用と整合・`deleted_at` のみ）
