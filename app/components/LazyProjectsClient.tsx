'use client'

import dynamic from 'next/dynamic'
import ProjectCardSkeleton from './skeletons/ProjectCardSkeleton'

const ProjectsClient = dynamic(
  () => import('@/app/projects/ProjectsClient'),
  {
    loading: () => (
      <div className="w-full">
        <div className="mb-6 sm:mb-8">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse" />
        </div>

        <div className="mb-6 sm:mb-8">
          <div className="flex flex-wrap gap-2 sm:gap-3">
            {['全て', 'ホームページ', 'ランディングページ', 'Webアプリ', 'モバイルアプリ'].map((_, index) => (
              <div key={index} className="h-10 bg-gray-200 rounded-lg w-24 animate-pulse" />
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {[...Array(6)].map((_, index) => (
            <ProjectCardSkeleton key={index} />
          ))}
        </div>
      </div>
    ),
    ssr: true
  }
)

export default ProjectsClient