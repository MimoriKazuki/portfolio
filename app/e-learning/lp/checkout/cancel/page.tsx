import Link from 'next/link'
import { XCircle } from 'lucide-react'
import { Button } from '@/app/components/atoms/Button'
import { InfoPageTemplate } from '@/app/components/templates/InfoPageTemplate'

/**
 * B010 購入キャンセル画面（/e-learning/lp/checkout/cancel）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B010
 * - docs/frontend/page-templates.md §InfoPageTemplate
 * - docs/backend/logic/services/checkout-service.md §cancel_url
 *
 * 設計：
 * - checkout-service.ts は cancel_url = ${BASE_URL}${resolveCancelPath(cancelReturnUrl)}?canceled=true を生成
 * - 本ページはその汎用フォールバック（コース/単体動画の詳細ページに戻すケースは元 cancel_url で処理されるため、
 *   ここに到達するのは cancel_return_url 未指定 or 不正値（/e-learning フォールバック）の場合）
 * - InfoPageTemplate を使った最小実装（情報表示のみ）
 *
 * 個人別情報は含めない（誰でも見られる安全な静的表示）
 */

export const dynamic = 'force-dynamic'

export default function ELearningLPCheckoutCancelPage() {
  return (
    <InfoPageTemplate
      icon={
        <XCircle className="h-12 w-12 text-muted-foreground" aria-hidden="true" />
      }
      title="購入をキャンセルしました"
      description={
        <p>
          決済処理を中止しました。コースや動画はそのままご覧いただけます。
          <br />
          再度購入される場合は、コース／単体動画詳細から購入ボタンをクリックしてください。
        </p>
      }
      primaryCta={
        <Button asChild>
          <Link href="/e-learning/lp/courses">コース一覧へ</Link>
        </Button>
      }
      secondaryCta={
        <Button asChild variant="outline">
          <Link href="/e-learning/lp/videos">単体動画一覧へ</Link>
        </Button>
      }
    />
  )
}
