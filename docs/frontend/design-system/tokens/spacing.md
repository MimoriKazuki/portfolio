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

### 2. 角丸

`tailwind.config.ts` の `borderRadius` ルール：

| トークン | 計算 | 概算 | 用途 |
|---------|------|------|------|
| `rounded-lg` | `var(--radius)` | 12px | カード基本（既存 `--radius: 0.75rem`） |
| `rounded-md` | `calc(var(--radius) - 2px)` | 10px | ボタン・Input |
| `rounded-sm` | `calc(var(--radius) - 4px)` | 8px | バッジ・小要素 |
| `rounded`（Tailwind 既定） | 4px | 4px | 既定（既存 `ELearningCard` の `rounded`） |
| `rounded-full` | - | 円 | アバター・再生ボタンオーバーレイ・ピル形バッジ |

新規 UI も上記から選ぶ。

### 3. 影（shadow）

Tailwind の `shadow-sm` / `shadow` / `shadow-md` / `shadow-lg` / `shadow-xl` を既定スケールで採用。

| 用途 | 推奨 |
|------|------|
| 通常カード（既定） | `shadow-md` |
| hover 強調 | `hover:shadow-lg` + `hover:-translate-y-1`（既存 `video-card` 派生） |
| モーダル | `shadow-xl` + 半透明オーバーレイ |
| Toast | `shadow-lg` |
| ボタン | 既定 `shadow-none`（既存 button.tsx）／variant により `shadow-sm` |

### 4. レイアウト余白の基準

#### 4-1. ページ最大幅・コンテナ

- `tailwind.config.ts` の `container`：`center: true` / `padding: '2rem'` / `screens.2xl: 1400px`
- LP のコンテナは `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`（既存 LP に多い）
- 管理画面のコンテナは `max-w-screen-2xl mx-auto`（広め）

#### 4-2. セクション縦余白

- LP セクション：`py-16 sm:py-20 lg:py-24`
- 通常ページ：`py-8 sm:py-12`
- カード内：`p-4`〜`p-6`

#### 4-3. グリッド gap

- カード一覧：`gap-6` 既定。狭めに揃えたいときは `gap-4`
- フォーム：`space-y-4` 既定。セクション間は `space-y-8`
- ボタン群：`gap-2`（横並び）

### 5. line-clamp / 折り返し

- カードタイトル：`line-clamp-2`
- カード説明：`line-clamp-3`
- LP ヒーロー：折り返し許容（`max-w-3xl`）

### 6. 視聴画面（B005／B007）の具体

- 動画プレーヤー：`aspect-video w-full`
- メイン左右余白：`px-4 sm:px-6 lg:px-8`
- レッスンサイド幅：`xl:w-80`（320px 目安・PC のみ）
- タブと動画の間隔：`mt-6 lg:mt-8`

### 7. 管理 DataTable

- 行高さ：`py-3`（既定 12px 上下）
- 列パディング：`px-4`
- 一括選択チェック列：`w-10`

## ルール・ビジネスロジック

- 4px の倍数（`p-1` / `p-2` / `p-3` / `p-4` / `p-6` / `p-8` ...）を優先する
- 非標準（`p-[10px]` 等）は使わない
- セクション間の余白は LP では `py-16` 以上を基本（息を持たせる）。管理画面では `py-6`〜`py-8`
- 影は `shadow-md` 既定。LP のヒーローキャッチは影を付けない
- カードホバーは `hover:shadow-lg hover:-translate-y-1`（既存 `video-card` パターン）

## NG

- arbitrary value `p-[10px]` / `m-[7px]` の常用
- セクションごとに余白がバラつく（揃いがない）
- 角丸を新規追加（`rounded-[20px]`）
- 影を独自カラー（`shadow-blue-500/20`）で多用する
- 余白を `<div className="h-[24px]" />` のようなスペーサー div で表現する（`mt-6` 等で行う）

---

## 参照

- 既存：`tailwind.config.ts` / `app/globals.css`
- INDEX：`docs/frontend/design-system/INDEX.md`
- レイアウト：`docs/frontend/design-system/layout/grid.md` / `breakpoints.md`
