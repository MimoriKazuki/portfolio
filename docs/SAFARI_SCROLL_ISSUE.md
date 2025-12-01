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

## 現在のコード状態（2025-01-XX最終更新）

### 実装ファイル一覧

1. **`app/components/ScrollToTop.tsx`** - メインのスクロールリセットコンポーネント
   - スクロール方向をリセットする`resetScrollDirectionSafari()`関数（Promiseベース）
   - requestAnimationFrameループでの監視（500ms間）
   - 詳細なデバッグ機能の実装
   - DOMのレンダリング完了を待つ処理

2. **`app/components/SafariLink.tsx`** - Safari用のカスタムLinkコンポーネント
   - 現在は通常のLinkと同じ動作（ScrollToTopが処理するため）

3. **`app/globals.css`** - CSSによる解決策
   - `scroll-padding-top: 0`の設定
   - アンカー要素の追加

4. **`app/components/ServiceTrainingLP.tsx`** - SafariLinkの使用例
   - 「サービス一覧へ戻る」ボタンでSafariLinkを使用

### 主要な実装詳細

#### ScrollToTop.tsxの主要機能（最新版）

- **`resetScrollDirectionSafari()`**: Promiseを返すスクロール方向リセット関数
  - 下方向スクロール状態を上方向に変更してから0に戻す
  - 4段階のリセット処理（10px上→20px上→0→最終確認）
  - requestAnimationFrameを3回使用して非同期処理
- **`checkAndReset()`**: requestAnimationFrameループで500ms間監視
  - スクロール位置が0でない場合、`resetScrollDirectionSafari()`を呼び出し
  - ユーザーが20px以上スクロールした場合、監視を停止
- **`resetAfterDOMReady()`**: DOMのレンダリング完了を待ってからスクロールリセット
  - `document.readyState`を確認
  - DOMContentLoadedイベントを待機
- **`logScrollDebugInfo()`**: 詳細なデバッグ情報出力
  - タイミング情報（`performance.now()`）
  - スクロール位置情報
  - Visual Viewport API情報
  - DOM状態情報

#### SafariLink.tsxの機能

- 現在は通常のLinkと同じ動作
- ScrollToTopコンポーネントがリンククリックを検知して処理するため、特別な処理は不要

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

## 実装した解決策の変遷

### フェーズ1: 複数アプローチの統合（2025-01-XX初期）

Visual Viewport API、MutationObserver、requestAnimationFrameループなどを統合したが、Safariでスクロールが常に最上部に戻る問題が発生。

### フェーズ2: 実装の簡素化（2025-01-XX中期）

複数の監視を削除し、シンプルなアプローチに変更。しかし、下方向スクロール時の問題が継続。

### フェーズ3: スクロール方向リセットの実装（2025-01-XX後期）

**実装内容:**
- `resetScrollDirectionSafari()`関数を実装
  - 下方向スクロール状態を上方向に変更してから0に戻す
  - 4段階のリセット処理（10px上→20px上→0→最終確認）
  - Promiseを返すように変更し、完了を待機可能に

**結果:**
- 上方向スクロール時の問題は解決
- 下方向スクロール時の問題は一時的に改善（五分五分の成功率）
- その後、下方向スクロール時に問題が発生する状態に戻る

### フェーズ4: 非同期処理とDOM待機の追加（2025-01-XX最終）

**実装内容:**
- リンククリック時に、スクロール方向のリセットが完了するまで待機
- ページ遷移時に、DOMのレンダリング完了を待ってからスクロールリセット
- 詳細なデバッグ情報を追加（タイミング、スクロール位置、DOM状態など）

**結果:**
- 下方向スクロール時に問題が発生する状態に戻る
- デバッグ情報は出力されるが、根本的な解決には至らず

## 現在の実装（2025-01-XX最終版）

### 主要な関数

1. **`resetScrollDirectionSafari()`**: Promiseを返すスクロール方向リセット関数
   - 下方向スクロール状態を上方向に変更
   - 4段階の非同期処理（requestAnimationFrameを3回使用）
   - 各ステップでデバッグ情報を出力

2. **リンククリック時の処理**:
   - 即座に同期処理でスクロール位置を0に設定
   - 非同期でスクロール方向をリセット（完了を待機）
   - 10ms後に再度リセット
   - 最終確認でスクロール位置が0であることを確認

3. **ページ遷移時の処理**:
   - DOMのレンダリング完了を待つ（`document.readyState`を確認）
   - DOMContentLoadedイベントを待機
   - スクロール方向をリセット
   - requestAnimationFrameループで500ms間監視
   - 複数のタイミング（0ms, 50ms, 100ms, 200ms, 300ms）でフォールバック

### デバッグ機能

開発環境では、以下の詳細なデバッグ情報をコンソールに出力：
- 各処理の開始・完了時刻（`performance.now()`）
- スクロール位置（`window.scrollY`, `document.documentElement.scrollTop`など）
- Visual Viewport API情報（`pageTop`, `offsetTop`）
- DOM状態（`document.readyState`）
- 処理の継続時間

**使用方法:**
開発環境（`NODE_ENV=development`）でSafariを使用すると、自動的にデバッグ情報が出力されます。

## 未検証のアプローチ（将来の検討事項）

