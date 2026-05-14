'use client'

import * as React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/app/components/atoms/Button'
import { PurchasePromptModalV2 } from '@/app/e-learning/PurchasePromptModalV2'

/**
 * B004 コース詳細：購入 CTA + PurchasePromptModalV2 自動 open Client wrapper。
 *
 * 起点：design-mate 補足メモ（2026-05-14・B004 ヒーロー購入 CTA の `?purchase=1` 検出 → モーダル自動 open）
 *
 * 動作：
 * 1. 「購入する」ボタンクリック → URL に `?purchase=1` を追加してモーダル open
 * 2. ?purchase=1 が URL にある状態でページ初回マウント時もモーダル自動 open（共有 URL からの遷移にも対応）
 * 3. モーダル close 時 → ?purchase クエリを除去（URL クリーン保持）
 *
 * 設計判断：
 * - URL query を使うことで「購入導線が始まった」状態を共有可能（戻る/進む対応）
 * - PurchasePromptModalV2 は Dialog ベースで既存 atoms/Button + molecules/Dialog 活用
 *
 * 既存非破壊：B004 page.tsx は本 Client wrapper を import するのみ・モーダル本体は touch しない
 */

export interface CoursePurchaseCtaClientProps {
  courseId: string
  courseSlug: string
  courseTitle: string
  price: number | null
}

export function CoursePurchaseCtaClient({
  courseId,
  courseSlug,
  courseTitle,
  price,
}: CoursePurchaseCtaClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const wantsPurchase = searchParams.get('purchase') === '1'
  const [open, setOpen] = React.useState(wantsPurchase)

  // URL の ?purchase=1 と open state を同期（初回マウント時 + 戻る/進む時の追随）
  React.useEffect(() => {
    setOpen(wantsPurchase)
  }, [wantsPurchase])

  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      setOpen(next)
      if (!next && wantsPurchase) {
        // モーダル close 時に ?purchase クエリを除去（URL クリーン保持）
        const params = new URLSearchParams(searchParams.toString())
        params.delete('purchase')
        const qs = params.toString()
        const path = `/e-learning/lp/courses/${courseSlug}`
        router.replace(qs ? `${path}?${qs}` : path, { scroll: false })
      }
    },
    [courseSlug, router, searchParams, wantsPurchase],
  )

  const handlePurchaseClick = React.useCallback(() => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('purchase', '1')
    router.push(`/e-learning/lp/courses/${courseSlug}?${params.toString()}`, {
      scroll: false,
    })
  }, [courseSlug, router, searchParams])

  return (
    <>
      <div className="flex items-center gap-3">
        {price !== null && (
          <span className="text-xl text-foreground">¥{price.toLocaleString()}</span>
        )}
        <Button size="lg" onClick={handlePurchaseClick}>
          購入する
        </Button>
      </div>
      <PurchasePromptModalV2
        open={open}
        onOpenChange={handleOpenChange}
        targetType="course"
        targetId={courseId}
        title={courseTitle}
        price={price}
        cancelReturnUrl={`/e-learning/lp/courses/${courseSlug}`}
      />
    </>
  )
}
