'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteNoticeButtonProps {
  noticeId: string
  noticeTitle: string
}

export default function DeleteNoticeButton({ noticeId, noticeTitle }: DeleteNoticeButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!confirm(`「${noticeTitle}」を削除してよろしいですか？`)) {
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('notices')
        .delete()
        .eq('id', noticeId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting notice:', error)
      alert('削除中にエラーが発生しました')
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