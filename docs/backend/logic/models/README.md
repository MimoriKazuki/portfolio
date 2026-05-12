# Models 層（Phase 1）

## 実装ファイル（開発後はこちらが正）

（Phase 1 では空欄。実装時には `app/lib/models/` または `types/db/` 配下に TypeScript 型として配置）

## 概要

`schema.dbml` のテーブルに 1:1 で対応するドメインモデル（型）の定義場所。
TypeScript の `type` / `interface` で表現し、DB から取得した行をそのままアプリ層に流すための「型の信頼境界」を担う。

## 使用場面・責務

- repositories 層が DB から取得した row を models 型に変換して返す
- services 層が models 型を入出力する純粋関数として実装される
- controllers 層は models 型を JSON にシリアライズしてレスポンスする
- models は DB エンティティに対応する「値」だけを表現し、ビジネスロジックを持たない

## ルール・ビジネスロジック

### モデル一覧（Phase 1 で必要なもの）

| モデル名 | 対応テーブル | 主用途 |
|---------|-------------|--------|
| `EUser` | `e_learning_users` | 認証連携・フルアクセス判定の主体 |
| `ECategory` | `e_learning_categories` | コンテンツ分類 |
| `EContent` | `e_learning_contents` | 単体動画 |
| `ECourse` | `e_learning_courses` | コース（章＋動画の親） |
| `ECourseChapter` | `e_learning_course_chapters` | 章 |
| `ECourseVideo` | `e_learning_course_videos` | コース内動画 |
| `EMaterial` | `e_learning_materials` | PDF 資料（content_id XOR course_id） |
| `EPurchase` | `e_learning_purchases` | 購入レコード（completed / refunded） |
| `ELegacyPurchase` | `e_learning_legacy_purchases` | 旧購入レコード退避（読み取り専用） |
| `EBookmark` | `e_learning_bookmarks` | ブックマーク（course_id XOR content_id） |
| `EProgress` | `e_learning_progress` | 視聴進捗（course_video_id XOR content_id） |

### 命名規則

- 型名：`E` プレフィクス（既存命名規則 `e_learning_*` と整合）＋ パスカルケース単数形
- フィールド名：DB カラム名と完全一致（snake_case）。アプリ側の表記揺れを抑える
- ID は UUID 文字列として扱う（branded type は使わない）
- 日付：`Date` ではなく `string`（ISO 8601）として保持（API レスポンスと同じ形）

### 排他的 FK の表現

- `EPurchase` / `EBookmark` / `EMaterial` / `EProgress` の排他的 FK は型上では `course_id: string | null` / `content_id: string | null` として両方持つ
- アプリ層で「どちらが入っているか」を判定するヘルパは services 層に置く（models 層では持たない）

### 区分値の表現

- `EPurchase.status`：`'completed' | 'refunded'`（テンプレ DB の CHECK と完全一致）
- 区分値の追加・変更は schema.dbml の修正 → plan-lead 経由で db-plan-mate に依頼

### マスキング表現

- `EUser` には個別のマスキングメソッドを持たせない（表示時に services 層で展開）
- 退会済ユーザーの `display_name` / `avatar_url` のマスキング詳細は Gate 4 で db-plan-mate が確定する仕様に従う（schema-rationale で TBD）

## NG

- モデル層に DB クライアントを持ち込まない（型のみ）
- ビジネスロジック（権限判定・価格計算等）を models に書かない（services 層へ）
- 既存 `has_paid_access` を新規モデルに反映しない。M5 安全順序により段階削除する：
  1. has_full_access カラム追加
  2. 6名一括付与
  3. アプリ参照を切替
  4. 動作検証
  5. has_paid_access 削除
  Phase 1 設計時点では `EUser` には `has_full_access` のみ書く（has_paid_access は記載しない）
- models 同士の循環依存を作らない（章 → コース、動画 → 章 のような単方向参照に留める）
