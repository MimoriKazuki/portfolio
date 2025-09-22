'use client'

import dynamic from 'next/dynamic'

const ProjectsClient = dynamic(
  () => import('@/app/projects/ProjectsClient'),
  {
    ssr: true
  }
)

export default ProjectsClient