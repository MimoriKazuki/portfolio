# course-service

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

コースとその下位構造（章・コース内動画）の取得・集約。FE が「LP・一覧・詳細・視聴」で必要とする統合データを services 1 経由で提供する。

## 使用場面・責務

- 公開コース一覧取得（公開判定・カテゴリフィルタ・ページング）
- コース詳細取得（章 → 動画のツリー構造を組立）
- 視聴用エンドポイントへの動画メタ供給
- 管理者向けコース詳細取得（未公開・論理削除済を含む）

## ルール・ビジネスロジック

### メソッド

| メソッド | 用途 |
|---------|------|
| `listPublished(query)` | 公開コース一覧 |
| `getPublishedBySlug(slug, viewerUserId?)` | コース詳細（章・動画ツリー含む） |
| `getCourseVideo(videoId, viewerUserId)` | コース内動画の視聴用メタ取得 |
| `getAdminTree(courseId)` | 管理画面用：未公開・論理削除済を含むツリー |

### `listPublished(query)`

- フィルタ：`category_id` `q`（タイトル部分一致） `is_featured`
- ソート：`display_order ASC, created_at DESC, id ASC`
- ページング：`page`（1始まり）`per_page`（デフォルト20、最大100）
- 取得条件：`is_published = true AND deleted_at IS NULL`
- カテゴリは JOIN 取得（id / name / slug）
- 視聴用フィールド：`video_count`（章配下動画の合計）と `total_duration`（FE が表示する文字列・現状は単純結合・将来は秒数集計）
- 戻り値：`{ items: ECourseListItem[]; total: number }`
  - `ECourseListItem`：ECourse + category + video_count + total_duration

### `getPublishedBySlug(slug, viewerUserId?)`

- 取得条件：`is_published = true AND deleted_at IS NULL`
- 階層取得：
  1. `CourseRepository.findPublishedBySlug(slug)` → ECourse + category
  2. `ChapterRepository.findByCourseId(course.id)` → ECourseChapter[]
  3. `CourseVideoRepository.findByCourseId(course.id)` → ECourseVideo[]（章ごとにグルーピングは services 側）
  4. `MaterialRepository.findByCourseId(course.id)` → EMaterial[]
- 視聴可否（viewerUserId が ある場合のみ）：
  - `access-service.getViewerAccess(userId)` で集約取得し has_access 算出
  - access_reason：`full_access` / `purchased` / `free_course` / `not_purchased`
- 未ログインの場合：viewer = `{ is_authenticated: false, has_access: null, access_reason: 'unauthenticated' }`

### `getCourseVideo(videoId, viewerUserId)`

1. `CourseVideoRepository.findById(videoId)`
2. `access-service.canViewCourseVideo(userId, videoId)` を呼ぶ
3. `allowed = false` → throw `ForbiddenNoAccessError`
4. 動画情報＋章＋コース＋次動画＋自分の完了状態を組立
5. `view_count` のインクリメントは別途 `CourseVideoRepository.incrementViewCount(videoId)` を呼ぶ
6. 戻り値：API 仕様 `GET /api/courses/:slug/videos/:videoId` の形（`docs/api/endpoints.md` 参照）

### 次動画の決定ロジック

- 同一章内の次動画（display_order 昇順）が存在すればそれ
- なければ次章の先頭動画（display_order 昇順）
- 章も末尾なら `next_video: null`（コース末尾）

### 管理者向け `getAdminTree(courseId)`

- フィルタ条件を外し、未公開・論理削除済も含めて返す
- アクセス権は管理者ガードで担保（services 内では admin 引数等を持たず、controllers 側でガード）

## NG

- access-service を経由せず権限判定を直接書かない
- 章・動画の `display_order` を services 内で書き換えない（管理 API 経由 / admin-course-service で集約）
- 視聴可否のキャッシュを長時間保持しない（リクエストスコープのみ）
- 未公開コースを未認証ユーザーに 404 以外で漏らさない（存在隠蔽）
