export default function ColumnCardSkeleton() {
  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="relative aspect-video bg-gray-200" />
      <div className="p-5">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-20" />
          </div>
          <div className="flex items-center gap-1">
            <div className="w-4 h-4 bg-gray-200 rounded" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </article>
  )
}