'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/atoms/Button'
import { ErrorTemplate } from '@/app/components/templates/ErrorTemplate'

/**
 * e-learning セグメント専用エラーバウンダリ
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-03
 * - app/e-learning/layout.tsx 内（MainLayout の中）に表示される
 */
export default function ELearningError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[e-learning/error.tsx] Unhandled error', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <ErrorTemplate
      statusCode={500}
      title="読み込み中にエラーが発生しました"
      description="ページの表示中に問題が発生しました。もう一度お試しいただくか、Eラーニングトップへお戻りください。"
      actions={
        <>
          <Button onClick={() => reset()} variant="primary">
            もう一度試す
          </Button>
          <Button asChild variant="outline">
            <Link href="/e-learning">Eラーニング トップへ</Link>
          </Button>
        </>
      }
    />
  )
}
