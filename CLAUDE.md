# CLAUDE.md — AI駆動研究所 ポートフォリオ／メディアサイト

このファイルは Claude Code がこのプロジェクトで作業する際に最初に読む基本ファイルです。
グローバル設定（~/.claude/CLAUDE.md）と併せて参照されます。

---

## プロジェクト基本情報

- **名称**：AI駆動研究所 ポートフォリオ／メディアサイト
- **本番URL**：https://www.landbridge.ai/
- **リポジトリ**：https://github.com/MimoriKazuki/portfolio
- **運用状況**：本番運用中
- **技術スタック**：Next.js 15.5（App Router）+ TypeScript + Supabase + Stripe + Vercel
- **Supabase project_id**：mtyogrpeeeggqoxzvyry（AI駆動研究所）

---

## プロジェクト責任者（ディレクター）

- **ディレクター名**：Kosuke
- **役割**：プロジェクト全体の最終判断・承認
- **窓口**：plan-lead（Phase 1）/ team-lead（Phase 2/3）から直接やり取り

メート定義ファイル内では「ディレクター」という役割名で参照される。

---

## 現在のフェーズ状況（2026-05-12 時点）

- これまで Phase 1/2 の正式な設計フローを通っておらず、設計ドキュメント（schema.dbml、business-analysis.md、screens.md 等）は**存在しない**
- 直近セッションまでは A 案運用（個別タスクをディレクター指示で対応）
- **今回 Phase 1 を「Eラーニング刷新スコープ」で正式起動中**

### Phase 1 スコープ：Eラーニング機能の大幅刷新

1. ランディングページ追加（/e-learning 入口に LP）
2. プラン3段階化（サブスクリプション）
3. コンテンツの買い切り対応
4. Udemy 風コース化（複数コンテンツを束ねた連続視聴）
5. 管理者画面の対応

### Phase 1 スコープ外（既存稼働中・触らない）

- projects / columns / documents / contacts / youtube_videos 等の非 e-learning テーブル
- 既存運用機能・既存管理画面の e-learning 以外
- ※ ただし関係するテーブル（auth.users / 弊社メンバー判定 等）は明示しながら進める

---

## Phase 1 設計プロセス（5ゲート方式）

DB 設計の後追い修正（PK 変更・型変更・桁数変更・カラム追加）を構造的に防ぐため、
要件定義・設計フェーズで 5 ゲート方式を採用する。

### ゲート構成

| Gate | 内容 | 成果物 | レビュア |
|------|------|--------|---------|
| Gate 1 | 業務分析 | docs/backend/database/business-analysis.md | ディレクター（業務観点） |
| Gate 2 | 概念モデル（属性なし） | docs/backend/database/conceptual-model.md | ディレクター（業務観点） |
| Gate 3 | 論理設計（型なし・PK確定） | docs/backend/database/logical-design.md | ディレクター（業務観点） |
| Gate 4 | 物理設計（型・桁数の根拠） | docs/backend/database/schema.dbml + schema-rationale.md | plan-lead + db-design-reviewer + ディレクター |
| Gate 5 | 変更履歴運用 | docs/backend/database/schema-changes/ | （Phase 2 以降） |

### 絶対ルール

- **Gate を飛ばさない**：前 Gate のディレクター承認なしに次 Gate へ進まない
- **Gate 4 完了まで be/fe は本格着手しない**：仕様調整・素案検討までは可
- **テンプレに従う**：~/.claude/templates/plan/ の各テンプレートを使用する
- **db-design-reviewer 通過必須**：Gate 4 提出前に機械チェックを通す

### 起動コマンド

`/team-phase1` で Phase 1 チームを起動する。

### Phase 3 で設計変更が必要になった場合

1. dev-mate → team-lead → plan-lead にエスカレーション
2. plan-lead が該当 plan-mate（db/be/fe）に対応依頼
3. **変更記録は2系統に分離して保存**：
   - プロジェクト内：`docs/backend/database/schema-changes/{連番}-{table}.md`（業務的内容のみ・クライアント納品OK）
   - 社内ナレッジ：`~/.claude/lessons-learned/db-design/portfolio-{連番}-{table}.md`（振り返り・教訓・プロジェクトに含めない）

---

## DB 命名規則・設計パターン

### 既存 DB の命名規則について（既存稼働中のため踏襲）

このプロジェクトは Supabase 上で既に稼働しており、既存テーブルは以下の命名規則：
- **プレフィックスなし**：projects, columns, documents, contacts, youtube_videos 等
- **機能領域プレフィックス**：e_learning_* （categories, contents, materials, users, purchases, bookmarks, corporate_customers, corporate_users）

