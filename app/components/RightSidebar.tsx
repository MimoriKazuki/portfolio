'use client'

import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
import { FileText } from 'lucide-react'
import RightSidebarSkeleton from './skeletons/RightSidebarSkeleton'

// サービス定義（固定）
const corporateService = {
  id: "comprehensive-ai-training",
  title: "生成AI総合研修",
  description: "生成AIの基礎から実践まで、企業の現場で即戦力として活躍できる人材を育成する包括的な研修プログラムです。",
  href: "/services/comprehensive-ai-training",
  image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center",
  label: "企業向け"
}

const individualService = {
  id: "individual-coaching",
  title: "AI人材育成所",
  description: "個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。",
  href: "/services/ai-talent-development",
  image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
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
    <div className="p-4">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI人材教育プログラム</h3>
      <div className="space-y-3">
        {/* 企業向けサービス */}
        <Link
          href={corporateService.href}
          className="block group"
        >
          <div className="border-2 border-transparent hover:border-gray-200 rounded p-3 transition-colors duration-300">
            <div className="relative aspect-video mb-3 overflow-hidden rounded">
              <Image
                src={corporateService.image}
                alt={corporateService.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 260px"
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-blue-600 text-white px-2 py-1 text-xs font-medium">
                {corporateService.label}
              </div>
            </div>
            <div>
              <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2 mb-1">
                {corporateService.title}
              </h4>
              <p className="text-xs text-gray-600 line-clamp-2">
                {corporateService.description}
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
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 260px"
                className="object-cover"
              />
              <div className="absolute top-2 right-2 bg-green-600 text-white px-2 py-1 text-xs font-medium">
                {individualService.label}
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
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 260px"
                    className="object-cover"
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

export default RightSidebar