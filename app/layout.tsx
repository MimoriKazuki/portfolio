import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StructuredData from './components/StructuredData'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'LandBridge株式会社 | Web制作・アプリ開発の実績紹介',
  description: 'LandBridge株式会社の開発実績をご紹介。企業サイト、LP、Webアプリ、モバイルアプリなど幅広い制作実績。最新技術で課題解決をサポートします。無料相談受付中。',
  keywords: ['LandBridge', 'ランドブリッジ', 'Web制作', 'アプリ開発', 'ホームページ制作', 'システム開発', 'ポートフォリオ', '開発実績', '東京'],
  authors: [{ name: 'LandBridge株式会社' }],
  creator: 'LandBridge株式会社',
  publisher: 'LandBridge株式会社',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: [
      { url: '/favicon.png' },
    ],
    apple: [
      { url: '/favicon.png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/favicon.png',
      },
    ],
  },
  manifest: '/manifest.json',
  themeColor: '#1d4ed8',
  metadataBase: new URL('https://portfolio-site-blond-eta.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LandBridge株式会社 | Web制作・アプリ開発の実績紹介',
    description: '最新技術を活用したWeb制作・アプリ開発ならLandBridge。豊富な開発実績と確かな技術力で、お客様のビジネスを成功に導きます。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://portfolio-site-blond-eta.vercel.app',
    siteName: 'LandBridge Portfolio',
    images: [
      {
        url: 'https://portfolio-site-blond-eta.vercel.app/opengraph-image?v=4',
        width: 1200,
        height: 630,
        alt: 'LandBridge Portfolio',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LandBridge株式会社 | Web制作・アプリ開発',
    description: '最新技術を活用したWeb制作・アプリ開発。企業サイト、LP、システム開発まで幅広く対応。無料相談受付中。',
    creator: '@landbridge_jp',
    images: ['https://portfolio-site-blond-eta.vercel.app/opengraph-image?v=4'],
  },
  other: {
    'msapplication-TileImage': 'https://portfolio-site-blond-eta.vercel.app/opengraph-image?v=4',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="bg-youtube-dark overflow-x-hidden" style={{ backgroundColor: '#0f0f0f' }}>
      <head>
        <StructuredData />
        <meta name="theme-color" content="#0f0f0f" />
      </head>
      <body className={`${inter.className} bg-youtube-dark overflow-x-hidden`} style={{ backgroundColor: '#0f0f0f' }}>
        {children}
      </body>
    </html>
  )
}