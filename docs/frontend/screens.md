# 画面一覧（Eラーニング刷新スコープ）

## 作成方針

- 業務分析（`docs/backend/database/business-analysis.md`）の業務フロー・帳票一覧から必要画面を抽出
- 確定事項（`docs/phase1/gate1-confirmed-decisions.md`）の販売モデル・視聴権限ルール・LP 構成（N9）に整合
- DB エンティティ（`docs/backend/database/schema.dbml`）に対する CRUD 画面を確認
- ページテンプレート種別（`docs/frontend/page-templates.md`）を各画面に割り当て
- 既存稼働中のため、既存画面は「改修」明示。新規は「新規」明示

スコープ：Eラーニング機能（`/e-learning/**` および `/admin/e-learning/**`）。
スコープ外：projects / columns / documents / contacts / youtube_videos の各画面（既存運用継続のため触らない）。

### Phase 1 スコープ外（参考・新規画面を作らない）

- **Eラーニング専用の管理者ダッシュボード／集計画面は作らない**（N10 確定）
  - 既存の GA4 ベース管理画面（`/admin/analytics/*` 等）を継続利用する
  - コース別売上・受講者数推移・進捗集計などのダッシュボード UI を Phase 1 で追加しない
  - 必要な数値は C009 購入履歴一覧のフィルタ・CSV エクスポート（軽微4 参照）で代替する
- 法人向け管理画面（`e_learning_corporate_*` の操作画面）は Phase 1 スコープ外（将来用）

---

## 視聴権限の表示分岐（横断ルール）

全画面共通の表示分岐は確定事項（§2 視聴権限の優先順位）に従う：

| 状態 | LP 閲覧 | 無料コンテンツ視聴 | 有料コース内 is_free 動画 | 購入済コース／単体動画 | 全動画 |
|------|--------|------------------|----------------------|---------------------|--------|
| 未ログイン | ✓ | × | × | × | × |
| ログイン済（一般・未購入） | ✓ | ✓ | ✓ | × | × |
| ログイン済 + 購入済（部分） | ✓ | ✓ | ✓ | ✓（該当のみ） | × |
| `has_full_access=true` | ✓ | ✓ | ✓ | ✓ | ✓ |

未ログインで `/e-learning/*` の詳細・視聴画面に直アクセスした場合は `/auth/login?returnTo=...` へリダイレクト。

---

## 画面カテゴリ

### A. 認証関連（既存・Eラーニング配下は触らない）

| ID | 画面名 | URL | 認証 | テンプレ種別 | 主な操作 | 依存エンティティ | 状態 |
|----|--------|-----|------|------------|---------|----------------|------|
| A001 | ログイン | `/auth/login` | 不要 | AuthTemplate | Google OAuth ログイン（`returnTo` クエリで遷移先指定。値は同一オリジン・パス検証必須・不正値時は `/e-learning/home` にフォールバック） | `auth.users` / `e_learning_users` | 既存（軽微改修：`returnTo` クエリ対応） |
| A002 | OAuth コールバック | `/auth/callback` | 不要 | （API route） | セッション確立 | `auth.users` / `e_learning_users` | 既存維持 |

### B. Eラーニング 公開／会員（`/e-learning/**`）

