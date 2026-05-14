# Phase 2 → Phase 3 引き継ぎチェックリスト

## このドキュメントの目的

Phase 2（共通基盤構築フェーズ）で構築した共通基盤の **状態整理** と、Phase 3（機能実装フェーズ）で着手する際の **前提知識** を整理する。
team-lead が Phase 2 → Phase 3 へ移行する際にこのファイルを更新し、Phase 3 開始時に必ず読み返す。

**作成日**：2026-05-14
**作成者**：team-lead（Phase 2 完走時）
**Phase 2 期間**：2026-05-12 → 2026-05-14（3日間・累計 150コミット超）

---

## Phase 2 完了状態

### DB マイグレーション（Step 1 + Step 2 派生 + Step 3 派生）

Phase 2 で本番 Supabase に適用した 9 件のマイグレーション：

| 連番 | ファイル名 | 内容 |
|------|-----------|------|
| 20260512100001 | create_e_learning_courses_chapters_videos | 新規 3 テーブル（courses / chapters / course_videos）+ RLS |
| 20260512100002 | alter_existing_tables_for_phase1 | has_full_access / deleted_at / stripe_price_id UNIQUE / materials.course_id 等 |
| 20260512100003 | create_legacy_purchases_and_migrate | legacy_purchases 新規 + 既存6件退避（Tx-2） |
| 20260512100004 | redesign_e_learning_purchases | course_id 追加 / status CHECK / 部分 UNIQUE / FK CASCADE→RESTRICT |
| 20260512100005 | redesign_e_learning_bookmarks | user_id remap（auth.users.id → e_learning_users.id）+ RLS 書き換え（FB-SYS-001 順序修正後） |
| 20260512100006 | create_e_learning_progress | progress 新規テーブル + RLS |
| 20260513002000 | fix_rls_admin_only_writes | 5テーブル authenticated 書き込み権限剥奪（Sub 2a-3） |
| 20260513090152 | grant_full_access_to_paid_only_users | 手動付与組3名に has_full_access=true 付与（M5 整合性確保） |
| 20260513090237 | drop_has_paid_access | has_paid_access カラム削除（M5 最終 Step） |

- [x] 全 9 件本番適用済（2026-05-13）
- [x] Supabase Advisor 検証クリア
- [x] バックアップは Supabase Scheduled backup（直近7日分自動取得）

### 認証基盤（Step 2）

- [x] middleware 拡張：/e-learning 配下のログインガード + ADMIN_EMAIL 照合 + Open Redirect 対策
- [x] admin-guard：多層防御（middleware + layout + 各 API route の requireAdmin）
- [x] user-service：OAuth 同期 + 退会（L1 マスキング）+ 再活性化
- [x] access-service：視聴・資料DL権限の集約点（has_full_access 一本化）
- [x] /auth/login + callback：returnTo 橋渡し + Open Redirect 対策 + OAuth error ハンドリング
- [x] /api/me/withdraw：POST 退会フロー（errors.md 形式準拠）
- [x] RLS：5テーブル authenticated 書き込み権限剥奪済
- [x] **M5 安全順序 5 ステップ完走**（has_paid_access カラム完全廃止）
- [x] auth/flow.md と実装の整合：✅
- [x] security-mate チェック完了（@security-authaudit + @security-inputguard + @security-dataguard 3 サイクル）

### Stripe 連携基盤（Step 3）

- [x] checkout-service 新規（DB 紐付け Price ID）
- [x] POST /api/checkout エンドポイント新規（既存 /api/stripe/checkout は非破壊）
- [x] charge.refunded Webhook ハンドラ追加（status='refunded' + refunded_at 更新）
- [x] errors.md rule G 完全準拠（Slack エラー通知 + event.id / event.type / errorMessage 必須）
- [x] 冪等性：DB UNIQUE + ハンドラ 5 段階チェック + テスト 23 件
- [x] security-mate チェック完了（[重要]3件解消・customer_email は Kosuke A 案承認で維持）

### デザインシステム（Step 4 + Step 5 + Step 6 + Step 7）

