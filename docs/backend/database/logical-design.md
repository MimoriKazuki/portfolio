# 論理設計（Gate 3）

## 前提

- Gate 2（概念モデル）はディレクター承認済（2026-05-12）。本書は Gate 2 で確定したエンティティ12個・リレーション16本に対して、属性レベルの業務制約を確定させる
- **物理的な型・桁数は Gate 4 で決める**。本書では「業務上の制約」を確定させる
- **PK・複合PK・一意性・履歴保持・削除ポリシーをここで確定する**（最も重要）
- 既存稼働中のため、既存テーブルは追加方向のみで拡張（破壊的変更なし）
- PK 種別の方針：既存テーブルは UUID（`gen_random_uuid()`）を維持。新規テーブルも UUID で揃える
- M1〜M5（Gate 3 着手前確定事項）を反映済

参照：
- 業務分析：`docs/backend/database/business-analysis.md`
- 概念モデル：`docs/backend/database/conceptual-model.md`
- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- 既存スキーマ：`supabase/migrations/20251203〜20251214_*.sql`（e_learning 関連 9 ファイル）
- 設計パターンガイド：`~/.claude/templates/plan/db-design-patterns.md`

---

## 共通方針

### 監査カラムの標準セット

全 e_learning_* テーブル（既存・新規）に以下を持たせる方針とする（既存テーブルは既に持つものを継続）：

- 作成日時（`created_at`、NOT NULL、デフォルトは現在時刻）
- 更新日時（`updated_at`、NOT NULL、デフォルトは現在時刻、UPDATE 時に自動更新トリガー）

※ created_by / updated_by は Phase 1 では追加しない（管理者ロール分離なしの方針より）

### 削除ポリシーの全体方針

- **論理削除（`deleted_at TIMESTAMPTZ`）** → 主要マスタテーブル（コース・単体動画・カテゴリ・ユーザー）
- **物理削除** → 構造要素（章・コース内動画・資料）。親（コース・単体動画）の論理削除で連動する関係のため
- **個人データ**（ブックマーク・進捗）→ 物理削除（軽量データ・履歴保持要件なし）
- **購入レコード** → 物理削除不可（税務観点・領収書再発行・永続保持）

### 一意性の表現方針

- すべて **サロゲートPK（id, UUID）+ 自然キー UNIQUE 制約** で表現する（複合自然キーPKは採用しない）
- 既存テーブルもこのパターンを継続（既存 PK 構成を維持）

### 履歴保持の全体方針

Phase 1 では **エンティティ履歴テーブル（h_*）は作成しない**。
- 業務分析時点で「過去の状態を遡る」要件は明示されていない
- 購入履歴（永続保持）と進捗（視聴完了の事実保持）で十分
- 将来「コース価格変更履歴を残したい」「動画タイトル変更履歴を残したい」要件が出た場合に schema-changes で追加判断する

### 排他参照（CHECK 制約）の表現方針

`e_learning_purchases`、`e_learning_progress`、`e_learning_materials` の3テーブルは「コース or 単体動画」のいずれかを参照する排他的 N:1 関係を持つ。以下の CHECK 制約で表現する：

```
CHECK (
  (course_id IS NOT NULL AND content_id IS NULL)
  OR
  (course_id IS NULL AND content_id IS NOT NULL)
)
```

### 同時実行制御の全体方針（楽観ロック）

- **全更新系操作で楽観ロック（`updated_at` 比較）を採用する**
- 対象：コース・章・コース内動画・単体動画・カテゴリ等の管理画面編集処理
- 採用理由：管理者1人運用前提（同時編集の頻度がほぼゼロ）。悲観ロックは Supabase / PostgREST 経由では扱いが煩雑なため不採用
- 実装パターン：UPDATE 文の WHERE 句に `updated_at = $前回取得した値` を含め、更新行数 0 件を競合検出として扱う
- 例外：`e_learning_contents.view_count` / `e_learning_course_videos.view_count` の加算は **競合許容**（参考値・正確性よりパフォーマンス優先）。Gate 4 物理設計の view_count 節を参照

### PII（個人識別情報）の取扱方針

属性一覧の「PII区分」列に以下のラベルを用いる：

| ラベル | 意味 | 該当例 |
|--------|------|--------|
| 中（連絡先） | 連絡可能な識別子 | email・電話番号 |
| 低（表示名・画像） | 個人特定性は弱いが個人情報 | display_name・avatar_url・担当者名 |
| - | PIIではない | id・status・display_order 等 |

退会時の扱い：
- email：**保持**（再登録引継ぎ用・L1 確定）。マスキングしない
- display_name / avatar_url：**NULL に更新**（マスキング）
- 詳細は Gate 4 物理設計の「PII 保護方針」セクション（§C2）を参照

---

## エンティティ：e_learning_users

### 概要

