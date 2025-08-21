import { notFound } from 'next/navigation'
import { createStaticClient } from '@/app/lib/supabase/static'
import DocumentRequestClient from './DocumentRequestClient'
import type { Metadata } from 'next'

export const revalidate = 60 // ISR: 60秒ごとに再生成
export const dynamicParams = true // 動的パラメータを許可
export const fetchCache = 'force-no-store' // キャッシュを無効化

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
  const resolvedParams = await params
  const document = await getDocument(resolvedParams.id)
  
  if (!document) {
    return {
      title: 'LandBridge Media',
      description: 'LandBridge株式会社の開発実績をご紹介。',
    }
  }

  const baseUrl = 'https://www.landbridge.ai'
  
  // サムネイル画像のURLを完全なURLに変換（Teamsキャッシュ対策でタイムスタンプ追加）
  const timestamp = Date.now()
  let imageUrl: string
  if (document.thumbnail) {
    if (document.thumbnail.startsWith('http')) {
      imageUrl = `${document.thumbnail}?t=${timestamp}`
    } else if (document.thumbnail.startsWith('/')) {
      imageUrl = `${baseUrl}${document.thumbnail}?t=${timestamp}`
    } else {
      // Supabaseストレージの相対パス
      imageUrl = `${document.thumbnail}?t=${timestamp}`
    }
  } else {
    // サムネイルがない場合は動的OG画像を生成
    imageUrl = `${baseUrl}/documents/request/${document.id}/opengraph-image?t=${timestamp}`
  }
    
  const metadata: Metadata = {
    title: `${document.title} - LandBridge Media`,
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
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
  
  return metadata
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