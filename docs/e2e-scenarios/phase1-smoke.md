# Phase 1：スモークテスト（全画面表示確認）

## 目的

全画面が **エラーなく描画される** ことを確認する最低限のテスト。
業務ロジックの検証は行わない。「ページが開けるか」のみ。

## シナリオ作成方針

- docs/frontend/screens.md の全29画面に対して1シナリオずつ作成
- ID 体系：`SC-SMK-{連番3桁}`
- 各シナリオは「URLにアクセス → ページタイトル等の主要要素が表示される」を検証

## シナリオ一覧

### 認証

#### SC-SMK-001: A001 ログイン画面表示
- 対象URL: `/auth/login`
- 確認内容: Google OAuth ログインボタンが表示される
- ステータス: 📋 未着手

### Eラーニング 公開／会員

#### SC-SMK-002: B001 Eラーニング LP 表示
- 対象URL: `/e-learning`
- 確認内容: ヒーローセクション・コース紹介が表示される（未ログイン）
- ステータス: 📋 未着手

#### SC-SMK-002b: B001 新 LP 表示（`/e-learning/lp`）
- 対象URL: `/e-learning/lp`
- 認証: 不要（未ログイン）
- 確認内容（必須要素 3 点 + 200 OK）:
  - HeroSection: 見出し「AI を「使える」レベルへ、最短距離で。」が表示される
  - FAQAccordion: 見出し「よくあるご質問」が表示される
  - ContactSection: 見出し「法人向け / カスタム研修もご相談ください」が表示される
- 補足: DB に is_featured コースが0件でも 200 OK で表示される（CourseShowcase / ContentShowcase は length=0 時に非表示・他セクションは表示のまま）
- ステータス: 📋 未着手

#### SC-SMK-003: B002 会員ホーム表示
- 対象URL: `/e-learning/home`
- 前提: ログイン済み
- 確認内容: コース一覧・単体動画タブが表示される
- ステータス: 📋 未着手

#### SC-SMK-004: B003 コース一覧表示
- 対象URL: `/e-learning/courses`
- 前提: ログイン済み
- 確認内容: コース一覧・フィルタが表示される
- ステータス: 📋 未着手

#### SC-SMK-004c: B002 新コース一覧表示（`/e-learning/lp/courses`）
- 対象URL: `/e-learning/lp/courses`
- 認証: 不要（未ログイン）
- 確認内容:
  - h1「コース一覧」が表示される
  - キーワード検索 Input・カテゴリチップ・無料/有料フィルタが表示される
  - DB にコース0件でも 200 OK（MediaGrid isEmpty 状態）
- ステータス: 📋 未着手

#### SC-SMK-004d: B003 新単体動画一覧表示（`/e-learning/lp/videos`）
- 対象URL: `/e-learning/lp/videos`
- 認証: 不要（未ログイン）
- 確認内容:
  - h1「単体動画一覧」が表示される
  - キーワード検索 Input・カテゴリチップ・無料/有料フィルタが表示される
  - DB に動画0件でも 200 OK（MediaGrid isEmpty 状態）
- ステータス: 📋 未着手

#### SC-SMK-005: B004 コース詳細表示
- 対象URL: `/e-learning/courses/[slug]`（テスト用コース）
- 前提: ログイン済み
- 確認内容: カリキュラム・購入CTA・ブックマークアイコンが表示される
- ステータス: 📋 未着手

#### SC-SMK-005c: B004 新コース詳細表示（`/e-learning/lp/courses/[slug]`）
- 対象URL: `/e-learning/lp/courses/[slug]`（dev-seed テスト用コース slug）
- 前提: ログイン済み
- 確認内容:
  - h1 にコースタイトルが表示される
  - 「カリキュラム」セクションが表示される
  - 「最初から見る」または「購入する」CTA が表示される
- ステータス: 📋 未着手

#### SC-SMK-006: B005 コース視聴画面表示
- 対象URL: `/e-learning/courses/[slug]/videos/[videoId]`（視聴可能な動画）
- 前提: ログイン済み・視聴権限あり
- 確認内容: 動画プレイヤー・章内動画リストが表示される
- ステータス: 📋 未着手

