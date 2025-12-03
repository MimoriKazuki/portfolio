'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteELearningButtonProps {
  contentId: string
  contentTitle: string
}

export default function DeleteELearningButton({ contentId, contentTitle }: DeleteELearningButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`本当に「${contentTitle}」を削除しますか？\n関連する資料も全て削除されます。`)) {
      return
    }

    setIsDeleting(true)

    try {
      // 関連する資料を先に削除（CASCADE設定があるが念のため）
      await supabase
        .from('e_learning_materials')
        .delete()
        .eq('content_id', contentId)

      // コンテンツを削除
      const { error } = await supabase
        .from('e_learning_contents')
        .delete()
        .eq('id', contentId)

      if (error) {
        alert('削除エラー: ' + error.message)
      } else {
        router.refresh()
      }
    } catch (err) {
      alert('予期しないエラーが発生しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600 disabled:opacity-50"
      title="削除"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}
