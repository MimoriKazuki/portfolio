# コンポーネント候補リスト（Eラーニング刷新スコープ）

## 作成方針

- 画面一覧（`screens.md`）・ページテンプレート（`page-templates.md`）・DB エンティティ（`schema.dbml`）から逆算
- Atomic Design 4 階層（atoms / molecules / organisms / templates）で分類
- 詳細仕様（props・サイズ・状態）は Phase 2 で design-mate が確定。本書では「必要かどうかと用途」のみ
- 既存実装の流用可否を「既存」「既存改修」「新規」で明示
- YAGNI 原則：「将来必要になるかも」は含めない

参照：
- 既存コンポーネント：`app/components/`、`app/components/ui/`、`app/e-learning/*`、`app/admin/e-learning/*`
- shadcn 設定：`components.json`（既存運用継続）
- アイコン：`lucide-react`（既存採用）

---

## atoms（最小単位）

| コンポーネント | 用途 | 使用画面（候補） | バリエーション数（推定） | 流用可否 |
|--------------|------|----------------|----------------------|---------|
| Button | アクションボタン | 全画面 | primary / secondary / outline / ghost / danger | 既存（`app/components/ui/button.tsx`） |
| Input | テキスト入力 | フォーム系 | text / number / email / password | 新規（shadcn ベース推奨） |
| Textarea | 複数行入力 | 管理：description / 説明文 | - | 新規 |
| Label | 項目名表示 | フォーム | required マーク有/無 | 新規 |
| Icon | アイコン | 全画面 | lucide-react ベース（既存依存継続） | 既存 |
| Badge | 状態バッジ | 一覧・詳細 | success（無料・公開）/ warning（非公開）/ danger（refunded）/ info（カテゴリ） | 新規 |
| Tag / Chip | カテゴリ・タグ表示 | 一覧フィルタ・カード | filled / outlined / selectable | 新規 |
| Spinner | ローディング | 全画面 | sm / md / lg | 新規 |
| Checkbox | チェックボックス | 管理フォーム・カリキュラム編集（`is_free`） | - | 新規（shadcn） |
| Radio | ラジオボタン | 管理フォーム | - | 新規（shadcn） |
| Switch | ON/OFF トグル | 管理：公開フラグ・`has_full_access` | - | 新規（shadcn） |
| Avatar | アバター画像 | ヘッダー・マイページ | sm / md | 新規（既存 `e_learning_users.avatar_url` 表示用） |
| Price | 価格表示 | カード・詳細 | 通常 / 無料 / 取消線 | 新規 |
| ProgressBar | 進捗バー | コース詳細・カード | （％数値） | 新規 |
| ProgressCheckIcon | 視聴完了チェック | 視聴画面サイド・コース詳細 | 完了 / 未視聴 | 新規 |
| LockIcon | 視聴ロック表示 | カード・コース詳細・視聴画面 | （既存 lucide Lock を意味付け） | 既存 |
| FreeIcon / FreeBadge | 無料表示 | カード | （既存「無料」バッジを統一） | 既存改修 |
| LinkButton | リンク兼ボタン | LP CTA・各種誘導 | primary / outline | 新規 |

## molecules（atoms の組み合わせ）

| コンポーネント | 用途 | 使用画面（候補） | 構成 atoms | 流用可否 |
|--------------|------|----------------|-----------|---------|
| FormField | ラベル付き入力（エラー表示込み） | フォーム系 | Label + Input/Textarea/Select + ErrorText | 新規 |
| FormSection | フォーム見出し付きグループ | 管理フォーム | Heading + 説明 + slot（FormField × N） | 新規 |
| SearchField | 検索入力 | 一覧・管理 | Input + SearchIcon + clear | 新規 |
| Select | プルダウン | 管理フォーム・並び替え | Input + Popover Listbox（shadcn） | 既存（`CustomSelect`）または新規 |
| DatePicker | 日付選択 | 購入履歴の期間絞り込み | Input + Calendar | 新規 |
| Pagination | ページング | 管理一覧・一覧 | Button × N + 件数表示 | 新規 |
| Tabs | タブ切替 | 視聴画面 / 管理フォーム / 会員ホーム | Tab × N + slot | 新規（shadcn） |
| Accordion | 折りたたみ | FAQ / コースカリキュラム | Header + 開閉 + slot | 新規（shadcn・Radix） |
| Toast | 通知 | 全画面（保存・購入・削除） | Icon + テキスト + 自動消滅 | 新規（shadcn） |
| Dialog | モーダル | 削除確認・購入確認（既存 PurchasePromptModal の汎化） | Overlay + Card + slot | 既存改修 |
| Breadcrumb | パンくず | 視聴画面・管理詳細 | Link × N + Separator | 新規 |
| EmptyState | 空状態 | 一覧画面 | Icon + 見出し + 説明 + 任意 CTA | 新規 |
| AlertBanner | お知らせ／注意喚起 | 視聴権限なし時のヒント等 | Icon + テキスト + Close | 新規 |
| FilterChipGroup | カテゴリ Chip 群 | 一覧 | Tag × N（複数選択可） | 新規 |
| PriceTag | 価格表示（買い切り・無料） | カード | Price + Badge | 新規 |