| ID | 画面名 | URL | 認証 | テンプレ種別 | 主な操作 | 依存エンティティ | 状態 |
|----|--------|-----|------|------------|---------|----------------|------|
| B001 | Eラーニング LP | `/e-learning` | 不要（未ログイン）／ログイン時は B002 へ自動遷移 | LPTemplate | ヒーロー閲覧・コース／単体動画閲覧（ログイン誘導）・FAQ・お問い合わせ導線 | `e_learning_courses` / `e_learning_contents` / `e_learning_categories` | 新規（既存 `/e-learning` ページを LP に置換） |
| B002 | コース／単体動画 統合一覧（会員ホーム） | `/e-learning/home` | 必要 | MediaListTemplate | カテゴリ別フィルタ・無料／有料フィルタ・コース／単体動画タブ・並び替え | `e_learning_courses` / `e_learning_contents` / `e_learning_bookmarks` | 新規 |
| B003 | コース一覧 | `/e-learning/courses` | 必要 | MediaListTemplate | カテゴリ別フィルタ・無料／有料フィルタ・ブックマーク表示 | `e_learning_courses` / `e_learning_categories` / `e_learning_bookmarks` | 既存改修（コース対応に再構築） |
| B004 | コース詳細 | `/e-learning/courses/[slug]` | 必要 | CourseDetailTemplate | カリキュラム（章・動画一覧）表示・購入CTA・ブックマーク・資料一覧・「最初から見る」「続きから見る」 | `e_learning_courses` / `e_learning_course_chapters` / `e_learning_course_videos` / `e_learning_materials` / `e_learning_purchases` / `e_learning_progress` / `e_learning_bookmarks` | 新規 |
| B005 | コース視聴画面（章内動画） | `/e-learning/courses/[slug]/videos/[videoId]` | 必要（視聴権限要） | VideoPlayerTemplate（Udemy型2カラム） | 動画再生・章内動画リスト・次レッスン誘導・進捗マーク・資料 DL・コース概要タブ | `e_learning_courses` / `e_learning_course_chapters` / `e_learning_course_videos` / `e_learning_progress` / `e_learning_materials` | 新規 |
| B006 | 単体動画一覧 | `/e-learning/videos` | 必要 | MediaListTemplate | カテゴリ別フィルタ・無料／有料フィルタ | `e_learning_contents` / `e_learning_categories` / `e_learning_bookmarks` | 新規（既存 B002 から単体動画特化部分を切り出し） |
| B007 | 単体動画詳細／視聴 | `/e-learning/[id]` | 必要（視聴権限要） | VideoPlayerTemplate（単一動画） | 動画再生・概要・資料 DL・購入 CTA（未購入時）・ブックマーク | `e_learning_contents` / `e_learning_materials` / `e_learning_purchases` / `e_learning_progress` / `e_learning_bookmarks` | 既存改修（購入導線をコース対応のロジックに整合させる） |
| B008 | 購入確認モーダル／チェックアウト遷移 | （B004／B007 内モーダル → Stripe Checkout 外部） | 必要 | （モーダル + 外部リダイレクト） | 価格確認 → Stripe Checkout（mode: payment）へ遷移 | `e_learning_courses` / `e_learning_contents` / `e_learning_purchases` | 既存 PurchasePromptModal を再利用・改修 |
| B009 | 購入完了画面 | `/e-learning/checkout/complete?session_id=...` | 必要 | InfoPageTemplate | Stripe Session 確認・購入動画／コースへの導線・**Webhook 未反映時はスピナー「決済反映処理中です」を表示し、`GET /api/me/access` を最大 10 回・2 秒間隔でポーリング** → 反映後に該当コース／単体動画への導線を表示／**タイムアウト時はエラー「反映が遅れています。サポートまでお問い合わせください」**＋ Slack 通知（BE 側 access-service が発火・反映遅延を運用に通知） | `e_learning_purchases` | 新規 |
| B010 | 購入キャンセル画面 | `/e-learning/checkout/cancel` | 必要 | InfoPageTemplate | キャンセル表示・コース／動画詳細へ戻る導線 | - | 新規 |
| B011 | マイページ：購入履歴 | `/e-learning/mypage/purchases` | 必要 | MyPageTemplate | 購入済コース／単体動画一覧・購入日・領収書（Stripe）リンク | `e_learning_purchases` / `e_learning_courses` / `e_learning_contents` | 新規 |
| B012 | マイページ：ブックマーク | `/e-learning/mypage/bookmarks` | 必要 | MyPageTemplate | ブックマーク済コース／単体動画一覧・解除 | `e_learning_bookmarks` / `e_learning_courses` / `e_learning_contents` | 既存改修（コース対応） |
| B013 | マイページ：視聴履歴 | `/e-learning/mypage/progress` | 必要 | MyPageTemplate | 視聴完了済コース／単体動画一覧・進捗率 | `e_learning_progress` / `e_learning_course_videos` / `e_learning_contents` | 新規 |
| B014 | マイページ：プロフィール | `/e-learning/mypage` | 必要 | MyPageTemplate | 表示名・アバター確認（読み取り中心。OAuth 由来のため編集は最小限）・退会導線（成功時は LP（B001）にリダイレクト＋セッション破棄） | `e_learning_users` | 新規 |

