import { notFound } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/server'
import YouTubeVideoForm from '../../YouTubeVideoForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditYouTubeVideoPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: video, error } = await supabase
    .from('youtube_videos')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !video) {
    notFound()
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">YouTubeを編集</h1>
      <YouTubeVideoForm initialData={video} videoId={id} />
    </div>
  )
}
