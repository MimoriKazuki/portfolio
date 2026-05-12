# Phase 1 → Phase 2 引き継ぎチェックリスト

## このドキュメントの読み方

Phase 2 の team-lead は以下の手順で着手する：

1. このドキュメントを最初に通読する
2. 「Phase 2 着手前の必読ドキュメント」を上から順に読む
3. 「未確定事項」がないか確認する（あれば Kosuke に質問）
4. 「Phase 2 で実装する範囲」を確認する
5. `docs/wbs/phase2.md` のタスクから着手する

---

## Phase 2 着手前の必読ドキュメント（読む順序）

| # | ドキュメント | 内容 | 読む目的 |
|---|------------|------|---------|
| 1 | `CLAUDE.md` | プロジェクト基本情報 + Phase 1 スコープ | プロジェクト全体像 |
| 2 | `docs/phase1/gate1-confirmed-decisions.md` | M1-M6 / L1-L5 / N6-N10 全確定事項 | **設計判断の根拠（必読）** |
| 3 | `docs/backend/database/business-analysis.md` | 業務分析（業務フロー10フェーズ） | 業務ドメイン理解 |
| 4 | `docs/backend/database/conceptual-model.md` | エンティティ12個・リレーション16本 | データ構造理解 |
| 5 | `docs/backend/database/logical-design.md` | 属性表・PK・業務制約 | テーブル設計の意図 |
| 6 | `docs/backend/database/schema.dbml` | DBML 本体（13テーブル） | 実装する DB |
| 7 | `docs/backend/database/schema-rationale.md` | 型・桁数・インデックス・CHECK 制約の根拠 | カラム指定の意図 |
| 8 | `docs/api/endpoints.md` | API エンドポイント全定義 | 実装する API |
| 9 | `docs/auth/flow.md` | Google OAuth・退会・has_full_access フロー | 認証実装方針 |
| 10 | `docs/error-handling/errors.md` | 18エラーコード（4xx14 + 5xx4） | エラー設計 |
| 11 | `docs/backend/logic/services/` | サービス層8ファイル | ロジック実装方針 |
| 12 | `docs/backend/logic/controllers/README.md` | コントローラー薄層 + 認証要否マトリクス | API ガード方針 |
| 13 | `docs/frontend/design-system/INDEX.md` | デザインシステム全体方針 | UI 実装の起点 |
| 14 | `docs/frontend/design-system/tokens/` | カラー・タイポ・スペーシング | トークン実装 |
| 15 | `docs/frontend/component-candidates.md` | 74コンポーネント候補 | 実装するコンポーネント |
| 16 | `docs/frontend/page-templates.md` | 10ページテンプレート種別 | 画面骨格設計 |
| 17 | `docs/frontend/screens.md` | 29画面の遷移・要件 | 画面構成 |
| 18 | `docs/frontend/routing/routes.md` | ルーティング・returnTo 仕様 | URL 設計 |
| 19 | `docs/frontend/state-management/stores.md` | Server-first 方針・楽観UI | 状態管理 |
| 20 | `docs/wbs/phase2.md` | Phase 2 タスク一覧 | **実装計画（着手起点）** |

---

## Phase 2 で実装する範囲（明示）

### ✅ Phase 2 で実装するもの

1. **DB マイグレーション**（schema.dbml に基づく全テーブル・カラム追加・移行スクリプト）
   - 新規テーブル：courses / course_chapters / course_videos / progress / legacy_purchases
   - 既存テーブル拡張：users.has_full_access / categories.deleted_at / course_videos.view_count / materials.course_id / purchases.stripe_payment_intent_id / purchases.refunded_at
   - 排他参照 CHECK 制約・DEFERRABLE 部分 UNIQUE・RLS ポリシー・インデックス
   - 既存6名の has_full_access=true 一括付与（M5 安全順序 Step2）
   - 既存6件購入レコードの legacy 退避（L3）

2. **認証基盤の整理**
   - middleware 拡張（/e-learning/courses もログインガード対象に）
   - OAuth コールバックでの has_paid_access → has_full_access 段階移行
   - 退会機能（withdraw + L1 マスキング）
   - 再登録時の deleted_at 解除（L1 引継ぎ）

3. **Stripe 連携基盤拡張**
   - Price ID 固定 ENV → DB 紐付けへ
   - Webhook イベント拡張（charge.refunded 追加）

4. **デザインシステム実装**
   - トークン（colors / typography / spacing / layout）
   - atoms 18 / molecules 14 / organisms 31 / templates 11
   - レイアウト基盤（会員側 / 管理側 / エラー）

