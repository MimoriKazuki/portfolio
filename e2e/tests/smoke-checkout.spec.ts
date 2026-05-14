import { test, expect } from '@playwright/test'

/**
 * P3-TEST-01 smoke：購入導線。
 *
 * - B010 購入キャンセル画面（認証必須・middleware ガード対象）：
 *   未ログインなら /auth/login?returnTo=... へ redirect することを確認
 *
 * 注1：B009 購入完了画面は session_id 必須＋ Stripe Session 取得を伴うため smoke ではカバーしない（UAT 側で扱う）
 * 注2：B010 自体の表示確認（h1「購入をキャンセルしました」等）は Phase 4 UAT で認証付きシナリオとして実施。
 *      本 smoke は middleware ガードが正しく機能していることを未ログイン redirect で担保する。
 */

test('B010 購入キャンセル画面（認証必須）→ 未ログインは /auth/login へ redirect', async ({ page }) => {
  await page.goto('/e-learning/lp/checkout/cancel', { waitUntil: 'networkidle' })
  await expect(page).toHaveURL(/\/auth\/login(\?|$)/)
  const url = new URL(page.url())
  const returnTo = url.searchParams.get('returnTo')
  expect(returnTo).toContain('/e-learning/lp/checkout/cancel')
})
