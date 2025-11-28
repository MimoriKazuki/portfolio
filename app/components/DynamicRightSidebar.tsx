'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
import { FileText } from 'lucide-react'
import { getSelectedServices } from '@/app/lib/services/service-selector'

interface DynamicRightSidebarProps {
  enterpriseServiceId?: string
  individualServiceId?: string
}

const DynamicRightSidebar = ({ enterpriseServiceId, individualServiceId }: DynamicRightSidebarProps) => {
  const [documents, setDocuments] = useState<Document[]>([])

  // Get selected services based on props
  const { enterprise: enterpriseService, individual: individualService } = getSelectedServices(
    enterpriseServiceId,
    individualServiceId
  )

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()

      // Fetch documents - 注目優先、最新順、1つまで
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(1)

      if (documentsData) setDocuments(documentsData)
    }

    fetchData()
  }, [])

  if (!enterpriseService || !individualService) {
    console.warn('Services not found for:', { enterpriseServiceId, individualServiceId })
    return null
  }

  return (
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI人材教育プログラム</h3>
      <div className="space-y-3">
        {/* 企業向けサービス */}
        <Link
          href={enterpriseService.href}
          className="block group"
        >
          <div className="border-2 border-transparent hover:border-gray-200 rounded p-3 transition-colors duration-300">
            <div className="relative aspect-video mb-3 overflow-hidden rounded">
              <Image
                src={enterpriseService.image}
                alt={enterpriseService.title}
                fill
                className="object-cover"
                sizes="(max-width: 260px) 100vw, 220px"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs font-medium">
                企業向け
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {enterpriseService.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {enterpriseService.description}
              </p>
            </div>
          </div>
        </Link>

        {/* 個人向けサービス */}
        <Link
          href={individualService.href}
          className="block group"
        >
          <div className="border-2 border-transparent hover:border-gray-200 rounded p-3 transition-colors duration-300">
            <div className="relative aspect-video mb-3 overflow-hidden rounded">
              <Image
                src={individualService.image}
                alt={individualService.title}
                fill
                className="object-cover"
                sizes="(max-width: 260px) 100vw, 220px"
              />
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-medium">
                個人向け
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-1">
                {individualService.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {individualService.description}
              </p>
            </div>
          </div>
        </Link>

        {/* 資料 - 1つ表示 */}
        {documents.map((document) => (
          <Link
            key={document.id}
            href={`/documents/request/${document.id}`}
            className="block group"
          >
            <article className="border-2 border-transparent hover:border-gray-200 rounded p-3 transition-colors duration-300">
              {document.thumbnail && (
                <div className="relative aspect-video mb-3 overflow-hidden rounded">
                  <Image
                    src={document.thumbnail}
                    alt={document.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 260px) 100vw, 220px"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-1 mb-1">
                  <FileText className="w-3 h-3 text-orange-600" />
                  <span className="text-xs text-orange-600 font-medium">
                    資料ダウンロード
                  </span>
                </div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                  {document.title}
                </h4>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default DynamicRightSidebar