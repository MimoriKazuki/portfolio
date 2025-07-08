import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ・無料相談 | LandBridge株式会社',
  description: 'Web制作・システム開発のご相談は無料。企画段階からお気軽にご相談ください。24時間以内に返信、お見積りは2-3営業日で対応いたします。',
  keywords: ['お問い合わせ', '無料相談', '見積もり無料', 'Web制作相談', 'システム開発相談', 'LandBridge', '東京'],
  openGraph: {
    title: 'お問い合わせ・無料相談 | LandBridge株式会社',
    description: 'Web制作・システム開発のご相談は無料。まずはお気軽にお問い合わせください。',
    type: 'website',
    url: 'https://portfolio-site-blond-eta.vercel.app/contact',
  },
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}