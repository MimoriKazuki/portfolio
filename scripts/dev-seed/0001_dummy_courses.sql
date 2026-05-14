-- ★ DEV ONLY: ローカル開発環境専用のダミーデータ ★
-- 本番（Supabase 本番プロジェクト mtyogrpeeeggqoxzvyry）には絶対に適用しない
-- 適用方法: 開発者がローカル Supabase に手動で実行（supabase db query 等）
-- 作成日: 2026-05-14・Kosuke 判断（Phase 3 Step 2 着手前）
--
-- 目的：
--   B001 LP / B002〜B014 の動作確認用に 3 コースを投入する。
--   各コースは 2〜3 章 × 各章 2〜3 動画。動画は既存 e_learning_contents 15 件から
--   title / description / thumbnail_url / video_url / duration / is_free をコピーする。
--
-- 設計方針（CLAUDE.md / schema.dbml 準拠）：
--   - 既存 e_learning_contents の UPDATE / DELETE は禁止（INSERT のみ）
--   - 有料コースの stripe_price_id は NULL（dev 環境では Stripe API を叩かない）
--   - 無料コースは price / stripe_price_id 両方 NULL
--   - category_id NOT NULL（M2 確定）：既存 e_learning_categories から取得、なければ追加
--   - 章内 display_order は (chapter_id, display_order) UNIQUE
--   - コース内動画の chapter_id NOT NULL（FK CASCADE）
--
-- 冪等性：
--   何度流しても同じ結果になるよう、slug 一意性を利用した ON CONFLICT DO NOTHING を採用。
--   コース slug は dummy- プレフィックスで本番運用データと衝突しないようにする。

BEGIN;

-- =============================================================================
-- カテゴリ確保：dummy-ai-foundation（既存になければ追加）
-- =============================================================================

INSERT INTO public.e_learning_categories (name, slug, description, display_order, is_active)
VALUES ('AI 基礎（dev-only）', 'dummy-ai-foundation', 'ローカル開発確認用のカテゴリ', 999, true)
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- コース 3 件 INSERT
-- =============================================================================
-- いずれも slug を dummy- プレフィックスにして既存運用データと衝突回避

INSERT INTO public.e_learning_courses (
  title, slug, description, thumbnail_url, category_id,
  is_free, price, stripe_price_id, display_order, is_published, is_featured
)
SELECT
  'AI 入門コース（無料体験版）',
  'dummy-ai-intro-free',
  '生成 AI の基本概念から実務での使い方まで、無料で学べる入門コース。dev-only。',
  NULL,
  c.id,
  true,
  NULL,
  NULL,
  10,
  true,
  false
FROM public.e_learning_categories c
WHERE c.slug = 'dummy-ai-foundation'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.e_learning_courses (
  title, slug, description, thumbnail_url, category_id,
  is_free, price, stripe_price_id, display_order, is_published, is_featured
)
SELECT
  'Claude 活用実践コース',
  'dummy-claude-practice',
  'Claude を業務でどう使い倒すか、プロンプト設計から API 連携まで実践的に学ぶ。dev-only。',
  NULL,
  c.id,
  false,
  9800,
  NULL,
  20,
  true,
  true
FROM public.e_learning_categories c
WHERE c.slug = 'dummy-ai-foundation'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.e_learning_courses (
  title, slug, description, thumbnail_url, category_id,
  is_free, price, stripe_price_id, display_order, is_published, is_featured
)
SELECT
  '業務 AI 化マスターコース',
  'dummy-ai-masterclass',
  '部門ごとの業務 AI 化シナリオを網羅したマスターコース。経営層 / 現場リーダー向け。dev-only。',
  NULL,
  c.id,
  false,
  19800,
  NULL,
  30,
  true,
  true
FROM public.e_learning_categories c
WHERE c.slug = 'dummy-ai-foundation'
ON CONFLICT (slug) DO NOTHING;

-- =============================================================================
-- 章 INSERT（コース 1：2 章、コース 2：3 章、コース 3：3 章）
-- =============================================================================
-- (course_id, display_order) UNIQUE のため、course_id 取得 + 連番で INSERT

-- コース 1（dummy-ai-intro-free）の章 ×2
INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, '生成 AI とは何か', 'まずは全体像をつかむ章', 1
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-ai-intro-free'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 1
  );

INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, '実務でどう使うか', '具体的なユースケースを見ていく章', 2
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-ai-intro-free'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 2
  );

-- コース 2（dummy-claude-practice）の章 ×3
INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, 'プロンプト設計の基本', 'プロンプトの組み立て方', 1
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-claude-practice'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 1
  );

INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, '長文処理とコンテキスト活用', '大量ドキュメントの扱い方', 2
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-claude-practice'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 2
  );

INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, 'API 連携と自動化', '業務システムとの統合', 3
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-claude-practice'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 3
  );

