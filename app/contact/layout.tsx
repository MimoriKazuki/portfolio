import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ - LandBridge Media',
  description: 'Web制作・システム開発のご相談は無料。企画段階からお気軽にご相談ください。24時間以内に返信、お見積りは2-3営業日で対応いたします。',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}