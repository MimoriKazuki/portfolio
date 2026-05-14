'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/atoms/Button'
import { ErrorTemplate } from '@/app/components/templates/ErrorTemplate'

/**
 * ルート共通エラーバウンダリ（Next.js App Router error.tsx）
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-03
 * - docs/frontend/page-templates.md § 10 ErrorTemplate
 *
 * Next.js App Router の規約：
 * - 'use client' 必須
 * - props は `{ error: Error & { digest?: string }; reset: () => void }`
 * - 上位の layout は維持されるため、本コンポーネントは layout 内に描画される
 *
 * セグメント別 error.tsx（app/e-learning/error.tsx・app/admin/error.tsx）が
 * 存在する場合はそちらが優先される。
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // 本番ではエラーログ送信（Sentry 等）に置き換える。
    // 現状は console に出力するのみ。digest はサーバー側のエラー追跡 ID。
    console.error('[error.tsx] Unhandled error', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <ErrorTemplate
      statusCode={500}
      title="エラーが発生しました"
      description="申し訳ございません。一時的な問題が発生しました。もう一度お試しいただくか、しばらく経ってから再度アクセスしてください。"
      actions={
        <>
          <Button onClick={() => reset()} variant="primary">
            もう一度試す
          </Button>
          <Button asChild variant="outline">
            <Link href="/">トップへ戻る</Link>
          </Button>
        </>
      }
    />
  )
}