- [x] tokens（colors / typography / spacing / radius / shadows / breakpoints / grid）：既存実装と完全整合（追加実装ゼロ）
- [x] atoms 18 個（Button / Input / Textarea / Label / Checkbox / Radio / Switch / Icon / Badge / Tag / Avatar / Spinner / Price / ProgressBar / ProgressCheckIcon / LockIcon / FreeBadge / LinkButton）
- [x] molecules 15 個（FormField / FormSection / SearchField / Select / DatePicker / Pagination / Tabs / Accordion / Breadcrumb / Toast / Dialog / EmptyState / AlertBanner / FilterChipGroup / PriceTag）
- [x] organisms 13 個（基盤 5：AdminPageHeader / AdminDataTable / AdminFilterBar / MediaFilterBar / MediaGrid + LP 用枠 8：HeroSection / ValuePropsSection / CourseShowcase / ContentShowcase / TestimonialSection / StatsSection / FAQAccordion / ContactSection）
- [x] templates 10 個（LPTemplate / MediaListTemplate / CourseDetailTemplate / VideoPlayerTemplate / AuthTemplate / MyPageTemplate / InfoPageTemplate / AdminListTemplate / AdminFormTemplate / ErrorTemplate）
- [x] レイアウト基盤（会員側 app/(elearning)/layout.tsx + 管理側 既存活用 + エラー/ローディング 6 ファイル）
- [x] ng-patterns §12 補足遵守（既存 ui/ / LP は完全非破壊）
- [x] Radix UI 依存 7 件追加（checkbox / radio-group / switch / label / avatar / select / popover / dialog / tabs / accordion）+ sonner / react-day-picker

### ユニットテスト基盤（Step 8）

- [x] vitest セットアップ（jsdom + @testing-library 系）
- [x] テスト累計：**185 件全パス**
  - middleware 認証ガード：48 件
  - admin-guard：16 件
  - callback：7 件
  - GoogleLoginButton：2 件
  - user-service：18 件（syncFromAuth / withdraw）
  - access-service：23 件（視聴・資料DL権限）
  - checkout-service：20 件（Stripe Session 作成）
  - stripe-webhook（charge.refunded）：23 件
  - withdraw route：4 件
  - Button atom サンプル：13 件
  - FormField molecule サンプル：6 件
  - その他：5 件
- [x] テストランナー設定：完了

### CI/CD

- [x] sast.yml 設置：✅（Phase 2 開始前から）
- [x] dast.yml 設置：✅（STG_URL 設定済みなら稼働中）
- [x] incident-response.md 設置：✅

---

## Phase 3 で実装する範囲

`docs/wbs/phase3.md`（**未作成・Phase 3 着手前に作成必要**）に基づき、以下を実装する。
Phase 1 の handoff 文書および screens.md / endpoints.md から逆算した範囲：

### 業務ロジックの実装
- access-service：視聴可否・資料DL可否の **判定実体**（現状はインターフェイスのみ）
- checkout-service：Stripe Session 作成の業務ロジック完成
- stripe-webhook-service：checkout.session.completed リファクタ（has_full_access の Webhook 切り替えを stripe-webhook-service.md §NG 通りに修正）

### 個別画面の組み立て

#### LP（B001）
- HeroSection / ValuePropsSection / CourseShowcase / ContentShowcase / TestimonialSection / StatsSection / FAQAccordion / ContactSection に **実コンテンツを埋める**
- LP 用素材（受講生の声・実績数値）の確定・配置

#### 会員向け画面
- B002 メディア一覧（コース一覧）
- B003 メディア一覧（単体動画一覧）
- B004 コース詳細
- B005 コース内動画視聴
- B006 メディア一覧（フィルタ状態）
- B007 単体動画詳細・視聴
- B008 購入導線（PurchasePromptModal 改修・コース対応）
- B009 購入完了（CheckoutCompleteCard + CheckoutPollingStatus）
- B010 購入キャンセル
- B011 マイページ（購入履歴）
- B012 マイページ（ブックマーク）
- B013 マイページ（視聴履歴）
- B014 マイページ（アカウント設定）

#### 管理画面
- C001-C011 各種管理画面（コース／単体動画／カテゴリ／購入履歴／ユーザー／レガシー）

