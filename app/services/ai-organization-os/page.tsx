import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata } from '@/app/lib/services/common'
import { AI_ORGANIZATION_OS_METADATA, AI_ORGANIZATION_OS_DATA } from '@/app/lib/services/data/ai-organization-os'

export const metadata = generateServiceMetadata(AI_ORGANIZATION_OS_METADATA)
export const revalidate = 60

export default async function AIOrganizationOSPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)

  return (
    <MainLayout hideRightSidebar={true} hideContactButton={true}>
      <ServiceTrainingLP
        {...AI_ORGANIZATION_OS_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
        serviceSlug="ai-organization-os"
      />
    </MainLayout>
  )
}
