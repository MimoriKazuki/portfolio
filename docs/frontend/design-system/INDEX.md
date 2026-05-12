# デザインシステム INDEX

## 実装ファイル（開発後はこちらが正）

- カラー定義の源泉：`app/globals.css`（CSS 変数）/ `tailwind.config.ts`（HSL 参照）
- フォント・タイポグラフィ：`app/globals.css`（重みルール）/ `tailwind.config.ts`（fontFamily）
- ブレークポイント：`tailwind.config.ts`（`screens`）
- UI プリミティブ：`app/components/ui/`（既存 shadcn ベース・継続）
- 既存 LP 構造のあしらい：`app/components/AITrainingLP.tsx` / `app/components/ServiceTrainingLP.tsx`
- カードのあしらい：`app/e-learning/ELearningCard.tsx` / `app/e-learning/ELearningTopClient.tsx`

## 概要

AI駆動研究所 ポートフォリオ／メディアサイト（本番運用中）のデザインシステム全体方針。
ディレクター方針「既存のあしらいに合わせる」に従い、既存実装からトークン・パターンを抽出して整理した文書である。
Eラーニング刷新スコープ（Phase 1）の各画面・コンポーネントはこのシステムに整合させる。

## 使用場面・責務

### 1. 全体方針

- **既存トークンを正とする**：`globals.css` の CSS 変数（`--primary` 等）と `tailwind.config.ts` の screens / fontFamily を一次定義とみなす
- **拡張する場合は最小限**：色・スペーシング・タイポを追加する場合は既存スケールに整合（4/8px ベース、HSL 変数追加）
- **shadcn 構成を維持**：`components.json`・`app/components/ui/`・`tailwindcss-animate`・`@tailwindcss/typography` を継続採用
- **ダークモード**：`tailwind.config.ts` の `darkMode: ['class']` を維持。Phase 1 では明示的にダークモード対応は行わない（ライト前提）
- **アクセシビリティ**：色のコントラスト・キーボード操作は WCAG 2.1 AA を目安。詳細監査は Phase 2 / 3 で実施

### 2. ファイル構成

| ファイル | 内容 |
|---------|------|
| `INDEX.md`（本書） | 方針・全体像 |
| `tokens/colors.md` | カラートークン（CSS 変数 + Tailwind マッピング） |
| `tokens/typography.md` | フォント・サイズ・行間・重み |
| `tokens/spacing.md` | スペーシング（Tailwind の 4px ベース） |
| `layout/grid.md` | グリッド・コンテナ |
| `layout/breakpoints.md` | ブレークポイント定義 |
| `ng-patterns.md` | NG パターン（やってはいけないこと） |
| `components/` | Phase 2 以降で design-mate が作成（個別コンポーネント仕様） |

### 3. ブランドの「らしさ」（既存実装から抽出）

- **色**：青系プライマリ（HSL `221.2 83.2%`）＋無彩色トーンのグレースケール
- **角丸**：`--radius: 0.75rem`（12px）を基準。`rounded-lg / -md / -sm` で派生
- **タイポ**：欧文 `acumin-pro`（Adobe Fonts）＋和文 `Noto Sans JP`。見出しは `font-bold` / `font-semibold` / `font-medium`、本文 `font-normal`、ボタン `font-light`（300）
- **影**：`shadow-md`〜`shadow-lg` の柔らかいシャドウ。`hover:shadow-lg` でカード浮き上がり
- **モーション**：`fade-in` / `scale-in` / `ripple` の控えめなアニメ（既存 `tailwind.config.ts` 定義）
- **カード装飾**：境界線ベース（`border-2 border-transparent hover:border-gray-200`）＋シャドウベース（`shadow-md hover:shadow-lg`）の 2 系統を混在運用。Eラーニング系は既存 `ELearningCard` の「枠線ベース・p-4・rounded」を継承
- **キービジュアル**：既存 LP（`AITrainingLP` / `ServiceTrainingLP`）はスクロール連動アニメ・グラデーション背景・大きめの数字・アイコン併記が特徴
- **アクセントカラー**：`portfolio.blue`（`#3b82f6` 系）+ `portfolio.gray` 系（既存定義）。Tailwind カスタム色として保持

### 4. Eラーニング刷新で踏襲・整理する事項

- **カードのあしらい**：既存 `ELearningCard.tsx` の構造（`relative aspect-video` + 無料バッジ + Bookmark + 再生オーバーレイ）を `CourseCard` / `ContentCard` 共通の基底に整理（`component-candidates.md` 参照）
- **モーダル**：既存 `PurchasePromptModal` / `LoginPromptModal` を統一 `Dialog` に集約（Radix UI ベース）
- **CTA ボタン**：既存 `app/components/ui/button.tsx`（shadcn variants）を継続。LP CTA は `variant="default"`（青塗り）を採用
- **進捗 UI**：新規 `ProgressBar` / `ProgressCheckIcon`。既存スタイルパターンとの統一感を保つため、緑系の控えめな色を採用候補（colors.md 参照）
- **管理画面**：既存 `/admin/*` のあしらいを踏襲。AdminListTemplate / AdminFormTemplate もこれに合わせる

### 5. design-research の起動指針（plan-lead 経由）

以下に該当する場合は plan-lead に @design-research 起動を要請する。

- 既存 LP のカード装飾・スクロールアニメをそのまま LPTemplate に流用するため、詳細パターン抽出が必要なとき
- 既存管理画面（`/admin/*`）の DataTable / フォームレイアウトを統一規格化したいとき
- 既存 `app/components/ui/` 配下の shadcn コンポーネント網羅性を確認したいとき
- Stripe Checkout 後の戻り先 UI 表示のため、既存決済導線のスタイル踏襲を確認したいとき

### 6. アクセシビリティ／NG パターンの要点

- 既存 `globals.css` で iOS Safari の input zoom 防止 `font-size: 16px` をすでに適用 → 新規フォームも踏襲
- フォーカススタイルは `outline: none` + 独自スタイル（既存）。Phase 2 で明確なフォーカスリングを追加することを推奨
- 色のみで状態を伝えない（無料／有料、視聴可／不可はアイコン併記）
- 詳細は `ng-patterns.md` を参照

## NG

- 独自カラーパレットを globals.css に対抗して別ファイルで定義しない
- Tailwind の `arbitrary value`（`text-[#1A2B3C]`）を多用しない（トークン化を優先）
- フォントファミリーを画面ごとに切り替えない（既存 `var(--font-primary)` を踏襲）
- スペーシングを 4/8px ベースから外して `5px` / `7px` 等を使わない
- ライト／ダーク両方で見栄えが破綻するクラス（`text-white bg-white` 等）を避ける

---

## 参照

- 既存 Tailwind 設定：`tailwind.config.ts`
- 既存グローバル CSS：`app/globals.css`
- 既存コンポーネント：`app/components/`（全般）
- screens：`docs/frontend/screens.md`
- component-candidates：`docs/frontend/component-candidates.md`
