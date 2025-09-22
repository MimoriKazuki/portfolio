import MainLayout from '../components/MainLayout'
import ServicesContent from '../components/ServicesContent'
import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'サービス一覧 - LandBridge株式会社',
  description: 'LandBridge株式会社のAI研修・教育サービス一覧。企業向けAIコーチングから個人向けAI人材育成まで、幅広いプログラムを提供しています。',
  keywords: ['LandBridge', 'サービス', 'AI研修', 'AIコーチング', 'AI人材育成', '企業研修', '個人向け研修'],
  openGraph: {
    title: 'サービス一覧 - LandBridge株式会社',
    description: 'LandBridge株式会社のAI研修・教育サービス一覧。企業向けAIコーチングから個人向けAI人材育成まで、幅広いプログラムを提供しています。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.landbridge.ai/services',
    siteName: 'LandBridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'サービス一覧 - LandBridge株式会社',
    description: 'LandBridge株式会社のAI研修・教育サービス一覧。企業向けAIコーチングから個人向けAI人材育成まで、幅広いプログラムを提供しています。',
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