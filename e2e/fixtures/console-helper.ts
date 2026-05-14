import type { Page, ConsoleMessage } from '@playwright/test'

/**
 * P3-TEST-01：コンソールエラー / JS 例外検知ヘルパ。
 *
 * 設計：
 * - page.on('console') で console.error / warning を収集
 * - page.on('pageerror') で uncaught JS 例外を収集
 * - 既知の無視対象（favicon 404 等）は ignoreErrors の正規表現で除外可能
 *
 * 利用側でテスト終了時に errors.errors.length / errors.pageErrors.length を assert する
 */

export interface CollectConsoleErrorsOptions {
  /** 無視するエラーメッセージ正規表現の配列（match した console.error は集計しない）。 */
  ignoreErrors?: RegExp[]
  /** 'warning' も集計するか（既定 false）。 */
  includeWarnings?: boolean
}

export interface CollectedErrors {
  errors: string[]
  warnings: string[]
  pageErrors: Error[]
}

export function collectConsoleErrors(
  page: Page,
  { ignoreErrors = [], includeWarnings = false }: CollectConsoleErrorsOptions = {},
): CollectedErrors {
  const result: CollectedErrors = { errors: [], warnings: [], pageErrors: [] }

  const isIgnored = (text: string): boolean =>
    ignoreErrors.some(pattern => pattern.test(text))

  const onConsole = (msg: ConsoleMessage) => {
    const type = msg.type()
    const text = msg.text()
    if (type === 'error') {
      if (!isIgnored(text)) result.errors.push(text)
    } else if (includeWarnings && type === 'warning') {
      if (!isIgnored(text)) result.warnings.push(text)
    }
  }

  const onPageError = (err: Error) => {
    if (!isIgnored(err.message)) result.pageErrors.push(err)
  }

  page.on('console', onConsole)
  page.on('pageerror', onPageError)

  return result
}
