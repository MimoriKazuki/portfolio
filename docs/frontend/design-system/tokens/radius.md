# ボーダーラジウス（角丸）

## 実装ファイル（開発後はこちらが正）

- `app/globals.css`（`@layer base :root` の `--radius: 0.75rem`）
- `tailwind.config.ts`（`extend.borderRadius` で `--radius` を参照）

## 概要

既存実装の角丸ルールを正とする。基準は **`--radius: 0.75rem`（12px）**。
Tailwind の `rounded-lg` / `-md` / `-sm` がこの CSS 変数から派生し、`rounded`（Tailwind 既定 4px）・`rounded-xl`（Tailwind 既定 16px）・`rounded-full` を補完的に使用する。

## 使用場面・責務

### 1. スケール

| トークン | 計算 | 概算値 | 主用途 |
|---------|------|-------|------|
| `rounded-sm` | `calc(var(--radius) - 4px)` | 8px | バッジ・タグ・小要素 |
| `rounded-md` | `calc(var(--radius) - 2px)` | 10px | ボタン・Input |
| `rounded-lg` | `var(--radius)` | 12px | **カード基本**（既存 `--radius: 0.75rem`） |
| `rounded-xl` | Tailwind 既定 | 16px | モーダル・ダイアログ |
| `rounded-full` | — | 9999px（円） | アバター・アイコンボタン・再生オーバーレイ・ピル形バッジ |

補助：`rounded`（Tailwind 既定 4px）は既存 `ELearningCard` のサムネ装飾等で限定的に使用可。
新規 UI はこのスケールから選び、`rounded-[20px]` / `rounded-2xl` 等の独自値は追加しない。

### 2. 用途別の使い分け

| 要素 | 推奨トークン | 補足 |
|------|------------|------|
| カード（コース／単体動画／資料） | `rounded-lg` | 既存 `ELearningCard` 系の踏襲 |
| ボタン（プライマリ／セカンダリ／アウトライン） | `rounded-md` | shadcn `button.tsx` の既定 |
| Input / Textarea / Select | `rounded-md` | shadcn フォーム部品の既定 |
| バッジ・ステータスチップ（角丸） | `rounded-sm` | 「無料」「非公開」等の小タグ |
| ピル形バッジ（カテゴリ等） | `rounded-full` | 既存 LP の Chip 表現 |
| アバター・ユーザーアイコン | `rounded-full` | ヘッダー・コメント領域 |
| 動画再生オーバーレイの円形ボタン | `rounded-full` | 既存 `ELearningCard` 踏襲 |
| モーダル / Dialog | `rounded-xl` | 16px・余裕のあるラジウスで主役感を出す |
| Toast | `rounded-md` | shadcn `toast.tsx` の既定 |
| サムネ画像（カード内） | `rounded` または `rounded-md` | `aspect-video` のラッパに付与 |
| 大きなヒーロー画像 | `rounded-lg` | LP の画像ブロック |

### 3. Eラーニング刷新で踏襲する具体

- **CourseCard / ContentCard**：外枠 `rounded-lg`、サムネ `rounded`（既存 `ELearningCard` パターン）
- **進捗バー（ProgressBar）**：トラックとフィル両方 `rounded-full`（細長いピル形）
- **カリキュラム章ブロック**：`rounded-lg` で囲み、章内動画行はラジウスなし
- **CTA ボタン（LP「無料で始める」「コース購入」）**：`rounded-md`（既存 button.tsx 既定）
- **無料／視聴済バッジ**：`rounded-sm`（小タグ）または `rounded-full`（ピル）
- **管理 DataTable の行**：ラジウスなし（テーブル罫線のみ）
- **管理サイドカード**：`rounded-lg`

### 4. 採用根拠（`design-direction.md` との整合）

本トークンは**既存実装からの抽出**であり、新規方向性ではない。

- **既存方針「あしらいに合わせる」（最優先）**：既存サイト全画面で `--radius: 0.75rem` が既に運用されている。Eラーニング刷新でも同値を維持し、視覚的一貫性を担保
- **印象キーワード「集中・ノイズなし」「信頼感」と整合**：12px 基準のソフトな角丸はシャープすぎず柔らかすぎず、長時間視聴・操作で疲れにくい既存実装の特徴を保持
- **shadcn 標準値踏襲**：shadcn デフォルト（0.5rem）からは増えているが、既存実装で既に採用されている値を尊重（独自変更しない）

## ルール・ビジネスロジック

- 新規に独自の角丸値（例：`rounded-[20px]` / `rounded-2xl`）を追加しない
- `--radius` の値（0.75rem）を画面ローカルで変更しない
- カードは `rounded-lg`、ボタンは `rounded-md`、バッジは `rounded-sm` / `rounded-full` の使い分けを徹底
- 角丸を「装飾差別化」だけの理由で画面ごとに変えない（既存と整合させる）

## NG

- `rounded-[10px]` / `rounded-[20px]` / `rounded-[24px]` などの arbitrary value 常用
- `--radius` を画面ローカルで上書きする
- カード内サムネを `rounded-full` にする（情報を欠落させない）
- ボタンを `rounded-full` でピル形に変える（既存方針はラウンド角の矩形）
- `tailwind.config.ts` の `extend.borderRadius` を独自拡張する（既存 lg/md/sm マッピングを尊重）

---

## 参照

- 既存：`tailwind.config.ts`（`extend.borderRadius`）/ `app/globals.css`（`--radius`）
- INDEX：`docs/frontend/design-system/INDEX.md`
- design-direction：`docs/frontend/design-system/design-direction.md`
- 関連トークン：`docs/frontend/design-system/tokens/spacing.md`（スペーシング） / `shadows.md`（影との組合せ）
