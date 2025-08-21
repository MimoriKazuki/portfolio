import MainLayout from '@/app/components/MainLayout'

export default function ProjectDetailLoading() {
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 pt-2 sm:pt-3 animate-pulse">
        {/* Back button skeleton */}
        <div className="h-6 bg-gray-200 rounded w-40 mb-6" />

        {/* Title skeleton */}
        <div className="h-8 sm:h-10 bg-gray-200 rounded w-3/4 mb-4 sm:mb-6" />

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left column - Thumbnail skeleton */}
          <div className="lg:w-1/2">
            <div className="relative aspect-video rounded-lg bg-gray-200" />
            
            {/* Action buttons skeleton */}
            <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
              <div className="h-10 bg-gray-200 rounded-full w-32" />
              <div className="h-10 bg-gray-200 rounded-lg w-36" />
            </div>
          </div>

          {/* Right column - Project details skeleton */}
          <div className="lg:w-1/2 space-y-4 sm:space-y-6">
            {/* Project overview skeleton */}
            <div>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2" />
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>
            </div>

            {/* Duration and client skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-20" />
                </div>
              </div>
              <div>
                <div className="h-5 bg-gray-200 rounded w-28 mb-2" />
                <div className="h-4 bg-gray-200 rounded w-32" />
              </div>
            </div>

            {/* Technologies skeleton */}
            <div>
              <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
              <div className="flex flex-wrap gap-2">
                <div className="h-8 bg-gray-200 rounded w-20" />
                <div className="h-8 bg-gray-200 rounded w-24" />
                <div className="h-8 bg-gray-200 rounded w-16" />
                <div className="h-8 bg-gray-200 rounded w-28" />
              </div>
            </div>
          </div>
        </div>

        {/* Related projects skeleton */}
        <section className="mt-16">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, index) => (
              <article key={index} className="bg-white rounded-lg overflow-hidden shadow-md">
                <div className="relative aspect-video bg-gray-200" />
                <div className="p-5">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded" />
                    <div className="h-4 bg-gray-200 rounded w-5/6" />
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-3 h-3 bg-gray-200 rounded" />
                    <div className="h-3 bg-gray-200 rounded w-16" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </MainLayout>
  )
}