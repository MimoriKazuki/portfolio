# フィードバック：共通・全体 (SYS)

> 複数画面に横断するフィードバック、全体方針、レイアウト・認証・ルーティング横断の事項を管理する。

---

## [FB-SYS-001] ファイル⑤ bookmarks マイグレーション：DROP/UPDATE/ADD 順序による FK 違反

- **ステータス**：🔧 対応中
- **優先度**：高（本番マイグレーション適用ブロッカー）
- **登録日**：2026-05-13
- **登録者**：team-lead
- **発見契機**：dev-mate による `apply_migration` 実行時に PostgreSQL 23503（FK 違反）エラー
- **関連コミット**：（修正コミットは dev-mate 作業中・コミット内表記は `FB-DB-05` 名義）

### 内容

`supabase/migrations/20260512100005_redesign_e_learning_bookmarks.sql` の処理順序が、既存 FK の参照先（auth.users）を維持したまま user_id を e_learning_users.id に書き換えようとしていたため、本番 DB への適用で FK 違反エラーが発生。Tx ロールバックでデータは無傷。

### 真因

旧順序：
1. UPDATE user_id（auth.users.id → e_learning_users.id）
2. DROP CONSTRAINT 既存 FK
3. ADD CONSTRAINT 新 FK（→ e_learning_users）

→ ① の UPDATE 時点で既存 FK（auth.users(id) 参照）が e_learning_users.id 値を拒否。

### 修正

新順序：
1. **DROP CONSTRAINT 既存 FK（auth.users 参照を先に外す）**
2. UPDATE user_id（auth.users.id → e_learning_users.id）
3. ADD CONSTRAINT 新 FK（→ e_learning_users）

### 影響範囲

- 本番 DB：影響なし（Tx ロールバック成立・bookmarks 3件維持・user_id 形式も元のまま）
- マイグレーションファイル：`20260512100005_redesign_e_learning_bookmarks.sql` 1ファイル
- 他ファイル①②③④⑥：影響なし

### 教訓（lessons-learned 候補）

- 既存 FK を維持したまま参照先のデータ型/値を変える UPDATE は FK 違反になる
- review-mate の SQL レビュー観点に「データ値変更前に既存 FK の参照先と整合するか」を追加すべき
- → `~/.claude/lessons-learned/db-design/portfolio-001-bookmarks-fk-order.md` に教訓記録（Phase 2 完了後に整理）

### 関連画面

- なし（純粋な DB マイグレーション層の問題）

---
