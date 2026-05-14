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
| 2 | 会員向け画面実装（LP + 一覧 + 詳細 + 視聴 + 購入 + マイページ） | 14 | ✅ 完了（14/14 + 後続課題 + Webhook + Playwright・100%・2026-05-14） |
| 3 | 管理画面実装（C001〜C011） | 11 | ✅ 完了（11/11・100%・M3-3 達成・2026-05-14） |
| 4 | E2E テスト | 5-10 | 🔧 主要完走（phase1-smoke 57 件 + phase4-regression 18 件 spec 化完了・middleware バグ修正含む・UAT 87 件は Phase 4 候補・部分 M3-4 達成） |
| 5 | LP 用素材確定・配置 | 1-3 | 📋 未着手 |
| 6 | Phase 2 申し送り 16 件（F-01〜F-16） | 16 | 📋 未着手 |
| 7 | 後続課題対応（ESLint / tsconfig / 既存 admin UI 等） | 6 | 📋 未着手 |
| **計** | | **約 60-70** | 🔧 進行中 |

---

## ★ データ削除関連ルール（重要・2026-05-14 Kosuke 確定）

### 物理削除方針

- 既存 admin の削除ボタン（DeleteELearningButton.tsx 等）は **物理削除のまま温存**
- 運用方針：「削除したら復元せず、再投稿で対応」（Kosuke 確定）
- `deleted_at` 論理削除はスキーマに残るが、admin 削除導線では使わない
- → P3-ADM-DELETE-LOGIC タスクは ➖ **対応不要**（Kosuke 判断確定）

### 誤削除防止ルール（Claude Code / dev-mate / e2etest-mate への絶対指示・2026-05-14 改訂）

#### コード変更系（NG）
1. **既存の削除ボタン / 削除 API の*コード自体*は touch 禁止**
   - DeleteELearningButton.tsx・admin 配下の他の削除導線・既存運用で動いている全削除機能
   - 動作（物理削除のまま）は維持・コードに手を入れない
2. **新規実装で破壊的データ操作（DELETE/DROP/TRUNCATE）の追加禁止**
   - 新規 Server Action / Service / Repository は SELECT / INSERT / UPDATE のみ
   - 例外（OK）：
     - ユーザー自身が自分のデータを消す系（B012 bookmark-service.remove・/api/me/withdraw 等）
     - テストコードが自分で作ったテストデータをテスト内で消す系（クリーンアップ）
3. **DB マイグレーション・スキーマ変更は事前 Kosuke 確認必須**（既存ルール継続）

#### テスト時のデータ取り扱い（OK / NG 区別）
- **OK**：既存の削除ボタンをテストで動作確認する（押下して挙動を確かめる）
- **OK**：Claude Code（dev-mate / e2etest-mate）が作ったテストデータを削除する（クリーンアップ）
- **NG**：人（Kosuke / 運営）が入れたデータを削除する（既存 15 件動画・6 件購入レコード等）

#### テストデータの識別
- テストデータには必ず識別しやすい接頭辞（`[TEST_]` `[E2E_TEST]` 等）を付ける
- これによりテストで「自分が作ったデータか・既存データか」を判別できる
- 既存データのタイトル接頭辞と被らないことを確認すること

### 適用範囲

このルールは Phase 3 全体で適用される。違反 = 既存運用への重大影響なので、必ず事前エスカレーション。

---

## ★ Phase 3 中の URL 命名規則（重要・2026-05-14 確定）

### 背景

screens.md（Phase 1）では「既存 URL を新仕様で再構築・置換」する設計（例：`/e-learning/courses` を新コース一覧に書き換え）。しかし Kosuke 確定方針「既存運用 100% 非破壊」と統合した結果、Phase 3 中は **新 path `/e-learning/lp/*` 配下で並走実装**し、P3-CLEANUP-01（Step 7）で URL 正規化（旧削除 + 新 → 正規 path にリネーム or リダイレクト）する。

### Phase 3 暫定 URL マップ

