# 概念モデル（Gate 2）

## 前提

- Gate 1（業務分析）はディレクター承認済（2026-05-12）。本書は Gate 1 の確定事項（N6-N9 含む）を踏まえて作成
- 属性レベルの設計は Gate 3 で行う。本ゲートでは「エンティティの粒度と関係」のみを確定させる
- 既存稼働中の Supabase 環境を継続使用し、既存 e_learning_* テーブル群は追加方向のみで拡張する（破壊的変更なし）
- 既存スキーマは `supabase/migrations/20251203〜20251214_*.sql` の e_learning 関連 9 ファイルで参照可能
- PK は既存ルールに従い UUID（`gen_random_uuid()`）を採用（Gate 3-4 で正式確定）
- Phase 1 で確定したエンティティ追加・分割の判断は、本書「エンティティ統合・分割の判断記録」に必ず根拠を残す

---

## エンティティ一覧

各エンティティの「名前と1行説明」のみ記述する。属性は書かない（Gate 3 で確定）。
凡例：`(既存)` は既存稼働中のテーブル、`(新規)` は Phase 1 で追加するエンティティ、`(将来用)` はスコープ外で受け皿のみ存続。

| エンティティ（仮称） | 1行説明 | 種別 | 状態 |
|--------------------|---------|------|------|
| e_learning_users | Eラーニング利用者（109件継続。`has_full_access` フラグを追加予定・Gate 3 で確定） | マスタ | 既存 |
| e_learning_categories | コンテンツのカテゴリ（6件継続） | マスタ | 既存 |
| e_learning_materials | 動画に付随する PDF 等の資料（7件継続） | マスタ | 既存 |
| e_learning_contents | 単体動画（既存15件はここに残る・コースには所属しない） | マスタ／商品 | 既存 |
| e_learning_courses | コース（複数動画を束ねた商品。章を持ち、章内動画に順序を持つ） | マスタ／商品 | 新規 |
| e_learning_course_chapters | 章（1コース内の節）。章はコース内で順序を持つ | マスタ | 新規 |
| e_learning_course_videos | コース内動画。章に所属し、章内で順序を持つ。`is_free` フラグで個別マーキング可（Gate 3 で属性確定） | マスタ／商品 | 新規 |
| e_learning_purchases | 購入レコード（コース購入／単体動画購入を両方扱う・Gate 3 で属性確定。既存6件保持） | トランザクション | 既存／拡張 |
| e_learning_bookmarks | ブックマーク（3件継続。FK 参照先を `e_learning_users.id` に統一する・設計負債1の対応） | トランザクション | 既存／拡張 |
| e_learning_progress | 視聴進捗（視聴完了フラグのみ。コース完了判定は末尾到達ベースで集計） | トランザクション | 新規 |
| e_learning_corporate_customers | 法人契約企業（0件・将来用に受け皿のみ存続。Phase 1 ではモデルに含めるが参照しない） | マスタ | 将来用 |
| e_learning_corporate_users | 法人契約に紐づくユーザーメール（0件・将来用に受け皿のみ存続。Phase 1 では参照しない） | マスタ | 将来用 |

種別の凡例：
- **マスタ**：業務で繰り返し参照される基本情報
- **マスタ／商品**：販売・視聴対象となる商品実体（マスタ性質を持つ）
- **トランザクション**：業務活動として発生するデータ
- **将来用**：Phase 1 ではモデル上の存在のみ。Phase 2 以降で本格利用予定

---

## エンティティ間のリレーション

リレーションをカーディナリティ（1:1 / 1:N / N:N）と業務上の意味で記述する。
削除時の挙動方針は仮置きであり、最終決定は Gate 3 / Gate 4 で行う。

### 0. auth.users → e_learning_users
- カーディナリティ：**1:1**
- 関係の意味：Supabase Auth のユーザーとEラーニング利用者を1対1で紐付ける。`e_learning_users.auth_user_id` に UNIQUE 制約あり（既存スキーマ通り）
- 削除時の挙動方針（仮）：**CASCADE**（既存運用継続。auth.users 削除時に e_learning_users も削除）

### 1. e_learning_users → e_learning_purchases
- カーディナリティ：**1:N**
- 関係の意味：1ユーザーは複数の購入レコードを持つ（コース購入・単体動画購入の両方）
- 削除時の挙動方針（仮）：**RESTRICT**（購入履歴は税務観点で永続保持・ユーザー削除時は論理削除＋履歴保持を想定）

