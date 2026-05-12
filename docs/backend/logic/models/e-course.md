# ECourse / ECourseChapter / ECourseVideo モデル

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

コースとその下位構造（章・コース内動画）。1コース → 1〜N章 → 1〜N動画 の3階層ツリー。

## 使用場面・責務

- コース一覧・詳細・視聴 API の主データ
- 章・動画は `display_order` で順序を保つ
- コース購入の対象単位（章・動画単位の個別購入は禁止）

## ルール・ビジネスロジック

### ECourse フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `title` | string | ✓ | varchar(200) |
| `slug` | string | ✓ | UNIQUE。varchar(100) |
| `description` | string \| null |  | text |
| `thumbnail_url` | string \| null |  | text |
| `category_id` | string | ✓ | M2 確定：必須 |
| `is_free` | boolean | ✓ | デフォルト false |
| `price` | number \| null |  | 円・整数。`is_free=true` なら NULL |
| `stripe_price_id` | string \| null |  | varchar(64)。`is_free=true` なら NULL |
| `display_order` | number | ✓ | |
| `is_published` | boolean | ✓ | デフォルト false（新規作成時は非公開） |
| `is_featured` | boolean | ✓ | デフォルト false |
| `created_at` `updated_at` | string | ✓ | timestamptz |
| `deleted_at` | string \| null |  | 論理削除 |

### ECourseChapter フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `course_id` | string | ✓ | FK |
| `title` | string | ✓ | varchar(200) |
| `description` | string \| null |  | text |
| `display_order` | number | ✓ | `(course_id, display_order)` UNIQUE（DEFERRABLE） |

### ECourseVideo フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `chapter_id` | string | ✓ | FK |
| `title` | string | ✓ | varchar(200) |
| `description` | string \| null |  | text |
| `thumbnail_url` | string \| null |  | text |
| `video_url` | string | ✓ | text |
| `duration` | string \| null |  | varchar(20) |
| `is_free` | boolean | ✓ | コース未購入者にも視聴可フラグ |
| `display_order` | number | ✓ | `(chapter_id, display_order)` UNIQUE（DEFERRABLE） |
| `view_count` | number | ✓ | L5 確定。デフォルト 0 |

### 不変条件

- `is_free = true` のコースは `price` と `stripe_price_id` を持たない（CHECK 制約と整合）
- `is_published` を true にするには `category_id` 必須、`is_free=false` なら `price` と `stripe_price_id` も必須
- 章削除時、その章配下の動画は CASCADE で消える（schema.dbml の ON DELETE 方針）
- コース削除時、章 → 動画も CASCADE
- コース内動画は単独で販売不可

### ツリー取得時の合成

- コース詳細 API では ECourse + chapters[] + chapters[].videos[] を 1 レスポンスにまとめる
- 並び順は常に `display_order ASC, id ASC`（タイブレーク用）

## NG

- コース内動画に `price` / `stripe_price_id` を持たせない（販売単位ではない）
- 章・コース内動画に `deleted_at` を持たせない（親コース論理削除に追従）
- コース内動画への個別ブックマーク・個別資料を許可しない（M4・M1 確定）