| 画面 ID | screens.md 正規 URL（最終） | Phase 3 中の暫定 URL（実装中） | 既存 URL の状態 |
|--------|----------------------------|-------------------------------|----------------|
| B001 | `/e-learning` | `/e-learning/lp` ✅ 完了 | 既存 `/e-learning` は単体動画一覧として温存 |
| B002 | `/e-learning/home` | `/e-learning/lp/home` | （新規・既存なし） |
| B003 | `/e-learning/courses` | `/e-learning/lp/courses` | 既存 `/e-learning/courses` は単体動画一覧として温存 |
| B004 | `/e-learning/courses/[slug]` | `/e-learning/lp/courses/[slug]` | （新規・既存なし） |
| B005 | `/e-learning/courses/[slug]/videos/[videoId]` | `/e-learning/lp/courses/[slug]/videos/[videoId]` | （新規・既存なし） |
| B006 | `/e-learning/videos` | `/e-learning/lp/videos` | （新規・既存なし） |
| B007 | `/e-learning/[id]` | `/e-learning/[id]`（既存最小改修） | 既存温存 + progress 完了マーク追加 |
| B008〜B014 | screens.md 通り | `/e-learning/lp/*` 配下 | （新規・既存なし） |

### P3-CLEANUP-01 での正規化（Step 2 完了後）

1. 旧 `/e-learning` / `/e-learning/courses` / `/e-learning/[id]` を削除 or 301 リダイレクトに置換
2. 新 `/e-learning/lp/*` を screens.md 正規 path にリネーム or リダイレクト
3. screens.md の URL と完全一致させる

### B007 例外（既存最小改修）

