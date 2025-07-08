import { Globe, ExternalLink } from 'lucide-react'
import Link from 'next/link'

interface ProfileCardProps {
  categoryStats?: {
    homepage: number
    'landing-page': number
    'web-app': number
    'mobile-app': number
  }
}

export default function ProfileCard({ categoryStats }: ProfileCardProps) {
  const profile = {
    name: "LandBridge株式会社",
    title: "AIによる自動コーディングを活用した開発実績",
    bio: "当社では、AIによる自動コーディング手法「バイブコーディング」を取り入れることで、従来にないスピード感と柔軟性を備えた開発を実現しています。\n本サイトでは、その技術を活用して開発したWebサイトやアプリケーションの事例を掲載しています。\nご相談やお見積りなど、お気軽にお問い合わせください。",
    location: null,
    email: null,
    github_url: null,
    twitter_url: null,
    linkedin_url: null,
  }

  return (
    <div className="relative rounded-lg p-4 sm:p-6 md:p-8 mb-6 md:mb-8 overflow-hidden">
      {/* グラデーション背景 */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-indigo-600/20 rounded-lg" />
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-blue-500/10 to-purple-500/10 rounded-lg" />
      
      {/* コンテンツ */}
      <div className="relative flex flex-col lg:flex-row gap-6 md:gap-8">
        <div className="flex-1">
          <div className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-3 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent pb-1" style={{ lineHeight: '1.4' }}>
            {profile.name}
          </div>
          <h2 className="text-lg sm:text-xl md:text-2xl text-gray-300 mb-4 sm:mb-6 font-medium">{profile.title}</h2>
          
          <div className="text-sm sm:text-base md:text-lg mb-4 sm:mb-6 leading-relaxed text-gray-200 whitespace-pre-line">{profile.bio}</div>
          
          <div className="flex items-center gap-2 mt-4 sm:mt-6">
            <Link 
              href="https://landbridge.co.jp/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 text-sm sm:text-base bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105"
            >
              <Globe className="h-4 sm:h-5 w-4 sm:w-5" />
              <span>企業サイトはこちら</span>
              <ExternalLink className="h-3 sm:h-4 w-3 sm:w-4" />
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-1/3">
          <div className="bg-black/30 backdrop-blur-sm rounded-lg p-4 sm:p-6 border border-white/10">
            <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4 text-gray-200">開発実績</h3>
            <ul className="space-y-2 sm:space-y-3">
              <li className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm">コーポレートサイト</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-400 w-8 sm:w-10 text-right tabular-nums">{categoryStats?.homepage || 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm">ランディングページ</span>
                <span className="text-xl sm:text-2xl font-bold text-purple-400 w-8 sm:w-10 text-right tabular-nums">{categoryStats?.['landing-page'] || 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm">Webアプリ</span>
                <span className="text-xl sm:text-2xl font-bold text-indigo-400 w-8 sm:w-10 text-right tabular-nums">{categoryStats?.['web-app'] || 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <span className="text-gray-300 text-xs sm:text-sm">モバイルアプリ</span>
                <span className="text-xl sm:text-2xl font-bold text-blue-400 w-8 sm:w-10 text-right tabular-nums">{categoryStats?.['mobile-app'] || 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}