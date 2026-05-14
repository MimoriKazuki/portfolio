import { test, expect } from '@playwright/test'

/**
 * Phase 3 Step 4：phase4-regression.md 18 件の Playwright 実装。
 *
 * 設計：
 * - 未ログイン redirect / CTA href / 既存 path 200 表示 は通常実装
 * - 認証付き UI 動作 / Stripe テストモード必須 / 中間状態 DB 確認は test.skip で
 *   Phase 4 UAT 本実装へ移送（理由を skip メッセージに明記）
 * - 18 件すべての SC を describe / test で表現し、カバレッジ漏れをゼロにする
 */

// 既存 dev-seed テスト用 slug
const TEST_SLUG = 'dummy-ai-intro'
const TEST_VIDEO_ID = '00000000-0000-0000-0000-000000000000' // ダミー

// 共通ヘルパ：未ログイン状態で auth/login へ redirect されることを assert
async function expectAuthRedirect(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/auth\/login(\?|$)/)
  const url = new URL(page.url())
  const returnTo = url.searchParams.get('returnTo')
  expect(returnTo, `returnTo should be set for ${path}`).toBeTruthy()
}

// 共通ヘルパ：非管理者として admin path にアクセス → /admin/e-learning or /auth/login へ redirect
async function expectAdminRedirect(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  const url = page.url()
  const isLogin = url.includes('/auth/login')
  const isElearning = /\/e-learning(?!\/lp)(?:\?|\/|$)/.test(url) && !url.includes('/admin/')
  expect(isLogin || isElearning, `${path} → /auth/login or /e-learning へ redirect すべき（current: ${url}）`).toBe(true)
}

test.describe('Regression Group A：認証 redirect 系', () => {
  test('SC-REG-003 (B004)：未ログインで /e-learning/lp/courses/[slug] → returnTo 付き redirect', async ({ page }) => {
    await expectAuthRedirect(page, `/e-learning/lp/courses/${TEST_SLUG}`)
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain(`/e-learning/lp/courses/${TEST_SLUG}`)
  })

  test('SC-REG-003 (B005)：未ログインで /e-learning/lp/courses/[slug]/videos/[videoId] → returnTo 付き redirect', async ({ page }) => {
    await expectAuthRedirect(page, `/e-learning/lp/courses/${TEST_SLUG}/videos/${TEST_VIDEO_ID}`)
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain(`/e-learning/lp/courses/${TEST_SLUG}/videos/${TEST_VIDEO_ID}`)
  })

  test('SC-REG-006 (B011)：未ログインで /e-learning/lp/mypage/purchases → returnTo 付き redirect', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage/purchases')
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/mypage/purchases')
  })

  test('SC-REG-006 (B012)：未ログインで /e-learning/lp/mypage/bookmarks → returnTo 付き redirect', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage/bookmarks')
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/mypage/bookmarks')
  })

  test('SC-REG-006 (B013)：未ログインで /e-learning/lp/mypage/progress → returnTo 付き redirect', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage/progress')
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/mypage/progress')
  })

  test('SC-REG-007 (B014)：未ログインで /e-learning/lp/mypage → returnTo 付き redirect', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage')
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/mypage')
  })
})

test.describe('Regression Group B：管理画面 admin-guard', () => {
  test('SC-REG-009 (C005)：非管理者で /admin/e-learning/courses → redirect', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses')
  })

  test('SC-REG-009 (C006)：非管理者で /admin/e-learning/courses/new → redirect', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/new')
  })

  test('SC-REG-009 (C007)：非管理者で /admin/e-learning/courses/[id]/edit → redirect', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/courses/00000000-0000-0000-0000-000000000000/edit')
  })

  test('SC-REG-012 (C010)：非管理者で /admin/e-learning/users → redirect', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/users')
  })

  test('SC-REG-012 (C009)：非管理者で /admin/e-learning/purchases → redirect', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/purchases')
  })

  test('SC-REG-018 (C011)：非管理者で /admin/e-learning/legacy-purchases → redirect', async ({ page }) => {
    await expectAdminRedirect(page, '/admin/e-learning/legacy-purchases')
  })
})

