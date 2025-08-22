import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StructuredData from './components/StructuredData'
import GoogleAnalytics from './components/GoogleAnalytics'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'LandBridge Media',
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
  metadataBase: new URL('https://www.landbridge.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'LandBridge Media',
    description: 'LandBridge株式会社の開発実績をご紹介。企業サイト、LP、Webアプリ、モバイルアプリなど幅広い制作実績。最新技術で課題解決をサポートします。無料相談受付中。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.landbridge.ai',
    siteName: 'LandBridge Media',
    images: [
      {
        url: 'https://www.landbridge.ai/LandBridge%20Media.png',
        width: 1200,
        height: 630,
        alt: 'LandBridge Media',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LandBridge Media',
    description: 'LandBridge株式会社の開発実績をご紹介。企業サイト、LP、Webアプリ、モバイルアプリなど幅広い制作実績。最新技術で課題解決をサポートします。無料相談受付中。',
    creator: '@landbridge_jp',
    images: ['https://www.landbridge.ai/LandBridge%20Media.png'],
  },
  other: {
    'msapplication-TileImage': 'https://www.landbridge.ai/LandBridge%20Media.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className="bg-youtube-dark" style={{ backgroundColor: '#0f0f0f' }}>
      <head>
        <StructuredData />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className={`${inter.className} bg-youtube-dark`} style={{ backgroundColor: '#0f0f0f' }}>
        <div className="fixed inset-0 bg-youtube-dark" style={{ backgroundColor: '#0f0f0f', zIndex: -1 }} aria-hidden="true" />
        <GoogleAnalytics />
        {children}
      </body>
    </html>
  )
}