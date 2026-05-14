# Phase 3 WBS — Eラーニング機能の機能実装

## このドキュメントの位置づけ

Phase 1（要件定義・設計）の成果物と Phase 2（共通基盤構築）の達成物を起点に、Phase 3（機能実装フェーズ）で実装するタスクを WBS 形式で整理したもの。
Phase 3 の team-lead と dev-mate / design-mate / review-mate / unittest-mate / e2etest-mate がこのタスク一覧から着手する。

**前提**：
- Phase 1 全 Gate 承認済（2026-05-12）
- Phase 2 全 38 タスク完走（2026-05-14・150コミット超・テスト 185 件）
- 共通基盤（DB / 認証 / Stripe / atoms 18 / molecules 15 / organisms 13 / templates 10 / レイアウト）整備済

**作成日**：2026-05-14
**作成者**：Phase 2 team-lead（Phase 2 完了時の引き継ぎとして作成）
**作成方針**：本ドキュメントは **スケルトン**。Phase 3 着手後、team-lead が Sub 単位で随時詳細化・進捗更新する。

---

## 進捗ステータス（最終更新：2026-05-14 Phase 3 着手前スケルトン）

**ステータス凡例**：📋 未着手 / 🔧 対応中 / ⏸ 保留 / ✅ 完了 / ➖ 対応不要

### Step 別サマリ（スケルトン段階）

| Step | 内容 | 想定タスク数 | 状態 |
|------|------|------------|------|
| 1 | 業務ロジック実装（access-service / checkout-service / stripe-webhook-service） | 5-8 | ✅ 完了（04/05 完了・03 は ⏸ 保留→P3-CLEANUP-01 として Step 7 統合・2026-05-14） |
| 2 | 会員向け画面実装（LP + 一覧 + 詳細 + 視聴 + 購入 + マイページ） | 14 | 📋 未着手 |
| 3 | 管理画面実装（C001〜C011） | 11 | 📋 未着手 |
| 4 | E2E テスト | 5-10 | 📋 未着手 |
| 5 | LP 用素材確定・配置 | 1-3 | 📋 未着手 |
| 6 | Phase 2 申し送り 16 件（F-01〜F-16） | 16 | 📋 未着手 |
| 7 | 後続課題対応（ESLint / tsconfig / 既存 admin UI 等） | 6 | 📋 未着手 |
| **計** | | **約 60-70** | 🔧 進行中 |

---

## Phase 3 のスコープ

### ✅ Phase 3 で実装するもの

1. **業務ロジックの実装実体**（Phase 2 で枠は作成・Phase 3 で完成）
2. **個別画面の組み立て**（LP の各セクション・コース詳細・視聴画面 等）
3. **E2E テスト**（業務フロー一気通貫）
4. **LP 用素材**（受講生の声・実績数値）の確定・配置
5. **Phase 2 申し送り 16 件**（F-01〜F-16）の対処
6. **後続課題**（ESLint 復活・tsconfig strict 化・既存 admin UI 整理 等）

### ❌ Phase 3 では実装しないもの（Phase 4 以降 or プロジェクトスコープ外）

- 新たな業務要件（Phase 1 で確定したスコープ外）
- インフラ大規模変更（Supabase プラン変更・新サービス導入 等）
- このプロジェクトでは Phase 3 が最終想定（追加 Phase は要相談）

---

## タスク一覧（スケルトン）

### Step 1：業務ロジック実装

