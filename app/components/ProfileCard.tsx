'use client'

import { useState } from 'react'
import { Globe, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'

interface ProfileCardProps {
  categoryStats?: {
    homepage: number
    'landing-page': number
    'web-app': number
    'mobile-app': number
    video: number
  }
}

export default function ProfileCard({ categoryStats }: ProfileCardProps) {
  const [currentCard, setCurrentCard] = useState(0)
  const totalCards = 2

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

  const handleSwipe = (direction: 'left' | 'right') => {
    if (direction === 'right' && currentCard < totalCards - 1) {
      setCurrentCard(currentCard + 1)
    } else if (direction === 'left' && currentCard > 0) {
      setCurrentCard(currentCard - 1)
    }
  }

  // タッチイベント用の状態
  const [touchStart, setTouchStart] = useState(0)
  const [touchEnd, setTouchEnd] = useState(0)

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX)
  }

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return
    
    const distance = touchStart - touchEnd
    const isLeftSwipe = distance > 50
    const isRightSwipe = distance < -50

    if (isLeftSwipe && currentCard < totalCards - 1) {
      setCurrentCard(currentCard + 1)
    }
    if (isRightSwipe && currentCard > 0) {
      setCurrentCard(currentCard - 1)
    }
  }

  // 実績セクションのコンポーネント
  const StatsSection = () => (
    <div className="flex flex-col gap-2 lg:gap-2.5 lg:max-w-[400px]">
      {categoryStats?.homepage > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-3.5 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-purple-400 rounded-full flex-shrink-0"></div>
              <span className="text-white/90 font-medium text-sm">コーポレートサイト</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl lg:text-3xl font-bold text-white">{categoryStats.homepage}</span>
              <span className="text-white/60 text-xs">件</span>
            </div>
          </div>
        </div>
      )}
      {categoryStats?.['landing-page'] > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-3.5 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-pink-400 rounded-full flex-shrink-0"></div>
              <span className="text-white/90 font-medium text-sm">ランディングページ</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl lg:text-3xl font-bold text-white">{categoryStats['landing-page']}</span>
              <span className="text-white/60 text-xs">件</span>
            </div>
          </div>
        </div>
      )}
      {categoryStats?.['web-app'] > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-3.5 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-blue-400 rounded-full flex-shrink-0"></div>
              <span className="text-white/90 font-medium text-sm">Webアプリ</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl lg:text-3xl font-bold text-white">{categoryStats['web-app']}</span>
              <span className="text-white/60 text-xs">件</span>
            </div>
          </div>
        </div>
      )}
      {categoryStats?.['mobile-app'] > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-3.5 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-green-400 rounded-full flex-shrink-0"></div>
              <span className="text-white/90 font-medium text-sm">モバイルアプリ</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl lg:text-3xl font-bold text-white">{categoryStats['mobile-app']}</span>
              <span className="text-white/60 text-xs">件</span>
            </div>
          </div>
        </div>
      )}
      {categoryStats?.video > 0 && (
        <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 lg:p-3.5 border border-white/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-2 lg:w-2.5 h-2 lg:h-2.5 bg-orange-400 rounded-full flex-shrink-0"></div>
              <span className="text-white/90 font-medium text-sm">動画制作</span>
            </div>
            <div className="flex items-baseline gap-0.5">
              <span className="text-2xl lg:text-3xl font-bold text-white">{categoryStats.video}</span>
              <span className="text-white/60 text-xs">件</span>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  return (
    <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-portfolio-blue to-portfolio-blue-dark mb-8">
      {/* パターン背景 */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* デスクトップビュー - 1枚のカード */}
      <div className="hidden lg:block relative p-8">
        <div className="flex gap-8">
          <div className="flex-1 flex flex-col">
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl text-white/90 mb-6 font-bold">{profile.title}</h2>
              
              <div className="text-base md:text-lg mb-6 leading-relaxed text-white/80 whitespace-pre-line">{profile.bio}</div>
            </div>
            
            <div className="flex items-center gap-4 mt-auto">
              <Link 
                href="https://www.landbridge.co.jp/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-portfolio-blue rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg"
              >
                <span>企業サイトはこちら</span>
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="w-80 flex-shrink-0">
            <StatsSection />
          </div>
        </div>
      </div>

      {/* モバイルビュー - スワイプ可能な2枚のカード */}
      <div className="lg:hidden">
        <div 
          className="relative overflow-hidden"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="flex transition-transform duration-300 ease-in-out items-stretch"
            style={{ transform: `translateX(-${currentCard * 100}%)` }}
          >
            {/* カード1: プロフィール */}
            <div className="w-full flex-shrink-0 p-6 pb-16">
              <div className="flex flex-col h-full">
                <h2 className="text-lg sm:text-xl text-white/90 mb-4 font-bold">{profile.title}</h2>
                
                <div className="text-sm sm:text-base mb-6 leading-relaxed text-white/80 whitespace-pre-line flex-1">{profile.bio}</div>
                
                <div className="flex items-center gap-4">
                  <Link 
                    href="https://www.landbridge.co.jp/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-portfolio-blue rounded-lg hover:bg-gray-50 transition-all duration-200 font-medium shadow-md hover:shadow-lg text-sm"
                  >
                    <span>企業サイトはこちら</span>
                    <ExternalLink className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            </div>

            {/* カード2: 実績 */}
            <div className="w-full flex-shrink-0 p-6 pb-16">
              <div className="h-full flex items-center">
                <div className="w-full">
                  <StatsSection />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ナビゲーション矢印（タブレット） */}
        <button
          onClick={() => handleSwipe('left')}
          className={`hidden md:block absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all ${
            currentCard === 0 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentCard === 0}
          aria-label="前のカード"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={() => handleSwipe('right')}
          className={`hidden md:block absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/20 backdrop-blur-sm text-white hover:bg-white/30 transition-all ${
            currentCard === totalCards - 1 ? 'opacity-50 cursor-not-allowed' : ''
          }`}
          disabled={currentCard === totalCards - 1}
          aria-label="次のカード"
        >
          <ChevronRight className="h-6 w-6" />
        </button>

        {/* インジケーター */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
          {[...Array(totalCards)].map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentCard(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentCard 
                  ? 'bg-white w-8' 
                  : 'bg-white/40 hover:bg-white/60'
              }`}
              aria-label={`カード ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}