### 2. e_learning_users → e_learning_bookmarks
- カーディナリティ：**1:N**
- 関係の意味：1ユーザーは複数のブックマークを持つ
- 削除時の挙動方針（仮）：**CASCADE**（ブックマークは個人のみの軽量データ。退会時の保持要件は次点質問で確定予定）
- 補足：既存の FK 参照先は `auth.users.id` であるが、Phase 1 で `e_learning_users.id` 参照に統一する（設計負債1）

### 3. e_learning_users → e_learning_progress
- カーディナリティ：**1:N**
- 関係の意味：1ユーザーは（コース内動画／単体動画それぞれについて）複数の進捗レコードを持つ
- 削除時の挙動方針（仮）：**CASCADE**（進捗は個人データ・分析利用は次点質問で確定予定）

### 4. e_learning_categories → e_learning_contents
- カーディナリティ：**1:N**
- 関係の意味：1カテゴリは複数の単体動画を持つ。既存運用継続
- 削除時の挙動方針（仮）：**RESTRICT**（カテゴリ削除時に動画が孤立しないようガード）

### 5. e_learning_categories → e_learning_courses
- カーディナリティ：**1:N**（暫定）
- 関係の意味：1カテゴリは複数のコースを持つ。コース側にカテゴリを持たせるかは Gate 3 で確認
- 削除時の挙動方針（仮）：**RESTRICT**
- 備考：コースが「カテゴリに属さない」運用もあり得るため、Gate 3 で必須／任意を確定

### 6. e_learning_courses → e_learning_course_chapters
- カーディナリティ：**1:N**
- 関係の意味：1コースは複数の章を持つ。章はコース内で順序を持つ
- 削除時の挙動方針（仮）：**CASCADE**（コース廃止時は章ごと削除）

### 7. e_learning_course_chapters → e_learning_course_videos
- カーディナリティ：**1:N**
- 関係の意味：1章は複数の動画を持つ。動画は章内で順序を持つ
- 削除時の挙動方針（仮）：**CASCADE**（章廃止時は所属動画ごと削除）

### 8. e_learning_contents → e_learning_materials
- カーディナリティ：**1:N**
- 関係の意味：1単体動画は複数の付随資料（PDF 等）を持ち得る。既存運用継続
- 削除時の挙動方針（仮）：**CASCADE**

### 9. e_learning_course_videos → e_learning_materials
- カーディナリティ：**1:N**（暫定）
- 関係の意味：コース内動画も付随資料を持ち得る。`e_learning_materials` 側の参照先を「単体動画 or コース内動画」のどちらかに振る設計が必要（Gate 3 で確定）
- 削除時の挙動方針（仮）：**CASCADE**
- 備考：単体動画と共用なら排他的所有関係になる。テーブル分割案も含めて Gate 3 で再検討

### 10. e_learning_purchases → e_learning_courses
- カーディナリティ：**N:1**
- 関係の意味：購入レコードが「コース購入」種別の場合、購入対象のコースを参照する
- 削除時の挙動方針（仮）：**RESTRICT**（コース廃止後も購入履歴は永続保持）

### 11. e_learning_purchases → e_learning_contents
- カーディナリティ：**N:1**
- 関係の意味：購入レコードが「単体動画購入」種別の場合、購入対象の単体動画を参照する
- 削除時の挙動方針（仮）：**RESTRICT**
- 備考：購入は「コース or 単体動画」のいずれかを必ず指し、両方同時には指さない（排他的）。Gate 3 で CHECK 制約の検討

### 12. e_learning_progress → e_learning_course_videos
- カーディナリティ：**N:1**
- 関係の意味：進捗レコードが「コース内動画」の視聴を表す場合、対象動画を参照する
- 削除時の挙動方針（仮）：**CASCADE**

### 13. e_learning_progress → e_learning_contents
- カーディナリティ：**N:1**
- 関係の意味：進捗レコードが「単体動画」の視聴を表す場合、対象動画を参照する
- 削除時の挙動方針（仮）：**CASCADE**
- 備考：進捗も「コース内動画 or 単体動画」のいずれかを必ず指す（排他的）