### C. Eラーニング 管理（`/admin/e-learning/**`）

| ID | 画面名 | URL | 認証 | テンプレ種別 | 主な操作 | 依存エンティティ | 状態 |
|----|--------|-----|------|------------|---------|----------------|------|
| C001 | 単体動画一覧 | `/admin/e-learning` | 管理者（auth.users セッション） | AdminListTemplate | 検索・カテゴリ絞り込み・公開／非公開切替・編集・新規 | `e_learning_contents` | 既存改修（単体動画一覧として明確化） |
| C002 | 単体動画 新規作成 | `/admin/e-learning/new` | 管理者 | AdminFormTemplate | 基本情報・サムネ・動画URL・カテゴリ・価格・Stripe Price ID・公開フラグ・資料登録 | `e_learning_contents` / `e_learning_materials` / `e_learning_categories` | 既存改修 |
| C003 | 単体動画 編集 | `/admin/e-learning/[id]/edit` | 管理者 | AdminFormTemplate | 上記の更新／論理削除（`deleted_at`） | `e_learning_contents` / `e_learning_materials` | 既存改修 |
| C004 | カテゴリ管理 | `/admin/e-learning/categories` | 管理者 | AdminListTemplate | カテゴリ一覧・新規・編集・削除（`is_active`／`deleted_at`） | `e_learning_categories` | 既存改修（`deleted_at` 対応・L4） |
| C005 | コース一覧 | `/admin/e-learning/courses` | 管理者 | AdminListTemplate | 検索・カテゴリ絞り込み・公開／非公開切替・編集・新規 | `e_learning_courses` | 新規 |
| C006 | コース 新規作成 | `/admin/e-learning/courses/new` | 管理者 | AdminFormTemplate（タブ：基本情報／カリキュラム／資料） | 基本情報・カテゴリ必須・価格・Stripe Price ID・公開フラグ・章＋動画の階層構築（DnD 並び替え）・資料登録 | `e_learning_courses` / `e_learning_course_chapters` / `e_learning_course_videos` / `e_learning_materials` / `e_learning_categories` | 新規 |
| C007 | コース 編集 | `/admin/e-learning/courses/[id]/edit` | 管理者 | AdminFormTemplate（タブ） | C006 と同等の更新／論理削除 | 同上 | 新規 |
| C008 | コース カリキュラム編集（章・動画 DnD） | C006／C007 内のタブ | 管理者 | （C006／C007 のサブ画面） | 章追加・章名編集・章順序入替（DnD）・章内動画追加・動画順序入替（DnD）・`is_free` 切替 | `e_learning_course_chapters` / `e_learning_course_videos` | 新規 |
| C009 | 購入履歴 | `/admin/e-learning/purchases` | 管理者 | AdminListTemplate | 期間／ユーザー／コース／単体動画／ステータス（completed/refunded）絞り込み・CSV エクスポート（Phase 1 任意） | `e_learning_purchases` / `e_learning_users` / `e_learning_courses` / `e_learning_contents` | 新規 |
| C010 | フルアクセスユーザー管理 | `/admin/e-learning/users` | 管理者 | AdminListTemplate | ユーザー一覧・検索・`has_full_access` 手動切替 | `e_learning_users` | 新規 |
| C011 | レガシー購入レコード閲覧（L3） | `/admin/e-learning/legacy-purchases` | 管理者 | AdminListTemplate | `e_learning_legacy_purchases` の参照のみ（編集不可・税務目的）・**行クリック挙動：インラインモーダル or 行展開のみ（詳細画面遷移なし）。一覧表示で税務確認に十分** | `e_learning_legacy_purchases` / `e_learning_users` | 新規（読み取り専用） |

