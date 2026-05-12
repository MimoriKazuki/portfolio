# EBookmark / EProgress モデル

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

個人データ（ブックマーク・視聴進捗）のモデル定義。いずれも排他的 FK（course or content / course_video or content）の構造。

## 使用場面・責務

- EBookmark：ユーザーがコースまたは単体動画を後で見るためにマーク
- EProgress：視聴完了の事実を保持（N6 確定：完了フラグのみ）

## ルール・ビジネスロジック

### EBookmark フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `user_id` | string | ✓ | FK（M4 確定：`e_learning_users.id` に統一） |
| `course_id` | string \| null |  | 排他的 FK |
| `content_id` | string \| null |  | 排他的 FK |
| `created_at` | string | ✓ | timestamptz |

### EProgress フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string | ✓ | PK |
| `user_id` | string | ✓ | FK |
| `course_video_id` | string \| null |  | 排他的 FK |
| `content_id` | string \| null |  | 排他的 FK |
| `completed_at` | string | ✓ | 視聴完了日時（N6・N7 確定） |
| `created_at` `updated_at` | string | ✓ | timestamptz |

### 不変条件

- EBookmark：`(course_id IS NOT NULL AND content_id IS NULL) OR (course_id IS NULL AND content_id IS NOT NULL)`
- EProgress：`(course_video_id IS NOT NULL AND content_id IS NULL) OR (course_video_id IS NULL AND content_id IS NOT NULL)`
- EBookmark 部分 UNIQUE：`(user_id, course_id) WHERE course_id IS NOT NULL` ／ `(user_id, content_id) WHERE content_id IS NOT NULL`
- EProgress 部分 UNIQUE：`(user_id, course_video_id)` ／ `(user_id, content_id)`（再視聴は最初の completed_at を保持）

### 派生属性

- EBookmark：`type` を `course_id !== null ? 'course' : 'content'` で導出（API レスポンス成形は services 層）
- EProgress：完了済の事実のみ保持。再生位置・秒数は持たない（N6・N7 確定）

### コース完了判定

- コース完了 = そのコース内の全 ECourseVideo に対応する EProgress レコードが存在
- 末尾到達で完了（Udemy 同様・N7 確定）
- 集計は services 層の `progress-service` が SQL 1 本（COUNT）で算出

## NG

- EBookmark にコース内動画（ECourseVideo）を持たせない（M4 確定：コース内動画はブックマーク対象外）
- EProgress の再視聴で `completed_at` を上書きしない（最初の完了日時を保持）
- 進捗の「再生位置秒数」「再生％」をモデルに追加しない（N6 確定：完了フラグのみ）