### 14. e_learning_users → e_learning_bookmarks → e_learning_contents
- カーディナリティ：N:1（bookmarks → contents）
- 関係の意味：1ブックマークは1単体動画を指す（既存仕様）
- 削除時の挙動方針（仮）：**CASCADE**
- 補足：コース内動画のブックマーク対応は Phase 1 スコープ外（Gate 3 で再確認）

### 15. e_learning_corporate_customers → e_learning_corporate_users
- カーディナリティ：**1:N**
- 関係の意味：1法人契約に複数のメンバーメールを紐付ける（既存スキーマ・将来用）
- 削除時の挙動方針（仮）：**CASCADE**
- 補足：Phase 1 では参照しない

---

## ER 図

```
[auth.users]                       ← Supabase Auth スキーマ（参照のみ）
     │
     │ 1:1（既存：auth.users.id を保持）
     ▼
[e_learning_users] ─┬─< [e_learning_bookmarks] >─ [e_learning_contents]
        │           │
        │           ├─< [e_learning_purchases] >─┬─ [e_learning_courses]
        │           │                            │
        │           │                            └─ [e_learning_contents]  ※排他
        │           │
        │           └─< [e_learning_progress] >─┬─ [e_learning_course_videos]
        │                                       │
        │                                       └─ [e_learning_contents]  ※排他
        │
[e_learning_categories]
        │
        ├─< [e_learning_contents] >─< [e_learning_materials]
        │           （単体動画15件・既存継続）
        │
        └─< [e_learning_courses]
                    │
                    └─< [e_learning_course_chapters]
                                │
                                └─< [e_learning_course_videos] >─< [e_learning_materials]
                                                                    ※コース内動画にも付随資料あり得る（Gate 3 で再検討）

[e_learning_corporate_customers] ─< [e_learning_corporate_users]    ※将来用・Phase 1 では参照しない
```

凡例：
- `─┬─` `─<` ：1対多の親子関係（左が親、右が子）
- `※排他` ：N:1 関係のうち、購入／進捗が「コース or 単体動画」のどちらか片方のみを指す制約

---

## エンティティ統合・分割の判断記録

このゲートで判断したエンティティ構造について、根拠を記録する。

### 判断1：コース内動画と単体動画を別エンティティとする（統合しない）

- 検討した選択肢：
  - **案A**：`e_learning_contents` テーブルに「単体動画／コース内動画」フラグを持たせて統合
  - **案B**：単体動画は `e_learning_contents` 継続、コース内動画は新規 `e_learning_course_videos` テーブルで分離（採用）
- 採用した案：**B**
- 理由：
  1. 業務上の意味が異なる：単体動画は「単独で販売される商品」、コース内動画は「コース商品の構成要素」（販売単位ではない）
  2. 既存 15 件はそのまま単体動画として継続することが Gate 1 で確定（コースには入れない）。統合すると既存レコードのマイグレーションリスクが上がる
  3. コース内動画は「章への所属」「章内順序」という構造を持つが、単体動画はそれを持たない。同一テーブルだと制約・NULL カラムが増えて意味が曖昧になる
  4. 「コース内動画は個別購入できない」というルールが Gate 1 で確定済。販売単位を別テーブルで表現するほうが制約が自然
- 後続 Gate への影響：
  - 購入レコード（`e_learning_purchases`）は「コース or 単体動画」を指す N:1 排他的関係を持つ（Gate 3 で CHECK 制約検討）
  - 進捗レコード（`e_learning_progress`）も同様の排他的関係を持つ
  - `e_learning_materials`（付随資料）は単体動画／コース内動画の両方に紐づき得るが、片方ずつしか紐づかない（Gate 3 で「polymorphic な FK」か「テーブル分割」かを再検討）

### 判断2：章（chapters）を独立エンティティとして切り出す

- 検討した選択肢：
  - **案A**：章番号を `e_learning_course_videos` の属性（chapter_no, chapter_title 等）として持ち、章テーブルを作らない
  - **案B**：`e_learning_course_chapters` を独立エンティティとして切り出す（採用）
- 採用した案：**B**
- 理由：
  1. Gate 1 で「章構造あり」「動画順序あり」が確定。章自体に「タイトル」「順序」「概要」等の属性を持たせる余地がある
  2. 案 A だと、同じ章タイトルが複数動画レコードに重複して保存され、章タイトル変更時に全動画への一括 UPDATE が必要になる（正規化違反）
  3. 章単位での操作（章ごと並べ替え・章単位の公開／非公開・章ごとの修了集計）が将来発生したときに、独立エンティティであれば自然に対応可能
  4. Udemy 等の同種サービスも章を独立構造として扱うのが標準
