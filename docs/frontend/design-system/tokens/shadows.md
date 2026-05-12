# シャドウ（影）

## 実装ファイル（開発後はこちらが正）

- Tailwind 既定スケール（`shadow-sm` / `shadow` / `shadow-md` / `shadow-lg` / `shadow-xl` / `shadow-2xl` / `shadow-none`）
- `tailwind.config.ts` で独自シャドウは未拡張（既定スケールをそのまま採用）
- 既存利用：`app/e-learning/ELearningCard.tsx`（`shadow-md` + `hover:shadow-lg`）/ `app/components/AITrainingLP.tsx` 等

## 概要

シャドウは Tailwind の既定 7 段階を採用する。独自シャドウ（任意 px・任意カラー）は新規追加しない。
カード hover の浮き上がりやモーダルの強調等、用途を限定して使う。
Eラーニング刷新スコープでも追加トークンは設けず、既存パターンに整合させる。

## 使用場面・責務

### 1. スケール（Tailwind 既定）

| トークン | 既定値（参考） | 用途 |
|---------|--------------|------|
| `shadow-none` | none | 影なし（リセット用） |
| `shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.05)` | 微弱（ボタン variant 用・控えめパネル） |
| `shadow` | `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)` | 軽い面浮き（任意） |
| `shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)` | **カード基本**（既存標準） |
| `shadow-lg` | `0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)` | カード hover・Toast |
| `shadow-xl` | `0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)` | モーダル・Drawer |
| `shadow-2xl` | `0 25px 50px -12px rgb(0 0 0 / 0.25)` | 強い強調（限定用途・原則不採用） |

### 2. 用途別の使い分け

| 用途 | 推奨 | 補足 |
|------|------|------|
| カード（コース／単体動画／資料） | `shadow-md` | 既定。既存 `ELearningCard` 踏襲 |
| カード hover | `hover:shadow-lg hover:-translate-y-1` | 既存 `video-card` パターン。`transition` 必須 |
| ボタン（プライマリ） | `shadow-none`（既定）／variant により `shadow-sm` | shadcn `button.tsx` の既定踏襲 |
| Input / Select フォーカス時 | 影なし（`ring` で表現） | フォーカスは ring を優先 |
| モーダル / Dialog | `shadow-xl` + 半透明オーバーレイ | Radix UI の Dialog で既定 |
| Toast | `shadow-lg` | shadcn `toast.tsx` の既定 |
| Popover / Dropdown | `shadow-md` | Radix UI の Popover で既定 |
| サイドバー（既存） | `shadow-none`（区切り線で表現） | `border-r` を使う |
| LP ヒーロー要素 | `shadow-none` | ヒーロー上の要素には影を付けない |
| 管理 DataTable | `shadow-none`（区切り線のみ） | 密度の高い面に影は不要 |
| 視聴画面の動画プレーヤー | `shadow-none` | 画面中央の主役・装飾を加えない |

### 3. Eラーニング刷新で踏襲する具体

- **CourseCard / ContentCard**：`shadow-md` + `hover:shadow-lg hover:-translate-y-1 transition-all duration-200`
- **PurchaseCard（コース詳細の右サイド購入カード）**：`shadow-md`（hover で変化させない・固定）
- **LoginPromptModal / PurchasePromptModal / 統合 Dialog**：`shadow-xl` + 黒半透明オーバーレイ（既存 Dialog 既定）
- **Toast（購入完了・エラー通知）**：`shadow-lg`
- **管理サイドカード（右側固定）**：`shadow-md`（テーブルと差別化）

### 4. 採用根拠（`design-direction.md` との整合）

本トークンは**既存実装からの抽出**であり、新規方向性ではない。

- **既存方針「あしらいに合わせる」（最優先）**：既存 `ELearningCard.tsx` の `shadow-md` + `hover:shadow-lg hover:-translate-y-1` パターンをそのまま採用。`portfolio.*` カラーや `--primary` を使った色付きシャドウは既存実装にないため導入しない
- **印象キーワード「集中・ノイズなし」と整合**：影は控えめ（`shadow-md` を上限とし、それ以上は限定用途）。視聴・学習体験を妨げない
- **印象キーワード「プロフェッショナル」「信頼感」と整合**：業務系画面・管理 DataTable は既存実装どおりシャドウを使わず罫線で構造化（密度の高い面に影は不要）

## ルール・ビジネスロジック

- カードのシャドウは `shadow-md` を既定とする。それ以上強くする場合は plan-lead に相談
- hover シャドウ強調は `hover:shadow-lg` まで。`shadow-2xl` は原則使わない
- 影と一緒に `transition`（`transition-all duration-200` 等）を必ず付ける（カクつき防止）
- カラー付きシャドウ（`shadow-blue-500/20` 等）は採用しない
- ボタンは原則影なし（既存 button.tsx の既定）。variant で必要な場合のみ `shadow-sm`
- ライト前提（Phase 1）：ダークモード用の影クラスは追加しない

## NG

- 任意 px / 任意カラーの arbitrary value：`shadow-[0_8px_24px_rgba(0,0,0,0.12)]` / `shadow-[0_0_20px_#3b82f6]` 等
- カラー付きシャドウの常用（`shadow-blue-500/20` / `shadow-portfolio-blue/30` 等）
- `shadow-2xl` の常用（限定用途）
- カードに複数階層のシャドウを重ね掛け（`shadow-md shadow-lg` 同時付与等）
- ボタンに強いシャドウ（`shadow-lg` 以上）を付与する
- 影を「面の階層」を伝える唯一の手段にする（背景色・border と併用する）
- 視聴画面の動画プレーヤー周辺に影を付ける（集中阻害）

---

## 参照

- 既存：`tailwind.config.ts` / `app/components/ui/button.tsx` / `app/e-learning/ELearningCard.tsx`
- INDEX：`docs/frontend/design-system/INDEX.md`
- design-direction：`docs/frontend/design-system/design-direction.md`
- 関連トークン：`docs/frontend/design-system/tokens/radius.md`（角丸との組合せ） / `tokens/colors.md`（色との階層表現）
