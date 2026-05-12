# カラートークン

## 実装ファイル（開発後はこちらが正）

- `app/globals.css`（`@layer base :root` 内の CSS 変数）
- `tailwind.config.ts`（`extend.colors` で HSL 変数を参照）

## 概要

既存実装から抽出した本プロジェクトのカラートークン。HSL CSS 変数（shadcn 標準）+ Tailwind ユーティリティでアクセスする。
Eラーニング刷新スコープの新規 UI（コースカード・進捗バー・購入 CTA 等）も本トークンを優先利用する。

## 使用場面・責務

### 1. ベーストークン（既存 `globals.css` から抽出）

ライト（`:root`）の値。HSL の `hue saturation% lightness%` 形式。

| トークン | HSL 値 | 16進 概算 | 用途 |
|---------|--------|----------|------|
| `--background` | `0 0% 100%` | `#FFFFFF` | ページ背景 |
| `--foreground` | `222.2 47.4% 11.2%` | `#0F172A` 近似 | 既定テキスト |
| `--card` | `0 0% 100%` | `#FFFFFF` | カード背景 |
| `--card-foreground` | `222.2 47.4% 11.2%` | 同上 | カード上テキスト |
| `--popover` | `0 0% 100%` | `#FFFFFF` | ポップオーバー背景 |
| `--popover-foreground` | `222.2 47.4% 11.2%` | 同上 | ポップオーバー上テキスト |
| `--primary` | `221.2 83.2% 53.3%` | `#2563EB` 近似 | プライマリ（CTA・主要アクション・リンク強調） |
| `--primary-foreground` | `210 40% 98%` | `#F8FAFC` 近似 | プライマリ上テキスト |
| `--secondary` | `210 40% 96.1%` | `#F1F5F9` 近似 | セカンダリ面・薄ベース |
| `--secondary-foreground` | `222.2 47.4% 11.2%` | 同上 | セカンダリ面上テキスト |
| `--muted` | `210 40% 96.1%` | 同上 | 弱面背景 |
| `--muted-foreground` | `215.4 16.3% 46.9%` | `#64748B` 近似 | 補助テキスト |
| `--accent` | `210 40% 96.1%` | 同上 | アクセント面背景 |
| `--accent-foreground` | `222.2 47.4% 11.2%` | 同上 | アクセント面上テキスト |
| `--destructive` | `0 84.2% 60.2%` | `#EF4444` 近似 | 破壊操作・エラー |
| `--destructive-foreground` | `210 40% 98%` | 同上 | 破壊操作上テキスト |
| `--border` | `214.3 31.8% 91.4%` | `#E2E8F0` 近似 | 既定ボーダー |
| `--input` | `214.3 31.8% 91.4%` | 同上 | 入力枠 |
| `--ring` | `221.2 83.2% 53.3%` | プライマリと同 | フォーカスリング |
| `--sidebar-background` | `0 0% 98%` | `#FAFAFA` | サイドバー背景 |
| `--sidebar-foreground` | `222.2 47.4% 11.2%` | 同上 | サイドバー上テキスト |
| `--sidebar-primary` | `221.2 83.2% 53.3%` | 同上 | サイドバー アクティブ |
| `--sidebar-primary-foreground` | `210 40% 98%` | 同上 | 同上テキスト |
| `--sidebar-accent` | `210 40% 96.1%` | 同上 | サイドバー hover 等 |
| `--sidebar-accent-foreground` | `222.2 47.4% 11.2%` | 同上 | 同上テキスト |
| `--sidebar-border` | `214.3 31.8% 91.4%` | 同上 | サイドバー区切り |
| `--sidebar-ring` | `221.2 83.2% 53.3%` | 同上 | サイドバー フォーカス |

`tailwind.config.ts` 側マッピング：`bg-primary` / `text-primary` / `border-border` / `ring-ring` 等。

### 2. ブランド独自カラー（既存 `tailwind.config.ts` カスタム色）

| トークン | 値 | 用途（既存運用） |
|---------|----|----------------|
| `portfolio.blue` | `#3B82F6` | アクセント青（LP・カード） |
| `portfolio.blue-dark` | `#2563EB` | hover・強調 |
| `portfolio.blue-light` | `#60A5FA` | グラデ・薄面 |
| `portfolio.gray` | `#F3F4F6` | 弱面背景 |
| `portfolio.gray-dark` | `#E5E7EB` | 区切り線 |
| `portfolio.gray-light` | `#F9FAFB` | ページ薄面 |

これらは Tailwind の `bg-portfolio-blue` 等で参照可能（既存 `ELearningCard` で `bg-portfolio-blue` 使用）。

### 3. セマンティックカラーの運用（既存 + Eラーニング向け追加方針）

| 状態 | 既存利用 | Eラーニング新規利用 |
|------|---------|------------------|
| 成功・無料 | 緑系（`text-green-700` / `border-green-200` 等・既存 `ELearningTopClient`） | 「無料」バッジ・視聴完了マーク・成功トースト |
| 警告・非公開 | 黄／琥珀系（既存 `bg-yellow-200` 等） | 「非公開」バッジ・下書きステータス |
| エラー・返金 | `--destructive`（赤） | 削除確認・`refunded` ステータス・バリデーションエラー |
| 情報・カテゴリ | 青系（`portfolio.blue` / Tailwind blue） | カテゴリ Chip・情報トースト |
| 視聴可（再生） | プライマリ青（既存 `bg-blue-600`） | 再生ボタンオーバーレイ・主 CTA |
| 視聴ロック | グレー（Lock アイコン白／灰） | 鍵アイコン |

色のみで状態を伝えず、必ずアイコン・テキストを併記する（ng-patterns.md 参照）。

### 4. オーディオ・スライダー等の特殊色（既存 `globals.css`）

- `input[type="range"].audio-slider` のサム色：`#003B70`（紺）。これは既存音声プレーヤー用の独自色。Eラーニングの動画プレーヤーでは原則使わない（YouTube/Google Drive 埋め込みのため）

### 5. ダークモード

- `tailwind.config.ts` で `darkMode: ['class']` 設定済だが、`globals.css` 内に `.dark` 用の CSS 変数定義は **現状なし**
- Phase 1 ではダークモード対応を行わない方針（既存運用と同じ）
- 将来対応する場合：shadcn の標準ダーク CSS 変数を追加して対応する。本書スコープ外

## ルール・ビジネスロジック

- 新規色は CSS 変数追加（`globals.css`）→ `tailwind.config.ts` のマッピング追加 の順で導入する
- 任意の 16 進値を JSX に直書きしない（Tailwind の arbitrary value 多用禁止）
- `portfolio.*` のカスタム色は維持。新規追加が必要な場合は plan-lead に相談
- `--primary` の HSL 値は変えない（既存全画面に影響するため）
- セマンティック面を新規追加する場合（例：`--info` / `--success` / `--warning`）は別途 plan-lead に承認を得てから globals.css に追加

## NG

- arbitrary value（`bg-[#FFE6E6]`）の常用
- `text-red-500` 等の直接色名を「赤＝エラー」の意味で広範囲に使う（セマンティック面を経由する）
- 既存 `--primary` を別画面で上書きする
- ダークモード前提のクラス指定（`dark:bg-...` の常用）を Phase 1 で追加しない
- 透明度のみで階層表現を行う（背景色 + 影で表現する）

---

## 参照

- 既存：`app/globals.css` / `tailwind.config.ts`
- INDEX：`docs/frontend/design-system/INDEX.md`
- NG パターン：`docs/frontend/design-system/ng-patterns.md`
