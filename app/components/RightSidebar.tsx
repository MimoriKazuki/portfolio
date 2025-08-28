'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Notice, Document } from '@/app/types'
import { Calendar, Bell, FileText, ExternalLink } from 'lucide-react'

const RightSidebar = () => {
  const pathname = usePathname()
  const [notices, setNotices] = useState<Notice[]>([])
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      const supabase = createClient()
      
      // Fetch notices - 注目優先、最新順
      const { data: noticesData } = await supabase
        .from('notices')
        .select('*')
        .eq('is_published', true)
        .order('is_featured', { ascending: false })
        .order('published_date', { ascending: false })
        .limit(1)
      
      // Fetch documents - 注目優先、最新順、2つまで
      const { data: documentsData } = await supabase
        .from('documents')
        .select('*')
        .eq('is_active', true)
        .order('is_featured', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(2)

      if (noticesData) setNotices(noticesData)
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

  // お知らせページ配下ではお知らせを非表示
  const isNoticesPage = pathname.startsWith('/notices')

  const categoryColors = {
    news: 'bg-blue-100 text-blue-700',
    webinar: 'bg-purple-100 text-purple-700',
    event: 'bg-pink-100 text-pink-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700'
  }

  const categoryLabels = {
    news: 'ニュース',
    webinar: 'ウェビナー',
    event: 'イベント',
    maintenance: 'メンテナンス',
    other: 'その他'
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="space-y-4">
        {/* お知らせ - お知らせページ配下以外で表示 */}
        {!isNoticesPage && notices.map((notice) => (
          notice.site_url ? (
            <a
              key={notice.id}
              href={notice.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block group"
            >
              <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-portfolio-blue">
                {notice.thumbnail && (
                  <div className="relative aspect-video mb-3">
                    <Image
                      src={notice.thumbnail}
                      alt={notice.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      categoryColors[notice.category]
                    }`}>
                      {categoryLabels[notice.category]}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-2 mb-1">
                    {notice.title}
                  </h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {new Date(notice.published_date).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                    <ExternalLink className="w-3 h-3 text-portfolio-blue" />
                  </div>
                </div>
              </article>
            </a>
          ) : (
            <div
              key={notice.id}
              className="block group"
            >
              <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200">
                {notice.thumbnail && (
                  <div className="relative aspect-video mb-3">
                    <Image
                      src={notice.thumbnail}
                      alt={notice.title}
                      fill
                      className="object-cover rounded"
                    />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-xs px-2 py-0.5 rounded ${
                      categoryColors[notice.category]
                    }`}>
                      {categoryLabels[notice.category]}
                    </span>
                  </div>
                  <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                    {notice.title}
                  </h4>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(notice.published_date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </article>
            </div>
          )
        ))}

        {/* 資料 - 常に表示 */}
        {documents.map((document) => (
          <Link
            key={document.id}
            href={`/documents/request/${document.id}`}
            className="block group"
          >
            <article className="block border-2 border-transparent rounded-lg p-3 transition-all duration-200 hover:border-portfolio-blue">
              {document.thumbnail && (
                <div className="relative aspect-video mb-3">
                  <Image
                    src={document.thumbnail}
                    alt={document.title}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div>
                <h4 className="text-sm font-medium text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-2 mb-1">
                  {document.title}
                </h4>
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <FileText className="w-3 h-3" />
                  <span>資料ダウンロード</span>
                </div>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  )
}

export default RightSidebar