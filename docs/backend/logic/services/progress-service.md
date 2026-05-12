# progress-service

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

視聴進捗の記録とコース完了判定。N6/N7 確定により「完了フラグのみ」を保持する。

## 使用場面・責務

- `/api/courses/:slug/videos/:videoId/complete` から呼ばれる（コース内動画完了）
- `/api/contents/:id/complete` から呼ばれる（単体動画完了）
- コース詳細表示時のコース完了率算出（FE 表示用）
- 管理ダッシュボードの完了率集計

## ルール・ビジネスロジック

### メソッド

| メソッド | 用途 |
|---------|------|
| `markCourseVideoCompleted(userId, courseVideoId)` | コース内動画の完了マーク |
| `markContentCompleted(userId, contentId)` | 単体動画の完了マーク |
| `getCourseProgress(userId, courseId)` | コース内動画の完了数／全件数を返す |
| `isCourseCompleted(userId, courseId)` | 全動画完了か bool で返す |
| `getCompletedCourseVideoIds(userId, courseId)` | UI で「視聴済」マークを付けるための ID 配列 |

### `markCourseVideoCompleted(userId, courseVideoId)`

1. **権限チェック**：`access-service.canViewCourseVideo(userId, courseVideoId)` で `allowed = true` であることを確認。false なら 403 FORBIDDEN_NO_ACCESS
2. **完了レコード UPSERT**：
   - 既に `(user_id, course_video_id)` で進捗が存在 → 既存レコードを返す（completed_at は最初の日時を保持）
   - 存在しない → INSERT（completed_at = now()）
3. **コース完了判定**：
   - 当該動画が所属するコースを取得
   - そのコースの全 ECourseVideo 件数と、user の完了済 ECourseVideo 件数を比較
   - 全件完了なら `course_completed = true` を返却
4. 戻り値：`{ completed_at: string; course_completed: boolean }`

### `markContentCompleted(userId, contentId)`

1. **権限チェック**：`access-service.canViewContent(userId, contentId)`
2. **UPSERT**：`(user_id, content_id)` で部分 UNIQUE。既存があれば最初の completed_at を保持
3. 戻り値：`{ completed_at: string }`

### コース完了判定の最適化

- 1 SQL でカウント：
  ```sql
  SELECT
    (SELECT COUNT(*) FROM e_learning_course_videos cv
       JOIN e_learning_course_chapters c ON c.id = cv.chapter_id
       WHERE c.course_id = :course_id) AS total,
    (SELECT COUNT(*) FROM e_learning_progress p
       JOIN e_learning_course_videos cv2 ON cv2.id = p.course_video_id
       JOIN e_learning_course_chapters c2 ON c2.id = cv2.chapter_id
       WHERE p.user_id = :user_id AND c2.course_id = :course_id) AS completed;
  ```
- Supabase JS では RPC で呼び出すか、`select(... { count: 'exact', head: true })` を 2 本に分割

### 再視聴時の挙動

- 同一動画を再視聴して `/complete` が再呼出されても、最初の `completed_at` を保持（部分 UNIQUE と現在実装の方針が整合）
- `view_count` のインクリメントは「再生開始時（/play / /videos/:videoId 取得時）」に行う。`/complete` では行わない

### 削除時の挙動

- コース内動画 / 単体動画 が削除されたとき：FK CASCADE で進捗レコードも消える（個人データの整合性維持）
- コース完了率は分母が減るため、完了率が変動するのは正常動作

## NG

- 進捗に再生秒数・再生位置を保存しない（N6 確定）
- 再視聴で completed_at を上書きしない
- 視聴権限が無いユーザーから `/complete` を受け付けない（403）
- progress-service が `view_count` をインクリメントしない（責務分離・再生 API 側で対応）
