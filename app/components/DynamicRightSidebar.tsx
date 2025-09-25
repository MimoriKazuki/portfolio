'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
import { Building2, User, FileText } from 'lucide-react'
import { getSelectedServices } from '@/app/lib/services/service-selector'
import RightSidebarSkeleton from './skeletons/RightSidebarSkeleton'

interface DynamicRightSidebarProps {
  enterpriseServiceId?: string
  individualServiceId?: string
}

const DynamicRightSidebar = ({ enterpriseServiceId, individualServiceId }: DynamicRightSidebarProps) => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

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
      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return <RightSidebarSkeleton />
  }

  if (!enterpriseService || !individualService) {
    console.warn('Services not found for:', { enterpriseServiceId, individualServiceId })
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI人材教育プログラム</h3>
      <div className="space-y-4">
        {/* 企業向けサービス */}
        <Link
          href={enterpriseService.href}
          className="block group"
        >
          <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="relative aspect-video mb-3">
              <Image
                src={enterpriseService.image}
                alt={enterpriseService.title}
                fill
                className="object-cover rounded"
                sizes="(max-width: 260px) 100vw, 220px"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                企業向け
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {enterpriseService.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {enterpriseService.description}
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-blue-600 font-medium group-hover:gap-3 transition-all duration-200">
                詳しく見る
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </div>
          </div>
        </Link>

        {/* 個人向けサービス */}
        <Link
          href={individualService.href}
          className="block group"
        >
          <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-green-600 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="relative aspect-video mb-3">
              <Image
                src={individualService.image}
                alt={individualService.title}
                fill
                className="object-cover rounded"
                sizes="(max-width: 260px) 100vw, 220px"
              />
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                個人向け
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-1">
                {individualService.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {individualService.description}
              </p>
              <div className="inline-flex items-center gap-2 text-xs text-green-600 font-medium group-hover:gap-3 transition-all duration-200">
                詳しく見る
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
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
            <article className="block border-2 border-gray-200 rounded-lg p-3 transition-all duration-200 hover:border-orange-500 hover:shadow-md">
              {document.thumbnail && (
                <div className="relative aspect-video mb-3">
                  <Image
                    src={document.thumbnail}
                    alt={document.title}
                    fill
                    className="object-cover rounded"
                    sizes="(max-width: 260px) 100vw, 220px"
                  />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3 text-orange-600" />
                    <span className="text-xs text-orange-600 font-medium">
                      資料ダウンロード
                    </span>
                  </div>
                </div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-600 transition-colors line-clamp-2 mb-1">
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