| ID | タスク | 担当 | 入力 | 出力 |
|----|--------|------|------|------|
| P3-LOGIC-01 | access-service の判定実体実装（getViewerAccess / canViewCourseVideo / canViewContent 等 5 メソッド） ✅ 完了（2026-05-14・コミット 5d2dd2c + 06b4650・テスト 29 件パス） | dev-mate | access-service.md | `app/lib/services/access-service.ts` 完成 |
| P3-LOGIC-02 | checkout-service の Stripe 呼び出し実体完成 ✅ 完了（2026-05-14・Phase 2 で実装済・dev-mate により仕様乖離なし確認） | dev-mate | checkout-service.md | `app/lib/services/checkout-service.ts`（既存・Phase 2 完了済） |
| P3-LOGIC-03 | stripe-webhook-service：checkout.session.completed リファクタ ⏸ **保留（Kosuke 判断 2026-05-14）** ・既存 Webhook は新導線 UI 完成後に削除（P3-CLEANUP-01 と統合）・現状維持で段階移行 | dev-mate | stripe-webhook-service.md §NG | （現状維持・後続タスクへ統合） |
| P3-LOGIC-04 | bookmark-service 新規実装（list / add / remove） ✅ 完了（2026-05-14・コミット aa4820c・テスト 16 件パス・M4 コース内動画除外） | dev-mate | docs/backend/logic/services/auxiliary-services.md §bookmark-service | `app/lib/services/bookmark-service.ts` |
| P3-LOGIC-05 | progress-service 新規実装（コース内動画の視聴進捗管理） ✅ 完了（2026-05-14・コミット 14d2eda + f98ca66・テスト 20 件パス・access-service 権限ガード一元化） | dev-mate | docs/backend/logic/services/progress-service.md | `app/lib/services/progress-service.ts` |

### Step 2：会員向け画面実装

| ID | タスク | 担当 | 入力 | 出力 |
|----|--------|------|------|------|
| P3-SCR-B001 | B001 LP 実装（HeroSection 等 8 organisms に実コンテンツ）✅ 完了（2026-05-14・コミット dbd04c4 + 43cefda・新パス /e-learning/lp で既存 LP 非破壊・UT 16 件 + e2e SC-SMK-002b 追加・仮素材） | design-mate + dev-mate | screens.md B001 + page-templates.md LPTemplate | `app/e-learning/lp/page.tsx` |
| P3-SCR-B002 | B002 メディア一覧（コース） | design-mate + dev-mate | screens.md B002 + MediaListTemplate | `app/e-learning/courses/page.tsx` |
| P3-SCR-B003 | B003 メディア一覧（単体動画） | design-mate + dev-mate | screens.md B003 | `app/e-learning/page.tsx`（既存改修） |
| P3-SCR-B004 | B004 コース詳細 | design-mate + dev-mate | screens.md B004 + CourseDetailTemplate | `app/e-learning/courses/[slug]/page.tsx` |
| P3-SCR-B005 | B005 コース内動画視聴 | design-mate + dev-mate | screens.md B005 + VideoPlayerTemplate | `app/e-learning/courses/[slug]/play/[videoId]/page.tsx` |
| P3-SCR-B006 | B006 メディア一覧（フィルタ状態） | design-mate + dev-mate | screens.md B006 | （既存改修） |
| P3-SCR-B007 | B007 単体動画詳細・視聴 | design-mate + dev-mate | screens.md B007 + VideoPlayerTemplate | `app/e-learning/[id]/page.tsx`（既存改修） |
| P3-SCR-B008 | B008 購入導線（PurchasePromptModal 改修・コース対応） | design-mate + dev-mate | screens.md B008 | `PurchasePromptModal.tsx`（既存改修） |
| P3-SCR-B009 | B009 購入完了（CheckoutCompleteCard + CheckoutPollingStatus） | design-mate + dev-mate | screens.md B009 + InfoPageTemplate | 新規 organisms 2 件 + page |
| P3-SCR-B010 | B010 購入キャンセル | design-mate + dev-mate | screens.md B010 | page |
| P3-SCR-B011 | B011 マイページ（購入履歴） | design-mate + dev-mate | screens.md B011 + MyPageTemplate + PurchaseHistoryList organism | page |
| P3-SCR-B012 | B012 マイページ（ブックマーク） | design-mate + dev-mate | screens.md B012 + BookmarkList organism | page |
| P3-SCR-B013 | B013 マイページ（視聴履歴） | design-mate + dev-mate | screens.md B013 + ProgressList organism | page |
| P3-SCR-B014 | B014 マイページ（アカウント設定・退会導線） | design-mate + dev-mate | screens.md B014 + auth/flow.md §G | page |