5. **ユニットテスト基盤**

### ❌ Phase 2 では実装しないもの（Phase 3 へ）

- 個別画面の組み立て（LP の各セクション・コース詳細・視聴画面 等）
- 業務ロジック実体（access-service の判定実装・checkout-service の Stripe 呼び出し実装 等）
- E2E テスト
- LP 用素材（受講生の声・実績数値）の確定・配置

詳細は `docs/wbs/phase2.md` を参照。

---

## Phase 1 で未確定の事項（Phase 2 着手前に Kosuke 確認推奨）

設計段階で確定できなかった事項。Phase 2 で実装する直前に Kosuke に確認すること。

- [ ] **退会時マスキング対象カラムの最終確認**：L1 で `display_name` / `avatar_url` を NULL 化、email は再登録引継ぎのため保持と確定済。実装時に問題なければそのまま進める
- [ ] **動画プレーヤーの継続可否**：既存実装の動画ホスティング・プレーヤーをそのまま継続するか、Phase 2 で見直すか（次点質問・Gate 3-4 で確認予定だった項目）
- [ ] **返金ポリシーの運用方法**：Stripe ダッシュボードのみで操作するか、管理画面に返金機能を設けるか（Phase 2 では Stripe Dashboard 操作のみで実装する想定だが要再確認）
- [ ] **法的表記の提示タイミング**：特商法・利用規約・プラポリのチェックアウト前提示方法（チェックボックス or リンクのみ）
- [ ] **メール通知シナリオ**：購入完了・返金完了・解約等のタイミングと送信方式（Stripe 自動 / 自前 / 併用）
- [ ] **CSV エクスポート（H-7）の Phase 2 実装可否**：Phase 1 任意機能として整合済。Phase 2 で実装する場合は BE 側に `GET /api/admin/purchases/export.csv` の追加が必要

---

## Phase 1 の Gate 全承認履歴

| Gate | 承認日 | Kosuke のコメント |
|------|--------|------------------|
| Gate 1（業務分析） | 2026-05-12 | 業務理解は完璧。Gate 2 進行前に N6-N9 確定 |
| Gate 2（概念モデル） | 2026-05-12 | エンティティ12個・リレーション16本承認。M1-M5 確定 |
| Gate 3（論理設計） | 2026-05-12 | 全エンティティの属性表・PK・業務制約承認。L1-L5 確定 |
| Gate 4（物理設計） | 2026-05-12 | DBML + 根拠ドキュメント承認。db-design-reviewer 指摘ゼロでクリア |

### 軽微指摘の追加修正（Kosuke 方針「Phase 1 で全部潰す」）

- Gate 4 軽微指摘 7件（db-design-reviewer）→ 修正完了
- API 設計 必須3 + 軽微9 + 新規3（api-design-reviewer）→ 修正完了
- Logic 軽微 5件（logic-coverage-checker）→ 修正完了
- Screen 軽微 6件 + N10（screen-coverage-checker）→ 修正完了
- 3層整合性 軽微 12件（consistency-checker）→ 修正完了

→ **最終的に全 reviewer で「指摘ゼロ」達成**

---

## Phase 1 で発生した差し戻し履歴

| 日付 | 差し戻しレベル | 該当 Gate | 内容 | 教訓 |
|------|--------------|-----------|------|------|
| 2026-05-12 | 大規模スコープ変更（Gate 1 中） | Gate 1 | **サブスク廃止・買い切りのみへ変更** | Gate 1 初期に最重要前提（販売モデル）を確認する。今回は早期発見で約60問の質問が消滅し効率化された |

---

## Phase 2 / Phase 3 で注意すべき設計判断

Phase 1 で重要な判断を行った点。Phase 2/3 の実装で誤解しやすい部分を明示する。

### 1. コース内動画と単体動画は別エンティティ
- `e_learning_contents`（単体動画）と `e_learning_course_videos`（コース内動画）は**別テーブル**
- コース内動画は**個別購入できない**（コース単位購入のみ）
- 既存15動画は単体動画として継続。これから作るコースには既存動画を入れない

### 2. 排他的参照（CHECK 制約）
- `e_learning_purchases` / `e_learning_progress` / `e_learning_materials` / `e_learning_bookmarks` は「コース or 単体動画」のいずれかを参照する排他的 N:1
- DBレベルで CHECK 制約あり：`(course_id IS NOT NULL AND content_id IS NULL) OR (course_id IS NULL AND content_id IS NOT NULL)`
- ブックマークは特に M4：**コース内動画はブックマーク対象外**

