# ページテンプレート種別（Eラーニング刷新スコープ）

## 作成方針

- 個別画面設計を始める前に「画面の型」を決めておく
- 各テンプレートは Atomic Design の `templates` 層に位置付け。`children` / `props` のスロット思想で実装する
- ロジックを持たせない（データ取得・状態管理は画面側または専用 organism）
- Phase 1 では「型と構成要素」を定義する。具体的な props 仕様は Phase 2 で design-mate が確定する

参照：
- `docs/frontend/screens.md`（各画面のテンプレ割り当て）
- `docs/frontend/component-candidates.md`（templates / organisms の候補）
- 既存実装：`app/components/MainLayout.tsx`（共通レイアウト）／`app/components/AITrainingLP.tsx`／`app/components/ServiceTrainingLP.tsx`（既存 LP 構造）

---

## 0. 共通レイアウト：BaseLayout（既存 MainLayout の踏襲）

すべてのテンプレートはまず `BaseLayout` の内側に配置される。

- 構成要素：
  - 共通ヘッダー（PC：Header / モバイル：MobileHeader）
  - 左サイドバー（PC 表示のみ）
  - メインコンテンツエリア
  - 共通フッター
  - 固定要素（フローティングボタン・お知らせバナー）
- 既存：`app/components/MainLayout.tsx` を継続利用
- 改修点：
  - サイドバーに「eラーニング」配下のサブナビ（コース／単体動画／マイページ）を追加
  - 管理画面側のサイドバーに「コース」「単体動画」「カテゴリ」「購入履歴」「ユーザー」「レガシー」を追加

---

## 1. LPTemplate（ランディングページ）

- 用途：`B001 /e-learning`（未ログイン向け）。N9 確定 8 セクションを縦並びで構成
- 構成要素：
  1. ヒーロー（メインコピー・キービジュアル・主 CTA「コースを見る」）
  2. バリュー訴求（3〜5 個のカード／アイコン＋見出し＋説明）
  3. コース一覧プレビュー（公開済コースのカード群・全件導線）
  4. 単体動画一覧プレビュー（公開済単体動画のカード群・全件導線）
  5. 受講生の声（証言カード群・素材未確定時はダミー枠を確保）
  6. 実績数値（受講者数／動画本数／コース数 等の数値カード）
  7. FAQ（Accordion）
  8. お問い合わせ（既存 `/contact` への導線・もしくは ContactButton 流用）
- 共通的な操作：未ログイン時のクリック → `/auth/login?returnTo=...` 誘導
- 推奨 organism：`HeroSection` / `ValuePropsSection` / `CourseShowcase` / `ContentShowcase` / `TestimonialSection` / `StatsSection` / `FAQAccordion` / `ContactSection`
- 既存実装の流用：`app/components/AITrainingLP.tsx`／`ServiceTrainingLP.tsx` のあしらいパターンを踏襲（スクロールアニメ・カード装飾）

## 2. MediaListTemplate（メディア一覧画面）

- 用途：`B002 会員ホーム` / `B003 コース一覧` / `B006 単体動画一覧`
- 構成要素：
  - ページヘッダー（タイトル・サブタイトル）
  - フィルタバー（カテゴリ Chip / 無料・有料トグル / 並び替え Select）
  - グリッド（コースカード or 単体動画カードを Tailwind の `xs/mid/lg/wide` でレスポンシブに 1→2→3→4 列）
  - 空状態 / ローディング（既存 skeletons 流用）
- 共通的な操作：カード Click → 詳細画面遷移／ブックマークアイコン → トグル／カテゴリ Chip → クエリ反映
- 推奨 organism：`MediaFilterBar` / `MediaGrid` / `MediaCard`（コース／単体動画の variant 切替）

## 3. CourseDetailTemplate（コース詳細）

- 用途：`B004 /e-learning/courses/[slug]`
- 構成要素：
  - コースヒーロー（タイトル・サムネ・カテゴリ・短い概要・価格・購入 CTA／視聴 CTA・ブックマーク）
  - メタ情報（章数・動画本数・合計時間・受講者数（progress 集計））
  - 概要セクション（リッチテキスト description）
  - カリキュラム（章→動画のアコーディオン一覧。動画行に `is_free` バッジ・視聴可否アイコン・進捗チェック）
  - 資料ダウンロード（コース直下の materials・複数あれば zip 一括 DL）
  - 関連コース（同カテゴリの他コース）
- 共通的な操作：
  - 「最初から見る」「続きから見る」（progress に基づく次動画への遷移）
  - 章クリックでアコーディオン開閉
  - 未購入時：主 CTA は購入確認モーダル（B008）を開く
- 推奨 organism：`CourseHero` / `CourseCurriculum` / `MaterialList` / `RelatedCoursesSection`

## 4. VideoPlayerTemplate（視聴画面）

- 用途：`B005 コース内動画` / `B007 単体動画`
- 構成要素（Udemy 風 2 カラム）：
  - 左サイド：レッスン（章＋動画）リスト（コース内動画の場合）／関連動画リスト（単体動画の場合）
  - メイン上部：動画プレーヤー（既存：YouTube 埋め込み + Google Drive 埋め込み対応・Gate 4 までに継続可否確定）
  - メイン下部タブ：「概要」「資料」「関連コンテンツ」
  - 上部：パンくず＋戻るリンク・「次のレッスン」ボタン（コース内）
