import MainLayout from '@/app/components/MainLayout'

export default function ColumnDetailLoading() {
  return (
    <MainLayout>
      <article className="w-full max-w-4xl mx-auto animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6" />

        <div className="relative aspect-video mb-8 rounded-lg bg-gray-200" />

        <header className="mb-8">
          <div className="h-8 bg-gray-200 rounded w-3/4 mb-4" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-24" />
          </div>
        </header>

        <div className="bg-gray-50 border-l-4 border-gray-300 py-4 px-6 mb-8 rounded-r-lg">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded" />
            <div className="h-4 bg-gray-200 rounded w-5/6" />
          </div>
        </div>

        <div className="space-y-4 mb-12">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="space-y-2">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-3" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          ))}
        </div>

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="h-4 bg-gray-200 rounded w-32" />
        </footer>
      </article>
    </MainLayout>
  )
}