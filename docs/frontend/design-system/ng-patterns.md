# NG パターン

## 実装ファイル（開発後はこちらが正）

（NG パターンは実装後も本ドキュメントを正とする）

## 概要

Eラーニング刷新スコープの設計・実装で避けるべきパターンを集約。
既存運用・既存トークン・確定事項・本デザインシステムに反する記述を防ぐためのチェックリストとして使う。

## ルール・ビジネスロジック（やってはいけないこと）

### 1. カラー・トークン

- `bg-[#RRGGBB]` / `text-[hsl(...)]` などの arbitrary value を新規実装で多用する
- 既存 `--primary` / `--background` 等の CSS 変数を画面ローカルで上書きする
- 「赤＝エラー」「緑＝成功」を `text-red-500` 等の直接色名で散発的に表現する（セマンティック面を経由）
- ダークモード前提のクラス（`dark:bg-...`）を Phase 1 で広範囲に追加する
- ブランド独自色 `portfolio.*` の HEX 値を別ファイルで再定義する

### 2. タイポグラフィ

- 行内 `style={{ fontSize: '13px' }}` 等の直接指定
- ボタンに `font-bold` を付与（既定 weight 300 ルールに反する）
- 別フォント（Google Fonts や Web フォント）を新規追加
- 重みを画面ごとに上書きしすぎる（既存ルールで足りる範囲を優先）
- 1 ページに h1 を 2 つ以上置く

### 3. スペーシング

- `p-[10px]` / `m-[7px]` / `gap-[5px]` 等の非 4px 倍数 arbitrary value
- 縦の空白を `<div className="h-8" />` のスペーサー div で表現（`mt-*` / `py-*` を使う）
- セクションごとに `py-12 / py-14 / py-16 / py-20` がバラバラ
- shadow を `shadow-[0_8px_24px_rgba(0,0,0,0.12)]` のような任意値で書く

### 4. レイアウト

- カードグリッドを `flex flex-wrap` で構築（`grid` を使う）
- 横スクロールカードを一覧画面で常用（プレビュー以外で多用しない）
- `max-w` を指定しない LP セクション
- 視聴画面で動画と関連動画を縦並びにする（`xl` 以上は横並び）
- ブレークポイント境界での見た目崩れ（隣接ブレーク確認）

### 5. 状態管理・データ取得

- クライアントから Supabase 直接 RPC で書き込みを多用（Server Actions を使う）
- 視聴権限の判定をクライアント単独で行う（必ず Server で一次判定）
- フィルタ・並び替えを `useState` のみで保持（URL クエリ同期を行う）
- グローバルストア（zustand / redux）を Phase 1 で導入
- SWR / React Query を Phase 1 で導入

### 6. ルーティング

- ルート文字列を JSX や Action 内に直書き（Phase 2 で `routes.ts` を作る）
- `/admin/**` の認証ガードを画面側だけで実装（middleware で一次防御）
- middleware で公開ルート（`/e-learning`・`/auth/*`）まで認証ガードする
- `returnTo` クエリの検証なし（同一オリジン・パスのみに限定）

### 7. UX・アクセシビリティ

- 色のみで状態を伝える（無料／有料・視聴可／不可はアイコン併記）
- フォーカススタイルを全消し（既存 `outline: none` は独自スタイルで補う前提）
- iOS 入力 zoom（フォントサイズ <16px）
- モーダルを Escape / オーバーレイクリックで閉じられない実装
- スクリーンリーダー用の `aria-*` 抜けが目立つ実装
- 動画自動再生を音ありで強制（ユーザー操作起点にする）

### 8. ビジネスルール（確定事項違反）

- コース内動画を個別購入対象にする（コース単位購入のみ）
- 既存 15 動画を新規コースに含める（既存動画はコースに入れない）
- サブスクリプション課金 UI を作る（買い切りのみ）
- 既存購入者 6 名に重複の特別ステータスを付ける（`has_full_access=true` のみで管理）
- コース内動画にブックマーク UI を出す（M4：対象外）
- コース内動画に資料 UI を直接紐付ける（M1：コース直下／単体動画直下のみ）
- `has_paid_access` を新 UI 上で参照（`has_full_access` を使う）

### 9. 認証・権限

- 未ログインで会員ページに直アクセス時、画面側で「ログインして下さい」表示のみで止める（middleware で `/auth/login?returnTo=` リダイレクト）
- 視聴権限なしのまま視聴 URL に到達できる（Server Component で必ず判定）
- 管理画面で `auth.users` 以外を管理者扱いする（既存仕様：`auth.users` セッション＝管理者）

### 10. 設計負債への配慮

- 設計負債 1（bookmarks の user_id FK 不統一）に対する FE 実装ミス：FE 側は `e_learning_users.id` を user_id として渡す（マイグレーション後の状態前提）
- 設計負債 4（`stripe_payment_intent_id` 不在）が解消される前提で FE 実装：返金 UI は `refunded_at` / `status='refunded'` で表示
- 設計負債 6（`ADMIN_EMAIL` 削除）：FE 側で `ADMIN_EMAIL` を参照しない

### 11. パフォーマンス

- LP のヒーロー画像を最適化しない（`next/image` を使う）
- カードリストを大量に取得（ページング・LIMIT を入れる）
- 一覧で全関連データを JOIN（必要なカラムだけ select）
- クライアントで巨大な JSON を保持（必要分のみ受け取る）

### 12. その他

- 既存 LP（`AITrainingLP.tsx` / `ServiceTrainingLP.tsx`）のスクロールアニメパターンを「装飾差別化のためだけに」変える
- 既存 `Header.tsx` / `MobileHeader.tsx` / `Sidebar.tsx` / `Footer.tsx` を Eラーニングローカルで複製しない
- 既存 `PurchasePromptModal` / `LoginPromptModal` を統一化せず別の独自モーダルを 1 から作る
- 既存 shadcn `button.tsx` を無視して独自 Button を新規作成する

## NG

- 本ドキュメントの NG をクリアしないまま PR を出す
- 確定事項（`docs/phase1/gate1-confirmed-decisions.md`）と矛盾する画面・コンポーネント設計をする
- 「既存と違うが見栄えが良いので採用」（ディレクター方針「既存のあしらいに合わせる」に反する）

---

## 参照

- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- INDEX：`docs/frontend/design-system/INDEX.md`
- 既存実装：`app/components/` / `app/e-learning/*` / `app/admin/e-learning/*`
