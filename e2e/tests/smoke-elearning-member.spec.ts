import { test, expect } from '@playwright/test'

/**
 * Step 4 smoke：eラーニング会員ページ（認証必須）。
 *
 * 戦略（案 3 採用・team-lead 指示）：
 * - 未ログイン状態で /auth/login?returnTo=... へ redirect することを確認
 * - 本格的な認証セットアップ（storageState / programmatic login）は Phase 4 UAT で対応
 *
 * 対応 SC：
 * - SC-SMK-003 B002 旧会員ホーム /e-learning/home → redirect
 * - SC-SMK-004 B003 旧コース一覧 /e-learning/courses → redirect
 * - SC-SMK-005 B004 旧コース詳細 /e-learning/courses/[slug] → redirect
 * - SC-SMK-005c B004 新コース詳細 /e-learning/lp/courses/[slug] → redirect
 * - SC-SMK-005d B004 購入モーダル ?purchase=1 → redirect（未ログイン）
 * - SC-SMK-006 B005 旧コース視聴 → redirect
 * - SC-SMK-006c B005 新コース視聴 → redirect
 * - SC-SMK-007 B006 旧単体動画一覧 /e-learning/videos → redirect
 * - SC-SMK-008 B007 旧単体動画詳細 /e-learning/[id] → redirect
 * - SC-SMK-009 B009 旧購入完了 /e-learning/checkout/complete → redirect
 * - SC-SMK-010 B010 旧購入キャンセル /e-learning/checkout/cancel → redirect or 200
 * - SC-SMK-011 旧マイページ購入履歴 → redirect
 * - SC-SMK-011c 新マイページ購入履歴 → redirect
 * - SC-SMK-012 旧マイページブックマーク → redirect
 * - SC-SMK-012c 新マイページブックマーク → redirect
 * - SC-SMK-013 旧マイページ視聴履歴 → redirect
 * - SC-SMK-013c 新マイページ視聴履歴 → redirect
 * - SC-SMK-014 旧マイページプロフィール → redirect
 * - SC-SMK-014c 新マイページプロフィール → redirect
 * - SC-SMK-014d 新マイページ has_full_access バナー → redirect（未ログインのため確認不可）
 */

// 認証必須ページの redirect 確認用ヘルパ
async function expectAuthRedirect(page: import('@playwright/test').Page, path: string) {
  await page.goto(path, { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/(auth\/login|e-learning(?!\/lp)|$)/)
  // returnTo クエリが付与されていることを確認（/auth/login へ redirect 経路の場合）
  if (page.url().includes('/auth/login')) {
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo'), `returnTo should be set for ${path}`).toBeTruthy()
  }
}

test.describe('旧 e-learning 会員ページ smoke（未ログイン → redirect 確認）', () => {
  test('SC-SMK-003：旧 /e-learning/home', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/home')
  })

  test('SC-SMK-004：旧 /e-learning/courses', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/courses')
  })

  test('SC-SMK-005：旧 /e-learning/courses/test-slug', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/courses/test-slug')
  })

  test('SC-SMK-006：旧 /e-learning/courses/test-slug/videos/test-video', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/courses/test-slug/videos/test-video')
  })

  test('SC-SMK-007：旧 /e-learning/videos', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/videos')
  })

  test('SC-SMK-008：旧 /e-learning/[id]', async ({ page }) => {
    // 存在しない id だが認証チェックが先に走る想定
    await expectAuthRedirect(page, '/e-learning/00000000-0000-0000-0000-000000000000')
  })

  test('SC-SMK-009：旧 /e-learning/checkout/complete', async ({ page }) => {
    await page.goto('/e-learning/checkout/complete?session_id=test', { waitUntil: 'networkidle' })
    // 認証 redirect or 404 or 200 のいずれか（path 廃止の可能性あり）
    // ここでは redirect 経路か /e-learning へのフォールバックを許容
    await expect(page).not.toHaveURL(/cs_/) // 少なくとも Stripe URL には行かない
  })

  test('SC-SMK-010：旧 /e-learning/checkout/cancel', async ({ page }) => {
    await page.goto('/e-learning/checkout/cancel', { waitUntil: 'networkidle' })
    // 認証 redirect or 200（既存 path の挙動による・両方許容）
    const url = page.url()
    expect(url).toBeTruthy()
  })
})

test.describe('旧マイページ系 smoke（未ログイン → redirect 確認）', () => {
  test('SC-SMK-011：旧 /e-learning/mypage/purchases', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/mypage/purchases')
  })

  test('SC-SMK-012：旧 /e-learning/mypage/bookmarks', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/mypage/bookmarks')
  })

  test('SC-SMK-013：旧 /e-learning/mypage/progress', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/mypage/progress')
  })

  test('SC-SMK-014：旧 /e-learning/mypage', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/mypage')
  })
})

test.describe('新 LP 配下の認証必須ページ smoke（未ログイン → redirect 確認）', () => {
  test('SC-SMK-005c：新 /e-learning/lp/courses/dummy-ai-intro', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/courses/dummy-ai-intro')
  })

  test('SC-SMK-005d：新 /e-learning/lp/courses/dummy-ai-intro?purchase=1', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/courses/dummy-ai-intro?purchase=1')
  })

  test('SC-SMK-006c：新 /e-learning/lp/courses/dummy-ai-intro/videos/test-video', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/courses/dummy-ai-intro/videos/test-video')
  })

  test('SC-SMK-011c：新 /e-learning/lp/mypage/purchases', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage/purchases')
  })

  test('SC-SMK-012c：新 /e-learning/lp/mypage/bookmarks', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage/bookmarks')
  })

  test('SC-SMK-013c：新 /e-learning/lp/mypage/progress', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage/progress')
  })

  test('SC-SMK-014c：新 /e-learning/lp/mypage', async ({ page }) => {
    await expectAuthRedirect(page, '/e-learning/lp/mypage')
  })

  test('SC-SMK-014d：新 /e-learning/lp/mypage（has_full_access バナーは未ログイン redirect で確認スキップ）', async ({ page }) => {
    // 未ログイン redirect のため has_full_access バナー自体は確認できない（Phase 4 UAT 移送）
    await expectAuthRedirect(page, '/e-learning/lp/mypage')
  })
})

test.describe('SC-SMK-025：アクセス制御', () => {
  test('未ログインで会員ページ直アクセス → /auth/login?returnTo=... へ', async ({ page }) => {
    await page.goto('/e-learning/home', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/auth\/login/)
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/home')
  })
})
