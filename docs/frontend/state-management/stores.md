# 状態管理設計

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装完了後に `app/lib/state/**` 等の実装パスを記載）

## 概要

Eラーニング刷新スコープにおけるクライアント状態管理の方針。
既存実装は「Server Component で fetch → Client Component に props 流し込み + useState/useEffect」のシンプル構成。本書はこの方針を基本踏襲し、Phase 1 でグローバルストアは導入しない。

## 使用場面・責務

### 0. 基本方針

- **Server-first**：認証ユーザー・購入状態・視聴権限・コース／動画データは Server Component で取得し props で渡す
- **クライアント側はインタラクション状態に絞る**：モーダル開閉・タブ選択・楽観 UI（ブックマーク／進捗）
- **グローバルストア（zustand / redux 等）は Phase 1 で導入しない**：必要性が明確になった時点で plan-lead → fe-plan-mate に再相談
- **Server Actions 中心**：書き込み（ブックマーク・進捗・購入トリガ・管理 CRUD）は Server Actions または Route Handler。クライアントは結果を受けて状態反映 or `router.refresh()`

### 1. Server-side で扱う状態（Server Component / Route Handler / Server Action）

| 状態 | 取得元 | 配置 |
|------|-------|------|
| 認証ユーザー | `supabase.auth.getUser()` | layout / 各 page |
| `e_learning_users` レコード（`has_full_access`・`is_active`） | `e_learning_users` テーブル | page で fetch（必要時） |
| コース一覧／詳細 | `e_learning_courses` + 子テーブル（chapters/videos/materials） | page で fetch |
| 単体動画一覧／詳細 | `e_learning_contents` + `e_learning_materials` | page で fetch |
| 購入状態 | `e_learning_purchases`（`(user_id, course_id)` or `(user_id, content_id)`） | page で fetch |
| 視聴権限の判定結果 | 上記の組み合わせ（横断ルール） | 共通ヘルパ（`app/lib/access.ts` 想定・Phase 2 で命名確定） |
| 視聴進捗 | `e_learning_progress` | page で fetch（コース詳細・視聴画面・マイページ） |
| ブックマーク | `e_learning_bookmarks` | page で fetch |
| カテゴリ | `e_learning_categories` | page で fetch（キャッシュ可） |

### 2. クライアント側で扱う状態

#### 2-1. ローカル UI 状態（`useState`）

- モーダル開閉：`PurchasePromptModal` / `LoginPromptModal` / 削除確認 Dialog
- タブ選択：視聴画面下部タブ（概要 / 資料 / 関連）、管理フォームタブ
- フィルタ選択：MediaFilterBar のカテゴリ Chip / 無料・有料トグル / 並び替え
- レッスンサイドの開閉（モバイルボトムシート）
- 動画プレーヤーの再生状態・初期 modal 表示判定
- **B009 購入完了画面のポーリング状態**：
  - `pollingCount: number`：ポーリング回数（0〜10）
  - `pollingStatus: 'waiting' | 'confirmed' | 'timeout'`：状態（`waiting` = 反映待ち、`confirmed` = 反映確認済、`timeout` = タイムアウト）
  - `lastError`：直近のエラー（任意・タイムアウト時のサポート連絡導線で表示）
  - 用途：`GET /api/me/access?session_id=...` を 2 秒間隔で最大 10 回ポーリング。`confirmed` で対象コース／単体動画への導線表示、`timeout` でエラーメッセージ＋サポート導線表示
  - 実装方針：
    - 回数管理は `useRef<number>`（State 更新による再レンダで setInterval が再起動するのを防ぐ）／表示用は `pollingStatus` のみを `useState` に置く
    - `useEffect` で setInterval を起動、`return () => clearInterval(...)` でアンマウント時に必ず破棄（多重起動防止）
    - `confirmed` / `timeout` に至った時点で内部的に clearInterval して以降の fetch を停止

#### 2-2. URL state（`useSearchParams` / `router.replace`）

- 一覧画面のフィルタ・並び替え・ページ番号は URL クエリで管理（共有可・戻る/進むで再現可）
  - 例：`/e-learning/courses?category=ai&pricing=paid&sort=newest&page=2`
- 視聴画面の動画切替は URL パスで管理（`/e-learning/courses/[slug]/videos/[videoId]`）
- LP からのログイン誘導は `returnTo` クエリで状態継続（`routing/routes.md` 参照）

#### 2-3. フォーム状態（管理画面）

- 管理画面の作成・編集フォームは **React Hook Form** + Zod（推奨）でローカルに保持
- 保存時：Server Action 呼び出し → 成功時にトースト + `router.refresh()` or `router.push()`
- Phase 2 で具体採用ライブラリを確定（既存プロジェクトにも依存）

#### 2-4. 楽観 UI（簡易な楽観更新）

- ブックマーク追加・削除：クライアントで即時トグル → Server Action 呼び出し → 失敗時はロールバック
- 進捗の視聴完了：動画末尾検知時にローカルで「完了」表示 → Server Action 呼び出し
- 既存 `ELearningDetailClient` のブックマーク実装パターンを踏襲

##### ブックマーク楽観 UI の再検証範囲（軽微6 確定）

ブックマーク Server Action 成功時、以下の4経路をまとめて `revalidatePath` する：

- `/e-learning/home`（B002：会員ホーム・コース／単体動画混在カード）
- `/e-learning/courses`（B003：コース一覧）
- `/e-learning/videos`（B006：単体動画一覧）
- `/e-learning/mypage/bookmarks`（B012：ブックマーク一覧）