### D. その他（既存維持）

| ID | 画面名 | URL | 認証 | テンプレ種別 | 状態 |
|----|--------|-----|------|------------|------|
| D001 | 404 / not-found | （Next.js 標準） | - | ErrorTemplate | 既存維持 |
| D002 | エラー 5xx | （Next.js error.tsx） | - | ErrorTemplate | 既存維持 |

---

## 画面遷移

```
[未ログイン]
    │
    ▼
[B001 LP /e-learning] ── (CTA「コースを見る」) ──▶ [A001 ログイン /auth/login?returnTo=/e-learning/home]
                                                    │ Google OAuth
                                                    │ ※ returnTo クエリあり：成功時にその URL へ遷移／不正値なら /e-learning/home にフォールバック
                                                    │ ※ 検証ルール：同一オリジン・パスのみ・空値や外部 URL は無効
                                                    ▼
[ログイン済] ─────────────────────────────────▶ [B002 会員ホーム /e-learning/home]
    │                                                  │
    │                                                  ├─ コースタブ ─▶ [B003 コース一覧 /e-learning/courses]
    │                                                  │                       │
    │                                                  │                       └─ カード ─▶ [B004 コース詳細 /e-learning/courses/[slug]]
    │                                                  │                                       │
    │                                                  │                                       ├─（未購入・有料）─▶ [B008 購入確認モーダル] ─▶ Stripe Checkout ─▶ [B009 完了 /e-learning/checkout/complete]
    │                                                  │                                       │                                              （キャンセル）─▶ [B010 /checkout/cancel]
    │                                                  │                                       │
    │                                                  │                                       └─（視聴可）─▶ [B005 視聴画面 /e-learning/courses/[slug]/videos/[videoId]]
    │                                                  │                                                          │
    │                                                  │                                                          └─ 次レッスン ─▶ (B005 自身に推移)
    │                                                  │
    │                                                  ├─ 単体動画タブ ─▶ [B006 単体動画一覧 /e-learning/videos]
    │                                                  │                       │
    │                                                  │                       └─ カード ─▶ [B007 単体動画詳細／視聴 /e-learning/[id]]
    │                                                  │                                       │
    │                                                  │                                       └─（未購入・有料）─▶ [B008] ─▶ Stripe Checkout ─▶ [B009]/[B010]
    │                                                  │
    │                                                  └─ ヘッダー：マイページ ─▶ [B014 /e-learning/mypage]
    │                                                                                  ├─ [B011 購入履歴 /mypage/purchases]
    │                                                                                  ├─ [B012 ブックマーク /mypage/bookmarks]
    │                                                                                  ├─ [B013 視聴履歴 /mypage/progress]
    │                                                                                  └─ 退会申請 ─▶ [requestUserWithdraw] ─▶ セッション破棄 + [B001 LP /e-learning] にリダイレクト
    │
[管理者] ──▶ [/admin/e-learning（C001 単体動画）]
                ├─ カテゴリ ──▶ [C004]
                ├─ コース ──▶ [C005 コース一覧]
                │              ├─ 新規 ──▶ [C006]
                │              └─ 行 ──▶ [C007 編集（C008 カリキュラム編集タブ含む）]
                ├─ 単体動画 ──▶ C001（既定）
                │              ├─ 新規 ──▶ [C002]
                │              └─ 行 ──▶ [C003 編集]
                ├─ 購入履歴 ──▶ [C009]
                ├─ ユーザー（フルアクセス管理）──▶ [C010]
                └─ レガシー購入 ──▶ [C011]
```

---

## 業務フロー対応

`docs/backend/database/business-analysis.md` 業務フローの各フェーズに対応する画面が揃っているか。

