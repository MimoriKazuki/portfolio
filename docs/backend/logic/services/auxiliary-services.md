# 補助 services（user / bookmark / material / category / landing）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

主要 services の補完。それぞれ単一の関心事を担う小さなサービス群。

---

## user-service

### 責務

- 認証コールバック後の `e_learning_users` 同期
- ログイン中ユーザー情報取得

### メソッド

| メソッド | 用途 |
|---------|------|
| `syncFromAuth(authUser)` | OAuth コールバック時に呼ぶ。冪等な upsert |
| `getMe(authUser)` | GET /api/auth/user の本体 |
| `recordLastAccess(userId)` | ダッシュボード集計用に `last_accessed_at` を更新（任意・呼ぶ箇所は middleware か明示的なAPI） |

### `syncFromAuth(authUser)`

1. `UserRepository.findByAuthUserId(authUser.id)`
2. ヒットしない → INSERT（email / display_name / avatar_url）
3. ヒット → UPDATE（email / display_name / avatar_url を最新値で同期）
4. `deleted_at` がセット済（退会済）の場合：再活性化として `deleted_at = null` に戻し、has_full_access は維持（L1 確定：再登録で履歴引継）
5. 戻り値：EUser

### NG

- `has_full_access` を syncFromAuth で変更しない（管理画面手動切替のみ）
- ロール判定（管理者かどうか）を user-service で行わない（auth.users 存在チェックは middleware / controllers）

---

## bookmark-service

### 責務

- 自分のブックマーク一覧
- 追加・削除（コース or 単体動画）

### メソッド

- `list(userId, type)`：type = `'course' | 'content' | 'all'`
- `add(userId, targetType, targetId)`：
  1. 対象が公開中であることをチェック（NOT_FOUND を返す条件）
  2. 既存ブックマーク有無を `BookmarkRepository.existsByUserTarget` で確認 → 409 ALREADY_EXISTS
  3. INSERT
- `remove(userId, bookmarkId)`：
  1. 取得して自分のブックマークか確認（他人なら 404 NOT_FOUND）
  2. DELETE

### NG

- コース内動画（ECourseVideo）をブックマーク対象に含めない（M4 確定）

---

## material-service

### 責務

- コース／単体動画の資料一覧取得（視聴権限ガード込み）

### メソッド

- `listForCourse(slug, userId)`：
  1. `CourseRepository.findPublishedBySlug(slug)` で取得
  2. `access-service.canDownloadCourseMaterials(userId, course.id)` で許可確認
  3. 拒否 → 403 FORBIDDEN_NO_ACCESS
  4. 許可 → `MaterialRepository.findByCourseId(course.id)`
- `listForContent(id, userId)`：同様
- 管理系（admin-material-service）は別ファイル参照

### NG

- 資料単独の権限判定を access-service の外で書かない
- コース内動画個別の資料を返さない（M1 確定：紐付け不可）

---

## category-service

### 責務

- 公開カテゴリ一覧（is_active=true AND deleted_at IS NULL）
- 管理側カテゴリ操作は admin-category-service

### メソッド

- `listActive(query)`：公開一覧
- `findBySlug(slug)`：詳細（公開系）

### NG

- `deleted_at IS NOT NULL` のカテゴリを公開一覧に含めない

---

## landing-service

### 責務

- LP 表示用集計（注目コース・注目単体動画・受講生数等）

### メソッド

- `getSummary()`：
  - `featured_courses`：`is_published AND deleted_at IS NULL AND is_featured` 上位 N 件
  - `featured_contents`：単体動画同条件
  - `stats`：
    - `total_users`：`COUNT(*) FROM e_learning_users WHERE is_active = true AND deleted_at IS NULL`
    - `total_courses`：公開コース件数
    - `total_contents`：公開単体動画件数

### キャッシュ方針

- Phase 1 では DB 直集計（リアルタイム）
- 必要なら Phase 2 で 5 分キャッシュを検討（FE 側のキャッシュ戦略と合わせる）

### NG

- LP 集計に未公開・論理削除済を含めない
- ユーザー個別情報（has_full_access 等）を含めない（誰でも見られる集計のみ）
