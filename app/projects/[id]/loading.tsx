import MainLayout from '@/app/components/MainLayout'

export default function ProjectDetailLoading() {
  return (
    <MainLayout>
      <div className="p-4 sm:p-6 pt-2 sm:pt-3 animate-pulse">
        {/* Back button skeleton */}
        <div className="h-6 bg-gray-200 rounded w-40 mb-6" />

        {/* Thumbnail skeleton - Full width */}
        <div className="relative aspect-video rounded-lg bg-gray-200 mb-4" />

        {/* Project Info */}
        <div className="space-y-4">
          {/* Title skeleton */}
          <div className="h-7 sm:h-8 bg-gray-200 rounded w-3/4" />

          {/* Meta info and action buttons row */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-4 border-b border-gray-200">
            {/* Left side - Meta info skeleton */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="h-6 bg-gray-200 rounded w-20" />
              <div className="h-5 bg-gray-200 rounded w-24" />
              <div className="h-5 bg-gray-200 rounded w-32" />
            </div>

            {/* Right side - Action buttons skeleton */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="h-10 bg-gray-200 rounded-full w-32" />
              <div className="h-10 bg-gray-200 rounded-full w-28" />
            </div>
          </div>

          {/* Description box skeleton */}
          <div className="bg-gray-50 rounded-xl p-4">
            <div className="space-y-4">
              {/* Description skeleton */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded" />
                <div className="h-4 bg-gray-200 rounded w-5/6" />
              </div>

              {/* Technologies skeleton */}
              <div className="pt-4 border-t border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-8 bg-gray-200 rounded w-20" />
                  <div className="h-8 bg-gray-200 rounded w-24" />
                  <div className="h-8 bg-gray-200 rounded w-16" />
                  <div className="h-8 bg-gray-200 rounded w-28" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related projects skeleton */}
        <section className="mt-16">
          <div className="h-8 bg-gray-200 rounded w-32 mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {[...Array(3)].map((_, index) => (
              <article key={index} className="border-2 border-transparent rounded p-4">
                <div className="relative aspect-video bg-gray-200 rounded" />
                <div className="pt-4">
                  <div className="h-5 bg-gray-200 rounded w-3/4 mb-2" />
                  <div className="space-y-2 mb-3">
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
