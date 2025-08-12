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
    <div className="relative rounded-2xl p-8 mb-8 overflow-hidden bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* パターン背景 */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%234338ca' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>
      
      {/* コンテンツ */}
      <div className="relative flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">
            {profile.name}
          </h1>
          <h2 className="text-xl md:text-2xl text-gray-700 mb-6 font-medium">{profile.title}</h2>
          
          <div className="text-base md:text-lg mb-6 leading-relaxed text-gray-600 whitespace-pre-line">{profile.bio}</div>
          
          <div className="flex items-center gap-4">
            <Link 
              href="https://www.landbridge.ai/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-6 py-3 bg-portfolio-blue text-white rounded-lg hover:bg-portfolio-blue-dark transition-all duration-200 font-medium shadow-md hover:shadow-lg"
            >
              <Globe className="h-5 w-5" />
              <span>企業サイトはこちら</span>
              <ExternalLink className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-900">開発実績</h3>
            <ul className="space-y-4">
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-gray-700">コーポレートサイト</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{categoryStats?.homepage || 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                  <span className="text-gray-700">ランディングページ</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{categoryStats?.['landing-page'] || 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span className="text-gray-700">Webアプリ</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{categoryStats?.['web-app'] || 0}</span>
              </li>
              <li className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-gray-700">モバイルアプリ</span>
                </div>
                <span className="text-2xl font-bold text-gray-900">{categoryStats?.['mobile-app'] || 0}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}