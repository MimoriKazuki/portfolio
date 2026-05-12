# タイポグラフィ

## 実装ファイル（開発後はこちらが正）

- `app/globals.css`（`@layer base` 内のフォント重みルール、`--font-primary`）
- `tailwind.config.ts`（`extend.fontFamily`）
- フォント読み込み：Next.js `next/font/google`（`Noto Sans JP`）/ Adobe Fonts（`acumin-pro` の Typekit kit）
- 既存 layout：`app/layout.tsx`（フォント初期化）

## 概要

既存実装から抽出したタイポグラフィ定義。欧文 `acumin-pro` + 和文 `Noto Sans JP` のスタックを採用。
重み（weight）は要素別に既定値が `globals.css` で定義済み。Eラーニング刷新でもこの規約を踏襲する。

## 使用場面・責務

### 1. フォントファミリー

```css
--font-primary: "acumin-pro", var(--font-noto-sans-jp), sans-serif;
```

Tailwind 側：

| トークン | スタック | 用途 |
|---------|---------|------|
| `font-sans` | `acumin-pro, var(--font-noto-sans-jp), sans-serif` | 既定（全本文・見出し） |
| `font-handwriting` | `var(--font-caveat), cursive` | 手書き風（限定用途・既存 LP） |

`acumin-pro` の表示安定性確保のため、Adobe Fonts の kit 読み込みを継続。Phase 1 で読み込み方式は変えない。

### 2. 重み（weight）の既定ルール（`globals.css` から抽出）

| 要素 | weight | 値 |
|------|--------|----|
| body | regular | 400 |
| h1 | bold | 700 |
| h2 | semibold | 600 |
| h3〜h6 | medium | 500 |
| button / [type=button] / [type=submit] / [type=reset] / `a[class*="btn"]` / `a[class*="px-"][class*="py-"]` | light | 300 |
| label | regular | 400 |
| strong / b | semibold | 600 |
| a（リンク） | regular | 400 |

→ Tailwind の `font-bold` / `font-semibold` / `font-medium` / `font-normal` / `font-light` を併用してよい。`globals.css` 既定と整合させる。

### 3. サイズスケール（Tailwind 既定を採用）

既存実装は Tailwind の `text-xs` 〜 `text-5xl` を素直に使っている。新規 UI も同スケールで設計する。

| 用途 | 推奨 Tailwind |
|------|--------------|
| 補助テキスト・キャプション | `text-xs`（12px）／ `text-sm`（14px） |
| 本文・カード説明 | `text-sm`（14px）／ `text-base`（16px） |
| カード見出し | `text-base`（16px）／ `text-lg`（18px） |
| ページタイトル H1 | `text-2xl`（24px）〜 `text-4xl`（36px） |
| LP ヒーロー | `text-4xl`（36px）〜 `text-6xl`（60px） |
| 数値強調（実績数値） | `text-3xl`〜`text-5xl` + `font-bold` |

### 4. 行間・字間

- 行間：本文 `leading-relaxed`（1.625）／見出し `leading-tight`（1.25）／カード説明 `leading-relaxed`（既存運用踏襲）
- 字間：既定（`tracking-normal`）。LP の大見出しのみ必要に応じて `tracking-tight`／`tracking-wider`

### 5. ヘッディング運用（業務ガイドライン）

- 1 ページ 1 つの h1（SEO・アクセシビリティの観点）
- LP ヒーローのキャッチコピーが h1（B001）
- コース詳細のコース名が h1（B004）
- 単体動画詳細の動画タイトルが h1（B007）
- 章タイトルは h2、コース内動画タイトルは h3 を基本（B004 / B005）
- 管理画面の画面タイトルは h1、セクション見出しは h2

### 6. リンク・強調

- リンク：`a` は weight 400・色は `--primary`／`text-blue-600` 系（既存 `column-content` ルール）
- 強調：`strong` / `b` は weight 600。色は `text-gray-900`（既存ルール）
- マーカー：`mark` は `bg-yellow-200`（既存・記事用）

### 7. iOS 入力 zoom 抑制

`globals.css` で input 系の `font-size: 16px` を強制中。新規フォームでもこのサイズを下回らない（`text-base`）。

### 8. Eラーニング刷新で踏襲する具体

- LP ヒーロー：h1 = `text-4xl xs:text-5xl lg:text-6xl font-bold leading-tight`
- バリュー訴求カード：h3 = `text-lg font-medium` / 本文 = `text-sm leading-relaxed text-muted-foreground`
- コース／単体動画カード：タイトル = `font-semibold line-clamp-2`（既存 `ELearningTopClient` 準拠）
- ボタン：weight 300（既存 globals.css ルール）。サイズは `text-sm`（既存 shadcn `button.tsx` の default）
- ステータスバッジ：`text-xs font-medium`
- 価格表示：`font-semibold text-base`（無料は `text-green-700 font-medium`）

## ルール・ビジネスロジック

- 新規にフォント追加はしない。既存 `acumin-pro` + `Noto Sans JP` を踏襲
- weight を要素 inline で頻繁に上書きしない（既存ルールで足りる範囲を優先）
- 見出しレベルを「装飾だけの理由」で h タグで切らない（必要なら `<p className="text-2xl font-bold">`）
- カード見出しは `line-clamp-2`、説明は `line-clamp-3` を既定（既存運用に整合）

## NG

- 行内 `style={{ fontSize: '...' }}` 直書き
- 任意 px 値（`text-[13px]`）の常用
- 別のフォントファミリーを LP や管理画面で使う
- weight 800（extra-bold）以上を Eラーニング系で使う（既存運用にない）
- ボタンに `font-bold` を付与する（既定 weight 300 ルールに反する）

---

## 参照

- 既存：`app/globals.css` / `tailwind.config.ts` / `app/layout.tsx`
- INDEX：`docs/frontend/design-system/INDEX.md`
- カラー：`docs/frontend/design-system/tokens/colors.md`
