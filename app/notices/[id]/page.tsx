import { notFound } from 'next/navigation'
import { ExternalLink, Calendar, ArrowLeft, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { createClient } from '@/app/lib/supabase/server'
import type { Metadata } from 'next'
import type { Notice } from '@/app/types'

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: notice } = await supabase
    .from('notices')
    .select('*')
    .eq('id', resolvedParams.id)
    .single<Notice>()
  
  if (!notice) {
    return {
      title: 'AI駆動研究所',
      description: 'AI駆動研究所からのお知らせ',
    }
  }
    
  const baseUrl = 'https://www.landbridge.ai'
  const timestamp = Date.now()
  const imageUrl = notice.thumbnail
    ? `${notice.thumbnail}?t=${timestamp}`
    : `${baseUrl}/AI_driven_ogpImageimage.png?t=${timestamp}`
  
  return {
    title: `${notice.title} - AI駆動研究所`,
    description: notice.description || 'AI駆動研究所からのお知らせ',
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/notices/${notice.id}`,
    },
    openGraph: {
      title: notice.title,
      description: notice.description || 'AI駆動研究所からのお知らせ',
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: notice.title,
          type: 'image/png',
        }
      ],
      type: 'article',
      siteName: 'AI駆動研究所',
      url: `${baseUrl}/notices/${notice.id}`,
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: notice.title,
      description: notice.description || 'AI駆動研究所からのお知らせ',
      images: [imageUrl],
      creator: '@ai_driven_lab',
    },
  }
}

export default async function NoticeDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const resolvedParams = await params
  const supabase = await createClient()
  
  const { data: notice, error } = await supabase
    .from('notices')
    .select('*')
    .eq('id', resolvedParams.id)
    .eq('is_published', true)
    .single<Notice>()

  if (error || !notice) {
    notFound()
  }

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  // 関連お知らせを取得
  const { data: relatedNotices } = await supabase
    .from('notices')
    .select('*')
    .eq('category', notice.category)
    .eq('is_published', true)
    .neq('id', notice.id)
    .order('published_date', { ascending: false })
    .limit(3)
    .returns<Notice[]>()

  return (
    <MainLayout>
      <div className="p-4 sm:p-6 pt-2 sm:pt-3">
        <Link
          href="/notices"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          お知らせ一覧に戻る
        </Link>

        <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-gray-900">{notice.title}</h1>

        <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
          {/* Left column - Thumbnail */}
          <div className="lg:w-1/2">
            <div className="relative aspect-video rounded-lg overflow-hidden">
              {notice.thumbnail ? (
                <Image
                  src={notice.thumbnail}
                  alt={notice.title}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                  <Bell className="h-24 w-24 text-gray-400" />
                </div>
              )}
            </div>
            
            {/* Action button below thumbnail */}
            {notice.site_url && (
              <div className="mt-8">
                <a
                  href={notice.site_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium w-full bg-portfolio-blue hover:bg-portfolio-blue-dark text-white"
                >
                  詳細を見る
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            )}
          </div>

          {/* Right column - Notice details */}
          <div className="lg:w-1/2 space-y-4 sm:space-y-6">
            <div className="flex items-center gap-3">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                categoryColors[notice.category]
              }`}>
                {categoryLabels[notice.category]}
              </span>
              <div className="flex items-center gap-1 text-gray-500 text-sm">
                <Calendar className="h-4 w-4" />
                {formatDate(notice.created_at)}
              </div>
            </div>

            {notice.description && (
              <div>
                <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">{notice.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* 関連お知らせ */}
        {relatedNotices && relatedNotices.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連するお知らせ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedNotices.map((relatedNotice) => (
                <Link 
                  key={relatedNotice.id} 
                  href={`/notices/${relatedNotice.id}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    <div className="relative aspect-video">
                      {relatedNotice.thumbnail ? (
                        <Image
                          src={relatedNotice.thumbnail}
                          alt={relatedNotice.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <Bell className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className={`absolute top-4 right-4 ${categoryColors[relatedNotice.category]} text-xs px-3 py-1 rounded`}>
                        {categoryLabels[relatedNotice.category]}
                      </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-portfolio-blue transition-colors">
                        {relatedNotice.title}
                      </h3>
                      
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {relatedNotice.description || ''}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>{formatDate(relatedNotice.created_at)}</span>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </MainLayout>
  )
}