export default function ProjectCardSkeleton() {
  return (
    <div className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="relative aspect-video bg-gray-200" />
      <div className="p-4 sm:p-6">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          <div className="h-6 bg-gray-200 rounded-full w-16" />
          <div className="h-6 bg-gray-200 rounded-full w-20" />
          <div className="h-6 bg-gray-200 rounded-full w-14" />
        </div>
        <div className="h-10 bg-gray-200 rounded-lg" />
      </div>
    </div>
  )
}