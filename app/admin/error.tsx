'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/atoms/Button'
import { ErrorTemplate } from '@/app/components/templates/ErrorTemplate'

/**
 * admin セグメント専用エラーバウンダリ
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-03
 * - app/admin/layout.tsx 内（AdminSidebar / AdminLayout の中）に表示される
 */
export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[admin/error.tsx] Unhandled error', {
      message: error.message,
      digest: error.digest,
    })
  }, [error])

  return (
    <ErrorTemplate
      statusCode={500}
      title="管理画面でエラーが発生しました"
      description="操作中に問題が発生しました。もう一度お試しいただくか、ダッシュボードへお戻りください。"
      actions={
        <>
          <Button onClick={() => reset()} variant="primary">
            もう一度試す
          </Button>
          <Button asChild variant="outline">
            <Link href="/admin">ダッシュボードへ</Link>
          </Button>
        </>
      }
    />
  )
}
