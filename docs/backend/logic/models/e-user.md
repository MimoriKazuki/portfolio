# EUser モデル

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

`e_learning_users` テーブルに 1:1 対応するユーザーモデル。Supabase Auth の `auth.users.id` と `auth_user_id` で紐付く。

## 使用場面・責務

- 認証コールバック後の自動連携対象
- フルアクセス判定（`has_full_access`）の主体
- 退会・再活性の対象（`deleted_at`）
- 購入・ブックマーク・進捗 すべての FK 元

## ルール・ビジネスロジック

### フィールド

| フィールド | 型 | NOT NULL | 備考 |
|----------|-----|---------|------|
| `id` | string (uuid) | ✓ | PK |
| `auth_user_id` | string (uuid) | ✓ | UNIQUE。Supabase `auth.users.id` |
| `email` | string | ✓ | varchar(255) |
| `display_name` | string \| null |  | text |
| `avatar_url` | string \| null |  | text |
| `is_active` | boolean | ✓ | デフォルト true |
| `has_full_access` | boolean | ✓ | デフォルト false。Phase 1 追加 |
| `last_accessed_at` | string \| null |  | timestamptz |
| `created_at` | string | ✓ | timestamptz |
| `updated_at` | string | ✓ | timestamptz |
| `deleted_at` | string \| null |  | timestamptz。Phase 1 追加。退会で設定 |

### 派生属性（services 層で算出・モデル本体には含めない）

- フルアクセス可否：`has_full_access === true`
- 退会済か：`deleted_at !== null`

### 不変条件

- `auth_user_id` は UNIQUE。OAuth 初回コールバックで INSERT、以後は不変
- `email` は Supabase Auth 側と整合させる（変更時は services 層で同期）
- `is_active` と `deleted_at` は併存可（一時無効化と退会を区別）

## NG

- `has_paid_access` を新規ロジックから参照しない（M5 安全順序で段階削除中）
- モデル定義に Supabase client を保持しない
- 退会済ユーザーの個人情報マスキングはモデル側で行わない（API レスポンス生成時に services で）
