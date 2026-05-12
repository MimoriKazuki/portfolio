# セキュリティインシデント対応計画

## 対象プロジェクト
- プロジェクト名：AI駆動研究所 ポートフォリオ／メディアサイト
- 本番URL：https://www.landbridge.ai/
- 作成日：2026-05-12
- 最終更新：2026-05-12

---

## 1. インシデントの分類

| レベル | 定義 | 例 |
|---|---|---|
| **Critical** | サービス停止・個人情報漏洩・不正アクセス成功 | DBダンプ流出・管理者権限の奪取・Stripe連携の改ざん |
| **High** | 脆弱性の悪用・データ改ざんの疑い | SQLインジェクション成功・認証バイパス・RLS突破 |
| **Medium** | 脆弱性の発見（悪用未確認）| セキュリティスキャンでの検出・npm audit HIGH |
| **Low** | 軽微な設定ミス・情報開示 | バージョン情報の露出・パスのリーク |

---

## 2. 初動対応フロー（発見から1時間以内）

```
インシデント発見
    ↓
レベル判定（上記分類表を参照）
    ↓
Critical / High → 即座にサービス停止を検討
Medium / Low    → 通常業務を継続しながら調査
    ↓
関係者に連絡（下記連絡先参照）
    ↓
証拠保全（ログ・スクリーンショット・再現手順）
    ↓
原因調査・暫定対応
    ↓
恒久対応・再発防止
```

---

## 3. 連絡先

| 役割 | 名前 | 連絡方法 |
|---|---|---|
| 開発責任者 / ディレクター | Kosuke | info@landbridge.co.jp |
| インフラ担当（Vercel） | Kosuke | （Vercel ダッシュボード経由） |
| DB 担当（Supabase） | Kosuke | （Supabase ダッシュボード経由・project_id: mtyogrpeeeggqoxzvyry） |

---

## 4. 即時対応チェックリスト

### サービス停止が必要な場合
- [ ] Vercel ダッシュボードからデプロイメントを一時停止する
- [ ] メンテナンスページに切り替える
- [ ] 問題のあるエンドポイントへのアクセスをブロック（Vercel Edge Config / 環境変数）
- [ ] クライアントに第一報を送る（発生事象・現在の状況・次の報告タイミング）

### 証拠保全
- [ ] Vercel ログを保存する（上書きされる前に）
- [ ] Supabase ログを保存する（auth / database / postgrest）
- [ ] 問題が発生した時刻・操作・エラー内容を記録する
- [ ] スクリーンショットを撮る

### 個人情報漏洩の疑いがある場合
- [ ] 漏洩した可能性のあるデータの範囲を特定する（e_learning_users / auth.users / contacts 等）
- [ ] 該当ユーザーへの通知要否を判断する
- [ ] 個人情報保護法に基づく報告要否を確認する（漏洩が72時間以内に確定した場合）
- [ ] Stripe 関連の場合は Stripe Dashboard で該当 PaymentIntent / Customer を確認する

### Supabase RLS 関連の場合
- [ ] 該当テーブルの RLS ポリシーを Supabase Dashboard で確認する
- [ ] anon ロールでの READ/WRITE 権限を一時的に剥奪する選択肢を検討する
- [ ] 影響を受けたレコード件数を `get_advisors` / `execute_sql` で集計する

---

## 5. 事後対応

### 報告書の作成（インシデント解決後1週間以内）
- 発生日時・発見日時
- 影響範囲（ユーザー数・データ種類）
- 原因
- 対応内容
- 再発防止策

### 再発防止
- セキュリティスキャン（SAST/DAST）の結果を再確認する
- 同種の脆弱性が他の箇所にないか横断確認する
- docs/security/ng-patterns.md に事例を追記する（あれば）
- `~/.claude/lessons-learned/` に教訓を記録する（社内ナレッジ・プロジェクトに含めない）

---

## 6. このプロジェクト固有の重要事項

### Stripe 関連
- 本番モードと Test モードの切替は環境変数（`STRIPE_SECRET_KEY` 等）で制御
- Webhook シークレットは Vercel 環境変数で管理（Kosuke のみ操作）
- 返金処理は Stripe Dashboard で実施（コード経由ではない）

### Supabase RLS
- `projects` / `columns` / `documents` / `document_requests` / `contacts` の5テーブルは RLS 有効化済
- 既存テーブル `columns.view_count` / `documents.download_count` の anon UPDATE は暫定許可中（後日 RPC 関数化予定）
- Eラーニング系テーブル（`e_learning_*`）は Phase 2 で RLS ポリシー定義予定

### 管理者認証
- 管理者判定は「auth.users に存在＝管理者」（シンプル設計・ドメイン判定なし）
- 管理者メールは `.env.local` の `ADMIN_EMAIL` に列挙されたものに限定
- パスワード変更時は Supabase Dashboard で実施
