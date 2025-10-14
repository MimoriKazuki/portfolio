import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'お問い合わせ - AI駆動研究所',
  description: '生成AIコーチング・研修のご相談は無料。企業のDX推進、AIスキル向上のご相談に24時間以内に返信いたします。',
}

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}