| 業務フェーズ | 主体 | 対応画面 | 状態 |
|------------|------|---------|------|
| 1. 商品（コース・単体動画）の整備 | 管理者 | C001-C008 | ✓ |
| 2. LP 流入・サービス紹介 | 一般訪問者 | B001 | ✓ |
| 3. 会員登録／ログイン | 訪問者 | A001 / A002 | ✓ |
| 4. コンテンツ閲覧（無料分） | ログインユーザー | B002 / B003 / B004 / B005 / B006 / B007 | ✓ |
| 5. 購入決済 | ログインユーザー | B004 or B007 → B008 → Stripe Checkout | ✓ |
| 6. 購入完了 Webhook 受信 | システム | （Webhook：BE 側責務） | （FE 画面なし／B009 で結果表示） |
| 7. コンテンツ視聴 | 購入済ユーザー | B005 / B007 | ✓ |
| 8. ブックマーク登録 | ログインユーザー | B003 / B004 / B006 / B007（カード／詳細）→ B012 で確認 | ✓ |
| 9. 返金処理 | 管理者（Stripe 側） | （Stripe Dashboard・FE 画面なし） / C009 で `refunded` 確認 | ✓ |
| 10. 運用メンバーへの全アクセス権付与 | 管理者 | C010 | ✓ |

---

## CRUD 網羅性

DB エンティティに対する画面網羅性。

| テーブル | 一覧 | 詳細 | 新規 | 編集 | 削除UI | 備考 |
|---------|------|------|------|------|--------|------|
| e_learning_users | C010 | C010（行詳細はモーダルで） | （OAuth 自動） | C010（`has_full_access` のみ） | （退会は B014 から） | 管理者は表示・フルアクセス切替のみ |
| e_learning_categories | C004 | C004 | C004 | C004 | C004（`deleted_at`） | |
| e_learning_contents | C001 / B006 | C003 / B007 | C002 | C003 | C003（`deleted_at`） | |
| e_learning_courses | C005 / B003 | C007 / B004 | C006 | C007 | C007（`deleted_at`） | |
| e_learning_course_chapters | C008（C006/C007 内） | （C008 内） | C008 | C008 | C008 | コース編集画面のサブ |
| e_learning_course_videos | C008 | （C008 内） | C008 | C008 | C008 | コース編集画面のサブ |
| e_learning_materials | C002/C003/C006/C007 内 | （所属親の編集画面） | 同上 | 同上 | 同上 | コース直下／単体動画直下に紐付け（M1） |
| e_learning_purchases | C009 / B011 | C009 行詳細 | （Webhook 自動） | （ステータス更新は Webhook） | × | 物理／論理削除いずれも不可 |
| e_learning_legacy_purchases | C011 | C011 | × | × | × | 読み取り専用 |
| e_learning_bookmarks | B012 | （カードのみ） | B003/B004/B006/B007 のアイコン | × | B012 のトグル | 個人データ |
| e_learning_progress | B013 | （カードのみ） | （視聴完了時自動） | × | × | 個人データ |
| e_learning_corporate_customers / users | - | - | - | - | - | Phase 1 スコープ外（将来用） |

「-」は業務上不要な操作。

---

## アクセス権限

| 画面ID | 未ログイン | 一般ユーザー | フルアクセスユーザー | 管理者 |
|--------|-----------|-------------|------------------|--------|
| B001（LP） | ✓ | ✓（B002 へ自動遷移可） | ✓（B002 へ自動遷移可） | ✓ |
| A001（ログイン） | ✓ | ログイン済時は B002 へリダイレクト | 同左 | ログイン済時は B002 へ |
| B002〜B014（会員系） | × | ✓（視聴権限ルール適用） | ✓（全動画視聴可） | ✓ |
| C001〜C011（管理系） | × | × | × | ✓ |

