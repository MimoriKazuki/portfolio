import { notFound } from 'next/navigation'
import { createStaticClient } from '@/app/lib/supabase/static'
import DocumentRequestClient from './DocumentRequestClient'
import type { Metadata } from 'next'

export const revalidate = 60 // ISR: 60秒ごとに再生成
export const dynamicParams = true // 動的パラメータを許可

// 静的パラメータを生成
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: documents } = await supabase
      .from('documents')
      .select('id')
      .eq('is_active', true)
    
    return documents?.map((doc) => ({
      id: doc.id,
    })) || []
  } catch (error) {
    console.error('Error in generateStaticParams:', error)
    return []
  }
}

// ドキュメントデータを取得
async function getDocument(id: string) {
  const supabase = createStaticClient()
  const { data: document } = await supabase
    .from('documents')
    .select('*')
    .eq('id', id)
    .eq('is_active', true)
    .single()
  
  return document
}

// メタデータを生成
export async function generateMetadata({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}): Promise<Metadata> {
  try {
    const resolvedParams = await params
    const document = await getDocument(resolvedParams.id)
    
    if (!document) {
      return {
        title: '資料が見つかりません - LandBridge Media',
        description: '指定された資料は存在しません。',
      }
    }

    const baseUrl = 'https://www.landbridge.ai'
  
    // サムネイル画像のURLを完全なURLに変換
    let imageUrl: string
    if (document.thumbnail) {
      if (document.thumbnail.startsWith('http')) {
        imageUrl = document.thumbnail
      } else if (document.thumbnail.startsWith('/')) {
        imageUrl = `${baseUrl}${document.thumbnail}`
      } else {
        // Supabaseストレージの相対パス
        imageUrl = document.thumbnail
      }
    } else {
      // サムネイルがない場合はデフォルトOG画像
      imageUrl = `${baseUrl}/opengraph-image.png?v=5`
    }
    
    return {
      title: document.title,
      description: document.description || document.title,
      metadataBase: new URL(baseUrl),
      alternates: {
        canonical: `/documents/request/${document.id}`,
      },
      openGraph: {
        title: document.title,
        description: document.description || document.title,
        images: [
          {
            url: imageUrl,
            width: 1200,
            height: 630,
            alt: document.title,
            type: 'image/png',
          }
        ],
        type: 'article',
        siteName: 'LandBridge Media',
        url: `${baseUrl}/documents/request/${document.id}`,
        locale: 'ja_JP',
      },
      twitter: {
        card: 'summary_large_image',
        title: document.title,
        description: document.description || document.title,
        images: [imageUrl],
        creator: '@landbridge_jp',
      },
      other: {
        'msapplication-TileImage': imageUrl,
      },
    }
  } catch (error) {
    console.error('Error generating document metadata:', error)
    return {
      title: 'LandBridge Media',
      description: 'LandBridge株式会社の開発実績をご紹介。',
    }
  }
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function DocumentRequestPage({ params }: PageProps) {
  const resolvedParams = await params
  const document = await getDocument(resolvedParams.id)

  if (!document) {
    notFound()
  }

  return <DocumentRequestClient documentId={resolvedParams.id} initialDocument={document} />
}