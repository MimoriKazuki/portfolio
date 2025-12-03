export default function DocumentCardSkeleton() {
  return (
    <article className="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
      <div className="relative aspect-video bg-gray-200" />
      <div className="p-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mb-2" />
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-gray-200 rounded" />
          <div className="h-4 bg-gray-200 rounded w-5/6" />
          <div className="h-4 bg-gray-200 rounded w-4/6" />
        </div>
        <div className="h-12 bg-gray-200 rounded-lg" />
      </div>
    </article>
  )
}