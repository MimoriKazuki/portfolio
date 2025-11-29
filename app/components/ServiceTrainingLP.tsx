'use client'

import { ArrowRight, ArrowLeft, Users, Target, Lightbulb, CheckCircle, Check, X, ChevronRight, Calendar, FileText, Download, MessageCircle, ChevronDown, LucideIcon, Crown, UserCheck, Zap, GraduationCap, TrendingUp, Settings, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Column, Project } from '@/app/types'
import { useState, useEffect, useRef } from 'react'
import TargetAudienceCard from './TargetAudienceCard'
import { AITrainingHeroSection } from './ui/ai-training-hero-section'

// Animation hook for scroll-triggered animations
function useScrollAnimation(threshold = 0.1) {
  const ref = useRef<HTMLElement>(null)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      { threshold, rootMargin: '0px 0px -50px 0px' }
    )

    observer.observe(element)
    return () => observer.disconnect()
  }, [threshold])

  return { ref, isVisible }
}

// Service Overview Item Interface
interface ServiceOverviewItem {
  title: string
  description: string
  image: string
}

// AI Tool Interface
interface AITool {
  name: string
  logo: string
}

// Target Audience Interface
interface TargetAudience {
  image: string
  text: string
}

// FAQ Interface
interface FAQ {
  question: string
  answer: string
}

// Other Training Program Interface
interface OtherTrainingProgram {
  id: string
  title: string
  description: string
  href: string
  image: string
  available: boolean
  category: "enterprise" | "individual"
}

// Main Props Interface
interface ServiceTrainingLPProps {
  // Page metadata
  pageTitle: string
  heroTitle: string
  heroSubtitle?: string
  heroImage: string
  seoTitle: string
  
  // Hero CTA
  heroCTA: {
    inquiryText: string
    documentText: string
    inquiryHref: string
    documentHref: string
  }
  
  // Service overview section
  serviceOverview: {
    title: string
    subtitle?: string
    descriptionTop: string
    tools: AITool[]
    descriptionBottom: string
    featureImage: string
    items: ServiceOverviewItem[]
  }
  
  // Mid CTA section
  midCTA: {
    title: string
    description: string
    inquiryHref: string
    documentHref: string
  }
  
  // Target audience section
  targetAudience: {
    title: string
    subtitle?: string
    audiences: TargetAudience[]
  }
  
  // Expected changes section
  expectedChanges: {
    title: string
    subtitle: string
    beforeItems: Array<{
      category: string
      issue: string
    }>
    afterItems: Array<{
      category: string
      achievement: string
    }>
  }
  
  // Curriculum section
  curriculum: {
    title: string
    modules: Array<{
      title: string
      description: string
      image: string
    }>
  }
  
  // Flow section
  flow: {
    title: string
    subtitle: string
    steps: string[]
    conclusionTitle: string
    conclusionText: string
  }
  
  // Additional CTA section (after flow, before overview table)
  additionalCTA?: {
    title: string
    description: string
    inquiryHref: string
    documentHref: string
  }
  
  // Overview table section
  overviewTable: {
    title: string
    rows: Array<[string, string]>
  }
  
  // FAQ section
  faq: {
    title: string
    items: FAQ[]
  }
  
  // Other training programs
  otherTrainingPrograms: {
    title: string
    currentPageId: string
    programs: OtherTrainingProgram[]
  }
  
  // Final CTA
  finalCTA: {
    title: string
    description: string
    inquiryHref: string
    documentHref: string
  }
  
  // Optional props for backwards compatibility
  latestColumns?: Column[]
  featuredProjects?: Project[]

  // Theme: blue for enterprise, green for individual
  theme?: 'blue' | 'green'

  // Service slug for contact form pre-selection
  serviceSlug?: string
}