B007 単体動画詳細・視聴は既存 `app/e-learning/[id]/page.tsx`（404 行 Client Component）が本番稼働中・access-service 連携済のため、**完全な VideoPlayerTemplate 化はしない**。progress-service の完了マークボタンを最小追加する程度に留める。VideoPlayerTemplate の真価は B005 コース内動画視聴で発揮される。

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
| P3-SCR-B002 | コース一覧（screens.md B003）✅ 完了（2026-05-14・コミット a377b97・新 path /e-learning/lp/courses・既存 /e-learning/courses 完全非破壊・URL query 連動フィルタ・UT 19 件） | design-mate + dev-mate | screens.md B003 + MediaListTemplate | `app/e-learning/lp/courses/page.tsx` |
| P3-SCR-B003 | 単体動画一覧（screens.md B006）✅ 完了（2026-05-14・コミット 8cb3f09・新 path /e-learning/lp/videos・既存 /e-learning は非破壊・UT 13 件） | design-mate + dev-mate | screens.md B006 | `app/e-learning/lp/videos/page.tsx` |
| P3-SCR-B004 | B004 コース詳細 ✅ 完了（2026-05-14・コミット 6d7cc17・新 path /e-learning/lp/courses/[slug]・CurriculumAccordionClient + access-service + progress-service 連携・UT 9 件） | design-mate + dev-mate | screens.md B004 + CourseDetailTemplate | `app/e-learning/lp/courses/[slug]/page.tsx` |
| P3-SCR-B005 | B005 コース内動画視聴 ✅ 完了（2026-05-14・コミット 9d57d71・新 path /e-learning/lp/courses/[slug]/videos/[videoId]・VideoPlayerTemplate 本格活用・UT 17 件） | design-mate + dev-mate | screens.md B005 + VideoPlayerTemplate | `app/e-learning/lp/courses/[slug]/videos/[videoId]/page.tsx` |
| P3-SCR-B006 | B006 メディア一覧（フィルタ状態）✅ 完了（2026-05-14・P3-SCR-B003 に統合・/e-learning/lp/videos が screens.md B006 単体動画一覧として実装済・URL query 連動フィルタ込み） | design-mate + dev-mate | screens.md B006 | `app/e-learning/lp/videos/page.tsx` |
| P3-SCR-B008 | B008 購入導線（PurchasePromptModalV2 新規）✅ 完了（2026-05-14・コミット 2877ef6・既存 PurchasePromptModal 非破壊・/api/checkout 連携） | design-mate + dev-mate | screens.md B008 | `app/e-learning/PurchasePromptModalV2.tsx` |
| P3-SCR-B007 | B007 単体動画詳細・視聴 ✅ 完了（2026-05-14・コミット d1efce4 + eaadd5b・既存 [id] 最小改修・案 B-1：404 行 Client 温存・progress 完了マーク追加のみ・UT 7 件） | design-mate + dev-mate | screens.md B007 | `app/e-learning/[id]/page.tsx`（既存最小改修） |
| ~~P3-SCR-B008（旧）~~ | （上に統合・✅ 完了済） | — | — | — |
| P3-SCR-B009 | B009 購入完了（ポーリング 2秒×10回・4 状態 UI）✅ 完了（2026-05-14・コミット 95763ad + 7f7305e・/api/me/access 新規 + checkout-service success_url を /lp/ 配下に統一・UT 12 件） | design-mate + dev-mate | screens.md B009 + InfoPageTemplate | `app/e-learning/lp/checkout/complete/page.tsx` |
| P3-WEBHOOK-NEW | Webhook checkout.session.completed に新形式 metadata 分岐追加 ✅ 完了（2026-05-14・コミット cfb7221・e_learning_purchases INSERT・旧 has_full_access 切替温存・UT 6 件） | dev-mate | stripe-webhook-service.md §handleCheckoutCompleted | `app/api/stripe/webhook/route.ts`（拡張） |
| P3-TEST-01 | Playwright セットアップ + phase1 主要 smoke 実装（10 件）✅ 完了（2026-05-14・コミット 31d1a0e + 9400786 + bd2d1bb・webServer auto + console error 検知 + vitest exclude 対応） | dev-mate | docs/e2e-scenarios/phase1-smoke.md | `playwright.config.ts` + `e2e/tests/*.spec.ts` |
| P3-SCR-B010 | B010 購入キャンセル ✅ 完了（2026-05-14・コミット daffd91・新 path /e-learning/lp/checkout/cancel・InfoPageTemplate） | design-mate + dev-mate | screens.md B010 | `app/e-learning/lp/checkout/cancel/page.tsx` |
| P3-SCR-B004-PromptOpen | B004 ヒーロー購入 CTA の自動 open Client wrapper（CoursePurchaseCtaClient）✅ 完了（2026-05-14・コミット 0499c93・URL ?purchase=1 と PurchasePromptModalV2 を双方向同期・UT 9 件） | dev-mate | design-mate 補足メモ | `app/e-learning/lp/courses/[slug]/_lib/CoursePurchaseCtaClient.tsx` |
| P3-SCR-B011 | B011 マイページ（購入履歴）✅ 完了（2026-05-14・コミット 97df16e・has_full_access バナー + refunded 別表示・UT 7 件） | design-mate + dev-mate | screens.md B011 + MyPageTemplate | `app/e-learning/lp/mypage/purchases/page.tsx` |
| P3-SCR-B012 | B012 マイページ（ブックマーク）✅ 完了（2026-05-14・コミット 98029ce + a8e38c1・bookmark-service.list/remove 連携・楽観的 UI・UT 12 件） | design-mate + dev-mate | screens.md B012 | `app/e-learning/lp/mypage/bookmarks/page.tsx` |
| P3-SCR-B013 | B013 マイページ（視聴履歴）✅ 完了（2026-05-14・コミット cb0ebd8・progress-service 連携 + コース別 ProgressBar + 次のレッスン解決・UT 9 件） | design-mate + dev-mate | screens.md B013 | `app/e-learning/lp/mypage/progress/page.tsx` |
| P3-SCR-B014 | B014 マイページ（プロフィール・退会導線）✅ 完了（2026-05-14・コミット db0957b + 2761011・/api/me/withdraw 連携 + supabase.auth.signOut・has_full_access バナー・UT 8 件） | design-mate + dev-mate | screens.md B014 + auth/flow.md §G | `app/e-learning/lp/mypage/page.tsx` |

### Step 3：管理画面実装

