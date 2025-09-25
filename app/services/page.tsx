import MainLayout from '../components/MainLayout'
import ServicesContent from '../components/ServicesContent'
import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'

const baseUrl = 'https://www.landbridge.ai'
const ogImageUrl = `${baseUrl}/LandBridge%20Media.png`

export const metadata: Metadata = {
  title: 'サービス - LandBridge株式会社',
  description: 'LandBridge株式会社のAI研修・教育サービス一覧。企業向けAIコーチングから個人向けAI人材育成まで、幅広いプログラムを提供しています。',
  keywords: ['LandBridge', 'サービス', 'AI研修', 'AIコーチング', 'AI人材育成', '企業研修', '個人向け研修'],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'サービス - LandBridge株式会社',
    description: 'LandBridge株式会社のAI研修・教育サービス一覧。企業向けAIコーチングから個人向けAI人材育成まで、幅広いプログラムを提供しています。',
    type: 'website',
    locale: 'ja_JP',
    url: `${baseUrl}/services`,
    siteName: 'LandBridge Media',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'LandBridge Media - AI研修・教育サービス',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サービス - LandBridge株式会社',
    description: 'LandBridge株式会社のAI研修・教育サービス一覧。企業向けAIコーチングから個人向けAI人材育成まで、幅広いプログラムを提供しています。',
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

export const revalidate = 60 // ISR: 60秒ごとに再生成

export default async function ServicesPage() {
  return (
    <MainLayout hideRightSidebar={true}>
      <ServicesContent />
    </MainLayout>
  )
}