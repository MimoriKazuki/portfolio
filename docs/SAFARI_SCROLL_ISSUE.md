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

## 現在のコード状態（2025-01-XX更新）

### 実装ファイル一覧

1. **`app/components/ScrollToTop.tsx`** - メインのスクロールリセットコンポーネント
   - Visual Viewport APIの実装
   - requestAnimationFrameループの実装
   - MutationObserverの実装
   - デバッグ機能の実装

2. **`app/components/SafariLink.tsx`** - Safari用のカスタムLinkコンポーネント
   - リンククリック時のスクロール方向リセット

3. **`app/globals.css`** - CSSによる解決策
   - `scroll-padding-top: 0`の設定
   - アンカー要素の追加

4. **`app/components/ServiceTrainingLP.tsx`** - SafariLinkの使用例
   - 「サービス一覧へ戻る」ボタンでSafariLinkを使用

### 主要な実装詳細

#### ScrollToTop.tsxの主要機能

- **`scrollToTopWithVisualViewport()`**: Visual Viewport APIを使用したスクロールリセット
- **`createScrollMonitor()`**: requestAnimationFrameループで500ms間監視
- **`createDOMObserver()`**: MutationObserverでDOM変更を監視
- **`logScrollDebugInfo()`**: 開発環境でのデバッグ情報出力

#### SafariLink.tsxの機能

- Next.jsの`Link`コンポーネントをラップ
- Safari検出時にリンククリックでスクロール方向をリセット
- 通常のLinkと同じプロパティをサポート

### テスト方法

1. **開発環境でのテスト:**
   - `npm run dev`で開発サーバーを起動
   - iOS Safariでアクセス
   - ブラウザコンソールでデバッグ情報を確認

2. **本番環境でのテスト:**
   - 実際のiOSデバイスでテスト
   - ページ遷移時のスクロール位置を確認
   - 「サービス一覧へ戻る」ボタンが正しく表示されるか確認

### パフォーマンスへの影響

- **requestAnimationFrameループ**: 500ms間のみ実行されるため、影響は限定的
- **MutationObserver**: DOM変更時のみ実行されるため、パフォーマンスへの影響は最小限
- **Visual Viewportイベント**: イベント駆動型のため、オーバーヘッドは低い

### 今後のメンテナンス

- 新しいNext.jsバージョンでの動作確認が必要
- Safariのアップデートで動作が変わる可能性があるため、定期的なテストを推奨
- 問題が解決した場合は、不要になったアプローチを削除してコードを簡素化可能

## 実装した解決策（2025-01-XX）

### アプローチ1: Visual Viewport APIの活用 ✅

**実装内容:**
- `window.visualViewport` APIを使用してSafariのビューポート位置を直接制御
- `visualViewport.pageTop`と`visualViewport.offsetTop`を監視してリセット
- `visualViewport`の`resize`と`scroll`イベントで継続的に監視

**実装場所:**
- `ScrollToTop.tsx`の`scrollToTopWithVisualViewport()`関数
- `visualViewport`イベントリスナーを追加

### アプローチ2: Next.js Linkコンポーネントのカスタマイズ ✅

**実装内容:**
- `SafariLink.tsx`コンポーネントを作成
- リンククリック時にスクロール方向をリセット（1px上にスクロール→0に戻す）
- Safari専用の処理として実装

**実装場所:**
- `app/components/SafariLink.tsx`（新規作成）
- `ServiceTrainingLP.tsx`の「サービス一覧へ戻る」ボタンで使用

### アプローチ3: requestAnimationFrameループでの監視 ✅

**実装内容:**
- ページ遷移直後の500ms間、`requestAnimationFrame`ループでスクロール位置を監視
- スクロール位置が0でない場合、強制的に0にリセット
- Safari専用の処理として実装

**実装場所:**
- `ScrollToTop.tsx`の`createScrollMonitor()`関数

### アプローチ4: MutationObserverによるDOM監視 ✅

**実装内容:**
- ページ遷移時のDOM変更を`MutationObserver`で監視
- メインコンテンツのレンダリング完了を検知してスクロールリセット
- タイムアウト（500ms）でフォールバック

**実装場所:**
- `ScrollToTop.tsx`の`createDOMObserver()`関数

### アプローチ5: CSSによる強制スクロール位置 ✅

**実装内容:**
- `html`と`body`要素に`scroll-padding-top: 0`を設定
- `html::before`でアンカー要素を追加

**実装場所:**
- `globals.css`の`@layer base`セクション

### 統合実装

すべてのアプローチを`ScrollToTop.tsx`に統合し、以下の順序で実行：

1. **リンククリック時**: Visual Viewport APIで即座にリセット
2. **ページ遷移時**: 
   - Visual Viewport APIで即座にリセット
   - requestAnimationFrameループで500ms間監視
   - MutationObserverでDOM変更を監視
   - 複数のタイミング（0, 10, 50, 100, 200ms）でフォールバックリセット
3. **Visual Viewport変更時**: `resize`と`scroll`イベントで継続的に監視

### デバッグ機能

開発環境では、以下のデバッグ情報をコンソールに出力：
- スクロール位置（`window.scrollY`, `document.documentElement.scrollTop`など）
- Visual Viewport情報（`offsetTop`, `pageTop`）
- タイムスタンプ

**使用方法:**
開発環境（`NODE_ENV=development`）でSafariを使用すると、自動的にデバッグ情報が出力されます。

## 未検証のアプローチ（将来の検討事項）

1. **Next.js の experimental.scrollRestoration** 設定
2. **Safari固有のビューポート計算** (`-webkit-fill-available` など)
3. **ページ遷移アニメーション中のスクロール制御**（`overflow: hidden`の使用）

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
最終更新: 2025-01-XX（複数のアプローチを実装・統合）