### E2E テスト
- e2etest-mate による業務フロー一気通貫テスト

### Phase 2 申し送り 16 件（F-01〜F-16）

WBS phase2.md の「Phase 3 申し送り事項」セクション参照。

---

## Phase 3 着手前の必読ドキュメント

| # | ファイル | 内容 |
|---|---------|------|
| 1 | `docs/handoff/phase1-to-phase2.md` | Phase 1 設計の経緯（業務分析・概念モデル・論理設計） |
| 2 | `docs/handoff/phase2-to-phase3.md`（本ファイル） | Phase 2 完了状態（必読・最初に読む） |
| 3 | `docs/wbs/phase2.md` | Phase 2 進捗（参考） |
| 4 | `docs/wbs/phase3.md` | Phase 3 タスク一覧（**未作成・Phase 3 着手前に作成**） |
| 5 | `docs/backend/database/schema.dbml` | 現在のDB状態（has_paid_access 削除済） |
| 6 | `docs/backend/database/schema-rationale.md` | カラム設計の根拠 |
| 7 | `docs/api/endpoints.md` | 実装対象 API（/api/checkout 新規含む） |
| 8 | `docs/error-handling/errors.md` | エラーコード（CheckoutError / DB_ERROR 追加済） |
| 9 | `docs/auth/flow.md` | 認証フロー（§A〜I・retainTo / OAuth 仕様） |
| 10 | `docs/backend/logic/services/` | サービス層 docs（access-service / user-service / auxiliary-services / checkout-service / stripe-webhook-service / bookmark-service 等） |
| 11 | `docs/frontend/screens.md` | 29 画面の遷移・要件 |
| 12 | `docs/frontend/component-candidates.md` | 利用可能コンポーネント（74 個・実装済 56 個） |
| 13 | `docs/frontend/page-templates.md` | 10 templates 仕様 |
| 14 | `docs/frontend/design-system/INDEX.md` | デザインシステム全体方針 |
| 15 | `docs/frontend/design-system/ng-patterns.md` | NG パターン（特に §12 line 104 直下の補足必読） |
| 16 | `docs/feedback/` | 既存フィードバック（FB-SYS-001 解消済・累計1件） |

---

## Phase 2 で発生した課題・教訓

### 解決済み（Phase 2 内対処）

