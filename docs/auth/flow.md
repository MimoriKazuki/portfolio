# 認証フロー（Phase 1）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装完了後に埋まる：`app/auth/login/`、`app/auth/callback/`、`app/api/auth/**`、`app/lib/supabase/middleware.ts`、`middleware.ts`）

## 概要

Supabase Auth（Google OAuth のみ）を用いた、ログイン必須型 E ラーニング向け認証フロー。
LP のみ未ログイン閲覧可、それ以外（コース詳細・視聴・購入・管理画面）はすべてログイン必須。

## 使用場面・責務

- 認証情報の発行・更新は Supabase Auth が担う（PKCE Code Flow / セッション Cookie）
- 認証セッションは `middleware.ts` 内の `updateSession()` で全ページ・全 API リクエストに対して維持
- API 層では `createClient()` + `auth.getUser()` でリクエスト単位にユーザーを取得
- `e_learning_users` レコードは OAuth 初回ログイン時に自動作成・以後 `auth_user_id` で 1:1 紐付け

## ルール・ビジネスロジック

### A. ログインフロー（Google OAuth）

```
1. /e-learning などログイン必須画面アクセス
   ↓
2. 未ログインなら /auth/login へリダイレクト（returnTo クエリ付与）
   ↓
3. /auth/login で「Googleでログイン」ボタン押下
   ↓
4. Supabase Auth → Google OAuth 同意画面
   ↓
5. Google から /auth/callback?code=... に戻る
   ↓
6. /auth/callback で Supabase に code を渡しセッション確立
   ↓
7. e_learning_users に該当 auth_user_id のレコードが無ければ INSERT
   - email：auth.users.email
   - display_name：auth.users.user_metadata.full_name（無ければ email の @ 前）
   - avatar_url：auth.users.user_metadata.avatar_url（任意）
   - has_full_access：false（デフォルト）
   - is_active：true
   ↓
8. returnTo に指定された URL（無効・外部 URL なら /e-learning）へリダイレクト
```

### B. セッション維持

- `middleware.ts` が全パス対象（`_next/static` 等を除く）に `updateSession()` を呼ぶ
- セッションが切れていれば Supabase 側で自動リフレッシュ
- API ルート内では毎回 `createClient()` で `auth.getUser()` を確認（信頼境界）
- セッションがあり `auth.users` 行が無いケース（削除済等）は 401 として扱う

### C. ログイン要求ガード

| 経路 | ガード |
|------|--------|
| `/`（トップ・LP） | 不要 |
| `/e-learning`（LP） | 不要 |
| `/e-learning/courses`（コース一覧） | **必須**（gate1-confirmed-decisions §2「ログイン必須・Udemy 同様」と整合・案A確定） |
| `/e-learning/courses/[slug]`（コース詳細） | **必須**（ログイン必須・Udemy 同様・gate1-confirmed-decisions.md §2 案A 確定） |
| `/e-learning/[id]`（単体動画詳細） | **必須**（ログイン必須・Udemy 同様・gate1-confirmed-decisions.md §2 案A 確定） |
| 視聴（/play /videos/:videoId） | **必須**（401 で `/auth/login` へ） |
| 進捗マーク `/complete` | **必須** |
| 購入 `/api/checkout` | **必須** |
| `/admin/**` | **必須＋管理者判定**（auth.users に存在＝管理者） |

### D. 管理者判定

- 仕様：`auth.users` にレコードがある＝管理者（ロール分離なし・既存方針踏襲）
- 実装方針：`middleware.ts` で `/admin` 配下に対し `auth.getUser()` が null なら `/auth/login?returnTo=...` へリダイレクト
- 一般ユーザーが `auth.users` を持つことは無いため（OAuth は `e_learning_users` 側のみで紐付け）、現状仕様で衝突しない。ただし将来の運用変更で「同じ Google アカウントで一般 + 管理者双方を扱う」要件が来た場合、`auth.users` のレコード存在判定をやめて `admin_users` 系テーブル参照に切り替える必要がある（Phase 2 以降の検討）

