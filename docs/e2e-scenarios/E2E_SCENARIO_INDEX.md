# E2Eテストシナリオ インデックス

## 概要

Playwright を使用したブラウザ自動テストのシナリオ定義。
テストコードは `e2e/tests/` に配置し、このドキュメントをもとに e2etest-mate が作成する。

## フェーズ一覧

| フェーズ | ファイル | 内容 | ステータス |
|---------|---------|------|-----------|
| Phase 1 | [phase1-smoke.md](phase1-smoke.md) | スモークテスト（全画面表示確認） | 📋 未着手 |
| Phase 2 | [phase2-user-actions.md](phase2-user-actions.md) | ユーザーアクションテスト（CRUD・フォーム・遷移） | 📋 未着手 |
| Phase 3 | [phase3-e2e-flows.md](phase3-e2e-flows.md) | E2Eフローテスト（業務一気通貫） | 📋 未着手 |
| Phase 4 | [phase4-regression.md](phase4-regression.md) | リグレッションテスト（FB再発確認） | 📋 未着手 |
| Phase 5 | [phase5-performance.md](phase5-performance.md) | パフォーマンス計測 | 📋 未着手 |

※「Phase 1〜5」は **テストフェーズの分類** であり、開発の Phase 1/2/3 とは別概念。

## シナリオID体系

- 形式：`SC-{フェーズ略称}-{連番3桁}` 例：`SC-SMK-001`
- フェーズ略称：
  - `SMK` = スモークテスト
  - `UAT` = ユーザーアクションテスト
  - `E2E` = E2Eフローテスト
  - `REG` = リグレッションテスト
  - `PRF` = パフォーマンス計測

## 運用ルール

- シナリオ定義（md）は team-lead が作成・承認する
- テストコード（.spec.ts）は e2etest-mate がシナリオに基づいて作成する
- シナリオ追加・変更時はこの INDEX のステータスも更新する
- リグレッションテスト（Phase 4）はフィードバック完了時に随時追加する

## テスト対象画面一覧

docs/frontend/screens.md の29画面に基づく。

### 認証
| ID | パス | 画面名 |
|----|------|--------|
| A001 | `/auth/login` | ログイン（Google OAuth） |
| A002 | `/auth/callback` | OAuth コールバック |

### Eラーニング 公開／会員
| ID | パス | 画面名 |
|----|------|--------|
| B001 | `/e-learning` | Eラーニング LP |
| B002 | `/e-learning/home` | コース／単体動画 統合一覧（会員ホーム） |
| B003 | `/e-learning/courses` | コース一覧 |
| B004 | `/e-learning/courses/[slug]` | コース詳細 |
| B005 | `/e-learning/courses/[slug]/videos/[videoId]` | コース視聴画面（章内動画） |
| B006 | `/e-learning/videos` | 単体動画一覧 |
| B007 | `/e-learning/[id]` | 単体動画詳細／視聴 |
| B008 | （B004/B007 内モーダル） | 購入確認モーダル |
| B009 | `/e-learning/checkout/complete` | 購入完了画面 |
| B010 | `/e-learning/checkout/cancel` | 購入キャンセル画面 |
| B011 | `/e-learning/mypage/purchases` | マイページ：購入履歴 |
| B012 | `/e-learning/mypage/bookmarks` | マイページ：ブックマーク |
| B013 | `/e-learning/mypage/progress` | マイページ：視聴履歴 |
| B014 | `/e-learning/mypage` | マイページ：プロフィール |

### Eラーニング 管理
| ID | パス | 画面名 |
|----|------|--------|
| C001 | `/admin/e-learning` | 単体動画一覧 |
| C002 | `/admin/e-learning/new` | 単体動画 新規作成 |
| C003 | `/admin/e-learning/[id]/edit` | 単体動画 編集 |
| C004 | `/admin/e-learning/categories` | カテゴリ管理 |
| C005 | `/admin/e-learning/courses` | コース一覧（管理） |
| C006 | `/admin/e-learning/courses/new` | コース 新規作成 |
| C007 | `/admin/e-learning/courses/[id]/edit` | コース 編集 |
| C008 | （C006/C007 内タブ） | コース カリキュラム編集 |
| C009 | `/admin/e-learning/purchases` | 購入履歴 |
| C010 | `/admin/e-learning/users` | フルアクセスユーザー管理 |
| C011 | `/admin/e-learning/legacy-purchases` | レガシー購入レコード閲覧 |

→ 詳細は docs/frontend/screens.md を参照。

## Phase 3 WBS E2E タスク対応

| WBS ID | シナリオ | spec ファイル |
|--------|---------|-------------|
| P3-E2E-01 | SC-E2E-001（LP→ログイン→コース一覧） | `e2e/scenarios/lp-to-courses.spec.ts` |
| P3-E2E-02 | SC-E2E-002（購入フロー） | `e2e/scenarios/purchase-flow.spec.ts` |
| P3-E2E-03 | SC-E2E-003（視聴・進捗） | `e2e/scenarios/watch-progress.spec.ts` |
| P3-E2E-04 | SC-E2E-004（ブックマーク） | `e2e/scenarios/bookmark.spec.ts` |
| P3-E2E-05 | SC-E2E-005（退会・再登録） | `e2e/scenarios/withdraw-relogin.spec.ts` |
| P3-E2E-06 | SC-E2E-006（管理：コース作成） | `e2e/scenarios/admin-course-create.spec.ts` |
