import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { getProjects, getLatestColumns, generateServiceMetadata } from '@/app/lib/services/common'
import { CLAUDE_TRAINING_METADATA, CLAUDE_TRAINING_DATA } from '@/app/lib/services/data/claude-training'

export const metadata = generateServiceMetadata(CLAUDE_TRAINING_METADATA)
export const revalidate = 60

export default async function ClaudeTrainingPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)

  return (
    <MainLayout hideRightSidebar={true} hideContactButton={true}>
      <ServiceTrainingLP
        {...CLAUDE_TRAINING_DATA}
        latestColumns={columns}
        featuredProjects={featuredProjects}
        serviceSlug="claude-training"
      />
    </MainLayout>
  )
}
