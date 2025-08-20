-- 現在のcolumnsテーブルの構造を確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'columns'
ORDER BY ordinal_position;

-- is_featuredカラムが存在しない場合は追加
ALTER TABLE columns
ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false;

-- featuredカラムが存在する場合は、データを移行してから削除
DO $$
BEGIN
    -- featuredカラムが存在するかチェック
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'columns' 
        AND column_name = 'featured'
    ) THEN
        -- データを移行
        UPDATE columns SET is_featured = featured WHERE is_featured IS NULL;
        -- 古いカラムを削除
        ALTER TABLE columns DROP COLUMN featured;
    END IF;
END $$;

-- publishedカラムが存在する場合は、is_publishedに移行
DO $$
BEGIN
    -- publishedカラムが存在するかチェック
    IF EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'columns' 
        AND column_name = 'published'
    ) THEN
        -- is_publishedカラムが存在しない場合は追加
        ALTER TABLE columns ADD COLUMN IF NOT EXISTS is_published BOOLEAN DEFAULT false;
        -- データを移行
        UPDATE columns SET is_published = published WHERE is_published IS NULL;
        -- 古いカラムを削除
        ALTER TABLE columns DROP COLUMN published;
    END IF;
END $$;

-- 他の必要なカラムも確認して追加
ALTER TABLE columns
ADD COLUMN IF NOT EXISTS excerpt TEXT,
ADD COLUMN IF NOT EXISTS author VARCHAR,
ADD COLUMN IF NOT EXISTS tags TEXT[];

-- documentsテーブルも同様に確認
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'documents'
ORDER BY ordinal_position;

-- documentsテーブルの必要なカラムを追加
ALTER TABLE documents
ADD COLUMN IF NOT EXISTS category VARCHAR,
ADD COLUMN IF NOT EXISTS tags TEXT[],
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- スキーマキャッシュをリロード（Supabaseで必要な場合）
NOTIFY pgrst, 'reload schema';