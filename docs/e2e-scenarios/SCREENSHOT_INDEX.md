# スクリーンショット インデックス

> E2Eテスト実行時に自動撮影される各画面のスクリーンショットを管理する。
> 実装変更・FB対応のたびに最新画像に更新される。

## 運用ルール

- **撮影担当**: e2etest-mate（Playwright `screenshots.spec.ts` 実行）
- **確認担当**: team-lead + ディレクター
- **更新タイミング**: 実装変更後に e2etest-mate が再実行して画像を更新
- **保存先**: `e2e/tests/visual/screenshots.spec.ts-snapshots/`
- **将来の発展**: `toHaveScreenshot()` による Visual Regression Testing に移行可能

## 画面一覧

docs/frontend/screens.md の29画面に従い列挙する。

### 認証
| 画面 | スクリーンショットファイル | 最終更新 |
|------|--------------------------|---------|
| A001 ログイン | auth-login.png | - |

### Eラーニング 公開／会員
| 画面 | スクリーンショットファイル | 最終更新 |
|------|--------------------------|---------|
| B001 LP（未ログイン） | elearning-lp.png | - |
| B002 会員ホーム | elearning-home.png | - |
| B003 コース一覧 | elearning-courses.png | - |
| B004 コース詳細 | elearning-course-detail.png | - |
| B005 コース視聴 | elearning-course-video.png | - |
| B006 単体動画一覧 | elearning-videos.png | - |
| B007 単体動画詳細 | elearning-video-detail.png | - |
| B009 購入完了 | elearning-checkout-complete.png | - |
| B010 購入キャンセル | elearning-checkout-cancel.png | - |
| B011 マイページ購入履歴 | mypage-purchases.png | - |
| B012 マイページブックマーク | mypage-bookmarks.png | - |
| B013 マイページ視聴履歴 | mypage-progress.png | - |
| B014 マイページプロフィール | mypage-profile.png | - |

### Eラーニング 管理
| 画面 | スクリーンショットファイル | 最終更新 |
|------|--------------------------|---------|
| C001 単体動画一覧 | admin-elearning-list.png | - |
| C002 単体動画新規作成 | admin-elearning-new.png | - |
| C003 単体動画編集 | admin-elearning-edit.png | - |
| C004 カテゴリ管理 | admin-categories.png | - |
| C005 コース一覧 | admin-courses.png | - |
| C006 コース新規作成 | admin-course-new.png | - |
| C007 コース編集 | admin-course-edit.png | - |
| C009 購入履歴 | admin-purchases.png | - |
| C010 ユーザー管理 | admin-users.png | - |
| C011 レガシー購入履歴 | admin-legacy-purchases.png | - |

---

## Visual Regression Testing への移行（将来）

現在は **手動目視確認** が中心。将来的に：

1. **自動比較モード**：基準画像との差分を Playwright が自動検出
2. **CI 統合**：Pull Request で画像差分をレビュー
3. **承認フロー**：意図的な変更は team-lead が承認、新基準画像として更新

この移行は Phase 3 中盤以降、テストコードが安定してから検討。
