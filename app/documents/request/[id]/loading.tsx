import MainLayout from '@/app/components/MainLayout'

export default function DocumentRequestLoading() {
  return (
    <MainLayout hideRightSidebar={true}>
      <div className="max-w-2xl mx-auto animate-pulse">
        <div className="bg-white rounded-lg p-8 shadow-md">
          <div className="mb-6">
            <div className="h-8 bg-gray-200 rounded w-48 mb-4" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-5/6" />
            </div>
          </div>

          <form className="space-y-6">
            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>

            <div>
              <div className="h-4 bg-gray-200 rounded w-24 mb-2" />
              <div className="h-10 bg-gray-200 rounded" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <div className="h-4 bg-gray-200 rounded w-20 mb-2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
              <div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
                <div className="h-10 bg-gray-200 rounded" />
              </div>
            </div>

            <div>
              <div className="h-4 bg-gray-200 rounded w-32 mb-2" />
              <div className="h-32 bg-gray-200 rounded" />
            </div>

            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-gray-200 rounded" />
              <div className="h-4 bg-gray-200 rounded w-64" />
            </div>

            <div className="h-12 bg-gray-200 rounded-lg" />
          </form>
        </div>
      </div>
    </MainLayout>
  )
}