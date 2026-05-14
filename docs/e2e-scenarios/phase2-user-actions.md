# Phase 2：ユーザーアクションテスト（CRUD・フォーム・画面遷移）

## 目的

各画面で **ユーザーが実際に行う操作** を検証する。
- フォーム入力・バリデーション
- 登録・更新・削除（CRUD）
- 画面遷移
- 検索・絞り込み・フィルタ

業務一気通貫のフロー（複数画面跨ぎ）は Phase 3 で扱う。

## シナリオ作成方針

- 画面ごとに「主要操作」をシナリオ化
- ID 体系：`SC-UAT-{連番3桁}`
- 1画面につき 5〜20件のシナリオが目安

## シナリオ一覧（カテゴリ別）

### 認証（A001）

#### SC-UAT-001: ログイン成功 → B002 会員ホームへリダイレクト
- 対象URL: `/auth/login`
- 操作: Google OAuth でログイン
- 期待結果: `/e-learning/home` にリダイレクト
- ステータス: 📋 未着手

#### SC-UAT-002: returnTo クエリ付きログイン → 指定パスへリダイレクト
- 対象URL: `/auth/login?returnTo=/e-learning/courses`
- 操作: Google OAuth でログイン
- 期待結果: `/e-learning/courses` にリダイレクト
- ステータス: 📋 未着手

#### SC-UAT-003: returnTo クエリに外部URLを指定 → フォールバック
- 対象URL: `/auth/login?returnTo=https://evil.example.com`
- 操作: Google OAuth でログイン
- 期待結果: `/e-learning/home` にフォールバック（不正URLを無視）
- ステータス: 📋 未着手

### Eラーニング LP（B001）

#### SC-UAT-010: LP → ログイン CTA クリック → ログイン画面へ遷移
- 対象URL: `/e-learning`（未ログイン）
- 操作: 「コースを見る」CTA ボタンをクリック
- 期待結果: `/auth/login?returnTo=/e-learning/home` へ遷移
- ステータス: 📋 未着手

#### SC-UAT-011: LP ログイン済みで直アクセス → B002 へ自動遷移
- 対象URL: `/e-learning`（ログイン済み）
- 操作: URL に直アクセス
- 期待結果: `/e-learning/home` へリダイレクト
- ステータス: 📋 未着手

### 会員ホーム・一覧（B002/B003/B006）

#### SC-UAT-020: B002 コースタブ → B003 コース一覧へ遷移
- 対象URL: `/e-learning/home`
- 操作: コースタブをクリック
- 期待結果: `/e-learning/courses` へ遷移
- ステータス: 📋 未着手

#### SC-UAT-021: B002 単体動画タブ → B006 単体動画一覧へ遷移
- 対象URL: `/e-learning/home`
- 操作: 単体動画タブをクリック
- 期待結果: `/e-learning/videos` へ遷移
- ステータス: 📋 未着手

#### SC-UAT-022: B003 コース一覧 カテゴリフィルタ
- 対象URL: `/e-learning/courses`
- 操作: カテゴリフィルタを選択
- 期待結果: 該当カテゴリのコースのみ一覧表示される
- ステータス: 📋 未着手

#### SC-UAT-023: B003 コース一覧 無料／有料フィルタ
- 対象URL: `/e-learning/courses`
- 操作: 無料フィルタを選択
- 期待結果: is_free のコースのみ表示される
- ステータス: 📋 未着手

### 新コース一覧・新単体動画一覧 フィルタ操作（B002/B003 — `/e-learning/lp/courses` / `/e-learning/lp/videos`）

#### SC-UAT-024: 新コース一覧 カテゴリチップ選択 → URL query 反映
- 対象URL: `/e-learning/lp/courses`
- 操作: カテゴリチップをクリック
- 期待結果: URL が `?categories={id}` に更新され、Server 再 fetch でカテゴリ一致コースのみ表示される
- 補足: 複数チップ選択時は `?categories=id1,id2` のカンマ区切り
- ステータス: 📋 未着手

#### SC-UAT-025: 新コース一覧 キーワード入力 → 300ms debounce 後に URL query 反映
- 対象URL: `/e-learning/lp/courses`
- 操作: キーワード Input に文字を入力
- 期待結果: 入力から 300ms 後に URL が `?q={keyword}` に更新され、一致コースのみ表示される
- 補足: 入力クリア時は `?q=` が URL から削除される
- ステータス: 📋 未着手

#### SC-UAT-026: 新コース一覧 無料/有料フィルタ切替 → URL query 反映
- 対象URL: `/e-learning/lp/courses`
- 操作: 「無料」フィルタを選択
- 期待結果: URL が `?free=free` に更新され、is_free のコースのみ表示される
- 補足: 「すべて」選択時は `?free=` が URL から削除される
- ステータス: 📋 未着手

#### SC-UAT-027: 新単体動画一覧 カテゴリ・フィルタ操作（B003 と対称）
- 対象URL: `/e-learning/lp/videos`
- 操作: カテゴリチップ選択 → 無料フィルタ選択 → キーワード入力
- 期待結果: 各操作で URL query が更新され、Server 再 fetch で絞り込み結果が表示される（SC-UAT-024〜026 と同仕様）
- ステータス: 📋 未着手

### 新コース詳細（B004 — `/e-learning/lp/courses/[slug]`）

#### SC-UAT-036: B004 カリキュラム Accordion 展開 → 動画行クリックで B005 へ遷移
- 対象URL: `/e-learning/lp/courses/[slug]`（視聴権限あり）
- 操作: カリキュラム章タイトルをクリックして展開 → 動画行リンクをクリック
- 期待結果: `/e-learning/lp/courses/[slug]/videos/[videoId]` へ遷移する
- ステータス: 📋 未着手