-- コース 3（dummy-ai-masterclass）の章 ×3
INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, '組織導入の進め方', 'AI 化の社内合意形成', 1
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-ai-masterclass'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 1
  );

INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, '部門別ユースケース', '営業／管理／開発／法務', 2
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-ai-masterclass'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 2
  );

INSERT INTO public.e_learning_course_chapters (course_id, title, description, display_order)
SELECT co.id, '効果測定と継続改善', 'KPI 設計と PDCA', 3
FROM public.e_learning_courses co
WHERE co.slug = 'dummy-ai-masterclass'
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_chapters x
    WHERE x.course_id = co.id AND x.display_order = 3
  );

-- =============================================================================
-- 動画 INSERT：既存 e_learning_contents 15 件から動画情報をコピー
-- =============================================================================
-- 設計：各章に 2〜3 動画を入れる。既存 contents は display_order ASC で先頭から流用。
-- 同一 contents を複数章で再利用しても問題ない（コース内動画は contents.id を保持しないため）。

-- ヘルパ的アプローチ：各章ごとに「contents の N 件目」を流し込む
-- 既存 contents 15 件で十分足りる前提（コース 1: 4 動画 / コース 2: 8 動画 / コース 3: 7 動画 = 計 19 動画
-- → 一部 contents を 2 章で重複利用）

-- コース 1 章 1：2 動画（contents 1, 2）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-ai-intro-free' AND ch.display_order = 1
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       true, src.rn
FROM chap, src
WHERE src.rn IN (1, 2)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = src.rn
  );

-- コース 1 章 2：2 動画（contents 3, 4）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-ai-intro-free' AND ch.display_order = 2
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       false, (src.rn - 2)
FROM chap, src
WHERE src.rn IN (3, 4)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = (src.rn - 2)
  );

-- コース 2 章 1：3 動画（contents 5, 6, 7）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-claude-practice' AND ch.display_order = 1
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       (src.rn = 5), (src.rn - 4)
FROM chap, src
WHERE src.rn IN (5, 6, 7)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = (src.rn - 4)
  );

-- コース 2 章 2：3 動画（contents 8, 9, 10）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-claude-practice' AND ch.display_order = 2
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       false, (src.rn - 7)
FROM chap, src
WHERE src.rn IN (8, 9, 10)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = (src.rn - 7)
  );

-- コース 2 章 3：2 動画（contents 11, 12）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-claude-practice' AND ch.display_order = 3
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       false, (src.rn - 10)
FROM chap, src
WHERE src.rn IN (11, 12)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = (src.rn - 10)
  );

-- コース 3 章 1：2 動画（contents 13, 14）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-ai-masterclass' AND ch.display_order = 1
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       false, (src.rn - 12)
FROM chap, src
WHERE src.rn IN (13, 14)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = (src.rn - 12)
  );

-- コース 3 章 2：3 動画（contents 15 + 1, 2 を再利用）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-ai-masterclass' AND ch.display_order = 2
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       false,
       CASE src.rn WHEN 15 THEN 1 WHEN 1 THEN 2 WHEN 2 THEN 3 END
FROM chap, src
WHERE src.rn IN (15, 1, 2)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id
      AND cv.display_order = CASE src.rn WHEN 15 THEN 1 WHEN 1 THEN 2 WHEN 2 THEN 3 END
  );

-- コース 3 章 3：2 動画（contents 3, 4 を再利用）
WITH chap AS (
  SELECT ch.id AS chapter_id
  FROM public.e_learning_course_chapters ch
  JOIN public.e_learning_courses co ON co.id = ch.course_id
  WHERE co.slug = 'dummy-ai-masterclass' AND ch.display_order = 3
),
src AS (
  SELECT *, ROW_NUMBER() OVER (ORDER BY display_order, created_at) AS rn
  FROM public.e_learning_contents
  WHERE deleted_at IS NULL
)
INSERT INTO public.e_learning_course_videos (
  chapter_id, title, description, thumbnail_url, video_url, duration, is_free, display_order
)
SELECT chap.chapter_id, src.title, src.description, src.thumbnail_url, src.video_url, src.duration,
       false, (src.rn - 2)
FROM chap, src
WHERE src.rn IN (3, 4)
  AND NOT EXISTS (
    SELECT 1 FROM public.e_learning_course_videos cv
    WHERE cv.chapter_id = chap.chapter_id AND cv.display_order = (src.rn - 2)
  );

COMMIT;

-- =============================================================================
-- 投入後の確認クエリ（参考）
-- =============================================================================
-- SELECT co.slug, co.title, COUNT(DISTINCT ch.id) AS chapters, COUNT(cv.id) AS videos
-- FROM public.e_learning_courses co
-- LEFT JOIN public.e_learning_course_chapters ch ON ch.course_id = co.id
-- LEFT JOIN public.e_learning_course_videos cv ON cv.chapter_id = ch.id
-- WHERE co.slug LIKE 'dummy-%'
-- GROUP BY co.slug, co.title
-- ORDER BY co.display_order;
