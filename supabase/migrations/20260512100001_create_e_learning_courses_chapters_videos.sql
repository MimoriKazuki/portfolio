-- =============================================================================
-- Phase 2 Step 1 / ファイル①：コース系3テーブル新規作成 + RLS
--
-- 起点：docs/backend/database/schema.dbml §4-§6, schema-rationale.md §C1-2
-- 対象：e_learning_courses / e_learning_course_chapters / e_learning_course_videos
--
-- 型変更（TEXT → varchar(n)）は別タスクで実施予定（実 DB の最大長確認が必要なため除外）。
-- 本マイグレーションは新規テーブル作成のみ（既存スキーマには影響なし）。
-- =============================================================================

-- -----------------------------------------------------------------------------
-- 1. e_learning_courses（コース・新規）
-- -----------------------------------------------------------------------------
-- M2 確定：category_id NOT NULL（コースは必ず1カテゴリに所属）
-- ON DELETE RESTRICT（カテゴリ削除時にコースが孤立しないよう保護）
CREATE TABLE e_learning_courses (
  id              uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  title           varchar(200)  NOT NULL,
  slug            varchar(100)  NOT NULL UNIQUE,
  description     text          NULL,
  thumbnail_url   text          NULL,
  category_id     uuid          NOT NULL REFERENCES e_learning_categories(id) ON DELETE RESTRICT,
  is_free         boolean       NOT NULL DEFAULT false,
  price           integer       NULL,                       -- NULL=無料
  stripe_price_id varchar(64)   NULL UNIQUE,                -- price_xxx 形式（27 文字程度・余裕を持って 64）
  display_order   integer       NOT NULL DEFAULT 0,
  is_published    boolean       NOT NULL DEFAULT false,     -- 新規作成時は非公開
  is_featured     boolean       NOT NULL DEFAULT false,
  created_at      timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at      timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  deleted_at      timestamptz   NULL                        -- 論理削除
);

CREATE INDEX idx_e_learning_courses_category_id  ON e_learning_courses(category_id);
CREATE INDEX idx_e_learning_courses_is_published ON e_learning_courses(is_published);

COMMENT ON TABLE  e_learning_courses                 IS 'Eラーニングのコース（章＋動画を束ねる販売単位・買い切り）';
COMMENT ON COLUMN e_learning_courses.category_id     IS 'カテゴリFK（M2：必須・コースは必ず1カテゴリに所属）';
COMMENT ON COLUMN e_learning_courses.stripe_price_id IS 'Stripe Price ID（price_xxx 形式・コース買い切り用）';

-- -----------------------------------------------------------------------------
-- 2. e_learning_course_chapters（章・新規）
-- -----------------------------------------------------------------------------
-- ON DELETE CASCADE（コース削除時に章も削除）
-- (course_id, display_order) UNIQUE で章順序の重複を防止
CREATE TABLE e_learning_course_chapters (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id     uuid          NOT NULL REFERENCES e_learning_courses(id) ON DELETE CASCADE,
  title         varchar(200)  NOT NULL,
  description   text          NULL,
  display_order integer       NOT NULL,
  created_at    timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at    timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT e_learning_course_chapters_course_order_key UNIQUE (course_id, display_order)
);

CREATE INDEX idx_e_learning_course_chapters_course_id ON e_learning_course_chapters(course_id);

COMMENT ON TABLE e_learning_course_chapters IS 'コースの章（コース内の動画を束ねる単位・コース論理削除に追従）';

-- -----------------------------------------------------------------------------
-- 3. e_learning_course_videos（コース内動画・新規）
-- -----------------------------------------------------------------------------
-- ON DELETE CASCADE（章削除時に動画も削除）
-- (chapter_id, display_order) UNIQUE で動画順序の重複を防止
-- L5 確定：view_count を追加（単体動画との対称性）
-- M4 確定：コース内動画はブックマーク対象外・個別購入不可
-- M1 確定：コース内動画個別には資料を紐付けない（コース単位）
CREATE TABLE e_learning_course_videos (
  id            uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  chapter_id    uuid          NOT NULL REFERENCES e_learning_course_chapters(id) ON DELETE CASCADE,
  title         varchar(200)  NOT NULL,
  description   text          NULL,
  thumbnail_url text          NULL,
  video_url     text          NOT NULL,
  duration      varchar(20)   NULL,                         -- 例：10:30
  is_free       boolean       NOT NULL DEFAULT false,       -- コース未購入者にも視聴可フラグ
  display_order integer       NOT NULL,
  view_count    integer       NOT NULL DEFAULT 0,           -- L5 確定
  created_at    timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at    timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT e_learning_course_videos_chapter_order_key UNIQUE (chapter_id, display_order)
);

CREATE INDEX idx_e_learning_course_videos_chapter_id ON e_learning_course_videos(chapter_id);
CREATE INDEX idx_e_learning_course_videos_is_free    ON e_learning_course_videos(is_free);

COMMENT ON TABLE  e_learning_course_videos            IS 'コース内動画（販売単位ではない・コース単位購入のみ）';
COMMENT ON COLUMN e_learning_course_videos.is_free    IS 'コース未購入者にも視聴可フラグ（プレビュー用）';
COMMENT ON COLUMN e_learning_course_videos.view_count IS 'L5 確定：累計視聴数（単体動画との対称性）';

-- =============================================================================
-- RLS 有効化 + ポリシー定義（schema-rationale.md §C1-2）
-- =============================================================================

-- -----------------------------------------------------------------------------
-- e_learning_courses RLS
-- -----------------------------------------------------------------------------
-- anon         : is_published=true AND deleted_at IS NULL のみ SELECT 可
-- authenticated: 全 CRUD（管理画面操作・既存 e_learning_categories と同パターン）
-- service_role : RLS バイパス
ALTER TABLE e_learning_courses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to published courses"
  ON e_learning_courses FOR SELECT
  USING (is_published = true AND deleted_at IS NULL);

CREATE POLICY "Authenticated users can manage courses"
  ON e_learning_courses FOR ALL
  USING (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- e_learning_course_chapters RLS
-- -----------------------------------------------------------------------------
-- anon         : 公開コースの章のみ SELECT 可
-- authenticated: 全 CRUD
-- service_role : RLS バイパス
ALTER TABLE e_learning_course_chapters ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to chapters of published courses"
  ON e_learning_course_chapters FOR SELECT
  USING (
    course_id IN (
      SELECT id FROM e_learning_courses
      WHERE is_published = true AND deleted_at IS NULL
    )
  );

CREATE POLICY "Authenticated users can manage course chapters"
  ON e_learning_course_chapters FOR ALL
  USING (auth.role() = 'authenticated');

-- -----------------------------------------------------------------------------
-- e_learning_course_videos RLS
-- -----------------------------------------------------------------------------
-- anon         : 公開コースの動画メタ情報のみ SELECT 可（実 video_url 視聴可否はアプリ層判定）
-- authenticated: 全 CRUD
-- service_role : RLS バイパス
ALTER TABLE e_learning_course_videos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to videos of published courses"
  ON e_learning_course_videos FOR SELECT
  USING (
    chapter_id IN (
      SELECT id FROM e_learning_course_chapters
      WHERE course_id IN (
        SELECT id FROM e_learning_courses
        WHERE is_published = true AND deleted_at IS NULL
      )
    )
  );

CREATE POLICY "Authenticated users can manage course videos"
  ON e_learning_course_videos FOR ALL
  USING (auth.role() = 'authenticated');
