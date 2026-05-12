# Phase 1 Gate 1 業務確定事項

## このドキュメントの位置づけ

ディレクター（Kosuke）とのヒアリング（`docs/phase1/gate1-questions/director-checklist.md` の Q&A）で確定した業務仕様を整理したもの。
3メート（db / be / fe）が Gate 1〜4 を進める際の **共通参照資料** とする。

回答日：2026-05-12
回答者：Kosuke（ディレクター）

---

## 0. Phase 1 スコープ確定

Eラーニング機能の大幅刷新：

1. **LP 追加**（/e-learning 入口に LP）— 買い切り訴求
2. **コース＋単体動画の買い切り販売**（**サブスクは廃止**）
3. **コース化**（複数動画を束ねた連続視聴・章構造・順序あり）
4. **管理画面対応**（コース管理・動画管理・価格設定・運用メンバー管理）
5. **既存資産の互換維持**（既存ユーザー109件・ブックマーク3件・購入者6名）

スコープ外（運用継続のみ）：projects / columns / documents / contacts / youtube_videos 等。

---

## 1. コンテンツ販売モデル（最重要）

### コンテンツ4パターン

| 種別 | 価格設定 | コース内 is_free 動画 | アクセス可能ユーザー |
|------|---------|---------------------|-------------------|
| **無料コース** | なし | n/a | ログインユーザー全員 |
| **有料コース** | コース単位で価格設定 | あり（混在可） | 購入済ユーザー＋is_free動画はログイン全員 |
| **無料単体動画** | なし | n/a | ログインユーザー全員 |
| **有料単体動画** | あり | n/a | 購入済ユーザー |

### 重要ルール

- **コース内動画は個別購入できない**（コース単位購入のみ）
- 単体動画は単体のみで販売（コース所属しない）
- **既存15動画は単体動画として継続**。これから作るコースには入れない
- 仮に既存動画をコースに含める必要が出ても、新規動画を作成して入れる

---

## 2. 視聴権限の優先順位

```
① has_full_access = true → 全動画視聴可（無条件）
② コース購入済み → そのコース内の全動画視聴可
③ 単体動画購入済み → その動画視聴可
④ 動画が is_free フラグ true → ログインユーザー全員視聴可
⑤ それ以外 → 視聴不可
```

### 補足

- **ログイン必須**（Udemy 同様）— 未ログインユーザーは LP のみ閲覧可
- 購入したコース・単体動画は **永続視聴可**（期限なし・Udemy 同様）

---

## 3. コース構造

| 項目 | 設定 |
|------|------|
| コース：動画の関係 | **1対多**（1コース＝複数動画） |
| 動画順序 | **あり**（第1話 → 第2話 → 第3話） |
| 章構造 | **あり**（第1章：基礎、第2章：応用 等） |
| 視聴ロック | **なし**（自由視聴） |
| コース内動画の無料/有料 | **is_free フラグ**で個別マーキング可能 |

---

## 4. has_full_access フラグ（旧「弊社メンバー」）

### 仕様

- カラム名：`has_full_access`（bool）
- 配置：`e_learning_users` テーブル
- デフォルト：false
- 既存購入者6名：自動で **true** に設定
- 運営メンバー：管理画面で手動切替（plan-lead は自動判定ロジックを組まない）

### 名称について

ステータス名は「フルアクセス」を採用。一般ユーザーはこのフラグなし。

---

## 5. Stripe 連携

### 採用モデル

- **買い切りのみ**（サブスク廃止）
- Stripe Checkout の **mode: 'payment'**（One-time payment）

### 必要な Webhook イベント

| イベント | 用途 |
|---------|------|
| `checkout.session.completed` | 購入完了 → DB に購入レコード作成・権限付与 |
| `charge.refunded` | 返金処理 → 権限剥奪・DB 状態更新 |

※ サブスク関連イベント（`customer.subscription.*` / `invoice.*`）は不要

### 必要な Stripe Price

- 各コース・各単体動画につき1つずつ One-time Price を作成
- 既存の `STRIPE_E_LEARNING_PRICE_ID` 固定方式は廃止 → DB に紐付け管理

---

## 6. 既存資産の移行

| 既存資産 | 件数 | 移行方針 |
|---------|-----|---------|
| e_learning_users | 109件 | そのまま継続 |
| e_learning_bookmarks | 3件 | そのまま継続（ただし FK は統一する：設計負債1） |
| e_learning_contents | 15件 | 単体動画として継続 |
| e_learning_categories | 6件 | そのまま継続 |
| e_learning_materials | 7件 | そのまま継続 |
| e_learning_purchases | 6件 | レコードは保持。6名のユーザーに `has_full_access=true` 自動付与 |
| e_learning_corporate_customers | 0件 | スコープ外（将来用） |
| e_learning_corporate_users | 0件 | スコープ外（将来用） |

---

## 7. 設計負債6項目の Phase 1 対応（一括承認済）

| # | 内容 | Phase 1 対応 |
|---|------|------------|
| 1 | `bookmarks.user_id` FK 不統一（auth.users.id 参照） | **`e_learning_users.id` 参照に統一する** |
| 2 | `purchases.content_id` NULL 許容（全コンテンツ買い切り = NULL） | **新スキーマで意味再整理**（コース購入か単体購入かを区別する設計に） |
| 3 | `users` に role カラムなし | **`has_full_access` フラグ追加で対応**（§4 参照） |
| 4 | `purchases` に `stripe_payment_intent_id` なし | **Phase 1 で追加**（返金照合のため） |
| 5 | 管理者判定が「ログイン＝admin」のみ | **現状維持**（ロール分離なし） |
| 6 | `ADMIN_EMAIL` 環境変数がコード未参照 | **Phase 1 で削除**（混乱防止） |