export default function ServiceTrainingLP({
  pageTitle,
  heroTitle,
  heroSubtitle,
  heroImage,
  seoTitle,
  heroCTA,
  serviceOverview,
  midCTA,
  targetAudience,
  expectedChanges,
  curriculum,
  flow,
  additionalCTA,
  overviewTable,
  faq,
  otherTrainingPrograms,
  finalCTA,
  latestColumns = [],
  featuredProjects = [],
  theme = 'blue',
  serviceSlug
}: ServiceTrainingLPProps) {
  // Helper function to add service query param to contact links
  const getInquiryHref = (href: string) => {
    if (serviceSlug && href === '/contact') {
      return `/contact?service=${serviceSlug}`
    }
    return href
  }
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())
  const [heroLoaded, setHeroLoaded] = useState(false)

  // Other programs navigation state
  const filteredPrograms = otherTrainingPrograms.programs.filter(
    program => program.id !== otherTrainingPrograms.currentPageId
  )
  const [selectedProgramId, setSelectedProgramId] = useState<string>(
    filteredPrograms[0]?.id || ''
  )
  const selectedProgram = filteredPrograms.find(p => p.id === selectedProgramId)

  // Theme colors
  const themeColors = {
    blue: {
      primary: 'bg-blue-600',
      primaryHover: 'hover:bg-blue-700',
      text: 'text-blue-600',
      textDark: 'text-blue-700',
      textLight: 'text-blue-400',
      textHover: 'group-hover:text-blue-600',
      border: 'border-blue-600',
      bgLight: 'bg-blue-50',
      bgLightHover: 'hover:bg-blue-50',
      borderLight: 'border-blue-200',
      checkIcon: 'text-blue-500',
      shadowHover: 'hover:shadow-blue-100',
      hoverBg: 'group-hover:bg-blue-500',
      hoverText: 'group-hover:text-blue-300',
      iconBg: 'bg-blue-500',
    },
    green: {
      primary: 'bg-emerald-600',
      primaryHover: 'hover:bg-emerald-700',
      text: 'text-emerald-600',
      textDark: 'text-emerald-700',
      textLight: 'text-emerald-400',
      textHover: 'group-hover:text-emerald-600',
      border: 'border-emerald-600',
      bgLight: 'bg-emerald-50',
      bgLightHover: 'hover:bg-emerald-50',
      borderLight: 'border-emerald-200',
      checkIcon: 'text-emerald-500',
      shadowHover: 'hover:shadow-emerald-100',
      hoverBg: 'group-hover:bg-emerald-500',
      hoverText: 'group-hover:text-emerald-300',
      iconBg: 'bg-emerald-500',
    }
  }
  const colors = themeColors[theme]

  // Scroll animation refs for each section
  const featuresSection = useScrollAnimation()
  const targetSection = useScrollAnimation()
  const transformSection = useScrollAnimation()
  const midCtaSection = useScrollAnimation()
  const curriculumSection = useScrollAnimation()
  const flowSection = useScrollAnimation()
  const overviewSection = useScrollAnimation()
  const faqSection = useScrollAnimation()
  const finalCtaSection = useScrollAnimation()
  const otherProgramsSection = useScrollAnimation()

  useEffect(() => {
    const timer = setTimeout(() => setHeroLoaded(true), 100)
    return () => clearTimeout(timer)
  }, [])

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
  }

  // Icon mapping function
  const getIconComponent = (iconName: string) => {
    const iconMap: { [key: string]: LucideIcon } = {
      Crown,
      UserCheck,
      Zap,
      GraduationCap,
      TrendingUp,
      Settings,
      Users,
      Target,
      Lightbulb,
      CheckCircle
    }
    return iconMap[iconName] || Users
  }

  // AI Tool Logo Component
  const renderToolLogo = (tool: AITool) => {
    // Map tool logo identifiers to actual image paths
    const logoImages: { [key: string]: string } = {
      'chatgpt': '/logo_ChatGPT.svg?v=3',
      'claude': '/logo_claude.svg',
      'gemini': '/logo_Gemini.svg?v=3',
      'sora': '/logo_ChatGPT.svg?v=3',      // Uses OpenAI logo (Sora)
      'cursor': '/logo_Cursor.svg?v=2',
      'claudecode': '/logo_claude.svg',     // Uses Claude logo
      'codex': '/logo_ChatGPT.svg?v=3',     // Uses OpenAI logo
      'github': '/logo_GitHub.svg',
      'higgsfield': '/logo_Higgsfield.svg',
    }

    const logoSrc = logoImages[tool.logo]

    return (
      <div key={tool.logo} className="flex items-center gap-2">
        <div className="w-10 h-10 relative flex items-center justify-center">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt={tool.name}
              width={40}
              height={40}
              className="object-contain"
            />
          ) : (
            <div className="w-10 h-10 bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600">
              {tool.name.substring(0, 2)}
            </div>
          )}
        </div>
        <span className="text-sm text-gray-700 font-medium">{tool.name}</span>
      </div>
    )
  }

  return (
    <>
      {/* SEO用のh1 */}
      <h1 className="sr-only">{seoTitle}</h1>

      {/* Hero Section - 画面いっぱい */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        <div className="h-[320px] md:h-[400px] relative overflow-hidden w-full">
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            sizes="100vw"
            className="object-cover object-center"
            style={{
              transform: heroLoaded ? 'scale(1)' : 'scale(1.05)',
              transition: 'transform 1.2s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />

          {/* Back Button */}
          <Link
            href={`/services?tab=${theme === 'green' ? 'individual' : 'corporate'}`}
            className="absolute top-4 left-4 sm:top-6 sm:left-6 z-20 inline-flex items-center gap-2 px-4 py-2 text-white text-sm font-medium hover:bg-white/20 hover:backdrop-blur-sm transition-colors duration-200 hover:border hover:border-white/20 border border-transparent"
            style={{
              opacity: heroLoaded ? 1 : 0,
              transform: heroLoaded ? 'translateX(0)' : 'translateX(-20px)',
              transition: 'opacity 0.6s ease-out, transform 0.6s ease-out, background-color 0.2s',
            }}
          >
            <ArrowLeft className="w-4 h-4" />
            サービス一覧へ戻る
          </Link>

          <div className="relative z-10 flex items-center h-full max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
            <div>
              <h2
                className="text-3xl md:text-4xl lg:text-5xl text-white font-bold tracking-tight"
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transform: heroLoaded ? 'translateX(0)' : 'translateX(-30px)',
                  transition: 'opacity 0.8s ease-out 0.3s, transform 0.8s ease-out 0.3s',
                }}
              >
                {heroTitle}
              </h2>
              {heroSubtitle && (
                <p
                  className="mt-4 text-lg md:text-xl text-white/90 font-medium max-w-2xl"
                  style={{
                    opacity: heroLoaded ? 1 : 0,
                    transform: heroLoaded ? 'translateX(0)' : 'translateX(-20px)',
                    transition: 'opacity 0.8s ease-out 0.4s, transform 0.8s ease-out 0.4s',
                  }}
                >
                  {heroSubtitle}
                </p>
              )}
              <Link
                href={getInquiryHref(heroCTA.inquiryHref)}
                className={`mt-8 px-8 py-3 ${colors.primary} text-white font-medium ${colors.primaryHover} transition-colors duration-200 inline-flex items-center gap-2`}
                style={{
                  opacity: heroLoaded ? 1 : 0,
                  transform: heroLoaded ? 'translateX(0)' : 'translateX(-20px)',
                  transition: 'opacity 0.8s ease-out 0.5s, transform 0.8s ease-out 0.5s',
                }}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
                無料相談を予約する
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Overview Section */}
        <section
          ref={featuresSection.ref as React.RefObject<HTMLElement>}
          className="mt-16 mb-16"
        >
          <div
            className="mb-8 pt-16 relative"
            style={{
              opacity: featuresSection.isVisible ? 1 : 0,
              transform: featuresSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Features</span>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{serviceOverview.title}</h2>
            </div>
          </div>

          {/* 2-column layout: Text left (3), Image right (1) - wrapped in white box */}
          <div
            className="bg-white border border-gray-200 mb-16 p-8"
            style={{
              opacity: featuresSection.isVisible ? 1 : 0,
              transform: featuresSection.isVisible ? 'translateY(0)' : 'translateY(40px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            <div className="grid grid-cols-1 mid:grid-cols-4 lg:grid-cols-3 gap-8">
              {/* Left: Text content (3/4 on mid, 2/3 on lg) */}
              <div className="mid:col-span-3 lg:col-span-2 space-y-6">
                {/* Training Title */}
                <h3 className={`text-2xl font-bold ${colors.text}`}>
                  {pageTitle}
                </h3>

                {/* Top description */}
                <p className="text-gray-600 leading-relaxed">
                  {serviceOverview.descriptionTop}
                </p>

                {/* Tools section */}
                {serviceOverview.tools && serviceOverview.tools.length > 0 && (
                  <div className="bg-gray-50 p-6 -mx-2">
                    <div className="flex items-center gap-2 mb-4">
                      <span className={`w-2 h-2 ${colors.primary} rounded-full`}></span>
                      <span className={`text-sm font-semibold ${colors.text}`}>学べるスキル</span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                      {serviceOverview.tools.map((tool) => renderToolLogo(tool))}
                    </div>
                  </div>
                )}

                {/* Bottom description */}
                <p className="text-gray-600 leading-relaxed">
                  {serviceOverview.descriptionBottom}
                </p>
              </div>
              {/* Right: Image (1/4 on mid, 1/3 on lg) - Hidden below 720px */}
              <div className="hidden mid:block mid:col-span-1 lg:col-span-1 relative min-h-[300px] overflow-hidden">
                <Image
                  src={serviceOverview.featureImage || serviceOverview.items[0]?.image || heroImage}
                  alt={serviceOverview.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </div>
          </div>

          {/* Target Audience Subsection */}
          <div
            ref={targetSection.ref as React.RefObject<HTMLDivElement>}
            style={{
              opacity: targetSection.isVisible ? 1 : 0,
              transform: targetSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="mb-8 pt-16 relative">
              <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Target</span>
              <div className="relative z-10">
                <h3 className="text-2xl font-bold text-gray-900">{targetAudience.title}</h3>
              </div>
            </div>
            <div className="bg-white shadow-sm border border-gray-100 px-8 md:px-12 py-4 max-w-2xl mx-auto">
              {targetAudience.audiences.map((audience, index) => (
                <div
                  key={index}
                  style={{
                    opacity: targetSection.isVisible ? 1 : 0,
                    transform: targetSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s`,
                  }}
                >
                  <TargetAudienceCard
                    text={audience.text}
                    theme={theme}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Before/After Section */}
        <section
          ref={transformSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
        >
          <div
            className="mb-8"
            style={{
              opacity: transformSection.isVisible ? 1 : 0,
              transform: transformSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="mb-4 pt-16 relative">
              <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Transformation</span>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{expectedChanges.title}</h2>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Before Card */}
            <div
              className="bg-white shadow-sm border border-gray-100 p-8"
              style={{
                opacity: transformSection.isVisible ? 1 : 0,
                transform: transformSection.isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
              }}
            >
              <h3 className="text-lg font-bold text-gray-400 mb-6">Before</h3>
              <div className="space-y-5">
                {expectedChanges.beforeItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center mt-1">
                      <X className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <p className="text-gray-600 leading-relaxed">{item.issue}</p>
                  </div>
                ))}
              </div>
            </div>
            {/* After Card */}
            <div
              className="bg-white shadow-sm border border-gray-100 p-8"
              style={{
                opacity: transformSection.isVisible ? 1 : 0,
                transform: transformSection.isVisible ? 'translateY(0)' : 'translateY(40px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            >
              <h3 className={`text-lg font-bold ${colors.text} mb-6`}>After</h3>
              <div className="space-y-5">
                {expectedChanges.afterItems.slice(0, 3).map((item, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className={`flex-shrink-0 w-6 h-6 rounded-full ${colors.iconBg} flex items-center justify-center mt-1`}>
                      <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />
                    </div>
                    <p className="text-gray-700 leading-relaxed">{item.achievement}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Mid CTA Section */}
        <section
          ref={midCtaSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
          style={{
            opacity: midCtaSection.isVisible ? 1 : 0,
            transform: midCtaSection.isVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="pt-16 relative">
            <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Contact</span>
            <div className="relative z-10">
              <div className="bg-white shadow-sm border border-gray-100 p-8 lg:p-12">
                <div className="max-w-2xl mx-auto text-center">
                  <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                    {midCTA.title}
                  </h2>
                  <p className="text-gray-600 mb-8 leading-relaxed">
                    {midCTA.description}
                  </p>
                  <div className="flex flex-col mid:flex-row gap-3 mid:gap-4 justify-center items-stretch mid:items-center">
                    <Link
                      href={midCTA.documentHref}
                      className={`px-8 py-4 bg-white font-medium border ${colors.border} ${colors.text} hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2`}
                    >
                      <Download className="w-5 h-5" />
                      資料をダウンロード
                    </Link>
                    <Link
                      href={getInquiryHref(midCTA.inquiryHref)}
                      className={`px-8 py-4 ${colors.primary} text-white font-medium ${colors.primaryHover} transition-colors duration-200 flex items-center justify-center gap-2`}
                    >
                      <MessageCircle className="w-5 h-5" />
                      無料相談を予約する
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Curriculum Section */}
        <section
          ref={curriculumSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
        >
          <div
            className="mb-12 pt-16 relative"
            style={{
              opacity: curriculumSection.isVisible ? 1 : 0,
              transform: curriculumSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Curriculum</span>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{curriculum.title}</h2>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {curriculum.modules.map((module, index) => (
              <div
                key={index}
                style={{
                  opacity: curriculumSection.isVisible ? 1 : 0,
                  transform: curriculumSection.isVisible ? 'translateY(0)' : 'translateY(40px)',
                  transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s`,
                }}
              >
                <div className="group bg-white hover:bg-[#323232] transition-all duration-300 hover:scale-105 h-full">
                  <div className="p-6 md:p-8 min-h-[180px] flex flex-col justify-center">
                    <p className={`text-sm font-medium mb-2 ${theme === 'green' ? 'text-emerald-400' : 'text-blue-400'}`}>Module {String(index + 1).padStart(2, '0')}</p>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-white mb-2 transition-colors duration-300">{module.title}</h3>
                    <p className="text-gray-600 group-hover:text-gray-300 text-sm leading-relaxed transition-colors duration-300">{module.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Flow Section */}
        <section
          ref={flowSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
        >
          <div
            className="mb-12"
            style={{
              opacity: flowSection.isVisible ? 1 : 0,
              transform: flowSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <div className="mb-4 pt-16 relative">
              <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Flow</span>
              <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{flow.title}</h2>
              </div>
            </div>
            <p className="text-gray-600 leading-relaxed max-w-2xl">
              {flow.subtitle}
            </p>
          </div>
          {/* Desktop: 5 columns horizontal */}
          <div className="hidden lg:grid lg:grid-cols-5 gap-4 mb-12">
            {flow.steps.map((step, index) => (
              <div
                key={index}
                className="text-center group"
                style={{
                  opacity: flowSection.isVisible ? 1 : 0,
                  transform: flowSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
                  transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s`,
                }}
              >
                <div className="relative">
                  <div className={`h-14 w-14 mx-auto mb-4 ${colors.primary} ${colors.primaryHover} group-hover:scale-110 flex items-center justify-center text-white font-bold text-lg transition-all duration-300`}>
                    {index + 1}
                  </div>
                  {index < flow.steps.length - 1 && (
                    <ChevronRight className="absolute top-5 -right-2 h-5 w-5 text-gray-400" />
                  )}
                </div>
                <p className={`text-xs font-medium ${colors.text} tracking-wide`}>STEP {index + 1}</p>
                <p className="text-sm text-gray-700 mt-1">{step}</p>
              </div>
            ))}
          </div>

          {/* Mobile/Tablet: vertical list with icon left, text right */}
          <div className="lg:hidden flex flex-col items-center gap-6 mb-12">
            {flow.steps.map((step, index) => (
              <div key={index} className="flex flex-col items-center">
                {/* ステップアイテム */}
                <div
                  className="flex items-center gap-4 group"
                  style={{
                    opacity: flowSection.isVisible ? 1 : 0,
                    transform: flowSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
                    transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.1 + index * 0.1}s`,
                  }}
                >
                  {/* 番号アイコン */}
                  <div className={`flex-shrink-0 h-12 w-12 ${colors.primary} ${colors.primaryHover} group-hover:scale-110 flex items-center justify-center text-white font-bold text-lg transition-all duration-300`}>
                    {index + 1}
                  </div>
                  {/* テキスト群 */}
                  <div className="min-w-[200px]">
                    <p className={`text-xs font-medium ${colors.text} tracking-wide`}>STEP {index + 1}</p>
                    <p className="text-sm text-gray-700 mt-1">{step}</p>
                  </div>
                </div>
                {/* 下向き矢印（ステップ間の真ん中に配置） */}
                {index < flow.steps.length - 1 && (
                  <div className="flex justify-center w-12 mt-6">
                    <ChevronDown className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div
            className="bg-white shadow-sm border border-gray-100 p-10 mid:p-[88px]"
            style={{
              opacity: flowSection.isVisible ? 1 : 0,
              transform: flowSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.5s',
            }}
          >
            <h3 className={`text-xl font-bold ${colors.text} mb-4`}>{flow.conclusionTitle}</h3>
            <p className="text-gray-600 leading-relaxed">
              {flow.conclusionText}
            </p>
          </div>
        </section>

        {/* Additional CTA Section (if provided) */}
        {additionalCTA && (
          <section className="mb-16">
            <div className="flex flex-col mid:flex-row gap-3 mid:gap-4 justify-center items-stretch mid:items-center">
              <Link
                href={additionalCTA.documentHref}
                className={`px-8 py-4 bg-white ${colors.text} font-medium border ${colors.border} hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                資料をダウンロード
              </Link>
              <Link
                href={getInquiryHref(additionalCTA.inquiryHref)}
                className={`px-8 py-4 ${colors.primary} text-white font-medium ${colors.primaryHover} transition-colors duration-200 flex items-center justify-center gap-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
                無料相談を予約する
              </Link>
            </div>
          </section>
        )}

        {/* Overview Table */}
        <section
          ref={overviewSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
        >
          <div
            className="mb-12 pt-16 relative"
            style={{
              opacity: overviewSection.isVisible ? 1 : 0,
              transform: overviewSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Overview</span>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{overviewTable.title}</h2>
            </div>
          </div>
          <div
            className="border border-gray-200 overflow-hidden"
            style={{
              opacity: overviewSection.isVisible ? 1 : 0,
              transform: overviewSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            <table className="w-full">
              <tbody>
                {overviewTable.rows.map(([label, value], index) => (
                  <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                    <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 border-r border-gray-200 w-1/3 text-sm">
                      {label}
                    </td>
                    <td className="px-4 sm:px-6 py-4 text-gray-600 text-sm">
                      {value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* FAQ Section */}
        <section
          ref={faqSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
        >
          <div
            className="mb-12 pt-16 relative"
            style={{
              opacity: faqSection.isVisible ? 1 : 0,
              transform: faqSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Faq</span>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{faq.title}</h2>
            </div>
          </div>
          <div className="space-y-3">
            {faq.items.map((item, index) => (
              <div
                key={index}
                className={`bg-white border border-gray-200 hover:${colors.borderLight} transition-colors duration-300`}
                style={{
                  opacity: faqSection.isVisible ? 1 : 0,
                  transform: faqSection.isVisible ? 'translateY(0)' : 'translateY(20px)',
                  transition: `opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 + index * 0.05}s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) ${0.05 + index * 0.05}s, border-color 0.3s ease`,
                }}
              >
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-5 text-left flex items-center gap-4 justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className={`w-8 h-8 ${colors.primary} text-white font-bold text-sm flex items-center justify-center flex-shrink-0`}>Q</span>
                    <span className="font-medium text-gray-900 text-sm">{item.question}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform duration-300 flex-shrink-0 ${openFaqs.has(index) ? 'rotate-180' : ''}`} />
                </button>
                <div
                  className={`overflow-hidden transition-all duration-300 ${openFaqs.has(index) ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                >
                  <div className="px-6 pb-5 text-gray-600">
                    <div className="flex items-start gap-4 pt-4 border-t border-gray-100">
                      <span className="w-8 h-8 bg-gray-200 text-gray-600 font-bold text-sm flex items-center justify-center flex-shrink-0">A</span>
                      <p className="text-sm leading-relaxed pt-1">{item.answer}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section
          ref={finalCtaSection.ref as React.RefObject<HTMLElement>}
          className="-mx-4 sm:-mx-6 lg:-mx-8 mb-16"
          style={{
            opacity: finalCtaSection.isVisible ? 1 : 0,
            transform: finalCtaSection.isVisible ? 'translateY(0)' : 'translateY(40px)',
            transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
          }}
        >
          <div className="bg-gray-50 py-16 lg:py-20 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* 背景の大きなテキスト */}
            <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[120px] md:text-[180px] font-bold text-gray-100 select-none pointer-events-none tracking-tight whitespace-nowrap">Contact</span>

            <div className="max-w-2xl mx-auto text-center relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-gray-900">{finalCTA.title}</h2>
              <p className="text-gray-600 mb-10 leading-relaxed">
                {finalCTA.description}
              </p>
              <div className="flex flex-col mid:flex-row gap-3 mid:gap-4 justify-center items-stretch mid:items-center">
                <Link
                  href={finalCTA.documentHref}
                  className={`px-8 py-4 bg-white font-medium border ${colors.border} ${colors.text} hover:bg-gray-50 transition-colors duration-200 flex items-center justify-center gap-2`}
                >
                  <Download className="w-5 h-5" />
                  資料をダウンロード
                </Link>
                <Link
                  href={getInquiryHref(finalCTA.inquiryHref)}
                  className={`px-8 py-4 ${colors.primary} text-white font-medium ${colors.primaryHover} transition-colors duration-200 flex items-center justify-center gap-2`}
                >
                  <MessageCircle className="w-5 h-5" />
                  無料相談を予約する
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Other Training Programs Section */}
        <section
          ref={otherProgramsSection.ref as React.RefObject<HTMLElement>}
          className="mb-16"
        >
          <div
            className="mb-12 pt-16 relative"
            style={{
              opacity: otherProgramsSection.isVisible ? 1 : 0,
              transform: otherProgramsSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)',
            }}
          >
            <span className="absolute bottom-0 left-0 text-7xl md:text-8xl font-bold text-gray-100 select-none pointer-events-none tracking-tight leading-none">Others</span>
            <div className="relative z-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900">{otherTrainingPrograms.title}</h2>
            </div>
          </div>

          {/* Mobile/Tablet: Tab UI (899px以下) */}
          <div
            className="lg:hidden mb-6"
            style={{
              opacity: otherProgramsSection.isVisible ? 1 : 0,
              transform: otherProgramsSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            <div className="overflow-x-auto scrollbar-hide -mx-4 sm:-mx-6">
              <div className="flex px-4 sm:px-6 border-b border-gray-200">
                {filteredPrograms.map((program) => {
                  const isActive = selectedProgramId === program.id
                  const isIndividual = program.category === 'individual'
                  return (
                    <button
                      key={program.id}
                      onClick={() => setSelectedProgramId(program.id)}
                      className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
                        isActive
                          ? 'text-gray-900'
                          : 'text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      {program.title}
                      {isActive && (
                        <span className={`absolute bottom-0 left-0 right-0 h-0.5 ${isIndividual ? 'bg-emerald-600' : 'bg-blue-600'}`} />
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Desktop: Navigation + Card Layout (900px以上) */}
          <div
            className="hidden lg:grid lg:grid-cols-[200px_1fr] gap-12"
            style={{
              opacity: otherProgramsSection.isVisible ? 1 : 0,
              transform: otherProgramsSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
              transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.1s',
            }}
          >
            {/* Left Navigation */}
            <nav className="flex flex-col gap-4">
              {filteredPrograms.map((program) => {
                const isActive = selectedProgramId === program.id
                const isIndividual = program.category === 'individual'
                return (
                  <button
                    key={program.id}
                    onClick={() => setSelectedProgramId(program.id)}
                    className={`group flex items-center gap-3 text-base transition-colors duration-200 whitespace-nowrap ${
                      isActive
                        ? isIndividual ? 'text-emerald-600 font-medium' : 'text-blue-600 font-medium'
                        : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full flex-shrink-0 transition-colors duration-200 ${
                        isActive
                          ? isIndividual ? 'bg-emerald-600' : 'bg-blue-600'
                          : 'bg-gray-300 group-hover:bg-gray-400'
                      }`}
                    />
                    <span>{program.title}</span>
                  </button>
                )
              })}
            </nav>

            {/* Right: Card Content (Desktop) */}
            {selectedProgram && (
              <article className="min-w-0">
                {/* Image Area - 21:9 aspect ratio */}
                <div className="relative overflow-hidden mb-8">
                  <div className="relative aspect-[21/9]">
                    <Image
                      src={selectedProgram.image}
                      alt={selectedProgram.title}
                      fill
                      className="object-cover"
                      sizes="75vw"
                    />
                  </div>
                </div>

                {/* Content Area - Two Columns */}
                <div className="grid grid-cols-2 gap-12">
                  {/* Left Column - Title, Link */}
                  <div>
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                      {selectedProgram.title}
                    </h3>
                    <Link
                      href={selectedProgram.href}
                      className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-medium transition-colors duration-200 text-base border ${
                        selectedProgram.category === 'individual'
                          ? 'text-emerald-600 border-emerald-600 hover:bg-emerald-50'
                          : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      カリキュラムを見る
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Right Column - Description */}
                  <div>
                    <p className="text-gray-600 text-base leading-loose font-medium">
                      {selectedProgram.description}
                    </p>
                  </div>
                </div>
              </article>
            )}
          </div>

          {/* Mobile/Tablet: Card Content (899px以下) */}
          {selectedProgram && (
            <article
              className="lg:hidden"
              style={{
                opacity: otherProgramsSection.isVisible ? 1 : 0,
                transform: otherProgramsSection.isVisible ? 'translateY(0)' : 'translateY(30px)',
                transition: 'opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s, transform 0.8s cubic-bezier(0.16, 1, 0.3, 1) 0.2s',
              }}
            >
              <div className="min-w-0">
                {/* Image Area - 21:9 aspect ratio */}
                <div className="relative overflow-hidden mb-8">
                  <div className="relative aspect-[21/9]">
                    <Image
                      src={selectedProgram.image}
                      alt={selectedProgram.title}
                      fill
                      className="object-cover"
                      sizes="(max-width: 1024px) 100vw, 75vw"
                    />
                  </div>
                </div>

                {/* Content Area - Two Columns */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
                  {/* Left Column - Title, Link */}
                  <div>
                    {/* Title */}
                    <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
                      {selectedProgram.title}
                    </h3>

                    {/* View Detail Link */}
                    <Link
                      href={selectedProgram.href}
                      className={`inline-flex items-center justify-center gap-2 px-8 py-4 bg-white font-medium transition-colors duration-200 text-base border ${
                        selectedProgram.category === 'individual'
                          ? 'text-emerald-600 border-emerald-600 hover:bg-emerald-50'
                          : 'text-blue-600 border-blue-600 hover:bg-blue-50'
                      }`}
                    >
                      カリキュラムを見る
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>

                  {/* Right Column - Description */}
                  <div>
                    <p className="text-gray-600 text-base leading-loose font-medium">
                      {selectedProgram.description}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          )}
        </section>
      </div>
    </>
  )
}