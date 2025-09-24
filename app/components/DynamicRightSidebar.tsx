'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
import { Building2, User, FileText } from 'lucide-react'
import { getSelectedServices } from '@/app/lib/services/service-selector'

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
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-lg shadow-sm p-6 animate-pulse">
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!enterpriseService || !individualService) {
    console.warn('Services not found for:', { enterpriseServiceId, individualServiceId })
    return null
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-4">
        {/* 企業向けサービス */}
        <Link
          href={enterpriseService.href}
          className="block group"
        >
          <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-portfolio-blue">
            <div className="relative aspect-video mb-3">
              <Image
                src={enterpriseService.image}
                alt={enterpriseService.title}
                fill
                className="object-cover rounded"
                sizes="(max-width: 260px) 100vw, 220px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <Building2 className="w-3 h-3 text-portfolio-blue" />
                  <span className="text-xs text-portfolio-blue font-medium">
                    企業向けサービス
                  </span>
                </div>
              </div>
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-2 mb-1">
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
          <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-green-500">
            <div className="relative aspect-video mb-3">
              <Image
                src={individualService.image}
                alt={individualService.title}
                fill
                className="object-cover rounded"
                sizes="(max-width: 260px) 100vw, 220px"
              />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="flex items-center gap-1">
                  <User className="w-3 h-3 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    個人向けサービス
                  </span>
                </div>
              </div>
              <h4 className="text-sm font-medium text-gray-900 group-hover:text-green-600 transition-colors line-clamp-2 mb-1">
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
            <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-orange-500">
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