Eラーニング利用者（一般ユーザー）。Supabase Auth の `auth.users` と 1:1 で紐付く。既存 109 件継続、`has_full_access` フラグを Phase 1 で追加（`has_paid_access` は最終的に廃止統合）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| auth_user_id | Supabase Auth ユーザーID | ✓ | 全社 | ✓ | auth.users 由来 | 不要 | 不可 | - | - | - | - |
| email | メールアドレス | ✓ | DB側 UNIQUE なし（Auth 側で保証） | - | Auth 由来 | 不要 | 保持（マスキングしない） | **中（連絡先）：退会時は保持（L1再登録引継ぎ用）** | Auth 由来で小文字化済み・DB 側追加正規化不要。検索時 `LOWER(email)` 比較 | 楽観ロック対象外（Auth 経由更新） |
| display_name | 表示名 | - | - | - | 手入力／OAuth 由来 | 不要 | 論理（マスキング：NULL更新） | **低（表示名）：退会時は NULL に更新** | 正規化なし | 楽観ロック対象（`updated_at` 比較） |
| avatar_url | アバター画像URL | - | - | - | 手入力／OAuth 由来 | 不要 | 論理（マスキング：NULL更新） | **低（画像URL）：退会時は NULL に更新** | 正規化なし | 楽観ロック対象 |
| is_active | アクティブ状態フラグ | ✓ | - | - | デフォルト true | 不要 | 論理 | - | - | 楽観ロック対象 |
| has_full_access | 全コンテンツ視聴可フラグ（旧 has_paid_access の後継） | ✓ | - | - | デフォルト false | 不要 | - | - | - | 楽観ロック対象（管理画面で付与・剥奪） |
| last_accessed_at | 最終アクセス日時 | - | - | - | アプリで更新 | 不要 | - | - | - | 楽観ロック対象外（頻繁更新・参考値） |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値（全 UPDATE で WHERE 句に含める）** |
| deleted_at | 削除日時（論理削除） | - | - | - | 退会時に設定 | 不要 | - | - | - | 楽観ロック対象 |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **PK 構成カラム**：`id`
- **自然キー UNIQUE 制約**：`auth_user_id`（既存通り。Supabase Auth との 1:1 を保証）
- **採用判定**（db-design-patterns.md の判断フローに従う）：
  - Q1：多対多の中間テーブル？ → No
  - Q2：自然キーが「絶対に変わらない」と保証できるか？ → No（メールは変わり得るが、auth_user_id は auth.users の主キーなので不変）
  - Q3：自然キーは単一カラムで一意？ → Yes（auth_user_id）
- **採用理由**：既存スキーマ通りサロゲートPK + auth_user_id の UNIQUE 制約を継続。auth_user_id は変わらないが、ORM 互換性・拡張性のためサロゲートPKを採用

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| auth.users | 単一 | auth_user_id | Supabase Auth との紐付け（既存スキーマ通り） |

### 一意性制約（PK以外）

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| users_auth_user_id_key | auth_user_id | 全社 | 1人のAuthユーザーに対し1つのEラーニング利用者レコード |
| users_email_idx（推奨追加） | email | 全社 | 同一メールでの重複登録防止（運用上の補助・Gate 4 で必要性再評価） |

### 業務制約・ルール

- `email` は Auth 由来のメールアドレスで、Supabase Auth 側のメール変更時に同期する想定（同期方法は実装側で決定）
- `has_full_access = true` のユーザーは視聴権限の優先順位ルール①で「全動画視聴可」となる
- `is_active = false` のユーザーはログイン不可（既存仕様継続）
- 退会処理：論理削除（`deleted_at` 設定）＋ 個人情報マスキング（email・display_name・avatar_url を NULL or 仮値に置換）を想定。最終確定は Gate 4 直前

### 履歴保持の方針

- 履歴保持の要否：不要
- 理由：氏名・メール・アバターの変更履歴を業務上追跡する要件はない

### 削除の方針

- 論理削除（`deleted_at`）
- 関連子エンティティの扱い：
  - `e_learning_purchases` → **RESTRICT**（購入履歴は永続保持・物理削除しない）
  - `e_learning_bookmarks` → **CASCADE**（個人データ・退会時消去でよい）
  - `e_learning_progress` → **CASCADE**（個人データ）
- 削除権限：管理者（管理画面から実行）／本人による退会申請（フロー詳細は Gate 4 までに確定）

### Phase 1 での追加・変更

- **追加**：`has_full_access`（bool・NOT NULL DEFAULT false）
- **追加**：`deleted_at`（TIMESTAMPTZ NULL）
- **段階廃止**：`has_paid_access`（M5 安全順序の最終ステップで削除）

---

## エンティティ：e_learning_categories

### 概要

コンテンツ（単体動画・コース）のカテゴリ。既存 6 件継続。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| name | カテゴリ名 | ✓ | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| slug | URL 用識別子 | ✓ | 全社 | - | 手入力 | 不要 | 論理 | - | 小文字英数ハイフンのみ `^[a-z0-9-]+$`・アプリ層 trim+lower（§17） | 楽観（updated_at） | - |
| description | 説明 | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| display_order | 表示順序 | ✓ | - | - | 手入力（整数） | 不要 | - | - | - | 楽観（updated_at） | - |
| is_active | アクティブ状態フラグ | ✓ | - | - | デフォルト true | 不要 | - | - | - | 楽観（updated_at） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値** | - |
| deleted_at | 削除日時（論理削除） | - | - | - | 手動 | 不要 | - | - | - | 楽観（updated_at） | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：`slug`（既存スキーマ通り）
- **採用理由**：URL 識別子として slug を使用するため UNIQUE が必要。サロゲートPKで参照関係を単純化

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| categories_slug_key | slug | 全社 | URL重複防止 |

### 業務制約・ルール

- `is_active = false` のカテゴリは公開画面に表示しない（既存仕様）
- `display_order` は同一値の重複を許容（ソート時の安定性は ID で担保）

### 履歴保持の方針

- 履歴保持の要否：不要

### 削除の方針

- 論理削除（`deleted_at`）。既存運用は `is_active=false` での非表示制御だが、Phase 1 で `deleted_at` を追加し、廃止と一時非表示を区別可能にする
- 子エンティティの扱い：
  - `e_learning_contents` → **SET NULL or RESTRICT**（カテゴリ廃止後も動画は残す。詳細は Gate 4 で確定）
  - `e_learning_courses` → **RESTRICT**（M2 でコースは必ずカテゴリに所属する制約のため、カテゴリ削除前にコース移動が必要）

### Phase 1 での追加・変更

- **追加**：`deleted_at`（TIMESTAMPTZ NULL）
- それ以外は既存スキーマを継続

---