#### SC-UAT-037: B004「最初から見る」→「続きから見る」の CTA 切替
- 対象URL: `/e-learning/lp/courses/[slug]`（視聴権限あり）
- 前提: 未視聴状態では「最初から見る」が表示されている
- 操作: B005 で1本視聴完了してから B004 に戻る
- 期待結果: CTA が「続きから見る」に変わり、次の未視聴動画 ID へのリンクになっている
- ステータス: 📋 未着手

#### SC-UAT-038: B004 進捗表示 — 視聴完了後に進捗数が更新される
- 対象URL: `/e-learning/lp/courses/[slug]`（視聴権限あり・totalVideos > 0）
- 操作: B005 で1本視聴完了後に B004 を再訪
- 期待結果: 「進捗：X / N 本（X%）」の表示が更新されている
- ステータス: 📋 未着手

### 新コース内動画視聴（B005 — `/e-learning/lp/courses/[slug]/videos/[videoId]`）

#### SC-UAT-039: B005「視聴完了にする」ボタン → 「視聴済」表示 + コース完了時メッセージ
- 対象URL: `/e-learning/lp/courses/[slug]/videos/[videoId]`（視聴権限あり・未視聴）
- 操作: 「視聴完了にする」ボタンをクリック
- 期待結果（3点）:
  1. ボタンが「視聴済」に切り替わり（disabled）、再クリック不可になる
  2. 全動画完了時はボタン下に「コースをすべて視聴しました」が表示される
  3. ページリロード後も「視聴済」状態が維持される（revalidatePath で Server 再生成）
- ステータス: 📋 未着手

#### SC-UAT-040: B005 左サイドバー 視聴済アイコン反映
- 対象URL: `/e-learning/lp/courses/[slug]/videos/[videoId]`（視聴完了後）
- 確認: サイドバーの当該動画行に ProgressCheckIcon（completed）が表示される
- ステータス: 📋 未着手

#### SC-UAT-041: B005「次のレッスン」ボタン → 次動画に遷移
- 対象URL: `/e-learning/lp/courses/[slug]/videos/[videoId]`（末尾でない動画）
- 操作: 「次のレッスン」ボタンをクリック
- 期待結果: 次の videoId の B005 ページへ遷移する
- ステータス: 📋 未着手

### コース詳細・視聴（B004/B005）

#### SC-UAT-030: B004 コース詳細 ブックマーク追加
- 対象URL: `/e-learning/courses/[slug]`（ログイン済み）
- 操作: ブックマークアイコンをクリック
- 期待結果: アイコンがアクティブ状態に変わる・B012 に追加される
- ステータス: 📋 未着手

#### SC-UAT-031: B004 コース詳細 ブックマーク解除
- 対象URL: `/e-learning/courses/[slug]`（ブックマーク済み）
- 操作: ブックマークアイコンを再クリック
- 期待結果: アイコンが非アクティブ状態に戻る
- ステータス: 📋 未着手

#### SC-UAT-032: B004 未購入有料コース → 購入確認モーダルが開く（B008）
- 対象URL: `/e-learning/courses/[slug]`（未購入・有料）
- 操作: 「購入する」CTAをクリック
- 期待結果: 購入確認モーダルが表示される
- ステータス: 📋 未着手

#### SC-UAT-042b: B004 新「購入する」ボタン → URL に `?purchase=1` 付与 + モーダル open
- 対象URL: `/e-learning/lp/courses/[slug]`（未購入・有料・ログイン済み）
- 操作: 「購入する」ボタンをクリック
- 期待結果（2点）:
  1. URL が `/e-learning/lp/courses/[slug]?purchase=1` に変わる（router.push）
  2. PurchasePromptModalV2 Dialog が open し、コースタイトルと価格が表示される
- ステータス: 📋 未着手

#### SC-UAT-042c: B004 新モーダル「キャンセル」→ close + URL から `?purchase` 除去
- 前提: `/e-learning/lp/courses/[slug]?purchase=1` の状態（SC-UAT-042b 後）
- 操作: モーダル内「キャンセル」ボタン（または Dialog の閉じる操作）をクリック
- 期待結果（2点）:
  1. Dialog が閉じる
  2. URL が `/e-learning/lp/courses/[slug]`（`?purchase` なし）に戻る（router.replace）
- ステータス: 📋 未着手

#### SC-UAT-035: B007 視聴完了ボタン → 「視聴済」表示に切り替わり・再読み込みで維持
- 対象URL: `/e-learning/[id]`（テスト用動画・視聴権限あり）
- 操作: 「視聴完了」ボタンをクリック
- 期待結果（3点）:
  1. ボタンが即座に「視聴済」表示に切り替わる
  2. ページをリロードしても「視聴済」状態が維持される（revalidatePath で Server 再生成確認）
  3. 同じ動画を再度クリックしても completed_at は上書きされない（N6/N7 仕様）
- ステータス: 📋 未着手

#### SC-UAT-033: B005 動画視聴 → 進捗マーク
- 対象URL: `/e-learning/courses/[slug]/videos/[videoId]`
- 操作: 動画を最後まで視聴（または完了ボタンをクリック）
- 期待結果: 視聴済みアイコンが表示される・B013 に記録される
- ステータス: 📋 未着手

#### SC-UAT-034: B005 次レッスンへ遷移
- 対象URL: `/e-learning/courses/[slug]/videos/[videoId]`
- 操作: 「次レッスン」ボタンをクリック
- 期待結果: 次の動画ページへ遷移する
- ステータス: 📋 未着手

