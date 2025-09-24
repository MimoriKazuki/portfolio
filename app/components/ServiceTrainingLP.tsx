'use client'

import { ArrowRight, Users, Target, Lightbulb, CheckCircle, ChevronRight, Calendar, FileText, Download, MessageCircle, ChevronDown, LucideIcon, Crown, UserCheck, Zap, GraduationCap, TrendingUp, Settings, AlertCircle, HelpCircle, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Column, Project } from '@/app/types'
import { useState } from 'react'
import TargetAudienceCard from './TargetAudienceCard'
import { AITrainingHeroSection } from './ui/ai-training-hero-section'
import { AIServicesCarousel } from './ui/ai-services-carousel'

// Service Overview Item Interface
interface ServiceOverviewItem {
  title: string
  description: string
  image: string
}

// Target Audience Interface
interface TargetAudience {
  name: string
  subtitle: string
  description: string
  rating: number
  iconName: string
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
}

export default function ServiceTrainingLP({
  pageTitle,
  heroTitle,
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
  featuredProjects = []
}: ServiceTrainingLPProps) {
  const [openFaqs, setOpenFaqs] = useState<Set<number>>(new Set())

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

  return (
    <>
      {/* SEO用のh1 */}
      <h1 className="sr-only">{seoTitle}</h1>
      
      {/* Hero Section - 画面いっぱい */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        <div className="h-[360px] relative overflow-hidden w-full">
          <Image
            src={heroImage}
            alt={heroTitle}
            fill
            sizes="100vw"
            className="object-cover object-center"
            priority
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10 flex items-center justify-center h-full">
            <h1 className="text-4xl md:text-5xl text-white tracking-tight">
              {heroTitle}
            </h1>
          </div>
        </div>
      </div>

      {/* Hero CTA Buttons */}
      <section className="py-8">
        <div className="max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href={heroCTA.inquiryHref}
              className="group relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-10 5L2 7"/>
              </svg>
              <span className="relative z-10">無料相談を予約する</span>
            </Link>
            <Link
              href={heroCTA.documentHref}
              className="group px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="group-hover:text-blue-700 transition-colors duration-200">資料をダウンロード</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Overview Section */}
        <section className="mb-16 mt-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{serviceOverview.title}</h2>
            {serviceOverview.subtitle && (
              <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                {serviceOverview.subtitle}
              </p>
            )}
          </div>
          
          <div className="bg-white p-8 mb-12 rounded">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {serviceOverview.items.map((item, index) => (
                <div key={index} className="text-center flex-1">
                  <div className="relative w-full aspect-video mb-4 rounded overflow-hidden">
                    <Image
                      src={item.image}
                      alt={item.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Target Audience Subsection */}
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">{targetAudience.title}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {targetAudience.audiences.map((audience, index) => (
                <TargetAudienceCard
                  key={index}
                  name={audience.name}
                  subtitle={audience.subtitle}
                  description={audience.description}
                  rating={audience.rating}
                  icon={getIconComponent(audience.iconName)}
                />
              ))}
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Before/After Section */}
        <section className="mb-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{expectedChanges.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {expectedChanges.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="bg-gray-100 p-8 rounded-lg border border-gray-300">
              <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center flex items-center justify-center gap-2">
                <AlertCircle className="h-6 w-6" />
                導入前の課題
              </h3>
              <div className="space-y-5">
                {expectedChanges.beforeItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-gray-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-gray-600 block">{item.category}</span>
                      <span className="text-gray-700">{item.issue}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-portfolio-blue-light/10 p-8 rounded-lg border border-portfolio-blue-light">
              <h3 className="text-xl font-semibold text-portfolio-blue mb-6 text-center flex items-center justify-center gap-2">
                <CheckCircle className="h-6 w-6" />
                導入後の成果
              </h3>
              <div className="space-y-5">
                {expectedChanges.afterItems.map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <span className="text-sm font-medium text-portfolio-blue block">{item.category}</span>
                      <span className="text-gray-700">{item.achievement}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Mid CTA Section */}
        <section className="mb-16">
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-8 lg:p-12 rounded-xl border border-blue-100">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                {midCTA.title}
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                {midCTA.description}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href={midCTA.inquiryHref}
                  className="group relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                  <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <rect width="20" height="16" x="2" y="4" rx="2"/>
                    <path d="m22 7-10 5L2 7"/>
                  </svg>
                  <span className="relative z-10">無料相談を予約する</span>
                </Link>
                <Link
                  href={midCTA.documentHref}
                  className="group px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center"
                >
                  <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                    <polyline points="7,10 12,15 17,10"/>
                    <line x1="12" y1="15" x2="12" y2="3"/>
                  </svg>
                  <span className="group-hover:text-blue-700 transition-colors duration-200">資料をダウンロード</span>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Curriculum Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{curriculum.title}</h2>
          </div>
          <div className="space-y-6">
            {curriculum.modules.map((module, index) => (
              <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
                <div className="flex flex-col md:flex-row">
                  <div className="relative w-full md:w-48 md:flex-shrink-0 overflow-hidden">
                    <Image
                      src={module.image}
                      alt={module.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 192px"
                      className="object-cover w-full h-48 md:h-40"
                    />
                  </div>
                  <div className="flex-1 p-6 flex flex-col justify-center">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{module.title}</h3>
                    <p className="text-gray-700">{module.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Flow Section */}
        <section className="mb-0">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{flow.title}</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {flow.subtitle}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 mb-12">
            {flow.steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="relative">
                  <div className="h-16 w-16 mx-auto mb-4 bg-portfolio-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {index + 1}
                  </div>
                  {index < flow.steps.length - 1 && (
                    <ChevronRight className="hidden lg:block absolute top-6 -right-2 h-6 w-6 text-gray-400" />
                  )}
                </div>
                <p className="text-sm font-medium text-gray-700">STEP{index + 1}</p>
                <p className="text-sm text-gray-600 mt-1">{step}</p>
              </div>
            ))}
          </div>
          
          <div className="bg-gray-50 p-8 lg:p-12 rounded-lg">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">{flow.conclusionTitle}</h3>
            <div className="max-w-2xl mx-auto text-center">
              <p className="text-lg text-gray-700 leading-relaxed">
                {flow.conclusionText}
              </p>
            </div>
          </div>
        </section>

        {/* Additional CTA Section (if provided) */}
        {additionalCTA && (
          <section className="mt-16 mb-0">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={additionalCTA.inquiryHref}
                className="group relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
                <span className="relative z-10">無料相談を予約する</span>
              </Link>
              <Link
                href={additionalCTA.documentHref}
                className="group px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span className="group-hover:text-blue-700 transition-colors duration-200">資料をダウンロード</span>
              </Link>
            </div>
          </section>
        )}

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Overview Table */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{overviewTable.title}</h2>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <tbody>
                  {overviewTable.rows.map(([label, value], index) => (
                    <tr key={index} className={index % 2 === 0 ? "bg-gray-50" : "bg-white"}>
                      <td className="px-4 sm:px-6 py-4 font-semibold text-gray-900 border-r border-gray-200 w-1/3">
                        {label}
                      </td>
                      <td className="px-4 sm:px-6 py-4 text-gray-700">
                        {value}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* FAQ Section */}
        <section className="mb-16">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">{faq.title}</h2>
          </div>
          <div className="space-y-4">
            {faq.items.map((item, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg">
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full px-6 py-4 text-left flex items-center gap-3 justify-between hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-5 w-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                      Q
                    </div>
                    <span className="font-semibold text-gray-900">{item.question}</span>
                  </div>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openFaqs.has(index) ? 'rotate-180' : ''}`} />
                </button>
                {openFaqs.has(index) && (
                  <div className="px-6 pt-4 pb-4 text-gray-700">
                    <div className="flex items-start gap-3">
                      <div className="h-5 w-5 bg-portfolio-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                        A
                      </div>
                      <span>{item.answer}</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Final CTA Section */}
        <section className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-900 py-16 lg:py-20 rounded-xl text-center border border-blue-100">
          <div className="max-w-2xl mx-auto px-6">
            <h2 className="text-3xl font-bold mb-6 text-gray-900">{finalCTA.title}</h2>
            <p className="text-xl mb-8 text-gray-600">
              {finalCTA.description}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link
                href={finalCTA.inquiryHref}
                className="group relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
                <span className="relative z-10">無料相談を予約する</span>
              </Link>
              <Link
                href={finalCTA.documentHref}
                className="group px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center"
              >
                <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span className="group-hover:text-blue-700 transition-colors duration-200">資料をダウンロード</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Divider */}
        <div className="border-t border-gray-200 my-16"></div>

        {/* Other Training Programs Section */}
        <section className="mb-16">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-8">{otherTrainingPrograms.title}</h2>
          </div>
          <div className="-mx-4 sm:-mx-6 lg:-mx-8">
            <AIServicesCarousel 
              showHeader={false}
              sectionPadding=""
              items={otherTrainingPrograms.programs.filter(program => program.id !== otherTrainingPrograms.currentPageId)}
            />
          </div>
        </section>

        {/* スペース */}
        <div className="h-16 lg:h-24" />
      </div>
    </>
  )
}