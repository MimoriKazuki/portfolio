'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const ColumnForm = dynamic(
  () => import('../../ColumnForm'),
  { 
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false 
  }
)

interface EditColumnClientProps {
  column: any
  columnId: string
}

export default function EditColumnClient({ column, columnId }: EditColumnClientProps) {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">コラムを編集</h1>
      
      <div className="bg-youtube-gray rounded-lg">
        <ColumnForm initialData={column} columnId={columnId} />
      </div>
    </div>
  )
}