### 購入フロー（B008/B009/B010）

#### SC-UAT-040: B008 購入確認モーダル → Stripe Checkout へ遷移
- 前提: 有料コース詳細（B004）でモーダルを開いた状態
- 操作: 購入確認ボタンをクリック
- 期待結果: Stripe Checkout ページへリダイレクト
- ステータス: 📋 未着手

#### SC-UAT-041: B009 購入完了 Webhook 反映済みケース
- 対象URL: `/e-learning/checkout/complete?session_id=...`（反映済み）
- 確認内容: 購入した動画/コースへの導線が即時表示される
- ステータス: 📋 未着手

#### SC-UAT-042: B009 購入完了 ポーリングケース（Webhook 未反映→反映）
- 対象URL: `/e-learning/checkout/complete?session_id=...`（未反映→反映）
- 確認内容: スピナー表示後、反映確認でコース導線が表示される
- ステータス: 📋 未着手

#### SC-UAT-043: B010 購入キャンセル → コース詳細へ戻る
- 対象URL: `/e-learning/checkout/cancel`
- 操作: 「コースに戻る」ボタンをクリック
- 期待結果: 元のコース詳細（B004）へ遷移
- ステータス: 📋 未着手

#### SC-UAT-043b: 新 B010 購入キャンセル画面 → 一覧への導線確認
- 対象URL: `/e-learning/lp/checkout/cancel`
- 確認内容: 「コース一覧へ」ボタンクリック → `/e-learning/lp/courses` へ遷移
- 補足: 「単体動画一覧へ」クリック → `/e-learning/lp/videos` へ遷移する導線も確認
- ステータス: 📋 未着手

### マイページ（B011/B012/B013/B014）

#### SC-UAT-050: B011 has_full_access=true ユーザー → 専用バナー表示
- 対象URL: `/e-learning/mypage/purchases`（has_full_access=true）
- 確認内容: FullAccessBanner「全コンテンツ視聴権限を取得済みです」が表示される
- ステータス: 📋 未着手

#### SC-UAT-051: B012 ブックマーク一覧 → ブックマーク解除
- 対象URL: `/e-learning/mypage/bookmarks`
- 操作: ブックマーク解除ボタンをクリック
- 期待結果: 一覧からアイテムが消える
- ステータス: 📋 未着手

#### SC-UAT-052: B014 退会導線クリック → 確認ダイアログ表示
- 対象URL: `/e-learning/mypage`
- 操作: 退会ボタンをクリック
- 期待結果: 確認ダイアログが表示される
- ステータス: 📋 未着手

### 新マイページ（B011/B012/B013 — `/e-learning/lp/mypage/**`）

#### SC-UAT-053: B011 新購入履歴 has_full_access=true → FullAccessBanner 表示
- 対象URL: `/e-learning/lp/mypage/purchases`（has_full_access=true ユーザー）
- 確認内容:
  - `role="status"` のバナー「全コンテンツ視聴権限を取得済みです」が表示される
  - 「コース一覧へ」リンクが `/e-learning/lp/courses` を向いている
- ステータス: 📋 未着手

#### SC-UAT-054: B011 新購入履歴「視聴する」→ B004 / B007 へ遷移
- 対象URL: `/e-learning/lp/mypage/purchases`（completed 購入あり）
- 操作: 購入済みコース行の「視聴する」ボタンをクリック
- 期待結果: `/e-learning/lp/courses/[slug]` に遷移する
- 補足: 単体動画購入なら `/e-learning/[id]` へ遷移
- ステータス: 📋 未着手

#### SC-UAT-055: B012 新ブックマーク「解除」→ 行が楽観的に非表示 + リロード後も復活しない
- 対象URL: `/e-learning/lp/mypage/bookmarks`（ブックマーク1件以上）
- 操作: ブックマーク行の解除ボタン（BookmarkX アイコン）をクリック
- 期待結果（2点）:
  1. ボタンクリック後、該当行が即座に非表示になる（楽観的更新）
  2. ページをリロードしても行が復活しない（DB 削除確認）
  （クリーンアップ：テスト用ブックマークはテスト前に作成・解除で完結）
- ステータス: 📋 未着手

#### SC-UAT-056: B013 新視聴履歴 コース別 ProgressBar + 「次のレッスン」→ B005 へ遷移
- 対象URL: `/e-learning/lp/mypage/progress`（コース進捗あり）
- 確認内容:
  - コース行に ProgressBar が表示され、「completed/total（pct%）」が表示される
  - 「次のレッスン」ボタンをクリック → `/e-learning/lp/courses/[slug]/videos/[videoId]` に遷移する
  - コース完了時はボタンが「もう一度視聴」表示になる
- ステータス: 📋 未着手

#### SC-UAT-057: マイページサイドバー active 強調（aria-current="page"）
- 前提: ログイン済み
- 操作: `/e-learning/lp/mypage/purchases` にアクセス
- 確認内容:
  - サイドバーの「購入履歴」リンクに `aria-current="page"` が付いている
  - 他の3リンク（ブックマーク・視聴履歴・プロフィール）には `aria-current` が付いていない
- 補足: B012/B013 でも同様の active 強調が機能することを確認
- ステータス: 📋 未着手

