'use client'

import { ArrowRight, Users, Target, Lightbulb, CheckCircle, ChevronRight, Calendar, FileText, Download, MessageCircle, ChevronDown, Wrench, TrendingUp, Settings, AlertCircle, HelpCircle, MessageSquare, Crown, UserCheck, Zap, GraduationCap } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { Column, Project } from '@/app/types'
import { useState } from 'react'
import TargetAudienceCard from './TargetAudienceCard'
import { AITrainingHeroSection } from './ui/ai-training-hero-section'
import { AIServicesCarousel } from './ui/ai-services-carousel'

interface AITrainingLPProps {
  latestColumns: Column[]
  featuredProjects: Project[]
}

export default function AITrainingLP({ latestColumns, featuredProjects }: AITrainingLPProps) {
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

  return (
    <>
      {/* SEO用のh1 */}
      <h1 className="sr-only">AI人材を社内で育てる企業向けAI研修 - LandBridge株式会社</h1>
      
      {/* Hero Section - 画面いっぱい */}
      <div className="-mx-4 sm:-mx-6 lg:-mx-8 -mt-8">
        <AITrainingHeroSection />
      </div>

      {/* Hero CTA Buttons */}
      <section className="py-8">
        <div className="max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact?source=ai_training_hero_inquiry"
              className="group relative overflow-hidden px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center justify-center"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
              <svg className="w-4 h-4 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <rect width="20" height="16" x="2" y="4" rx="2"/>
                <path d="m22 7-10 5L2 7"/>
              </svg>
              <span className="relative z-10">無料相談を予約する</span>
            </Link>
            <Link
              href="/contact?source=ai_training_hero_material"
              className="group px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
            >
              <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                <polyline points="7,10 12,15 17,10"/>
                <line x1="12" y1="15" x2="12" y2="3"/>
              </svg>
              <span className="group-hover:text-blue-700 transition-colors duration-200">研修資料をダウンロード</span>
            </Link>
          </div>
        </div>
      </section>

      <div className="max-w-[1023px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Service Overview Section */}
        <section className="mb-16 mt-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">生成AI総合研修</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            現代のビジネス環境において、AI技術の活用は競争優位を築く重要な要素となっています。
            当研修では、ChatGPTをはじめとする生成AIツールを実際の業務で効果的に活用するためのスキルを、
            体系的かつ実践的に習得していただけます。
          </p>
        </div>
        
        <div className="bg-white p-8 mb-12 rounded">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center flex-1">
              <div className="relative w-full aspect-video mb-4 rounded overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&crop=center"
                  alt="実践重視"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">実践重視</h3>
              <p className="text-gray-600">
                理論だけでなく、実際の業務シーンを想定したワークショップで即戦力として活躍できる人材を確実に育成します
              </p>
            </div>
            
            <div className="text-center flex-1">
              <div className="relative w-full aspect-video mb-4 rounded overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&crop=center"
                  alt="段階的学習"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">段階的学習</h3>
              <p className="text-gray-600">
                未経験者からでもステップバイステップで確実にスキルアップできる体系的なカリキュラムを提供いたします
              </p>
            </div>
            
            <div className="text-center flex-1">
              <div className="relative w-full aspect-video mb-4 rounded overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop&crop=center"
                  alt="企業カスタマイズ"
                  fill
                  className="object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-3 pb-2 border-b border-gray-300">企業カスタマイズ</h3>
              <p className="text-gray-600">
                貴社の業務内容や特有の課題に合わせてカリキュラムを柔軟にカスタマイズし最適化いたします
              </p>
            </div>
          </div>
        </div>

        {/* Target Audience Subsection */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-8 text-center">こんな方におすすめです</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[
            { 
              name: "管理職・リーダー",
              subtitle: "部門長・DX推進責任者",
              description: "AI活用戦略を策定し組織のDX推進を主導。経営視点でAI導入の投資対効果を判断します。",
              rating: 5,
              icon: Crown
            },
            { 
              name: "中堅社員",
              subtitle: "チームリーダー・生産性向上担当",
              description: "業務効率化を推進しチーム生産性向上をリード。現場で実践経験を積む方に最適です。",
              rating: 4,
              icon: UserCheck
            },
            { 
              name: "若手社員",
              subtitle: "キャリア1-3年目・スキルアップ志向",
              description: "AIの基礎スキルを習得し効率的な業務遂行を実現。キャリアアップを目指す方向けです。",
              rating: 4,
              icon: Zap
            },
            { 
              name: "内定者・新入社員",
              subtitle: "これから社会人・早期戦力化希望",
              description: "入社前からAIリテラシーを身につけ即戦力で活躍。社会人への移行に最適です。",
              rating: 3,
              icon: GraduationCap
            }
          ].map((item, index) => (
            <TargetAudienceCard
              key={index}
              name={item.name}
              subtitle={item.subtitle}
              description={item.description}
              rating={item.rating}
              icon={item.icon}
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">導入で得られる変化</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            AI研修の導入前後で、組織とメンバーにどのような変化が生まれるのかを具体的にご紹介します
          </p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-gray-100 p-8 rounded-lg border border-gray-300">
            <h3 className="text-xl font-semibold text-gray-700 mb-6 text-center flex items-center justify-center gap-2">
              <AlertCircle className="h-6 w-6" />
              導入前の課題
            </h3>
            <div className="space-y-5">
              {[
                {
                  category: "認識面",
                  issue: "AIは自分の業務に関係ないものだと思い込んでいる"
                },
                {
                  category: "スキル面", 
                  issue: "ChatGPTの存在は知っているが効果的な使い方がわからない"
                },
                {
                  category: "心理面",
                  issue: "AI活用に対する漠然とした不安や抵抗感を持っている"
                },
                {
                  category: "組織面",
                  issue: "部署ごとにバラバラな取り組みで統一性がない"
                },
                {
                  category: "生産性",
                  issue: "従来の作業方法から脱却できず効率化が進まない"
                },
                {
                  category: "競争力",
                  issue: "AI活用が進む他社との差が徐々に広がってしまう"
                }
              ].map((item, index) => (
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
              {[
                {
                  category: "実践スキル",
                  achievement: "業務シーンに応じて適切なAIツールを選択・活用できる"
                },
                {
                  category: "組織文化",
                  achievement: "部署横断でAI活用のノウハウ共有文化が根付く"
                },
                {
                  category: "自信向上",
                  achievement: "AI技術に対する理解が深まり自信を持って活用できる"
                },
                {
                  category: "DX基盤",
                  achievement: "全社的なデジタル変革推進の強固な基盤が構築される"
                },
                {
                  category: "生産性向上",
                  achievement: "日常業務の効率化により創造的な業務に時間を投下できる"
                },
                {
                  category: "競争優位",
                  achievement: "AI活用による差別化で市場における競争力を獲得する"
                }
              ].map((item, index) => (
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
              研修内容について詳しく知りたい方へ
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              貴社の課題に合わせたカスタマイズ可能な研修プログラムの詳細をご案内いたします
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact?source=ai_training_mid_inquiry"
                className="group relative overflow-hidden px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 hover:bg-blue-700 transform hover:-translate-y-1 flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-out"></div>
                <svg className="w-4 h-4 mr-2 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <rect width="20" height="16" x="2" y="4" rx="2"/>
                  <path d="m22 7-10 5L2 7"/>
                </svg>
                <span className="relative z-10">無料相談を予約する</span>
              </Link>
              <Link
                href="/contact?source=ai_training_mid_material"
                className="group px-6 py-3 bg-white text-gray-900 font-semibold rounded-lg border-2 border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-300 flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                  <polyline points="7,10 12,15 17,10"/>
                  <line x1="12" y1="15" x2="12" y2="3"/>
                </svg>
                <span className="group-hover:text-blue-700 transition-colors duration-200">研修資料をダウンロード</span>
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">研修内容（カリキュラム例）</h2>
        </div>
        <div className="space-y-6">
          {[
            {
              title: "AI基礎理解",
              description: "生成AIの基本的な仕組みから最新トレンド、具体的な活用事例、セキュリティリスクと対策まで、AIを業務活用するために必要な基礎知識を体系的に習得し組織全体での活用基盤を構築します",
              image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop"
            },
            {
              title: "生成AI活用実践",
              description: "ChatGPT、Claude、Gemini等の主要な生成AIツールを使った効果的なプロンプト設計技術と実際の業務シーンでの活用テクニックを実践的に学習し即座に現場で応用できるスキルを身につけます",
              image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop"
            },
            {
              title: "業務適用ワーク",
              description: "貴社の実際の業務プロセスや課題を具体的な題材として活用し、AI導入によるワークフロー改善シナリオを設計・検証します。現場での実装方法から運用体制まで実践的な導入プランを策定します",
              image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop"
            },
            {
              title: "AIコーディング",
              description: "Claude code、ChatGPT等を活用したバイブコーディング手法により、従来の開発プロセスを革新し開発効率を飛躍的に向上させる最新技術を習得。実践的なコーディング体験を通じて学習します",
              image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
            }
          ].map((module, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 overflow-hidden border border-gray-200">
              <div className="flex">
                <div className="relative w-48 flex-shrink-0">
                  <Image
                    src={module.image}
                    alt={module.title}
                    width={192}
                    height={160}
                    className="object-cover w-full h-40"
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
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">研修導入までの流れ</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            お問い合わせから研修実施、効果測定まで、貴社のニーズに合わせて丁寧にサポートいたします
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 lg:gap-4 mb-12">
          {[
            "お問い合わせ・ご相談",
            "ヒアリングとご提案",
            "カリキュラム調整",
            "研修実施",
            "振り返り・効果共有"
          ].map((step, index) => (
            <div key={index} className="text-center">
              <div className="relative">
                <div className="h-16 w-16 mx-auto mb-4 bg-portfolio-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                  {index + 1}
                </div>
                {index < 4 && (
                  <ChevronRight className="hidden lg:block absolute top-6 -right-2 h-6 w-6 text-gray-400" />
                )}
              </div>
              <p className="text-sm font-medium text-gray-700">STEP{index + 1}</p>
              <p className="text-sm text-gray-600 mt-1">{step}</p>
            </div>
          ))}
        </div>
        
        <div className="bg-gray-50 p-8 lg:p-12 rounded-lg">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">研修導入をご検討の皆さまへ</h3>
          <div className="max-w-2xl mx-auto text-center">
            <p className="text-lg text-gray-700 leading-relaxed">
              AIは話題で終わらせる時代ではありません。貴社の業務に根ざした実践型研修で、現場に&ldquo;使えるAI&rdquo;を届けます。LandBridgeは、現場にフィットしたAI教育設計を支援します。
            </p>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 my-16"></div>

      {/* Overview Table */}
      <section className="mb-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">開催概要</h2>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <tbody>
                {[
                  ["対象者", "未経験〜実務レベルの全社員"],
                  ["受講形式", "オンライン or 対面（社内実施可）"],
                  ["受講内容", "要相談（受講者のレベルなどに合わせてカスタマイズ可）"],
                  ["時間", "1回90分 × 最大3回"],
                  ["費用", "要相談（内容・人数により変動）"],
                  ["対応言語", "日本語（英語対応可）"]
                ].map(([label, value], index) => (
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
          <h2 className="text-3xl font-bold text-gray-900 mb-4">よくあるご質問</h2>
        </div>
        <div className="space-y-4">
          {[
            {
              q: "未経験の社員でも受講できますか？",
              a: "はい。AIの基礎から実務レベルまでカバーしています。専門知識がない方でも段階的に学習できるカリキュラムを提供しています。"
            },
            {
              q: "他の部署にも展開できますか？",
              a: "社内展開向けのスケーラブルな設計が可能です。部署ごとの特性に合わせたカスタマイズも承ります。"
            },
            {
              q: "自社業務に即した内容にできますか？",
              a: "事前ヒアリングに基づき、業務シナリオに合わせて調整します。実際の業務フローにAIを組み込む具体的な手法をお教えします。"
            },
            {
              q: "研修時間はどの程度必要ですか？",
              a: "標準では1回90分×3回構成ですが、受講者のレベルや要望に応じて柔軟に調整可能です。短時間集中型から長期継続型まで対応いたします。"
            },
            {
              q: "研修後のフォローアップはありますか？",
              a: "研修終了後も質問対応や追加相談を承ります。継続的なAI活用推進のためのサポート体制も構築可能です。"
            }
          ].map((faq, index) => (
            <div key={index} className="bg-white border border-gray-200 rounded-lg">
              <button
                onClick={() => toggleFaq(index)}
                className="w-full px-6 py-4 text-left flex items-center gap-3 justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="h-5 w-5 bg-gray-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                    Q
                  </div>
                  <span className="font-semibold text-gray-900">{faq.q}</span>
                </div>
                <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${openFaqs.has(index) ? 'rotate-180' : ''}`} />
              </button>
              {openFaqs.has(index) && (
                <div className="px-6 pt-4 pb-4 text-gray-700">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 bg-portfolio-blue text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                      A
                    </div>
                    <span>{faq.a}</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Divider */}
      <div className="border-t border-gray-200 my-16"></div>

      {/* Other Training Programs Section */}
      <section className="mb-16">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">その他の研修プログラム</h2>
        </div>
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <AIServicesCarousel 
            showHeader={false}
            sectionPadding=""
            items={[
              {
                id: "ai-writing",
                title: "AIライティング研修",
                description: "ChatGPTやClaude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。",
                href: "/services",
                image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop&crop=center",
                available: false,
                category: "enterprise"
              },
              {
                id: "ai-video",
                title: "AI動画生成研修",
                description: "最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。",
                href: "/services",
                image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center",
                available: false,
                category: "enterprise"
              },
              {
                id: "ai-coding",
                title: "AIコーディング研修",
                description: "GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。",
                href: "/services",
                image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center",
                available: false,
                category: "enterprise"
              },
              {
                id: "practical-ai",
                title: "生成AI実務活用研修",
                description: "日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。",
                href: "/services",
                image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&crop=center",
                available: false,
                category: "enterprise"
              },
              {
                id: "individual-coaching",
                title: "AI人材育成所",
                description: "個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。",
                href: "/services",
                image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
                available: false,
                category: "individual"
              }
            ]}
          />
        </div>
      </section>


      {/* Divider */}
      <div className="border-t border-gray-200 my-16"></div>

      {/* Final CTA Section */}
      <section className="bg-gradient-to-r from-blue-50 to-indigo-50 text-gray-900 py-16 lg:py-20 rounded-xl text-center border border-blue-100">
        <div className="max-w-2xl mx-auto px-6">
          <h2 className="text-3xl font-bold mb-6 text-gray-900">まずはご相談・資料ダウンロードから</h2>
          <p className="text-xl mb-8 text-gray-600">
            貴社に最適なAI研修プランをご提案いたします
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/contact?source=ai_lp_inquiry"
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
              href="/contact?source=ai_lp_material"
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
    </>
  )
}