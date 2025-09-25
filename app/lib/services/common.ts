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
  
  // サービス詳細ページで使用するOG画像をサービス一覧の画像に設定
  const serviceImageMapping: Record<string, string> = {
    'comprehensive-ai-training': 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=1200&h=630&fit=crop&crop=center',
    'ai-writing-training': 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1200&h=630&fit=crop&crop=center',
    'ai-video-training': 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=1200&h=630&fit=crop&crop=center',
    'ai-coding-training': 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1200&h=630&fit=crop&crop=center',
    'practical-ai-training': 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1200&h=630&fit=crop&crop=center',
    'ai-talent-development': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1200&h=630&fit=crop&crop=center'
  }
  
  const serviceSlug = meta.url.split('/services/')[1] || 'default'
  const ogImageUrl = serviceImageMapping[serviceSlug] || `${baseUrl}/LandBridge%20Media.png`
  
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