## organisms（独立したセクション）

| コンポーネント | 用途 | 使用画面（候補） | 主要機能 | 流用可否 |
|--------------|------|----------------|---------|---------|
| Header（PC） | 共通ヘッダー | 全画面 | ロゴ・ナビ・ユーザーメニュー | 既存（`Header.tsx`） |
| MobileHeader | モバイル共通ヘッダー | 全画面 | ハンバーガー・ロゴ・ユーザー | 既存（`MobileHeader.tsx`） |
| Sidebar（公開側） | サイドバー | 全画面 | ナビ・カテゴリ | 既存（`Sidebar.tsx`） |
| Footer | フッター | 全画面 | リンク・コピーライト | 既存（`Footer.tsx`） |
| AdminSidebar | 管理画面ナビ | 管理画面 | コース／単体動画／カテゴリ／購入履歴／ユーザー／レガシー | 既存改修（既存管理画面のサイドナビを e-learning メニューに対応） |
| HeroSection | LP ヒーロー | B001 | キービジュアル + コピー + CTA | 新規（`AITrainingLP` 構造を流用） |
| ValuePropsSection | 価値訴求 | B001 | カード × N（アイコン + 見出し + 本文） | 新規 |
| CourseShowcase | LP コース紹介 | B001 | コースカード横スクロール / グリッド | 新規 |
| ContentShowcase | LP 単体動画紹介 | B001 | 単体動画カード横スクロール / グリッド | 新規 |
| TestimonialSection | 受講生の声 | B001 | 証言カード × N（スワイプ可） | 新規 |
| StatsSection | 実績数値 | B001 | 数値カード × N | 新規 |
| FAQAccordion | FAQ | B001 | Accordion × N | 新規 |
| ContactSection | お問い合わせ導線 | B001 | テキスト + CTA（既存 `/contact` へ） | 新規（既存 ContactButton 流用） |
| MediaFilterBar | カテゴリ・無料/有料・並び替え | B002 / B003 / B006 | FilterChipGroup + Select | 新規 |
| MediaGrid | カードグリッド（コース／単体動画） | B002 / B003 / B006 | レスポンシブグリッド + ローディング/空状態 | 新規 |
| CourseCard | コース表示カード | LP / 一覧 / 関連 | サムネ + タイトル + カテゴリ + 価格 + 章数 + 進捗 + ブックマーク | 新規 |
| ContentCard | 単体動画表示カード | LP / 一覧 / 関連 | サムネ + タイトル + カテゴリ + 価格 + 完了マーク + ブックマーク | 既存改修（`ELearningCard.tsx`） |
| CourseHero | コース詳細ヒーロー | B004 | サムネ + 情報 + 主 CTA | 新規 |
| CourseCurriculum | カリキュラム表示 | B004 / B005 サイド | 章 → 動画 Accordion・`is_free` / 視聴可否 / 進捗チェック | 新規 |
| MaterialList | 資料ダウンロード一覧 | B004 / B005 / B007 / 管理 | 資料行 × N + 一括 zip DL ボタン | 新規 |
| VideoPlayer | 動画プレーヤー | B005 / B007 | YouTube / Google Drive 埋め込み（既存 detect ロジック流用）・進捗 callback | 既存改修（`ELearningDetailClient` から切り出し） |
| LessonSidebar | レッスンリスト（章＋動画） | B005 | アコーディオン + 現在動画ハイライト + クリック遷移 | 新規 |
| VideoTabs | 視聴画面下部タブ | B005 / B007 | 概要 / 資料 / 関連 | 新規 |
| RelatedCoursesSection | 関連コース | B004 / B005 | グリッド | 新規 |
| NextLessonCTA | 次レッスン誘導 | B005 動画末尾 | 「次のレッスンへ」ボタン + カウントダウン（任意） | 新規 |
| PurchasePromptModal | 購入確認モーダル | B004 / B007 | コース／単体動画 / 価格 / Stripe Checkout 遷移 | 既存改修（`PurchasePromptModal.tsx`・コース対応） |
| LoginPromptModal | ログイン誘導モーダル | LP/B*（未ログイン時） | ログインボタン + キャンセル | 既存（`LoginPromptModal.tsx`） |
| BookmarkButton | ブックマーク切替 | カード / 詳細 | 状態保持 + 楽観 UI | 既存改修 |
| MyPageSidebar | マイページサブナビ | B011-B014 | リンク × N | 新規 |
| PurchaseHistoryList | 購入履歴リスト（会員） | B011 | 行 × N（コース／単体動画 / 日時 / 領収書リンク） | 新規 |
| BookmarkList | ブックマーク一覧（会員） | B012 | カードグリッド + 解除 | 新規 |
| ProgressList | 視聴履歴一覧 | B013 | コース完了率 + 単体動画完了 | 新規 |
| AdminPageHeader | 管理ヘッダー | C\* | タイトル + アクション群 | 新規 |
| AdminDataTable | 管理一覧テーブル | C\* | ソート / ページング / 一括選択 | 既存改修 |
| AdminFilterBar | 管理フィルタ | C\* | 検索 + Select + 日付範囲 | 新規 |
| CurriculumEditor | コース章＋動画 DnD 編集 | C006 / C007 | 章追加 / 章 DnD / 章内動画追加 / 動画 DnD / `is_free` トグル | 新規（dnd-kit 等推奨） |
| MaterialEditor | 資料アップロード／並び替え | C\* | ファイルアップロード + 順序入替 | 新規 |
| StripePriceField | Stripe Price ID 入力＋プレビュー | C006 / C007 / C002 / C003 | テキスト + 検証ヘルパ（任意） | 新規 |
| HasFullAccessSwitch | フルアクセス切替 | C010 | Switch + 確認ダイアログ | 新規 |
| CheckoutCompleteCard | 購入完了表示 | B009 | アイコン + 見出し + CTA | 新規 |

