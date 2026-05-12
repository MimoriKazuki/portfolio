# Phase 2 WBS — Eラーニング機能の共通基盤構築

## このドキュメントの位置づけ

Phase 1（要件定義・設計）の成果物を元に、Phase 2（共通基盤構築フェーズ）で実装するタスクを WBS 形式で整理したもの。
Phase 2 の team-lead と dev-mate / design-mate / review-mate / unittest-mate がこのタスク一覧から着手する。

**前提**：Phase 1 全 Gate 承認済（2026-05-12）・3層整合性チェック完全クリア。

---

## Phase 2 のスコープ

### ✅ Phase 2 で実装するもの

1. **DB マイグレーション**（Phase 1 で確定した schema.dbml に基づく新規テーブル・カラム追加・移行スクリプト）
2. **共通基盤**
   - 認証基盤の整理（既存 Supabase Auth + Google OAuth ベースに has_full_access フラグ運用を追加）
   - Stripe 連携基盤の整理（新たな Price ID 構造・Webhook ハンドラー拡張）
   - Server Action 共通基盤・エラー翻訳ミドルウェア
3. **デザインシステム実装**
   - tokens（colors / typography / spacing）
   - atoms 18コンポーネント
   - molecules 14コンポーネント
   - organisms の基盤的なもの（DataTable / FormSection / Card 等）
   - templates 11種類のページ骨格
4. **共通レイアウト**
   - LP テンプレート（B001 用）
   - 会員ページテンプレート（MediaList / MyPage / VideoPlayer 等）
   - 管理画面テンプレート（AdminList / AdminForm）
5. **ユニットテスト基盤**

### ❌ Phase 2 では実装しないもの（Phase 3 へ）

- 個別画面の組み立て（LP の各セクション・コース詳細・視聴画面 等）
- 業務ロジックの実装（access-service の権限判定実体・checkout-service の Stripe 呼び出し実体 等）
- E2E テスト
- LP 用素材（受講生の声・実績数値）の確定・配置

---

## 着手順序の方針

```
[Step 1] DB マイグレーション（最優先・他の全てがこれに依存）
   ↓
[Step 2] 認証基盤の整理（has_full_access 追加・has_paid_access 段階廃止）
   ↓
[Step 3] Stripe 連携基盤拡張（Price ID 構造・Webhook イベント拡張）
   ↓
[Step 4] デザイントークン実装（colors / typography / spacing）
   ↓
[Step 5] atoms / molecules 実装（並列可）
   ↓
[Step 6] organisms / templates 実装（並列可）
   ↓
[Step 7] レイアウト基盤実装
   ↓
[Step 8] ユニットテスト整備（並行）
```

---

## タスク一覧

### Step 1：DB マイグレーション

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-DB-01 | 新規テーブル作成マイグレーション | dev-mate | schema.dbml | `supabase/migrations/{YYYYMMDDHHMMSS}_create_phase2_tables.sql` | courses / course_chapters / course_videos / progress / legacy_purchases |
| P2-DB-02 | 既存テーブルカラム追加マイグレーション | dev-mate | schema.dbml + schema-rationale.md | `{YYYYMMDDHHMMSS}_alter_existing_tables.sql` | users.has_full_access / categories.deleted_at / course_videos.view_count / materials.course_id / purchases.stripe_payment_intent_id / purchases.refunded_at |
| P2-DB-03 | bookmarks.user_id FK 統一マイグレーション | dev-mate | schema.dbml + M4 確定事項 | `{YYYYMMDDHHMMSS}_fix_bookmarks_fk.sql` | auth.users.id 参照 → e_learning_users.id 参照に統一（既存3件のデータ移行含む） |
| P2-DB-04 | UNIQUE 制約・CHECK 制約・部分 UNIQUE 追加 | dev-mate | schema.dbml | `{YYYYMMDDHHMMSS}_add_constraints.sql` | 排他参照 CHECK / DEFERRABLE 部分 UNIQUE 等 |
| P2-DB-05 | RLS ポリシー定義 | dev-mate | logical-design.md + schema.dbml | `{YYYYMMDDHHMMSS}_rls_policies.sql` | テーブル別 SELECT/INSERT/UPDATE/DELETE ポリシー |
| P2-DB-06 | インデックス定義 | dev-mate | schema-rationale.md「インデックス戦略」 | `{YYYYMMDDHHMMSS}_indexes.sql` | FK インデックス・部分 UNIQUE・検索パターン |
| P2-DB-07 | 既存6件購入レコード legacy 退避（L3） | dev-mate | schema.dbml + L3 確定事項 | 移行スクリプト + schema-changes 記録 | `e_learning_purchases` → `e_learning_legacy_purchases` への退避 |
| P2-DB-08 | 既存6名に has_full_access=true 一括付与（M5 安全順序 Step2） | dev-mate | M5 確定事項 | 移行スクリプト | M5 段階移行の Step2 |
| P2-DB-09 | DB マイグレーション本番適用 | dev-mate | バックアップ + 上記スクリプト全件 | 本番反映 | **必ず Kosuke 承認後・バックアップ取得後に実施** |

