'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import { ArrowRight, Building2, User } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

// サービスデータの型定義
interface ServiceItem {
  id: string
  number: string
  label: string
  title: string
  subtitle: string
  description: string[]
  href: string
  image: string
  logoText?: string
  logoSubtext?: string
}

export default function ServicesContent() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<'corporate' | 'individual'>('corporate')
  const [isVisible, setIsVisible] = useState(false)
  const [navPosition, setNavPosition] = useState<'fixed' | 'absolute'>('fixed')
  const [navTop, setNavTop] = useState(0)
  const [activeServiceId, setActiveServiceId] = useState<string>('')
  const sectionRef = useRef<HTMLDivElement>(null)
  const ctaSectionRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

  // URLパラメータからタブを設定
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'individual') {
      setActiveTab('individual')
    } else if (tab === 'corporate') {
      setActiveTab('corporate')
    }
  }, [searchParams])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 右ナビゲーションのスクロール制御 & アクティブセクション検出
  useEffect(() => {
    const handleScroll = () => {
      if (!ctaSectionRef.current || !navRef.current) return

      const ctaRect = ctaSectionRef.current.getBoundingClientRect()
      const navHeight = navRef.current.offsetHeight
      const initialTop = 200 // 初期位置（説明文の開始位置付近）

      // CTAセクションに到達したらナビを止める
      if (ctaRect.top <= initialTop + navHeight + 50) {
        setNavPosition('absolute')
        setNavTop(ctaSectionRef.current.offsetTop - navHeight - 50)
      } else {
        setNavPosition('fixed')
        setNavTop(initialTop)
      }

      // 現在表示中のセクションを検出
      const sections = document.querySelectorAll('article[id]')
      let currentActiveId = ''

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        // セクションが画面上部付近にある場合をアクティブとする
        if (rect.top <= 300 && rect.bottom >= 100) {
          currentActiveId = section.id
        }
      })

      setActiveServiceId(currentActiveId)
    }

    window.addEventListener('scroll', handleScroll)
    handleScroll() // 初期位置を設定

    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // 企業向けサービス
  const corporateServices: ServiceItem[] = [
    {
      id: 'comprehensive-ai-training',
      number: '01',
      label: '生成AI総合研修',
      title: '組織に、より良い習慣を。',
      subtitle: '生成AIの基礎から実践まで体系的に学べる包括的な研修プログラムです。ChatGPT、Claude、Geminiなど主要な生成AIツールの活用法を網羅的に習得できます。',
      description: [
        '企業の業務課題に合わせたカスタマイズ研修で、社員一人ひとりのAIリテラシーを向上させます。未経験者から上級者まで、幅広いレベルに対応したカリキュラムを用意しています。',
        '座学だけでなく実務を想定したワークショップを通じて、現場で即座に使えるスキルを習得。チーム全体のAI活用文化を定着させ、組織の生産性向上を実現します。'
      ],
      href: '/services/comprehensive-ai-training',
      image: '/images/services/list/comprehensive-ai-training.jpg',
      logoText: '生成AI総合研修',
      logoSubtext: 'エンゲージメントプラットフォーム'
    },
    {
      id: 'ai-coding-training',
      number: '02',
      label: 'AIコーディング研修',
      title: '開発効率を、飛躍的に。',
      subtitle: 'AI支援プログラミング技術を習得し、開発効率を飛躍的に向上させる研修です。GitHub Copilot、Claude Code、Cursorなど最新ツールの効果的な活用法を学びます。',
      description: [
        'コード生成、リファクタリング、デバッグまで、開発の各フェーズでAIを最大限に活用する方法を習得。ペアプログラミングの新しい形として、AIとの協働開発スキルが身につきます。',
        'コード品質の向上とレビュー効率化により、開発チーム全体の生産性を大幅に改善。技術的負債の削減にも貢献し、持続可能な開発体制を構築できます。'
      ],
      href: '/services/ai-coding-training',
      image: '/images/services/list/ai-coding-training.jpg',
      logoText: 'AIコーディング',
      logoSubtext: '開発効率化プログラム'
    },
    {
      id: 'ai-organization-os',
      number: '03',
      label: 'AI組織OS研修',
      title: '組織の脳みそを、構築する。',
      subtitle: 'CursorとGitHubを活用した社内ナレッジ管理で「組織の脳みそ」を構築。情報共有・引き継ぎ業務を革新し、組織全体の生産性を向上させる研修です。',
      description: [
        'シリコンバレーで注目の「組織OS」概念を日本企業に導入。社員の役割・タスク・進捗をGitHubで管理し、CursorのAIに質問することで組織全体の状況を誰でも把握できる環境を構築します。',
        '管理者は社員への確認なしにAIへの質問で現状を把握でき、異動・退職時の引き継ぎもAIが対応。情報の属人化から解放され、組織全体の知識が継承される仕組みを実現します。'
      ],
      href: '/services/ai-organization-os',
      image: '/images/services/list/ai-organization-os.jpg',
      logoText: 'AI組織OS',
      logoSubtext: '組織ナレッジ管理革新'
    },
    {
      id: 'ai-video-training',
      number: '04',
      label: 'AI動画生成研修',
      title: '動画制作を、誰でも簡単に。',
      subtitle: '最新のAI動画生成ツールを活用した動画制作技術を学ぶ研修です。Sora、Gemini、Higgsfield等の主要ツールの特徴と使い分けを実践的に学習します。',
      description: [
        'ストーリーテリングの基礎から、マーケティング動画の企画・制作まで、動画コンテンツ制作の全工程をカバー。専門知識がなくても高品質な動画を短時間で制作できるようになります。',
        'SNS向けショート動画からプレゼンテーション動画まで、目的に応じた動画制作ノウハウを習得。社内の動画制作コストを大幅に削減しながら、発信力を強化できます。'
      ],
      href: '/services/ai-video-training',
      image: '/images/services/list/ai-video-training.jpg',
      logoText: 'AI動画生成',
      logoSubtext: 'マーケティング動画制作'
    }
  ]

  // 個人向けサービス
  const individualServices: ServiceItem[] = [
    {
      id: 'ai-talent-development',
      number: '01',
      label: 'AI駆動開発育成所',
      title: 'バイブコーディングで、\n開発の世界を変えよう。',
      subtitle: '完全審査制の個人向けバイブコーディング特化コーチングです。Claude CodeやCursorを活用したAI駆動開発スキルを体系的に習得できます。',
      description: [
        '自然言語でアプリケーションを構築する「バイブコーディング」の技術を、基礎から応用まで専任コーチがマンツーマンで指導。開発効率を3〜5倍向上させるスキルを身につけられます。',
        '本気でスキル習得を目指す方のみを対象とした完全審査制。審査を通過された方には、質の高いコーチングと実践プロジェクトを通じて、即戦力となるAI駆動開発スキルを伝授します。'
      ],
      href: '/services/ai-talent-development',
      image: '/images/services/list/ai-talent-development.jpg',
      logoText: 'AI駆動開発育成所',
      logoSubtext: 'バイブコーディング特化'
    }
  ]

  const currentServices = activeTab === 'corporate' ? corporateServices : individualServices

  return (
    <div className="w-full pt-8 max-mid:pt-0">
      {/* SEO用のh1 */}
      <h1 className="sr-only">LandBridge サービス - AI研修・教育プログラム</h1>

      {/* Right Side Navigation */}
      <div
        ref={navRef}
        className="hidden xl:block z-40 w-44"
        style={{
          position: navPosition,
          top: `${navTop}px`,
          right: '48px',
        }}
      >
        <nav className="flex flex-col gap-4">
          {currentServices.map((service) => {
            const isActive = activeServiceId === service.id
            return (
              <a
                key={service.id}
                href={`#${service.id}`}
                onClick={(e) => {
                  e.preventDefault()
                  const element = document.getElementById(service.id)
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
                  }
                }}
                className={`group flex items-center gap-3 text-base transition-colors duration-200 ${
                  isActive
                    ? activeTab === 'corporate' ? 'text-blue-600 font-medium' : 'text-emerald-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? activeTab === 'corporate' ? 'bg-blue-600' : 'bg-emerald-600'
                      : 'bg-transparent'
                  }`}
                />
                <span>{service.label}</span>
              </a>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area - with right margin for navigation */}
      {/* right-48px(nav position) + w-44(nav width 176px) + 48px(gap) = 272px = mr-68 */}
      {/* Only apply margin on xl screens where navigation is visible */}
      <div className="xl:mr-[272px]">

      {/* Hero Section */}
      <section className="mb-12">
        <div 
          className="mb-8"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">SERVICE</h2>
          <p className="text-lg text-gray-500">事業内容</p>
        </div>

        {/* Description */}
        <div 
          className="max-w-3xl mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
          }}
        >
          <p className="text-gray-600 leading-relaxed">
            生成AIの基礎から実践まで、目的に応じた研修プログラムを提供しています。
            <br />
            企業の組織力強化から個人のスキルアップまで、
            <br />
            AI時代に必要な能力開発を総合的にサポートします。
          </p>
        </div>

        {/* Tabs */}
        <div 
          className="flex gap-4 mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.2s, transform 0.6s ease-out 0.2s',
          }}
        >
          <button
            onClick={() => setActiveTab('corporate')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'corporate'
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <Building2 className="w-5 h-5" />
            企業向け
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all duration-300 ${
              activeTab === 'individual'
                ? 'bg-emerald-600 text-white shadow-lg'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            <User className="w-5 h-5" />
            個人向け
          </button>
        </div>

      </section>

      {/* Services List */}
      <section ref={sectionRef} className="space-y-16 mid:space-y-32">
        {currentServices.map((service, index) => (
          <article
            key={service.id}
            id={service.id}
            className="scroll-mt-24"
          >
            {/* Image Area - Full Width, 21:9 aspect ratio */}
            <div className="relative overflow-hidden mb-8">
              <div className="relative aspect-[21/9]">
                <Image
                  src={service.image}
                  alt={service.label}
                  fill
                  className="object-cover"
                  sizes="100vw"
                />
              </div>
            </div>

            {/* Content Area - Two Columns (4:6 ratio) */}
            <div className="grid grid-cols-1 md:grid-cols-[4fr_6fr] xl:grid-cols-1 wide:grid-cols-[4fr_6fr] gap-8 md:gap-12 xl:gap-8 wide:gap-12 2xl:gap-16 w-full">
              {/* Left Column - Label, Title, Link (4/10) */}
              <div>
                {/* Service Number */}
                <p className={`text-base font-medium mb-4 ${activeTab === 'corporate' ? 'text-blue-600' : 'text-emerald-600'}`}>
                  Service {service.number}
                </p>

                {/* Title (Service Name) */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 sm:mb-12 xl:mb-6 wide:mb-12 leading-tight">
                  {service.label}
                </h3>

                {/* View Detail Link */}
                <Link
                  href={service.href}
                  className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-medium transition-colors duration-200 text-base border ${
                    activeTab === 'corporate'
                      ? 'text-blue-600 border-blue-600 hover:bg-blue-50'
                      : 'text-emerald-600 border-emerald-600 hover:bg-emerald-50'
                  }`}
                >
                  カリキュラムを見る
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Right Column - Description (6/10) */}
              <div>
                {/* Subtitle */}
                <p className="text-gray-600 font-medium mb-6 leading-loose">
                  {service.subtitle}
                </p>

                {/* Description */}
                <div className="space-y-5 text-gray-600 text-base leading-loose font-medium">
                  {service.description.map((paragraph, i) => (
                    <p key={i}>{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          </article>
        ))}
      </section>

      </div>
      {/* End Main Content Area */}

      {/* CTA Section - Full Width */}
      <section ref={ctaSectionRef} className="mt-32 -mx-4 sm:-mx-6 lg:-mx-8 -mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 資料請求 */}
          <Link
            href="/documents"
            className="group relative block overflow-hidden"
          >
            <div className="relative h-[320px] md:h-[400px]">
              <Image
                src="/images/cta/document.jpg"
                alt="資料請求"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60" />

              <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    DOCUMENT
                  </h3>
                  <p className="text-lg font-medium mb-4">資料請求</p>
                  <p className="text-sm text-gray-200 mb-8 max-w-xs leading-relaxed mx-auto">
                    サービス詳細や料金プランなど、<br />
                    詳しい資料をお送りいたします。
                  </p>
                  <div className="inline-flex items-center gap-2 border border-white/50 px-6 py-3 group-hover:bg-white/10 transition-all duration-300">
                    <span className="text-sm tracking-wider">VIEW MORE</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>

          {/* お問い合わせ */}
          <Link
            href="/contact"
            className="group relative block overflow-hidden"
          >
            <div className="relative h-[320px] md:h-[400px]">
              <Image
                src="/images/cta/contact.jpg"
                alt="お問い合わせ"
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/60" />

              <div className="absolute inset-0 flex items-center justify-center text-white text-center px-6">
                <div>
                  <h3 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
                    CONTACT
                  </h3>
                  <p className="text-lg font-medium mb-4">お問い合わせ</p>
                  <p className="text-sm text-gray-200 mb-8 max-w-xs leading-relaxed mx-auto">
                    ご質問・ご相談について、<br />
                    まずはお気軽にお問合せください。
                  </p>
                  <div className="inline-flex items-center gap-2 border border-white/50 px-6 py-3 group-hover:bg-white/10 transition-all duration-300">
                    <span className="text-sm tracking-wider">VIEW MORE</span>
                    <ArrowRight className="w-4 h-4" />
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </section>
    </div>
  )
}
