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

#### SC-UAT-073: C010 フルアクセスユーザー管理 has_full_access 切替
- 対象URL: `/admin/e-learning/users`
- 操作: ユーザー行の has_full_access トグルをクリック
- 期待結果: DB 上の has_full_access が切り替わる
- ステータス: 📋 未着手

---

## サマリ

| 状態 | 件数 |
|------|------|
| 📋 未着手 | 49 |
| 🔧 実装中 | 0 |
| ✅ 完了 | 0 |
| **合計** | **49** |
