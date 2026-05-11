-- 既存のポリシーを削除
DROP POLICY IF EXISTS content_goals_admin_policy ON content_goals;

-- 新しいポリシーを作成（landbridge.aiまたはlandbridge.co.jpのメールアドレスを許可）
CREATE POLICY content_goals_admin_policy ON content_goals
    FOR ALL 
    TO authenticated
    USING (
        auth.uid() IN (
            SELECT id FROM auth.users 
            WHERE email LIKE '%@landbridge.ai' 
               OR email LIKE '%@landbridge.co.jp'
        )
    );

-- または、より簡単な方法として、認証されたすべてのユーザーに許可
-- CREATE POLICY content_goals_authenticated_policy ON content_goals
--     FOR ALL 
--     TO authenticated
--     USING (true);