### Step 3：管理画面実装

| ID | タスク | 担当 | 出力 |
|----|--------|------|------|
| P3-ADM-C001 | C001 管理者ダッシュボード（既存 GA4 継続） | design-mate + dev-mate | （既存 admin で対応・新規実装最小） |
| P3-ADM-C002 | C002 コース一覧（管理） | design-mate + dev-mate | `app/admin/e-learning/courses/page.tsx` 等 |
| P3-ADM-C003 | C003 コース新規作成 | design-mate + dev-mate | page |
| P3-ADM-C004 | C004 コース編集 | design-mate + dev-mate | page |
| P3-ADM-C005 | C005 コース削除確認 | design-mate + dev-mate | Dialog |
| P3-ADM-C006 | C006 章＋動画 DnD 編集（CurriculumEditor organism 新規） | design-mate + dev-mate | organism + page |
| P3-ADM-C007 | C007 資料管理（MaterialEditor organism 新規） | design-mate + dev-mate | organism + page |
| P3-ADM-C008 | C008 カリキュラム編集タブ | design-mate + dev-mate | page |
| P3-ADM-C009 | C009 単体動画管理 | design-mate + dev-mate | page |
| P3-ADM-C010 | C010 ユーザー管理（has_full_access 切替）（HasFullAccessSwitch organism） | design-mate + dev-mate | organism + page |
| P3-ADM-C011 | C011 レガシー購入履歴 | design-mate + dev-mate | page |

### Step 4：E2E テスト

| ID | タスク | 担当 | 出力 |
|----|--------|------|------|
| P3-E2E-01 | 主要シナリオ：未ログイン → LP 閲覧 → ログイン → コース一覧 | e2etest-mate | `e2e/scenarios/lp-to-courses.spec.ts` |
| P3-E2E-02 | 購入フロー：コース詳細 → 購入 → Stripe → 視聴開始 | e2etest-mate | `e2e/scenarios/purchase-flow.spec.ts` |
| P3-E2E-03 | 視聴 & 進捗：動画視聴 → 進捗マーク → 次レッスン | e2etest-mate | `e2e/scenarios/watch-progress.spec.ts` |
| P3-E2E-04 | ブックマーク：追加 / 一覧 / 解除 | e2etest-mate | `e2e/scenarios/bookmark.spec.ts` |
| P3-E2E-05 | 退会 → 再登録：履歴引継確認 | e2etest-mate | `e2e/scenarios/withdraw-relogin.spec.ts` |
| P3-E2E-06 | 管理画面：コース作成 → 章追加 → 動画追加 → 公開 | e2etest-mate | `e2e/scenarios/admin-course-create.spec.ts` |

### Step 5：LP 用素材確定・配置

| ID | タスク | 担当 | 出力 |
|----|--------|------|------|
| P3-LP-01 | 受講生の声（実コンテンツ・3〜5件） | Kosuke + dev-mate | TestimonialSection に配置 |
| P3-LP-02 | 実績数値（受講者数・コース数・満足度等） | Kosuke + dev-mate | StatsSection に配置 |
| P3-LP-03 | ヒーロー画像・コピー確定 | Kosuke + design-mate | HeroSection に配置 |

### Step 6：Phase 2 申し送り 16 件（F-01〜F-16）

WBS phase2.md「Phase 3 申し送り事項」セクション参照。
Phase 3 中に該当機能を実装する際、合わせて対処する。

