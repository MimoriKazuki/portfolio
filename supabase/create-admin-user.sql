-- 管理者ユーザーを作成するためのSQL
-- 注意: これはSupabaseのダッシュボードで実行する必要があります
-- または、Supabase CLIを使用してローカルで実行できます

-- 管理者ユーザーの作成
-- Supabaseダッシュボードで以下の情報を使用してユーザーを作成してください：
-- Email: admin@portfolio.com
-- Password: Portfolio2024!

-- 以下のSQLは参考用です。Supabaseでは直接SQLでユーザーを作成することはできません。
-- 代わりに、Supabaseダッシュボードの Authentication > Users から作成してください。

-- または、Supabase CLIを使用する場合:
-- supabase auth admin create-user --email "admin@portfolio.com" --password "Portfolio2024!"