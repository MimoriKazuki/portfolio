import { createClient } from '@/app/lib/supabase/server'
import { createStaticClient } from '@/app/lib/supabase/static'
import { Column } from '@/app/types'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Calendar, ChevronLeft } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'
import TableOfContents from '@/app/components/TableOfContents'

export const revalidate = 60

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const supabase = createStaticClient()
  const { data: columns } = await supabase
    .from('columns')
    .select('slug')
    .eq('is_published', true)

  return columns?.map((column) => ({
    slug: column.slug,
  })) || []
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

  // 見出しを抽出して目次を生成
  const headings = extractHeadings(column.content)
  const hasMultipleHeadings = headings.length >= 2

  // 関連コラムを取得（現在の記事を除く最新3件）
  const { data: relatedColumns } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
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

        {/* 目次 */}
        {hasMultipleHeadings && <TableOfContents headings={headings} />}

        <div 
          className="prose max-w-none
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
            prose-li:marker:text-gray-400"
          dangerouslySetInnerHTML={{ 
            __html: convertMarkdownToHtmlWithIds(column.content)
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

// 見出しを抽出
function extractHeadings(markdown: string): { level: number; text: string }[] {
  const headingRegex = /^(#{1,6})\s+(.+)$/gm
  const headings: { level: number; text: string }[] = []
  let match

  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length
    const text = match[2].replace(/\[.*?\]\s*/, '') // [H1見出し] などのラベルを除去
    headings.push({ level, text })
  }

  return headings
}

// IDを付与したHTML変換
function convertMarkdownToHtmlWithIds(markdown: string): string {
  let headingIndex = 0
  
  // まず見出しを順番に処理してIDを付与
  const lines = markdown.split('\n')
  const processedLines = lines.map(line => {
    // h1からh6までの見出しパターンをチェック
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/)
    if (headingMatch) {
      const level = headingMatch[1].length
      const text = headingMatch[2]
      const id = `heading-${headingIndex++}`
      return `<h${level} id="${id}">${text}</h${level}>`
    }
    return line
  })
  
  // 残りのMarkdown変換を処理
  let html = processedLines.join('\n')
  
  // Code blocks - より正確なパターンマッチング
  html = html.replace(/```(\w+)?\n([\s\S]*?)```/gm, (match, lang, code) => {
    // HTMLエスケープ
    const escapedCode = code
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;')
    return `<pre><code class="language-${lang || 'plaintext'}">${escapedCode}</code></pre>`
  })
  
  // Bold
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  
  // Inline code
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>')
  
  // Links
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2">$1</a>')
  
  // Blockquotes
  html = html.replace(/^> (.+)$/gim, '<blockquote>$1</blockquote>')
  
  // Lists
  html = html.replace(/^\- (.+)$/gim, '<li>$1</li>')
  html = html.replace(/^\d+\. (.+)$/gim, '<li>$1</li>')
  
  // Paragraphs - 改行の処理
  const paragraphs = html.split('\n\n')
  html = paragraphs.map(paragraph => {
    const trimmed = paragraph.trim()
    // すでにHTMLタグの場合はそのまま
    if (trimmed.startsWith('<h') || 
        trimmed.startsWith('<pre') || 
        trimmed.startsWith('<ul') || 
        trimmed.startsWith('<ol') ||
        trimmed.startsWith('<blockquote') ||
        trimmed.startsWith('<li')) {
      return trimmed
    }
    // 空行はスキップ
    if (!trimmed) return ''
    // それ以外は段落タグで囲む
    return `<p>${trimmed}</p>`
  }).filter(p => p).join('\n\n')
  
  // 連続するリストアイテムをulタグで囲む
  html = html.replace(/(<li>.*?<\/li>\s*)+/g, (match) => {
    return `<ul>${match}</ul>`
  })
  
  return html
}