import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'
import type { ServicePageMetadata } from '@/app/lib/types/service'

/**
 * Fetch projects from Supabase
 */
export async function getProjects() {
  const supabase = createStaticClient()
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching projects:', error)
  }
  
  return projects || []
}

/**
 * Fetch latest published columns from Supabase
 */
export async function getLatestColumns() {
  const supabase = createStaticClient()
  const { data: columns, error } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching columns:', error)
  }
  
  return columns || []
}

/**
 * Generate metadata for service pages
 */
export function generateServiceMetadata(meta: ServicePageMetadata): Metadata {
  const baseUrl = 'https://www.landbridge.ai'
  const timestamp = Date.now()
  
  // サービス専用OG画像のURL生成（タイムスタンプ追加でキャッシュ対策）
  const serviceSlug = meta.url.split('/services/')[1] || 'default'
  const ogImageUrl = `${baseUrl}/services/${serviceSlug}/opengraph-image?t=${timestamp}`
  
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    metadataBase: new URL(baseUrl),
    alternates: {
      canonical: `/services/${serviceSlug}`,
    },
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: 'ja_JP',
      url: meta.url,
      siteName: 'LandBridge Media',
      images: [
        {
          url: ogImageUrl,
          width: 1200,
          height: 630,
          alt: meta.title,
          type: 'image/png',
        }
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
      images: [ogImageUrl],
      creator: '@landbridge_jp',
    },
    other: {
      'msapplication-TileImage': ogImageUrl,
    },
    robots: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

/**
 * ISR revalidation time for service pages
 */
export const SERVICE_REVALIDATE_TIME = 60 as const // 60 seconds