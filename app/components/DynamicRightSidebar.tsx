'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
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
          <article className="border-2 border-transparent hover:border-gray-200 rounded p-3 transition-colors duration-300">
            <div className="relative aspect-video mb-3 overflow-hidden rounded">
              <Image
                src={enterpriseService.image}
                alt={enterpriseService.title}
                fill
                className="object-cover"
                sizes="(max-width: 260px) 100vw, 220px"
              />
            </div>
            <div>
              <span className="text-xs text-blue-600 font-medium mb-1 block">
                企業向けプログラム
              </span>
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
                {enterpriseService.title}
              </h4>
            </div>
          </article>
        </Link>

        {/* 個人向けサービス */}
        <Link
          href={individualService.href}
          className="block group"
        >
          <article className="border-2 border-transparent hover:border-gray-200 rounded p-3 transition-colors duration-300">
            <div className="relative aspect-video mb-3 overflow-hidden rounded">
              <Image
                src={individualService.image}
                alt={individualService.title}
                fill
                className="object-cover"
                sizes="(max-width: 260px) 100vw, 220px"
              />
            </div>
            <div>
              <span className="text-xs text-green-600 font-medium mb-1 block">
                個人向けプログラム
              </span>
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2">
                {individualService.title}
              </h4>
            </div>
          </article>
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
                <span className="text-xs text-orange-600 font-medium mb-1 block">
                  資料ダウンロード
                </span>
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