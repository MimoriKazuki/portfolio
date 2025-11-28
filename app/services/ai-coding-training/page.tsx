import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata } from '@/app/lib/services/common'
import { AI_CODING_TRAINING_METADATA, AI_CODING_TRAINING_DATA } from '@/app/lib/services/data/ai-coding-training'

export const metadata = generateServiceMetadata(AI_CODING_TRAINING_METADATA)
export const revalidate = 60

export default async function AICodingTrainingPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  return (
    <MainLayout hideRightSidebar={true} hideContactButton={true}>
      <ServiceTrainingLP 
        {...AI_CODING_TRAINING_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}