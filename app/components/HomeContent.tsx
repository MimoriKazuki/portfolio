'use client'

import { HeroSection } from './ui/light-saas-hero-section'
import { AIServicesCarousel } from './ui/ai-services-carousel'
import DynamicHomeContent from './DynamicHomeContent'

export default function HomeContent() {
  return (
    <div className="w-full">
      {/* SEO用の非表示h1 */}
      <h1 className="sr-only">LandBridge株式会社 - AI人材育成サービスとAI制作実績</h1>
      
      {/* Static Content - 即時表示 */}
      {/* Hero Section - 画面いっぱい */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        <HeroSection />
      </div>

      {/* AI Human Resource Development Services - Carousel */}
      <div className="max-w-[1023px] mx-auto px-8">
        <AIServicesCarousel />
      </div>

      {/* Dynamic Content - スケルトンローディング適用 */}
      <DynamicHomeContent />
    </div>
  )
}