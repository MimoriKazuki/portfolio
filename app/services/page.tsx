import MainLayout from '../components/MainLayout'
import ServicesContent from '../components/ServicesContent'
import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'
import { Suspense } from 'react'

const baseUrl = 'https://www.landbridge.ai'
const ogImageUrl = `${baseUrl}/AI_driven_ogpImageimage.png`

export const metadata: Metadata = {
  title: 'サービス - AI駆動研究所',
  description: 'AI駆動研究所のAI研修・開発サービス一覧。生成AI技術の研修プログラム、プロダクト開発支援、技術コンサルティングなど、企業と個人のAI活用を総合的にサポートします。',
  keywords: ['AI駆動研究所', 'サービス', 'AI研修', '生成AI開発', 'AIコンサルティング', 'プロンプトエンジニアリング', '企業研修', '個人向け研修'],
  metadataBase: new URL(baseUrl),
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'サービス - AI駆動研究所',
    description: 'AI駆動研究所のAI研修・開発サービス一覧。生成AI技術の研修プログラム、プロダクト開発支援、技術コンサルティングなど、企業と個人のAI活用を総合的にサポートします。',
    type: 'website',
    locale: 'ja_JP',
    url: `${baseUrl}/services`,
    siteName: 'AI駆動研究所',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'AI駆動研究所 - 生成AI研修・開発サービス',
        type: 'image/png',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サービス - AI駆動研究所',
    description: 'AI駆動研究所のAI研修・開発サービス一覧。生成AI技術の研修プログラム、プロダクト開発支援、技術コンサルティングを提供。',
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

export const revalidate = 60 // ISR: 60秒ごとに再生成

export default async function ServicesPage() {
  return (
    <MainLayout hideRightSidebar={true}>
      <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
        <ServicesContent />
      </Suspense>
    </MainLayout>
  )
}