#### SC-UAT-058: B014 退会ダイアログ → 開く
- 対象URL: `/e-learning/lp/mypage`
- 前提: ログイン済み
- 操作: 「退会する」ボタンをクリック
- 確認内容:
  - 退会確認 Dialog が開く
  - DialogTitle「退会の確認」が表示される
  - 3つの確認事項（ブックマーク・視聴履歴は削除、購入履歴は保持、再登録時の視聴権限引継ぎ）が箇条書きで表示される
  - 「キャンセル」「退会を確定する」2ボタンが表示される
- ステータス: 📋 未着手

#### SC-UAT-059: B014 退会ダイアログ → キャンセルで閉じる
- 対象URL: `/e-learning/lp/mypage`
- 前提: ログイン済み・退会 Dialog open 状態
- 操作: 「キャンセル」ボタンをクリック
- 確認内容:
  - Dialog が閉じる
  - `/e-learning/lp/mypage` に留まっている
  - セッションは維持されている（ヘッダー等でログイン状態確認）
- ステータス: 📋 未着手

#### SC-UAT-060: B014 退会確定 → POST /api/me/withdraw → セッション破棄 → B001 LP へリダイレクト
- 対象URL: `/e-learning/lp/mypage`
- 前提: **`[TEST_WITHDRAW]` 接頭辞付きテスト専用アカウント**（テスト実施前に Google OAuth で新規作成）でログイン
- 操作: 「退会する」ボタン → Dialog 内「退会を確定する」ボタンをクリック
- 確認内容:
  - loading 状態中（Loader2 スピナー + 「退会処理中...」）がボタン上に表示される
  - POST /api/me/withdraw が 200 で返る
  - supabase.auth.signOut が呼ばれた後、`window.location.href = '/e-learning/lp'` でフルリロードされる
  - `/e-learning/lp` に遷移し、未ログイン状態（ログインボタン表示等）になっている
  - `/e-learning/lp/mypage` に直アクセスすると `/auth/login?returnTo=...` にリダイレクトされる（セッション破棄確認）
- 補足:
  - **破壊的テスト（アカウント削除）のため `[TEST_WITHDRAW]` 専用アカウントのみ使用**
  - **既存 109 名の e_learning_users（人作成データ）は絶対に対象にしない**
  - テスト終了後のクリーンアップは不要（退会処理自体がアカウント削除）
- ステータス: 📋 未着手

#### SC-UAT-061: B014 退会後に同一アカウントで再ログイン → has_full_access が維持されている
- 対象URL: `/auth/login` → `/e-learning/lp/mypage`
- 前提:
  - **`[TEST_WITHDRAW_FA]` 接頭辞付きテスト専用アカウント**（テスト前に作成・`has_full_access=true` を管理者が手動付与または DB で直接設定）
  - 退会後（SC-UAT-060 実施後の同アカウント）の状態
- 操作: 退会後に同じメールアドレスで再ログイン → `/e-learning/lp/mypage` にアクセス
- 確認内容:
  - `role="status"` の全コンテンツ視聴権限バナー（「全コンテンツ視聴権限あり」）が表示される（has_full_access が再ログイン後も保持）
  - 購入履歴が残っている（税務上保持）
- 補足:
  - **`[TEST_WITHDRAW_FA]` 専用アカウントのみ使用。既存 109 名は touch しない**
  - has_full_access 付与は C010 管理画面（SC-UAT-081）経由または DB 直接設定で行う
- ステータス: 📋 未着手

### B009 購入完了画面 ポーリング

#### SC-UAT-065: B009 ポーリング成功 → Webhook 反映後に「視聴を開始する」リンク表示
- 対象URL: `/e-learning/lp/checkout/complete?session_id={stripe_cs_test_xxx}`
- 前提:
  - ログイン済み・課金 flow 完了済み（Stripe テストモードで Checkout Session 作成済み）
  - POST /api/stripe/webhook（checkout.session.completed）が受信済みで e_learning_purchases に INSERT 済みの状態
  - session_id はテスト Stripe Dashboard から取得
- 操作: URL にアクセス（session_id クエリ付き）
- 確認内容:
  - 初期表示でポーリングスピナー（`role="status"` の Loader2）と「決済反映処理中です」メッセージが表示される
  - 2 秒以内に `/api/me/access` のレスポンスに target_id が含まれ、`CheckCircle2` アイコン + 「決済が反映されました。視聴を開始できます。」が表示される
  - 「視聴を開始する」リンクが target に応じた href（コース: `/e-learning/lp/courses/[slug]`・単体動画: `/e-learning/[id]`）を持つ
- 補足: **Stripe テストモード必須。ローカルで `stripe listen --forward-to localhost:3000/api/stripe/webhook` を先に起動しておくこと**
- ステータス: 📋 未着手

#### SC-UAT-066: B009 ポーリングタイムアウト（10 回経過後の案内表示）
- 対象URL: `/e-learning/lp/checkout/complete?session_id={stripe_cs_test_xxx}`
- 前提:
  - ログイン済み・Stripe Checkout Session は存在するが Webhook がまだ届いていない状態
  - （テスト方法：`stripe trigger` を使わず、または Webhook 転送を停止して session_id だけ付与してアクセス）
- 操作: URL にアクセス → ポーリングを 20 秒間待つ
- 確認内容:
  - ポーリング中は `確認中… N/10` カウンタが更新される（N=1〜9）
  - 10 回（約 20 秒）経過後、`AlertCircle` アイコン + 「決済反映が遅延しています。」メッセージが表示される
  - 「マイページへ」（href: `/e-learning/lp/mypage/purchases`）と「お問い合わせ」（href: `/contact`）2 ボタンが表示される
- 補足: **Webhook 転送を意図的にブロックして再現。ループスピナーが「視聴を開始する」に切り替わらないことを確認**
- ステータス: 📋 未着手