## エンティティ：e_learning_contents（単体動画）

### 概要

単体販売される動画。既存 15 件継続。Phase 1 ではコースには所属させない（コース内動画は別テーブル `e_learning_course_videos`）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| title | タイトル | ✓ | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| description | 説明 | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| thumbnail_url | サムネイル画像URL | - | - | - | 手入力／アップロード | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| video_url | 動画URL | ✓ | - | - | 手入力／アップロード | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| duration | 動画長（表示用文字列、例「10:30」） | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| category_id | カテゴリFK | - | - | - | 選択 | 不要 | - | - | - | 楽観（updated_at） | - |
| is_free | 無料公開フラグ | ✓ | - | - | デフォルト false | 不要 | - | - | - | 楽観（updated_at） | - |
| price | 価格（円・NULL は無料の意味で運用） | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| stripe_price_id | Stripe Price ID（One-time Price） | - | 全社 | - | Stripe 連携で取得 | 不要 | - | - | Stripe API 返却値そのまま（§17） | 楽観（updated_at） | - |
| display_order | 表示順序 | ✓ | - | - | 手入力 | 不要 | - | - | - | 楽観（updated_at） | - |
| is_published | 公開状態フラグ | ✓ | - | - | デフォルト true | 不要 | - | - | - | 楽観（updated_at） | - |
| is_featured | 注目フラグ（ピックアップ表示） | ✓ | - | - | デフォルト false | 不要 | - | - | - | 楽観（updated_at） | - |
| view_count | 累計視聴数（参考値） | ✓ | - | - | アプリで加算 | 不要 | - | - | - | **競合許容**（非原子的加算・正確性よりパフォーマンス優先） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値** | - |
| deleted_at | 削除日時（論理削除） | - | - | - | 手動 | 不要 | - | - | - | 楽観（updated_at） | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：`stripe_price_id`（NULL 含む UNIQUE。同一 Stripe Price ID が複数動画に紐付くのを防止）
- **採用理由**：title・video_url は重複可能性があるため自然キーにならない。stripe_price_id は Stripe 側で一意のため UNIQUE 化が自然

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_categories | 単一 | category_id | 既存スキーマ通り。任意（NULL 許容） |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| contents_stripe_price_id_key | stripe_price_id | 全社（NULL 重複可） | Stripe Price との 1:1 を保証 |

### 業務制約・ルール

- `is_free = true` の場合、`price` は NULL（または 0）であるべき／`stripe_price_id` も NULL を許容
- `is_free = false` かつ `is_published = true` の動画は `price` および `stripe_price_id` が NOT NULL であることが推奨（業務制約として）
- `is_published = false` の場合、公開画面に表示せず、購入導線も非表示
- 既存 15 件はすべて単体動画として継続。コースには入れない

### 履歴保持の方針

- 履歴保持の要否：不要
- 価格変更履歴を残す要件は Phase 1 では明示なし。将来要件化したら schema-changes で対応

### 削除の方針

- 論理削除（`deleted_at`）。既存運用は `is_published=false` での非表示制御。Phase 1 で `deleted_at` を追加し、廃止と一時非公開を区別
- 子エンティティの扱い：
  - `e_learning_purchases` → **RESTRICT**（購入レコードは永続保持）
  - `e_learning_bookmarks` → **CASCADE**（ブックマークは廃止動画と運命を共にする）
  - `e_learning_progress` → **CASCADE**
  - `e_learning_materials` → **CASCADE**（資料は親動画と運命を共にする）

### Phase 1 での追加・変更

- **追加**：`deleted_at`（TIMESTAMPTZ NULL）
- それ以外は既存スキーマを継続

---

## エンティティ：e_learning_courses（新規・コース）

### 概要

複数の動画を束ねた商品（コース）。章構造を持ち、章内に動画を順序付けて配置する（Udemy 同様）。コースは必ず1つのカテゴリに所属（M2 確定）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| title | コースタイトル | ✓ | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| slug | URL 用識別子 | ✓ | 全社 | - | 手入力 | 不要 | 論理 | - | 小文字英数ハイフンのみ `^[a-z0-9-]+$`・アプリ層 trim+lower（§17） | 楽観（updated_at） | - |
| description | 説明（コース概要） | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| thumbnail_url | サムネイル画像URL | - | - | - | 手入力／アップロード | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| category_id | カテゴリFK（M2：必須） | ✓ | - | - | 選択 | 不要 | - | - | - | 楽観（updated_at） | - |
| is_free | 無料公開フラグ | ✓ | - | - | デフォルト false | 不要 | - | - | - | 楽観（updated_at） | - |
| price | 価格（円・NULL は無料の意味で運用） | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| stripe_price_id | Stripe Price ID（One-time Price） | - | 全社 | - | Stripe 連携で取得 | 不要 | - | - | Stripe API 返却値そのまま（§17） | 楽観（updated_at） | - |
| display_order | 表示順序 | ✓ | - | - | 手入力 | 不要 | - | - | - | 楽観（updated_at） | - |
| is_published | 公開状態フラグ | ✓ | - | - | デフォルト false（新規作成時は非公開デフォルト） | 不要 | - | - | - | 楽観（updated_at） | - |
| is_featured | 注目フラグ | ✓ | - | - | デフォルト false | 不要 | - | - | - | 楽観（updated_at） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値** | - |
| deleted_at | 削除日時（論理削除） | - | - | - | 手動 | 不要 | - | - | - | 楽観（updated_at） | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：`slug`、`stripe_price_id`
- **採用理由**：URL 識別子としての slug、Stripe 連携の stripe_price_id の重複防止

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_categories | 単一 | category_id | M2：コースは必ず1カテゴリ所属（NOT NULL） |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| courses_slug_key | slug | 全社 | URL 重複防止 |
| courses_stripe_price_id_key | stripe_price_id | 全社（NULL 重複可） | Stripe Price との 1:1 |

