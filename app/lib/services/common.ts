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
  return {
    title: meta.title,
    description: meta.description,
    keywords: meta.keywords,
    openGraph: {
      title: meta.title,
      description: meta.description,
      type: 'website',
      locale: 'ja_JP',
      url: meta.url,
      siteName: 'LandBridge',
    },
    twitter: {
      card: 'summary_large_image',
      title: meta.title,
      description: meta.description,
    },
  }
}

/**
 * ISR revalidation time for service pages
 */
export const SERVICE_REVALIDATE_TIME = 60 as const // 60 seconds