| ID | 内容 | 関連 Step |
|----|------|---------|
| F-01〜F-04 | UI 系（FormField errorId / Breadcrumb / StatsSection / prop 名統一） | Step 2 |
| F-05 | AdminSidebar e-learning サブナビ | Step 3 着手時 |
| F-06〜F-10 | テスト系（route.ts / DB エラー / checkout.session.completed / 並行性 / atoms 網羅） | Step 4 並行 |
| F-11〜F-14 | Stripe 系（payment_intent UNIQUE / 既存 webhook リファクタ等） | Step 1 + Step 4 |
| F-15〜F-16 | デザイントークン拡張 | Step 2 中 |

### Step 7：後続課題対応

| ID | 内容 | 状態 |
|----|------|------|
| P3-AUX-01 | ESLint 復活（`npm run lint` echo 解消） | 📋 |
| P3-AUX-02 | tsconfig strict 化（strictNullChecks 等） | 📋 |
| P3-AUX-03 | `docs/auth/flow.md §D` の管理者判定前提崩れの修正 | 📋 |
| P3-AUX-04 | `/api/youtube-videos/import` と `sync` への認可ガード追加 | 📋 |
| P3-AUX-05 | admin UI コンポーネント（CustomersClient.tsx 等）の console.error PII 漏洩 | 📋 |
| P3-AUX-06 | columns/[id] の dangerouslySetInnerHTML サニタイズ | 📋 |
| P3-CLEANUP-01 | ★ Step 2 新導線 UI 完成後：旧 `/api/stripe/checkout` ルート + 旧 Webhook checkout.session.completed ハンドラ削除（旧買い切り「全コンテンツアクセス」導線を完全廃止）。Kosuke 判断 2026-05-14：UI から旧導線が外れたタイミングで削除する段階移行方針。新導線 UI（B001 LP + B002〜B014）完成 = Step 2 完了が前提 | dev-mate | 📋 |
| P3-SEED-01 | ローカル開発用ダミーコース投入スクリプト（既存 contents コピー方式・3 コース × 2-3 章 × 2-3 動画）✅ 完了（2026-05-14・コミット 9569b88・scripts/dev-seed/0001_dummy_courses.sql・review-mate 承認・本番非流入確認） | dev-mate | Kosuke 指示 | scripts/dev-seed/0001_dummy_courses.sql + docs/backend/database/seed-dev/README.md |

### Step 8（任意）：機密情報 / git 関連

| ID | 内容 | 状態 |
|----|------|------|
| P3-OPS-01 | Supabase access-token Rotation（過去コミットの旧トークン履歴削除） | 📋（Kosuke 判断） |
| P3-OPS-02 | ローカル / origin の divergence 解消（rebase + push） | 📋（Kosuke 判断） |
| P3-OPS-03 | プラポリ・利用規約への退会後 email 保持期間明記（GDPR / 個人情報保護法対応） | 📋（Kosuke 判断） |
| P3-OPS-04 | プラポリ・利用規約への Stripe customer_email 送信明記 | 📋（Kosuke 判断） |

---

## 依存関係と並行可能タスク

```
Step 1（業務ロジック）— Step 2/3 の前提
       ↓
Step 2（会員向け画面）& Step 3（管理画面）— Step 1 完了後・並行可
       ↓
Step 4（E2E テスト）— Step 2/3 が部分完了したら並行可
       ↓
Step 5（LP 素材）— Step 2 B001 着手時に Kosuke と並行
Step 6（Phase 2 申し送り）— Step 2/3 と並行（該当機能実装時）
Step 7（後続課題）— Phase 3 後半に集中対応
```

---

## マイルストーン

| マイルストーン | 達成条件 | 期待効果 |
|--------------|---------|---------|
| **M3-1** 業務ロジック完成 | Step 1 完了 | 画面実装の前提が整う |
| **M3-2** 会員フロー稼働 | Step 2 完了 | LP〜マイページの一気通貫 |
| **M3-3** 管理画面稼働 | Step 3 完了 | 運用開始可能 |
| **M3-4** E2E グリーン | Step 4 完了 | 主要シナリオ全パス |
| **M3-5** リリース準備完了 | Step 5-7 完了 | 本番リリース可能状態 |