### 管理画面 単体動画（C001/C002/C003）

#### SC-UAT-060: C001 単体動画一覧 検索フィルタ
- 対象URL: `/admin/e-learning`
- 操作: 検索ボックスにキーワード入力
- 期待結果: 該当する動画のみ表示される
- ステータス: 📋 未着手

#### SC-UAT-061: C002 単体動画 新規作成 → 一覧に反映
- 対象URL: `/admin/e-learning/new`
- 操作: 必須項目入力 → 登録
- 期待結果: C001 一覧に新規動画が表示される
- ステータス: 📋 未着手

#### SC-UAT-062: C002 単体動画 新規作成 バリデーション（必須漏れ）
- 操作: タイトル空欄で登録ボタン押下
- 期待結果: バリデーションエラーが表示される
- ステータス: 📋 未着手

#### SC-UAT-063: C003 単体動画 編集 → 変更保存
- 対象URL: `/admin/e-learning/[id]/edit`
- 操作: タイトルを変更 → 保存
- 期待結果: 変更が反映される
- ステータス: 📋 未着手

#### SC-UAT-064: C003 単体動画 論理削除
- 操作: 削除ボタンをクリック → 確認ダイアログで確定
- 期待結果: 一覧から消える（deleted_at が設定される）
- ステータス: 📋 未着手

#### SC-UAT-091: C001 管理 単体動画一覧 「削除済」フィルタ選択 → 削除済バッジ行のみ表示
- 対象URL: `/admin/e-learning`
- 前提: 管理者ログイン済み・**テストで `[TEST_CONTENT]` 接頭辞コンテンツを新規作成し削除済み（deleted_at あり）にした状態**（SC-UAT-064 の流れで作成・削除）
- 操作: 公開状態 Select を「削除済」に変更（`publishFilter = 'deleted'`）
- 確認内容:
  - URL に `?publishFilter=deleted`（またはクライアント状態の変化）が反映される
  - 削除済（deleted_at あり）コンテンツ行のみ表示される
  - 各行に「削除済」赤バッジ（`bg-red-100 text-red-800`）が表示される
  - 通常公開・下書きコンテンツ行が表示されない
- 補足:
  - **`[TEST_CONTENT]` のみ対象。既存 15 件の動画（人作成データ）を削除しないこと**
  - このシナリオの確認後、「すべて」または「下書き」に戻して非削除コンテンツが再表示されることも確認
- ステータス: 📋 未着手

#### SC-UAT-092: C001 管理 単体動画一覧 削除済フィルタ以外では削除済行が非表示
- 対象URL: `/admin/e-learning`
- 前提: 管理者ログイン済み・deleted_at ありのコンテンツ（`[TEST_CONTENT]` またはすでに削除済みの既存データ）が DB に存在する
- 操作: 公開状態 Select が「公開中」「下書き」「すべて（削除済以外）」の各状態
- 確認内容:
  - 「削除済」以外のフィルタでは deleted_at ありの行がテーブルに表示されない（クライアント側フィルタの動作）
  - 「削除済」に切り替えた場合のみ削除済行が出現する
- 補足: 既存 15 件の動画に deleted_at があれば実コンテンツで確認可能（既存データは削除しない・読み取りのみ）
- ステータス: 📋 未着手

#### SC-UAT-093: C002 単体動画 新規作成 stripe_price_id を入力して保存 → DB に反映
- 対象URL: `/admin/e-learning/new`
- 前提: 管理者ログイン済み
- 操作:
  1. タイトル `[TEST_CONTENT_STRIPE]`・is_free=false（有料）を設定
  2. stripe_price_id 入力欄に `price_test_xxx` を入力
  3. 登録ボタンをクリック
- 確認内容:
  - 送信後 C001 一覧に `[TEST_CONTENT_STRIPE]` が表示される
  - `/admin/e-learning/[id]/edit` で編集画面を開くと stripe_price_id 欄に `price_test_xxx` が入っている（DB 反映確認）
- 補足: **テスト終了後に `[TEST_CONTENT_STRIPE]` を SC-UAT-064 の論理削除手順でクリーンアップすること**
- ステータス: 📋 未着手

#### SC-UAT-094: C002/C003 単体動画フォーム is_free=true に切替 → stripe_price_id 欄が disabled になる
- 対象URL: `/admin/e-learning/new`（または `/admin/e-learning/[id]/edit`）
- 前提: 管理者ログイン済み
- 操作:
  1. is_free チェックボックスを ON（無料）に切り替える
- 確認内容:
  - stripe_price_id 入力欄が `disabled` 属性付きになり、`disabled:bg-gray-100 disabled:text-gray-400` のスタイルが適用される
  - is_free を OFF に戻すと stripe_price_id 欄が再び有効（入力可能）になる
- ステータス: 📋 未着手

#### SC-UAT-095: C003 単体動画 編集画面 stripe_price_id 変更 → 保存 → DB に反映
- 対象URL: `/admin/e-learning/[id]/edit`（SC-UAT-093 で作成した `[TEST_CONTENT_STRIPE]` の編集画面）
- 前提: 管理者ログイン済み・`[TEST_CONTENT_STRIPE]` が存在し stripe_price_id が `price_test_xxx` の状態
- 操作: stripe_price_id を `price_test_yyy` に変更 → 保存ボタンクリック
- 確認内容:
  - 保存後に編集画面を再度開くと stripe_price_id 欄に `price_test_yyy` が表示される（DB 反映確認）
  - 空文字に変更して保存した場合、DB 上の stripe_price_id が NULL になる（`.trim() || null` 動作確認）