| ID | タスク | 担当 | 出力 |
|----|--------|------|------|
| P3-ADM-C001 | C001 単体動画一覧（既存改修・deleted_at 表示 + フィルタ追加）✅ 完了（2026-05-14・コミット 3ec2515・案 X1 最小追加・既存運用 100% 維持） | design-mate + dev-mate | `app/admin/e-learning/ELearningAdminClient.tsx` |
| P3-ADM-C002 | C002 単体動画 新規作成（既存改修・stripe_price_id 追加）✅ 完了（2026-05-14・コミット 93d7502・案 X1 最小追加・既存運用 100% 維持） | design-mate + dev-mate | `app/admin/e-learning/ELearningForm.tsx` |
| P3-ADM-C003 | C003 単体動画 編集（既存改修・C002 と共通フォーム）✅ 完了（2026-05-14・コミット 93d7502・案 X1 最小追加・既存運用 100% 維持） | design-mate + dev-mate | `app/admin/e-learning/[id]/edit/page.tsx`（既存・改修なし） |
| P3-ADM-C004 | C004 カテゴリ管理（既存改修・deleted_at L4 対応）✅ 完了（2026-05-14・コミット 6a71060・案 X1 最小追加・既存運用 100% 維持・UT 14 件） | design-mate + dev-mate | `app/admin/e-learning/categories/CategoriesAdminClient.tsx` |
| ~~P3-ADM-C005（旧）~~ | （内容変更：C005 = コース一覧管理として P3-ADM-C005 行で扱う） | — | — |
| P3-ADM-C006 | C006 章＋動画 DnD 編集（CurriculumEditor organism 新規） | design-mate + dev-mate | organism + page |
| P3-ADM-C007 | C007 資料管理（MaterialEditor organism 新規） | design-mate + dev-mate | organism + page |
| P3-ADM-C008 | C008 カリキュラム編集（章・動画 DnD）✅ 完了（2026-05-14・コミット 69e8e61・@dnd-kit 採用・C006/C007 内タブ統合・UT 38 件） | design-mate + dev-mate | `app/admin/e-learning/courses/[id]/edit/page.tsx`（Tabs） |
| P3-ADM-C009 | C009 購入履歴管理 ✅ 完了（2026-05-14・コミット a70bafb + 81022a3・completed/refunded 一覧 + legacy フィルタ・UT 18 件） | design-mate + dev-mate | `app/admin/e-learning/purchases/page.tsx` |
| P3-ADM-C010 | C010 フルアクセスユーザー管理 ✅ 完了（2026-05-14・コミット a0f4b9e・has_full_access 手動切替の正規 UI + 確認 Dialog + 監査ログ・UT 18 件） | design-mate + dev-mate | `app/admin/e-learning/users/page.tsx` |
| P3-ADM-C011 | C011 レガシー購入レコード参照（読み取り専用）✅ 完了（2026-05-14・コミット aeb1da1・AdminListTemplate + requireAdmin 多層防御・編集/削除ボタンなし・UT 8 件） | design-mate + dev-mate | `app/admin/e-learning/legacy-purchases/page.tsx` |

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
| F-01 | FormField errorId / helpId children 自動連携 ✅ 完了（2026-05-14・コミット dcad491） | — |
| F-02 | Breadcrumb 中間 href なし時の aria-current 矛盾 ✅ 完了（2026-05-14・コミット acd3c86） | — |
| F-03 | StatsSection stats.length=1 時の colsClass[1] 漏れ ✅ 完了（2026-05-14・コミット f85af80） | — |
| F-04 | hasPurchased → hasViewAccess 統一 ✅ 完了（2026-05-14・コミット 027195d・access-service 意味論と整合） | — |
| F-05 | AdminSidebar e-learning サブナビ追加 ✅ 完了（2026-05-14・コミット d37e49b・6 サブリンク・active 階層表示・P3-ADM-NAV-01 を前倒し対応済） | — |
| F-06 | /api/checkout route.ts の単体テスト追加 ✅ 完了（2026-05-14・コミット 95fd423・20 件追加） | — |
| F-07 | DB エラー経路のユニットテスト追加 ✅ 完了（2026-05-14・コミット 7fce837・checkout-service の 3 経路 +4 件・他 service は既存網羅済） | — |
| F-08 | 既存 checkout.session.completed ハンドラのテスト追加 ✅ 完了（P3-WEBHOOK-NEW で 29 件追加済・has_full_access 不更新 assert / UNIQUE 違反冪等性 / metadata 欠落 200 / 旧形式後方互換 全カバー） | — |
| F-09 | Webhook 並行性 / 順序逆転 UT 追加 ✅ 完了（2026-05-14・コミット fd5e784・vitest 並行 fetch 模擬・冪等ロジック完全カバー・+4 件） | — |
| F-10 | 全 atoms / molecules の網羅テスト追加 | Step 4 並行 |
| F-11 | stripe_payment_intent_id UNIQUE 制約追加（DB マイグレ・Kosuke 確認案件） | Kosuke 判断 |
| F-12 | checkout.session.completed に stripe_payment_intent_id 書き込み追加 ✅ 完了（P3-WEBHOOK-NEW で対応済・string/object 両対応・charge.refunded マッチングと整合） | — |
| F-13 | has_full_access の Webhook 切り替え ✅ 完了（P3-WEBHOOK-NEW で対応済・新形式 INSERT のみ・旧形式は has_full_access 自動切替温存） | — |
| F-14 | 既存購入完了 Slack 通知の PII 削除 ✅ 完了（2026-05-14・コミット aac50ae・maskEmail/maskDisplayName + sendSlackPurchaseNotification 経由で新形式も自動カバー） | — |
| F-15 | Textarea min-h arbitrary value ➖ **対応不要**（2026-05-14・design-mate 判断：60px/120px は 4px 倍数で ng-patterns §3 違反なし） | — |
| F-16 | Badge / Price free / FreeBadge のカスタムトークン化 ➖ **対応不要**（2026-05-14・design-mate 判断：atom 内集約済・colors.md §3 原則達成） | — |