### Step 2：認証基盤の整理

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-AUTH-01 | middleware 拡張（/e-learning 配下のログインガード追加） | dev-mate | auth/flow.md §C | `middleware.ts` 修正 | 観点4-A 確定事項：/e-learning/courses も認証必須 |
| P2-AUTH-02 | OAuth コールバックでの e_learning_users 作成ロジック整理（has_paid_access 排除・has_full_access 統合移行） | dev-mate | auth/flow.md §B + M5 段階移行 | `/app/auth/callback/route.ts` 修正 | M5 段階移行 Step3 |
| P2-AUTH-03 | 退会機能の実装（withdraw API + サービス） | dev-mate | auxiliary-services.md + L1 確定事項 | API + service 実装 | L1：deleted_at + display_name/avatar_url マスキング |
| P2-AUTH-04 | 再登録時の deleted_at 解除ロジック（user-service.syncFromAuth） | dev-mate | auxiliary-services.md L1 | service 実装 | L1：同一メールで再登録時に履歴引継ぎ |
| P2-AUTH-05 | アプリコード切替（has_full_access 参照へ）| dev-mate | M5 段階移行 Step3 | 既存コード修正 | has_paid_access 参照箇所を has_full_access に置換 |
| P2-AUTH-06 | has_paid_access カラム削除（M5 段階移行 Step5） | dev-mate | M5 確定事項 | 最終マイグレーション | **アプリ切替・動作検証完了後に実施** |

### Step 3：Stripe 連携基盤拡張

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-ST-01 | Stripe Price ID 動的管理への変更（固定 ENV から DB 紐付けへ） | dev-mate | checkout-service.md | `/app/lib/stripe/client.ts` + `/app/api/stripe/checkout/route.ts` 修正 | コース・単体動画ごとに stripe_price_id を持つ |
| P2-ST-02 | Stripe Webhook イベント拡張（charge.refunded 追加） | dev-mate | stripe-webhook-service.md | `/app/api/stripe/webhook/route.ts` 修正 | 既存 checkout.session.completed + charge.refunded |
| P2-ST-03 | Webhook 冪等性管理（stripe_session_id UNIQUE）の動作確認 | dev-mate + unittest-mate | stripe-webhook-service.md | ユニットテスト | event.id 重複排除確認 |

### Step 4：デザイントークン実装

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-DS-01 | カラートークン実装 | design-mate | design-system/tokens/colors.md | `tailwind.config.ts` 拡張 | 既存トークン継承・新規追加分のみ |
| P2-DS-02 | タイポグラフィトークン実装 | design-mate | tokens/typography.md | `tailwind.config.ts` + globals.css | 既存フォント設定継承 |
| P2-DS-03 | スペーシングトークン実装 | design-mate | tokens/spacing.md | `tailwind.config.ts` 拡張 | 4px ベース統一 |
| P2-DS-04 | レイアウトトークン実装（grid / breakpoints） | design-mate | layout/grid.md + layout/breakpoints.md | `tailwind.config.ts` 拡張 | レスポンシブ前提 |

### Step 5：atoms 実装（18コンポーネント）

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-A-01 | Button atoms | design-mate | component-candidates.md | `app/components/atoms/Button.tsx` | primary/secondary/danger/ghost バリエーション |
| P2-A-02 | Input / Textarea / Label / Checkbox / Radio / Switch | design-mate | 同上 | atoms/ | フォーム系基本 |
| P2-A-03 | Icon / Badge / Tag / Avatar / Spinner | design-mate | 同上 | atoms/ | 表示系基本 |
| P2-A-04 | Price / ProgressBar / ProgressCheckIcon / LockIcon / FreeBadge / LinkButton | design-mate | 同上 | atoms/ | 業務固有 atoms |

### Step 6：molecules / organisms / templates 実装

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-M-01 | molecules 14個実装 | design-mate | component-candidates.md | `app/components/molecules/` | FormField / SearchField / DatePicker / Pagination / Tabs / Accordion / Toast / Dialog / Breadcrumb / EmptyState / AlertBanner / FilterChipGroup / PriceTag / FormSection |
| P2-O-01 | 基盤 organisms 実装（共通利用） | design-mate | component-candidates.md | `app/components/organisms/` | AdminDataTable / AdminFilterBar / MediaFilterBar / MediaGrid / CourseCard / VideoPlayer 等 |
| P2-O-02 | LP 用 organisms 実装 | design-mate | screens.md B001 + N9 確定 | `app/components/organisms/landing/` | HeroSection / ValueSection / CoursesSection 等の枠（中身は Phase 3） |
| P2-T-01 | templates 11種類実装 | design-mate | page-templates.md | `app/components/templates/` | LPTemplate / MediaListTemplate / VideoPlayerTemplate / MyPageTemplate / AdminListTemplate 等 |

### Step 7：レイアウト基盤

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-L-01 | 会員側 Header / Footer 整備 | design-mate | screens.md 横断ルール | `app/(elearning)/layout.tsx` | 既存ヘッダーを e-learning ルートで利用 |
| P2-L-02 | 管理側 AdminLayout 整備 | design-mate | screens.md C001-C011 | `app/admin/e-learning/layout.tsx` | 既存 admin レイアウト継承 |
| P2-L-03 | エラー・ローディング・空状態の共通レイアウト | design-mate | screens.md エラー画面 | `app/error.tsx`・`loading.tsx`・`not-found.tsx` | 既存スケルトン流用 |

