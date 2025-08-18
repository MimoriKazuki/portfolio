import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, ExternalLink } from 'lucide-react'

const Footer = () => {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="bg-gray-900 text-gray-300" role="contentinfo">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col lg:flex-row">
          {/* Company Info */}
          <div className="lg:flex-1">
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="LandBridge株式会社 - AIコーディングによるシステム開発"
                width={140}
                height={40}
              />
            </div>
            <h2 className="sr-only">LandBridge株式会社について</h2>
            <p className="text-sm mb-4">
              AIによる自動コーディング「バイブコーディング」を活用し、<br />
              高品質なWebサイト・アプリケーションを迅速に開発します。
            </p>
            <Link 
              href="https://www.landbridge.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm hover:text-white transition-colors"
              aria-label="LandBridge株式会社 企業サイトへ"
            >
              企業サイトはこちら
              <ExternalLink className="w-3 h-3" />
            </Link>
            
            {/* Add spacing on large screens */}
            <div className="hidden lg:block h-12"></div>
          </div>

          {/* Main Navigation */}
          <div className="mt-8 lg:mt-0 lg:flex-shrink-0 lg:ml-24">
            <h3 className="text-white text-lg font-semibold mb-4">メインメニュー</h3>
            <nav aria-label="フッターメインナビゲーション">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/" className="hover:text-white transition-colors">
                    トップページ
                  </Link>
                </li>
                <li>
                  <Link href="/projects" className="hover:text-white transition-colors">
                    ポートフォリオ - 開発実績一覧
                  </Link>
                </li>
                <li>
                  <Link href="/columns" className="hover:text-white transition-colors">
                    技術コラム - AI開発の最新情報
                  </Link>
                </li>
                <li>
                  <Link href="/documents" className="hover:text-white transition-colors">
                    資料ダウンロード - サービス詳細資料
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-white transition-colors">
                    お問い合わせ - 無料相談受付中
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Service Categories */}
          <div className="mt-8 lg:mt-0 lg:flex-shrink-0 lg:ml-12">
            <h3 className="text-white text-lg font-semibold mb-4">開発サービス</h3>
            <nav aria-label="サービスカテゴリー">
              <ul className="space-y-2 text-sm">
                <li>
                  <Link 
                    href="/projects?category=homepage" 
                    className="hover:text-white transition-colors"
                    title="企業ホームページ・コーポレートサイト制作"
                  >
                    ホームページ制作
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects?category=landing-page" 
                    className="hover:text-white transition-colors"
                    title="LP・ランディングページ制作"
                  >
                    ランディングページ制作
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects?category=web-app" 
                    className="hover:text-white transition-colors"
                    title="Webアプリケーション・SaaS開発"
                  >
                    Webアプリ開発
                  </Link>
                </li>
                <li>
                  <Link 
                    href="/projects?category=mobile-app" 
                    className="hover:text-white transition-colors"
                    title="iOS・Androidアプリ開発"
                  >
                    モバイルアプリ開発
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Contact Info */}
          <div className="mt-8 lg:mt-0 lg:flex-shrink-0 lg:ml-12">
            <h3 className="text-white text-lg font-semibold mb-4">お問い合わせ</h3>
            <address className="not-italic">
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-3">
                  <Mail className="w-4 h-4 mt-1 flex-shrink-0" aria-hidden="true" />
                  <a 
                    href="mailto:info@landbridge.co.jp" 
                    className="hover:text-white transition-colors"
                    aria-label="メールでお問い合わせ"
                  >
                    info@landbridge.co.jp
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Phone className="w-4 h-4 mt-1 flex-shrink-0" aria-hidden="true" />
                  <a 
                    href="tel:03-1234-5678" 
                    className="hover:text-white transition-colors"
                    aria-label="電話でお問い合わせ"
                  >
                    03-1234-5678
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 mt-1 flex-shrink-0" aria-hidden="true" />
                  <span>
                    〒100-0001<br />
                    東京都千代田区千代田1-1
                  </span>
                </li>
              </ul>
            </address>
          </div>
        </div>

        {/* Bottom Bar with Schema.org markup for SEO */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm">
          <div className="flex flex-col gap-4">
            <nav aria-label="フッターリンク" className="flex justify-center">
              <ul className="flex flex-wrap gap-6 text-xs">
                <li>
                  <Link href="/privacy" className="hover:text-white transition-colors">
                    プライバシーポリシー
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-white transition-colors">
                    利用規約
                  </Link>
                </li>
                <li>
                  <Link href="/sitemap" className="hover:text-white transition-colors">
                    サイトマップ
                  </Link>
                </li>
              </ul>
            </nav>
            <p className="text-center">&copy; {currentYear} LandBridge株式会社. All rights reserved.</p>
          </div>
          {/* Spacing to avoid contact button overlap on mobile */}
          <div className="h-20 md:h-0"></div>
        </div>
      </div>
      
      {/* Schema.org JSON-LD for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Organization",
            "name": "LandBridge株式会社",
            "url": "https://www.landbridge.co.jp/",
            "logo": "https://www.landbridge.co.jp/logo.png",
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+81-3-1234-5678",
              "contactType": "customer service",
              "areaServed": "JP",
              "availableLanguage": "Japanese"
            },
            "sameAs": [],
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "千代田1-1",
              "addressLocality": "千代田区",
              "addressRegion": "東京都",
              "postalCode": "100-0001",
              "addressCountry": "JP"
            }
          })
        }}
      />
    </footer>
  )
}

export default Footer