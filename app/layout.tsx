import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import StructuredData from './components/StructuredData'
import GoogleAnalytics from './components/GoogleAnalytics'
import MicrosoftClarity from './components/MicrosoftClarity'

const inter = Inter({ subsets: ['latin'] })

export const viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'LandBridge AI coaching',
  description: 'LandBridge AI coachingは、生成AIを活用したビジネス変革を支援する専門コーチングサービス。ChatGPT、Claude等の最新AI技術を使った実践的研修・コンサルティングで企業のDX推進をサポート。無料相談受付中。',
  keywords: ['LandBridge', 'ランドブリッジ', 'AI研修', '生成AI', 'ChatGPT研修', 'AI人材育成', 'AIライティング', 'AIコーディング', 'DX推進', '企業研修', '東京'],
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
    title: 'LandBridge AI coaching',
    description: 'LandBridge AI coachingは、生成AIを活用したビジネス変革を支援する専門コーチングサービス。ChatGPT、Claude等の最新AI技術を使った実践的研修・コンサルティングで企業のDX推進をサポート。無料相談受付中。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.landbridge.ai',
    siteName: 'LandBridge AI coaching',
    images: [
      {
        url: 'https://www.landbridge.ai/LandBridge%20AI%20coaching.JPG',
        width: 1200,
        height: 630,
        alt: 'LandBridge AI coaching',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LandBridge AI coaching',
    description: 'LandBridge AI coachingは、生成AIを活用したビジネス変革を支援する専門コーチングサービス。ChatGPT、Claude等の最新AI技術を使った実践的研修・コンサルティングで企業のDX推進をサポート。無料相談受付中。',
    creator: '@landbridge_jp',
    images: ['https://www.landbridge.ai/LandBridge%20AI%20coaching.JPG'],
  },
  other: {
    'msapplication-TileImage': 'https://www.landbridge.ai/LandBridge%20AI%20coaching.JPG',
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
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
      </head>
      <body className={`${inter.className} bg-youtube-dark`} style={{ backgroundColor: '#0f0f0f' }}>
        <div className="fixed inset-0 bg-youtube-dark" style={{ backgroundColor: '#0f0f0f', zIndex: -1 }} aria-hidden="true" />
        <GoogleAnalytics />
        <MicrosoftClarity />
        {children}
      </body>
    </html>
  )
}