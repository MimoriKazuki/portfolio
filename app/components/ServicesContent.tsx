'use client'

import { useState, useEffect, useRef } from 'react'
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
  const [activeTab, setActiveTab] = useState<'corporate' | 'individual'>('corporate')
  const [isVisible, setIsVisible] = useState(false)
  const [navPosition, setNavPosition] = useState<'fixed' | 'absolute'>('fixed')
  const [navTop, setNavTop] = useState(0)
  const [activeServiceId, setActiveServiceId] = useState<string>('')
  const sectionRef = useRef<HTMLDivElement>(null)
  const ctaSectionRef = useRef<HTMLDivElement>(null)
  const navRef = useRef<HTMLDivElement>(null)

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
      subtitle: '生成AIの基礎から実践まで、企業の現場で即戦力として活躍できる人材を育成する包括的な研修プログラムです。',
      description: [
        '企業の課題に特化したカスタマイズ研修で、社員一人ひとりのAIリテラシーを向上させます。',
        '座学だけでなく、実際の業務を想定したワークショップを通じて、現場で使えるスキルを習得。チーム全体のAI活用文化を定着させ、組織の生産性向上を実現します。'
      ],
      href: '/services/comprehensive-ai-training',
      image: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1470&auto=format&fit=crop',
      logoText: '生成AI総合研修',
      logoSubtext: 'エンゲージメントプラットフォーム'
    },
    {
      id: 'ai-writing-training',
      number: '02',
      label: 'AIライティング研修',
      title: 'AIで、文章力を武器に。',
      subtitle: 'ChatGPTやClaude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。',
      description: [
        'プロンプトエンジニアリングの基礎から応用まで、ビジネス文書作成に特化したノウハウを提供。',
        'メール、報告書、企画書など、日常業務で必要な文書を効率的に作成する技術を学びます。校正・編集の自動化手法も習得し、文章品質の向上と時間短縮を両立します。'
      ],
      href: '/services/ai-writing-training',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=800&h=600&fit=crop&crop=center',
      logoText: 'AIライティング',
      logoSubtext: 'ビジネス文書作成効率化'
    },
    {
      id: 'ai-video-training',
      number: '03',
      label: 'AI動画生成研修',
      title: '動画制作を、誰でも簡単に。',
      subtitle: '最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。',
      description: [
        'Sora、Runway、Pika等の最新AI動画生成ツールの活用法を実践的に学習。',
        'ストーリーテリングの基礎から、マーケティング動画の企画・制作まで、動画コンテンツ制作の全工程をAIで効率化する手法を習得します。'
      ],
      href: '/services/ai-video-training',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop&crop=center',
      logoText: 'AI動画生成',
      logoSubtext: 'マーケティング動画制作'
    },
    {
      id: 'ai-coding-training',
      number: '04',
      label: 'AIコーディング研修',
      title: '開発効率を、飛躍的に。',
      subtitle: 'GitHub Copilot、Claude Codeなどを活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。',
      description: [
        'AI支援コーディングツールの効果的な活用法から、ペアプログラミング手法まで幅広く学習。',
        'コード品質向上テクニックやデバッグの効率化など、実務に直結するスキルを習得し、開発チーム全体の生産性向上を実現します。'
      ],
      href: '/services/ai-coding-training',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center',
      logoText: 'AIコーディング',
      logoSubtext: '開発効率化プログラム'
    },
    {
      id: 'practical-ai-training',
      number: '05',
      label: '生成AI実務活用研修',
      title: '業務プロセスを、AI で最適化。',
      subtitle: '日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。',
      description: [
        '業務フロー分析からAI導入計画の策定まで、組織に合わせた実践的なプログラムを提供。',
        'チーム連携の強化やROI測定手法も学び、AI活用の効果を可視化しながら継続的な改善を推進します。'
      ],
      href: '/services/practical-ai-training',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=800&h=600&fit=crop&crop=center',
      logoText: '実務活用研修',
      logoSubtext: '業務効率化プログラム'
    }
  ]

  // 個人向けサービス
  const individualServices: ServiceItem[] = [
    {
      id: 'ai-talent-development',
      number: '01',
      label: 'AI人材育成所',
      title: '今の自分に合ったスキルを、\nともに見出そう。',
      subtitle: '個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。',
      description: [
        'AI人材育成所は、あなた専属のAIコーチが伴走する個別指導プログラムです。',
        '目的やレベルに合わせてカリキュラムをカスタマイズ。日常業務で使えるAIスキルを最短で身につけられます。キャリアサポートやスキル認定制度も充実しています。'
      ],
      href: '/services/ai-talent-development',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=600&fit=crop&crop=center',
      logoText: 'AI人材育成所',
      logoSubtext: 'パーソナルAIコーチング'
    }
  ]

  const currentServices = activeTab === 'corporate' ? corporateServices : individualServices

  return (
    <div className="w-full">
      {/* SEO用のh1 */}
      <h1 className="sr-only">LandBridge サービス - AI研修・教育プログラム</h1>

      {/* Right Side Navigation */}
      <div
        ref={navRef}
        className="hidden xl:block z-40 w-40"
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
                className={`group flex items-center gap-3 text-sm transition-colors duration-200 ${
                  isActive
                    ? 'text-blue-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
                    isActive
                      ? 'bg-blue-600'
                      : 'bg-gray-300 group-hover:bg-gray-500'
                  }`}
                />
                <span>{service.label}</span>
              </a>
            )
          })}
        </nav>
      </div>

      {/* Main Content Area - with right margin for navigation */}
      {/* right-48px(nav position) + w-40(nav width 160px) + 32px(gap) = 240px = mr-60 */}
      <div className="xl:mr-60">

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
            グループ全体で約700のAI活用事業を運営しています。
            <br />
            お客様業務課題を細部にわたって分析し、最適サービスで企業の
            <br />
            成⻑を支援します。
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
      <section ref={sectionRef} className="space-y-32">
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

            {/* Content Area - Two Columns */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16">
              {/* Left Column - Label, Title, Link */}
              <div>
                {/* Service Number & Label */}
                <div className="mb-4">
                  <p className="text-sm text-gray-400 mb-1">Service {service.number}</p>
                  <p className={`text-sm font-medium ${activeTab === 'corporate' ? 'text-blue-600' : 'text-emerald-600'}`}>
                    {service.label}
                  </p>
                </div>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6 leading-tight whitespace-pre-line">
                  {service.title}
                </h3>

                {/* View Detail Link */}
                <Link
                  href={service.href}
                  className={`inline-flex items-center gap-2 text-sm font-medium group ${
                    activeTab === 'corporate' ? 'text-blue-600 hover:text-blue-700' : 'text-emerald-600 hover:text-emerald-700'
                  } transition-colors`}
                >
                  view detail
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center transition-transform group-hover:translate-x-1 ${
                    activeTab === 'corporate' ? 'bg-blue-600' : 'bg-emerald-600'
                  }`}>
                    <ArrowRight className="w-3 h-3 text-white" />
                  </span>
                </Link>
              </div>

              {/* Right Column - Description */}
              <div>
                {/* Subtitle */}
                <p className="text-gray-900 font-medium mb-4 leading-relaxed">
                  {service.subtitle}
                </p>

                {/* Description */}
                <div className="space-y-4 text-gray-500 text-sm leading-relaxed">
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
      <section ref={ctaSectionRef} className="mt-32 -mx-4 sm:-mx-6 lg:-mx-8">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* 資料請求 */}
          <Link
            href="/documents"
            className="group relative block overflow-hidden"
          >
            <div className="relative h-[320px] md:h-[400px]">
              <Image
                src="https://images.unsplash.com/photo-1611079830811-865ff4428d17?w=800&h=600&fit=crop&crop=center"
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
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm font-medium">see more</span>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
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
                src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=800&h=600&fit=crop&crop=center"
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
                  <div className="flex items-center justify-center gap-3">
                    <span className="text-sm font-medium">see more</span>
                    <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center group-hover:bg-blue-400 transition-colors duration-300">
                      <ArrowRight className="w-5 h-5 text-white" />
                    </div>
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
