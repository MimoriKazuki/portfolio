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
import { createClient } from '@/app/lib/supabase/client'

/**
 * B014 マイページ：退会確認 Dialog（Client Component）。
 *
 * 起点：
 * - docs/frontend/screens.md B014
 * - docs/auth/flow.md §G（退会フロー）
 * - docs/backend/logic/services/auxiliary-services.md §user-service §withdraw（L1 確定）
 *
 * フロー：
 * 1. 「退会する」ボタンで Dialog open
 * 2. 確認 Dialog 内で再度「退会を確定する」をクリック
 * 3. POST /api/me/withdraw （Phase 2 完成済・user-service.withdraw 連携）
 * 4. 成功 → supabase.auth.signOut（Client 側）→ B001 LP（/e-learning/lp）にリダイレクト
 * 5. 失敗 → エラーメッセージ表示・モーダルは閉じない
 *
 * 仕様注記：
 * - 視聴履歴・ブックマークは削除（user-service.withdraw 内で CASCADE）
 * - 購入履歴は税務上保持
 * - email はマスキングしない（L1 確定・再活性化時の履歴引継ぎのため）
 * - has_full_access も維持
 */

export interface WithdrawDialogClientProps {
  /** トリガーボタンのラベル（任意）。 */
  triggerLabel?: string
}

export function WithdrawDialogClient({
  triggerLabel = '退会する',
}: WithdrawDialogClientProps) {
  const [open, setOpen] = React.useState(false)
  const [loading, setLoading] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const handleConfirm = async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch('/api/me/withdraw', { method: 'POST' })
      const data = (await res.json().catch(() => ({}))) as {
        ok?: boolean
        error?: { code?: string }
      }

      if (!res.ok || !data.ok) {
        const code = data.error?.code
        if (code === 'UNAUTHORIZED') {
          setError('セッションが切れています。再度ログインしてからお試しください。')
        } else if (code === 'NOT_FOUND') {
          setError('ユーザー情報が見つかりませんでした。')
        } else {
          setError('退会処理に失敗しました。時間を置いて再度お試しください。')
        }
        return
      }

      // signOut → B001 LP（新 LP）にリダイレクト
      const supabase = createClient()
      try {
        await supabase.auth.signOut()
      } catch (signOutErr) {
        console.error('[b014] signOut failed (ignored)', signOutErr)
      }
      // soft navigate ではなくフルリロードで session を確実に破棄
      window.location.href = '/e-learning/lp'
    } catch (err) {
      console.error('[b014] withdraw error', err)
      setError('退会処理に失敗しました。時間を置いて再度お試しください。')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <Button variant="danger" onClick={() => setOpen(true)}>
        {triggerLabel}
      </Button>

      <Dialog open={open} onOpenChange={loading ? () => {} : setOpen}>
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>退会の確認</DialogTitle>
            <DialogDescription>
              本当に退会しますか？以下の点をご確認ください。
            </DialogDescription>
          </DialogHeader>

          <ul className="ml-0 flex list-inside list-disc flex-col gap-2 py-2 text-sm text-muted-foreground">
            <li>
              ブックマーク・視聴履歴は<span className="text-foreground">削除されます</span>
            </li>
            <li>
              購入履歴は税務上<span className="text-foreground">保持されます</span>
            </li>
            <li>
              同じメールアドレスで再登録された場合、視聴権限は<span className="text-foreground">引き継がれます</span>
            </li>
          </ul>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              キャンセル
            </Button>
            <Button variant="danger" onClick={handleConfirm} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  退会処理中...
                </>
              ) : (
                '退会を確定する'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
