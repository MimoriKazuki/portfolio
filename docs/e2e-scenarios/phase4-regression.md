# Phase 4：リグレッションテスト（FB再発確認）

## 目的

過去に修正したフィードバック（FB）が **再発していないこと** を確認するテスト。
docs/feedback/ で完了になった項目に対応するシナリオを蓄積する。

## シナリオ作成方針

- 各 FB の完了時に、再発確認のためのシナリオを追加
- ID 体系：`SC-REG-{連番3桁}`
- シナリオには対応する FB 番号を必ず含める

## シナリオ一覧

### SC-REG-001: B001 新 LP の CTA リンクが正しい新 path に接続されている

- 対応変更: B001 新 LP（`/e-learning/lp`）の CTA リンク先を `/e-learning/lp/courses` / `/auth/login` に更新（コミット a2ddbf4）
- 変更内容: HeroSection の「コースを探す」が `/e-learning/lp/courses` に・「無料で始める」が `/auth/login` にそれぞれ接続
- 検証手順:
  1. `/e-learning/lp` にアクセス
  2. 「コースを探す」ボタンの href が `/e-learning/lp/courses` であることを確認（または実際にクリックして遷移確認）
  3. 「無料で始める」ボタンの href が `/auth/login` であることを確認
- 期待結果: 古い path（`/e-learning/courses`・旧単体動画一覧）への誤リンクがないこと
- ステータス: 📋 未着手

### SC-REG-002: 視聴権限なしユーザーが B005 に直アクセス → B004 へ `?denied=1` 付きリダイレクト

- 対応変更: B005 page.tsx で `canViewCourseVideo` が false の場合 `redirect(...?denied=1)` 実装（コミット 9d57d71）
- 変更内容: 視聴不可時に B004 コース詳細へリダイレクトし、購入 CTA を表示する導線
- 検証手順:
  1. 視聴権限のないユーザー（未購入・has_full_access=false）でログイン
  2. `/e-learning/lp/courses/[slug]/videos/[videoId]`（有料動画）へ直アクセス
  3. `/e-learning/lp/courses/[slug]?denied=1` にリダイレクトされることを確認
- 期待結果: 視聴画面が表示されず B004 コース詳細に戻ること
- ステータス: 📋 未着手

### SC-REG-003: 未ログインユーザーが B004 / B005 に直アクセス → A001 ログインへ returnTo 付きリダイレクト

- 対応変更: B004 / B005 page.tsx で未ログイン時 `redirect(/auth/login?returnTo=...)` 実装（コミット 6d7cc17 / 9d57d71）
- 検証手順（B004）:
  1. 未ログイン状態で `/e-learning/lp/courses/[slug]` へアクセス
  2. `/auth/login?returnTo=%2Fe-learning%2Flp%2Fcourses%2F[slug]` にリダイレクトされることを確認
- 検証手順（B005）:
  1. 未ログイン状態で `/e-learning/lp/courses/[slug]/videos/[videoId]` へアクセス
  2. `/auth/login?returnTo=%2Fe-learning%2Flp%2Fcourses%2F[slug]%2Fvideos%2F[videoId]` にリダイレクトされることを確認
- 期待結果: returnTo が URL エンコードされた正しいパスになっていること
- ステータス: 📋 未着手

### SC-REG-004: 既存 `/e-learning/courses` が引き続き表示される（新 path 追加による非破壊確認）

- 対応変更: 新 `/e-learning/lp/courses` 追加（コミット a377b97）。既存 `/e-learning/courses` は完全非破壊方針
- 検証手順:
  1. `/e-learning/courses`（旧単体動画一覧）にアクセス
  2. 200 OK でページが表示されることを確認
- 期待結果: 旧ページが 404 / エラーにならないこと
- ステータス: 📋 未着手

---

### SC-REG-005: 既存 PurchasePromptModal v1（B007 から呼ばれる）が引き続き動作する（非破壊確認）

