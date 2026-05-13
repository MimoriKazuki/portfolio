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
| `recordLastAccess(userId)` | ダッシュボード集計用に `last_accessed_at` を更新（**Phase 1 では呼び出さない・後述参照**） |
| `withdraw(userId)` | 退会処理：`deleted_at` セット ＋ 個人情報マスキング（FE 退会フローから呼ばれる） |

### `syncFromAuth(authUser)`

1. `UserRepository.findByAuthUserId(authUser.id)`
2. ヒットしない → INSERT（email / display_name / avatar_url）
3. ヒット → UPDATE（email / display_name / avatar_url を最新値で同期）
4. `deleted_at` がセット済（退会済）の場合：再活性化として `deleted_at = null` に戻し、has_full_access は維持（L1 確定：再登録で履歴引継）
5. 戻り値：EUser

### `withdraw(userId)`

1. `UserRepository.findById(userId)` で対象を取得（無ければ NOT_FOUND）
2. 既に `deleted_at IS NOT NULL` ならそのまま成功扱い（冪等）
3. 単一 UPDATE で以下をセット：
   - `deleted_at = now()`
   - `display_name = NULL`（L1 マスキング方針）
   - `avatar_url = NULL`（L1 マスキング方針）
   - `is_active = false`
4. `email` は **マスキングしない**（L1 確定：同一メール再登録時の履歴引継のため保持）
5. 戻り値：`Promise<{ ok: true }>`

備考：
- Supabase Auth の `signOut()` は本サービス内では呼ばない（責務分離）。FE の退会フロー Controller 層で `withdraw(userId)` 成功後に `supabase.auth.signOut()` を実行し、Cookie をクリアする
- `e_learning_purchases` / `e_learning_progress` / `e_learning_bookmarks` 等のデータは保持（個人特定性が低い・購入履歴は税務観点でも保持必須）
- `auth.users` 本体の削除は Phase 1 では行わない（Supabase 側に保持・再登録時に同一 `auth.users.id` が再利用される運用）

### `recordLastAccess(userId)` の Phase 1 取扱

- **Phase 1 では本メソッドを呼び出さない**（middleware・API Route いずれからも呼ばない）
- 理由：ダッシュボード集計（E ラーニング専用）は N10 ディレクター判断により Phase 1 スコープ外（既存 GA4 ベース管理画面を継続）。`last_accessed_at` の更新需要が現時点では存在しない
- DB 側：`e_learning_users.last_accessed_at` カラム自体は既存スキーマに残存（schema.dbml）。NULL 許容のため未更新でも整合性に影響なし
- Phase 2 以降で「呼び出しタイミング・更新頻度（毎リクエスト／1 日 1 回 等）」を確定する。現段階では仕様未確定として進める

### NG

- `has_full_access` を syncFromAuth で**勝手に下げない**（一度 true になったユーザーを syncFromAuth で false に戻す変更は禁止・退会／管理画面手動切替のみが減算経路）
  - ただし「企業ユーザー昇格パス」（active な `e_learning_corporate_users` 配下のメールでログイン）の場合のみ、**syncFromAuth 内で has_full_access を true へ昇格する**ことを許容する。これは既存 OAuth callback 挙動を継承し、`flow.md §A`（デフォルト false）/ §G（再活性化時の履歴引継）と整合する例外。
  - 2026-05-13 修正：当初「syncFromAuth では一切変更しない」と記載していたが、企業昇格パスの業務要件と矛盾するため明確化。実装は `app/lib/services/user-service.ts` の `syncFromAuth` を正とする
- ロール判定（管理者かどうか）を user-service で行わない（管理者判定は `app/lib/auth/admin-guard.ts` の `isAdminEmail` / `requireAdmin` に集約）
- `withdraw` 内で `email` をマスキングしない（L1 確定：再登録時の履歴引継のため email 保持必須）
- `withdraw` 内で Supabase Auth の signOut を呼ばない（Controller 層の責務）

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
