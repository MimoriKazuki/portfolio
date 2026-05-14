import { FlatCompat } from '@eslint/eslintrc'
import { fileURLToPath } from 'node:url'
import { dirname } from 'node:path'

/**
 * P3-AUX-01：ESLint flat config 復活
 *
 * Phase 2 時点で `npm run lint` が echo のみとなっていたのを Next.js 15 標準の lint 体系に戻す。
 *
 * 方針：
 * - Next.js 15 / ESLint 9 の flat config + FlatCompat で既存 next/core-web-vitals + next/typescript を借用
 * - 既存稼働コードへの影響を最小化するため、初動はビルドブロッカー（next/core-web-vitals）のみ採用
 * - eslint-config-next が依存に既に存在（^15.5.3）
 * - ignores：Next.js ビルド成果物 / Playwright レポート / .next / node_modules / 古い未使用ファイル等
 *
 * 将来：
 * - `npm run lint -- --max-warnings 0` などで warning 0 を強制する CI ルールは Phase 4 候補
 * - tsconfig strict 化（P3-AUX-02）と合わせて段階強化していく
 */
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const compat = new FlatCompat({
  baseDirectory: __dirname,
})

const config = [
  {
    ignores: [
      '.next/**',
      'node_modules/**',
      'playwright-report/**',
      'test-results/**',
      'e2e/.auth/**',
      'public/**',
      // Phase 2 で _old サフィックスにより廃止扱いになったファイル
      'app/admin/GoogleAnalyticsDashboard_old.tsx',
    ],
  },
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // P3-AUX-01 段階的アプローチ：既存稼働コードに広く存在するルール違反を warn に降格し、
    // CI ブロッカーには既存運用への影響範囲が小さい本質的ルールのみを残す。
    // Phase 4 で any 排除 / 未使用変数整理 / hook 依存修正を本格化させる際に
    // 段階的に error 化していく方針。
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'warn',
      'react-hooks/exhaustive-deps': 'warn',
      'jsx-a11y/role-supports-aria-props': 'warn',
    },
  },
]

export default config