### 業務制約・ルール

- `is_free = true` のコースは `price` NULL、`stripe_price_id` NULL を許容
- `is_free = false` かつ `is_published = true` のコースは `price` および `stripe_price_id` が NOT NULL であることが推奨
- 公開時には少なくとも1つの章を持つことが推奨（業務上のバリデーション）

### 履歴保持の方針

- 履歴保持の要否：不要

### 削除の方針

- 論理削除（`deleted_at`）
- 子エンティティの扱い：
  - `e_learning_course_chapters` → **CASCADE**（章はコースに従属）
  - `e_learning_purchases` → **RESTRICT**（購入レコードは永続保持）
  - `e_learning_bookmarks` → **CASCADE**（ブックマークは廃止コースと運命を共にする）
  - `e_learning_materials` → **CASCADE**（コース直下の資料は親コースと運命を共にする）

---

## エンティティ：e_learning_course_chapters（新規・章）

### 概要

1コース内の章（節）。コース内で順序を持つ。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| course_id | 所属コースFK | ✓ | コース内（display_order と組） | ✓ | 選択 | 不要 | - | - | - | - | - |
| title | 章タイトル | ✓ | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| description | 章説明 | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| display_order | コース内での順序 | ✓ | コース内一意 | - | 手入力（整数） | 不要 | - | - | - | 楽観（updated_at） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値** | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：`(course_id, display_order)` の複合 UNIQUE（同一コース内で順序が重複しない）
- **採用理由**：章自体は他テーブルから参照される側になるためサロゲートPK。複合 UNIQUE で「同一コースの同じ順序」を防止

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_courses | 単一 | course_id | 親がサロゲートPKのため単一FK |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| chapters_course_order_key | (course_id, display_order) | コース内 | 同一コース内で章順序が重複しない |

### 業務制約・ルール

- 章はコースに必ず所属（`course_id` NOT NULL）
- 章単独の削除は物理削除でも論理削除でも可（運用上の判断）。本書では論理削除なしで物理削除を採用（章自体に履歴要件なし・購入参照もなし）

### 履歴保持の方針

- 履歴保持の要否：不要

### 削除の方針

- **物理削除**（`deleted_at` カラムなし）
- 子エンティティの扱い：
  - `e_learning_course_videos` → **CASCADE**

---

## エンティティ：e_learning_course_videos（新規・コース内動画）

### 概要

コースの章に所属する動画。章内で順序を持つ。`is_free` フラグで個別マーキング可（有料コース内に無料動画を混在させられる）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| chapter_id | 所属章FK | ✓ | 章内（display_order と組） | ✓ | 選択 | 不要 | - | - | - | - | - |
| title | 動画タイトル | ✓ | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| description | 動画説明 | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| thumbnail_url | サムネイル画像URL | - | - | - | 手入力／アップロード | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| video_url | 動画URL | ✓ | - | - | 手入力／アップロード | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| duration | 動画長（表示用文字列） | - | - | - | 手入力 | 不要 | 論理 | - | - | 楽観（updated_at） | - |
| is_free | コース未購入者にも視聴可フラグ | ✓ | - | - | デフォルト false | 不要 | - | - | - | 楽観（updated_at） | - |
| display_order | 章内での順序 | ✓ | 章内一意 | - | 手入力（整数） | 不要 | - | - | - | 楽観（updated_at） | - |
| view_count | 累計視聴数（参考値・L5 確定） | ✓ | - | - | アプリで加算 | 不要 | - | - | - | **競合許容**（非原子的加算・正確性よりパフォーマンス優先） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値** | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：`(chapter_id, display_order)` の複合 UNIQUE
- **採用理由**：章内で動画順序を保証。サロゲートPKは進捗テーブルから参照されるため必要

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_course_chapters | 単一 | chapter_id | 親がサロゲートPKのため単一FK |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| course_videos_chapter_order_key | (chapter_id, display_order) | 章内 | 同一章内で動画順序が重複しない |

### 業務制約・ルール

- 動画は章に必ず所属（`chapter_id` NOT NULL）
- `is_free = true` の動画は、コース未購入者でもログインユーザーであれば視聴可（視聴権限ルール④に該当）
- コース内動画は **販売単位ではない**（販売はコース単位のみ）→ price / stripe_price_id は持たない
- コース内動画は **ブックマーク対象外**（M4 確定）
- コース内動画は **個別資料を持たない**（M1 確定。資料はコース単位で持つ）

### 履歴保持の方針

- 履歴保持の要否：不要

### 削除の方針

- 物理削除（`deleted_at` カラムなし。動画自体は章・コースの論理削除に従属）
- 子エンティティの扱い：
  - `e_learning_progress` → **CASCADE**（進捗は個人データ）

---

## エンティティ：e_learning_materials（PDF資料）

### 概要

動画またはコースに付随する資料（PDF 等）。M1 確定により、単体動画とコースのどちらにも紐付け可能（排他的 N:1）。コース内動画個別には紐付けない。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| content_id | 所属単体動画FK（content_id か course_id のいずれか NOT NULL） | - | - | ✓ | 選択 | 不要 | - | - | - | - | - |
| course_id | 所属コースFK（content_id か course_id のいずれか NOT NULL） | - | - | ✓ | 選択 | 不要 | - | - | - | - | - |
| title | 資料タイトル | ✓ | - | - | 手入力 | 不要 | - | - | - | 楽観（updated_at） | - |
| file_url | ファイルURL | ✓ | - | - | アップロード | 不要 | - | - | - | 楽観（updated_at） | - |
| file_size | ファイルサイズ（バイト） | - | - | - | アップロード時取得 | 不要 | - | - | - | 楽観（updated_at） | - |
| display_order | 表示順序（資料間の並び） | ✓ | (content_id or course_id) 内 | - | 手入力 | 不要 | - | - | - | 楽観（updated_at） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | **楽観ロックの基準値** | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **採用理由**：既存スキーマ通り。所有関係は CHECK 制約で表現

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_contents | 単一 | content_id | 単体動画への所属（既存通り） |
| e_learning_courses | 単一 | course_id | M1：コース直下資料への新規対応 |

