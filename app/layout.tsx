import type { Metadata } from 'next'
import { Inter, Caveat, Noto_Sans_JP } from 'next/font/google'
import './globals.css'
import StructuredData from './components/StructuredData'
import GoogleAnalytics from './components/GoogleAnalytics'
import MicrosoftClarity from './components/MicrosoftClarity'
import ScrollToTop from './components/ScrollToTop'

const inter = Inter({ subsets: ['latin'] })
const caveat = Caveat({
  subsets: ['latin'],
  variable: '--font-caveat',
})
const notoSansJP = Noto_Sans_JP({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans-jp',
})

export const viewport = {
  themeColor: '#1d4ed8',
  width: 'device-width',
  initialScale: 1,
}

export const metadata: Metadata = {
  title: 'AI駆動研究所 - 生成AIで未来を創る',
  description: 'AI駆動研究所は、生成AI技術の研究・開発・実装を専門とする研究機関です。ChatGPT、Claude、Geminiなどの最新AI技術を活用したプロダクト開発、AI研修サービス、技術コンサルティングを提供。AI時代の未来を一緒に創造します。',
  keywords: ['AI駆動研究所', '生成AI', 'AI研究', 'ChatGPT', 'Claude', 'Gemini', 'AI開発', 'AI研修', 'プロンプトエンジニアリング', 'AIコンサルティング', '東京'],
  authors: [{ name: 'AI駆動研究所' }],
  creator: 'AI駆動研究所',
  publisher: 'AI駆動研究所',
  icons: {
    icon: [
      { url: '/images/brand/AI_driven_favicon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' },
    ],
    shortcut: [
      { url: '/images/brand/AI_driven_favicon.png' },
    ],
    apple: [
      { url: '/images/brand/AI_driven_favicon.png' },
    ],
    other: [
      {
        rel: 'apple-touch-icon-precomposed',
        url: '/images/brand/AI_driven_favicon.png',
      },
    ],
  },
  manifest: '/manifest.json',
  metadataBase: new URL('https://www.landbridge.ai'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'AI駆動研究所 - 生成AIで未来を創る',
    description: 'AI駆動研究所は、生成AI技術の研究・開発・実装を専門とする研究機関です。最新AI技術を活用したプロダクト開発、AI研修サービス、技術コンサルティングを提供。AI時代の未来を一緒に創造します。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.landbridge.ai',
    siteName: 'AI駆動研究所',
    images: [
      {
        url: 'https://www.landbridge.ai/images/brand/AI_driven_ogpImageimage.png',
        width: 1200,
        height: 630,
        alt: 'AI駆動研究所 - 生成AIで未来を創る',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI駆動研究所 - 生成AIで未来を創る',
    description: 'AI駆動研究所は、生成AI技術の研究・開発・実装を専門とする研究機関です。最新AI技術を活用したプロダクト開発、AI研修サービス、技術コンサルティングを提供。',
    creator: '@ai_driven_lab',
    images: ['https://www.landbridge.ai/images/brand/AI_driven_ogpImageimage.png'],
  },
  other: {
    'msapplication-TileImage': 'https://www.landbridge.ai/images/brand/AI_driven_ogpImageimage.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja" className={`bg-youtube-dark ${caveat.variable} ${notoSansJP.variable}`} style={{ backgroundColor: '#0f0f0f' }}>
      <head>
        <StructuredData />
        <meta name="theme-color" content="#0f0f0f" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black" />
        {/* Adobe Fonts (Acumin Pro) */}
        <link rel="stylesheet" href="https://use.typekit.net/uoy2cka.css" />
      </head>
      <body className="bg-youtube-dark" style={{ backgroundColor: '#0f0f0f', fontFamily: 'var(--font-primary)' }}>
        {/* Safari スクロール位置問題対策: ページ最上部のアンカー要素 */}
        {/* #top アンカーを使用することで、Safariのネイティブスクロール機能を利用 */}
        <div id="top" style={{ position: 'absolute', top: 0, left: 0, height: 0, width: 0 }} />
        {/* Next.js App Router スクロールリセット用アンカー要素 */}
        {/* fixed要素の前に配置することで、正しいスクロール位置計算を保証 */}
        {/* 参照: https://github.com/vercel/next.js/issues/49427 */}
        <div />
        <div className="fixed inset-0 bg-youtube-dark" style={{ backgroundColor: '#0f0f0f', zIndex: -1 }} aria-hidden="true" />
        <ScrollToTop />
        <GoogleAnalytics />
        <MicrosoftClarity />
        {children}
      </body>
    </html>
  )
}