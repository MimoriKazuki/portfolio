# 物理設計の根拠（Gate 4）

## 前提

- Gate 3（論理設計）はディレクター承認済（2026-05-12・L1〜L5 確定）。本書は Gate 3 で確定した属性に対して、物理レベル（型・桁数・NULL制約・DEFAULT・インデックス・FK 挙動）の根拠を全カラムについて記述する
- DBML 本体は `docs/backend/database/schema.dbml` に別途作成済
- **db-design-patterns.md** に従って型・パターンを選択
- 既存稼働中の Supabase 環境に対する **差分** として記述（Phase 2 で dev-mate がマイグレーションファイル化する前提）
- M1〜M5 + L1〜L5 をすべて反映

参照：
- 業務分析：`docs/backend/database/business-analysis.md`
- 概念モデル：`docs/backend/database/conceptual-model.md`
- 論理設計：`docs/backend/database/logical-design.md`
- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- DBML：`docs/backend/database/schema.dbml`
- 既存マイグレーション：`supabase/migrations/20251203〜20251214_*.sql`

---

## 命名規則の確認

このプロジェクトでの命名規則：

- [x] テーブル名プレフィックス：**`e_learning_*` のみ採用**（機能領域プレフィックス・既存ルール踏襲）
- [ ] テンプレ標準（m_/t_/s_/h_/l_/sys_/v_）：**採用しない**（既存稼働中の命名規則と整合させるため）
- カラム名：snake_case
- FK カラム：`{参照概念}_id`（例：`user_id`、`course_id`、`content_id`）
- インデックス：`idx_{テーブル}_{カラム}`
- 一意性制約：`{テーブル}_{カラム}_key`（既存命名踏襲）
- 部分 UNIQUE インデックス：`{テーブル}_{カラム}_partial_key`

---

## 全テーブル共通の方針

### PK 設計

- **全テーブルで UUID（`gen_random_uuid()`）をサロゲートPKとして採用**
- 採用理由：
  1. 既存テーブル全てが UUID PK で稼働中（一貫性のため）
  2. Supabase / PostgREST との相性が良い
  3. 分散環境での衝突回避（将来サブシステム拡張時に有利）
- 自然キーは別途 UNIQUE 制約で表現（複合自然キーPKは採用しない）

### タイムスタンプ

- **`timestamptz` を採用**（timestamp without time zone は使わない）
- 既存スキーマの DEFAULT は2系統：
  - 既存テーブル多数：`DEFAULT timezone('utc'::text, now())`
  - `e_learning_bookmarks` のみ：`DEFAULT now()`
- **新規テーブル・追加カラムは `DEFAULT timezone('utc'::text, now())` で統一**（既存多数派踏襲・UTC 明示）
- 既存 bookmarks の `created_at DEFAULT now()` は既存値を破壊しないため変更しない（Gate 4 では現状維持）

### 文字列型

- 業務的に厳密な桁数制約があるカラム → `varchar(n)`（桁数指定必須）
- 自由テキスト（説明・URL・メモ） → `text`
- **桁指定なし varchar は禁止**
- 既存スキーマで `text` 多用の傾向あり。本書では業務的制約のあるカラムを抽出して `varchar(n)` 化（既存カラムは破壊変更しない方針）

### 区分値（status / type など）

- **`text` + CHECK 制約** または **`varchar(n)` + CHECK 制約** を採用
- PostgreSQL ENUM は使わない（追加変更時のマイグレーションが重い）
- 既存 `e_learning_corporate_customers.contract_status` が `TEXT DEFAULT 'active' CHECK (... IN (...))` の前例あり

### 通貨・金額

- 採用：**`integer`（円・税込）**
- 採用理由：
  1. 日本円は最小単位が「円」で小数点なし（numeric 不要）
  2. 既存 `e_learning_contents.price` が `integer` で運用中（一貫性）
  3. 最大値 2,147,483,647 円（21.4 億円）は単一商品価格として十分
- 通貨の複数対応は将来要件化したら別途検討

### 監査カラム（共通）

| カラム | 型 | 制約 | デフォルト | 配置方針 |
|--------|----|-----|----------|---------|
| created_at | timestamptz | NOT NULL | `timezone('utc'::text, now())` | 全テーブル必須 |
| updated_at | timestamptz | NOT NULL | `timezone('utc'::text, now())` | 全テーブル必須（更新トリガーは別途） |
| deleted_at | timestamptz | NULL | NULL | 論理削除対象テーブルのみ |

- `updated_at` 自動更新トリガー：マイグレーション側で `trg_updated_at` 関数 + BEFORE UPDATE トリガーを作成
- `created_by` / `updated_by`：Phase 1 では追加しない（管理者ロール分離なしの方針より）

### 論理削除（deleted_at）の運用方針

- **論理削除対象**：users / categories / contents / courses（業務上の長期保持対象）
- **物理削除対象**：bookmarks / progress / course_chapters / course_videos / materials（個人データ・親に従属する構造）
- **削除不可**：purchases / legacy_purchases（税務観点）
- 論理削除レコードは画面側で `WHERE deleted_at IS NULL` または部分インデックスで除外

### 部分インデックス（PostgreSQL 機能）

- 排他的 N:1 関係の UNIQUE 制約は **部分 UNIQUE インデックス** で表現
- 構文例：
  ```sql
  CREATE UNIQUE INDEX e_learning_purchases_user_course_partial_key
    ON e_learning_purchases (user_id, course_id)
    WHERE course_id IS NOT NULL;
  ```
- 通常の UNIQUE 制約では `(user_id, NULL)` 行が複数許容されてしまうため

### 同時実行制御（楽観ロックの採用方針）

- **全更新系操作で楽観ロック（`updated_at` 比較）を採用**
- 採用範囲：コース・章・コース内動画・単体動画・カテゴリ等の管理画面編集処理
- 実装パターン：UPDATE 文の WHERE 句に `updated_at = $前回取得した値` を含め、更新行数 0 件を競合検出として扱う
- **悲観ロック（`SELECT ... FOR UPDATE`）は採用しない**
- 採用理由：
  1. 管理者1人運用前提（実運用上、同時編集の頻度がほぼゼロ）
  2. Supabase / PostgREST 経由の更新で悲観ロックを扱うのは煩雑
  3. UI 側で「最終更新日時が変わっています、再読み込みしてください」と明示する方が UX として明瞭

### 文字列正規化ルール（§17）

UNIQUE 制約対象カラム・検索キーカラムの正規化方針：

| カラム | 正規化ルール | 実施層 | 重複検出 |
|--------|------------|-------|---------|
| `e_learning_users.email` | Supabase Auth 由来（小文字化済み）をそのままコピー。DB 側での追加正規化処理は不要 | DB 側不要 / Auth で完了 | `LOWER(email) = LOWER($1)` で照合（再登録引継ぎクエリ） |
| `e_learning_categories.slug` | 小文字英数字とハイフンのみ `^[a-z0-9-]+$`・前後空白なし | アプリ層で `slug.trim().toLowerCase()` 適用後 INSERT | UNIQUE 制約は格納値どおり。アプリ層で重複チェック時も `LOWER(slug)` ベース |
| `e_learning_courses.slug` | 同上 | 同上 | 同上 |
| `e_learning_contents.stripe_price_id` | Stripe API 返却値（`price_xxxxx`）をそのまま使用 | アプリ層正規化不要 | Stripe 側で一意性とフォーマット保証 |
| `e_learning_courses.stripe_price_id` | 同上 | 同上 | 同上 |
| `e_learning_purchases.stripe_session_id` | Stripe API 返却値（`cs_xxxxx`）をそのまま使用 | アプリ層正規化不要 | Stripe 側で一意性とフォーマット保証 |
| `e_learning_purchases.stripe_payment_intent_id` | Stripe API 返却値（`pi_xxxxx`）をそのまま使用 | アプリ層正規化不要 | Stripe 側で一意性とフォーマット保証 |
| `e_learning_corporate_users.email` | アプリ層で `email.trim().toLowerCase()` 適用後 INSERT | アプリ層 | UNIQUE 制約 `(corporate_customer_id, email)` は格納値どおり |