- 後続 Gate への影響：
  - 階層構造は「コース → 章 → コース内動画」の3階層に確定
  - 順序属性は「章の順序（コース内）」と「動画の順序（章内）」の2系統を Gate 3 で属性化

### 判断3：進捗を別エンティティとして切り出す（視聴完了フラグのみ）

- 検討した選択肢：
  - **案A**：進捗テーブルは作らず、ユーザー × 動画の関係を JSON 等で `e_learning_users` に保持
  - **案B**：`e_learning_progress` を独立エンティティとして切り出す（採用）
- 採用した案：**B**
- 理由：
  1. Gate 1 確定事項：進捗は「視聴完了フラグのみ」（最終再生位置・秒数は不要）／コース完了判定は「末尾到達」
  2. 視聴完了フラグだけでも「N人 × M動画」のレコード数になる想定。`e_learning_users` 側の JSON カラムに持つと検索性能が著しく低下
  3. 「コース完了率」「単体動画の視聴数」等の集計は、進捗テーブルに対する SQL 集計で算出する想定（修了証なしのため複雑な完了判定は不要）
- 後続 Gate への影響：
  - 進捗は「コース内動画 or 単体動画」のいずれかを指す（コース単位の進捗は持たず、末尾動画到達で完了とみなす）
  - Gate 3 で「視聴完了日時の保持要否」「同一動画の複数回視聴の扱い」を確定

### 判断4：`has_full_access` は `e_learning_users` の属性とし、別エンティティ化しない

- 検討した選択肢：
  - **案A**：`e_learning_users` に `has_full_access` bool フラグを追加（採用）
  - **案B**：`e_learning_full_access_grants` のような別テーブルで管理（有効期限・付与履歴を持つ設計）
- 採用した案：**A**
- 理由：
  1. Gate 1 確定事項：「弊社メンバー有効期限は無期限・運用メンバー追加は管理画面で手動切替」
  2. 履歴保持・有効期限・付与理由といった属性が不要なため、別テーブル化する業務的根拠がない
  3. 既存6名は移行時に自動 true、運用メンバーは管理画面で手動切替という運用がシンプル
  4. 既存 `e_learning_users` には類似フラグ `has_paid_access`（bool）が既に存在するため、フラグ運用の前例がある
- 後続 Gate への影響：
  - Gate 3 で `e_learning_users` に `has_full_access boolean NOT NULL DEFAULT false` を追加
  - 既存 `has_paid_access` カラムの扱い（廃止／継続／意味の再整理）を Gate 3 で確定（未確定事項に記載）
  - 将来「有効期限を持たせたい」「付与履歴を残したい」要求が出た場合に別テーブル化を再検討（schema-changes に記録）

### 判断5：購入対象を「コース or 単体動画」の排他的 N:1 で表現する

- 検討した選択肢：
  - **案A**：`e_learning_purchases` に `target_type` カラム + `target_id` で polymorphic 参照（FK 不可）
  - **案B**：`course_id` / `content_id` の2カラムを持たせ、片方のみ NOT NULL の CHECK 制約で排他的に表現（採用）
  - **案C**：購入テーブルを「コース購入」「単体動画購入」の2テーブルに分割
- 採用した案：**B**
- 理由：
  1. 設計負債2の対応として「purchases.content_id NULL 許容（全買い切り = NULL）」の意味を再整理する必要があり、Phase 1 で意味を明確にする
  2. polymorphic 参照（案 A）は FK を張れず、データ整合性を DB で保証できない
  3. 案 C はクエリが複雑化（合算集計・領収書一覧で UNION が必要）し、Stripe Webhook 受信ハンドラが分岐
  4. 案 B は CHECK 制約で「片方のみ NOT NULL」を保証でき、FK もそれぞれ張れる
  5. 既存スキーマには `UNIQUE(user_id, content_id)` 制約があるが、`content_id IS NULL` を含む6件はこの UNIQUE 上で重複可能性を持つため、Gate 4 で UNIQUE 制約の再設計（`UNIQUE(user_id, course_id)` と `UNIQUE(user_id, content_id)` の2本に分割など）が必要
