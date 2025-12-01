# iOS Safari スクロール位置問題 - 引き継ぎ書

## 問題概要

iOS Safariにおいて、ページ遷移時にスクロール位置が最上部(0,0)にリセットされず、**約30-50px下がった位置**から表示される問題。

## 発生環境

- **ブラウザ**: iOS Safari（**Chromeでは解決済み**）
- **フレームワーク**: Next.js 15.5.4 App Router
- **デバイス**: iPhone（iOS Safari）
- **確認日**: 2025-12-02

## 再現手順

1. 任意のページ（例: `/services/comprehensive-ai-training`）で**下方向にスクロール**する
2. スクロールを**停止**する
3. ページ内のリンク（例:「サービス一覧へ戻る」ボタン）を**タップ**する
4. 遷移先ページが**少し下がった位置から表示される**

### 重要な再現条件

| 条件 | 結果 |
|-----|------|
| **下方向にスクロール後にタップ** | ❌ 問題発生 |
| **上方向にスクロール後にタップ** | ✅ 問題発生しない |
| **スクロールせずにタップ** | ✅ 問題発生しない |

**スクロール方向が決定的な要因**

---

## 技術的背景

### プロジェクト構造

```
app/
├── layout.tsx              # ルートレイアウト
├── globals.css             # グローバルCSS
├── components/
│   ├── MainLayout.tsx      # メインレイアウト
│   ├── MobileHeader.tsx    # 固定ヘッダー（position: fixed, h-16 = 64px）
│   ├── ScrollToTop.tsx     # スクロールリセットコンポーネント
│   └── SafariLink.tsx      # Safari用カスタムLinkコンポーネント
```

### レイアウト構造

```
<body>
  <div id="top" />                    <!-- アンカー要素 -->
  <div />                             <!-- Next.js scroll anchor -->
  <div className="fixed ..." />       <!-- 背景 -->
  <ScrollToTop />
  {children}
</body>
```

### 関連するCSS

```css
/* globals.css */
html {
  scroll-padding-top: 0;
  scroll-margin-top: 0;
}

body {
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  padding-top: env(safe-area-inset-top, 0);
}

@supports (-webkit-touch-callout: none) {
  html { scroll-behavior: auto !important; }
  body { min-height: -webkit-fill-available; }
}
```

### Chromeで解決した修正

