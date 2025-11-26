interface ProjectGridSkeletonProps {
  count?: number
  columns?: 'home' | 'projects'
}

export default function ProjectGridSkeleton({ count = 3, columns = 'home' }: ProjectGridSkeletonProps) {
  const gridClass = columns === 'home' 
    ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3'
    : 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3'

  return (
    <div className={gridClass}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden bg-youtube-gray">
          {/* Thumbnail skeleton with shimmer - darker for media */}
          <div className="aspect-video skeleton-image"></div>
          
          {/* Content skeleton with distinct hierarchy */}
          <div className="p-3 space-y-2">
            {/* Title - brighter for primary content */}
            <div className="h-4 rounded skeleton-title"></div>
            {/* Subtitle - slightly dimmer for secondary content */}
            <div className="h-3 rounded w-4/5 skeleton-text"></div>
            {columns === 'projects' && (
              <div className="flex gap-1 mt-2">
                {/* Tags - darkest for metadata */}
                <div className="h-5 w-12 rounded skeleton-tag"></div>
                <div className="h-5 w-16 rounded skeleton-tag"></div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}