→ **Phase 1 で追加する新規テーブルは既存命名規則に準拠する**：
- e-learning 関連の新規テーブルは `e_learning_*` プレフィックス（例：`e_learning_courses`, `e_learning_subscription_plans`）
- 一般的なテンプレ標準（m_/t_ 等のプレフィックス）は採用しない

### 設計パターンの判断基準（~/.claude/templates/plan/db-design-patterns.md より）

- PK：**サロゲートPK（id）+ 自然キー UNIQUE 制約 をセットで採用**
- FK：親がサロゲートPK なら単一FK で十分
- 多対多：純中間（複合PK）/ 属性付き / associative entity の3パターン
- 削除：deleted_at TIMESTAMPTZ がデフォルト（is_deleted は使わない）
- データ型：自由テキストは text、コードのみ varchar(n)、timestamp は timestamptz
- マルチテナント：※このプロジェクトは原則シングルテナント

### 絶対禁止ルール

- **varchar（桁指定なし）の使用禁止** — varchar(n) または text の2択
- **サロゲートPK のみで UNIQUE 制約なし禁止** — 業務的一意性は UNIQUE 制約で必ず保証
- **timestamp without time zone の使用禁止** — timestamptz を使う
- **PostgreSQL の ENUM 型禁止** — smallint + 区分マスタ参照 を使う（既存スキーマでも同様に再点検）

---

## 既存 Eラーニング機能の概要（Phase 1 着手前情報）

### 既存テーブル（Supabase / 2026-05 時点）

| テーブル | 行数 | 役割 |
|---------|-----|------|
| e_learning_categories | 6 | カテゴリマスタ |
| e_learning_contents | 15 | 動画コンテンツ |
| e_learning_materials | 7 | PDF資料 |
| e_learning_users | 109 | 一般ユーザー（管理者と分離） |
| e_learning_purchases | 6 | 購入履歴（Stripe連携） |
| e_learning_bookmarks | 3 | ブックマーク |
| e_learning_corporate_customers | 0 | 研修サービス契約企業 |
| e_learning_corporate_users | 0 | 契約企業に紐づくユーザーメール |

### 既存購入者の Phase 1 移行方針

- 既存購入者 6 名は「**弊社メンバー**」ステータスに吸収（全コンテンツ視聴可・永続）
- 新ステータスは追加しない（運用シンプル）
- 早期購入者特典：買い切り後の追加コスト発生をゼロにする＝既得権保護

### 既存画面

- 公開：`/e-learning`（コンテンツ一覧）、`/e-learning/[id]`（コンテンツ詳細）、`/e-learning/courses` 等
- 管理：`/admin/customers`、`/admin/analytics/*` 等

### 認証フロー

- Supabase Auth + Google OAuth
- `/auth/login`（Google OAuth ボタン）、`/auth/callback` でログイン処理
- `middleware.ts` で `/admin` 配下を認証ガード（auth.users にログイン済セッションが必要）
- 管理者判定は「auth.users に存在＝管理者」（シンプル設計・ドメイン判定なし）

### 課金

- Stripe 連携あり（package.json に stripe ^20.0.0）
- 既存は単発購入（買い切り）のみ
- 改修後：**サブスク3段階 + コース買い切り** の2軸

---

## 直近完了タスクの履歴（Phase 1 着手前・参考情報）

1. 研修ラインナップ刷新（/services 新6件構成・comprehensive-ai-training 廃止）
2. 本番DB マイグレーション適用（projects/columns/youtube_videos の正規化）
3. npm audit 対応（HIGH/CRITICAL 全6件解消）
4. ワーキングツリー整理（.mcp.json untrack、機密情報除去、docs/scripts/migrations コミット）
5. 管理者パスワード変更（Lb@123456 → LB@123456）
6. 5テーブル RLS 有効化（projects/columns/documents/document_requests/contacts）
7. Google Analytics 計測タグ設定（NEXT_PUBLIC_GA_ID）
8. 管理画面の GA4 Data API エラー修正（next.config.mjs に serverExternalPackages 追加）

---

## 残課題（Phase 1 と直接関係なし・参考）

1. Google Analytics の測定ID（G-C388TXW3R4）が gtag.js 配信サーバーに 404 で未登録状態
   - 推測：データストリーム伝播遅延（24時間程度で解消見込み）
   - 明日以降に状態確認

2. columns.view_count / documents.download_count の anon UPDATE 撤廃
   - 現状：RLS で anon UPDATE 暫定許可中
   - 後日タスクで RPC 関数化（SECURITY DEFINER）して撤回予定

---

## 管理者ログイン情報（必要時）

- URL: https://www.landbridge.ai/admin
- メール: `.env.local` の `ADMIN_EMAIL` 参照（sales@landbridge.co.jp / tamogami@landbridge.co.jp）
- パスワード: チームで共有中
