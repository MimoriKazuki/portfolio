import { test, expect } from '@playwright/test'
import { collectConsoleErrors } from '../fixtures/console-helper'

/**
 * Step 4 smoke：認証画面（A001）。
 *
 * 対応 SC：
 * - SC-SMK-001 A001 ログイン画面表示（/auth/login）：Google OAuth ボタン表示
 *
 * 未ログイン前提（クッキー操作なし）。
 */

const IGNORE = [
  /Failed to load resource.*favicon/i,
  /favicon\.ico/i,
  /googletagmanager\.com/i,
  /AuthSessionMissingError/i,
]

test.describe('A001 認証画面 smoke', () => {
  test('SC-SMK-001：/auth/login が 200 表示 + Google OAuth ボタン存在', async ({ page }) => {
    const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
    const res = await page.goto('/auth/login', { waitUntil: 'networkidle' })

    expect(res?.status()).toBe(200)
    // GoogleLoginButton：button または anchor で "Google" 文字列を含む要素
    const googleButton = page.getByRole('button', { name: /google/i })
      .or(page.getByRole('link', { name: /google/i }))
    await expect(googleButton.first()).toBeVisible()
    expect(errors.pageErrors).toHaveLength(0)
  })
})
