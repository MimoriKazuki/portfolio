import { Spinner } from '@/app/components/atoms/Spinner'

/**
 * e-learning セグメント専用ローディング
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-03
 * - app/e-learning/layout.tsx の MainLayout 内に表示される
 */
export default function ELearningLoading() {
  return (
    <div
      role="status"
      aria-label="読み込み中"
      className="flex min-h-[40vh] w-full items-center justify-center"
    >
      <Spinner size="lg" />
    </div>
  )
}
