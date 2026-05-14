'use client'

import * as React from 'react'
import Link from 'next/link'
import { CheckCircle2, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/app/components/atoms/Button'

/**
 * B009 購入完了画面：Webhook 反映ポーリング Client Component。
 *
 * 起点：
 * - docs/frontend/screens.md B009 + 「B009 購入完了画面の Webhook 反映待ち UI 仕様（補足）」
 * - docs/backend/logic/services/access-service.md §購入完了直後の視聴権限確認フロー
 *
 * 設計：
 * - GET /api/me/access を 2 秒間隔・最大 10 回ポーリング
 * - レスポンス内 purchased_course_ids or purchased_content_ids に対象 target_id が含まれていれば「視聴可」表示
 * - 10 回タイムアウト → 「決済反映が遅延しています」エラー
 * - 反映確認後、対象コース／単体動画詳細への遷移リンクを表示
 *
 * 不明 target（metadata 欠落 or 旧形式）の場合は target=null で渡され、ポーリングせず案内表示のみ
 */

const POLL_INTERVAL_MS = 2000
const MAX_POLLS = 10

export type CheckoutTargetKind = 'course' | 'content' | 'unknown'

export interface CheckoutPollingStatusClientProps {
  target:
    | { kind: 'course'; targetId: string; courseDetailHref: string }
    | { kind: 'content'; targetId: string; contentDetailHref: string }
    | { kind: 'unknown' }
}

type PollState =
  | { phase: 'polling'; attempt: number }
  | { phase: 'success' }
  | { phase: 'timeout' }
  | { phase: 'unknown' }

export function CheckoutPollingStatusClient({
  target,
}: CheckoutPollingStatusClientProps) {
  const [state, setState] = React.useState<PollState>(() =>
    target.kind === 'unknown'
      ? { phase: 'unknown' }
      : { phase: 'polling', attempt: 0 },
  )

  React.useEffect(() => {
    if (target.kind === 'unknown') return
    let canceled = false
    let attempt = 0

    const poll = async () => {
      if (canceled) return
      attempt += 1
      try {
        const res = await fetch('/api/me/access', { cache: 'no-store' })
        if (res.ok) {
          const data = (await res.json()) as {
            has_full_access?: boolean
            purchased_course_ids?: string[]
            purchased_content_ids?: string[]
          }
          const ids =
            target.kind === 'course'
              ? data.purchased_course_ids ?? []
              : data.purchased_content_ids ?? []
          const hit = ids.includes(target.targetId) || !!data.has_full_access
          if (hit) {
            if (!canceled) setState({ phase: 'success' })
            return
          }
        }
      } catch (err) {
        console.error('[b009] /api/me/access fetch failed', err)
      }

      if (attempt >= MAX_POLLS) {
        if (!canceled) setState({ phase: 'timeout' })
        return
      }
      if (!canceled) setState({ phase: 'polling', attempt })
      window.setTimeout(poll, POLL_INTERVAL_MS)
    }

    // 初回は即発火
    poll()
    return () => {
      canceled = true
    }
  }, [target])

  if (target.kind === 'unknown' || state.phase === 'unknown') {
    return (
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
        <p className="text-sm text-muted-foreground">
          購入対象を特定できませんでした。マイページの購入履歴をご確認ください。
        </p>
        <Button asChild>
          <Link href="/e-learning/lp/mypage/purchases">マイページ：購入履歴へ</Link>
        </Button>
      </div>
    )
  }

  if (state.phase === 'success') {
    const detailHref =
      target.kind === 'course' ? target.courseDetailHref : target.contentDetailHref
    return (
      <div className="flex flex-col items-center gap-4">
        <CheckCircle2 className="h-12 w-12 text-primary" aria-hidden="true" />
        <p className="text-base text-foreground">決済が反映されました。視聴を開始できます。</p>
        <Button asChild size="lg">
          <Link href={detailHref}>視聴を開始する</Link>
        </Button>
      </div>
    )
  }

  if (state.phase === 'timeout') {
    return (
      <div className="flex flex-col items-center gap-4">
        <AlertCircle className="h-12 w-12 text-destructive" aria-hidden="true" />
        <p className="text-sm text-foreground">
          決済反映が遅延しています。
        </p>
        <p className="text-xs text-muted-foreground">
          時間を置いてマイページの購入履歴をご確認いただくか、サポートまでお問い合わせください。
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <Button asChild variant="outline">
            <Link href="/e-learning/lp/mypage/purchases">マイページへ</Link>
          </Button>
          <Button asChild>
            <Link href="/contact">お問い合わせ</Link>
          </Button>
        </div>
      </div>
    )
  }

  // polling
  return (
    <div
      role="status"
      aria-live="polite"
      className="flex flex-col items-center gap-3"
    >
      <Loader2 className="h-10 w-10 animate-spin text-primary" aria-hidden="true" />
      <p className="text-sm text-foreground">決済反映処理中です（数秒お待ちください）</p>
      <p className="text-xs text-muted-foreground">
        確認中… {state.attempt}/{MAX_POLLS}
      </p>
    </div>
  )
}