補足：
- Stripe ID 群は API 返却値をそのまま使うため、DB 側での正規化処理（trim・大文字小文字変換）は不要
- ローカル管理する slug 群（categories / courses）は URL の一部となるため、サーバ側で必ず正規化してから保存

### PII 保護方針（§C2）

Phase 1 で扱う個人識別情報（PII）と保護方針：

| カラム | PII 区分 | 保護方式 | 退会時の扱い |
|--------|---------|---------|------------|
| `e_learning_users.email` | 中（連絡先） | 平文 + RLS（自己レコードのみ参照） | **保持**（再登録引継ぎ用・L1 確定） |
| `e_learning_users.display_name` | 低（表示名） | 平文 + RLS | **NULL に更新**（マスキング） |
| `e_learning_users.avatar_url` | 低（画像URL） | 平文 + RLS | **NULL に更新**（マスキング） |
| `e_learning_corporate_customers.contact_email` | 中（連絡先） | 平文 + RLS（authenticated のみ参照） | Phase 1 では運用なし（0件継続） |
| `e_learning_corporate_customers.contact_phone` | 中（連絡先） | 平文 + RLS（authenticated のみ参照） | 同上 |
| `e_learning_corporate_customers.contact_person` | 低（担当者名） | 平文 + RLS（authenticated のみ参照） | 同上 |
| `e_learning_corporate_users.email` | 中（連絡先） | 平文 + RLS（authenticated のみ参照） | 同上 |

方針詳細：
- **pgcrypto は使用しない**：Phase 1 ではアプリ層 + Supabase RLS によるアクセス制御で十分（暗号化が必要になるレベルの機微情報は扱わない）
- **退会後のマスキング**：`users.email` は再登録引継ぎ要件（L1 確定）のため保持するが、`display_name` / `avatar_url` は NULL 更新で個人特定性を低減
- **購入レコードとの分離**：退会処理で `e_learning_purchases.user_id` は触らない（税務観点・領収書再発行・永続保持）。RESTRICT FK 設計により、退会済ユーザーレコードも論理削除のみで物理削除はされない
- **GDPR 適用外**：日本国内向け BtoC のため適用外。個人情報保護法に基づく開示請求・削除請求は管理者対応（運用フロー）
- **企業契約（corporate_*）**：Phase 1 では 0 件継続のため運用フローは未定義。Phase 2 以降で本格運用する際に「契約満了後の削除タイミング」「個人情報保護法対応フロー」を別途定義する

---

## テーブル：e_learning_users

### 概要

- 論理設計の対応エンティティ：e_learning_users
- 用途：Eラーニング利用者（auth.users との 1:1）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK, NOT NULL, DEFAULT gen_random_uuid() | 既存 PK 構造踏襲 |
| auth_user_id | uuid | NOT NULL, UNIQUE | Supabase Auth の id 型に合わせる。1:1 紐付け |
| email | varchar(255) | NOT NULL | RFC 5321 ローカルパート 64 + @ + ドメイン 255 = 320 が理論上限、実用上限は RFC 3696 で 254。+1 で 255 |
| display_name | text | NULL | OAuth 由来の自由テキスト・桁数制約なし |
| avatar_url | text | NULL | URL は理論的に無制限。自由テキスト扱い |
| is_active | boolean | NOT NULL, DEFAULT true | 既存仕様継続 |
| has_full_access | boolean | NOT NULL, DEFAULT false | Phase 1 追加（Gate 3 で確定） |
| last_accessed_at | timestamptz | NULL | 既存カラム継続 |
| created_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 既存仕様 |
| updated_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 既存仕様 |
| deleted_at | timestamptz | NULL | Phase 1 追加。退会時に設定 |

### PK 採用根拠

- サロゲートPK（id, UUID）。論理設計の決定通り
- 自然キー `auth_user_id` に UNIQUE 制約（変更不可・auth.users との 1:1 を保証）

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_users_auth_user_id_key | auth_user_id | Supabase Auth との 1:1（既存通り） |

### 【email カラムに UNIQUE 制約を設けない理由】（§18-3）

- **email は UNIQUE 制約を設けない**。一意性は **Supabase Auth の `auth.users.email`** で保証され、`e_learning_users.email` は Auth の値を同期したコピーである
- DB レベルで二重に UNIQUE 制約を設けると、Auth 側でメール変更があった際の同期処理で一時的に重複が発生するリスクがある
- 再登録引継ぎ処理（L1 確定）では `LOWER(email) = LOWER($1)` で照合する。`deleted_at IS NOT NULL` のレコードに対して同一メールでの再登録時は、INSERT ではなく既存レコードの `deleted_at=NULL` 復活処理を行う
- Supabase Auth はメール登録時に **小文字変換済み** の値を保持するため、DB 側での追加正規化処理（trim・lower）は不要

### 文字列正規化ルール

| カラム | 正規化方針 |
|--------|----------|
| email | Supabase Auth 由来（小文字化済み）の値を変更せず保持。DB 側での追加正規化処理は不要 |
| display_name | OAuth 由来の自由テキスト。正規化なし（ユーザー入力をそのまま保持） |
| avatar_url | OAuth 由来の URL。正規化なし |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| auth_user_id | auth.users.id | CASCADE | （未指定） | Auth 側で削除されたらEラーニング利用者も削除（既存運用通り） |

### インデックス

| 名前 | カラム | 種類 | 根拠（用途） |
|------|-------|------|-------------|
| e_learning_users_auth_user_id_key | auth_user_id | UNIQUE btree | Auth 連携時の検索（最頻） |
| idx_e_learning_users_email | email | btree | 同一メール再登録時の検索（L1 確定：再登録引継ぎで使う） |
| idx_e_learning_users_active | id | btree partial WHERE deleted_at IS NULL | 退会済除外の高速化 |

### L1 確定の運用方針

- 退会時：email は**そのまま保持**（再登録引継ぎ用）
- `display_name` / `avatar_url` の Phase 1 提案：**NULL に更新**（個人情報除去・必要に応じてアプリ側で「退会済ユーザー」と表示）
- 物理削除はせず、`deleted_at` 設定＋上記マスキングで対応
- 再登録時：同一 `email` で `deleted_at IS NOT NULL` のレコードを検出したら、新規 INSERT ではなく既存レコードを `deleted_at=NULL` で復活させる方式を採用（実装側で対応）

### Phase 1 マイグレーション差分

```sql
ALTER TABLE e_learning_users
  ADD COLUMN has_full_access boolean NOT NULL DEFAULT false;

ALTER TABLE e_learning_users
  ADD COLUMN deleted_at timestamptz NULL;

CREATE INDEX idx_e_learning_users_email ON e_learning_users(email);

-- M5 安全順序（has_paid_access 廃止）の最終ステップで実施
-- ALTER TABLE e_learning_users DROP COLUMN has_paid_access;
```

---

## テーブル：e_learning_categories

### 概要

- 論理設計の対応エンティティ：e_learning_categories
- 用途：コンテンツのカテゴリ（既存 6 件継続）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK, NOT NULL, DEFAULT gen_random_uuid() | 既存 |
| name | varchar(100) | NOT NULL | カテゴリ名は短文。既存運用上 100 字あれば十分（既存最大 30 字以下想定） |
| slug | varchar(100) | NOT NULL, UNIQUE | URL slug は短文。100 字で十分 |
| description | text | NULL | 自由テキスト |
| display_order | integer | NOT NULL, DEFAULT 0 | 表示順序。範囲は ±21 億で十分 |
| is_active | boolean | NOT NULL, DEFAULT true | 既存 |
| created_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 既存 |
| updated_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 既存 |
| deleted_at | timestamptz | NULL | L4 確定：Phase 1 追加（廃止／一時非表示の区別） |

### PK 採用根拠

- サロゲートPK + `slug` UNIQUE

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_categories_slug_key | slug | URL 識別子の一意性（既存） |

### 【name カラムに UNIQUE 制約を設けない理由】

業務上、カテゴリ名は時期や用途によって同名で登録される可能性を許容する（例：「AI 入門」が複数年に渡って異なるバージョンで存在）。一意性は `slug` カラムで UNIQUE 制約により保証する。

### 外部キー制約

なし（このテーブルは親側のみ）

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| e_learning_categories_slug_key | slug | UNIQUE btree | 既存 |
| idx_e_learning_categories_display_order | display_order | btree | 一覧画面のソート |