- 補足: **`[TEST_CONTENT_STRIPE]`（SC-UAT-093 で作成したもの）のみ操作すること**
- ステータス: 📋 未着手

### 管理画面 コース（C005/C006/C007/C008）

#### SC-UAT-070: C006 コース新規作成 基本情報入力 → 保存
- 対象URL: `/admin/e-learning/courses/new`
- 操作: 基本情報タブで必須項目入力 → 保存
- 期待結果: C005 コース一覧に新規コースが表示される
- ステータス: 📋 未着手

#### SC-UAT-071: C008 カリキュラム編集 章追加
- 対象URL: `/admin/e-learning/courses/new`（カリキュラムタブ）
- 操作: 「章を追加」ボタンをクリック → 章名入力
- 期待結果: カリキュラムに章が追加される
- ステータス: 📋 未着手

#### SC-UAT-072: C008 カリキュラム編集 動画追加
- 操作: 章内で「動画を追加」→ 動画情報入力
- 期待結果: 章内に動画が追加される
- ステータス: 📋 未着手

#### SC-UAT-075: C005 管理コース一覧 ステータスフィルタ → 表示行が変わる
- 対象URL: `/admin/e-learning/courses`
- 前提: 管理者ログイン済み・**テストで `[TEST_COURSE]` 接頭辞コースを公開・下書き各1件作成済み**（テスト終了後にクリーンアップ）
- 操作:
  1. ステータス Select を「下書き」に変更 → URL `?status=draft` が付き、下書きコースのみ表示されることを確認
  2. ステータス Select を「すべて」に変更 → URL `?status=all` が付き、公開+下書き+削除済がすべて表示されることを確認
  3. ステータス Select を「公開中」に戻す → `?status` が URL から消え、公開中コースのみ表示されることを確認
- 確認内容: Select 変更のたびに URL query が更新され、テーブル行がフィルタ結果に応じて切り替わる
- ステータス: 📋 未着手

#### SC-UAT-076: C005 管理コース一覧 公開／非公開 Switch トグル → 楽観的 UI + DB 反映
- 対象URL: `/admin/e-learning/courses`（公開中コース行あり）
- 前提: 管理者ログイン済み・**テストで `[TEST_COURSE_PUB]` 接頭辞コース（is_published=true）を作成済み**（テスト終了後にクリーンアップ）
- 操作: `[TEST_COURSE_PUB]` 行の「公開」列 Switch を ON → OFF にクリック
- 確認内容:
  - Switch が即座に OFF に切り替わる（楽観的 UI）
  - toggleCoursePublishedAction が呼ばれ、DB 上の `is_published` が false になる（ページリロードで確認）
  - `/e-learning/lp/courses` にアクセスするとそのコースが非表示になる（revalidatePath 確認）
- 補足: **既存の公開中コース（人作成データ）には触れない。`[TEST_COURSE_PUB]` のみ操作すること**
- ステータス: 📋 未着手

#### SC-UAT-077: C006 コース新規作成 → 編集画面に `?created=1` 付きで遷移
- 対象URL: `/admin/e-learning/courses/new`
- 前提: 管理者ログイン済み
- 操作: タイトル `[TEST_NEW_COURSE]`・スラッグ `test-new-course-{timestamp}`・カテゴリを入力 → 「作成する」ボタンクリック
- 確認内容:
  - 送信中に Loader2 スピナー + 「保存中...」がボタン上に表示される
  - 成功後 `/admin/e-learning/courses/[新規ID]/edit?created=1` に遷移する
  - 編集画面の AdminPageHeader 説明文が「コースを作成しました。続けて公開設定や章の追加を行えます。」になっている
  - C005 一覧（`/admin/e-learning/courses`）に戻ると新規コースが表示される
- 補足: **テスト終了後に `[TEST_NEW_COURSE]` コースを SC-UAT-080 の論理削除テストで兼ねてクリーンアップ、または C007 編集画面から論理削除で除去すること**
- ステータス: 📋 未着手

#### SC-UAT-078: C006 コース新規作成 バリデーション（タイトル空欄）
- 対象URL: `/admin/e-learning/courses/new`
- 前提: 管理者ログイン済み
- 操作: タイトル欄を空欄のまま「作成する」ボタンクリック
- 確認内容:
  - `role="alert"` のエラーメッセージが表示される（「入力内容に不備があります。」等）
  - `/admin/e-learning/courses/[id]/edit` への遷移が起きない
- ステータス: 📋 未着手

#### SC-UAT-079: C007 コース基本情報更新 → 保存 → 公開 LP B004 にも反映
- 対象URL: `/admin/e-learning/courses/[id]/edit`（SC-UAT-077 で作成した `[TEST_NEW_COURSE]`）
- 前提: 管理者ログイン済み・`[TEST_NEW_COURSE]` コースが存在し is_published=true に設定されている
- 操作: タイトルを `[TEST_NEW_COURSE_UPDATED]` に変更 → 「保存する」ボタンクリック
- 確認内容:
  - 保存後、編集画面がリフレッシュされ変更後のタイトルが表示される
  - `/e-learning/lp/courses/[slug]` にアクセスすると変更後のタイトルが表示される（revalidatePath 確認）
- 補足: **既存コース（人作成データ）のタイトルは変更しない。`[TEST_NEW_COURSE]` のみ操作すること**
- ステータス: 📋 未着手

