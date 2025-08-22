import { createClient } from '@/app/lib/supabase/server'
import { createStaticClient } from '@/app/lib/supabase/static'
import { Column } from '@/app/types'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ChevronLeft } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'
import TableOfContents from '@/app/components/TableOfContents'
import type { Metadata } from 'next'

// ISRを使用してパフォーマンスを向上
export const revalidate = 60 // 60秒ごとに再生成
export const dynamicParams = true // 動的パラメータを許可
export const fetchCache = 'force-no-store' // キャッシュを無効化

interface PageProps {
  params: Promise<{ slug: string }>
}

// 静的パラメータを生成
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: columns, error } = await supabase
      .from('columns')
      .select('slug')
      .eq('is_published', true)

    if (error) {
      console.error('Error in generateStaticParams:', error)
      return []
    }
    
    return columns?.map((column) => ({
      slug: column.slug,
    })) || []
  } catch (err) {
    console.error('Error generating static params:', err)
    return []
  }
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ slug: string }> 
}): Promise<Metadata> {
  const { slug } = await params
  const supabase = createStaticClient()
  
  const { data: column, error } = await supabase
    .from('columns')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()
  
  if (error || !column) {
    return {
      title: 'LandBridge Media',
      description: 'LandBridge株式会社の開発実績をご紹介。',
    }
  }

  const baseUrl = 'https://www.landbridge.ai'
  
  // サムネイル画像のURLを完全なURLに変換（Teamsキャッシュ対策でタイムスタンプ追加）
  const timestamp = Date.now()
  let imageUrl: string
  if (column.thumbnail) {
    if (column.thumbnail.startsWith('http')) {
      imageUrl = `${column.thumbnail}?t=${timestamp}`
    } else if (column.thumbnail.startsWith('/')) {
      imageUrl = `${baseUrl}${column.thumbnail}?t=${timestamp}`
    } else {
      // Supabaseストレージの相対パス
      imageUrl = `${column.thumbnail}?t=${timestamp}`
    }
  } else {
    // サムネイルがない場合は動的OG画像を生成
    imageUrl = `${baseUrl}/columns/${column.slug}/opengraph-image?t=${timestamp}`
  }
  
  const metadata: Metadata = {
    title: `${column.title} - LandBridge Media`,
    description: column.excerpt || column.title,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/columns/${column.slug}`,
    },
    openGraph: {
      title: column.title,
      description: column.excerpt || column.title,
      images: [
        {
          url: imageUrl,
          width: 1200,
          height: 630,
          alt: column.title,
          type: 'image/png',
        }
      ],
      type: 'article',
      siteName: 'LandBridge Media',
      url: `${baseUrl}/columns/${column.slug}`,
      publishedTime: column.published_date,
      locale: 'ja_JP',
    },
    twitter: {
      card: 'summary_large_image',
      title: column.title,
      description: column.excerpt || column.title,
      images: [imageUrl],
      creator: '@landbridge_jp',
    },
    other: {
      'msapplication-TileImage': imageUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
  
  return metadata
}

export default async function ColumnDetailPage({ params }: PageProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: column, error } = await supabase
    .from('columns')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !column) {
    notFound()
  }

  // ビューカウントを増やす（クライアントサイドで行うべきだが、簡易実装）
  await supabase
    .from('columns')
    .update({ view_count: (column.view_count || 0) + 1 })
    .eq('id', column.id)

  // HTMLから見出しを抽出して目次を生成
  const headings = extractHeadingsFromHtml(column.content)
  const hasMultipleHeadings = headings.length >= 2

  // 関連コラムを取得（同じカテゴリの記事、現在の記事を除く最新3件）
  const { data: relatedColumns } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
    .eq('category', column.category)
    .neq('id', column.id)
    .order('published_date', { ascending: false })
    .limit(3)

  return (
    <MainLayout>
      <article className="w-full max-w-4xl mx-auto">
        <Link 
          href="/columns" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          コラム一覧に戻る
        </Link>

        {column.thumbnail && (
          <div className="relative aspect-video mb-8 rounded-lg overflow-hidden">
            <Image
              src={column.thumbnail}
              alt={column.title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
            />
          </div>
        )}

        <header className="mb-8">
          <h1 className="text-[28px] font-bold text-gray-900 mb-4">
            {column.title}
          </h1>

          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Calendar className="w-4 h-4" />
            <time dateTime={column.published_date}>
              {new Date(column.published_date).toLocaleDateString('ja-JP', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </time>
          </div>
        </header>

        {/* 概要文 */}
        {column.excerpt && (
          <div className="bg-gray-50 border-l-4 border-gray-300 py-4 px-6 mb-8 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed text-lg">
              {column.excerpt}
            </p>
          </div>
        )}

        {/* 目次 */}
        {hasMultipleHeadings && <TableOfContents headings={headings} />}

        <div 
          className="prose max-w-none column-content
            prose-headings:text-gray-900 prose-headings:font-bold
            prose-h1:text-[28px] prose-h1:border-b-4 prose-h1:border-portfolio-blue prose-h1:pb-3 prose-h1:mb-6 prose-h1:mt-8
            prose-h2:text-[24px] prose-h2:border-l-4 prose-h2:border-portfolio-blue prose-h2:pl-4 prose-h2:mb-4 prose-h2:mt-6
            prose-h3:text-[20px] prose-h3:mb-3 prose-h3:mt-5
            prose-h4:text-[16px] prose-h4:mb-2 prose-h4:mt-4
            prose-h5:text-[14px] prose-h5:mb-2 prose-h5:mt-3
            prose-h6:text-[12px] prose-h6:mb-2 prose-h6:mt-3
            prose-p:text-[16px] prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
            prose-a:text-portfolio-blue prose-a:no-underline hover:prose-a:underline
            prose-strong:text-gray-900 prose-strong:font-semibold
            prose-code:bg-gray-100 prose-code:text-portfolio-blue prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-code:text-sm
            prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-200 prose-pre:text-[14px]
            prose-blockquote:border-l-4 prose-blockquote:border-gray-300 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
            prose-ul:text-[16px] prose-ul:text-gray-700 prose-ol:text-[16px] prose-ol:text-gray-700
            prose-li:marker:text-gray-400
            prose-img:max-w-full prose-img:h-auto prose-img:rounded-lg prose-img:shadow-md prose-img:my-6 prose-img:mx-auto"
          dangerouslySetInnerHTML={{ 
            __html: addIdsToHeadings(column.content)
          }}
        />

        <footer className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <Link 
              href="/columns" 
              className="text-portfolio-blue hover:underline"
            >
              ← コラム一覧に戻る
            </Link>
          </div>
        </footer>

        {/* 関連コラム */}
        {relatedColumns && relatedColumns.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">関連記事</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedColumns.map((relatedColumn) => (
                <Link 
                  key={relatedColumn.id} 
                  href={`/columns/${relatedColumn.slug}`}
                  className="group"
                >
                  <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                    {relatedColumn.thumbnail && (
                      <div className="relative aspect-video">
                        <Image
                          src={relatedColumn.thumbnail}
                          alt={relatedColumn.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          loading="lazy"
                        />
                      </div>
                    )}
                    
                    <div className="p-5 flex-1 flex flex-col">
                      <h3 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-portfolio-blue transition-colors">
                        {relatedColumn.title}
                      </h3>
                      
                      <div className="flex-1">
                        <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                          {relatedColumn.excerpt || ''}
                        </p>
                      </div>
                      
                      <div className="flex items-center gap-1 text-xs text-gray-500">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {new Date(relatedColumn.published_date).toLocaleDateString('ja-JP')}
                        </span>
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

// HTMLから見出しを抽出
function extractHeadingsFromHtml(html: string): { level: number; text: string }[] {
  const headings: { level: number; text: string }[] = []
  
  // h1-h6タグを正規表現で検索
  const headingRegex = /<h([1-6])(?:\s[^>]*)?>([\s\S]*?)<\/h[1-6]>/gi
  let match
  
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1])
    // HTMLタグを除去してテキストだけを取得
    const text = match[2].replace(/<[^>]*>/g, '').trim()
    if (text) {
      headings.push({ level, text })
    }
  }
  
  return headings
}

// 見出しにIDを追加
function addIdsToHeadings(html: string): string {
  // サーバーサイドでDOMParserが使えないため、正規表現で処理
  let headingIndex = 0
  
  // h1-h6タグを検索してIDを追加
  const processedHtml = html.replace(/<h([1-6])(\s[^>]*)?>([\s\S]*?)<\/h[1-6]>/gi, (match, level, attrs, content) => {
    const id = `heading-${headingIndex++}`
    // 既存の属性がある場合は保持
    if (attrs) {
      // 既にidがある場合はそのまま返す
      if (/id=/.test(attrs)) {
        return match
      }
      return `<h${level}${attrs} id="${id}">${content}</h${level}>`
    }
    return `<h${level} id="${id}">${content}</h${level}>`
  })
  
  return processedHtml
}