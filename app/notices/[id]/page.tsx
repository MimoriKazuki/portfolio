import { notFound } from 'next/navigation'
import { ExternalLink, Calendar, ArrowLeft, Bell } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { createClient } from '@/app/lib/supabase/server'
import { LinkifiedText } from '@/app/lib/utils/linkify'
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
    : `${baseUrl}/images/brand/AI_driven_ogpImageimage.png?t=${timestamp}`
  
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
    news: 'bg-white border border-blue-200 text-blue-700',
    webinar: 'bg-white border border-purple-200 text-purple-700',
    event: 'bg-white border border-pink-200 text-pink-700',
    maintenance: 'bg-white border border-yellow-200 text-yellow-700',
    other: 'bg-white border border-gray-200 text-gray-700'
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
      <article className="w-full max-w-4xl mx-auto">
        <Link
          href="/notices"
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          お知らせ一覧に戻る
        </Link>

        {/* サムネイル画像 */}
        <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
          {notice.thumbnail ? (
            <Image
              src={notice.thumbnail}
              alt={notice.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
              <Bell className="h-24 w-24 text-gray-400" />
            </div>
          )}
        </div>

        {/* ヘッダー */}
        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900 mb-4">
            {notice.title}
          </h1>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <time dateTime={notice.created_at}>
                {new Date(notice.created_at).toLocaleDateString('ja-JP', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </time>
            </div>
            <span className={`${categoryColors[notice.category]} text-xs px-3 py-1 font-medium`}>
              {categoryLabels[notice.category]}
            </span>
          </div>
        </header>

        {/* 説明文 */}
        {notice.description && (
          <div className="mb-8">
            <p className="text-[16px] text-gray-700 leading-relaxed whitespace-pre-wrap">
              <LinkifiedText text={notice.description} />
            </p>
          </div>
        )}

        {/* 外部リンクボタン */}
        {notice.site_url && (
          <div className="mb-8">
            <a
              href={notice.site_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg transition-all font-medium bg-portfolio-blue hover:bg-portfolio-blue-dark text-white"
            >
              詳細を見る
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        )}

        {/* フッター */}
        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link
              href="/notices"
              className="text-portfolio-blue hover:underline"
            >
              ← お知らせ一覧に戻る
            </Link>
          </div>
        </footer>

        {/* 関連お知らせ */}
        {relatedNotices && relatedNotices.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連するお知らせ</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {relatedNotices.map((relatedNotice) => (
                <Link
                  key={relatedNotice.id}
                  href={`/notices/${relatedNotice.id}`}
                  className="group"
                >
                  <article className="border-2 border-transparent hover:border-gray-200 rounded p-4 transition-colors duration-300 h-full flex flex-col">
                    <div className="relative aspect-video overflow-hidden rounded">
                      {relatedNotice.thumbnail ? (
                        <Image
                          src={relatedNotice.thumbnail}
                          alt={relatedNotice.title}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, 33vw"
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                          <Bell className="h-12 w-12 text-gray-400" />
                        </div>
                      )}
                      <div className={`absolute top-2 right-2 ${categoryColors[relatedNotice.category]} text-xs px-3 py-1 font-medium`}>
                        {categoryLabels[relatedNotice.category]}
                      </div>
                    </div>

                    <div className="pt-4 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                        {relatedNotice.title}
                      </h3>

                      <div className="flex-1">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-3">
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
      </article>
    </MainLayout>
  )
}