### 3. 視聴権限優先順位（access-service 集約）
```
① has_full_access=true → 全動画視聴可
② コース購入済 → コース内全動画
③ 単体動画購入済 → 当該動画
④ is_free=true → ログイン全員
⑤ それ以外 → 視聴不可
```
- refunded ステータスの購入は ②③ で false 扱い（=権限剥奪）
- 判定ロジックは **access-service が唯一の集約ポイント**

### 4. has_paid_access → has_full_access 段階移行（M5）
- 5ステップの安全順序を守る：
  1. has_full_access カラム追加（DEFAULT false）
  2. 既存6名に true 付与
  3. アプリコード切替
  4. 動作検証
  5. has_paid_access カラム削除
- 順序を守らないと既存ユーザーのアクセス権が一時的に失われる

### 5. 既存購入6件の取り扱い
- 物理削除しない（税務観点）
- `e_learning_legacy_purchases` 別テーブルに退避
- 6名のユーザーには has_full_access=true 自動付与
- 本テーブル `e_learning_purchases` は新ルール（course_id/content_id 排他 CHECK）で運用

### 6. Stripe Webhook
- Phase 1 で扱うイベント：`checkout.session.completed` / `charge.refunded` のみ
- サブスク関連イベント（customer.subscription.*）は不要
- 冪等性は `stripe_session_id` UNIQUE で保証

### 7. ログイン必須（Udemy 同様）
- 未ログインユーザーは LP（B001）のみ閲覧可
- `/e-learning/courses` を含めて全会員ルートは認証必須
- ※ Phase 1 中に `auth/flow.md` を一度「不要」と記載した経緯あり。**正は「必須」**（consistency-checker 観点4-A で修正済）

### 8. N10：管理者ダッシュボードは既存 GA4 のまま
- Eラーニング専用ダッシュボード画面は作らない（C012 は存在しない）
- BE 側 H-8 ダッシュボード API も Phase 1 スコープ外
- 既存 `/admin/analytics/*` を継続利用

### 9. 管理画面の権限分離なし
- 「auth.users に存在 = 管理者」のみ
- ロール分離・監査ログは Phase 1 スコープ外

### 10. 動画資料（materials）の運用
- M1：単体動画もコースも複数資料持てる（zip 一括 DL）
- コース内動画個別には資料を紐付けない（コース単位）
- 既存単体動画の「1動画1資料」制限は撤廃

---

## Phase 3 からの設計変更受付フロー

Phase 3 で DB/API 設計の変更が必要になった場合：

1. dev-mate（Phase 3）が変更要求を team-lead に上げる
2. team-lead は影響範囲を判定し、必要なら **plan-lead をオンデマンド起動**
3. plan-lead は db-plan-mate / be-plan-mate / fe-plan-mate のうち該当メートで対応
4. `docs/backend/database/schema-changes/{連番}-{table}.md` に変更履歴を記録（クライアント納品用）
5. `~/.claude/lessons-learned/db-design/portfolio-{連番}-{table}.md` に教訓を記録（社内ナレッジ）

---

## チーム編成（Phase 2）

Phase 2 で起動するメート（`/team-phase2`）：

- **team-lead**（リード）
- **dev-mate**（実装・コミット）
- **design-mate**（デザインシステム実装）
- **review-mate**（lint/型/ビルド/コードレビュー）
- **unittest-mate**（ユニットテスト）
- **security-mate**（オンデマンド・認証基盤実装時は頻繁起動）

---

## このドキュメント自体のレビュー

- [x] plan-lead 自己チェック完了（2026-05-12）
- [x] consistency-checker 通過（同日）
- [ ] Kosuke 承認：（Phase 2 着手前にお願いします）

---

## 補足：Phase 1 成果物のコミット履歴

```
8baeeee docs(phase1): consistency-checker 軽微12件修正（完全クリア）
c4247db docs(phase1): Phase 1 BE/FE 設計完了（指摘ゼロでクリア）
c89d443 docs(phase1): Phase 1 Gate 4 物理設計完了（指摘ゼロでクリア）
5fb4b83 docs(phase1): Phase 1 Gate 3 論理設計完了
a8e86dd docs(phase1): Phase 1 Gate 1-2 完了 + 既存スキーマ同期
```

このコミット履歴の後に、本 WBS（`docs/wbs/phase2.md`）と本ハンドオフドキュメントが追加コミットされる予定。
