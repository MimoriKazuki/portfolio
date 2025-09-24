import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata } from '@/app/lib/services/common'
import { COMPREHENSIVE_AI_TRAINING_METADATA, COMPREHENSIVE_AI_TRAINING_DATA } from '@/app/lib/services/data/comprehensive-ai-training'

export const metadata = generateServiceMetadata(COMPREHENSIVE_AI_TRAINING_METADATA)
export const revalidate = 60

export default async function ComprehensiveAITrainingPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  return (
    <MainLayout hideRightSidebar={true}>
      <ServiceTrainingLP 
        {...COMPREHENSIVE_AI_TRAINING_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}