import MainLayout from '@/app/components/MainLayout'
import ProjectCardSkeleton from '@/app/components/skeletons/ProjectCardSkeleton'
import ColumnCardSkeleton from '@/app/components/skeletons/ColumnCardSkeleton'

export default function HomeLoading() {
  return (
    <MainLayout>
      <div className="space-y-8 sm:space-y-12 animate-pulse">
        {/* Hero Section Skeleton */}
        <section className="bg-white rounded-lg p-4 sm:p-6 shadow-md">
          <div className="h-10 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="space-y-2 mb-6">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
          <div className="h-12 bg-gray-200 rounded-lg w-48" />
        </section>

        {/* Featured Projects Skeleton */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="h-8 bg-gray-200 rounded w-48" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, index) => (
              <ProjectCardSkeleton key={index} />
            ))}
          </div>
        </section>

        {/* Recent Columns Skeleton */}
        <section>
          <div className="flex justify-between items-center mb-4 sm:mb-6">
            <div className="h-8 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {[...Array(3)].map((_, index) => (
              <ColumnCardSkeleton key={index} />
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}