#### 本番運用への影響を未然回避
- 認証済み一般ユーザーが /admin に通過できる脆弱性（Sub 2a-3 で塞いだ）
- /api/admin/* 認証チェック抜け（Sub 2a-3 で多層防御）
- 5テーブル RLS の authenticated 書き込み権限（Sub 2a-3 で削除）
- admin/layout の console.log で管理者メール PII を露出（Sub 2a で削除）
- bookmarks 取得が auth.users.id 直接参照で空配列になっていた（Sub 7a-2 で修正）
- updateLastAccessedAt の Phase 1 非呼出ルール違反 3 ファイル（Sub 7a-2 で削除）

#### マイグレーション関連
- FB-SYS-001：ファイル⑤ DROP/UPDATE/ADD 順序問題（FK 違反）→ b18c234 で修正

#### チーム運用
- security-mate プロンプト定義のサブエージェント起動手順不備 → ~/.claude/team-prompts/security-mate.md 修正
- dev-mate の「自分宛リマインド」idle ループ問題 → 自動進行モードに変更
- ng-patterns §12 line 104 直下の補足の周知不足 → design-mate に注意喚起

### Phase 3 持ち越し（後続課題）

#### Phase 3 着手と併せて対応する申し送り（16 件）

WBS phase2.md「Phase 3 申し送り事項（F-01〜F-16）」参照：

- F-01: FormField の errorId / helpId children 自動連携
- F-02: Breadcrumb：中間 href なし時の aria-current 矛盾
- F-03: StatsSection：stats.length===1 時の colsClass[1] 未定義漏れ
- F-04: hasPurchased prop 名統一
- F-05: AdminSidebar への e-learning サブナビ追加
- F-06: /api/checkout route.ts の単体テスト追加
- F-07: DB エラー経路のユニットテスト追加
- F-08: 既存 checkout.session.completed ハンドラのテスト追加
- F-09: Webhook 並行性の実機テスト
- F-10: 全 atoms / molecules の網羅テスト追加
- F-11: stripe_payment_intent_id UNIQUE 制約追加
- F-12: checkout.session.completed に stripe_payment_intent_id 書き込み追加
- F-13: has_full_access の Webhook 切り替え（stripe-webhook-service.md §NG 違反）
- F-14: 既存購入完了 Slack 通知の PII 削除
- F-15: Textarea min-h arbitrary value
- F-16: Badge / Price free / FreeBadge のカスタムトークン化

#### Phase 3 移行前 or Phase 3 中に検討（後続課題）

- ESLint disabled（`npm run lint` が echo）→ Phase 3 移行前タスク化
- tsconfig strict 化（type predicate 不要化）
- Phase 1 設計 `docs/auth/flow.md §D` の管理者判定前提崩れの修正（plan-lead オンデマンド候補）
- `/api/youtube-videos/import` と `sync` への認可ガード追加
- admin UI コンポーネント（CustomersClient.tsx 等）の console.error PII 漏洩
- columns/[id] の dangerouslySetInnerHTML サニタイズ

#### git / 機密情報関連

- Supabase access-token Rotation（過去コミットに旧トークンが残存・git filter-repo + force push の B 案検討）
- ローカル / origin の divergence（main は origin/main から 156 コミット先行）→ rebase + push or 現状維持の判断

#### プラポリ・利用規約

- 退会後の email 保持期間明記（GDPR / 個人情報保護法対応）
- Stripe customer_email 送信について明記

### Phase 1 へのフィードバック

特になし。Phase 1 設計は精緻で、docs 通り進めて成功した。
- ng-patterns §12 line 104 直下の補足が Phase 1 完了時に既に含まれていたことが分かった（Sub 5a で発見）
- design-direction.md / tokens の既存実装からの抽出方針が正解だった（Sub 4a で実装作業ゼロで完了）

---

## Phase 3 開始時のセットアップ作業

team-lead が Phase 3 着手前に確認・実行：

- [ ] **docs/wbs/phase3.md の作成**（最重要・必読タスク化済）
  - Phase 1 で確定した「Phase 3 で実装するもの」を WBS 化
  - 業務ロジック・個別画面組立・E2E テスト・LP 素材確定
  - plan-lead オンデマンド起動 or team-lead 主導で作成
- [ ] `/team-phase3` でチーム起動（e2etest-mate 追加）
- [ ] docs/e2e-scenarios/ がない場合、e2etest-mate にテンプレからセットアップ依頼
- [ ] docs/feedback/ の状態確認（Phase 2 中のFBが整理されているか）
- [ ] dev-mate に最初のタスクをアサイン（モード判定して指示）

---

## チーム編成（Phase 3）

Phase 3 で起動するメート（`/team-phase3`）：
- **team-lead**（リード）
- **dev-mate**（実装・コミット）
- **design-mate**（デザインシステム実装・新規コンポーネント追加判断）
- **review-mate**（lint/型/ビルド/コードレビュー + DB レビュー観点）
- **unittest-mate**（ユニットテスト）
- **e2etest-mate**（E2E テスト）★ Phase 3 で追加
- **security-mate**（オンデマンド・auth/API/DB変更時に起動）

### Phase 2 で確立した運用ルール（Phase 3 でも継続）

- **自動進行モード**（Kosuke 承認 2026-05-14）：各 Sub の判断仰ぎを省略し team-lead 判断で自動進行
- **5段階ステータス**：📋 未着手 / 🔧 対応中 / ⏸ 保留 / ✅ 完了 / ➖ 対応不要
- **security-mate**：team-lead 直接 spawn（@security-authaudit + @security-inputguard + @security-dataguard）
- **本番運用ページ非破壊**：既存 ui/ / 既存 LP / 既存 admin 画面は touch しない

---

## このドキュメント自体のレビュー

- [x] team-lead 自己チェック完了（2026-05-14）
- [ ] ディレクター 承認：YYYY-MM-DD（Phase 3 着手判断時に追記）
