import { test, expect } from '@playwright/test'

/**
 * Step 4 smoke：管理画面 C001-C011（admin-guard 必須）。
 *
 * 戦略（案 3 採用・team-lead 指示）：
 * - 未ログイン状態で /auth/login or /e-learning へ redirect することを確認
 * - 本格的な管理者認証セットアップは Phase 4 UAT で対応（admin storageState）
 *
 * 対応 SC：
 * - SC-SMK-015 C001 /admin/e-learning
 * - SC-SMK-015b C001 削除済フィルタ選択肢（redirect 経路で UI 確認は不可）
 * - SC-SMK-016 C002 /admin/e-learning/new
 * - SC-SMK-016b C002 stripe_price_id 入力欄（redirect 経路で UI 確認は不可）
 * - SC-SMK-017 C003 /admin/e-learning/[id]/edit
 * - SC-SMK-017b C003 stripe_price_id 入力欄
 * - SC-SMK-018 C004 /admin/e-learning/categories
 * - SC-SMK-018b C004 状態フィルタ選択肢
 * - SC-SMK-019 C005 /admin/e-learning/courses
 * - SC-SMK-019b C005 コース管理 AdminPageHeader
 * - SC-SMK-020 C006 /admin/e-learning/courses/new
 * - SC-SMK-020b C006 CourseFormClient
 * - SC-SMK-021 C007 /admin/e-learning/courses/[id]/edit
 * - SC-SMK-021b/c C007/C008 タブ（基本情報・カリキュラム）
 * - SC-SMK-022 C009 /admin/e-learning/purchases
 * - SC-SMK-022b C009 購入履歴フィルタ・テーブル
 * - SC-SMK-023 C010 /admin/e-learning/users
 * - SC-SMK-023b C010 フルアクセスユーザー管理
 * - SC-SMK-024 C011 /admin/e-learning/legacy-purchases
 * - SC-SMK-024b C011 レガシー購入読み取り専用
 * - SC-SMK-026 非管理者アクセス制御
 */

// 管理画面 redirect 確認用ヘルパ
async function expectAdminRedirect(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  // 未ログインなら /auth/login、認証済だが管理者でない場合は /e-learning（admin-guard 403 経路）
  // 本 smoke は未ログイン前提のため /auth/login へ redirect する想定
  const url = page.url()
  const isLogin = url.includes('/auth/login')
  // /e-learning/lp/* は除外して /e-learning ルート / 配下のみマッチ（review-mate 指摘：末尾 ? が lookahead を optional にしていたバグ修正）
  const isElearning = /\/e-learning(?!\/lp)(?:\?|\/|$)/.test(url) && !url.includes('/admin/')
  expect(isLogin || isElearning, `${path} は /auth/login or /e-learning へ redirect すべき（current: ${url}）`).toBe(true)
}

test.describe('管理画面 smoke（未ログイン → redirect 確認）', () => {
  test('SC-SMK-015：C001 /admin/e-learning', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning')
  })

  test('SC-SMK-015b：C001 削除済フィルタ（admin guard により UI 確認は Phase 4 UAT で実施）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning?publishFilter=deleted')
  })

  test('SC-SMK-016：C002 /admin/e-learning/new', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/new')
  })

  test('SC-SMK-016b：C002 stripe_price_id 入力欄（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/new')
  })

  test('SC-SMK-017：C003 /admin/e-learning/[id]/edit', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/00000000-0000-0000-0000-000000000000/edit')
  })

  test('SC-SMK-017b：C003 stripe_price_id 入力欄（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/00000000-0000-0000-0000-000000000000/edit')
  })

  test('SC-SMK-018：C004 /admin/e-learning/categories', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/categories')
  })

  test('SC-SMK-018b：C004 状態フィルタ（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/categories')
  })

  test('SC-SMK-019：C005 /admin/e-learning/courses', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses')
  })

  test('SC-SMK-019b：C005 AdminPageHeader（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses')
  })

  test('SC-SMK-020：C006 /admin/e-learning/courses/new', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/new')
  })

  test('SC-SMK-020b：C006 CourseFormClient（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/new')
  })

  test('SC-SMK-021：C007 /admin/e-learning/courses/[id]/edit', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/00000000-0000-0000-0000-000000000000/edit')
  })

  test('SC-SMK-021b：C007 基本情報タブ（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/00000000-0000-0000-0000-000000000000/edit')
  })

  test('SC-SMK-021c：C008 カリキュラムタブ（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/00000000-0000-0000-0000-000000000000/edit?tab=curriculum')
  })

  test('SC-SMK-022：C009 /admin/e-learning/purchases', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/purchases')
  })

  test('SC-SMK-022b：C009 購入履歴フィルタ・テーブル（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/purchases')
  })

  test('SC-SMK-023：C010 /admin/e-learning/users', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/users')
  })

  test('SC-SMK-023b：C010 フルアクセスユーザー管理（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/users')
  })

  test('SC-SMK-024：C011 /admin/e-learning/legacy-purchases', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/legacy-purchases')
  })

  test('SC-SMK-024b：C011 レガシー購入読み取り専用（admin guard により UI 確認は Phase 4 UAT）', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/legacy-purchases')
  })
})

test.describe('SC-SMK-026：管理画面アクセス制御', () => {
  // SC-SMK-015 が /admin/e-learning を対象としているため、独立カバレッジとして別パスを採用
  // 「アクセス制御は複数 path で機能する」ことを示す（review-mate 指摘の重複解消）
  test('未ログインで管理画面の別 path 直アクセス → /auth/login or /e-learning へ', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/purchases')
  })
})