---

## 8. 既存スキーマのコード化

### 採用案

**案A**：Phase 1 中に Supabase の現状スキーマを取得し、`supabase/migrations/0000_initial_existing_schema.sql` として保存する。

### 担当・取得方法

- 担当：plan-lead
- 方法：supabase MCP の読み取り専用クエリ（`list_tables` / `list_migrations` / `get_advisors` / `execute_sql` で SELECT のみ）
- 本番影響：なし（読み取りのみ）

### 経緯（参考）

開発初期はマイグレーションファイルで運用していたが、途中で supabase MCP 経由のダッシュボード編集に切り替えた結果、DDL がリポジトリに残らない状態になった。Phase 1 でこれを正常化する。

---

## 9. 管理者ロール

- **現状維持**：「auth.users に存在＝管理者」のみ
- ロール分離なし
- 監査ログなし

---

## 10. 各 Gate の進め方

### 残課題（次点13問の取扱）

サブスク廃止により大半が簡素化された。以下は Gate 1 業務分析 docs 作成中に「文脈つき」で plan-lead がディレクターに個別質問する：

**Gate 2 前に確定済（2026-05-12）：**
- [x] **進捗データの保存粒度** → 視聴完了フラグのみ（N6・案A）
- [x] **コース完了判定の閾値** → 末尾到達で完了（N7・案B / Udemy 同様）
- [x] **修了証・修了機能の Phase 1 スコープ** → 今回スコープ外（N8・案C）
- [x] **LP 必須セクション** → 全8セクション採用（ヒーロー／バリュー訴求／コース一覧／単体動画一覧／受講生の声／実績数値／FAQ／お問い合わせ）（N9）
- [x] **LP メイン CTA** → 「コースを見る」（N9・候補A）

**Gate 2 完了時に確定（2026-05-12）：**
- [x] **コースとカテゴリの関係** → 必須（コースは必ず1つのカテゴリに所属）（M2・案A）
- [x] **コース内動画のブックマーク対応** → コースと単体動画にブックマーク可、コース内動画は不可（M4）
- [x] **既存 `has_paid_access` カラムの扱い** → 廃止し `has_full_access` に統合（M5・案A）

**Gate 3 着手前に確定（2026-05-12）：**

- [x] **M1：PDF資料の所有先**
  - 単体動画もコースも**複数資料を持てる**（単体動画の「1動画1資料」制限を撤廃）
  - 複数資料がある場合は **zip 一括ダウンロード**（Teams 同様の動作）
  - **コース内動画個別**には資料を紐付けない（コース単位で資料エリア）
  - テーブル設計：`e_learning_materials` を拡張し `content_id`（単体動画 FK）と `course_id`（コース FK）の排他的 N:1（片方のみ NOT NULL の CHECK 制約）

- [x] **M3：既存購入レコード6件の扱い**
  - **物理削除しない**（税務観点・安全優先）
  - 実装は M5 と統合した安全な順序で進める：
    1. `has_full_access` カラム追加（DEFAULT false）
    2. 既存6名（`has_paid_access=true`）に `has_full_access=true` を一括付与
    3. アプリケーションコードを `has_full_access` 参照に切り替え
    4. 動作検証
    5. `has_paid_access` カラム削除

**Gate 3 完了時に確定（2026-05-12）：**

- [x] **L1：退会時データ保持ポリシー**
  - 同一メールで再登録時 → **過去購入履歴・進捗を引き継ぐ**（メール一致で同一人物扱い）
  - email カラムはマスキングせず保持（再登録マッチングのため）
  - display_name / avatar_url のマスキング詳細は Gate 4 で db-plan-mate が提案

- [x] **L2：`purchases.status` の取り得る値**
  - **`completed` / `refunded` の2区分**（案C）
  - Stripe Webhook で受信するのは `checkout.session.completed`（→ completed）と `charge.refunded`（→ refunded）のみ
  - 将来サブスク等を導入する際に追加

- [x] **L3：既存購入6件の CHECK 制約閾値日時**
  - **既存6件を `e_learning_legacy_purchases` 別テーブルに退避**（案C）
  - 本テーブル `e_learning_purchases` は新ルール（course_id / content_id 排他）の厳格 CHECK 制約適用
  - 退避用テーブルは「特殊な歴史的レコード」として保持・FK は緩く

- [x] **L4：`e_learning_categories` の論理削除追加**
  - **`deleted_at TIMESTAMPTZ` を追加**（案B・共通方針に合わせる）
  - 既存 `is_active` も維持
  - 運用：「使ってないカテゴリは `is_active=false`」「廃止確定なら `deleted_at` 設定」で使い分け

- [x] **L5：コース内動画への `view_count`**
  - **追加する**（案A）
  - 管理者画面でコース内動画の人気度を集計

**Gate 4 までに確定（未確定）：**
- 動画プレーヤー（既存実装の継続可否）
- 返金ポリシー
- 法的表記の提示タイミング
- メール通知シナリオ
- 退会時のマスキング対象カラム詳細（display_name / avatar_url の扱い）

### 後回し（Gate 3-4 で）

director-checklist.md の Q24〜Q40（うちサブスク関連を除く約10問）。Gate 3-4 段階で改めて確認する。

---

## 参照

- 元 Q&A：`docs/phase1/gate1-questions/director-checklist.md`
- 各メート質問リスト：`docs/phase1/gate1-questions/{db|be|fe}-plan-mate.md`
- プロジェクト基本情報：`/CLAUDE.md`