- 後続 Gate への影響：
  - Gate 3 で `CHECK ((course_id IS NOT NULL AND content_id IS NULL) OR (course_id IS NULL AND content_id IS NOT NULL))` を定義
  - 既存6件は `content_id IS NULL` のため「全コンテンツ買い切り」を表現していたが、Phase 1 移行時に該当ユーザーへ `has_full_access=true` を付与し、購入レコード自体は保持。新スキーマ上での意味を「特殊な歴史的レコード」として扱うか、別途運用ルールを決めるかを Gate 3 で確定

### 判断6：法人系2テーブルを Phase 1 のモデルに含めるが参照しない

- 検討した選択肢：
  - **案A**：Phase 1 スコープ外として、概念モデルからも除外
  - **案B**：既存稼働中（0件だが存続）のため概念モデルに残し、「将来用」として明示（採用）
- 採用した案：**B**
- 理由：
  1. Gate 1 確定事項：既存テーブルはそのまま継続（破壊的変更を行わない）
  2. 概念モデルから除外すると、Gate 4 物理設計時にテーブル一覧で見落とすリスクがある
  3. 「将来用」と明示することで、Phase 1 では追加リレーションを引かず触らないという方針が明示できる
- 後続 Gate への影響：
  - Gate 3 / Gate 4 では既存スキーマ通りに記述し、新規 FK・新規参照は引かない

---

## 未確定事項（ディレクター 確認必要）

Gate 3 開始までに業務観点でディレクター確認が必要な項目を整理する。

業務観点（Gate 3 直前までに確定したい）：

- [ ] **e_learning_materials の所有先**：単体動画と共用なら排他的所有関係（content_id / course_video_id のいずれか片方）の polymorphic 設計、または「単体動画用 materials」と「コース内動画用 materials」のテーブル分割のどちらを採用するか（既存 `e_learning_materials` は `content_id` のみで `e_learning_contents` を参照する設計）
- [ ] **e_learning_categories と e_learning_courses の関係**：コースは必ずカテゴリに属するか／属さないコースを許容するか（必須／任意）
- [ ] **既存購入レコード6件の意味の再定義**：新スキーマで「コース or 単体動画」の排他的 N:1 関係を取る場合、`content_id IS NULL` の歴史的レコードをどう扱うか（特例として残す／移行時に新仕様へ補正する／別テーブルに退避）
- [ ] **既存 `has_paid_access` カラムの扱い**：`has_full_access` 追加に伴い、既存の `has_paid_access`（bool）を廃止する／意味を分離して残す／統合するか
- [ ] **コース内動画のブックマーク対応**：Phase 1 ではブックマーク対象は単体動画のみで継続する想定でよいか（Gate 1 時点では既存3件継続のみ確定）

Gate 4 で確定で良いもの（属性レベル）：

- [ ] 削除時の挙動（CASCADE / RESTRICT / SET NULL）の最終確定
- [ ] 進捗の「視聴完了日時の保持要否」「同一動画の複数回視聴時の扱い（上書き／履歴）」
- [ ] 章・動画の順序属性のデータ型・採番ルール
- [ ] 公開／非公開切替の運用方式（status カラム / deleted_at / 両方）
- [ ] `e_learning_purchases` の UNIQUE 制約再設計（既存 `UNIQUE(user_id, content_id)` を `UNIQUE(user_id, course_id)` と `UNIQUE(user_id, content_id)` に分離するか・それぞれ NULL 込み UNIQUE をどう運用するか）

---

## ディレクター 承認

- [ ] Gate 2 承認日：YYYY-MM-DD
- [ ] 確定事項：エンティティ 12 個（既存 8 + 新規 4）、リレーション 16 本（auth.users 連携含む）
- [ ] 承認時のメモ：

---

## 参照

- 業務分析：`docs/backend/database/business-analysis.md`
- 確定事項：`docs/phase1/gate1-confirmed-decisions.md`
- 既存スキーマ（マイグレーションファイル群）：`supabase/migrations/20251203093613_create_e_learning_tables.sql` ほか e_learning 関連 9 ファイル
- 設計パターンガイド：`~/.claude/templates/plan/db-design-patterns.md`
- プロジェクト基本情報：`CLAUDE.md`
