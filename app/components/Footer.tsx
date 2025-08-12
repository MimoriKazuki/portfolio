import Link from 'next/link'
import Image from 'next/image'
import { Mail, Phone, MapPin, Twitter, Facebook, Linkedin, Youtube } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="mb-4">
              <Image
                src="/logo.png"
                alt="LandBridge"
                width={140}
                height={40}
              />
            </div>
            <p className="text-sm mb-4">
              最新技術を活用した開発で、お客様のビジネスをサポートします。
            </p>
            <div className="flex space-x-4">
              <Link href="#" className="hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Linkedin className="w-5 h-5" />
              </Link>
              <Link href="#" className="hover:text-white transition-colors">
                <Youtube className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">サービス</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/projects?category=homepage" className="hover:text-white transition-colors">
                  ホームページ制作
                </Link>
              </li>
              <li>
                <Link href="/projects?category=landing-page" className="hover:text-white transition-colors">
                  ランディングページ制作
                </Link>
              </li>
              <li>
                <Link href="/projects?category=web-app" className="hover:text-white transition-colors">
                  Webアプリ開発
                </Link>
              </li>
              <li>
                <Link href="/projects?category=mobile-app" className="hover:text-white transition-colors">
                  モバイルアプリ開発
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">リソース</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/columns" className="hover:text-white transition-colors">
                  技術コラム
                </Link>
              </li>
              <li>
                <Link href="/documents" className="hover:text-white transition-colors">
                  資料ダウンロード
                </Link>
              </li>
              <li>
                <Link href="/projects" className="hover:text-white transition-colors">
                  制作実績
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-white transition-colors">
                  お問い合わせ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-white text-lg font-semibold mb-4">お問い合わせ</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-3">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>info@landbridge.co.jp</span>
              </li>
              <li className="flex items-start gap-3">
                <Phone className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>03-1234-5678</span>
              </li>
              <li className="flex items-start gap-3">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0" />
                <span>〒100-0001<br />東京都千代田区千代田1-1</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; 2024 LandBridge. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer