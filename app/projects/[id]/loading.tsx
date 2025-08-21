export default function ProjectDetailLoading() {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-6xl max-h-[90vh] flex flex-col animate-pulse">
        <div className="p-6 border-b border-gray-200">
          <div className="h-8 bg-gray-200 rounded w-3/4" />
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="relative aspect-video bg-gray-200 rounded-lg" />
              
              <div className="space-y-4">
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-32" />
                </div>
                <div>
                  <div className="h-5 bg-gray-200 rounded w-24 mb-2" />
                  <div className="h-4 bg-gray-200 rounded w-40" />
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                </div>
              </div>

              <div>
                <div className="h-6 bg-gray-200 rounded w-24 mb-4" />
                <div className="flex flex-wrap gap-2">
                  <div className="h-6 bg-gray-200 rounded-full w-16" />
                  <div className="h-6 bg-gray-200 rounded-full w-20" />
                  <div className="h-6 bg-gray-200 rounded-full w-14" />
                </div>
              </div>

              <div className="h-12 bg-gray-200 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}