### 一意性制約

なし（同一動画／コースに同名の資料が複数存在することは許容する。display_order で順序を保証）

### 業務制約・ルール

- **排他的所有 CHECK 制約**：
  ```
  CHECK (
    (content_id IS NOT NULL AND course_id IS NULL)
    OR
    (content_id IS NULL AND course_id IS NOT NULL)
  )
  ```
- 単体動画にもコースにも複数の資料を持てる（M1：「1動画1資料」制限を撤廃）
- 複数資料の zip 一括ダウンロードは FE 側で実装（DB 側は単純な N:1）

### 履歴保持の方針

- 履歴保持の要否：不要

### 削除の方針

- 物理削除（既存運用通り。資料の論理削除要件はない）
- 親動画／コースの削除時：
  - `e_learning_contents` 論理削除時 → 資料も論理削除に追従（CASCADE 相当のアプリ実装、または資料は親の deleted_at を見て非表示）
  - `e_learning_courses` 論理削除時 → 同上

### Phase 1 での追加・変更

- **追加**：`course_id`（UUID NULL）と排他的 CHECK 制約
- 既存 `content_id` の FK は維持（既存7件は `content_id IS NOT NULL` の状態のまま継続）

---

## エンティティ：e_learning_purchases（購入レコード）

### 概要

コースまたは単体動画の購入レコード。Stripe Checkout（mode: payment）の購入完了 Webhook で作成される。永続保持（税務観点）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| user_id | 購入ユーザーFK | ✓ | (user, target) で組 | ✓ | 選択 | 不要 | - | - | - | - | - |
| course_id | 購入対象コースFK（course_id or content_id のいずれか NOT NULL） | - | - | ✓ | Stripe 由来 | 不要 | - | - | - | - | - |
| content_id | 購入対象単体動画FK（course_id or content_id のいずれか NOT NULL） | - | - | ✓ | Stripe 由来 | 不要 | - | - | - | - | - |
| stripe_session_id | Stripe Checkout Session ID | ✓ | 全社 | ✓ | Stripe 由来 | 不要 | - | - | Stripe API 返却値そのまま（§17） | - | - |
| stripe_payment_intent_id | Stripe Payment Intent ID（返金照合用） | - | 全社 | ✓ | Stripe Webhook 由来 | 不要 | - | - | Stripe API 返却値そのまま（§17） | - | - |
| amount | 支払金額（円・税込） | ✓ | - | ✓ | Stripe 由来 | 不要 | - | - | - | - | - |
| status | 購入ステータス（completed / refunded / failed 等） | ✓ | - | - | Webhook で更新 | 不要 | - | - | - | service_role 単独更新（楽観ロック対象外） | - |
| refunded_at | 返金日時（charge.refunded 受信時） | - | - | - | Webhook で更新 | 不要 | - | - | - | service_role 単独更新（楽観ロック対象外） | - |
| created_at | 作成日時（購入完了日時） | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | - | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：
  - `stripe_session_id`（Stripe Checkout Session との 1:1）
  - `(user_id, course_id)` の部分 UNIQUE（`course_id IS NOT NULL` の行のみで一意・PostgreSQL 部分インデックス）
  - `(user_id, content_id)` の部分 UNIQUE（`content_id IS NOT NULL` の行のみで一意）
- **採用理由**：既存 `UNIQUE(user_id, content_id)` 制約は再設計が必要（M3 で既存6件保持のため、既存と互換性を保つには部分 UNIQUE が現実的）。Stripe 連携の冪等性のため `stripe_session_id` も UNIQUE

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_users | 単一 | user_id | 親がサロゲートPK |
| e_learning_courses | 単一 | course_id | M1 排他的所有のため任意（NULL 許容） |
| e_learning_contents | 単一 | content_id | 既存通り。任意（NULL 許容） |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| purchases_stripe_session_id_key | stripe_session_id | 全社 | Stripe Session の重複処理防止（Webhook 冪等性） |
| purchases_user_course_key（部分） | (user_id, course_id) WHERE course_id IS NOT NULL | 全社 | 同一ユーザーが同一コースを2回購入するのを防止 |
| purchases_user_content_key（部分） | (user_id, content_id) WHERE content_id IS NOT NULL | 全社 | 同一ユーザーが同一単体動画を2回購入するのを防止 |

※ 既存 `UNIQUE(user_id, content_id)` は Gate 4 で「部分 UNIQUE 2本に分割」する移行マイグレーションを作成する

### 業務制約・ルール

- **排他的所有 CHECK 制約**：
  ```
  CHECK (
    (course_id IS NOT NULL AND content_id IS NULL)
    OR
    (course_id IS NULL AND content_id IS NOT NULL)
    OR
    -- M3：既存6件の歴史的レコード（course_id IS NULL AND content_id IS NULL）を特例として許容
    (course_id IS NULL AND content_id IS NULL AND created_at < '2026-XX-XX')
  )
  ```
  ※ M3 確定により既存6件は物理削除しないため、CHECK 制約に「歴史的レコード許容句」を含める。Gate 4 で具体的な閾値日付（マイグレーション適用日時）を確定
- 価格変更後の購入レコード `amount` は購入時点の金額を保持（変更不可）
- `status` の取り得る値：`completed` / `refunded` / `failed` / `pending`（Gate 4 で区分マスタ化 or CHECK 制約で値を限定）
- `refunded_at` は `status = 'refunded'` のときのみ NOT NULL

