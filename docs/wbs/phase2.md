# Phase 2 WBS — Eラーニング機能の共通基盤構築

## このドキュメントの位置づけ

Phase 1（要件定義・設計）の成果物を元に、Phase 2（共通基盤構築フェーズ）で実装するタスクを WBS 形式で整理したもの。
Phase 2 の team-lead と dev-mate / design-mate / review-mate / unittest-mate がこのタスク一覧から着手する。

**前提**：Phase 1 全 Gate 承認済（2026-05-12）・3層整合性チェック完全クリア。

---

## 進捗ステータス（最終更新：2026-05-13 ★ Sub 5b フォーム系 完了・Sub 5c 表示系 atoms 着手）

セッションが切れても全体進捗を把握できるよう、各タスクのステータスをここで一元管理する。
詳細な要件・出力物は後続セクションの各 Step テーブルを参照。

**ステータス凡例**：📋 未着手 / 🔧 対応中 / ⏸ 保留 / ✅ 完了

### Step 別サマリ

| Step | 内容 | 完了 / 全体 | 状態 |
|------|------|-----------|------|
| 1 | DB マイグレーション | 9 / 9 | ✅ 完了（本番適用済 2026-05-13） |
| 2 | 認証基盤の整理 | 6 / 6 | ✅ 完了（P2-AUTH-01〜06 全完了・M5 安全順序完走・46コミット） |
| 3 | Stripe 連携基盤拡張 | 0 / 3 | 📋 未着手 |
| 4 | デザイントークン | 4 / 4 | ✅ 完了（既存 tailwind.config.ts + globals.css が docs と完全整合済・追加実装不要） |
| 5 | atoms 実装 | 2 / 4 | 🔧 対応中（P2-A-01・02 ✅ / 03 着手中 / 04 未着手） |
| 6 | molecules / organisms / templates | 0 / 4 | 📋 未着手 |
| 7 | レイアウト基盤 | 0 / 3 | 📋 未着手 |
| 8 | ユニットテスト基盤 | 0 / 5 | 📋 未着手（※認証基盤テストは Sub 2a で部分実施・78件） |
| **計** | | **10 / 38** | 🔧 進行中 |

### タスク別ステータス