test.describe('Regression Group C：CTA href / 旧 path 非破壊', () => {
  test('SC-REG-001 (B001)：新 LP の CTA リンク先が新 path に接続されている', async ({ page }) => {
    const res = await page.goto('/e-learning/lp', { waitUntil: 'networkidle' })
    expect(res?.status()).toBe(200)
    // HeroSection の CTA リンク先を確認
    // - 「コースを探す」→ /e-learning/lp/courses
    // - 「無料で始める」（または同等のログイン誘導）→ /auth/login
    const coursesLinks = page.locator('a[href="/e-learning/lp/courses"]')
    await expect(coursesLinks.first()).toBeAttached() // 1 つ以上存在することを確認
    const loginLinks = page.locator('a[href="/auth/login"]')
    await expect(loginLinks.first()).toBeAttached()
  })

  test('SC-REG-004 (B002 旧)：既存 /e-learning/courses は認証必須・redirect されること（非破壊）', async ({ page }) => {
    // 旧パスも middleware で startsWith('/e-learning/') にガードされている（screens.md 通り）。
    // 未ログインなら /auth/login?returnTo=... へ redirect されることで「壊れていない」を担保。
    // review-mate 指摘：toBeTruthy() ノーアサート解消、expectAuthRedirect で明示
    await expectAuthRedirect(page, '/e-learning/courses')
  })

  test('SC-REG-008 (B014 旧)：既存 /e-learning/mypage は認証必須・redirect されること（非破壊）', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/mypage')
  })
})

test.describe('Regression Group D：B005 視聴権限', () => {
  test('SC-REG-002：未ログインで B005 直アクセス → /auth/login へ redirect（denied 確認は UAT へ）', async ({ page }) => {
    // 未ログイン状態は middleware で /auth/login へ redirect されるため、
    // 「視聴権限なしで denied=1 付き redirect」は UAT で認証付きシナリオとして検証する
    // 本 smoke は middleware ガードが正しく機能していることのみ確認
    await expectAuthRedirect(page, `/e-learning/lp/courses/${TEST_SLUG}/videos/${TEST_VIDEO_ID}`)
  })
})

test.describe('Regression Group E：Phase 4 UAT へ移送（認証付き / Stripe / 中間状態）', () => {
  test.skip('SC-REG-005 (B007)：PurchasePromptModal v1 非破壊（ログイン + 有料動画 + 未購入が必要・Phase 4 UAT 対応）', async () => {
    // 認証 + 有料動画 + 未購入状態の組み合わせが必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-010：charge.refunded が新形式 purchases に干渉しない（Stripe テストモード必須・Phase 4 UAT 対応）', async () => {
    // Stripe trigger charge.refunded + DB 状態確認が必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-011：旧 /api/stripe/checkout 後方互換（Stripe テストモード + Webhook 完走必須・Phase 4 UAT 対応）', async () => {
    // Stripe Session 作成 + Webhook + DB 状態確認が必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-013 (C008)：DnD 並び替えエラー時に中間状態が DB に残らない（管理者認証 + DB 状態確認必須・Phase 4 UAT 対応）', async () => {
    // 管理者ログイン + DnD 操作 + DB 直接確認が必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-014 (C001)：deleted フィルタ追加後も既存フィルタ非破壊（管理者認証 + UI 操作必須・Phase 4 UAT 対応）', async () => {
    // 管理者ログイン + Select 操作 + DB 状態確認が必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-015 (C002/C003)：stripe_price_id 追加後も既存フォーム非破壊（管理者認証 + フォーム入力 + クリーンアップ必須・Phase 4 UAT 対応）', async () => {
    // 管理者ログイン + フォーム CRUD + [TEST_CONTENT_REG015] のクリーンアップが必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-016 (C001/C002/C003)：DeleteELearningButton 論理削除非破壊（管理者認証 + 削除フロー必須・Phase 4 UAT 対応）', async () => {
    // 管理者ログイン + [TEST_CONTENT_DEL] 事前作成 + 削除確認が必要。Phase 4 UAT で実施。
  })

  test.skip('SC-REG-017 (C004)：状態フィルタ追加後も既存カテゴリ操作非破壊（管理者認証 + カテゴリ CRUD 必須・Phase 4 UAT 対応）', async () => {
    // 管理者ログイン + [TEST_CATEGORY] 追加・削除 + 並び替え DB 確認が必要。Phase 4 UAT で実施。
  })
})