### Phase 1 マイグレーション差分

```sql
ALTER TABLE e_learning_categories
  ADD COLUMN deleted_at timestamptz NULL;
```

---

## テーブル：e_learning_contents

### 概要

- 論理設計の対応エンティティ：e_learning_contents
- 用途：単体販売動画（既存 15 件継続）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK, NOT NULL, DEFAULT gen_random_uuid() | 既存 |
| title | varchar(200) | NOT NULL | 動画タイトルは長くなり得る。SEO 観点でも 60〜70 字推奨。200 字で余裕 |
| description | text | NULL | 自由テキスト |
| thumbnail_url | text | NULL | URL は自由テキスト |
| video_url | text | NOT NULL | URL は自由テキスト（既存） |
| duration | varchar(20) | NULL | 表示用文字列「HH:MM:SS」形式想定。20 字あれば十分 |
| category_id | uuid | NULL, FK | 既存 |
| is_free | boolean | NOT NULL, DEFAULT false | 既存 |
| price | integer | NULL | 既存 integer 踏襲（円・NULL=無料） |
| stripe_price_id | varchar(64) | NULL, UNIQUE | Stripe Price ID `price_xxxxx` は通常 27 文字程度。64 字で将来形式変更にも耐える |
| display_order | integer | NOT NULL, DEFAULT 0 | 既存 |
| is_published | boolean | NOT NULL, DEFAULT true | 既存 |
| is_featured | boolean | NOT NULL, DEFAULT false | 既存 |
| view_count | integer | NOT NULL, DEFAULT 0 | 既存 |
| created_at / updated_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 既存 |
| deleted_at | timestamptz | NULL | Phase 1 追加 |

### PK 採用根拠

- サロゲートPK + `stripe_price_id` UNIQUE（NULL 含む。NULL は無料動画で複数許容）

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_contents_stripe_price_id_key | stripe_price_id | Stripe Price との 1:1（NULL 重複可） |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| category_id | e_learning_categories.id | SET NULL | （未指定） | カテゴリ廃止後も動画は残す（既存運用継続） |

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| e_learning_contents_stripe_price_id_key | stripe_price_id | UNIQUE btree | Stripe Webhook 受信時の検索 |
| idx_e_learning_contents_category_id | category_id | btree | カテゴリ別一覧 |
| idx_e_learning_contents_is_published | is_published | btree | 公開動画フィルタ（高頻度） |

### Phase 1 マイグレーション差分

```sql
ALTER TABLE e_learning_contents
  ADD COLUMN deleted_at timestamptz NULL;

-- 既存 stripe_price_id にインデックスはあるが UNIQUE ではない（要再確認）
-- ない場合：
ALTER TABLE e_learning_contents
  ADD CONSTRAINT e_learning_contents_stripe_price_id_key UNIQUE (stripe_price_id);
```

### view_count の同時実行制御（非原子的加算の許容）

- `view_count` は **参考値**（再生回数の概算）として扱う。**正確性よりパフォーマンスを優先**する
- 競合更新は許容：`UPDATE e_learning_contents SET view_count = view_count + 1 WHERE id = ?` を **そのまま** 発行し、稀に発生する競合（同一ミリ秒の同時加算で +1 が +1 にしかならない）は業務的に許容する
- 楽観ロック（`updated_at` 比較）は **適用しない**。管理画面の編集系操作とは要求性質が異なるため
- 将来「再生回数を正確に保ちたい」要件が出た場合：RPC 関数（`SECURITY DEFINER` + `SELECT ... FOR UPDATE` または PostgreSQL の `UPDATE ... RETURNING` で原子的加算）に切り出して RLS 越しでも安全に実行できるようにする。Phase 1 では実装しない
- 同様の方針を `e_learning_course_videos.view_count`（L5 確定）にも適用する

---

## テーブル：e_learning_courses（新規）

### 概要

- 論理設計の対応エンティティ：e_learning_courses
- 用途：コース商品（章構造を持つ）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK, NOT NULL, DEFAULT gen_random_uuid() | 統一方針 |
| title | varchar(200) | NOT NULL | 単体動画と同じ根拠 |
| slug | varchar(100) | NOT NULL, UNIQUE | URL slug |
| description | text | NULL | 自由テキスト |
| thumbnail_url | text | NULL | URL |
| category_id | uuid | NOT NULL, FK | M2：必須 |
| is_free | boolean | NOT NULL, DEFAULT false | 単体動画と同様 |
| price | integer | NULL | 円・NULL=無料 |
| stripe_price_id | varchar(64) | NULL, UNIQUE | 単体動画と同じ根拠 |
| display_order | integer | NOT NULL, DEFAULT 0 | 表示順序 |
| is_published | boolean | NOT NULL, DEFAULT false | **新規作成時は非公開**（コース構築中の事故防止） |
| is_featured | boolean | NOT NULL, DEFAULT false | 注目フラグ |
| created_at / updated_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 共通 |
| deleted_at | timestamptz | NULL | 論理削除 |

### PK 採用根拠

- サロゲートPK + `slug` UNIQUE + `stripe_price_id` UNIQUE

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_courses_slug_key | slug | URL 一意性 |
| e_learning_courses_stripe_price_id_key | stripe_price_id | Stripe Price との 1:1 |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| category_id | e_learning_categories.id | RESTRICT | （未指定） | M2：コースは必ずカテゴリ所属。カテゴリ削除前にコース移動が必要 |

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| e_learning_courses_slug_key | slug | UNIQUE btree | URL 検索 |
| e_learning_courses_stripe_price_id_key | stripe_price_id | UNIQUE btree | Stripe Webhook 検索 |
| idx_e_learning_courses_category_id | category_id | btree | カテゴリ別一覧 |
| idx_e_learning_courses_is_published | is_published | btree | 公開コースフィルタ |

---

## テーブル：e_learning_course_chapters（新規）

### 概要

- 論理設計の対応エンティティ：e_learning_course_chapters
- 用途：コース内の章

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK | 統一方針 |
| course_id | uuid | NOT NULL, FK | 親コース |
| title | varchar(200) | NOT NULL | 動画タイトルと同じ根拠 |
| description | text | NULL | 自由テキスト |
| display_order | integer | NOT NULL | コース内順序 |
| created_at / updated_at | timestamptz | NOT NULL | 共通 |

※ deleted_at なし（親コース削除に追従）

### PK 採用根拠

- サロゲートPK + `(course_id, display_order)` 複合 UNIQUE

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_course_chapters_course_order_key | (course_id, display_order) | コース内で章順序の重複防止 |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| course_id | e_learning_courses.id | CASCADE | （未指定） | コース廃止時に章ごと削除 |

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| e_learning_course_chapters_course_order_key | (course_id, display_order) | UNIQUE btree | 順序保証 + コース内章検索 |
| idx_e_learning_course_chapters_course_id | course_id | btree | UNIQUE が先頭 course_id でカバーされるため最低限の補助 |

---

## テーブル：e_learning_course_videos（新規）

### 概要

- 論理設計の対応エンティティ：e_learning_course_videos
- 用途：コースの章に所属する動画

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK | 統一方針 |
| chapter_id | uuid | NOT NULL, FK | 親章 |
| title | varchar(200) | NOT NULL | 単体動画と同じ |
| description | text | NULL | 自由テキスト |
| thumbnail_url | text | NULL | URL |
| video_url | text | NOT NULL | URL |
| duration | varchar(20) | NULL | 動画長表示 |
| is_free | boolean | NOT NULL, DEFAULT false | コース未購入者にも視聴可フラグ |
| display_order | integer | NOT NULL | 章内順序 |
| view_count | integer | NOT NULL, DEFAULT 0 | L5 確定 |
| created_at / updated_at | timestamptz | NOT NULL | 共通 |

※ price / stripe_price_id は持たない（販売単位ではない）
※ deleted_at なし（親章・コース削除に追従）

### PK 採用根拠

