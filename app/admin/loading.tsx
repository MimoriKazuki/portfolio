import { Spinner } from '@/app/components/atoms/Spinner'

/**
 * admin セグメント専用ローディング
 *
 * 起点：
 * - docs/wbs/phase2.md P2-L-03
 * - app/admin/layout.tsx 内（AdminSidebar / AdminLayout の中）に表示される
 */
export default function AdminLoading() {
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
