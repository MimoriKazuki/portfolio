import { defineConfig, devices } from '@playwright/test'

/**
 * P3-TEST-01：Playwright E2E 設定。
 *
 * 起点：
 * - docs/e2e-scenarios/E2E_SCENARIO_INDEX.md
 * - team-lead 指示 2026-05-14
 *
 * 設計：
 * - baseURL：ローカル開発は 3001 ポート（Kosuke 環境）
 * - testDir：e2e/tests/
 * - webServer：`npm run dev` を自動起動・既存のサーバーが立っていれば再利用（reuseExistingServer）
 * - retries：CI は 2 回・ローカルは 0
 * - reporter：HTML（playwright-report に出力）
 * - 失敗時にスクリーンショット + リトライ時にトレース取得
 */

const PORT = Number(process.env.PORT ?? 3001)
const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? `http://localhost:${PORT}`
const isCI = !!process.env.CI

export default defineConfig({
  testDir: './e2e/tests',
  timeout: 30_000,
  expect: { timeout: 5_000 },
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: `npm run dev -- --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !isCI,
    timeout: 120_000,
    stdout: 'pipe',
    stderr: 'pipe',
  },
})
