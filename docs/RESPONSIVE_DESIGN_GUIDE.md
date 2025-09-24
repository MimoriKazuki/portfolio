# レスポンシブデザインガイドライン

## ブレイクポイント定義

### 📱 モバイル (Mobile)
- **画面幅**: 0px - 640px
- **主なデバイス**: スマートフォン
- **デザイン特徴**:
  - 縦スクロール中心のレイアウト
  - ハンバーガーメニューによるナビゲーション
  - 1カラムレイアウト
  - タッチフレンドリーなボタンサイズ (44px以上)
  - コンパクトな余白とパディング

### 📟 タブレット (Tablet)
- **画面幅**: 641px - 1024px
- **主なデバイス**: iPad、Androidタブレット
- **デザイン特徴**:
  - 横向き・縦向き両方に対応
  - 2カラム〜3カラムレイアウト
  - 中程度の余白とパディング
  - ホバー効果の適用

### 🖥️ PC (Desktop)
- **画面幅**: 1025px以上
- **主なデバイス**: デスクトップ、ノートPC
- **デザイン特徴**:
  - 広い余白を活用したゆとりあるレイアウト
  - 固定ナビゲーション
  - 複数カラムレイアウト
  - リッチなホバー効果とアニメーション

## Tailwind CSS ブレイクポイント対応

### 基本的な記述方法
```css
/* モバイルファースト */
.class-name {
  /* モバイル (0-640px) */
}

/* タブレット以上 */
@media (min-width: 641px) {
  .md\:class-name {
    /* タブレット (641px+) */
  }
}

/* PC以上 */
@media (min-width: 1025px) {
  .xl\:class-name {
    /* PC (1025px+) */
  }
}
```

### カスタムブレイクポイント設定
```javascript
// tailwind.config.js
module.exports = {
  theme: {
    screens: {
      'mobile': {'max': '640px'},
      'tablet': {'min': '641px', 'max': '1024px'},
      'desktop': {'min': '1025px'},
    }
  }
}
```

## 実装ガイドライン

### 1. フォントサイズ
```html
<!-- 見出し -->
<h1 class="text-2xl md:text-3xl xl:text-4xl">

<!-- 本文 -->
<p class="text-sm md:text-base xl:text-lg">
```

### 2. 余白・パディング
```html
<!-- セクション間の余白 -->
<section class="mb-8 md:mb-12 xl:mb-16">

<!-- パディング -->
<div class="px-4 md:px-6 xl:px-8 py-6 md:py-8 xl:py-12">
```

### 3. レイアウト
```html
<!-- グリッドレイアウト -->
<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6 xl:gap-8">

<!-- フレックスレイアウト -->
<div class="flex flex-col md:flex-row items-center md:items-start">
```

### 4. ボタン・インタラクション
```html
<!-- ボタンサイズ -->
<button class="px-4 py-3 md:px-6 md:py-4 xl:px-8 xl:py-5 text-sm md:text-base xl:text-lg">

<!-- ホバー効果（タブレット以上のみ） -->
<div class="md:hover:shadow-lg xl:hover:scale-105 transition-all">
```

## 注意事項

1. **モバイルファースト**: 基本スタイルはモバイル用に記述し、大きな画面向けにオーバーライド
2. **タッチ対応**: モバイルではタップしやすいボタンサイズ（最小44px）を確保
3. **パフォーマンス**: 画像は各デバイスに適したサイズを提供（sizes属性の活用）
4. **アクセシビリティ**: すべてのデバイスで操作しやすいUI/UXを心がける

## テスト方法

### ブラウザ開発者ツール
1. DevTools を開く（F12）
2. デバイスツールバーを有効化（Ctrl+Shift+M）
3. 各ブレイクポイントでの表示を確認
   - モバイル: 375px, 414px, 390px
   - タブレット: 768px, 820px, 1024px  
   - PC: 1280px, 1440px, 1920px

### 実機テスト
- iOS Safari（iPhone, iPad）
- Android Chrome（スマートフォン, タブレット）
- デスクトップブラウザ（Chrome, Firefox, Safari, Edge）

---
*最終更新: 2025年9月24日*