#### SC-UAT-080: C007 コース論理削除 → window.confirm → 一覧から非表示
- 対象URL: `/admin/e-learning/courses/[id]/edit`（SC-UAT-077 で作成した `[TEST_NEW_COURSE]`）
- 前提: 管理者ログイン済み・**テストで作成した `[TEST_NEW_COURSE]` コースが存在する**
- 操作: 「論理削除」ボタンをクリック → `window.confirm`「このコースを論理削除しますか？」で OK
- 確認内容:
  - confirm ダイアログが表示される
  - OK 後に削除処理中スピナーが表示される
  - softDeleteCourseAction 成功後、C005 一覧（`/admin/e-learning/courses`）にリダイレクトされる
  - C005 一覧のデフォルト表示（status=published）でそのコースが消えている
  - status=deleted フィルタに切り替えると「削除済」Badge 付きで表示される（deleted_at が設定されている）
- 補足:
  - **SC-UAT-077 で作成した `[TEST_NEW_COURSE]` コースを対象にすること**
  - **既存コース（人作成データ）には絶対に論理削除を実行しない**
  - このシナリオが SC-UAT-077〜080 の一連テストのクリーンアップ兼務
- ステータス: 📋 未着手

#### SC-UAT-073: C010 フルアクセスユーザー管理 has_full_access 切替
- 対象URL: `/admin/e-learning/users`
- 操作: ユーザー行の has_full_access トグルをクリック
- 期待結果: DB 上の has_full_access が切り替わる
- ステータス: 📋 未着手

#### SC-UAT-081: C010 フルアクセス付与 → 確認 Dialog → Badge「付与済」に変化
- 対象URL: `/admin/e-learning/users`（has_full_access=false のユーザー行あり）
- 前提: 管理者ログイン済み・**`[TEST_USER]` 接頭辞付きテストアカウント（has_full_access=false）が e_learning_users に存在する**（テスト前に Google OAuth 新規登録で作成）
- 操作: `[TEST_USER]` 行の「付与」ボタンをクリック
- 確認内容:
  - DialogTitle「フルアクセスを付与」が表示される
  - 「この操作は監査ログに記録されます」テキストが表示される
  - 「付与する」ボタンをクリックすると Loader2 スピナー + 「処理中...」が表示される
  - 成功後 Dialog が閉じ、テーブル行のバッジが「付与済」（Badge variant=info）に切り替わる
  - ページリロード後も「付与済」バッジのままである（DB 反映確認）
- 補足: **既存 109 名の e_learning_users（人作成データ）には触れない。`[TEST_USER]` のみ操作すること**
- ステータス: 📋 未着手

#### SC-UAT-082: C010 フルアクセス解除 → 確認 Dialog（variant=danger）→ Badge「未付与」に変化
- 対象URL: `/admin/e-learning/users`（has_full_access=true のユーザー行あり）
- 前提: 管理者ログイン済み・**SC-UAT-081 で has_full_access=true にした `[TEST_USER]` が存在する**
- 操作: `[TEST_USER]` 行の「解除」ボタンをクリック
- 確認内容:
  - DialogTitle「フルアクセスを解除」が表示される
  - 「解除する」ボタンが variant=danger（赤色）で表示される
  - 「解除する」ボタンをクリック → 成功後 Dialog が閉じ、バッジが「未付与」（Badge variant=neutral）に切り替わる
  - ページリロード後も「未付与」バッジのままである（DB 反映確認）
- 補足: **`[TEST_USER]` のみ操作。このシナリオが SC-UAT-081 の has_full_access 付与の後始末（クリーンアップ兼務）**
- ステータス: 📋 未着手

#### SC-UAT-083: C010 フルアクセスフィルタ + キーワード検索 URL query 連動
- 対象URL: `/admin/e-learning/users`
- 前提: 管理者ログイン済み・付与済・未付与のユーザーが混在（`[TEST_USER]` + SC-UAT-081 で付与済みの状態を利用）
- 操作:
  1. フルアクセス Select を「付与済」に変更 → URL `?access=true` が付き、has_full_access=true のユーザーのみ表示
  2. 検索ボックスにメールアドレスの一部を入力（debounce 300ms 待ち）→ URL `?q=xxx` が付き、該当ユーザーのみ表示
  3. フルアクセス Select を「すべて」に戻す → `?access` が URL から消え、全ユーザーが表示
- 確認内容: 各操作で URL query が更新され、テーブル行がフィルタ結果に応じて切り替わる
- ステータス: 📋 未着手

### 管理画面 購入履歴（C009）

#### SC-UAT-084: C009 ステータス / 購入対象 フィルタ URL query 連動
- 対象URL: `/admin/e-learning/purchases`
- 前提: 管理者ログイン済み・completed・refunded の購入が混在
- 操作:
  1. ステータス Select を「返金済」に変更 → URL `?status=refunded` が付き、返金済のみ表示
  2. 購入対象 Select を「コース」に変更 → URL `?target=course` が付き、course_id ありの行のみ表示
  3. 各 Select をリセット → `?status` / `?target` が URL から消え全件表示に戻る
- 確認内容: フィルタ変更のたびに URL query が更新され、テーブル行が絞り込まれる
- ステータス: 📋 未着手

#### SC-UAT-085: C009 旧 LP「legacy」フィルタで旧導線購入（course_id=null AND content_id=null）を分離表示
- 対象URL: `/admin/e-learning/purchases`
- 前提: 管理者ログイン済み・旧 LP 経由の購入（course_id=null AND content_id=null）が DB に存在する
- 操作: 購入対象 Select を「旧 LP」に変更 → URL `?target=legacy`
- 確認内容:
  - 「旧 LP」Badge（variant=warning）の行のみ表示される
  - 「全コンテンツ買い切り（後方互換）」テキストが行に表示される
  - コース / 単体動画購入の行が表示されない