- サロゲートPK + `(chapter_id, display_order)` 複合 UNIQUE

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_course_videos_chapter_order_key | (chapter_id, display_order) | 章内で動画順序の重複防止 |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| chapter_id | e_learning_course_chapters.id | CASCADE | （未指定） | 章廃止時に動画ごと削除 |

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| e_learning_course_videos_chapter_order_key | (chapter_id, display_order) | UNIQUE btree | 順序保証 |
| idx_e_learning_course_videos_chapter_id | chapter_id | btree | 章内動画一覧 |
| idx_e_learning_course_videos_is_free | is_free | btree | 無料視聴可動画フィルタ |

---

## テーブル：e_learning_materials

### 概要

- 論理設計の対応エンティティ：e_learning_materials
- 用途：単体動画またはコース直下の PDF 資料（M1 確定）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK | 統一方針 |
| content_id | uuid | NULL, FK | 単体動画への所属（既存・排他的 CHECK） |
| course_id | uuid | NULL, FK | コースへの所属（M1 で Phase 1 追加） |
| title | varchar(200) | NOT NULL | 資料タイトル |
| file_url | text | NOT NULL | URL（既存・自由テキスト） |
| file_size | integer | NULL | バイト数（最大 2.1GB 想定で integer 十分。超える可能性があれば bigint だが PDF 想定では integer で十分） |
| display_order | integer | NOT NULL, DEFAULT 0 | 表示順序 |
| created_at | timestamptz | NOT NULL | 既存 |
| updated_at | timestamptz | NOT NULL | **既存スキーマで未確認**。Phase 1 で追加（共通方針） |

### PK 採用根拠

- サロゲートPK（既存通り）

### 一意性制約

なし（同一動画／コースに同名資料の重複は許容、display_order で順序保証）

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| content_id | e_learning_contents.id | CASCADE | （未指定） | 親動画削除時に資料も削除（既存通り） |
| course_id | e_learning_courses.id | CASCADE | （未指定） | 親コース削除時に資料も削除 |

### CHECK 制約

```sql
ALTER TABLE e_learning_materials
  ADD CONSTRAINT e_learning_materials_owner_exclusive
  CHECK (
    (content_id IS NOT NULL AND course_id IS NULL)
    OR
    (content_id IS NULL AND course_id IS NOT NULL)
  );
```

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| idx_e_learning_materials_content_id | content_id | btree | 動画詳細画面の資料表示 |
| idx_e_learning_materials_course_id | course_id | btree | コース詳細画面の資料表示 |
| idx_e_learning_materials_content_order | (content_id, display_order) | UNIQUE btree partial WHERE content_id IS NOT NULL, DEFERRABLE INITIALLY DEFERRED | M6 確定：同一動画／同一コース内で資料の表示順序の一意性を DB レベルで保証する。順序入替時の一時的な重複を許容するため DEFERRABLE INITIALLY DEFERRED を採用 |
| idx_e_learning_materials_course_order | (course_id, display_order) | UNIQUE btree partial WHERE course_id IS NOT NULL, DEFERRABLE INITIALLY DEFERRED | 同上 |

### Phase 1 マイグレーション差分

```sql
ALTER TABLE e_learning_materials
  ADD COLUMN course_id uuid NULL REFERENCES e_learning_courses(id) ON DELETE CASCADE;

ALTER TABLE e_learning_materials
  ADD CONSTRAINT e_learning_materials_owner_exclusive
  CHECK (
    (content_id IS NOT NULL AND course_id IS NULL)
    OR
    (content_id IS NULL AND course_id IS NOT NULL)
  );

-- 既存 7 件はすべて content_id IS NOT NULL のため CHECK 違反は発生しない（事前検証推奨）

-- updated_at が未追加なら追加（既存スキーマ要確認）
ALTER TABLE e_learning_materials
  ADD COLUMN IF NOT EXISTS updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());

CREATE INDEX idx_e_learning_materials_course_id ON e_learning_materials(course_id);

-- M6 確定：display_order の部分 UNIQUE 2本（DEFERRABLE INITIALLY DEFERRED）
-- 順序入替時の一時的な重複を許容するため、トランザクション内では制約チェックを遅延
CREATE UNIQUE INDEX idx_e_learning_materials_content_order
  ON e_learning_materials(content_id, display_order)
  WHERE content_id IS NOT NULL
  DEFERRABLE INITIALLY DEFERRED;

CREATE UNIQUE INDEX idx_e_learning_materials_course_order
  ON e_learning_materials(course_id, display_order)
  WHERE course_id IS NOT NULL
  DEFERRABLE INITIALLY DEFERRED;
```

---

## テーブル：e_learning_purchases（新ルール厳格・L3 反映）

### 概要

- 論理設計の対応エンティティ：e_learning_purchases（新ルール側）
- 用途：コース／単体動画の新規購入レコード
- L3 確定：既存6件は `e_learning_legacy_purchases` に退避し、本テーブルからは削除する

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK | 既存 |
| user_id | uuid | NOT NULL, FK | 既存 |
| course_id | uuid | NULL, FK | Phase 1 追加 |
| content_id | uuid | NULL, FK | 既存 |
| stripe_session_id | varchar(255) | NOT NULL, UNIQUE | Stripe Checkout Session ID `cs_xxx` は通常 80〜90 字。255 字で将来形式変更にも耐える |
| stripe_payment_intent_id | varchar(255) | NULL | `pi_xxx` も同様。返金照合用（設計負債4・Phase 1 追加） |
| amount | integer | NOT NULL | 既存 integer（円） |
| status | varchar(20) | NOT NULL, DEFAULT 'completed' | L2：'completed' / 'refunded' の2値 |
| refunded_at | timestamptz | NULL | 返金日時（status='refunded' のとき NOT NULL） |
| created_at / updated_at | timestamptz | NOT NULL | 既存 |

### PK 採用根拠

- サロゲートPK + 自然キー UNIQUE 群（部分 UNIQUE 含む）

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_purchases_stripe_session_id_key | stripe_session_id | Stripe Webhook 冪等性保証 |
| e_learning_purchases_user_course_partial_key | (user_id, course_id) WHERE course_id IS NOT NULL | コース二重購入防止 |
| e_learning_purchases_user_content_partial_key | (user_id, content_id) WHERE content_id IS NOT NULL | 単体動画二重購入防止 |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| user_id | e_learning_users.id | RESTRICT | （未指定） | 購入履歴保護（ユーザー物理削除を防止） |
| course_id | e_learning_courses.id | RESTRICT | （未指定） | 購入履歴保護 |
| content_id | e_learning_contents.id | RESTRICT | （未指定） | 購入履歴保護 |

### CHECK 制約

```sql
-- 1. 排他的所有
ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_target_exclusive
  CHECK (
    (course_id IS NOT NULL AND content_id IS NULL)
    OR
    (course_id IS NULL AND content_id IS NOT NULL)
  );

-- 2. status 値の限定（L2）
ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_status_check
  CHECK (status IN ('completed', 'refunded'));

-- 3. refunded_at の整合性
ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_refunded_at_check
  CHECK (
    (status = 'refunded' AND refunded_at IS NOT NULL)
    OR
    (status <> 'refunded' AND refunded_at IS NULL)
  );
```

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| e_learning_purchases_stripe_session_id_key | stripe_session_id | UNIQUE btree | Stripe Webhook 受信時の重複処理防止 |
| idx_e_learning_purchases_user_id | user_id | btree | ユーザー別購入履歴一覧 |
| idx_e_learning_purchases_course_id | course_id | btree | コース別売上集計 |
| idx_e_learning_purchases_content_id | content_id | btree | 単体動画別売上集計 |
| idx_e_learning_purchases_status | status | btree | 返金一覧などの絞り込み |
| e_learning_purchases_user_course_partial_key | (user_id, course_id) WHERE course_id IS NOT NULL | UNIQUE btree partial | 二重購入防止 |
| e_learning_purchases_user_content_partial_key | (user_id, content_id) WHERE content_id IS NOT NULL | UNIQUE btree partial | 二重購入防止 |

### Phase 1 マイグレーション差分（手順）