## templates（ページ骨格）

`page-templates.md` を参照。本リストでは候補のみ列挙。

| コンポーネント | 用途 | スロット |
|--------------|------|---------|
| BaseLayout | 全画面共通骨格 | Header / Sidebar / main / Footer | 既存（`MainLayout.tsx`） |
| LPTemplate | LP | Hero / Value / CourseShowcase / ContentShowcase / Testimonial / Stats / FAQ / Contact | 新規 |
| MediaListTemplate | コース・単体動画一覧 | Header + FilterBar + Grid + Pagination | 新規 |
| CourseDetailTemplate | コース詳細 | Hero + Curriculum + Materials + Related | 新規 |
| VideoPlayerTemplate | 視聴画面 | Player + Tabs + LessonSidebar | 新規 |
| AuthTemplate | ログイン | カード中央配置 | 新規 |
| MyPageTemplate | マイページ | MyPageSidebar + section slot | 新規 |
| InfoPageTemplate | 購入完了／キャンセル | 中央カード | 新規 |
| AdminListTemplate | 管理一覧 | AdminPageHeader + FilterBar + DataTable | 新規 |
| AdminFormTemplate | 管理フォーム | AdminFormHeader + Tabs + FormSection × N | 新規 |
| ErrorTemplate | 404 / 5xx | カード中央配置 | 既存（`not-found.tsx`） |

---

## サマリ

- atoms：18 個
- molecules：14 個
- organisms：31 個
- templates：11 個
- **合計：74 個**

---

## Phase 2 での実装順序（提案）

依存関係に従う実装順序：

1. **基盤レイアウト・既存流用の整理**：BaseLayout（既存 MainLayout）／AdminSidebar 改修
2. **基本 atoms**：Button（既存）/ Input / Label / Icon（既存 lucide）/ Badge / Tag / Spinner / Avatar / Price / LockIcon / FreeBadge
3. **基本 molecules**：FormField / FormSection / SearchField / Select / Tabs / Accordion / Toast / Dialog / Pagination / EmptyState / PriceTag
4. **データ表示系 organisms**：CourseCard / ContentCard / MediaGrid / MediaFilterBar / BookmarkButton
5. **画面 templates**：MediaListTemplate / CourseDetailTemplate / AuthTemplate（既存改修）/ MyPageTemplate
6. **視聴系 organisms / templates**：VideoPlayer（既存切り出し）/ LessonSidebar / VideoTabs / CourseCurriculum / VideoPlayerTemplate / NextLessonCTA / RelatedCoursesSection
7. **LP 系 organisms / templates**：HeroSection / ValuePropsSection / CourseShowcase / ContentShowcase / TestimonialSection / StatsSection / FAQAccordion / ContactSection / LPTemplate
8. **購入導線**：PurchasePromptModal（改修）/ CheckoutCompleteCard / InfoPageTemplate / PurchaseHistoryList
9. **管理系**：AdminPageHeader / AdminDataTable（既存改修）/ AdminFilterBar / AdminListTemplate / AdminFormTemplate / CurriculumEditor / MaterialEditor / StripePriceField / HasFullAccessSwitch

---

## 注意事項

### 過剰設計の回避
- バリエーション数は「現時点で確実に必要なもの」のみカウント
- 「将来必要になるかも」は含めない（YAGNI）

### 既存資産の活用
- 既存：`Header.tsx` / `MobileHeader.tsx` / `Sidebar.tsx` / `Footer.tsx` / `MainLayout.tsx` / `ui/button.tsx` / `ContactButton.tsx` / `LoginPromptModal.tsx` / `PurchasePromptModal.tsx` / `ELearningCard.tsx` を流用前提
- ライブラリ依存：`@radix-ui/*`（shadcn 経由）/ `lucide-react`（既存）/ DnD ライブラリ（dnd-kit を新規導入推奨）

### Phase 2 での見直し
- 実装中に新たに必要なコンポーネントが発覚した場合、design-mate が team-lead 経由で plan-lead に確認する
- このリストの更新は plan-lead 経由で fe-plan-mate に依頼する

---

## 参照

- 画面一覧：`docs/frontend/screens.md`
- ページテンプレート：`docs/frontend/page-templates.md`
- 既存コンポーネント：`app/components/`、`app/e-learning/*`、`app/admin/e-learning/*`
