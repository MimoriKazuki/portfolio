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
    'comprehensive-ai-training': '/images/services/list/comprehensive-ai-training.jpg',
    'ai-organization-os': '/images/services/list/ai-organization-os.jpg',
    'ai-video-training': '/images/services/list/ai-video-training.jpg',
    'ai-coding-training': '/images/services/list/ai-coding-training.jpg',
    'ai-talent-development': '/images/services/list/ai-talent-development.jpg'
  }
  
  const serviceSlug = meta.url.split('/services/')[1] || 'default'
  const ogImageUrl = serviceImageMapping[serviceSlug] || `${baseUrl}/images/brand/AI_driven_ogpImageimage.png`
  
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
      siteName: 'AI駆動研究所',
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
      creator: '@ai_driven_lab',
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