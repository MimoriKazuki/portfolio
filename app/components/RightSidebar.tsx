'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
import { Building2, User, FileText } from 'lucide-react'
import RightSidebarSkeleton from './skeletons/RightSidebarSkeleton'

// サービス定義（固定）
const corporateService = {
  id: "comprehensive-ai-training",
  title: "生成AI総合研修",
  description: "生成AIの基礎から実践まで、企業の現場で即戦力として活躍できる人材を育成する包括的な研修プログラムです。",
  href: "/services/comprehensive-ai-training",
  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center",
  icon: Building2,
  label: "企業向け"
}

const individualService = {
  id: "individual-coaching",
  title: "AI人材育成所",
  description: "個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。",
  href: "/services/ai-talent-development",
  image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
  icon: User,
  label: "個人向け"
}

const RightSidebar = () => {
  const pathname = usePathname()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

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

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI人材教育プログラム</h3>
      <div className="space-y-4">
        {/* 企業向けサービス */}
        <Link
          href={corporateService.href}
          className="block group"
        >
          <div className="bg-white rounded-lg border-2 border-gray-200 p-3 hover:border-blue-600 hover:shadow-md transition-all duration-200 cursor-pointer">
            <div className="relative aspect-video mb-3">
              <Image
                src={corporateService.image}
                alt={corporateService.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 260px"
                className="object-cover rounded"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium">
                {corporateService.label}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {corporateService.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                {corporateService.description}
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 260px"
                className="object-cover rounded"
              />
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 rounded text-xs font-medium">
                {individualService.label}
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 260px"
                    className="object-cover rounded"
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

export default RightSidebar