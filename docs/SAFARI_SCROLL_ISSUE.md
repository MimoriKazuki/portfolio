# iOS Safari スクロール位置問題 - 引き継ぎ書

## 問題概要

iOS Safariにおいて、ページ遷移時にスクロール位置が最上部(0,0)にリセットされず、少し下がった位置から表示される問題。

## 発生環境

- **ブラウザ**: iOS Safari（Chromeでは解決済み）
- **フレームワーク**: Next.js 14+ App Router
- **デバイス**: iPhone（iOS Safari）

## 再現手順

1. 任意のページで**下方向にスクロール**する
2. スクロールを**停止**する
3. ページ内のリンクを**タップ**する
4. 遷移先ページが**少し下がった位置から表示される**（「サービス一覧へ戻る」ボタンがヘッダーに半分隠れる程度）

### 重要な再現条件

- **下方向にスクロール中に止まってタップ** → 問題発生
- **下方向にスクロール後、少しでも上にスクロールしてからタップ** → 問題発生しない
- スクロール方向が関係している可能性が高い

## 技術的背景

### プロジェクト構造

```
app/
├── layout.tsx          # ルートレイアウト（空のdivあり）
├── globals.css         # グローバルCSS
├── components/
│   ├── MainLayout.tsx  # メインレイアウト（空のdivあり）
│   ├── MobileHeader.tsx # 固定ヘッダー（h-16 = 64px）
│   └── ScrollToTop.tsx  # スクロールリセットコンポーネント
```

### 関連するCSS/レイアウト構造

1. **MobileHeader**: `position: fixed`, 高さ64px
2. **MainLayout**: コンテンツに `py-8`（32px）のパディング
3. **サービス詳細ページ**: ヒーローセクションに `-mt-8`（負のマージン）

### Chromeで解決した修正

Next.js App Routerの既知のバグ（[#49427](https://github.com/vercel/next.js/issues/49427)）に対応：
- `layout.tsx` と `MainLayout.tsx` の fixed要素の前に空の `<div />` を配置
- これにより `findDOMNode()` が正しいスクロール対象を検出できるようになった

## 試行した対策と結果

### 1. JavaScript スクロールリセット

| 試行内容 | 結果 |
|---------|------|
| `window.scrollTo(0, 0)` | ❌ Safari効果なし |
| `document.documentElement.scrollTop = 0` | ❌ Safari効果なし |
| `document.body.scrollTop = 0` | ❌ Safari効果なし |
| `scrollIntoView({ block: 'start' })` | ❌ Safari効果なし |
| `scrollTo(0, -100)` で負の位置へ | ❌ Safari効果なし |
| 複数タイミングでのsetTimeout (0, 10, 50, 100, 200ms) | ❌ Safari効果なし |
| `history.scrollRestoration = 'manual'` | ❌ Safari効果なし |

### 2. CSS 修正

| 試行内容 | 結果 |
|---------|------|
| `min-height: 100vh` → `100%` に変更 | ❌ Safari効果なし |
| `position: relative` を body から削除 | ❌ Safari効果なし |
| `-webkit-overflow-scrolling: touch` を削除 | ❌ Safari効果なし |
| `scroll-behavior: auto` を設定 | ❌ Safari効果なし |
| `overscroll-behavior: none` を設定 | ⚠️ スワイプリロードが無効になり却下 |

### 3. イベントハンドリング

| 試行内容 | 結果 |
|---------|------|
| リンククリック時に capture フェーズでスクロールリセット | ❌ Safari効果なし |
| `overflow: hidden` でモメンタムスクロール停止 | ❌ Chromeまで壊れたため却下 |
| スクロール方向リセット（1px上にスクロール→0） | ❌ Safari効果なし |

### 4. DOM 構造修正

| 試行内容 | 結果 |
|---------|------|
| fixed要素の前に空の `<div />` を配置 | ✅ Chrome解決、❌ Safari効果なし |
| ページ最上部にアンカー要素 `#page-top` を配置 | ❌ Safari効果なし |

## 参考リンク

- [Next.js Issue #49427](https://github.com/vercel/next.js/issues/49427) - Scroll position not reset when dynamic segment changes
- [Next.js Issue #45187](https://github.com/vercel/next.js/issues/45187) - Clicking a Link doesn't scroll to top
- [StackOverflow: window.scrollTo not working on Safari](https://stackoverflow.com/questions/24616322/mobile-safari-why-is-window-scrollto0-0-not-scrolling-to-0-0)
- [StackOverflow: Force stop momentum scrolling](https://stackoverflow.com/questions/16109561/force-stop-momentum-scrolling-on-iphone-ipad-in-javascript)
- [WebKit Bug #169509](https://bugs.webkit.org/show_bug.cgi?id=169509) - Safari scroll direction state bug

## 現在のコード状態

### ScrollToTop.tsx

```typescript
'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

function isSafari(): boolean {
  if (typeof navigator === 'undefined') return false
  const ua = navigator.userAgent
  return /Safari/.test(ua) && !/Chrome/.test(ua) && !/CriOS/.test(ua)
}

function scrollToAbsoluteTop() {
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.body.scrollIntoView({ block: 'start', behavior: 'instant' })
}

function forceScrollToTopSafari() {
  window.scrollTo(0, -100)
  window.scrollTo(0, 0)
  document.documentElement.scrollTop = 0
  document.body.scrollTop = 0
  document.documentElement.scrollIntoView({ block: 'start', behavior: 'instant' })
}

export default function ScrollToTop() {
  const pathname = usePathname()

  useEffect(() => {
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual'
    }

    if (isSafari()) {
      const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement
        const link = target.closest('a')
        if (link) {
          const href = link.getAttribute('href')
          if (href && href.startsWith('/') && !href.includes('#')) {
            forceScrollToTopSafari()
          }
        }
      }
      document.addEventListener('click', handleClick, { capture: true })
      return () => document.removeEventListener('click', handleClick, { capture: true })
    }
  }, [])

  useEffect(() => {
    if (isSafari()) {
      forceScrollToTopSafari()
      setTimeout(forceScrollToTopSafari, 0)
      setTimeout(forceScrollToTopSafari, 10)
      setTimeout(forceScrollToTopSafari, 50)
      setTimeout(forceScrollToTopSafari, 100)
    } else {
      scrollToAbsoluteTop()
    }
  }, [pathname])

  return null
}
```

## 未検証のアプローチ

1. **Visual Viewport API** の使用
2. **Next.js の experimental.scrollRestoration** 設定
3. **Safari固有のビューポート計算** (`-webkit-fill-available` など)
4. **ページ遷移アニメーション中のスクロール制御**
5. **MutationObserver** でDOM変更を監視してスクロールリセット
6. **requestAnimationFrame** ループでのスクロール監視・リセット
7. **Next.js Link コンポーネントのカスタマイズ**（onClickで独自処理）

## 仮説

1. **Safariの内部スクロール状態**: Safariが「最後のスクロール方向」を内部的に保持しており、これがページ遷移時に影響している可能性
2. **ビューポート計算の違い**: Safariのビューポート計算がChromeと異なり、スクロール位置0が実際には少し下の位置を指している可能性
3. **Next.js クライアントナビゲーションのタイミング**: Next.jsのクライアントサイドナビゲーション中のスクロール制御とSafariの内部処理の競合

## 連絡事項

- Chromeでは問題が解決しているため、Safari専用の修正が必要
- ユーザー体験に影響するため、優先度は高い
- 「サービス一覧へ戻る」ボタンが半分隠れる程度のオフセット（約30-50px程度）

---

作成日: 2025-12-02
最終更新: 2025-12-02