### Step 8：ユニットテスト基盤

| ID | タスク | 担当 | 入力 | 出力 | 備考 |
|----|--------|------|------|------|------|
| P2-UT-01 | atoms のユニットテスト | unittest-mate | component-candidates.md | `__tests__/atoms/` | 各 atoms のレンダリング・props 動作 |
| P2-UT-02 | molecules のユニットテスト | unittest-mate | 同上 | `__tests__/molecules/` | 同上 |
| P2-UT-03 | 認証ガード middleware のテスト | unittest-mate | auth/flow.md | `__tests__/middleware.test.ts` | 公開・要ログイン・管理者の3パターン |
| P2-UT-04 | withdraw / syncFromAuth のテスト | unittest-mate | auxiliary-services.md | `__tests__/services/user-service.test.ts` | L1 マスキング・再登録引継ぎ |
| P2-UT-05 | Stripe Webhook 冪等性テスト | unittest-mate | stripe-webhook-service.md | `__tests__/api/stripe/webhook.test.ts` | event.id 重複排除 |

---

## 依存関係と並行可能タスク

```
P2-DB-01〜09（Step 1） — 直列実行・他の全てがこれに依存
       ↓
P2-AUTH-01〜06（Step 2） — P2-DB-09 完了後に着手
       ↓
P2-ST-01〜03（Step 3） — P2-AUTH-05 後に着手
       ↓
P2-DS-01〜04（Step 4） — DB と独立して並行可能（実は Step 1-3 と並行 OK）

P2-DS-04 完了 ──┐
                ├─→ P2-A-01〜04 / P2-M-01 / P2-O-01〜02 / P2-T-01（Step 5-6）— 並列実行可
P2-AUTH-06 完了 ┘

P2-O / P2-T → P2-L-01〜03（Step 7）

全 Step と並行 → P2-UT-01〜05（Step 8）
```

---

## マイルストーン

| マイルストーン | 達成条件 | 期待効果 |
|--------------|---------|---------|
| **M2-1** DB 移行完了 | P2-DB-01〜09 全完了・本番反映済 | Phase 3 業務実装の前提が整う |
| **M2-2** 認証基盤統合 | P2-AUTH-01〜06 全完了 | has_full_access 統一・退会機能稼働 |
| **M2-3** Stripe 拡張完了 | P2-ST-01〜03 全完了 | 動的 Price ID・refund Webhook 稼働 |
| **M2-4** デザインシステム稼働 | P2-DS-01〜04・P2-A・P2-M・P2-O・P2-T 全完了 | Phase 3 画面組み立てが可能 |
| **M2-5** Phase 2 完了 | M2-1〜M2-4 + UT基盤 | Phase 3 着手準備完了 |

---

## Phase 2 で守るべき重要ルール（Phase 1 確定事項より）

### DB 変更時のルール

- dev-mate が直接 schema.dbml を変更してはいけない
- 設計変更が必要な場合は team-lead → plan-lead オンデマンド起動
- 軽微なカラム追加程度なら team-lead 内判断可（要 Kosuke 確認）
- 全 DB 変更は `docs/backend/database/schema-changes/{連番}-{table}.md` に記録（+ 社内ナレッジ `~/.claude/lessons-learned/db-design/portfolio-{連番}-{table}.md`）

### Stripe 関連の本番反映ルール

- Price ID の作成は Stripe Dashboard で実施（dev-mate がコードから操作しない）
- Webhook シークレットの設定は Kosuke が Vercel 環境変数で管理
- Test mode と Production mode の混在禁止

### 視聴権限ロジックの集約

- access-service.md が唯一の権限判定ポイント
- middleware・コンポーネント・API ハンドラーから直接判定ロジックを書かない
- 全て access-service 経由で判定

---

## 関連ファイル

- 業務分析：`docs/backend/database/business-analysis.md`
- 概念モデル：`docs/backend/database/conceptual-model.md`
- 論理設計：`docs/backend/database/logical-design.md`
- 物理設計：`docs/backend/database/schema.dbml` + `schema-rationale.md`
- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- API 設計：`docs/api/endpoints.md`
- 認証フロー：`docs/auth/flow.md`
- エラーコード：`docs/error-handling/errors.md`
- ロジック層：`docs/backend/logic/`
- 画面設計：`docs/frontend/screens.md`
- コンポーネント候補：`docs/frontend/component-candidates.md`
- ページテンプレート：`docs/frontend/page-templates.md`
- デザインシステム：`docs/frontend/design-system/`
- ハンドオフ：`docs/handoff/phase1-to-phase2.md`

---

## このドキュメントの管理

- 作成日：2026-05-12（Phase 1 完了時）
- 作成者：plan-lead（Phase 1 リード）
- Phase 2 着手時：team-lead がこの WBS を起点に進める
- タスク完了状況は Phase 2 進行中に team-lead が更新する
