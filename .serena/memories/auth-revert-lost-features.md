# 956909cへのリバートで失われた機能

## リバート日時
2025-12-08

## 失われた機能一覧

### 1. MobileHeader (モバイルヘッダー)
- ログイン/ログアウトボタン
- ユーザーメールアドレス表示
- 認証メニューポップアップ
- 認証状態の監視（useEffect内のonAuthStateChange）

### 2. FixedBottomElements (固定ボトム要素)
- `paidAccessChecked` 状態管理
- `hasPaidAccess` 状態管理
- 無料ユーザー向け購入促進バナー (`showPurchaseBanner`)
- `PurchasePromptModal` との連携
- 有料アクセスチェックロジック（user_idでpurchasesテーブルを確認）

### 3. AuthButton (認証ボタン)
- `skipBrowserRedirect: true` オプション（同じタブでログインリダイレクト）
- ※基本的な認証機能は維持されている

## 再実装時の注意点
- 複数コンポーネントで同時に`getUser()`を呼び出すとonAuthStateChangeが発火しない問題が発生した可能性
- 再実装時は1つずつ機能を追加し、各段階で本番環境でテストすること
- MobileHeaderへの認証追加は特に慎重に（これが問題の原因の可能性が高い）

## 再実装の優先順位
1. まず956909cで動作確認
2. AuthButtonの`skipBrowserRedirect: true`を追加してテスト
3. FixedBottomElementsの購入バナー機能を追加してテスト
4. 最後にMobileHeaderの認証機能を追加してテスト
