-- コンテンツ目標設定テーブルの作成
CREATE TABLE IF NOT EXISTS content_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    scope VARCHAR(255) NOT NULL, -- 'column_all' or 'article:<pagePath>'
    base_goal INTEGER NOT NULL,
    stretch_goal INTEGER NOT NULL,
    mean INTEGER NOT NULL,
    median INTEGER NOT NULL,
    p90 INTEGER NOT NULL,
    max INTEGER NOT NULL,
    sample_count INTEGER NOT NULL,
    range_days INTEGER NOT NULL,
    filter_regex TEXT NOT NULL,
    exclude_bot_traffic BOOLEAN DEFAULT true,
    outlier_filter BOOLEAN DEFAULT true,
    computed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- インデックスの作成
CREATE INDEX idx_content_goals_scope ON content_goals(scope);
CREATE INDEX idx_content_goals_computed_at ON content_goals(computed_at DESC);

-- コメントの追加
COMMENT ON TABLE content_goals IS 'コラム記事のビュー目標設定';
COMMENT ON COLUMN content_goals.scope IS 'スコープ: column_all（全体）またはarticle:<pagePath>（個別記事）';
COMMENT ON COLUMN content_goals.base_goal IS 'ベース目標（中央値）';
COMMENT ON COLUMN content_goals.stretch_goal IS 'ストレッチ目標（90パーセンタイル）';
COMMENT ON COLUMN content_goals.mean IS '平均値';
COMMENT ON COLUMN content_goals.median IS '中央値';
COMMENT ON COLUMN content_goals.p90 IS '90パーセンタイル';
COMMENT ON COLUMN content_goals.max IS '最大値';
COMMENT ON COLUMN content_goals.sample_count IS 'サンプル数';
COMMENT ON COLUMN content_goals.range_days IS '集計期間（日数）';
COMMENT ON COLUMN content_goals.filter_regex IS 'パスフィルタ正規表現';
COMMENT ON COLUMN content_goals.exclude_bot_traffic IS 'ボットトラフィックを除外するか';
COMMENT ON COLUMN content_goals.outlier_filter IS '外れ値フィルタを適用するか';

-- RLSポリシー（管理者のみアクセス可能）
ALTER TABLE content_goals ENABLE ROW LEVEL SECURITY;

-- 管理者ロール用のポリシー（必要に応じて調整）
CREATE POLICY content_goals_admin_policy ON content_goals
    FOR ALL 
    TO authenticated
    USING (auth.uid() IN (
        SELECT id FROM auth.users WHERE email LIKE '%@landbridge.ai'
    ));