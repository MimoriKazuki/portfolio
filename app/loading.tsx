import { Spinner } from '@/app/components/atoms/Spinner'

/**
 * ルート共通ローディング（Next.js App Router loading.tsx）
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-03
 *
 * Next.js App Router の規約：
 * - Suspense boundary として機能・Server Component 可
 * - Spinner atom（atoms/Spinner）を画面中央に表示
 *
 * セグメント別 loading.tsx（app/e-learning/loading.tsx 等）が存在する場合は
 * そちらが優先される。既存 `app/projects/loading.tsx` 等のスケルトン挙動は維持。
 */
export default function GlobalLoading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="flex min-h-[60vh] w-full items-center justify-center bg-background"
    >
      <Spinner size="lg" />
    </div>
  )
}