### Step 7：後続課題対応

| ID | 内容 | 状態 |
|----|------|------|
| P3-AUX-01 | ESLint 復活（`npm run lint` echo 解消）✅ 完了（2026-05-14・コミット 698dbaa・flat config + next/core-web-vitals + 段階導入 5 ルール warn 化） |
| P3-AUX-02 | tsconfig strict 化（strictNullChecks 等）✅ 完了（2026-05-14・コミット 188a988・5 オプション段階導入 + 既存エラー 3 件解消・strictNullChecks は Phase 4 候補） |
| P3-AUX-03 | `docs/auth/flow.md §D` の管理者判定前提崩れの修正 ✅ 完了（2026-05-14・team-lead 編集・ADMIN_EMAIL ホワイトリスト方式に書き換え + Phase 1→2 変更経緯記載） |
| P3-AUX-04 | `/api/youtube-videos/import` と `sync` への認可ガード追加 ✅ 完了（2026-05-14・コミット 1d5bd9a + 0e2b6b3・requireAdmin 多層防御 + UT 4 件） |
| P3-AUX-05 | admin UI コンポーネント（CustomersClient.tsx 等）の console.error PII 漏洩 ✅ 完了（2026-05-14・コミット 054f651・3 ファイル 16 箇所・ProjectForm auth.getUser 完全削除含む） |
| P3-AUX-06 | columns/[id] の dangerouslySetInnerHTML サニタイズ ✅ 完了（2026-05-14・コミット 1c5f9ce + 4f5a954 + 003bf22・DOMPurify + TipTap 拡張対応） |
| P3-CLEANUP-01 | ★ Step 2 新導線 UI 完成後：旧 `/api/stripe/checkout` ルート + 旧 Webhook checkout.session.completed ハンドラ削除（旧買い切り「全コンテンツアクセス」導線を完全廃止）。Kosuke 判断 2026-05-14：UI から旧導線が外れたタイミングで削除する段階移行方針。新導線 UI（B001 LP + B002〜B014）完成 = Step 2 完了が前提 | dev-mate | 📋 |
| P3-ADM-DELETE-LOGIC | ➖ **対応不要**（Kosuke 判断 2026-05-14：物理削除温存方針確定・「削除→再投稿」運用） | — | ➖ |
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