- ステータス: 📋 未着手

### 管理画面 カリキュラム編集（C008）

#### SC-UAT-086: C008 章追加 → カリキュラムタブに新章が表示される
- 対象URL: `/admin/e-learning/courses/[id]/edit`（カリキュラムタブ）
- 前提: 管理者ログイン済み・**SC-UAT-077 で作成した `[TEST_NEW_COURSE]` コースの編集画面（カリキュラムタブ）**
- 操作: 「新しい章を追加」Input に `[TEST_CHAPTER]` と入力 → 「章を追加」ボタンクリック
- 確認内容:
  - 送信中 Loader2 スピナー + 「追加中...」がボタン上に表示される
  - createChapterAction 成功後、Input がクリアされ `[TEST_CHAPTER]` がリストの末尾に表示される（revalidatePath で SSR 再取得）
  - 「動画はまだありません」テキストを含む空の章カードが表示される
- 補足: **既存コース（人作成データ）の章は変更しない。`[TEST_NEW_COURSE]` のみ操作すること**
- ステータス: 📋 未着手

#### SC-UAT-087: C008 章名インライン編集（Input blur）→ DB に反映
- 対象URL: `/admin/e-learning/courses/[id]/edit`（カリキュラムタブ）
- 前提: 管理者ログイン済み・**SC-UAT-086 で追加した `[TEST_CHAPTER]` が存在する**
- 操作: `[TEST_CHAPTER]` 章ヘッダーの章名 Input を `[TEST_CHAPTER_RENAMED]` に変更 → Input からフォーカスを外す（blur）
- 確認内容:
  - updateChapterTitleAction が呼ばれ、ページリロード後も `[TEST_CHAPTER_RENAMED]` が表示される（DB 反映確認）
  - 章名が元と同じ値の場合は API 呼び出しが行われない（同値 blur は skip）
- 補足: **`[TEST_CHAPTER]`（SC-UAT-086 で作成したもの）のみ操作すること**
- ステータス: 📋 未着手

#### SC-UAT-088: C008 動画追加 Dialog → タイトル・URL 入力 → 章内動画リストに追加
- 対象URL: `/admin/e-learning/courses/[id]/edit`（カリキュラムタブ）
- 前提: 管理者ログイン済み・**SC-UAT-086/087 で作成した `[TEST_CHAPTER_RENAMED]` が存在する**
- 操作: `[TEST_CHAPTER_RENAMED]` フッターの「動画を追加」ボタンをクリック → Dialog でタイトル `[TEST_VIDEO]`・動画 URL `https://example.com/test-video` を入力 → 「保存」ボタンクリック
- 確認内容:
  - DialogTitle「動画を追加」が表示される
  - タイトル・動画 URL・動画長・説明・無料公開 Switch の各入力欄が表示される
  - 「保存」クリック後 Dialog が閉じ、`[TEST_CHAPTER_RENAMED]` 内動画リストに `[TEST_VIDEO]` 行が追加される
  - `[TEST_VIDEO]` の is_free=false のため Badge「無料」が表示されない
- 補足: **既存コース（人作成データ）の章・動画には触れない**
- ステータス: 📋 未着手

#### SC-UAT-089: C008 動画 is_free Switch 切替 → 即時 Badge 更新 + DB 反映
- 対象URL: `/admin/e-learning/courses/[id]/edit`（カリキュラムタブ）
- 前提: 管理者ログイン済み・**SC-UAT-088 で追加した `[TEST_VIDEO]`（is_free=false）が存在する**
- 操作: `[TEST_VIDEO]` 行の「無料公開」Switch を ON にクリック
- 確認内容:
  - updateVideoAction が呼ばれ、Switch が ON に切り替わる
  - 動画行に Badge「無料」（variant=success）が表示される
  - ページリロード後も Switch が ON のままである（DB 反映確認）
  - B004/B005 公開 LP で `[TEST_VIDEO]` が無料視聴可能になっている（revalidatePath 確認）
- 補足: **`[TEST_VIDEO]`（SC-UAT-088 で作成したもの）のみ Switch を操作すること**
- ステータス: 📋 未着手

#### SC-UAT-090: C008 章削除 → 確認 Dialog → 章 + 章内動画が CASCADE 削除される
- 対象URL: `/admin/e-learning/courses/[id]/edit`（カリキュラムタブ）
- 前提: 管理者ログイン済み・**SC-UAT-086〜089 で作成した `[TEST_CHAPTER_RENAMED]`（`[TEST_VIDEO]` 含む）が存在する**
- 操作: `[TEST_CHAPTER_RENAMED]` ヘッダーの Trash2 削除ボタンをクリック
- 確認内容:
  - DialogTitle「章を削除」と「章内の動画もまとめて削除されます（FK CASCADE）。」メッセージが表示される
  - 「削除する」ボタンをクリック → Loader2「削除中...」が表示される
  - 成功後 Dialog が閉じ、`[TEST_CHAPTER_RENAMED]` カード（および `[TEST_VIDEO]`）がリストから消える
  - ページリロード後も章・動画が表示されない（DB 削除確認）
- 補足:
  - **SC-UAT-086〜089 で作成したテストデータのクリーンアップを兼ねる**
  - **既存コース（人作成データ）の章・動画には絶対に削除ボタンを押さないこと**
- ステータス: 📋 未着手

---

## サマリ

| 状態 | 件数 |
|------|------|
| 📋 未着手 | 81 |
| 🔧 実装中 | 0 |
| ✅ 完了 | 0 |
| **合計** | **81** |