1. **Next.js の experimental.scrollRestoration** 設定
2. **Safari固有のビューポート計算** (`-webkit-fill-available` など)
3. **ページ遷移アニメーション中のスクロール制御**（`overflow: hidden`の使用）

## 仮説と調査結果

### 確認された事実

1. **スクロール方向の影響**: 
   - 下方向にスクロールした状態でページ遷移すると問題が発生
   - 上方向にスクロールした状態でページ遷移すると問題が発生しない
   - Safariがスクロール方向を内部的に保持している可能性が高い

2. **タイミングの問題**:
   - 五分五分の成功率ということは、タイミングの競合が発生している可能性
   - リンククリック時の処理とNext.jsのナビゲーションタイミングの競合
   - DOMのレンダリングタイミングとスクロールリセットのタイミングのずれ

3. **非同期処理の限界**:
   - `requestAnimationFrame`を使用した非同期処理では、Safariの内部状態を完全にリセットできない可能性
   - Promiseベースの処理でも、Next.jsのナビゲーションが先に実行される場合がある

### 仮説

1. **Safariの内部スクロール状態**: Safariが「最後のスクロール方向」を内部的に保持しており、これがページ遷移時に影響している可能性が高い
2. **Next.js クライアントナビゲーションのタイミング**: Next.jsのクライアントサイドナビゲーションが、スクロール方向のリセット処理を上書きしている可能性
3. **Safariのスクロール方向リセットのタイミング**: Safariのスクロール方向の内部状態をリセットするには、ページ遷移前に確実に完了させる必要があるが、Next.jsのナビゲーションが非同期で実行されるため、タイミングが合わない可能性
4. **DOMのレンダリングタイミング**: ページ遷移直後にDOMがレンダリングされる前にスクロール位置をリセットしても、Safariが内部状態を更新する前にナビゲーションが完了してしまう可能性

## 未解決の問題と次のステップ

### 現在の状態（2025-01-XX）

- **上方向スクロール時**: 問題なし ✅
- **下方向スクロール時**: 問題が発生する状態に戻る ❌
- **成功率**: 五分五分（タイミングに依存）

### 考えられる根本原因

1. **Safariのスクロール方向の内部状態が、JavaScriptから完全に制御できない**
   - `requestAnimationFrame`や`setTimeout`では、Safariの内部状態を確実にリセットできない可能性
   - Safariのスクロール方向は、ページ遷移時に自動的に引き継がれる可能性

2. **Next.jsのクライアントナビゲーションとSafariの内部処理の競合**
   - Next.jsのナビゲーションが、スクロール方向のリセット処理を上書きしている可能性
   - ナビゲーションのタイミングを制御する必要がある可能性

3. **DOMのレンダリングタイミングとSafariのスクロール状態の更新タイミングのずれ**
   - DOMがレンダリングされる前にスクロール位置をリセットしても、Safariが内部状態を更新する前にナビゲーションが完了してしまう可能性

### 次のステップ（推奨される調査・実装）

1. **Next.jsのナビゲーションを遅延させる**
   - リンククリック時に、スクロール方向のリセットが完了するまでナビゲーションを遅延させる
   - `e.preventDefault()`を使用してナビゲーションを一時的に停止し、リセット完了後に手動でナビゲーションを実行

2. **Safariのスクロール方向を強制的にリセットする別の方法を調査**
   - Safariの内部APIやWebKitのバグレポートを調査
   - 他のWebサイトで同様の問題を解決している方法を調査

3. **ページ遷移前のスクロール位置の固定**
   - リンククリック時に、スクロール位置を0に固定し、遷移完了まで維持する
   - `position: fixed`や`overflow: hidden`を使用してスクロールを一時的に無効化

4. **Next.jsのLinkコンポーネントを完全にラップ**
   - カスタムLinkコンポーネントを作成し、ナビゲーションのタイミングを完全に制御
   - `router.push()`を使用して、スクロール方向のリセット後に手動でナビゲーションを実行

5. **Safariのバグレポートを確認**
   - [WebKit Bug #169509](https://bugs.webkit.org/show_bug.cgi?id=169509)の最新の状況を確認
   - 他の開発者が報告している解決策を調査

### デバッグ情報の活用

現在の実装では、開発環境で詳細なデバッグ情報が出力されます。以下の情報を確認することで、問題の原因を特定できる可能性があります：

- リンククリックからページ遷移までの時間
- スクロール方向のリセット処理の完了時間
- DOMのレンダリングタイミング
- 最終的なスクロール位置

**成功時と失敗時の違い**を確認することで、タイミングの問題を特定できる可能性があります。

## 連絡事項

- Chromeでは問題が解決しているため、Safari専用の修正が必要
- ユーザー体験に影響するため、優先度は高い
- 「サービス一覧へ戻る」ボタンが半分隠れる程度のオフセット（約30-50px程度）
- 上方向スクロール時は問題なく動作するため、下方向スクロール時の問題に焦点を当てる必要がある
- タイミングの問題が原因の可能性が高いため、Next.jsのナビゲーションタイミングを制御する方法を検討する必要がある

---

作成日: 2025-12-02
最終更新: 2025-01-XX（スクロール方向リセットの実装、非同期処理とDOM待機の追加、デバッグ強化）