```sql
-- (1) 既存 UNIQUE 制約を削除
ALTER TABLE e_learning_purchases
  DROP CONSTRAINT IF EXISTS e_learning_purchases_user_id_content_id_key;

-- (2) 新カラム追加
ALTER TABLE e_learning_purchases
  ADD COLUMN course_id uuid NULL REFERENCES e_learning_courses(id) ON DELETE RESTRICT,
  ADD COLUMN stripe_payment_intent_id varchar(255) NULL,
  ADD COLUMN refunded_at timestamptz NULL;

-- (3) 既存6件を legacy 退避（後述）して本テーブルから削除した後、CHECK 制約を追加
-- ※ CHECK 違反になるため、退避完了後でないと追加できない

ALTER TABLE e_learning_purchases
  ADD CONSTRAINT e_learning_purchases_target_exclusive CHECK (...),
  ADD CONSTRAINT e_learning_purchases_status_check CHECK (...),
  ADD CONSTRAINT e_learning_purchases_refunded_at_check CHECK (...);

-- (4) status カラムの型を厳密化（既存 text → varchar(20)）
ALTER TABLE e_learning_purchases
  ALTER COLUMN status TYPE varchar(20);

-- (5) 部分 UNIQUE インデックス作成
CREATE UNIQUE INDEX e_learning_purchases_user_course_partial_key
  ON e_learning_purchases (user_id, course_id) WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX e_learning_purchases_user_content_partial_key
  ON e_learning_purchases (user_id, content_id) WHERE content_id IS NOT NULL;
```

---

## テーブル：e_learning_legacy_purchases（新規・L3 確定）

### 概要

- 論理設計の対応エンティティ：e_learning_purchases の歴史的レコード退避先
- 用途：既存6件（content_id IS NULL の全コンテンツ買い切り旧仕様）の退避先
- L3 確定：物理削除せず、新ルールテーブル外で永続保持

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK, NOT NULL, DEFAULT gen_random_uuid() | 統一方針。元 e_learning_purchases.id を引き継いで挿入 |
| user_id | uuid | NOT NULL, FK | 元レコードの user_id |
| content_id | uuid | NULL, FK | 元 content_id（NULL=全コンテンツ買い切り）。歴史的レコードのまま許容 |
| stripe_session_id | varchar(255) | NULL | 元データに存在する場合のみ |
| amount | integer | NOT NULL | 元金額 |
| status | varchar(20) | NOT NULL, DEFAULT 'completed' | 元 status（'completed' 想定） |
| original_created_at | timestamptz | NOT NULL | 元 created_at（移行追跡用） |
| migrated_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 退避日時 |
| note | text | NULL | M3／L3 の業務的説明 |

### PK 採用根拠

- サロゲートPK（id）。元 purchases.id を保持することで、過去レコードとの紐付けを維持可能

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| idx_e_learning_legacy_purchases_stripe_session_id | stripe_session_id（部分 UNIQUE） | M6 確定：歴史的レコードの重複投入防止（NULL は除外） |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| user_id | e_learning_users.id | RESTRICT | （未指定） | 歴史的レコードのため保護 |
| content_id | e_learning_contents.id | RESTRICT | （未指定） | 保護（NULL 許容） |

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| idx_e_learning_legacy_purchases_user_id | user_id | btree | 該当ユーザー検索用 |
| idx_e_learning_legacy_purchases_stripe_session_id | stripe_session_id | UNIQUE btree partial WHERE stripe_session_id IS NOT NULL | M6 確定：歴史的レコードの重複投入防止 |

### Phase 1 マイグレーション差分（移行手順）

```sql
-- (1) テーブル作成
CREATE TABLE e_learning_legacy_purchases (
  id                  uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             uuid          NOT NULL REFERENCES e_learning_users(id) ON DELETE RESTRICT,
  content_id          uuid          NULL     REFERENCES e_learning_contents(id) ON DELETE RESTRICT,
  stripe_session_id   varchar(255)  NULL,
  amount              integer       NOT NULL,
  status              varchar(20)   NOT NULL DEFAULT 'completed',
  original_created_at timestamptz   NOT NULL,
  migrated_at         timestamptz   NOT NULL DEFAULT timezone('utc'::text, now()),
  note                text          NULL
);

CREATE INDEX idx_e_learning_legacy_purchases_user_id
  ON e_learning_legacy_purchases (user_id);

-- (2) 既存6件を legacy に INSERT
INSERT INTO e_learning_legacy_purchases
  (id, user_id, content_id, stripe_session_id, amount, status, original_created_at, note)
SELECT
  id, user_id, content_id, stripe_session_id, amount, status, created_at,
  'M3/L3: 全コンテンツ買い切り旧仕様の歴史的レコード（content_id IS NULL）'
FROM e_learning_purchases
WHERE content_id IS NULL;

-- (3) 該当ユーザーに has_full_access=true 付与（M5 安全順序 Step 2）
UPDATE e_learning_users
  SET has_full_access = true
WHERE id IN (
  SELECT DISTINCT user_id FROM e_learning_purchases WHERE content_id IS NULL
);

-- (4) アプリ切替・検証後、本テーブルから該当6件を DELETE（M5 安全順序 Step 4 後）
DELETE FROM e_learning_purchases WHERE content_id IS NULL;

-- (5) これにより本テーブルに新ルール厳格 CHECK 制約を追加可能になる

-- (6) M6 確定：stripe_session_id の部分 UNIQUE インデックス追加（歴史的レコードの重複投入防止）
CREATE UNIQUE INDEX idx_e_learning_legacy_purchases_stripe_session_id
  ON e_learning_legacy_purchases (stripe_session_id)
  WHERE stripe_session_id IS NOT NULL;
```

### 返金ポリシー（Phase 1 確定）

- 本テーブルは Phase 1 では **返金未対応**（ディレクター方針 2026-05-12）
- 既存6名は `has_full_access=true` に吸収済のため、業務上返金が発生しないことを前提とする
- **`refunded_at` カラムは DB に追加しない**（API レスポンスからも削除する：be-plan-mate 側で対応）
- 将来万一返金対応が必要になった場合は Phase 2 以降の `schema-changes` として個別対応（カラム追加・該当ユーザーの `has_full_access` 剥奪・課税仕訳の付替えを一括設計）

---

## テーブル：e_learning_bookmarks

### 概要

- 論理設計の対応エンティティ：e_learning_bookmarks
- 用途：ユーザーがコース／単体動画をブックマーク（M4 確定）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK | 既存 |
| user_id | uuid | NOT NULL, FK | **参照先を auth.users.id から e_learning_users.id に変更**（設計負債1） |
| course_id | uuid | NULL, FK | Phase 1 追加（M4） |
| content_id | uuid | NULL, FK | 既存 |
| created_at | timestamptz | NOT NULL, DEFAULT now() | 既存通り（DEFAULT now() のまま） |

### 【created_at DEFAULT が他テーブルと異なる扱い】

既存スキーマでは `DEFAULT now()` を使用しているが、他のテーブルは `DEFAULT timezone('utc'::text, now())` で統一されている。Phase 1 では既存値を破壊しないため変更しないが、Phase 2 以降で全テーブル統一マイグレーションを検討する（schema-changes に記録予定）。

### PK 採用根拠

- サロゲートPK + 部分 UNIQUE 2本

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_bookmarks_user_course_partial_key | (user_id, course_id) WHERE course_id IS NOT NULL | コース重複ブックマーク防止 |
| e_learning_bookmarks_user_content_partial_key | (user_id, content_id) WHERE content_id IS NOT NULL | 単体動画重複ブックマーク防止 |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| user_id | e_learning_users.id | CASCADE | （未指定） | 退会・ユーザー削除時にブックマーク削除（個人データ） |
| course_id | e_learning_courses.id | CASCADE | （未指定） | コース廃止時にブックマーク削除 |
| content_id | e_learning_contents.id | CASCADE | （未指定） | 動画廃止時にブックマーク削除 |

### CHECK 制約

```sql
ALTER TABLE e_learning_bookmarks
  ADD CONSTRAINT e_learning_bookmarks_target_exclusive
  CHECK (
    (course_id IS NOT NULL AND content_id IS NULL)
    OR
    (course_id IS NULL AND content_id IS NOT NULL)
  );
```

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| idx_e_learning_bookmarks_user_id | user_id | btree | 個別ユーザーのブックマーク一覧 |
| idx_e_learning_bookmarks_course_id | course_id | btree | コース別ブックマーク数集計 |
| idx_e_learning_bookmarks_content_id | content_id | btree | 動画別ブックマーク数集計 |
| 部分 UNIQUE 2 本 | 上記 | | |