### E. ログアウト

- `/api/auth/logout` で `supabase.auth.signOut()` を実行
- Cookie をクリアし `/` へリダイレクト

### F. アカウント自動連携の冪等性

- OAuth コールバック時に `e_learning_users` を INSERT する処理は冪等にする：
  ```
  SELECT id FROM e_learning_users WHERE auth_user_id = :auth_user_id;
  ↳ 0 件なら INSERT
  ↳ 1 件あれば何もしない
  ```
- 同時並行ログインで競合した場合は UNIQUE(auth_user_id) 違反を捕捉し SELECT を再実行（リトライ）。

### G. 退会（Phase 1 で公開）

- 退会 API：**`POST /api/me/withdraw`**（認証必須）。詳細は `docs/api/endpoints.md` カテゴリ A 参照
- 処理フロー：
  ```
  1. FE「退会する」ボタン → 確認ダイアログ
  2. POST /api/me/withdraw（body 不要）
  3. Controller：auth.getUser() で userId 取得
  4. user-service.withdraw(userId) を呼ぶ
     - deleted_at = now()
     - display_name = NULL（L1 マスキング）
     - avatar_url = NULL（L1 マスキング）
     - is_active = false
     - email は保持（L1 確定：再登録時の履歴引継のため）
  5. 成功後 supabase.auth.signOut() で Cookie をクリア（Controller の責務・services 内では呼ばない）
  6. FE は / にリダイレクト＋トースト「退会が完了しました」
  ```
- 冪等：既に `deleted_at IS NOT NULL` のユーザーが呼んでも 200 OK（業務上の混乱なく退会扱い）
- 再活性：同一メールで再ログイン時、`user-service.syncFromAuth` 側で `deleted_at = NULL` に戻し `has_full_access` などの履歴を引き継ぐ（L1 確定）
- DB 側はソフトデリート（`e_learning_users.deleted_at`）で物理削除しない（schema.dbml）
- `e_learning_purchases` / `e_learning_progress` / `e_learning_bookmarks` 等は保持（個人特定性が低い・購入履歴は税務観点でも保持必須）
- `auth.users` 本体の削除は Phase 1 では行わない（Supabase 側に保持。同一 Google アカウントで再ログイン時に同一 `auth.users.id` が再利用される運用）

### H. Stripe Checkout 前後のセッション継続

- Checkout 開始：API 側で `auth.getUser()` を確認・成功時に `e_learning_users.id` を `metadata` に載せて Stripe Session を作成
- Checkout 完了：Stripe → `success_url` でサイトに戻る。Cookie は維持されるので追加処理不要
- ユーザーが Checkout 中に別タブで signOut する稀ケース：戻った後の自動視聴 API 呼び出しは 401。FE 側はトーストで再ログイン案内（既存実装と整合）

### I. CSRF / セッション固定

- Supabase Auth の PKCE Code Flow が CSRF 対策を兼ねる（state パラメータ自動付与）
- 既存 Cookie 設定は `SameSite=Lax` / `Secure`（本番）を踏襲

## NG

- 認証情報を `localStorage` に保存しない（Supabase の管理する Cookie のみ）
- API ルートで `auth.getUser()` を信頼境界外で実行しない（必ずサーバーサイド `createClient()` 経由）
- `e_learning_users` を OAuth 初回ログイン以外の経路で作成しない（管理画面からの手動作成は Phase 1 では出さない）
- 管理者判定で `email.endsWith('@landbridge.co.jp')` のようなドメイン依存ロジックを書かない（ロール分離なし方針に反する）
- 既存 `has_paid_access` を新規コードから参照しない（M5 安全順序 5 ステップで段階移行：詳細は `docs/backend/logic/services/access-service.md`）
