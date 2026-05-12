# スペーシング

## 実装ファイル（開発後はこちらが正）

- Tailwind 既定スケール（`@tailwindcss/preflight` + `tailwind.config.ts`）
- 既存 `tailwind.config.ts` で独自スペーシングは未拡張（既定スケールをそのまま採用）

## 概要

スペーシングは Tailwind の 4px 基準スケール（`0 / 0.5 / 1 / 1.5 / 2 / 2.5 / 3 / 4 / 5 / 6 / 8 / 10 / 12 / 16 / 20 / 24 / ...`）を既定とする。
独自スペースは新規に定義しない。既存実装も Tailwind 既定スケールに沿っており、その範囲で運用する。

## 使用場面・責務

### 1. スケール（Tailwind 既定）

| トークン | 値 | 主用途 |
|---------|----|--------|
| `space-0.5` / `p-0.5` | 2px | 細かいアイコン余白 |
| `space-1` | 4px | バッジ・チップ内余白 |
| `space-2` | 8px | カード内要素間 / Icon と text の間 |
| `space-3` | 12px | フォーム項目間（小） |
| `space-4` | 16px | カード内パディング基本（既存 `p-4`） |
| `space-6` | 24px | セクション内ブロック間 / カード間 gap |
| `space-8` | 32px | セクション間 / カード列 gap（広） |
| `space-12` | 48px | LP セクション縦余白（小） |
| `space-16` | 64px | LP セクション縦余白（中） |
| `space-20` | 80px | LP セクション縦余白（大） |
| `space-24` | 96px | LP ヒーロー上下 |

`gap-*` / `p-*` / `m-*` / `space-*` を Tailwind の表記でそのまま使用する。

### 2. 角丸・影について

角丸（`rounded-lg` / `-md` / `-sm` 等）は `tokens/radius.md` を参照。
影（`shadow-md` / `hover:shadow-lg` 等）は `tokens/shadows.md` を参照。

本ファイルではスペーシング（余白・gap・padding・margin）に責務を限定する。

### 3. レイアウト余白の基準

#### 3-1. ページ最大幅・コンテナ

- `tailwind.config.ts` の `container`：`center: true` / `padding: '2rem'` / `screens.2xl: 1400px`
- LP のコンテナは `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`（既存 LP に多い）
- 管理画面のコンテナは `max-w-screen-2xl mx-auto`（広め）

#### 3-2. セクション縦余白

- LP セクション：`py-16 sm:py-20 lg:py-24`
- 通常ページ：`py-8 sm:py-12`
- カード内：`p-4`〜`p-6`

#### 3-3. グリッド gap

- カード一覧：`gap-6` 既定。狭めに揃えたいときは `gap-4`
- フォーム：`space-y-4` 既定。セクション間は `space-y-8`
- ボタン群：`gap-2`（横並び）

### 4. line-clamp / 折り返し

- カードタイトル：`line-clamp-2`
- カード説明：`line-clamp-3`
- LP ヒーロー：折り返し許容（`max-w-3xl`）

### 5. 視聴画面（B005／B007）の具体

- 動画プレーヤー：`aspect-video w-full`
- メイン左右余白：`px-4 sm:px-6 lg:px-8`
- レッスンサイド幅：`xl:w-80`（320px 目安・PC のみ）
- タブと動画の間隔：`mt-6 lg:mt-8`

### 6. 管理 DataTable

- 行高さ：`py-3`（既定 12px 上下）
- 列パディング：`px-4`
- 一括選択チェック列：`w-10`

## ルール・ビジネスロジック

- 4px の倍数（`p-1` / `p-2` / `p-3` / `p-4` / `p-6` / `p-8` ...）を優先する
- 非標準（`p-[10px]` 等）は使わない
- セクション間の余白は LP では `py-16` 以上を基本（息を持たせる）。管理画面では `py-6`〜`py-8`
- ※ 角丸ルールは `tokens/radius.md`、影ルールは `tokens/shadows.md` を参照

## NG

- arbitrary value `p-[10px]` / `m-[7px]` の常用
- セクションごとに余白がバラつく（揃いがない）
- 余白を `<div className="h-[24px]" />` のようなスペーサー div で表現する（`mt-6` 等で行う）
- ※ 角丸の NG（`rounded-[20px]` 新規追加 等）は `tokens/radius.md`、影の NG（カラー付きシャドウ常用 等）は `tokens/shadows.md` を参照

---

## 参照

- 既存：`tailwind.config.ts` / `app/globals.css`
- INDEX：`docs/frontend/design-system/INDEX.md`
- 関連トークン：`docs/frontend/design-system/tokens/radius.md` / `tokens/shadows.md`
- レイアウト：`docs/frontend/design-system/layout/grid.md` / `breakpoints.md`