### Phase 1 マイグレーション差分

```sql
-- (1) 既存 user_id を e_learning_users.id にマッピング
-- 既存 user_id は auth.users.id を参照しているため、e_learning_users.id へ書き換える
UPDATE e_learning_bookmarks b
  SET user_id = u.id
FROM e_learning_users u
WHERE b.user_id = u.auth_user_id;

-- (2) FK 参照先変更
ALTER TABLE e_learning_bookmarks
  DROP CONSTRAINT e_learning_bookmarks_user_id_fkey,
  ADD CONSTRAINT e_learning_bookmarks_user_id_fkey
    FOREIGN KEY (user_id) REFERENCES e_learning_users(id) ON DELETE CASCADE;

-- (3) course_id 追加
ALTER TABLE e_learning_bookmarks
  ADD COLUMN course_id uuid NULL REFERENCES e_learning_courses(id) ON DELETE CASCADE;

-- (4) 既存 UNIQUE(user_id, content_id) を削除
ALTER TABLE e_learning_bookmarks
  DROP CONSTRAINT IF EXISTS e_learning_bookmarks_user_id_content_id_key;

-- (5) 部分 UNIQUE 2本を追加
CREATE UNIQUE INDEX e_learning_bookmarks_user_course_partial_key
  ON e_learning_bookmarks (user_id, course_id) WHERE course_id IS NOT NULL;

CREATE UNIQUE INDEX e_learning_bookmarks_user_content_partial_key
  ON e_learning_bookmarks (user_id, content_id) WHERE content_id IS NOT NULL;

-- (6) 排他的 CHECK 制約
ALTER TABLE e_learning_bookmarks
  ADD CONSTRAINT e_learning_bookmarks_target_exclusive CHECK (...);

CREATE INDEX idx_e_learning_bookmarks_course_id ON e_learning_bookmarks(course_id);
```

---

## テーブル：e_learning_progress（新規）

### 概要

- 論理設計の対応エンティティ：e_learning_progress
- 用途：視聴完了の事実保持（N6・N7 確定）

### カラム定義の根拠

| カラム | 型 | 桁数 / 制約 | 根拠 |
|--------|----|-----------|------|
| id | uuid | PK | 統一方針 |
| user_id | uuid | NOT NULL, FK | ユーザー |
| course_video_id | uuid | NULL, FK | コース内動画 |
| content_id | uuid | NULL, FK | 単体動画 |
| completed_at | timestamptz | NOT NULL, DEFAULT timezone('utc',now()) | 視聴完了日時。レコード存在＝視聴完了 |
| created_at / updated_at | timestamptz | NOT NULL | 共通 |

### PK 採用根拠

- サロゲートPK + 部分 UNIQUE 2本

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_progress_user_course_video_partial_key | (user_id, course_video_id) WHERE course_video_id IS NOT NULL | 同一動画の進捗1ユーザー1レコード |
| e_learning_progress_user_content_partial_key | (user_id, content_id) WHERE content_id IS NOT NULL | 同上 |

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| user_id | e_learning_users.id | CASCADE | （未指定） | 個人データ |
| course_video_id | e_learning_course_videos.id | CASCADE | （未指定） | 動画廃止時に進捗削除 |
| content_id | e_learning_contents.id | CASCADE | （未指定） | 動画廃止時に進捗削除 |

### CHECK 制約

```sql
ALTER TABLE e_learning_progress
  ADD CONSTRAINT e_learning_progress_target_exclusive
  CHECK (
    (course_video_id IS NOT NULL AND content_id IS NULL)
    OR
    (course_video_id IS NULL AND content_id IS NOT NULL)
  );
```

### インデックス

| 名前 | カラム | 種類 | 根拠 |
|------|-------|------|------|
| idx_e_learning_progress_user_id | user_id | btree | ユーザー別進捗一覧 |
| idx_e_learning_progress_course_video_id | course_video_id | btree | 動画別視聴数集計・コース完了判定（末尾到達判定） |
| idx_e_learning_progress_content_id | content_id | btree | 単体動画別視聴数集計 |
| 部分 UNIQUE 2本 | 上記 | | |

---

## テーブル：e_learning_corporate_customers（既存・将来用）

### 概要

- 論理設計の対応エンティティ：e_learning_corporate_customers
- 用途：研修サービス契約企業（既存・Phase 1 では変更なし）

### カラム定義の根拠

既存スキーマを維持（Phase 1 では破壊的変更なし）。型は既存通り：
- id: uuid PK
- company_name: text（既存・自由テキスト）
- contact_person / contact_email / contact_phone: text NULL（既存・自由テキスト）
- contract_status: text（既存・CHECK 制約で値を限定）
- contract_start_date / contract_end_date: date
- notes: text
- created_at / updated_at: timestamptz

### CHECK 制約

```sql
-- 既存
CHECK (contract_status IN ('active', 'expired', 'pending'))
```

### 【例外：自然キー UNIQUE 制約なしの理由】

一般的なサロゲートPK採用テーブルでは「サロゲートPK + 自然キー UNIQUE」をセットで採用するが、このテーブルは Phase 1 スコープ外（既存稼働中・0件継続）のため既存スキーマを維持し、UNIQUE 制約を追加しない。Phase 2 以降で法人契約機能を本格運用する際に `company_name` または `(company_name, contact_email)` の UNIQUE 制約追加を再検討する。

### Phase 1 での変更

なし（将来用・参照しない）

---

## テーブル：e_learning_corporate_users（既存・将来用）

### 概要

- 既存スキーマを維持

### 一意性制約

| 制約名 | カラム | 根拠 |
|--------|-------|------|
| e_learning_corporate_users_customer_email_key | (corporate_customer_id, email) | 1法人内で同一メール禁止（既存） |

### 文字列正規化ルール（§18-4）

- `email`：**アプリ層で `email.trim().toLowerCase()` を適用してから INSERT** する
- 採用理由：
  1. このテーブルの email は Supabase Auth とは独立（契約企業の社員メール登録）。Auth 由来の小文字化保証がない
  2. 大文字小文字違いの同一メールが UNIQUE 制約を回避して二重登録されるリスクを防止
- 検索・突合時も `LOWER(email)` で比較する（弊社メンバー判定での企業ドメイン照合などで使用）
- DB レベルでの CHECK 制約は設けない（管理画面で 1 経路のみの入力のため、アプリ層のみで担保）

### 外部キー制約

| カラム | 参照先 | ON DELETE | ON UPDATE | 根拠 |
|--------|--------|-----------|-----------|------|
| corporate_customer_id | e_learning_corporate_customers.id | CASCADE | （未指定） | 法人削除時にメール紐付けも削除（既存） |

---

## CASCADE 方針一覧

| 親 → 子 | ON DELETE | 理由 |
|---------|-----------|------|
| auth.users → e_learning_users | CASCADE | 既存・Auth 連動 |
| e_learning_users → e_learning_purchases | RESTRICT | 購入履歴保護 |
| e_learning_users → e_learning_legacy_purchases | RESTRICT | 歴史的レコード保護 |
| e_learning_users → e_learning_bookmarks | CASCADE | 個人データ |
| e_learning_users → e_learning_progress | CASCADE | 個人データ |
| e_learning_categories → e_learning_contents | SET NULL | カテゴリ廃止後も動画残す |
| e_learning_categories → e_learning_courses | RESTRICT | M2：コース必須カテゴリ・先に移動が必要 |
| e_learning_courses → e_learning_course_chapters | CASCADE | コース廃止で章ごと削除 |
| e_learning_courses → e_learning_materials | CASCADE | 親コースに従属 |
| e_learning_courses → e_learning_purchases | RESTRICT | 購入履歴保護 |
| e_learning_courses → e_learning_bookmarks | CASCADE | 個人データ |
| e_learning_course_chapters → e_learning_course_videos | CASCADE | 章廃止で動画ごと削除 |
| e_learning_course_videos → e_learning_progress | CASCADE | 個人データ |
| e_learning_contents → e_learning_materials | CASCADE | 親動画に従属（既存） |
| e_learning_contents → e_learning_purchases | RESTRICT | 購入履歴保護 |
| e_learning_contents → e_learning_legacy_purchases | RESTRICT | 歴史的レコード保護 |
| e_learning_contents → e_learning_bookmarks | CASCADE | 個人データ |
| e_learning_contents → e_learning_progress | CASCADE | 個人データ |
| e_learning_corporate_customers → e_learning_corporate_users | CASCADE | 既存 |