#### SC-SMK-006c: B005 新コース内動画視聴表示（`/e-learning/lp/courses/[slug]/videos/[videoId]`）
- 対象URL: `/e-learning/lp/courses/[slug]/videos/[videoId]`（視聴権限ありの動画）
- 前提: ログイン済み・視聴権限あり（dev-seed の無料コース動画または購入済みコース動画）
- 確認内容:
  - 動画プレイヤー（CourseVideoPlayer）が表示される
  - 左サイドバーのレッスン一覧が表示される
  - 「視聴完了にする」ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-007: B006 単体動画一覧表示
- 対象URL: `/e-learning/videos`
- 前提: ログイン済み
- 確認内容: 単体動画カード一覧・フィルタが表示される
- ステータス: 📋 未着手

#### SC-SMK-008: B007 単体動画詳細表示
- 対象URL: `/e-learning/[id]`（テスト用動画）
- 前提: ログイン済み・視聴権限あり
- 確認内容: 動画プレイヤー・概要・資料セクション・「視聴完了」ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-009: B009 購入完了画面表示
- 対象URL: `/e-learning/checkout/complete?session_id=test`
- 前提: ログイン済み
- 確認内容: 購入完了またはポーリングスピナーが表示される
- ステータス: 📋 未着手

#### SC-SMK-009c: B009 新購入完了画面 session_id なし表示（`/e-learning/lp/checkout/complete`）
- 対象URL: `/e-learning/lp/checkout/complete`（session_id クエリなし）
- 前提: ログイン済み
- 確認内容:
  - タイトル「ご購入ありがとうございます」が表示される
  - `target.kind === 'unknown'` 分岐により「購入対象を特定できませんでした」メッセージが表示される
  - 「マイページ：購入履歴へ」リンク（href: `/e-learning/lp/mypage/purchases`）が表示される
  - ポーリングスピナーは表示されない
- 補足: session_id なしは unknown fallback で表示されるため Stripe テストモード不要
- ステータス: 📋 未着手

#### SC-SMK-010: B010 購入キャンセル画面表示
- 対象URL: `/e-learning/checkout/cancel`
- 前提: ログイン済み
- 確認内容: キャンセル旨の案内とコース詳細への導線が表示される
- ステータス: 📋 未着手

#### SC-SMK-010c: B010 新購入キャンセル画面表示（`/e-learning/lp/checkout/cancel`）
- 対象URL: `/e-learning/lp/checkout/cancel`
- 認証: 不要（静的表示・個人情報なし）
- 確認内容:
  - タイトル「購入をキャンセルしました」が表示される
  - 「コース一覧へ」ボタン（href: `/e-learning/lp/courses`）が表示される
  - 「単体動画一覧へ」ボタン（href: `/e-learning/lp/videos`）が表示される
- ステータス: 📋 未着手

#### SC-SMK-005d: B004 購入モーダル自動 open（`?purchase=1`）
- 対象URL: `/e-learning/lp/courses/[slug]?purchase=1`（有料コース・未購入・ログイン済み）
- 前提: ログイン済み・有料コースが存在する
- 確認内容:
  - ページロード時に PurchasePromptModalV2 が自動で open している（Dialog が表示される）
  - Dialog 内にコースタイトルが表示される
- 補足: `?purchase=1` が URL に含まれた状態でのマウントで自動 open する CoursePurchaseCtaClient の動作確認
- ステータス: 📋 未着手

#### SC-SMK-011: B011 マイページ購入履歴表示
- 対象URL: `/e-learning/mypage/purchases`
- 前提: ログイン済み
- 確認内容: 購入履歴一覧または空状態が表示される
- ステータス: 📋 未着手

#### SC-SMK-011c: B011 新マイページ購入履歴表示（`/e-learning/lp/mypage/purchases`）
- 対象URL: `/e-learning/lp/mypage/purchases`
- 前提: ログイン済み
- 確認内容:
  - h1「購入履歴」が表示される
  - MyPageSidebarClient（マイページナビ）が表示される
  - 購入履歴0件でも 200 OK（EmptyState 表示）
