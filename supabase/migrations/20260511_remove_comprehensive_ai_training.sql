-- comprehensive-ai-training 廃止に伴うDB更新
--
-- 対象テーブル: projects / columns / youtube_videos / contacts
-- 目的:
--   1. enterprise_service の DEFAULT 値を 'comprehensive-ai-training' → 'ai-coding-training' に変更
--   2. 既存レコードのうち enterprise_service = 'comprehensive-ai-training' を 'ai-coding-training' に正規化
--   3. ID命名ゆらぎの解消
--      - projects.enterprise_service: 'ai-video' → 'ai-video-training'
--      - columns.enterprise_service: 'ai-coding' → 'ai-coding-training'
--   4. contacts.service_type のコメント注釈を新6件構成に更新（カラム自体は VARCHAR で値制約なし）
--
-- 想定影響件数（2026-05-11 時点の本番DB集計）:
--   - projects: comprehensive-ai-training=43件、ai-video=6件
--   - columns:  comprehensive-ai-training=182件、ai-coding=1件
--   - youtube_videos: comprehensive-ai-training=72件

-- ============================================================
-- projects テーブル
-- ============================================================

-- DEFAULT 値変更
ALTER TABLE projects
  ALTER COLUMN enterprise_service SET DEFAULT 'ai-coding-training';

-- comprehensive-ai-training を ai-coding-training に正規化
UPDATE projects
SET enterprise_service = 'ai-coding-training'
WHERE enterprise_service = 'comprehensive-ai-training';

-- ID命名ゆらぎ修正: ai-video → ai-video-training
UPDATE projects
SET enterprise_service = 'ai-video-training'
WHERE enterprise_service = 'ai-video';

-- ============================================================
-- columns テーブル
-- ============================================================

-- DEFAULT 値変更
ALTER TABLE columns
  ALTER COLUMN enterprise_service SET DEFAULT 'ai-coding-training';

-- comprehensive-ai-training を ai-coding-training に正規化
UPDATE columns
SET enterprise_service = 'ai-coding-training'
WHERE enterprise_service = 'comprehensive-ai-training';

-- ID命名ゆらぎ修正: ai-coding → ai-coding-training
UPDATE columns
SET enterprise_service = 'ai-coding-training'
WHERE enterprise_service = 'ai-coding';

-- ============================================================
-- youtube_videos テーブル
-- ============================================================

-- DEFAULT 値変更
ALTER TABLE youtube_videos
  ALTER COLUMN enterprise_service SET DEFAULT 'ai-coding-training';

-- comprehensive-ai-training を ai-coding-training に正規化
UPDATE youtube_videos
SET enterprise_service = 'ai-coding-training'
WHERE enterprise_service = 'comprehensive-ai-training';

-- ============================================================
-- contacts テーブル（カラムコメントのみ更新）
-- ============================================================
-- 値の制約は SQL で表現されていないため、コメントのみ更新する。
-- 新6件構成: enterprise=6件 / individual=1件
COMMENT ON COLUMN contacts.service_type IS
  'お問い合わせ対象サービスID。enterprise: ai-coding-training, claude-training, ai-organization-os, ai-video-training, ai-short-video-training, ai-animation-training / individual: ai-talent-development';