### 履歴保持の方針

- 履歴保持の要否：**永続保持**（履歴テーブル不要・本テーブルが履歴そのもの）
- 物理削除不可

### 削除の方針

- **削除不可**（物理・論理ともに不可）
- ユーザー退会時も購入レコードは保持。`user_id` FK は **RESTRICT** で保護
- ※ ただし、ユーザー論理削除（deleted_at）後の購入レコード参照は、画面側でマスキング等を行う

### Phase 1 での追加・変更

- **追加**：`course_id`（UUID NULL）
- **追加**：`stripe_payment_intent_id`（text NULL・設計負債4）
- **追加**：`refunded_at`（TIMESTAMPTZ NULL）
- **変更**：既存 `UNIQUE(user_id, content_id)` を削除し、部分 UNIQUE 2本に置き換える
- **既存6件**：そのまま保持（M3）

---

## エンティティ：e_learning_bookmarks（ブックマーク）

### 概要

ユーザーがコースまたは単体動画をブックマーク。コース内動画はブックマーク対象外（M4 確定）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| user_id | ユーザーFK（e_learning_users.id 参照に統一・設計負債1） | ✓ | (user, target) で組 | ✓ | 選択 | 不要 | - | - | - | - | - |
| course_id | コースFK（course_id or content_id のいずれか NOT NULL） | - | - | ✓ | 選択 | 不要 | - | - | - | - | - |
| content_id | 単体動画FK（course_id or content_id のいずれか NOT NULL） | - | - | ✓ | 選択 | 不要 | - | - | - | - | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：
  - `(user_id, course_id)` の部分 UNIQUE
  - `(user_id, content_id)` の部分 UNIQUE
- **採用理由**：同一ユーザーが同一対象を二重ブックマークするのを防止

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_users | 単一 | user_id | **既存 `auth.users.id` 参照を `e_learning_users.id` 参照に統一**（設計負債1の対応） |
| e_learning_courses | 単一 | course_id | M4：コースもブックマーク対象 |
| e_learning_contents | 単一 | content_id | 既存通り |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| bookmarks_user_course_key（部分） | (user_id, course_id) WHERE course_id IS NOT NULL | 全社 | 同一ユーザーが同一コースを二重ブックマーク不可 |
| bookmarks_user_content_key（部分） | (user_id, content_id) WHERE content_id IS NOT NULL | 全社 | 同一ユーザーが同一単体動画を二重ブックマーク不可 |

### 業務制約・ルール

- **排他的所有 CHECK 制約**：
  ```
  CHECK (
    (course_id IS NOT NULL AND content_id IS NULL)
    OR
    (course_id IS NULL AND content_id IS NOT NULL)
  )
  ```
- 既存3件は `content_id IS NOT NULL` で継続。`user_id` の参照先を `auth.users.id` から `e_learning_users.id` に書き換えるマイグレーションを Gate 4 で設計

### 履歴保持の方針

- 履歴保持の要否：不要

### 削除の方針

- **物理削除**（個人データ・解除はレコード削除）
- 親エンティティ削除時：
  - `e_learning_users` 削除（CASCADE）
  - `e_learning_courses` 削除（CASCADE）
  - `e_learning_contents` 削除（CASCADE）

### Phase 1 での追加・変更

- **追加**：`course_id`（UUID NULL）
- **変更**：`user_id` FK 参照先を `auth.users(id)` から `e_learning_users(id)` に変更（設計負債1）
- **変更**：既存 `UNIQUE(user_id, content_id)` を部分 UNIQUE 2本に置き換える
- **既存3件**：参照先変更時にデータ整合性を保つ（`auth_user_id` → `e_learning_users.id` の対応で UPDATE）

---

## エンティティ：e_learning_progress（新規・進捗）

### 概要

ユーザーの動画視聴進捗。「視聴完了フラグのみ」を保持（N6 確定）。コース完了判定は末尾動画到達を集計で判断（N7 確定）。修了証なし（N8 確定）。

### 属性一覧

| 属性 | 意味 | 必須 | 一意性 | 不変 | 採番 | 履歴 | 削除 | PII区分 | 正規化 | 同時編集対応 | PK候補 |
|------|------|------|--------|------|------|------|------|--------|--------|------------|--------|
| id | 内部識別子 | ✓ | 全社 | ✓ | 自動採番（UUID） | 不要 | 不可 | - | - | - | ✓ |
| user_id | ユーザーFK | ✓ | (user, target) で組 | ✓ | 選択 | 不要 | - | - | - | - | - |
| course_video_id | コース内動画FK（course_video_id or content_id のいずれか NOT NULL） | - | - | ✓ | 選択 | 不要 | - | - | - | - | - |
| content_id | 単体動画FK（course_video_id or content_id のいずれか NOT NULL） | - | - | ✓ | 選択 | 不要 | - | - | - | - | - |
| completed_at | 視聴完了日時（完了の事実を保持） | ✓ | - | - | アプリで設定 | 不要 | - | - | - | INSERT のみ（UPDATE 発生せず） | - |
| created_at | 作成日時 | ✓ | - | ✓ | 自動 | 不要 | - | - | - | - | - |
| updated_at | 更新日時 | ✓ | - | - | 自動 | 不要 | - | - | - | - | - |

### 主キー設計

- **PK 種別**：サロゲートPK（id, UUID）
- **自然キー UNIQUE 制約**：
  - `(user_id, course_video_id)` の部分 UNIQUE
  - `(user_id, content_id)` の部分 UNIQUE
- **採用理由**：1ユーザー × 1動画について進捗レコードは1つ（重複防止）

### FK 設計