| ID | タスク | ステータス | コミット / 備考 |
|----|--------|-----------|---------------|
| P2-DB-01 | 新規テーブル作成（courses 系3テーブル + RLS） | ✅ 完了 | 20260512100001 |
| P2-DB-02 | 既存テーブル拡張（has_full_access / deleted_at 等） | ✅ 完了 | 20260512100002 |
| P2-DB-03 | bookmarks.user_id FK 統一 + remap | ✅ 完了 | 20260512100005（FB-SYS-001 順序修正後） |
| P2-DB-04 | UNIQUE / CHECK / 部分UNIQUE | ✅ 完了 | 20260512100002〜100006 内で各テーブル分実装 |
| P2-DB-05 | RLS ポリシー定義 | ✅ 完了 | 各マイグファイル内で実装・5テーブル不適切ポリシー削除は 20260513002000 |
| P2-DB-06 | インデックス定義 | ✅ 完了 | 各マイグファイル内 |
| P2-DB-07 | 既存6件購入レコード legacy 退避 | ✅ 完了 | 20260512100003 Tx-2 |
| P2-DB-08 | 既存6名に has_full_access=true 付与 | ✅ 完了 | 20260512100003 Tx-2 内 |
| P2-DB-09 | DB マイグレーション本番適用 | ✅ 完了 | 2026-05-13 適用完了 |
| **Step 1 計** | | **9 / 9 ✅** | |
| P2-AUTH-01 | middleware 拡張（/e-learning 配下ガード + 管理者判定 + RLS 修正） | ✅ 完了 | Sub 2a〜2a-3 + security 再チェック追加修正：fc961af / 58c8a2b / 01a85bc / fc0323d / c083365 / 12460c4 / 23db10a / de77d44 / c0e23c0 / 2db0cfc（計10コミット・81件テストパス・RLS 5テーブル本番適用済） |
| P2-AUTH-02 | OAuth コールバック整理（has_paid_access → has_full_access 統合） | ✅ 完了 | Sub 2b + 2b-2 計8コミット（047b15c / 6068cc1 / 3fabdf1 / d162a4e / c5c3bed / af8e88e / 26dabcc / 242c170）・91件テストパス |
| P2-AUTH-03 | 退会機能（POST /api/me/withdraw + user-service.withdraw） | ✅ 完了 | Sub 2c + 2c-2 計6コミット・100件テストパス |
| P2-AUTH-04 | 再登録時 deleted_at 解除（syncFromAuth） | ✅ 完了 | Sub 2b 内で syncFromAuth 再活性化ロジック実装済（6068cc1 / user-service.test.ts 再活性化テスト合格） |
| P2-AUTH-05 | アプリコード切替（access-service 新規 + has_paid_access → has_full_access 置換） | ✅ 完了 | Sub 2d + 2e 計10コミット・実コード参照ゼロ・123件テストパス |
| P2-AUTH-06 | has_paid_access カラム削除 | ✅ 完了 | Sub 2f 計3コミット（2738e4c / a2ae26b / 08dce08）・本番カラム削除完了・M5 完走 |
| **Step 2 計** | | **6 / 6 ✅** | |
| P2-ST-01 | Stripe Price ID 動的管理 | 📋 未着手 | |
| P2-ST-02 | charge.refunded Webhook 追加 | 📋 未着手 | |
| P2-ST-03 | Webhook 冪等性テスト | 📋 未着手 | |
| **Step 3 計** | | **0 / 3 📋** | |
| P2-DS-01 | カラートークン実装 | ✅ 完了 | 既存 tailwind.config.ts + globals.css に `:root` HSL 変数 23 件 + portfolio.* ブランド色 6 件が定義済・colors.md と完全整合 |
| P2-DS-02 | タイポグラフィトークン実装 | ✅ 完了 | fontFamily.sans / handwriting + body/h1〜h6/button/label/strong の weight ルールが既存 globals.css に定義済・typography.md と完全整合 |
| P2-DS-03 | スペーシングトークン実装 | ✅ 完了 | docs §spacing で「Tailwind 既定 4px ベース採用・独自拡張なし」明記・追加実装不要 |
| P2-DS-04 | レイアウトトークン実装 | ✅ 完了 | screens 11件（xs/sm/md/mid/lg/xl/wide/textwide/2xl/max-mid/max-xl）+ container + gridTemplateColumns 既存定義済・breakpoints.md / grid.md と完全整合 |
| **Step 4 計** | | **4 / 4 ✅** | （Phase 1 docs が「既存実装からの抽出」として作成されたため・INDEX.md §概要参照） |
| P2-A-01 | Button atoms | ✅ 完了 | Sub 5a 計2コミット（ad4d4ae / 2ba369e）・design ✅・review LGTM |
| P2-A-02 | Input / Textarea / Label / Checkbox / Radio / Switch | ✅ 完了 | Sub 5b 計11コミット・design ✅・review LGTM・Radix 4依存追加 |
| P2-A-03 | Icon / Badge / Tag / Avatar / Spinner | 🔧 対応中 | Sub 5c 表示系5コンポーネント |
| P2-A-04 | Price / ProgressBar / ProgressCheckIcon / LockIcon / FreeBadge / LinkButton | 📋 未着手 | Sub 5d |
| **Step 5 計** | | **1 / 4 🔧** | |
| P2-M-01 / P2-O-01〜02 / P2-T-01 | molecules 14 / organisms / templates 11 | 📋 未着手 | |
| **Step 6 計** | | **0 / 4 📋** | |
| P2-L-01〜03 | レイアウト基盤（Header / AdminLayout / エラー） | 📋 未着手 | |
| **Step 7 計** | | **0 / 3 📋** | |
| P2-UT-01〜05 | ユニットテスト基盤 | 📋 未着手 | ※ Sub 2a で middleware 78件 + admin-guard 16件 + callback 7件 + login 2件 = 計103件追加済（タスク自体は未完了マーク） |
| **Step 8 計** | | **0 / 5 📋** | |