- 対応変更: PurchasePromptModalV2 新規追加（コミット 2877ef6）。既存 PurchasePromptModal.tsx は完全温存
- 変更内容: v2 は別ファイル・別コンポーネント名で共存。v1 の import 先・props は変更なし
- 検証手順:
  1. 既存 B007 単体動画詳細（`/e-learning/[id]`）の未購入有料動画にアクセス
  2. 既存の購入 CTA（PurchasePromptModal v1）が表示されることを確認
  3. モーダルが正常に open / close できることを確認
- 期待結果: v1 モーダルが v2 追加前と同じ動作をすること
- ステータス: 📋 未着手

---

### SC-REG-006: 未ログインユーザーが新マイページ B011/B012/B013 に直アクセス → A001 へ returnTo 付きリダイレクト

- 対応変更: B011/B012/B013 page.tsx に未ログイン時 `redirect('/auth/login?returnTo=...')` 実装（コミット 97df16e / 98029ce / cb0ebd8）
- 検証手順:
  1. 未ログイン状態で `/e-learning/lp/mypage/purchases` へアクセス → `/auth/login?returnTo=%2Fe-learning%2Flp%2Fmypage%2Fpurchases` にリダイレクトされることを確認
  2. 未ログイン状態で `/e-learning/lp/mypage/bookmarks` へアクセス → `/auth/login?returnTo=%2Fe-learning%2Flp%2Fmypage%2Fbookmarks` にリダイレクトされることを確認
  3. 未ログイン状態で `/e-learning/lp/mypage/progress` へアクセス → `/auth/login?returnTo=%2Fe-learning%2Flp%2Fmypage%2Fprogress` にリダイレクトされることを確認
- 期待結果: 3画面とも未認証アクセスで正しい returnTo 付きログインページへリダイレクトされること
- ステータス: 📋 未着手

### SC-REG-007: 未ログインユーザーが B014 新マイページ プロフィールに直アクセス → A001 へ returnTo 付きリダイレクト

- 対応変更: B014 page.tsx に未ログイン時 `redirect('/auth/login?returnTo=/e-learning/lp/mypage')` 実装
- 検証手順:
  1. 未ログイン状態で `/e-learning/lp/mypage` へアクセス
  2. `/auth/login?returnTo=%2Fe-learning%2Flp%2Fmypage` にリダイレクトされることを確認
- 期待結果: 未認証アクセスでプロフィール情報が表示されず、正しい returnTo 付きログインページへリダイレクトされること
- ステータス: 📋 未着手

---

### SC-REG-008: 既存 `/e-learning/mypage`（旧マイページ）が引き続き表示される（新 path 追加による非破壊確認）

- 対応変更: 新 `/e-learning/lp/mypage` 追加。既存 `/e-learning/mypage`（旧パス）は完全非破壊方針（P3-CLEANUP-01 まで温存）
- 検証手順:
  1. ログイン済み状態で `/e-learning/mypage`（旧パス）にアクセス
  2. 200 OK でページが表示されることを確認（404 / 500 にならないこと）
- 期待結果: 旧マイページパスが新パス追加によって壊れていないこと
- ステータス: 📋 未着手

### SC-REG-009: 非管理者（一般ユーザー）が `/admin/e-learning/courses*` に直アクセス → `/admin/e-learning` へリダイレクト

- 対応変更: C005/C006/C007 page.tsx に `requireAdmin()` 多層防御実装（コミット af3b44a）
- 変更内容: 管理者以外のセッション（`guard.ok === false && status === 403`）は `/admin/e-learning` へリダイレクト
- 検証手順:
  1. 一般ユーザー（管理者でない）でログイン
  2. `/admin/e-learning/courses` へ直アクセス → `/admin/e-learning` にリダイレクトされることを確認
  3. `/admin/e-learning/courses/new` と `/admin/e-learning/courses/[id]/edit` でも同様を確認
- 期待結果: 3 画面すべてで非管理者がコース管理画面の内容を表示できないこと
- ステータス: 📋 未着手

---

### SC-REG-010: 旧形式 Webhook（charge.refunded）が新形式 e_learning_purchases に干渉しない

