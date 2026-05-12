-- eラーニングブックマークテーブル
CREATE TABLE e_learning_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content_id UUID NOT NULL REFERENCES e_learning_contents(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, content_id)
);

-- インデックス
CREATE INDEX idx_e_learning_bookmarks_user_id ON e_learning_bookmarks(user_id);
CREATE INDEX idx_e_learning_bookmarks_content_id ON e_learning_bookmarks(content_id);

-- RLSを有効化
ALTER TABLE e_learning_bookmarks ENABLE ROW LEVEL SECURITY;

-- ポリシー：ユーザーは自分のブックマークのみ操作可能
CREATE POLICY "Users can view own bookmarks" ON e_learning_bookmarks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own bookmarks" ON e_learning_bookmarks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own bookmarks" ON e_learning_bookmarks
  FOR DELETE USING (auth.uid() = user_id);
