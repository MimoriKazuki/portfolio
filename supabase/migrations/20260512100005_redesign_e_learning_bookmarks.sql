-- =============================================================================
-- Phase 2 Step 1 / ファイル⑤：e_learning_bookmarks 再設計
--
-- 起点：docs/backend/database/schema.dbml §10, schema-rationale.md §C1 / 設計負債1
-- 対象：user_id マッピング更新・FK 参照先変更・course_id 追加・UNIQUE 再設計・RLS 書き換え
--
-- M4 確定：
--   - course_id 追加（コースもブックマーク対象）
--   - コース内動画はブックマーク対象外
-- 設計負債1：user_id FK を auth.users.id から e_learning_users.id に変更
--   - 既存3件のデータは user_id（=auth_user_id）を e_learning_users.id にマッピング更新してから FK を張り替え
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. user_id マッピング更新（auth.users.id → e_learning_users.id）
-- -----------------------------------------------------------------------------
-- 既存3件の user_id は auth.users.id が入っているため、e_learning_users.auth_user_id とマッピングして
-- 対応する e_learning_users.id に書き換える。
--
-- 適用前の事前確認：
--   - SELECT COUNT(*) FROM e_learning_bookmarks; → CLAUDE.md 記載の 3 件と一致するか確認
--   - 全 user_id が e_learning_users.auth_user_id に存在することを確認：
--     SELECT b.id FROM e_learning_bookmarks b
--      LEFT JOIN e_learning_users u ON u.auth_user_id = b.user_id
--      WHERE u.id IS NULL;
--     → 0 件であること（残っていれば該当 e_learning_users レコードを先に作成する必要あり）
UPDATE e_learning_bookmarks
   SET user_id = u.id
  FROM e_learning_users u
 WHERE e_learning_bookmarks.user_id = u.auth_user_id;

-- -----------------------------------------------------------------------------
-- 2. FK 参照先変更（auth.users → e_learning_users）
-- -----------------------------------------------------------------------------
ALTER TABLE e_learning_bookmarks
  DROP CONSTRAINT IF EXISTS e_learning_bookmarks_user_id_fkey;

ALTER TABLE e_learning_bookmarks
  ADD CONSTRAINT e_learning_bookmarks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES e_learning_users(id) ON DELETE CASCADE;

-- -----------------------------------------------------------------------------
-- 3. course_id 追加（M4 確定）
-- -----------------------------------------------------------------------------
ALTER TABLE e_learning_bookmarks
  ADD COLUMN IF NOT EXISTS course_id uuid NULL REFERENCES e_learning_courses(id) ON DELETE CASCADE;

COMMENT ON COLUMN e_learning_bookmarks.course_id IS 'M4 確定：コースFK（コースもブックマーク対象・content_id と排他）';

-- -----------------------------------------------------------------------------
-- 4. content_id を NULL 許容に変更（M4：course か content か排他）
-- -----------------------------------------------------------------------------
-- 既存スキーマでは content_id NOT NULL だが、course_id 追加に伴い NULL 許容に変更
ALTER TABLE e_learning_bookmarks
  ALTER COLUMN content_id DROP NOT NULL;

-- -----------------------------------------------------------------------------
-- 5. UNIQUE 再設計
-- -----------------------------------------------------------------------------
-- 既存 UNIQUE(user_id, content_id) を DROP → 部分 UNIQUE 2 本に分割
ALTER TABLE e_learning_bookmarks
  DROP CONSTRAINT IF EXISTS e_learning_bookmarks_user_id_content_id_key;

CREATE UNIQUE INDEX e_learning_bookmarks_user_course_partial_key
  ON e_learning_bookmarks(user_id, course_id) WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX e_learning_bookmarks_user_content_partial_key
  ON e_learning_bookmarks(user_id, content_id) WHERE content_id IS NOT NULL;

-- -----------------------------------------------------------------------------
-- 6. 排他 CHECK 制約（M4：course or content 排他）
-- -----------------------------------------------------------------------------
ALTER TABLE e_learning_bookmarks
  ADD CONSTRAINT e_learning_bookmarks_target_exclusive_chk
  CHECK (
    (course_id IS NOT NULL AND content_id IS NULL)
    OR (course_id IS NULL AND content_id IS NOT NULL)
  );

-- -----------------------------------------------------------------------------
-- 7. インデックス追加（FK 用）
-- -----------------------------------------------------------------------------
CREATE INDEX IF NOT EXISTS idx_e_learning_bookmarks_course_id ON e_learning_bookmarks(course_id);
-- 既存 idx_e_learning_bookmarks_user_id / _content_id は維持

-- -----------------------------------------------------------------------------
-- 8. RLS ポリシー書き換え（user_id 参照先変更に追従）
-- -----------------------------------------------------------------------------
-- 旧：USING (auth.uid() = user_id)  ※ user_id が auth.users.id 前提
-- 新：USING (user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()))
--     ※ user_id が e_learning_users.id に変更されたため
DROP POLICY IF EXISTS "Users can view own bookmarks"   ON e_learning_bookmarks;
DROP POLICY IF EXISTS "Users can insert own bookmarks" ON e_learning_bookmarks;
DROP POLICY IF EXISTS "Users can delete own bookmarks" ON e_learning_bookmarks;

CREATE POLICY "Users can view own bookmarks"
  ON e_learning_bookmarks FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own bookmarks"
  ON e_learning_bookmarks FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own bookmarks"
  ON e_learning_bookmarks FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );
