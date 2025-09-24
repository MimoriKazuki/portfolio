import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata } from '@/app/lib/services/common'
import { AI_TALENT_DEVELOPMENT_METADATA, AI_TALENT_DEVELOPMENT_DATA } from '@/app/lib/services/data/ai-talent-development'

export const metadata = generateServiceMetadata(AI_TALENT_DEVELOPMENT_METADATA)
export const revalidate = 60

export default async function AITalentDevelopmentPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  return (
    <MainLayout hideRightSidebar={true}>
      <ServiceTrainingLP 
        {...AI_TALENT_DEVELOPMENT_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}