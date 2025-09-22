import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata, SERVICE_REVALIDATE_TIME } from '@/app/lib/services/common'
import { PRACTICAL_AI_TRAINING_METADATA, PRACTICAL_AI_TRAINING_DATA } from '@/app/lib/services/data/practical-ai-training'

export const metadata = generateServiceMetadata(PRACTICAL_AI_TRAINING_METADATA)
export const revalidate = SERVICE_REVALIDATE_TIME

export default async function PracticalAITrainingPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  return (
    <MainLayout hideRightSidebar={true}>
      <ServiceTrainingLP 
        {...PRACTICAL_AI_TRAINING_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}