- ステータス: 📋 未着手

#### SC-SMK-012: B012 マイページブックマーク表示
- 対象URL: `/e-learning/mypage/bookmarks`
- 前提: ログイン済み
- 確認内容: ブックマーク一覧または空状態が表示される
- ステータス: 📋 未着手

#### SC-SMK-012c: B012 新マイページブックマーク表示（`/e-learning/lp/mypage/bookmarks`）
- 対象URL: `/e-learning/lp/mypage/bookmarks`
- 前提: ログイン済み
- 確認内容:
  - h1「ブックマーク」が表示される
  - MyPageSidebarClient が表示される
  - ブックマーク0件でも 200 OK（EmptyState 表示）
- ステータス: 📋 未着手

#### SC-SMK-013: B013 マイページ視聴履歴表示
- 対象URL: `/e-learning/mypage/progress`
- 前提: ログイン済み
- 確認内容: 視聴履歴一覧または空状態が表示される
- ステータス: 📋 未着手

#### SC-SMK-013c: B013 新マイページ視聴履歴表示（`/e-learning/lp/mypage/progress`）
- 対象URL: `/e-learning/lp/mypage/progress`
- 前提: ログイン済み
- 確認内容:
  - h1「視聴履歴」が表示される
  - MyPageSidebarClient が表示される
  - 視聴履歴0件でも 200 OK（EmptyState 表示）
- ステータス: 📋 未着手

#### SC-SMK-014: B014 マイページプロフィール表示
- 対象URL: `/e-learning/mypage`
- 前提: ログイン済み
- 確認内容: プロフィール情報・退会導線が表示される
- ステータス: 📋 未着手

#### SC-SMK-014c: B014 新マイページ プロフィール表示（`/e-learning/lp/mypage`）
- 対象URL: `/e-learning/lp/mypage`
- 前提: ログイン済み
- 確認内容:
  - h1「プロフィール」が表示される
  - Avatar（イニシャルまたは Google アバター画像）が表示される
  - 表示名・登録日が表示される
  - h2「アカウントの退会」セクション + 「退会する」ボタンが表示される
  - MyPageSidebar の「プロフィール」リンクが `aria-current="page"` になっている
- ステータス: 📋 未着手

#### SC-SMK-014d: B014 新マイページ プロフィール has_full_access バナー表示
- 対象URL: `/e-learning/lp/mypage`
- 前提: ログイン済み・`has_full_access=true` のユーザー
- 確認内容:
  - `role="status"` の全コンテンツ視聴権限バナー（「全コンテンツ視聴権限あり」）が表示される
- ステータス: 📋 未着手

### Eラーニング 管理

#### SC-SMK-015: C001 管理 単体動画一覧表示
- 対象URL: `/admin/e-learning`
- 前提: 管理者ログイン済み
- 確認内容: 単体動画一覧テーブル・新規ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-015b: C001 管理 単体動画一覧 削除済フィルタ選択肢が存在する
- 対象URL: `/admin/e-learning`
- 前提: 管理者ログイン済み
- 確認内容:
  - 公開状態 Select に「削除済」選択肢が存在する（publishFilter の `<option value="deleted">`）
  - デフォルト表示（publishFilter=published/draft）では削除済コンテンツ行は表示されない
- ステータス: 📋 未着手

#### SC-SMK-016: C002 管理 単体動画新規作成画面表示
- 対象URL: `/admin/e-learning/new`
- 前提: 管理者ログイン済み
- 確認内容: 登録フォームが表示される
- ステータス: 📋 未着手

#### SC-SMK-016b: C002 管理 単体動画新規作成フォームに stripe_price_id 入力欄が表示される
- 対象URL: `/admin/e-learning/new`
- 前提: 管理者ログイン済み
- 確認内容:
  - `placeholder="price_xxx"` の stripe_price_id 入力欄が表示される
  - is_free チェックボックスが OFF（有料）のとき、stripe_price_id 入力欄が有効（disabled でない）
- ステータス: 📋 未着手

