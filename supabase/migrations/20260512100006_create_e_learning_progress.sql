-- =============================================================================
-- Phase 2 Step 1 / ファイル⑥：e_learning_progress 新規作成 + RLS
--
-- 起点：docs/backend/database/schema.dbml §11, schema-rationale.md §C1-2
-- 対象：e_learning_progress 新規（視聴進捗 = 視聴完了の事実のみ保持）
--
-- N6・N7 確定：進捗は「視聴完了の事実」のみを保持（再生位置・秒数は持たない）
--   - 進捗レコードが存在する＝視聴完了
--   - コース完了判定は所属動画の進捗集計で末尾到達を判定（アプリ層）
--   - 同一動画の再視聴は最初の completed_at を保持（上書きしない）
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. e_learning_progress テーブル新規作成
-- -----------------------------------------------------------------------------
CREATE TABLE e_learning_progress (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid        NOT NULL REFERENCES e_learning_users(id) ON DELETE CASCADE,
  course_video_id uuid        NULL REFERENCES e_learning_course_videos(id) ON DELETE CASCADE,
  content_id      uuid        NULL REFERENCES e_learning_contents(id) ON DELETE CASCADE,
  completed_at    timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  -- 排他 CHECK：course_video_id か content_id のいずれか一方が NOT NULL
  CONSTRAINT e_learning_progress_target_exclusive_chk CHECK (
    (course_video_id IS NOT NULL AND content_id IS NULL)
    OR (course_video_id IS NULL AND content_id IS NOT NULL)
  )
);

-- インデックス（FK 検索パターン）
CREATE INDEX idx_e_learning_progress_user_id         ON e_learning_progress(user_id);
CREATE INDEX idx_e_learning_progress_course_video_id ON e_learning_progress(course_video_id);
CREATE INDEX idx_e_learning_progress_content_id      ON e_learning_progress(content_id);

-- 部分 UNIQUE 2 本：再視聴時の重複防止（同一ユーザー × 同一動画／コンテンツで 1 レコード）
CREATE UNIQUE INDEX e_learning_progress_user_course_video_partial_key
  ON e_learning_progress(user_id, course_video_id) WHERE course_video_id IS NOT NULL;

CREATE UNIQUE INDEX e_learning_progress_user_content_partial_key
  ON e_learning_progress(user_id, content_id) WHERE content_id IS NOT NULL;

COMMENT ON TABLE  e_learning_progress              IS 'N6・N7 確定：視聴進捗（視聴完了の事実のみ・再生位置は保持しない）';
COMMENT ON COLUMN e_learning_progress.completed_at IS '視聴完了日時。再視聴時も最初の値を保持（INSERT 時 UNIQUE 違反は冪等処理で無視）';

-- -----------------------------------------------------------------------------
-- 2. RLS（schema-rationale.md §C1-2 e_learning_progress）
-- -----------------------------------------------------------------------------
-- anon         : 不可
-- authenticated: 自己レコードのみ CRUD 可
-- service_role : RLS バイパス
ALTER TABLE e_learning_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress"
  ON e_learning_progress FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own progress"
  ON e_learning_progress FOR INSERT
  WITH CHECK (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own progress"
  ON e_learning_progress FOR UPDATE
  USING (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  )
  WITH CHECK (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own progress"
  ON e_learning_progress FOR DELETE
  USING (
    user_id IN (
      SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()
    )
  );
