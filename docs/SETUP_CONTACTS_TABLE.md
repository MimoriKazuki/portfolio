# Contacts Table Setup Guide

## 問い合わせテーブルのセットアップ

問い合わせページでエラーが発生している場合、以下の手順でcontactsテーブルを作成してください。

### 手順

1. [Supabase Dashboard](https://supabase.com/dashboard) にログイン
2. 該当のプロジェクトを選択
3. 左メニューから「SQL Editor」を選択
4. 以下のSQLを実行：

```sql
-- Create contacts table
CREATE TABLE IF NOT EXISTS public.contacts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    inquiry_type TEXT NOT NULL DEFAULT 'other' CHECK (inquiry_type IN ('service', 'partnership', 'recruit', 'other')),
    status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_progress', 'completed'))
);

-- Create indexes
CREATE INDEX idx_contacts_status ON public.contacts(status);
CREATE INDEX idx_contacts_created_at ON public.contacts(created_at DESC);
CREATE INDEX idx_contacts_inquiry_type ON public.contacts(inquiry_type);

-- Enable Row Level Security (RLS)
ALTER TABLE public.contacts ENABLE ROW LEVEL SECURITY;

-- Create policy for anonymous users to insert (for contact form)
CREATE POLICY "Anyone can insert contacts" ON public.contacts
    FOR INSERT WITH CHECK (true);

-- Create policy for authenticated users to manage all contacts
CREATE POLICY "Authenticated users can manage contacts" ON public.contacts
    FOR ALL USING (auth.role() = 'authenticated');

-- Create trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_contacts_updated_at BEFORE UPDATE ON public.contacts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

5. 「Run」ボタンをクリックして実行

### テーブル構造

- `id`: UUID (主キー)
- `created_at`: タイムスタンプ（作成日時）
- `updated_at`: タイムスタンプ（更新日時）
- `name`: テキスト（お名前）
- `company`: テキスト（会社名、オプション）
- `email`: テキスト（メールアドレス）
- `message`: テキスト（お問い合わせ内容）
- `inquiry_type`: 列挙型（お問い合わせ種別）
  - `service`: サービスについて
  - `partnership`: 業務提携
  - `recruit`: 採用
  - `other`: その他
- `status`: 列挙型（ステータス）
  - `new`: 新規
  - `in_progress`: 対応中
  - `completed`: 完了

### セキュリティ設定

- Row Level Security (RLS) が有効
- 誰でも問い合わせを送信可能（INSERT）
- 認証済みユーザーのみが閲覧・編集可能（SELECT, UPDATE, DELETE）