| 参照先 | FK種別 | カラム | 採用理由 |
|-------|--------|-------|---------|
| e_learning_users | 単一 | user_id | 親がサロゲートPK |
| e_learning_course_videos | 単一 | course_video_id | 排他的所有のため任意 |
| e_learning_contents | 単一 | content_id | 排他的所有のため任意 |

### 一意性制約

| 制約名 | 対象カラム | スコープ | 業務上の意味 |
|--------|-----------|---------|-------------|
| progress_user_course_video_key（部分） | (user_id, course_video_id) WHERE course_video_id IS NOT NULL | 全社 | 同一動画の進捗は1ユーザー1レコード |
| progress_user_content_key（部分） | (user_id, content_id) WHERE content_id IS NOT NULL | 全社 | 同一動画の進捗は1ユーザー1レコード |

### 業務制約・ルール

- **排他的所有 CHECK 制約**（materials と同じパターン）
- `completed_at` は視聴完了時に1回設定。同一動画を複数回視聴しても上書き不可（最初の視聴完了日時を保持）。「再視聴履歴」は持たない
- 進捗レコードが存在する＝視聴完了済み（存在しない＝未視聴）と解釈する
- コース完了判定：「コース内の全 course_video について進捗レコードが存在し、かつ末尾動画の進捗が存在する」で末尾到達を判定（N7 確定）
- 修了証は発行しない（N8 確定）

### 履歴保持の方針

- 履歴保持の要否：不要
- 「複数回視聴の履歴」も Phase 1 では保持しない（要件なし）

### 削除の方針

- 物理削除（個人データ）
- 親エンティティ削除時：
  - `e_learning_users` 削除 → CASCADE
  - `e_learning_course_videos` 削除 → CASCADE
  - `e_learning_contents` 削除 → CASCADE

---

## エンティティ：e_learning_corporate_customers（既存・将来用）

### 概要

研修サービス契約企業。既存スキーマ通り。Phase 1 では参照しない。

### 属性一覧

既存スキーマを維持。Phase 1 で属性追加・変更は行わない：

| 属性 | 意味 | PII区分 | 正規化 | 同時編集対応 |
|------|------|--------|--------|------------|
| id | UUID PK | - | - | - |
| company_name | 企業名 | - | 正規化なし | 楽観ロック対象 |
| contact_person | 担当者名 | **低（担当者名）** | 正規化なし | 楽観ロック対象 |
| contact_email | 担当者メール | **中（連絡先）** | アプリ層で `LOWER(trim(email))` | 楽観ロック対象 |
| contact_phone | 担当者電話番号 | **中（連絡先）** | 正規化なし（表示用） | 楽観ロック対象 |
| contract_status | 契約ステータス（active/expired/pending・CHECK制約） | - | - | 楽観ロック対象 |
| contract_start_date | 契約開始日 | - | - | 楽観ロック対象 |
| contract_end_date | 契約終了日 | - | - | 楽観ロック対象 |
| notes | メモ | - | - | 楽観ロック対象 |
| created_at | 作成日時 | - | - | - |
| updated_at | 更新日時 | - | - | **楽観ロックの基準値** |

### 主キー設計

- サロゲートPK（id, UUID）。既存通り

### 削除の方針

- 既存通り（特に変更しない）。Phase 1 では運用も発生しない

---

## エンティティ：e_learning_corporate_users（既存・将来用）

### 概要

法人契約に紐づくユーザーメールアドレス。既存スキーマ通り。Phase 1 では参照しない。

### 属性一覧

既存スキーマを維持：

| 属性 | 意味 | PII区分 | 正規化 | 同時編集対応 |
|------|------|--------|--------|------------|
| id | UUID PK | - | - | - |
| corporate_customer_id | FK to e_learning_corporate_customers | - | - | - |
| email | 契約企業の社員メール | **中（連絡先）** | アプリ層で `LOWER(trim(email))` を適用してから INSERT（§18-4） | 楽観ロック対象外（基本的に追加/削除のみ・更新は発生しない想定） |
| created_at | 作成日時 | - | - | - |

UNIQUE(corporate_customer_id, email)

### 主キー設計

- サロゲートPK（id, UUID）
- 自然キー UNIQUE：`(corporate_customer_id, email)`

### 削除の方針

- 既存通り（特に変更しない）

---

## 全体的な業務制約

### 視聴権限の判定ロジック（業務制約・横断）

エンティティ単独では表現できない、横断的な業務ルール：

```
ユーザー U が動画 V を視聴できるか？

① U.has_full_access = true  →  視聴可
② V がコース内動画（V ∈ course_video）の場合：
   ・V.is_free = true → ログインユーザーは視聴可
   ・U が V の所属コースを購入済（e_learning_purchases に (U.id, V.chapter.course_id) が存在し status='completed'）→ 視聴可
③ V が単体動画（V ∈ contents）の場合：
   ・V.is_free = true → ログインユーザーは視聴可
   ・U が V を購入済（e_learning_purchases に (U.id, V.id) が存在し status='completed'）→ 視聴可
④ それ以外 → 視聴不可
```

### コース構造の業務制約

- コース → 章 → コース内動画 の3階層
- 章はコース内で順序を持つ（`display_order` UNIQUE）
- コース内動画は章内で順序を持つ（`display_order` UNIQUE）
- **視聴ロックなし**：先頭から順に見る必要はない（自由視聴）

### 既存購入レコード6件の歴史的扱い（M3 確定）

- 既存 6 件は `content_id IS NULL`（全コンテンツ買い切りの歴史的レコード）
- 物理削除しない（税務観点）
- 該当6名のユーザーには `has_full_access=true` を付与（M5 安全順序の Step 2）
- CHECK 制約は「歴史的レコード許容句」を含めて運用（Gate 4 で具体的な閾値日時を確定）

### Stripe Webhook の冪等性

