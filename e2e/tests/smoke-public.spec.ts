import { test, expect } from '@playwright/test'
import { collectConsoleErrors } from '../fixtures/console-helper'

/**
 * P3-TEST-01 smoke：未ログイン公開ページの基本表示と認証必須 path の returnTo リダイレクト。
 *
 * 対応 SC：
 * - SC-SMK-001 新 LP /e-learning/lp が 200 表示
 * - SC-SMK-002 既存 /e-learning が 200 表示（旧 LP 温存・非破壊確認）
 * - SC-SMK-003 /e-learning/lp/courses が認証必須 → /auth/login?returnTo=...
 * - SC-SMK-004 /e-learning/lp/videos が認証必須 → 同様
 * - SC-SMK-005 returnTo が正しく URL エンコードされている
 *
 * 注：本 smoke では未ログイン前提（テスト用 cookie 設定なし）
 */

const IGNORE = [
  /Failed to load resource.*favicon/i,
  /favicon\.ico/i,
  /googletagmanager\.com/i,
]

test.describe('未ログイン公開ページ', () => {
  test('新 LP /e-learning/lp は 200 表示 + ヒーロー見出し表示', async ({ page }) => {
    const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
    const res = await page.goto('/e-learning/lp', { waitUntil: 'networkidle' })

    expect(res?.status()).toBe(200)
    // dummy-value-props.ts の固定文言で表示確認
    await expect(page.locator('h1')).toContainText('AI を「使える」レベルへ')
    expect(errors.pageErrors).toHaveLength(0)
  })

  test('既存 /e-learning（旧 LP）が 200 表示（非破壊確認）', async ({ page }) => {
    const res = await page.goto('/e-learning', { waitUntil: 'networkidle' })
    // 旧 LP は本番運用中で touch していない → 200 を返す
    expect(res?.status()).toBe(200)
  })
})

test.describe('認証必須ページの returnTo リダイレクト', () => {
  test('/e-learning/lp/courses 未ログイン → /auth/login?returnTo=... へ遷移', async ({ page }) => {
    await page.goto('/e-learning/lp/courses', { waitUntil: 'networkidle' })
    // middleware で /e-learning 配下を認証ガード（Phase 2 完成済）
    await expect(page).toHaveURL(/\/auth\/login(\?|$)/)
    const url = new URL(page.url())
    const returnTo = url.searchParams.get('returnTo')
    expect(returnTo, 'returnTo が付与されている').toBeTruthy()
    expect(returnTo).toContain('/e-learning/lp/courses')
  })

  test('/e-learning/lp/videos 未ログイン → returnTo 付き redirect', async ({ page }) => {
    await page.goto('/e-learning/lp/videos', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/auth\/login(\?|$)/)
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/videos')
  })

  test('/e-learning/lp/mypage 未ログイン → returnTo 付き redirect', async ({ page }) => {
    await page.goto('/e-learning/lp/mypage', { waitUntil: 'networkidle' })
    await expect(page).toHaveURL(/\/auth\/login(\?|$)/)
    const url = new URL(page.url())
    expect(url.searchParams.get('returnTo')).toContain('/e-learning/lp/mypage')
  })
})