Next.js App Routerの既知のバグ（[#49427](https://github.com/vercel/next.js/issues/49427)）に対応：
- `layout.tsx` と `MainLayout.tsx` の fixed要素の前に空の `<div />` を配置
- これによりChromeでは問題が解決

---

## 試行した対策と結果（2025-12-02 最新）

### 1. JavaScript スクロールリセット

| 試行内容 | 結果 |
|---------|------|
| `window.scrollTo(0, 0)` | ❌ Safari効果なし |
| `document.documentElement.scrollTop = 0` | ❌ Safari効果なし |
| `document.body.scrollTop = 0` | ❌ Safari効果なし |
| `scrollIntoView({ block: 'start', behavior: 'instant' })` | ❌ Safari効果なし |
| 複数タイミングでのsetTimeout (0〜300ms) | ❌ Safari効果なし |
| requestAnimationFrameループ（500ms監視） | ❌ Safari効果なし |
| `history.scrollRestoration = 'manual'` | ❌ Safari効果なし |
| 複数のスクロールAPIを同時使用 | ❌ Safari効果なし |

### 2. ナビゲーション制御

| 試行内容 | 結果 |
|---------|------|
| `e.preventDefault()` + `router.push()` | ❌ Safari効果なし |
| `router.push(url, { scroll: false })` | ❌ Safari効果なし |
| **ハードナビゲーション** (`window.location.href`) | ❌ Safari効果なし |
| **アンカー付きナビゲーション** (`url#top`) | ❌ Safari効果なし |

### 3. body凍結アプローチ

| 試行内容 | 結果 |
|---------|------|
| リンククリック時に `body.style.position = 'fixed'` | ❌ Safari効果なし |
| `body.style.top = -scrollY + 'px'` で位置固定 | ❌ Safari効果なし |
| ナビゲーション後に凍結解除 | ❌ Safari効果なし |

### 4. CSS対策

| 試行内容 | 結果 |
|---------|------|
| `min-height: 100dvh` (動的ビューポート) | ❌ Safari効果なし |
| `min-height: -webkit-fill-available` | ❌ Safari効果なし |
| `env(safe-area-inset-top)` | ❌ Safari効果なし |
| `scroll-behavior: auto !important` | ❌ Safari効果なし |
| `scroll-padding-top: 0` | ❌ Safari効果なし |

### 5. ビューポート再計算

| 試行内容 | 結果 |
|---------|------|
| **スクロールジョルト** (`scrollTo(0,1)` → `scrollTo(0,0)`) | ❌ Safari効果なし |
| useLayoutEffectで描画前にリセット | ❌ Safari効果なし |
| 複数回のジョルト実行（100ms, 300ms遅延） | ❌ Safari効果なし |

### 6. DOM構造

| 試行内容 | 結果 |
|---------|------|
| fixed要素の前に空の `<div />` を配置 | ✅ Chrome解決、❌ Safari効果なし |
| `<div id="top">` アンカー要素を最上部に追加 | ❌ Safari効果なし |

---

## 重大な発見

### ハードナビゲーションでも解決しない

`window.location.href`による**完全なページリロード**でも問題が発生することが判明。

**これが意味すること:**
1. 問題はNext.js SPAナビゲーション固有ではない
2. 問題はJavaScriptのスクロール処理の問題ではない
3. **Safariのブラウザレベルの動作**が原因の可能性が高い

### アンカーリンクでも解決しない

`#top`アンカーを使用したブラウザネイティブのスクロール機能でも問題が発生。

**これが意味すること:**
- Safariのネイティブスクロール機能自体が、何らかの状態を保持している

---

## 現在の仮説

### 仮説1: Safariのアドレスバー状態

iOS Safariでは:
- **下にスクロール** → アドレスバーが縮小（ビューポートが拡大）
- **上にスクロール** → アドレスバーが拡大（ビューポートが縮小）

ページ遷移時に、Safariが「アドレスバーの状態」を保持しており、新しいページの初期レンダリング位置に影響を与えている可能性。

### 仮説2: Visual Viewport vs Layout Viewport

Safariは Visual Viewport と Layout Viewport を区別して管理しており、ページ遷移時にこれらの状態が正しく同期されていない可能性。

### 仮説3: Safariの内部スクロール状態

Safariが「最後のスクロール方向」を内部的に保持しており、この状態がJavaScriptからアクセス・リセットできない可能性。

---

## 現在のコード状態

### SafariLink.tsx（最新版）

```typescript
// リンククリック時の処理フロー
1. e.preventDefault() でナビゲーション停止
2. freezeBodyScroll() - body を position: fixed に
3. 50ms 待機
4. forceScrollToTopAllMethods() - 複数のスクロールAPIを同時使用
5. window.location.href = url + '#top' - ハードナビゲーション + アンカー
```

### ScrollToTop.tsx（最新版）

```typescript
// ページ遷移時の処理
1. useLayoutEffect で描画前にスクロールリセット
2. スクロールジョルト（1px→0px）でビューポート再計算を強制
3. 100ms, 300ms 後にも再度ジョルト実行
4. requestAnimationFrame ループで500ms間監視
```

### globals.css（最新版）

```css
body {
  min-height: 100dvh;
  min-height: -webkit-fill-available;
  padding-top: env(safe-area-inset-top, 0);
}

@supports (-webkit-touch-callout: none) {
  html { scroll-behavior: auto !important; }
  body { min-height: -webkit-fill-available; }
}
```

---

## 未検証のアプローチ

1. **iframeを使用したナビゲーション** - 完全に別のコンテキストでページをロード
2. **Service Worker によるナビゲーション制御**
3. **Safari固有のmeta viewport設定**
4. **CSS `position: sticky` への変更**（fixed要素を全てstickyに）
5. **ページ遷移アニメーション**（フェードアウト→フェードイン）でスクロール状態をマスク
6. **WebKit Bug Tracker での類似問題の調査**
7. **Safari Technology Preview での動作確認**

---

## 参考リンク

- [Next.js Issue #49427](https://github.com/vercel/next.js/issues/49427) - Scroll position not reset
- [Apple Developer Forums - Safari JS scroll](https://developer.apple.com/forums/thread/703294)
- [Stack Overflow - iOS Safari scroll issues](https://stackoverflow.com/questions/79753701/ios-26-safari-web-layouts-are-breaking-due-to-fixed-sticky-position-elements-g)
- [WebKit Bug #169509](https://bugs.webkit.org/show_bug.cgi?id=169509) - Safari scroll direction state

---

## 連絡事項

- **Chromeでは解決済み**（空のdiv配置で対応）
- **Safari専用の修正が必要**
- オフセットは約**30-50px**（ヘッダーに半分隠れる程度）
- **上方向スクロール後は問題なし**、下方向スクロール後のみ問題発生
- **ハードナビゲーション + アンカーリンク**でも解決しないため、問題はブラウザレベル

---

作成日: 2025-12-02
最終更新: 2025-12-02（Claude Opusによる大幅更新 - 追加検証結果を反映）