#### SC-SMK-017: C003 管理 単体動画編集画面表示
- 対象URL: `/admin/e-learning/[id]/edit`（テスト用）
- 前提: 管理者ログイン済み
- 確認内容: 編集フォームが表示される
- ステータス: 📋 未着手

#### SC-SMK-017b: C003 管理 単体動画編集フォームに stripe_price_id 入力欄が表示される
- 対象URL: `/admin/e-learning/[id]/edit`（既存テスト用動画の ID）
- 前提: 管理者ログイン済み・既存動画の編集画面
- 確認内容:
  - `placeholder="price_xxx"` の stripe_price_id 入力欄が表示される
  - is_free チェックボックスが OFF（有料）のとき、stripe_price_id 入力欄が有効（disabled でない）
- ステータス: 📋 未着手

#### SC-SMK-018: C004 管理 カテゴリ管理表示
- 対象URL: `/admin/e-learning/categories`
- 前提: 管理者ログイン済み
- 確認内容: カテゴリ一覧・新規ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-018b: C004 管理 カテゴリ管理 状態フィルタ選択肢が存在する
- 対象URL: `/admin/e-learning/categories`
- 前提: 管理者ログイン済み
- 確認内容:
  - h1「カテゴリ管理」が表示される
  - 状態フィルタ Select に「すべて（削除済を除く）」「有効のみ」「無効のみ」「削除済のみ」の4選択肢が存在する
  - 件数表示「N / M 件」が表示される
  - デフォルト（statusFilter=''）では削除済カテゴリが一覧に表示されない
- ステータス: 📋 未着手

#### SC-SMK-019: C005 管理 コース一覧表示
- 対象URL: `/admin/e-learning/courses`
- 前提: 管理者ログイン済み
- 確認内容: コース一覧テーブル・新規ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-019b: C005 管理 コース一覧表示（実装済みの新 path）
- 対象URL: `/admin/e-learning/courses`
- 前提: 管理者ログイン済み
- 確認内容:
  - AdminPageHeader「コース管理」タイトルが表示される
  - 「新規作成」ボタン（href: `/admin/e-learning/courses/new`）が表示される
  - ステータス Select・カテゴリ Select フィルタが表示される
  - AdminDataTable（コース一覧行、またはコースゼロ時の空状態）が表示される
- ステータス: 📋 未着手

#### SC-SMK-020: C006 管理 コース新規作成画面表示
- 対象URL: `/admin/e-learning/courses/new`
- 前提: 管理者ログイン済み
- 確認内容: 基本情報・カリキュラム・資料の各タブが表示される
- ステータス: 📋 未着手

#### SC-SMK-020b: C006 管理 コース新規作成画面表示（実装済みの新 path）
- 対象URL: `/admin/e-learning/courses/new`
- 前提: 管理者ログイン済み
- 確認内容:
  - AdminPageHeader「コース新規作成」タイトルが表示される
  - 「一覧に戻る」ボタン（href: `/admin/e-learning/courses`）が表示される
  - CourseFormClient が表示される（タイトル・スラッグ・カテゴリ・説明・価格の各入力欄）
  - 「作成する」送信ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-021: C007 管理 コース編集画面表示
- 対象URL: `/admin/e-learning/courses/[id]/edit`（テスト用）
- 前提: 管理者ログイン済み
- 確認内容: 編集フォーム（タブ付き）が表示される
- ステータス: 📋 未着手

#### SC-SMK-021b: C007/C008 管理 コース編集画面 基本情報タブ表示
- 対象URL: `/admin/e-learning/courses/[id]/edit`（dev-seed の dummy-ai-intro 等の ID を使用）
- 前提: 管理者ログイン済み・dev-seed のダミーコースが存在する
- 確認内容:
  - AdminPageHeader「コース編集」タイトルが表示される
  - Tabs（「基本情報」「カリキュラム」の TabsTrigger）が表示される
  - 「基本情報」タブがデフォルトで選択されており、CourseFormClient が表示される
  - 「保存する」ボタンと「論理削除」ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-021c: C008 管理 コース編集画面 カリキュラムタブ表示
