'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteDocumentButtonProps {
  documentId: string
  documentTitle: string
}

export default function DeleteDocumentButton({ documentId, documentTitle }: DeleteDocumentButtonProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleDelete = async () => {
    if (!confirm(`「${documentTitle}」を削除してもよろしいですか？`)) {
      return
    }

    setIsDeleting(true)

    try {
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', documentId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting document:', error)
      alert('ドキュメントの削除に失敗しました')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <button
      onClick={handleDelete}
      disabled={isDeleting}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 disabled:opacity-50"
      title="削除"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}