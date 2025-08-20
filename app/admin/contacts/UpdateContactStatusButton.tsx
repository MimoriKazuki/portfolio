'use client'

import { useState } from 'react'
import { CheckCircle, Clock } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'

interface UpdateContactStatusButtonProps {
  contactId: string
  currentStatus: 'new' | 'in_progress' | 'completed'
}

export default function UpdateContactStatusButton({ contactId, currentStatus }: UpdateContactStatusButtonProps) {
  const [isUpdating, setIsUpdating] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleStatusUpdate = async () => {
    setIsUpdating(true)
    
    const nextStatus = currentStatus === 'new' ? 'in_progress' : 'completed'
    
    const { error } = await supabase
      .from('contacts')
      .update({ 
        status: nextStatus,
        updated_at: new Date().toISOString()
      })
      .eq('id', contactId)
    
    if (error) {
      console.error('Error updating contact status:', error)
      alert('ステータスの更新に失敗しました')
    } else {
      router.refresh()
    }
    
    setIsUpdating(false)
  }

  const getButtonProps = () => {
    if (currentStatus === 'new') {
      return {
        icon: Clock,
        title: '対応中にする',
        className: 'p-2 hover:bg-yellow-50 rounded-lg transition-colors text-yellow-600'
      }
    } else {
      return {
        icon: CheckCircle,
        title: '完了にする',
        className: 'p-2 hover:bg-green-50 rounded-lg transition-colors text-green-600'
      }
    }
  }

  const { icon: Icon, title, className } = getButtonProps()

  return (
    <button
      onClick={handleStatusUpdate}
      className={className}
      title={title}
      disabled={isUpdating}
    >
      <Icon className="h-4 w-4" />
    </button>
  )
}