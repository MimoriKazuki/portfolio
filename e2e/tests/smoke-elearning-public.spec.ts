import { test, expect } from '@playwright/test'
import { collectConsoleErrors } from '../fixtures/console-helper'

/**
 * Step 4 smoke：eラーニング公開ページ（認証不要）。
 *
 * 対応 SC：
 * - SC-SMK-004c B002 新コース一覧（/e-learning/lp/courses）※ 認証不要パス
 * - SC-SMK-004d B003 新単体動画一覧（/e-learning/lp/videos）※ 認証不要パス
 * - SC-SMK-010c B010 新購入キャンセル（/e-learning/lp/checkout/cancel）→ 既存 smoke-checkout でカバー済（参照のみ）
 * - SC-SMK-009c B009 新購入完了（session_id なし）（/e-learning/lp/checkout/complete）
 *
 * 注：/e-learning/lp/courses と /e-learning/lp/videos は middleware で認証必須化されている可能性あり。
 * 実際の挙動に従って redirect の場合は redirect spec 側に移動する（本ファイルは「200 表示できる場合」のみ assert）。
 */

const IGNORE = [
  /Failed to load resource.*favicon/i,
  /favicon\.ico/i,
  /googletagmanager\.com/i,
  /AuthSessionMissingError/i,
]

test.describe('eラーニング公開ページ smoke', () => {
  test('SC-SMK-009c：/e-learning/lp/checkout/complete（session_id なし）は 200 表示 + 「ご購入ありがとうございます」', async ({ page }) => {
    const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
    const res = await page.goto('/e-learning/lp/checkout/complete', { waitUntil: 'networkidle' })

    // checkout/complete は認証要だが、smoke-public 側の挙動を踏襲し、
    // 認証必須なら login redirect、認証不要で表示できるなら 200 + タイトルを確認
    if (page.url().includes('/auth/login')) {
      // 認証必須の場合：returnTo クエリが付くことだけ確認
      const url = new URL(page.url())
      expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/checkout/complete')
    } else {
      expect(res?.status()).toBe(200)
      // session_id なしの unknown fallback 表示
      await expect(page.locator('body')).toContainText(/ご購入ありがとうございます|購入対象を特定できませんでした/)
      expect(errors.pageErrors).toHaveLength(0)
    }
  })
})

test.describe('eラーニング新 LP 配下 redirect / 200 確認', () => {
  // SC-SMK-004c：/e-learning/lp/courses は middleware 設定により認証必須 or 公開
  test('SC-SMK-004c：/e-learning/lp/courses にアクセス → 200 表示 or 認証 redirect', async ({ page }) => {
    await page.goto('/e-learning/lp/courses', { waitUntil: 'networkidle' })
    if (page.url().includes('/auth/login')) {
      const url = new URL(page.url())
      expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/courses')
    } else {
      // 公開ページとして表示できた場合：コース一覧 h1
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })

  test('SC-SMK-004d：/e-learning/lp/videos にアクセス → 200 表示 or 認証 redirect', async ({ page }) => {
    await page.goto('/e-learning/lp/videos', { waitUntil: 'networkidle' })
    if (page.url().includes('/auth/login')) {
      const url = new URL(page.url())
      expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/videos')
    } else {
      await expect(page.locator('h1').first()).toBeVisible()
    }
  })
})