### Sub タスク（Step 2 で発生した詳細）

P2-AUTH-01 は当初想定より範囲が広く、複数の Sub に分割して進めた：

| Sub | 内容 | 状態 |
|-----|------|------|
| 2a | middleware 拡張（/auth/login 統一・/e-learning ガード） | ✅ 完了（fc961af / 58c8a2b / 01a85bc） |
| 2a-2 | security-mate [重要]3件対応（/api/admin/* ガード・Open Redirect・returnTo 橋渡し） | ✅ 完了（fc0323d）※Sub 2a-3 に内包 |
| 2a-3 | A案 ADMIN_EMAIL 照合 + RLS 5テーブル削除（緊急対処） | ✅ 完了（c083365 / 12460c4 / 23db10a / de77d44 / c0e23c0 / 2db0cfc） |
| 2b | user-service 新規 + OAuth callback リファクタ + has_paid_access → has_full_access 統合 | ✅ 完了（6コミット：047b15c / 6068cc1 / 3fabdf1 / d162a4e / c5c3bed / af8e88e） |
| 2b-2 | user-service ログ構造化・監査ログ追加（security 再チェック軽微対応） | ✅ 完了（2コミット：26dabcc / 242c170） |
| 2c | 退会機能（POST /api/me/withdraw + user-service.withdraw + L1 マスキング） | ✅ 完了（5コミット：7f0d518 / 7594b19 / bae6b10 / b451be3 / 8a9a5a2） |
| 2c-2 | errors.md 形式統一 + signOut 失敗時のログ追加 | ✅ 完了（1コミット：b2010ae） |
| 2d | access-service 新規 + e-learning 配下の視聴判定置換 | ✅ 完了（5コミット：9b93429 / ecb647f / c26a12e / 8b60adc / 13648d4・bookmarks 取得バグも同時修正） |
| 2e | 他7ファイルの has_paid_access → has_full_access 置換 | ✅ 完了（5コミット：7b32038 / 5e97de3 / 7a256b5 / 13aee10 / c7d8796） |
| 2f | has_paid_access カラム削除（A案：3名先付与 → DROP COLUMN） | ✅ 完了（3コミット：2738e4c / a2ae26b / 08dce08・本番適用済） |
| 2d | access-service 新規 + 視聴可否判定の集約 | 📋 未着手 |
| 2e | has_paid_access → has_full_access 置換（10ファイル・約35箇所） | 📋 未着手 |
| 2f | has_paid_access カラム削除（M5 最終 Step） | 📋 未着手 |

### Phase 2 進行中の主要 FB / Lessons Learned

| 番号 | 概要 | 状態 |
|------|------|------|
| FB-SYS-001 | ファイル⑤ DROP/UPDATE/ADD 順序問題（FK 違反） | ✅ 対応済（b18c234） |
| Lessons | security-mate プロンプト定義のサブエージェント起動手順不備 | ✅ 対応済（~/.claude/team-prompts/security-mate.md 修正） |
| 後続課題1 | ESLint disabled（`npm run lint` が echo） | 📋 未着手（Phase 2 後半 or Phase 3 移行前） |
| 後続課題2 | tsconfig strict 化（type predicate 不要化） | 📋 未着手 |
| 後続課題3 | Phase 1 設計 `docs/auth/flow.md §D` の管理者判定前提崩れの修正 | 📋 未着手（plan-lead オンデマンド起動候補） |
| 後続課題4 | `/api/youtube-videos/import` と `sync` への認可ガード追加 | 📋 未着手（Sub 2a-3 範囲外で検出） |
| 後続課題5 | admin UI コンポーネント（CustomersClient.tsx 等）の console.error PII 漏洩 | 📋 未着手 |
| 後続課題6 | columns/[id] の dangerouslySetInnerHTML サニタイズ | 📋 未着手（管理者投稿の XSS 対策） |
| 後続課題7 | redirect_to 正規表現にバックスラッシュ排除追加 | 📋 未着手（軽微） |

---

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