→ 一覧画面で「ブックマーク済アイコン」の表示が即時整合する。Server Action 内で 4 経路をまとめて失効させる（ヘルパ関数化を推奨）。

複数タブ間の同期方針：
- **Phase 1 では同一ユーザー異タブ間のリアルタイム同期はしない**（再描画タイミングで揃う想定）
- Phase 2 以降で必要性が出た場合のみ Broadcast Channel API / Supabase Realtime を検討（plan-lead 経由で再相談）

#### 2-5. データキャッシュ／再検証

- Server Component の取得は Next.js 標準のキャッシュ（`fetch` の `cache` / `revalidate` / `revalidatePath`）に従う
- 書き込み後は `revalidatePath('/e-learning/...')` で関連ページを失効
- クライアントから複雑な再検証が必要になった場合は SWR/React Query を Phase 2 で再評価（Phase 1 では導入しない）

### 3. Context（軽量グローバル）

Phase 1 では新規 Context を **作らない**。理由：
- 既存 `app/providers/` に共通プロバイダがあるが、Eラーニング機能は Server-first で十分まわる
- ユーザー情報・テーマは layout で props 流し込み or 既存 Provider を継続利用

### 4. URL クエリで管理する代表例

| 画面 | クエリキー | 値の例 |
|------|-----------|--------|
| `/e-learning/courses` | `category`, `pricing`（free / paid / all）, `sort`（newest / popular）, `page` | `category=ai&pricing=paid&page=2` |
| `/e-learning/videos` | 同上 | 同上 |
| `/e-learning/mypage/purchases` | `from`, `to`, `targetType`（course / content / all） | `from=2026-01-01` |
| `/admin/e-learning/purchases` | `from`, `to`, `status`（completed / refunded）, `userId`, `targetType`（course / content / all） | `status=refunded` |
| `/auth/login` | `returnTo` | エンコード済の元 URL |
| `/e-learning/courses/[slug]` | `prompt`（任意：`purchase`） | 視聴権限なし時の自動モーダル開閉用 |
| `/e-learning/checkout/complete` | `session_id` | Stripe Checkout Session ID |

### 5. データ流れ（代表 3 シーン）

#### シーン A：未ログイン → LP → ログイン → 会員ホーム

1. `/e-learning`（Server）：ユーザー未認証検出 → LP（B001）を返す
2. CTA クリック → `/auth/login?returnTo=/e-learning/home`
3. Google OAuth → `/auth/callback` → Server で `e_learning_users` の存在確認・作成 → `returnTo` に遷移
4. `/e-learning/home`（Server）：認証済確認 + コース／単体動画／ブックマーク fetch → クライアントへ props

#### シーン B：購入フロー

1. `/e-learning/courses/[slug]`（Server）：ユーザー・購入状態を fetch → 未購入 + 有料判定
2. 主 CTA クリック → クライアントが `PurchasePromptModal` を Open
3. 「購入する」→ Server Action `requestCourseCheckout({ courseId })` → Stripe Checkout URL を返す → `window.location.href`
4. 決済完了 → Stripe Webhook（BE）→ `e_learning_purchases` 作成
5. Stripe からの `success_url` で `/e-learning/checkout/complete?session_id=...` に到達 → Server で session 確認・purchase レコード参照
   - 即時反映確認できれば該当コース／動画への導線を提示（`pollingStatus = 'confirmed'`）
   - 未反映時：`pollingStatus = 'waiting'` でクライアントが「決済反映処理中です」スピナー表示 + `GET /api/me/access?session_id=...` を 2 秒間隔で最大 10 回ポーリング（回数は `useRef<number>` で管理）
   - 反映確認できた時点で `pollingStatus = 'confirmed'` に遷移・clearInterval で停止 → 導線表示
   - 10 回到達で `pollingStatus = 'timeout'`・エラーメッセージ + サポート導線（BE 側 access-service が Slack 通知発火）
   - コンポーネント unmount 時は `useEffect` の cleanup で必ず clearInterval（多重起動・leaks 防止）

#### シーン C：コース視聴

1. `/e-learning/courses/[slug]/videos/[videoId]`（Server）：視聴権限判定（横断ヘルパ）
2. 権限あり：コース全体・章・動画・進捗を fetch → VideoPlayerTemplate に props
3. クライアント：動画末尾検知 → Server Action `markProgress({ courseVideoId })` → 完了表示 + 次レッスン誘導
4. 「次のレッスン」クリック → `router.push(/.../videos/<next>)` → SC で再 fetch

## NG

- グローバルストアを安易に導入しない（zustand / redux 未採用方針）
- クライアントで Supabase 直接 RPC を多用しない（書き込みは Server Action / Route Handler）
- 視聴権限の判定をクライアント単独で行わない（必ず Server で一次判定）
- フィルタ・並び替え状態を `useState` のみで保持しない（URL 同期で共有可能性を確保）
- Phase 1 で SWR / React Query / Apollo 等を新規導入しない（Phase 2 で必要に応じ再評価）

---

## 参照

- 画面一覧：`docs/frontend/screens.md`
- ルーティング：`docs/frontend/routing/routes.md`
- API クライアント：`docs/frontend/api-client/endpoints.md`
- 既存実装：`app/e-learning/ELearningTopClient.tsx` / `app/e-learning/[id]/ELearningDetailClient.tsx`
