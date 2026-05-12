# access-service

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄）

## 概要

視聴・資料ダウンロードの権限判定を一手に担うサービス。アプリ内で「視聴可否を判定する」のはこの service のみ。

## 使用場面・責務

- コース・コース内動画・単体動画・資料の閲覧／視聴／DL 可否判定
- `/api/me/access` の集約取得
- `/api/checkout` の購入可否判定（既購入／フルアクセス）

## ルール・ビジネスロジック

### 視聴権限の優先順位（Phase 1 確定）

```
① has_full_access = true            → 全動画視聴可
② コース購入済み（status=completed） → そのコース内動画視聴可
③ 単体動画購入済み                   → その単体動画視聴可
④ is_free = true                    → ログインユーザー全員視聴可
⑤ それ以外                          → 視聴不可
```

- **`refunded` ステータスの購入は有効な購入とみなさない（＝権限剥奪と同義）**。`PurchaseRepository.existsCompleted` は `status='completed'` のみを対象とし、返金済の購入は ②③ 判定で false を返す。
- 未ログインユーザーは ①〜④ 判定対象外（401）。LP は未ログインで閲覧可。

### メソッド

| メソッド | シグネチャ | 用途 |
|---------|----------|------|
| `getViewerAccess(userId)` | `(userId: string) => Promise<{ has_full_access: boolean; purchased_course_ids: string[]; purchased_content_ids: string[] }>` | `/api/me/access` |
| `canViewCourseVideo(userId, courseVideoId)` | `(...) => Promise<{ allowed: boolean; reason: AccessReason }>` | コース内動画再生時のガード |
| `canViewContent(userId, contentId)` | `(...) => Promise<{ allowed: boolean; reason: AccessReason }>` | 単体動画再生時のガード |
| `canDownloadCourseMaterials(userId, courseId)` | `(...) => Promise<boolean>` | コース資料 DL |
| `canDownloadContentMaterials(userId, contentId)` | `(...) => Promise<boolean>` | 単体動画資料 DL |

### `AccessReason` 区分

`'full_access' | 'course_purchased' | 'content_purchased' | 'free_course' | 'free_content' | 'free_course_video' | 'not_purchased' | 'unauthenticated'`

### `canViewCourseVideo(userId, courseVideoId)` の判定

```
1. user.has_full_access == true → allowed = true, reason = 'full_access'
2. video.is_free == true        → allowed = true, reason = 'free_course_video'
3. video.chapter.course の購入レコード（status=completed）が user_id にある
                                → allowed = true, reason = 'course_purchased'
4. コース全体が is_free == true（コース全体無料）→ allowed = true, reason = 'free_course'
5. それ以外                      → allowed = false, reason = 'not_purchased'
```

判定に必要なデータ：
- `UserRepository.findById(userId)` で `has_full_access`
- `CourseVideoRepository.findById(courseVideoId)` で `is_free` `chapter_id`
- `ChapterRepository`／`CourseRepository` で `course_id` `course.is_free`
- `PurchaseRepository.existsCompleted(userId, 'course', course_id)`

services 層でクエリを最小化：1 リクエストで複数動画を判定する場合は `getViewerAccess` のキャッシュを controllers 経由で使い回す。

### `canViewContent(userId, contentId)` の判定

```
1. user.has_full_access == true → allowed = true, reason = 'full_access'
2. content.is_free == true      → allowed = true, reason = 'free_content'
3. PurchaseRepository.existsCompleted(userId, 'content', contentId) == true
                                → allowed = true, reason = 'content_purchased'
4. それ以外                      → allowed = false, reason = 'not_purchased'
```

### `getViewerAccess(userId)`

- 1 リクエスト内で複数の視聴可否を判定するときの集約取得
- 戻り値：フルアクセス・購入済みコース ID 配列・購入済み単体動画 ID 配列
- 「コース詳細を表示しつつ章配下の動画ごとに視聴可否を表示」など FE 表示用

### 購入完了直後の視聴権限確認フロー

Stripe Checkout 成功後、ユーザーは `success_url`（コース詳細 or 単体動画詳細）にリダイレクトされる。
ただし以下の理由で、リダイレクト直後の視聴 API が即座に許可されるとは限らない：

1. Stripe Webhook（`checkout.session.completed`）は非同期で到達するため、success_url 表示時点で DB に購入レコードが未反映の可能性がある
2. クライアント側のキャッシュが古い視聴権限を保持している可能性がある

**FE 側の推奨フロー**：

```
1. Stripe Checkout から success_url（クエリ ?status=success 付）に戻る
2. FE はマウント時に GET /api/me/access を呼び直し（必ずキャッシュ無効化）
3. レスポンスで対象 target_id が purchased_*_ids に含まれていれば「視聴可」表示
4. 含まれていなければ「決済反映処理中です（数秒お待ちください）」と表示し、
   2〜3 秒間隔で最大 N 回（N=10）リトライ
5. N 回リトライしても未反映なら「決済反映が遅延しています。お問い合わせください」と
   表示し Slack に通知
```

**BE 側の責務**：

- `GET /api/me/access` はキャッシュせず常に DB 最新値を返す
- Webhook 受信時に `e_learning_purchases` に INSERT した直後、（任意）アプリケーション内通知（Server-Sent Events 等）で FE に push する仕組みは Phase 1 では実装しない（FE 側のポーリングで十分）
- 通常は Stripe Webhook 到達まで 1〜5 秒程度。FE 側のリトライ N=10 / 2 秒間隔で実用上十分。

詳細な FE の状態遷移は `docs/frontend/screens.md` 側で fe-plan-mate が記述する。

### M5 安全順序との関係

- 現状（Phase 1 着手時点）：DB に `has_full_access` カラムを追加するマイグレーションは Phase 2 で実行
- 段階移行：
  1. `has_full_access` カラム追加（DEFAULT false）
  2. 既存 6 名に `has_full_access = true` を一括付与
  3. アプリ層を `has_full_access` 参照に切替（access-service が唯一の判定ポイントなのでここを切り替える）
  4. 動作検証（既存 6 名で全コンテンツ視聴可、新規ユーザーで未購入動画は不可）
  5. `has_paid_access` カラム削除（DB マイグレーション）

- access-service は 1〜2 完了直後にフラグを内部的に切替できるよう、参照先を 1 箇所にまとめる（読み取りは `UserRepository.findById` 経由）

## NG

- access-service 以外で「視聴可否」を判定しない（controllers / repositories / 他 services でロジック分散させない）
- `has_paid_access` を新規ロジックから参照しない（M5 安全順序の 5 ステップ目で削除されるまでは DB に残るが、新規コードは has_full_access のみを見る）
- 「弊社メンバー」「内部メンバー」等の旧名称をコードに残さない（カラム名・関数名・コメント全てで has_full_access に統一）
- 視聴中の権限失効（解約直後など）は Phase 1 の買い切りモデルでは発生しない（サブスク廃止）。将来サブスク再導入時に再設計
