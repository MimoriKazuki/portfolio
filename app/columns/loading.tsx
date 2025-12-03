import MainLayout from '@/app/components/MainLayout'
import ColumnCardSkeleton from '@/app/components/skeletons/ColumnCardSkeleton'

export default function ColumnsLoading() {
  return (
    <MainLayout>
      <div className="w-full">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-32 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <ColumnCardSkeleton key={index} />
          ))}
        </div>
      </div>
    </MainLayout>
  )
}