- 対象URL: `/admin/e-learning/courses/[id]/edit`（dev-seed のダミーコース ID）
- 前提: 管理者ログイン済み・dev-seed のダミーコース（章・動画あり）が存在する
- 操作: 「カリキュラム」タブをクリック
- 確認内容:
  - CurriculumEditorClient が表示される
  - 既存章リスト（GripVertical DnD ハンドル・章名 Input・Trash2 削除ボタン）が表示される
  - 章内動画行（タイトル・is_free Switch・「編集」ボタン・削除ボタン）が表示される
  - 「新しい章を追加」フォーム + 「章を追加」ボタンが表示される
- ステータス: 📋 未着手

#### SC-SMK-022: C009 管理 購入履歴表示
- 対象URL: `/admin/e-learning/purchases`
- 前提: 管理者ログイン済み
- 確認内容: 購入履歴テーブル・絞り込みが表示される
- ステータス: 📋 未着手

#### SC-SMK-022b: C009 管理 購入履歴画面表示（実装済み）
- 対象URL: `/admin/e-learning/purchases`
- 前提: 管理者ログイン済み
- 確認内容:
  - AdminPageHeader「購入履歴」タイトルが表示される
  - AdminPurchasesFilterClient（ステータス / 購入対象 / 日付範囲 / ユーザー検索フィルタ）が表示される
  - AdminDataTable（ユーザー・購入対象・金額・ステータス・購入日時・Stripe Session 列）が表示される（またはゼロ件の空状態）
  - テーブルが読み取り専用（編集ボタンなし）であることを確認
- ステータス: 📋 未着手

#### SC-SMK-023: C010 管理 ユーザー管理表示
- 対象URL: `/admin/e-learning/users`
- 前提: 管理者ログイン済み
- 確認内容: ユーザー一覧・has_full_access 切替が表示される
- ステータス: 📋 未着手

#### SC-SMK-023b: C010 管理 フルアクセスユーザー管理画面表示（実装済み）
- 対象URL: `/admin/e-learning/users`
- 前提: 管理者ログイン済み
- 確認内容:
  - AdminPageHeader「フルアクセスユーザー管理」タイトルが表示される
  - AdminUsersFilterClient（フルアクセス Select・メール/名前 検索）が表示される
  - AdminDataTable（Avatar・表示名/メール・フルアクセス Badge・操作ボタン列）が表示される（またはゼロ件の空状態）
- ステータス: 📋 未着手

#### SC-SMK-024: C011 管理 レガシー購入履歴表示
- 対象URL: `/admin/e-learning/legacy-purchases`
- 前提: 管理者ログイン済み
- 確認内容: レガシー購入履歴テーブルが表示される（読み取り専用）
- ステータス: 📋 未着手

#### SC-SMK-024b: C011 管理 レガシー購入レコード一覧 読み取り専用確認（実装済み）
- 対象URL: `/admin/e-learning/legacy-purchases`
- 前提: 管理者ログイン済み
- 確認内容:
  - AdminPageHeader「レガシー購入レコード」タイトルが表示される
  - AdminDataTable にユーザー・金額・ステータス・元購入日時・退避日時・詳細ボタン列が表示される
  - 編集ボタン・削除ボタンが存在しないこと（読み取り専用）
  - 各行に「詳細」ボタン（Ghost variant）が表示される
- ステータス: 📋 未着手

### アクセス制御

#### SC-SMK-025: 未ログインで会員ページへ直アクセス → リダイレクト
- 対象URL: `/e-learning/home`（未ログイン）
- 確認内容: `/auth/login?returnTo=/e-learning/home` にリダイレクトされる
- ステータス: 📋 未着手

#### SC-SMK-026: 非管理者で管理画面へ直アクセス → リダイレクト
- 対象URL: `/admin/e-learning`（一般ログイン済み）
- 確認内容: `/auth/login` にリダイレクトされる
- ステータス: 📋 未着手

---

## サマリ

| 状態 | 件数 |
|------|------|
| 📋 未着手 | 53 |
| 🔧 実装中 | 0 |
| ✅ 完了 | 0 |
| **合計** | **53** |
