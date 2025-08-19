import MainLayout from './components/MainLayout'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <MainLayout>
      <div className="w-full">
        <div className="text-center py-20">
          <div className="mb-8">
            <h1 className="text-6xl font-bold text-gray-300 mb-4">404</h1>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">ページが見つかりません</h2>
            <p className="text-gray-600">
              お探しのページは存在しないか、移動された可能性があります。
            </p>
          </div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            トップページに戻る
          </Link>
        </div>
      </div>
    </MainLayout>
  )
}