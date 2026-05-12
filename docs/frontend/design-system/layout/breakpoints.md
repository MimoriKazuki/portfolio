# ブレークポイント

## 実装ファイル（開発後はこちらが正）

- `tailwind.config.ts`（`theme.screens`）

## 概要

既存 `tailwind.config.ts` で定義されたブレークポイントを **そのまま採用** する。
独自値（`xs / md / mid / lg / xl / wide / textwide / 2xl / max-mid / max-xl`）は既存サイトの運用に最適化されているため、Eラーニング刷新でも変更しない。

## 使用場面・責務

### 1. 既存ブレークポイント定義

```ts
screens: {
  'xs':       '540px',   // モバイル2枚表示開始
  'sm':       '640px',
  'md':       '641px',   // タブレット開始
  'mid':      '720px',   // 2列表示開始
  'lg':       '900px',   // 3列表示開始
  'xl':       '1025px',  // PC開始
  'wide':     '1280px',  // PC 3列表示開始
  'textwide': '1461px',  // 説明テキスト固定幅開始
  '2xl':      '1536px',
  'max-mid':  { 'max': '719px' },  // 720px 未満
  'max-xl':   { 'max': '1024px' }, // タブレット以下
}
```

### 2. デバイス別の運用想定

| 幅 | 想定デバイス | 用途 |
|----|-------------|------|
| <540 | スマホ縦 | 1 列カード／ボトムシート活用 |
| 540〜640 | 大きめスマホ | 2 列カード開始（`xs`） |
| 640〜720 | 小型タブレット | 2 列カード継続 |
| 720〜900 | タブレット | 2 列維持（`mid`） |
| 900〜1024 | タブレット横〜小型 PC | 3 列カード（`lg`） |
| 1025〜1280 | PC | PC レイアウト本格化（`xl`）／サイドバー復活 |
| 1280〜 | 広 PC | 4 列カード（`wide`） |
| 1536〜 | 超広 PC | コンテナ最大 1400px（既存 `container.2xl: 1400px`） |

### 3. Eラーニング刷新での適用

- カードグリッド：`grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 wide:grid-cols-4`
- 視聴画面 2 カラム：`xl` を境にサイドバー復活
- 管理画面：`xl` 未満は閲覧のみ前提
- LP ヒーロー：`text-4xl xs:text-5xl lg:text-6xl` のように段階的に拡大
- フィルタバー（モバイル）：折りたたみ／ボトムシート、`md` 以上は横並び

### 4. アクセシビリティ／ UX 補足

- iOS Safari の input zoom 防止のため、フォーム要素は `font-size: 16px`（既存 globals.css 規定）
- 縦持ち／横持ちの動画再生は YouTube/Google Drive の埋め込みプレーヤーに任せる（フルスクリーン UI もそちらに委譲）
- スマホ視聴主要シナリオ（DR1：要確認）の場合は、視聴画面のレッスンサイドを `xl` 未満で Drawer / ボトムシートに切替

### 5. 注意点

- `sm:640px` と `md:641px` のように 1px 差で隣接しているのは既存運用の意図的設計（`sm` 系での 2 列を `md` で確実に切り替えるため）
- `max-mid` / `max-xl` は逆方向（max-width）指定で、モバイル限定の挙動を指定するときのみ使う
- `2xl: 1536px` は Tailwind 既定との互換性維持。新規実装で多用しない

## ルール・ビジネスロジック

- 既存ブレークポイントを変えない（影響範囲が大きすぎる）
- 新規実装も既存 screens から選ぶ。独自 px 指定はしない
- スマホ視点を優先するモバイルファースト（utility は最小から書く）

## NG

- arbitrary breakpoint（`[@media(min-width:780px)]:...`）の常用
- `useEffect` + `window.innerWidth` 監視を新規実装で多用（既存はやむなく一部使用しているが、新規は Tailwind の responsive utility を優先）
- ブレークポイント境界での「ガクン」とした崩れ（隣接ブレークの整合確認を行う）

---

## 参照

- 既存：`tailwind.config.ts`
- INDEX：`docs/frontend/design-system/INDEX.md`
- グリッド：`docs/frontend/design-system/layout/grid.md`