---

## インデックス戦略

### 一覧画面の検索パターン

| 画面 | 主な絞り込み | 必要インデックス |
|------|------------|----------------|
| LP・コース一覧 | カテゴリ・公開状態 | idx_e_learning_courses_category_id, idx_e_learning_courses_is_published |
| 単体動画一覧 | カテゴリ・公開状態 | idx_e_learning_contents_category_id, idx_e_learning_contents_is_published |
| 章一覧（コース詳細内） | コースID＋順序 | e_learning_course_chapters_course_order_key |
| コース内動画一覧 | 章ID＋順序 | e_learning_course_videos_chapter_order_key |
| ユーザー別ブックマーク | user_id | idx_e_learning_bookmarks_user_id |
| ユーザー別購入履歴 | user_id | idx_e_learning_purchases_user_id |
| ユーザー別進捗 | user_id | idx_e_learning_progress_user_id |
| 返金一覧（管理画面） | status | idx_e_learning_purchases_status |
| Stripe Webhook 検索 | stripe_session_id | UNIQUE 索引で十分 |

### 結合パターン

| 結合 | インデックス必要箇所 |
|------|-------------------|
| users ⨝ purchases | purchases.user_id |
| users ⨝ progress | progress.user_id |
| courses ⨝ chapters | chapters.course_id |
| chapters ⨝ course_videos | course_videos.chapter_id |
| contents ⨝ purchases | purchases.content_id |
| courses ⨝ purchases | purchases.course_id |

### 過剰インデックスの回避

- `is_featured` は更新頻度が低くカーディナリティも低いため、専用インデックスは作らない（一覧の WHERE 句で集約条件として使う想定）
- `created_at` の範囲検索インデックスは Phase 1 では作らない（必要になれば追加）

---

## マイグレーション計画

### 初回マイグレーション（Phase 2 で dev-mate が作成）

依存関係順：

1. **e_learning_courses**（新規・カテゴリFK 追加）
2. **e_learning_course_chapters**（コースFK）
3. **e_learning_course_videos**（章FK）
4. **e_learning_users 拡張**（has_full_access / deleted_at 追加）
5. **e_learning_categories 拡張**（deleted_at 追加）
6. **e_learning_contents 拡張**（deleted_at 追加 + stripe_price_id UNIQUE 化）
7. **e_learning_materials 拡張**（course_id 追加・排他 CHECK 制約・updated_at 確認）
8. **e_learning_legacy_purchases**（新規）
9. **legacy 退避処理**（既存6件 INSERT → has_full_access=true 付与 → 元 DELETE）
10. **e_learning_purchases 再設計**（course_id / stripe_payment_intent_id / refunded_at 追加・UNIQUE再設計・CHECK 制約追加・status varchar(20)化）
11. **e_learning_bookmarks 再設計**（user_id マッピング更新 → FK 参照先変更 → course_id 追加 → UNIQUE 再設計 → 排他 CHECK 制約）
12. **e_learning_progress**（新規）
13. **has_paid_access 削除**（M5 安全順序の最終ステップ）

### M5 安全順序（再掲）

1. `has_full_access` カラム追加（DEFAULT false）
2. 既存6名（`has_paid_access=true`）に `has_full_access=true` を一括付与
3. アプリケーションコードを `has_full_access` 参照に切り替え
4. 動作検証
5. `has_paid_access` カラム削除

### Phase 3 以降の変更管理

- `schema-changes/` に各変更を記録（2系統：プロジェクト内＋個人ナレッジ）
- マイグレーションファイル：`YYYYMMDDHHMMSS_{description}.sql`

---

## RLS ポリシー設計マトリクス（§C1）

Supabase + PostgREST 採用のため、全 `e_learning_*` テーブルに RLS を設計する。既存テーブルの RLS は `supabase/migrations/20251203_*.sql` / `20251204_*.sql` / `20251208_*.sql` から転記し、Phase 1 で追加する新規5テーブル（courses / course_chapters / course_videos / legacy_purchases / progress）の RLS を本書で確定する。

※ Phase 1 新規5テーブル（`e_learning_courses` / `e_learning_course_chapters` / `e_learning_course_videos` / `e_learning_legacy_purchases` / `e_learning_progress`）について、Phase 2 マイグレーション時に `ALTER TABLE ... ENABLE ROW LEVEL SECURITY` を明示的に有効化する。schema.dbml は DBML 文法上 `ENABLE ROW LEVEL SECURITY` を直接表現しないため、本セクションを正規参照点とする。

### ロール定義（Supabase）

- **anon**：未ログイン訪問者（JWT なし）
- **authenticated**：Supabase Auth でログイン済みのユーザー（一般ユーザー + 管理者を含む）。管理者判定は「auth.users にログイン済セッションが存在＝管理者」というシンプル設計のため、本プロジェクトでは authenticated に「一般 e_learning_users」と「管理者」が混在する
- **service_role**：サーバ側処理（Stripe Webhook 等）専用。RLS をバイパスする

### service_role の運用ルール

- **Stripe Webhook 処理（Route Handler `/api/stripe/webhook`）でのみ使用**
- フロントエンドからは絶対に使わない（NEXT_PUBLIC_* に露出させない）
- 環境変数 `SUPABASE_SERVICE_ROLE_KEY` はサーバサイドのみ参照可
- 主な用途：
  1. `e_learning_purchases` への INSERT（Stripe Checkout 完了通知）
  2. `e_learning_purchases` の status 更新（charge.refunded 受信時）
  3. legacy 退避処理・has_full_access 付与処理（マイグレーション時のみ）

### RLS マトリクス（テーブル × ロール × 操作）

#### e_learning_users

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 自己レコードのみ可 | 自己レコードのみ可 | 自己レコードのみ可 | 不可 | `auth.uid() = auth_user_id`（既存 3 ポリシー：`Users can view own profile` / `Users can update own profile` / `Users can create own profile`） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス（マイグレーション・退会処理で使用） |

