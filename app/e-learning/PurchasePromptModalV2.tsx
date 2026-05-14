'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/molecules/Dialog'
import { Button } from '@/app/components/atoms/Button'

/**
 * PurchasePromptModalV2（B008・コース対応の新規モーダル）
 *
 * 起点：
 * - docs/frontend/screens.md B008
 * - docs/api/endpoints.md POST /api/checkout
 *
 * 設計方針：
 * - 既存 PurchasePromptModal は完全非破壊（旧 /api/stripe/checkout 経由・旧 LP 用）
 * - 本コンポーネントは新導線（B004 / B007・新 LP 経由）から呼ばれる
 * - 新エンドポイント POST /api/checkout（checkout-service 経由）を叩いて Stripe Checkout URL に遷移
 * - targetType = 'course' | 'content' を受け取り、対象タイトル・価格を表示
 *
 * デザイン：
 * - 既存 atoms/Button + molecules/Dialog を活用（独自モーダル組まない・ng-patterns §12 line 104 補足遵守）
 */

export interface PurchasePromptModalV2Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  targetType: 'course' | 'content'
  targetId: string
  title: string
  price: number | null
  /** Stripe Checkout キャンセル時の戻り先（サイト内パスのみ・/ 始まり）。 */
  cancelReturnUrl?: string
}

export function PurchasePromptModalV2({
  open,
  onOpenChange,
  targetType,
  targetId,
  title,
  price,
  cancelReturnUrl,
}: PurchasePromptModalV2Props) {
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handlePurchase = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          target_type: targetType,
          target_id: targetId,
          cancel_return_url: cancelReturnUrl,
        }),
      })

      const data = (await res.json()) as { checkout_url?: string; error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? '購入処理中にエラーが発生しました')
      }
      if (!data.checkout_url) {
        throw new Error('決済 URL が取得できませんでした')
      }
      window.location.href = data.checkout_url
    } catch (err) {
      console.error('[B008] purchase error:', err)
      setError(err instanceof Error ? err.message : '購入処理中にエラーが発生しました')
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>
            {targetType === 'course' ? 'このコースを購入' : 'この動画を購入'}
          </DialogTitle>
          <DialogDescription>{title}</DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-3 py-2">
          {price !== null && (
            <p className="text-foreground">
              <span className="text-2xl">¥{price.toLocaleString()}</span>
              <span className="ml-2 text-sm text-muted-foreground">（税込・買い切り）</span>
            </p>
          )}
          <ul className="ml-0 list-inside list-disc text-sm text-muted-foreground">
            <li>購入後は永続的に視聴できます</li>
            <li>追加料金なし（サブスクリプションではありません）</li>
            <li>{targetType === 'course' ? 'コース内動画と資料をすべて利用可能' : 'この単体動画と資料を利用可能'}</li>
          </ul>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            キャンセル
          </Button>
          <Button onClick={handlePurchase} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                処理中...
              </>
            ) : (
              '購入する'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
