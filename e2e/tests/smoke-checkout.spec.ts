import { test, expect } from '@playwright/test'
import { collectConsoleErrors } from '../fixtures/console-helper'

/**
 * P3-TEST-01 smoke：購入導線。
 *
 * - B010 購入キャンセル画面が 200 OK で表示
 *
 * 注：B009 購入完了画面は session_id 必須＋ Stripe Session 取得を伴うため smoke ではカバーしない（UAT 側で扱う）
 */

const IGNORE = [
  /Failed to load resource.*favicon/i,
  /favicon\.ico/i,
  /googletagmanager\.com/i,
]

test('B010 購入キャンセル画面が 200 で表示される', async ({ page }) => {
  const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
  const res = await page.goto('/e-learning/lp/checkout/cancel', { waitUntil: 'networkidle' })

  expect(res?.status()).toBe(200)
  await expect(page.locator('h1')).toContainText('購入をキャンセルしました')
  expect(errors.pageErrors).toHaveLength(0)
})