- `stripe_session_id` UNIQUE で重複処理を防止
- `stripe_payment_intent_id` は返金照合に使用（charge.refunded 受信時）

---

## このゲートで決定した重要事項

Gate 4 以降に影響する重大判断を記録する。

| 決定事項 | 検討した代替案 | 採用理由 |
|---------|--------------|---------|
| 全テーブル UUID（gen_random_uuid）PK | bigserial、TEXT 自然キーPK | 既存テーブルが UUID で稼働中。一貫性のため新規も UUID |
| 排他的 N:1 関係は 2 FK + CHECK 制約パターン | polymorphic 参照（type + id）、テーブル分割 | FK 整合性を DB で保証可能、クエリ単純、Stripe Webhook の分岐回避 |
| `e_learning_purchases.UNIQUE(user_id, content_id)` を 2本の部分 UNIQUE に分割 | 既存 UNIQUE 維持 | course_id 追加で意味が変わる。部分 UNIQUE で course／content 別に重複防止 |
| 章は独立テーブル `e_learning_course_chapters` | course_videos に章番号を持たせる | 章タイトル変更時の全動画 UPDATE 回避、章単位の操作を可能に |
| 進捗は「視聴完了フラグのみ」（completed_at 1カラム） | 視聴秒数・最終再生位置 | N6 確定。シンプル運用 |
| `e_learning_materials` に course_id 追加・排他的 CHECK | テーブル分割（contents 用・courses 用） | M1 確定。既存7件を破壊せず単一テーブル維持 |
| ブックマークは「コース or 単体動画」（コース内動画は除外） | コース内動画もブックマーク可 | M4 確定。集約された対象（コース）に絞ることで UX 単純化 |
| `has_paid_access` を廃止し `has_full_access` に統合 | 並行運用、機能分離 | M5 確定。意味の二重管理を排除 |
| 履歴テーブル（h_*）は Phase 1 で作成しない | 全業務テーブルに h_* を作成 | 業務要件で履歴追跡が明示されていない。Phase 2 以降で必要に応じ追加 |
| 監査ログテーブル（l_*）は Phase 1 で作成しない | 管理画面操作ログを記録 | 確定事項より管理者ロール分離・監査ログなし |
| 同時実行制御は楽観ロック（`updated_at` 比較）を採用 | 悲観ロック（`SELECT ... FOR UPDATE`） | 管理者1人運用前提。Supabase/PostgREST 経由で悲観ロックは煩雑 |
| `view_count` の加算は競合許容（楽観ロック対象外） | 楽観ロック適用、RPC 関数で原子的加算 | 参考値・正確性よりパフォーマンス優先。Phase 1 では実装簡素化 |
| PII は平文 + Supabase RLS で保護（pgcrypto 不使用） | pgcrypto による暗号化 | 機微情報なし・日本国内向け BtoC・GDPR 適用外 |
| 退会時 email は保持（マスキング対象外） | email も NULL 化 | L1 確定：再登録時の購入履歴引継ぎに必要 |
| 退会時 display_name / avatar_url は NULL 更新（マスキング） | 全カラム保持 | 個人特定性の低減 |

---

## 未確定事項（ディレクター 確認必要）

Gate 4 開始前に確認が必要な項目を整理する。これが残った状態で Gate 4 に進まない。

業務観点（Gate 4 直前までに確定したい）：

- [ ] **退会時データ保持ポリシーの詳細**：個人情報マスキングのカラム範囲（email / display_name / avatar_url のうちどれを NULL/仮値化するか）。退会後に同一メール再登録時の購入履歴引継ぎ方針
- [ ] **`purchases.status` の取り得る値**：`completed` / `refunded` / `failed` / `pending` の4区分でよいか（区分マスタ化／CHECK 制約のどちらにするか）
- [ ] **既存購入6件の CHECK 制約閾値日時**：M3 で歴史的レコード許容句を入れる場合の具体的な閾値（マイグレーション適用日時を採用予定）
- [ ] **`e_learning_categories` の論理削除追加**：既存運用は `is_active` での非表示制御。`deleted_at` 追加は新機能扱い／既存運用維持のどちらにするか
- [ ] **コース内動画への `view_count` 持たせるか**：単体動画には既存で `view_count` あり。コース内動画も持たせるかは業務要件次第

Gate 4 確定で良いもの（物理レベル）：

- [ ] 削除時の挙動の最終確定（CASCADE / RESTRICT / SET NULL）
- [ ] `purchases.status` の物理表現（varchar(20) + CHECK / smallint + 区分マスタ）
- [ ] 各 UUID カラムのデフォルト値（`gen_random_uuid()`）
- [ ] timestamptz の精度
- [ ] テキスト系カラムの varchar(n) / text の使い分け
- [ ] インデックス設計（特に部分 UNIQUE / 検索パターンに基づく追加インデックス）

---

## ディレクター 承認

- [x] **Gate 3 承認日：2026-05-12**
- [x] PK確定（全エンティティ）：✓（全エンティティでサロゲートPK + 自然キー UNIQUE を確定）
- [x] 一意性制約確定：✓（部分 UNIQUE を含めて確定）
- [x] 履歴保持方針確定：✓（Phase 1 では履歴テーブル作成なし）
- [x] 削除ポリシー確定：✓（業務テーブルは論理削除、個人データは物理削除、購入レコードは削除不可）
- [x] L1〜L5 確定事項反映：詳細は `docs/phase1/gate1-confirmed-decisions.md` 参照
  - L1：退会時メール一致で引き継ぎ
  - L2：status は completed / refunded の2区分
  - L3：既存6件は legacy_purchases 別テーブル退避
  - L4：categories に deleted_at 追加（is_active も維持）
  - L5：コース内動画に view_count 追加
- [ ] 承認時のメモ：