- 共通的な操作：
  - レッスンクリック → URL 切替（B005 自身に推移）
  - 動画末尾到達 → progress レコード作成（視聴完了）／次レッスン誘導 UI 表示
  - スマホ時：左サイドはボトムシート／タブ折りたたみ（DR1：スマホ視聴必須の指針）
  - 視聴ロックなし（確定事項 §3）：全レッスンは順序非依存でクリック可
- 推奨 organism：`VideoPlayer` / `LessonSidebar` / `VideoTabs`（概要・資料・関連）

## 5. AuthTemplate（認証画面）

- 用途：`A001 /auth/login`
- 構成要素：シンプル中央寄せ（ロゴ・タイトル・Google ログインボタン・利用規約／プライバシーポリシー導線）
- 共通的な操作：Google OAuth ボタン → `/auth/callback` → `returnTo` クエリ先へ
- 既存実装の流用：`app/auth/login/GoogleLoginButton.tsx` を活用

## 6. MyPageTemplate（マイページ系）

- 用途：`B011 購入履歴` / `B012 ブックマーク` / `B013 視聴履歴` / `B014 プロフィール`
- 構成要素：
  - 左：マイページ用サブナビ（プロフィール／購入履歴／ブックマーク／視聴履歴）
  - 右：選択中のセクション（リスト or カード群）
- 共通的な操作：セクション切替・各種カード Click → 該当詳細へ
- 推奨 organism：`MyPageSidebar` / 各セクション組織

## 7. InfoPageTemplate（情報表示単独画面）

- 用途：`B009 購入完了` / `B010 購入キャンセル`
- 構成要素：中央カード（アイコン・見出し・本文・主 CTA・副 CTA）
- 共通的な操作：単一の遷移先（コースへ / 単体動画へ / ホームへ）

## 8. AdminListTemplate（管理：一覧）

- 用途：`C001 単体動画` / `C004 カテゴリ` / `C005 コース` / `C009 購入履歴` / `C010 ユーザー` / `C011 レガシー`
- 構成要素：
  - ページヘッダー（タイトル・新規作成ボタン）
  - フィルタバー（検索・カテゴリ・ステータス）
  - DataTable（ソート・ページング・行アクション）
  - 一括操作バー（公開／非公開・削除）
- 共通的な操作：行クリック → 編集画面 / 新規 → 作成画面 / 行内アクション（公開トグル・削除）
- 推奨 organism：`AdminDataTable` / `AdminFilterBar` / `AdminPageHeader`

## 9. AdminFormTemplate（管理：詳細／編集）

- 用途：`C002 単体動画 新規` / `C003 単体動画 編集` / `C006 コース 新規` / `C007 コース 編集`
- 構成要素：
  - ページヘッダー（タイトル・「保存」「論理削除」「公開／非公開」ボタン）
  - タブ（コース時は「基本情報」「カリキュラム」「資料」、単体動画時は「基本情報」「資料」）
  - 各タブ：FormSection の縦積み
  - サイドカード：状態（公開フラグ・最終更新・関連 Stripe Price）
- 共通的な操作：
  - 入力 → React Hook Form でバリデーション
  - 保存 → API call → トースト
  - C006/C007 のカリキュラムタブは DnD（章 / 章内動画 の並び替え）
- 推奨 organism：`AdminFormHeader` / `FormSection` / `CurriculumEditor`（章 + 動画 DnD）/ `MaterialEditor`

## 10. ErrorTemplate（エラー）

- 用途：404 / 5xx
- 構成要素：中央配置のメッセージ＋ホーム導線（既存 `not-found.tsx` 流用）

---

## テンプレ × 画面の対応マトリクス（要約）

| テンプレ | 該当画面 ID |
|---------|------------|
| LPTemplate | B001 |
| MediaListTemplate | B002 / B003 / B006 |
| CourseDetailTemplate | B004 |
| VideoPlayerTemplate | B005 / B007 |
| AuthTemplate | A001 |
| MyPageTemplate | B011 / B012 / B013 / B014 |
| InfoPageTemplate | B009 / B010 |
| AdminListTemplate | C001 / C004 / C005 / C009 / C010 / C011 |
| AdminFormTemplate | C002 / C003 / C006 / C007（C008 は C006/C007 のタブ） |
| ErrorTemplate | D001 / D002 |

---

## レスポンシブ方針（テンプレ共通）

- ブレークポイント：`tailwind.config.ts` の既定義を踏襲
  - `xs:540` / `sm:640` / `md:641` / `mid:720` / `lg:900` / `xl:1025` / `wide:1280` / `textwide:1461` / `2xl:1536`
- カードグリッド：モバイル 1 列 → `xs` 2 列 → `lg` 3 列 → `wide` 4 列
- VideoPlayerTemplate：`xl` 未満ではレッスンサイドをボトムシート化
- 管理画面（C\*）：PC 前提でレイアウト最適化。モバイルでも閲覧のみ動くよう min 幅対応（編集は推奨しない）

---

## NG（テンプレ層でやらないこと）

- 業務ロジック・データ取得・グローバル状態の更新をテンプレに持たせない
- 視聴権限の判定はテンプレ層でなく、画面 or organism（VideoPlayer）で行う
- テンプレ内で URL を直書きしない（routes 定義を参照）
- 既存の色・タイポを上書きする独自トークンをテンプレ層で定義しない（design-system/tokens を参照）

---

## 参照

- 画面一覧：`docs/frontend/screens.md`
- コンポーネント候補：`docs/frontend/component-candidates.md`
- デザインシステム：`docs/frontend/design-system/INDEX.md`
- 既存実装：`app/components/MainLayout.tsx` / `AITrainingLP.tsx` / `ServiceTrainingLP.tsx`
