-- e_learning_usersテーブルにINSERTポリシーを追加
-- 認証済みユーザーが自分自身のレコードを作成できるようにする
CREATE POLICY "Users can create own profile"
ON public.e_learning_users
FOR INSERT
TO public
WITH CHECK (auth.uid() = auth_user_id);