- 対応変更: P3-WEBHOOK-NEW で checkout.session.completed 新形式分岐追加（コミット cfb7221）。charge.refunded の旧処理は温存
- 変更内容: `charge.refunded` ハンドラは旧形式（userId での has_full_access=false）のみを対象とし、新形式 purchases レコードへの干渉を持たない設計
- 検証手順:
  1. Stripe テストモードで `stripe trigger charge.refunded` を発火
  2. Webhook ログで `charge.refunded` が受信されることを確認
  3. 既存 e_learning_purchases テーブルの既存レコードが意図せず変更されていないことをDB で確認
- 期待結果: charge.refunded が新形式 purchases レコードを壊さないこと
- 補足: **Stripe テストモード必須**
- ステータス: 📋 未着手

---

### SC-REG-011: 旧 `/api/stripe/checkout`（全コンテンツ買い切り・has_full_access 切替）が引き続き動作する（後方互換確認）

- 対応変更: checkout-service.ts で success_url を `/e-learning/lp/checkout/complete` に統一（コミット 6b2a291）。旧エンドポイント `/api/stripe/checkout` は完全温存
- 変更内容: 旧エンドポイントは `STRIPE_E_LEARNING_PRICE_ID` を使う全コンテンツ買い切り専用。新エンドポイント `/api/checkout` とは別ファイル・別 Stripe Session
- 検証手順:
  1. Stripe テストモードで旧エンドポイント（POST `/api/stripe/checkout`）を呼び出して Checkout Session を作成
  2. テスト購入完了後、Webhook（checkout.session.completed 旧形式・metadata に userId のみ）が受信されることを確認
  3. 対象ユーザーの `has_full_access` が true に切り替わることを確認
- 期待結果: 旧エンドポイント経由の購入で has_full_access 自動切替が引き続き機能すること
- 補足: **Stripe テストモード必須。旧エンドポイントを触らずに新エンドポイントが並走していることを確認**
- ステータス: 📋 未着手

---

## FB との対応マトリクス

| FB番号 | リグレッション SC | 完了日 |
|-------|------------------|-------|
| B001-CTA-001（LP CTA path 修正） | SC-REG-001 | 2026-05-14 |
| B005-ACCESS-001（視聴権限なし → denied リダイレクト） | SC-REG-002 | 2026-05-14 |
| B004-AUTH-001 / B005-AUTH-001（未ログイン returnTo リダイレクト） | SC-REG-003 | 2026-05-14 |
| B002-NONDESTRUCTIVE-001（旧 /e-learning/courses 非破壊確認） | SC-REG-004 | 2026-05-14 |
| B008-NONDESTRUCTIVE-001（PurchasePromptModal v1 非破壊確認） | SC-REG-005 | 2026-05-14 |
| B011/B012/B013-AUTH-001（新マイページ未ログイン returnTo リダイレクト） | SC-REG-006 | 2026-05-14 |
| B014-AUTH-001（新マイページ プロフィール未ログイン returnTo リダイレクト） | SC-REG-007 | 2026-05-14 |
| B014-NONDESTRUCTIVE-001（旧 /e-learning/mypage 非破壊確認） | SC-REG-008 | 2026-05-14 |
| C005-C007-AUTH-001（非管理者コース管理直アクセス → リダイレクト） | SC-REG-009 | 2026-05-14 |
| WEBHOOK-BACKWARD-001（charge.refunded が新形式 purchases に干渉しない） | SC-REG-010 | 2026-05-14 |
| WEBHOOK-BACKWARD-002（旧 /api/stripe/checkout 後方互換） | SC-REG-011 | 2026-05-14 |

---

## 運用ルール

- フィードバック完了時、team-lead が e2etest-mate に依頼してリグレッションシナリオを追加
- 全 FB に対してシナリオを作る必要はない（再発リスクが低いものはスキップ可）
- 新規実装フェーズ完了時に全シナリオを一括実行

---

## サマリ

| 状態 | 件数 |
|------|------|
| 📋 未着手 | 11 |
| 🔧 実装中 | 0 |
| ✅ 完了 | 0 |
| **合計** | **11** |
