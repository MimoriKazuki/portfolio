'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Trash2 } from 'lucide-react'

interface DeleteColumnButtonProps {
  columnId: string
  columnTitle: string
}

export default function DeleteColumnButton({ columnId, columnTitle }: DeleteColumnButtonProps) {
  const router = useRouter()
  const supabase = createClient()
  const [showConfirm, setShowConfirm] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleDelete = async () => {
    setLoading(true)
    
    try {
      const { error } = await supabase
        .from('columns')
        .delete()
        .eq('id', columnId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error('Error deleting column:', error)
      alert('削除中にエラーが発生しました')
    } finally {
      setLoading(false)
      setShowConfirm(false)
    }
  }

  if (showConfirm) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg p-6 max-w-md w-full">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">コラムの削除</h3>
          <p className="text-gray-600 mb-6">
            「{columnTitle}」を削除しますか？この操作は取り消せません。
          </p>
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setShowConfirm(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
              disabled={loading}
            >
              キャンセル
            </button>
            <button
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              disabled={loading}
            >
              {loading ? '削除中...' : '削除する'}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <button
      onClick={() => setShowConfirm(true)}
      className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
      title="削除"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  )
}