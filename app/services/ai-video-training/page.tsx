import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata, SERVICE_REVALIDATE_TIME } from '@/app/lib/services/common'
import { AI_VIDEO_TRAINING_METADATA, AI_VIDEO_TRAINING_DATA } from '@/app/lib/services/data/ai-video-training'

export const metadata = generateServiceMetadata(AI_VIDEO_TRAINING_METADATA)
export const revalidate = SERVICE_REVALIDATE_TIME

export default async function AIVideoTrainingPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  return (
    <MainLayout hideRightSidebar={true}>
      <ServiceTrainingLP 
        {...AI_VIDEO_TRAINING_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}