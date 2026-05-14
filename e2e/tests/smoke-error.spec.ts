import { test, expect } from '@playwright/test'
import { collectConsoleErrors } from '../fixtures/console-helper'

/**
 * P3-TEST-01 smoke：エラー検知。
 *
 * - 404 ページが正しく応答する
 * - 重要パスで JS 例外（pageerror）が発生しない
 * - console.error は閾値以下
 *
 * dev サーバー起動失敗時は webServer 設定が timeout（playwright.config.ts）で fail されるため、
 * 本 spec は dev サーバー応答が前提。
 */

const IGNORE = [
  /Failed to load resource.*favicon/i,
  /favicon\.ico/i,
  /googletagmanager\.com/i,
  // Supabase 未ログイン関連の警告は redirect 経路で正常動作のため除外
  /AuthSessionMissingError/i,
]

test('存在しないパスは 404 を返す', async ({ page }) => {
  const res = await page.goto('/this-does-not-exist-2026', { waitUntil: 'domcontentloaded' })
  expect(res?.status()).toBe(404)
})

test('新 LP に JS 例外（pageerror）が出ない', async ({ page }) => {
  const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
  await page.goto('/e-learning/lp', { waitUntil: 'networkidle' })

  expect(
    errors.pageErrors,
    `JS 例外検出：${errors.pageErrors.map(e => e.message).join(' / ')}`,
  ).toHaveLength(0)
  expect(
    errors.errors.length,
    `console.error 過多：先頭 3 件 = ${errors.errors.slice(0, 3).join(' || ')}`,
  ).toBeLessThanOrEqual(5)
})

test('B010 購入キャンセル画面に JS 例外が出ない', async ({ page }) => {
  const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
  await page.goto('/e-learning/lp/checkout/cancel', { waitUntil: 'networkidle' })

  expect(errors.pageErrors).toHaveLength(0)
  expect(errors.errors.length).toBeLessThanOrEqual(5)
})

test('既存 /e-learning（旧 LP）に JS 例外が出ない（非破壊確認）', async ({ page }) => {
  const errors = collectConsoleErrors(page, { ignoreErrors: IGNORE })
  await page.goto('/e-learning', { waitUntil: 'networkidle' })

  expect(
    errors.pageErrors,
    `旧 LP に JS 例外検出（非破壊違反の可能性）：${errors.pageErrors.map(e => e.message).join(' / ')}`,
  ).toHaveLength(0)
})
