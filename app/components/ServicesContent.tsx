'use client'

import { ArrowRight, Building2, Users, Pen, Video, Code, Briefcase, User, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function ServicesContent() {
  const corporateServices = [
    {
      id: 'corporate-training',
      title: '生成AI活用研修',
      description: '生成AIの基礎から実践まで、企業の現場で即戦力として活躍できる人材を育成する包括的な研修プログラムです。',
      icon: Building2,
      href: '/services/comprehensive-ai-training',
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center',
      features: ['基礎から実践まで体系的学習', '企業課題に特化したカスタマイズ', '実務直結のワークショップ'],
      duration: '90分 × 3回',
      level: '未経験〜実務レベル',
      available: true
    },
    {
      id: 'ai-writing',
      title: 'AIライティング研修',
      description: 'ChatGPTやClaude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。',
      icon: Pen,
      href: '/services/ai-writing-training',
      image: 'https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop&crop=center',
      features: ['プロンプトエンジニアリング技術', 'ビジネス文書作成ノウハウ', '校正・編集の自動化手法'],
      duration: '90分 × 4回',
      level: '初級〜中級',
      available: true
    },
    {
      id: 'ai-video',
      title: 'AI動画生成研修',
      description: '最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。',
      icon: Video,
      href: '/services/ai-video-training',
      image: 'https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center',
      features: ['動画生成AIツールの活用法', 'ストーリーテリング技術', 'マーケティング動画制作'],
      duration: '90分 × 4回',
      level: '初級〜中級',
      available: true
    },
    {
      id: 'ai-coding',
      title: 'AIコーディング研修',
      description: 'GitHub Copilot、Claude Codeなどを活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。',
      icon: Code,
      href: '/services/ai-coding-training',
      image: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center',
      features: ['AI支援コーディング技術', 'ペアプログラミング手法', 'コード品質向上テクニック'],
      duration: '90分 × 6回',
      level: '中級〜上級',
      available: true
    },
    {
      id: 'practical-ai',
      title: '生成AI実務活用研修',
      description: '日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。',
      icon: Briefcase,
      href: '/services/practical-ai-training',
      image: 'https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&crop=center',
      features: ['業務フロー最適化', 'チーム連携強化', 'ROI測定手法'],
      duration: '90分 × 4回',
      level: '初級〜中級',
      available: true
    }
  ]

  const consumerServices = [
    {
      id: 'individual-coaching',
      title: 'AI人材育成所',
      description: '個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。',
      icon: User,
      href: '/services/ai-talent-development',
      image: 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center',
      features: ['個別指導プログラム', 'キャリアサポート', 'スキル認定制度'],
      duration: '3-6ヶ月',
      level: '全レベル対応',
      available: true
    }
  ]

  return (
    <div className="w-full">
      {/* SEO用のh1 */}
      <h1 className="sr-only">LandBridge サービス一覧 - AI研修・教育プログラム</h1>
      
      {/* Hero Section */}
      <section className="mb-8">
        <div className="mb-12">
          <h2 className="text-[28px] font-bold text-gray-900 mb-4">サービス一覧</h2>
          <p className="text-xl text-gray-600 max-w-3xl">
            企業向けから個人向けまで、多様なAI研修・教育プログラムをご提供しています。
            <br />貴社・個人のニーズに合わせて最適なプログラムをお選びいただけます。
          </p>
        </div>
      </section>

      {/* Corporate Services (toB) */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-portfolio-blue/10 rounded-lg flex items-center justify-center">
            <Building2 className="h-6 w-6 text-portfolio-blue" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">企業向けサービス</h3>
            <p className="text-gray-600">法人・組織向けのAI研修プログラム</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {corporateServices.map((service) => (
            <div key={service.id} className={`group rounded-xl overflow-hidden ${service.available ? '' : 'cursor-not-allowed'}`}>
              {service.available ? (
                <Link href={service.href} className="block h-full">
                  <div className="relative h-full min-h-[32rem] overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-blue-600 transition-colors">
                        {service.title}
                      </h4>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">研修時間:</span>
                          <span className="text-gray-700 font-medium">{service.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">対象レベル:</span>
                          <span className="text-gray-700 font-medium">{service.level}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6 flex-1">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 bg-blue-600 rounded-full flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-blue-600 text-sm font-medium">
                        詳しく見る
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative h-full min-h-[32rem] overflow-hidden rounded-xl bg-gray-50 border border-gray-200 opacity-75">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-600/40 to-transparent" />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">
                      {service.title}
                    </h4>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">研修時間:</span>
                        <span className="text-gray-500">{service.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">対象レベル:</span>
                        <span className="text-gray-500">{service.level}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6 flex-1">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                          <span className="text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      準備中
                      <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 text-gray-500 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 my-16"></div>

      {/* Consumer Services (toC) */}
      <section className="mb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-10 w-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Users className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-gray-900">個人向けサービス</h3>
            <p className="text-gray-600">個人のキャリアアップ向けAI教育プログラム</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {consumerServices.map((service) => (
            <div key={service.id} className={`group rounded-xl overflow-hidden ${service.available ? '' : 'cursor-not-allowed'}`}>
              {service.available ? (
                <Link href={service.href} className="block h-full">
                  <div className="relative h-full min-h-[32rem] overflow-hidden rounded-xl bg-white border border-gray-200 hover:shadow-xl transition-all duration-300">
                    <div className="relative h-48 overflow-hidden">
                      <Image
                        src={service.image}
                        alt={service.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover object-center transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                    
                    <div className="p-6 flex flex-col flex-1">
                      <h4 className="text-xl font-semibold text-gray-900 mb-3 group-hover:text-green-600 transition-colors">
                        {service.title}
                      </h4>
                      
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {service.description}
                      </p>
                      
                      <div className="space-y-3 mb-4">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">プログラム期間:</span>
                          <span className="text-gray-700 font-medium">{service.duration}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">対象レベル:</span>
                          <span className="text-gray-700 font-medium">{service.level}</span>
                        </div>
                      </div>
                      
                      <div className="space-y-2 mb-6 flex-1">
                        {service.features.map((feature, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <div className="h-1.5 w-1.5 bg-green-600 rounded-full flex-shrink-0" />
                            <span className="text-gray-600">{feature}</span>
                          </div>
                        ))}
                      </div>
                      
                      <div className="flex items-center text-green-600 text-sm font-medium">
                        詳しく見る
                        <ArrowRight className="ml-2 size-4 transition-transform group-hover:translate-x-1" />
                      </div>
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="relative h-full min-h-[32rem] overflow-hidden rounded-xl bg-gray-50 border border-gray-200 opacity-75">
                  <div className="relative h-48 overflow-hidden">
                    <Image
                      src={service.image}
                      alt={service.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900/80 via-gray-600/40 to-transparent" />
                  </div>
                  
                  <div className="p-6 flex flex-col flex-1">
                    <h4 className="text-xl font-semibold text-gray-700 mb-3">
                      {service.title}
                    </h4>
                    
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">
                      {service.description}
                    </p>
                    
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">プログラム期間:</span>
                        <span className="text-gray-500">{service.duration}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-500">対象レベル:</span>
                        <span className="text-gray-500">{service.level}</span>
                      </div>
                    </div>
                    
                    <div className="space-y-2 mb-6 flex-1">
                      {service.features.map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-sm">
                          <div className="h-1.5 w-1.5 bg-gray-400 rounded-full flex-shrink-0" />
                          <span className="text-gray-500">{feature}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="flex items-center text-gray-400 text-sm">
                      準備中
                      <span className="ml-2 inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-200 text-gray-500 rounded-full">
                        Coming Soon
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-900 py-16 lg:py-20 rounded-xl text-center border border-blue-100">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">お気軽にご相談ください</h2>
          <p className="text-xl mb-8 text-gray-600">
            貴社に最適なAI研修プランをご提案いたします
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact?source=services_inquiry"
              className="group relative overflow-hidden px-8 py-4 bg-blue-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              <svg className="w-5 h-5 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-10 5L2 7"/>
              </svg>
              <span className="relative z-10">無料相談予約</span>
            </Link>
            <Link
              href="/contact?source=services_material"
              className="group px-8 py-4 bg-white/90 backdrop-blur-sm text-gray-900 font-semibold rounded-xl border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center"
            >
              <svg className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="group-hover:text-blue-700 transition-colors duration-200">資料ダウンロード</span>
            </Link>
          </div>
        </div>
      </section>

      {/* スペース */}
      <div className="h-16 lg:h-24" />
    </div>
  )
}