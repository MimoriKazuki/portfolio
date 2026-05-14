# 開発環境用 dev-seed 運用ガイド

## このディレクトリの位置づけ

`scripts/dev-seed/` 配下に置かれる SQL ファイルの**運用ドキュメント**。
ローカル開発環境でのみ実行するダミーデータ投入スクリプトを管理する。

## 重要原則（2026-05-15 改訂）

- **本番 Supabase プロジェクト（mtyogrpeeeggqoxzvyry）への投入は Kosuke 承認時のみ可**
  - 当初（2026-05-14 Phase 3 Step 2 着手時）は「絶対適用 NG」だった
  - 2026-05-15 Kosuke 判断で「Phase 3 リリース前の動作確認のため、dummy- prefix 維持で本番投入可・リリース前削除」に方針変更
  - 投入前に必ず team-lead 経由 Kosuke 承認を取る（自己判断 NG）
- `supabase/migrations/` には置かない（本番自動デプロイ対象から分離・手動投入のみ）
- 既存運用中テーブル（projects / columns / documents / e_learning_contents 等）への破壊的変更（UPDATE / DELETE）は禁止。INSERT のみ
- リリース前に dummy- prefix データを削除する運用（後述「ロールバック」参照）

## ファイル一覧

| ファイル | 内容 | 投入対象 |
|---------|------|---------|
| `scripts/dev-seed/0001_dummy_courses.sql` | 3 コース × 2-3 章 × 2-3 動画。既存 e_learning_contents から動画情報をコピー | `e_learning_categories` / `e_learning_courses` / `e_learning_course_chapters` / `e_learning_course_videos` |

## 投入手順（ローカル Supabase）

### 前提
- Supabase CLI がインストール済（`supabase --version`）
- ローカル Supabase が起動済（`supabase start`）
- 既存スキーマ（migrations/ 適用済）がローカルに反映済

### 実行

```bash
# プロジェクトルートで実行
supabase db query "$(cat scripts/dev-seed/0001_dummy_courses.sql)"

# または、Supabase Studio（http://localhost:54323）の SQL Editor から手動でペースト実行
```

### 冪等性

スクリプトは何度流しても同じ結果になるよう設計されている：
- カテゴリ：`ON CONFLICT (slug) DO NOTHING`
- コース / 章 / 動画：`NOT EXISTS` または `ON CONFLICT (slug)` で重複投入を回避

`BEGIN; ... COMMIT;` で全体トランザクション化されており、途中失敗時はロールバックされる。

## 投入後の状態（想定）

| テーブル | 追加行数 |
|---------|---------|
| `e_learning_categories` | 0 〜 1（dummy-ai-foundation が既存になければ +1） |
| `e_learning_courses` | 3（slug は `dummy-` プレフィックス） |
| `e_learning_course_chapters` | 7 前後 |
| `e_learning_course_videos` | 18 前後（既存 contents の動画情報を流用） |

### コース構成

| slug | タイトル | 種別 | 価格 |
|------|---------|------|------|
| `dummy-ai-intro` | AI 入門コース（無料体験版） | 無料 | NULL |
| `dummy-claude-practical` | Claude 活用実践コース | 有料・注目 | 9,800 円 |
| `dummy-business-ai-master` | 業務 AI 化マスターコース | 有料・注目 | 19,800 円 |

※ 有料コースの `stripe_price_id` は **NULL のまま**（dev 環境では Stripe API を叩かない）。
本番投入時に Stripe Dashboard で Price 作成後、本番側で手動更新する運用想定。

## ロールバック

ダミーデータを削除したい場合：

```sql
-- 削除順序：FK の依存関係に従い子から
DELETE FROM e_learning_course_videos
  WHERE chapter_id IN (
    SELECT id FROM e_learning_course_chapters
    WHERE course_id IN (
      SELECT id FROM e_learning_courses WHERE slug LIKE 'dummy-%'
    )
  );

DELETE FROM e_learning_course_chapters
  WHERE course_id IN (
    SELECT id FROM e_learning_courses WHERE slug LIKE 'dummy-%'
  );

DELETE FROM e_learning_courses WHERE slug LIKE 'dummy-%';

DELETE FROM e_learning_categories WHERE slug LIKE 'dummy-%';
```

## 関連ドキュメント

- 物理設計：`docs/backend/database/schema.dbml`
- 設計根拠：`docs/backend/database/schema-rationale.md`
- 本番マイグレーション：`docs/backend/database/migrations/`（こちらは Supabase 本番に適用される）
- 変更履歴：`docs/backend/database/schema-changes/`

## 履歴

| 日付 | 変更 |
|------|------|
| 2026-05-14 | 新規作成（P3-SEED-01 完了時・Phase 3 Step 2 着手前） |
