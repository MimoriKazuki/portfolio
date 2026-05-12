# グリッド

## 実装ファイル（開発後はこちらが正）

- `tailwind.config.ts`（`container` / `gridTemplateColumns: '16': repeat(16, ...)`/ `gridColumn: 'span-7'`）
- 既存利用：`app/components/MainLayout.tsx`（3 カラム想定の MainLayout）/ 各 LP / 各一覧画面

## 概要

Tailwind の `grid` ユーティリティを基本とし、`container` ベースのコンテンツ幅 + レスポンシブ列数で構成する。
Eラーニング刷新でもこの規約を踏襲し、追加の独自グリッドは設けない。

## 使用場面・責務

### 1. コンテナ幅（最大幅）

- LP（B001）：`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- 会員一覧／詳細（B002〜B014）：`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`
- コース視聴画面（B005）：`max-w-screen-2xl mx-auto`（広め・サイドバーを含むため）
- 管理画面（C\*）：`max-w-screen-2xl mx-auto`
- ログイン画面（A001）：中央寄せカード（`max-w-md mx-auto`）

### 2. レスポンシブ列数（カードグリッド）

`tailwind.config.ts` の screens（breakpoints.md 参照）に従う：

| 画面幅 | 列数 |
|-------|------|
| モバイル（<540） | 1 列 |
| `xs`（540〜640） | 2 列（`xs:grid-cols-2`）（既存「モバイル2枚表示開始: 540px」を踏襲） |
| `mid`（720〜900） | 2 列維持 |
| `lg`（900〜1025） | 3 列（`lg:grid-cols-3`）（既存「3列表示開始: 900px」） |
| `wide`（1280〜） | 4 列（`wide:grid-cols-4`）（既存「PC 3列表示開始: 1280px」だがコース・単体動画は密度を上げる） |

カード共通：`grid gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4`

LP プレビュー（横スクロール）の場合：`flex overflow-x-auto snap-x snap-mandatory gap-4 scrollbar-hide`（既存スクロールユーティリティ流用）

### 3. 視聴画面（B005／B007）の 2 カラム

- PC（`xl` 以上）：左サイド（レッスン・関連動画）`xl:w-80 xl:flex-shrink-0` + メイン `flex-1`
- タブレット〜モバイル（`xl` 未満）：縦積み + サイドはボトムシート／Drawer
- グリッドではなく `flex` で構成（既存 LP 等の縦並び主義に整合）

### 4. 管理フォーム（C002〜C007）の 2 カラム

- PC（`lg` 以上）：メインフォーム左 `lg:col-span-8` + サイドカード右 `lg:col-span-4`（`grid grid-cols-12` で表現）
- モバイル：縦積み

### 5. 既存の特殊グリッド

- `tailwind.config.ts` の `extend.gridTemplateColumns: '16': repeat(16, ...)` と `extend.gridColumn: 'span-7': span 7 / span 7` は既存 LP の特殊レイアウト用。Eラーニング刷新では原則使わない（必要時のみ）

### 6. サイドバー（共通 Sidebar）と本文の関係

- 既存 `MainLayout.tsx`：Sidebar + main の左右 2 カラム + Footer の縦並び
- Eラーニング会員ページもこの構造を踏襲
- 管理画面：`AdminSidebar` + main の 2 カラム

### 7. セクションレイアウト（LP 例）

```
<section className="py-16 sm:py-20 lg:py-24">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-semibold mb-8 sm:mb-12">...</h2>
    <div className="grid gap-6 grid-cols-1 xs:grid-cols-2 lg:grid-cols-3">...</div>
  </div>
</section>
```

### 8. カリキュラム（コース詳細／視聴サイド）

- 章 = アウター。`border rounded-lg p-4 mb-3`
- 章タイトル行 = `flex items-center justify-between`
- 章内動画行 = `pl-4 py-2 border-t`（章ヘッダの下に流れる）

## ルール・ビジネスロジック

- 4px 倍数の gap・padding を維持
- 列数は既定のレスポンシブブレークに揃える（独自に追加しない）
- `max-w-*` は画面種別で統一（LP は `7xl`、管理は `screen-2xl` 等）
- 横スクロールカード列は LP プレビューでのみ採用（フィルタ一覧画面では使わない）

## NG

- グリッド列数を画面ごとにバラバラに設計する
- カードを `flex-wrap` で組む（grid を使う）
- LP セクションで `max-w` を指定しない（横幅が伸び切る）
- 視聴画面で動画と関連動画を上下で並べる（視聴体験が劣化）。`xl` 以上で必ず横並びにする
- 管理 DataTable をモバイル幅で表示する前提で複雑な列を組む（PC 前提・モバイルは閲覧のみ）

---

## 参照

- 既存：`tailwind.config.ts` / `app/components/MainLayout.tsx`
- INDEX：`docs/frontend/design-system/INDEX.md`
- ブレークポイント：`docs/frontend/design-system/layout/breakpoints.md`
- スペーシング：`docs/frontend/design-system/tokens/spacing.md`