---

## Phase 3 で守るべき重要ルール（Phase 2 確立事項より）

### 自動進行モード（Kosuke 承認 2026-05-14）

- 各 Sub の判断仰ぎは省略・team-lead 判断で自動進行
- 各 Step 完了時 / 重大エスカレーション時 / 本番影響発生時のみ Kosuke 報告

### 既存資産の非破壊原則（ng-patterns §12 line 101 + line 104 直下の補足）

- 既存 ui/ 配下 / 既存 LP / 既存 admin 画面は touch しない
- 既存 Header / MobileHeader / Sidebar / Footer は複製しない
- shadcn cva 構造踏襲 + トークン経由 + 既存非破壊 なら新規 atoms / molecules 可

### モード判定（パイプライン）

- Light（テキスト・設定のみ）→ dev-mate のみ
- Visual（UI 変更）→ dev-mate + design-mate + review-mate
- Logic（ロジック・API・DB）→ dev-mate + review-mate + unittest-mate
- Full（UI + ロジック）→ 全メート + e2etest-mate（存在時）

### security-mate オンデマンド起動

- 認証 / API / DB / 依存追加時に team-lead 直接 spawn（@security-authaudit 等）
- 既存運用通り Kosuke 確認後に起動

### docs / WBS 更新

- team-lead が随時 WBS phase3.md を更新（Sub 追加 / ステータス変更）
- 各 Sub 完了時に dev-mate コミット依頼
- 重要な設計変更時は `docs/backend/database/schema-changes/` に記録

---

## 関連ファイル

- 業務分析：`docs/backend/database/business-analysis.md`
- 概念モデル：`docs/backend/database/conceptual-model.md`
- 論理設計：`docs/backend/database/logical-design.md`
- 物理設計：`docs/backend/database/schema.dbml`
- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- API 設計：`docs/api/endpoints.md`
- 認証フロー：`docs/auth/flow.md`
- エラーコード：`docs/error-handling/errors.md`
- ロジック層：`docs/backend/logic/`
- 画面設計：`docs/frontend/screens.md`
- コンポーネント候補：`docs/frontend/component-candidates.md`（74 個・Phase 2 で 56 個実装済）
- ページテンプレート：`docs/frontend/page-templates.md`
- デザインシステム：`docs/frontend/design-system/`
- ハンドオフ：`docs/handoff/phase2-to-phase3.md`
- WBS Phase 2：`docs/wbs/phase2.md`

---

## このドキュメントの管理

- **作成日**：2026-05-14（Phase 2 完了時・スケルトン版）
- **作成者**：Phase 2 team-lead（運用ルール：Phase N の WBS は Phase N-1 完了時に作成）
- **Phase 3 着手時**：team-lead が本 WBS を起点に進める
- **詳細化**：Phase 3 進行中に Sub 単位で随時詳細化（Phase 2 同様の運用）
- **更新責務**：team-lead（タスク完了・Sub 追加・ステータス変更）

---

## Phase 3 開始時のセットアップチェックリスト

team-lead が Phase 3 着手前に確認・実行：

- [ ] `docs/handoff/phase2-to-phase3.md` を通読
- [ ] 本 WBS phase3.md を通読・必要に応じて初期詳細化
- [ ] `/team-phase3` でチーム起動（e2etest-mate 追加）
- [ ] `docs/e2e-scenarios/` がない場合、e2etest-mate にテンプレからセットアップ依頼
- [ ] `docs/feedback/` の状態確認
- [ ] dev-mate に最初のタスク（P3-LOGIC-01 access-service 判定実体）をアサイン

---

## このドキュメント自体のレビュー

- [x] team-lead 自己チェック完了（2026-05-14）
- [ ] ディレクター 承認：YYYY-MM-DD（Phase 3 着手判断時に追記）
