'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteYouTubeVideoButtonProps {
  videoId: string
  videoTitle: string
}

export default function DeleteYouTubeVideoButton({ videoId, videoTitle }: DeleteYouTubeVideoButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`本当に「${videoTitle}」を削除しますか？`)) {
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('youtube_videos')
        .delete()
        .eq('id', videoId)

      if (error) {
        alert('Error deleting YouTube video: ' + error.message)
      } else {
        router.refresh()
      }
    } catch (err) {
      alert('An unexpected error occurred')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
      title="削除"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