未ログインで会員系に直アクセス → `/auth/login?returnTo=<元URL>` へリダイレクト。
権限不足で視聴画面に直アクセス → コース詳細（B004）または単体動画詳細（B007）へ戻し、B008 を自動表示。

---

## エラー・例外画面

| 画面 | 状態 | 表示内容 |
|------|------|---------|
| 404 / not-found | URL が存在しない | 「ページが見つかりません」+ `/e-learning` への導線（既存共通） |
| 403 | 管理画面に非管理者がアクセス | middleware で `/auth/login` にリダイレクト（既存挙動継続） |
| 5xx | サーバーエラー | 「エラーが発生しました」+ お問い合わせ導線（既存共通 error.tsx） |
| ローディング | データ取得中 | スケルトン（既存 `app/components/skeletons/` を流用） |
| 空状態 | 公開コースゼロ等 | 「まだコースがありません」+ 単体動画タブへの導線 |
| 視聴権限なし | 直アクセス | コース詳細／単体動画詳細へ戻し、購入確認モーダルを開く |

---

## B009 購入完了画面の Webhook 反映待ち UI 仕様（補足）

Stripe Checkout から `success_url` で到達した時点で、Webhook（`checkout.session.completed`）の処理が完了していないケースがある。FE は以下の手順で視聴権限の反映を確認する。

1. ページ初期表示で `session_id` クエリを取得し、Server で `e_learning_purchases` を `stripe_session_id` で検索
2. 該当購入レコードが見つかれば、購入対象（コース／単体動画）への導線を即時表示
3. 未反映（レコード未作成）の場合、クライアント側で「決済反映処理中です」スピナーと進捗テキストを表示
4. **リトライ仕様：`GET /api/me/access?session_id=...` を 2 秒間隔で最大 10 回ポーリング**
   - 反映確認できた時点でポーリング停止 → 対象コース／単体動画への導線を表示
   - 10 回（合計 20 秒）反映確認できなければタイムアウト
5. **タイムアウト時の表示**：「反映が遅れています。サポートまでお問い合わせください」＋お問い合わせ導線
6. **Slack 通知連動**：タイムアウト時は BE 側 `access-service`（Phase 2 で実装予定）が運用向け Slack へ反映遅延を自動通知。FE 側からの追加通知は不要

詳細仕様の参照：`docs/backend/logic/services/access-service.md` 「購入完了直後の視聴権限確認フロー」（be-plan-mate 担当）。

### B009 と関連エンドポイント

| 呼び出し | 用途 |
|---------|------|
| 初期 fetch（Server）：`e_learning_purchases` by `stripe_session_id` | 即時反映確認 |
| ポーリング（Client）：`GET /api/me/access?session_id=...` | Webhook 未反映時の再確認 |

---

## サマリ

- 認証関連：2 画面（A001-A002）
- Eラーニング 公開／会員：14 画面（B001-B014）
- Eラーニング 管理：11 画面（C001-C011）
- その他：2 画面（D001-D002）
- **合計：29 画面**

---

## screen-coverage-checker チェック結果

提出後に plan-lead 側で起動。本ファイル末尾に結果を追記する。

- [ ] 1. 業務フロー網羅：（pending）
- [ ] 2. 帳票・出力網羅：（pending：帳票は購入履歴 CSV のみ・C009 で対応）
- [ ] 3. CRUD画面網羅：（pending）
- [ ] 4. 画面遷移整合性：（pending）
- [ ] 5. コンポーネント候補リスト網羅：（pending）
- [ ] 6. ページテンプレート種別：（pending）
- [ ] 7. ルーティング整合性：（pending）
- [ ] 8. APIクライアント整合性：（pending）
- [ ] 9. 状態管理：（pending）
- [ ] 10. 共通機能網羅：（pending）

---

## 参照

- 業務分析：`docs/backend/database/business-analysis.md`
- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- 物理設計：`docs/backend/database/schema.dbml`
- ページテンプレート：`docs/frontend/page-templates.md`
- ルーティング：`docs/frontend/routing/routes.md`