#### e_learning_categories

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | `is_active = true` のみ可 | 不可 | 不可 | 不可 | `USING (is_active = true)`（既存：`Allow public read access to categories`） |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (auth.role() = 'authenticated')`（既存：`Authenticated users can manage categories`・管理者前提） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_contents

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | `is_published = true` のみ可 | 不可 | 不可 | 不可 | `USING (is_published = true)`（既存：`Allow public read access to published contents`） |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (auth.role() = 'authenticated')`（既存：`Authenticated users can manage contents`・管理者前提） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_materials

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 全可 | 不可 | 不可 | 不可 | `USING (true)`（既存：`Allow public read access to materials`・PDF 配布は公開前提） |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (auth.role() = 'authenticated')`（既存：`Authenticated users can manage materials`） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_purchases

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 自己レコードのみ可 | 不可 | 不可 | 不可 | `USING (user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()))`（既存：`Users can view own purchases`） |
| service_role | 全可 | 全可 | 全可 | 全可 | **Stripe Webhook で INSERT / UPDATE を実行**（authenticated に書き込み権限を与えない設計） |

#### e_learning_bookmarks

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 自己レコードのみ可 | 自己レコードのみ可 | 不可 | 自己レコードのみ可 | 既存：`auth.uid() = user_id`（※ 既存スキーマでは user_id が auth.users.id だが、Phase 1 で `e_learning_users.id` に変更後は `user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid())` に書き換える） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_corporate_customers

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (true)`（既存：管理画面操作前提・Phase 1 では 0 件継続） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_corporate_users

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (true)`（既存：`Allow authenticated users to manage corporate users`・Phase 1 では 0 件継続） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_courses（新規・§C1-2）

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | `is_published = true AND deleted_at IS NULL` のみ可 | 不可 | 不可 | 不可 | `USING (is_published = true AND deleted_at IS NULL)` |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (auth.role() = 'authenticated')`（管理画面操作） |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_course_chapters（新規・§C1-2）

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 公開コースの章のみ可 | 不可 | 不可 | 不可 | `USING (course_id IN (SELECT id FROM e_learning_courses WHERE is_published = true AND deleted_at IS NULL))` |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (auth.role() = 'authenticated')` |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

#### e_learning_course_videos（新規・§C1-2）

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 公開コースの動画のみ可（メタ情報まで・実際の `video_url` は購入者のみ視聴可：アプリ層判定） | 不可 | 不可 | 不可 | `USING (chapter_id IN (SELECT id FROM e_learning_course_chapters WHERE course_id IN (SELECT id FROM e_learning_courses WHERE is_published = true AND deleted_at IS NULL)))` |
| authenticated | 全可 | 全可 | 全可 | 全可 | `USING (auth.role() = 'authenticated')` |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

補足：視聴可否（コース購入済 or `has_full_access=true` or `is_free=true` か）の最終判定は、フロント／API 層で `e_learning_purchases` / `e_learning_users.has_full_access` / `course_videos.is_free` を組み合わせて判断する。RLS では「メタ情報の閲覧可否」までを担保し、実コンテンツ（`video_url`）の保護はアプリ層の責務とする。

#### e_learning_legacy_purchases（新規・§C1-2）

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 自己レコードのみ可 | 不可 | 不可 | 不可 | `USING (user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()))` |
| service_role | 全可 | 全可 | 全可 | 全可 | **マイグレーション時の退避処理でのみ INSERT**。退避完了後は基本的に書き込み発生せず |

#### e_learning_progress（新規・§C1-2）

| ロール | SELECT | INSERT | UPDATE | DELETE | USING / WITH CHECK 条件 |
|--------|--------|--------|--------|--------|------------------------|
| anon | 不可 | 不可 | 不可 | 不可 | （ポリシーなし） |
| authenticated | 自己レコードのみ可 | 自己レコードのみ可 | 自己レコードのみ可 | 自己レコードのみ可 | `USING (user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()))` / `WITH CHECK (user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid()))` |
| service_role | 全可 | 全可 | 全可 | 全可 | RLS バイパス |

### RLS 実装時の留意点（Phase 2 dev-mate 申し送り）

- 新規5テーブルの RLS は `ENABLE ROW LEVEL SECURITY` を有効化したうえで、上記マトリクス通りに `CREATE POLICY` を発行する
- 既存テーブルの RLS は変更しない（破壊的変更回避）
- `bookmarks` の `user_id` 参照先変更（auth.users → e_learning_users）に合わせて、RLS USING 条件を `auth.uid() = user_id` から `user_id IN (SELECT id FROM e_learning_users WHERE auth_user_id = auth.uid())` に書き換えるマイグレーションを追加する
- 全 RLS は `db-design-reviewer` / `security-review` で再度チェックする

---

## トランザクション境界一覧（§15）

DB 設計上、複数テーブルにまたがる更新を行う3操作の Tx 境界を明示する。Phase 2 で be-plan-mate / dev-mate が実装する際の指針とする。

### Tx-1：Stripe Webhook 受信時の購入レコード INSERT

| 項目 | 内容 |
|------|------|
| 契機 | `checkout.session.completed` Webhook 受信（`/api/stripe/webhook` Route Handler） |
| 実行ロール | service_role |
| Tx 範囲 | `e_learning_purchases` への INSERT 1 件（**単独 Tx**） |
| 冪等性保証 | `stripe_session_id` の UNIQUE 制約。Webhook 再送で UNIQUE 違反が出たら **200 OK を返す**（冪等処理。エラーログには WARN 出力） |
| 失敗時挙動 | 400/500 を返すと Stripe が指数バックオフで再送するため、業務的に成功扱いできるエラー（UNIQUE 違反）は 200 で吸収。それ以外（DB ダウン等）は 500 を返して再送に任せる |
| 楽観ロック | 適用なし（INSERT 1 件のみ） |

### Tx-2：legacy_purchases 退避処理（マイグレーション時の3ステップ）

| 項目 | 内容 |
|------|------|
| 契機 | Phase 2 マイグレーション実行時に1回限り |
| 実行ロール | service_role（マイグレーション専用） |
| Tx 範囲 | **3ステップを全て同一 Tx 内で実行** |
| ステップ詳細 | (1) `INSERT INTO e_learning_legacy_purchases SELECT ... FROM e_learning_purchases WHERE content_id IS NULL` → (2) `UPDATE e_learning_users SET has_full_access=true WHERE id IN (...)` → (3) `DELETE FROM e_learning_purchases WHERE content_id IS NULL` |
| 失敗時挙動 | **途中失敗で全ロールバック**（部分的な退避が残ると後続の CHECK 制約追加が失敗するため、原子的に実行する） |
| 楽観ロック | 適用なし（マイグレーションは単独実行・並行更新なし） |

### Tx-3：退会処理（ユーザー削除）

| 項目 | 内容 |
|------|------|
| 契機 | 管理画面または本人による退会申請 |
| 実行ロール | authenticated（本人退会）または service_role（管理者代行・運用フロー次第） |
| Tx 範囲 | `e_learning_users.deleted_at` 設定 + `display_name=NULL` + `avatar_url=NULL` の3カラム更新を **同一 Tx で実行** |
| 触らない対象 | **`e_learning_purchases` は touch しない**（税務観点・RESTRICT FK で物理削除も不可）。`email` も保持（再登録引継ぎ用・L1 確定） |
| 失敗時挙動 | 全ロールバック。途中で `deleted_at` だけ立って display_name が残るなどの中途半端な状態を避ける |
| 楽観ロック | 適用する（`WHERE id = $1 AND updated_at = $前回取得値`） |

### 補足：その他の単発操作

- ブックマーク作成・削除：単発 INSERT / DELETE。Tx 不要
- 進捗記録：単発 INSERT（UNIQUE 違反は冪等処理）。Tx 不要
- コース章・動画の編集：単発 UPDATE + 楽観ロック。Tx 不要
- カテゴリ・コース・単体動画の論理削除：単発 UPDATE（`SET deleted_at = now()`）。Tx 不要

---

## db-design-reviewer チェック項目（自己確認）

提出前に @db-design-reviewer を起動する前の自己チェック：

- [x] 1. 型・制約の完全性：全カラムに NOT NULL / NULL / DEFAULT を記述
- [x] 2. 桁数・型の根拠：全 varchar(n) / numeric / integer に根拠コメントあり
- [x] 3. PK / 複合PK の妥当性：全テーブルでサロゲートPK + 自然キー UNIQUE
- [x] 4. FK・リレーション：全 FK に ON DELETE 方針明記、孤立テーブルなし
- [x] 5. 命名規則：snake_case、e_learning_* プレフィックス統一
- [x] 6. インデックス設計：FK にインデックス、検索パターン根拠あり
- [x] 7. 監査：created_at / updated_at 全テーブル必須。created_by / updated_by は Phase 1 不要
- [x] 8. 一意性制約：自然キーに UNIQUE、排他的 N:1 は部分 UNIQUE 2本
- [x] 9. CHECK 制約：4テーブル（materials / purchases / bookmarks / progress）の排他制約明記
- [x] 10. timestamptz 統一：timestamp without time zone は使っていない
- [x] 11. varchar(桁指定なし) 不使用：全 varchar に桁数指定
- [x] 12. PostgreSQL ENUM 不使用：status / contract_status は varchar(n) + CHECK
- [x] 13. RLS マトリクス完備：全 e_learning_* テーブル × anon / authenticated / service_role × CRUD を記述（§C1）
- [x] 14. PII 保護方針明記：平文 + RLS、退会時マスキング対象を明示（§C2）
- [x] 15. 文字列正規化ルール明記：slug / email / Stripe ID 群の正規化方針を表で整理（§17）
- [x] 16. トランザクション境界明示：Stripe Webhook / legacy 退避 / 退会処理の Tx 範囲を表で整理
- [x] 17. 同時実行制御：楽観ロック方針（updated_at 比較）と view_count 非原子的加算許容の差別化を明記

---

## ディレクター 承認

- [ ] Gate 4 承認日：YYYY-MM-DD
- [ ] db-design-reviewer 全項目パス
- [ ] plan-lead 技術観点レビュー完了
- [ ] 承認時のメモ：

---

## ★この承認をもって be-plan-mate / fe-plan-mate が本格着手可能となる
