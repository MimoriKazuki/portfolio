import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '生成AI活用研修 - LandBridge株式会社',
  description: 'LandBridge株式会社の生成AI活用研修。ChatGPT、Claude等の生成AIツールを活用し、未経験者から実務レベルまで体系的に学習。企業の現場で即戦力として活躍できる人材を育成します。',
  keywords: ['LandBridge', '生成AI活用研修', 'AI研修', '企業研修', 'ChatGPT', 'Claude', '生成AI', 'DX推進', 'AI人材育成', 'ビジネスAI', '社員研修', 'AI活用'],
  openGraph: {
    title: '生成AI活用研修 - LandBridge株式会社',
    description: 'LandBridge株式会社の生成AI活用研修。ChatGPT、Claude等の生成AIツールを活用し、未経験者から実務レベルまで体系的に学習。企業の現場で即戦力として活躍できる人材を育成します。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.landbridge.ai/services/comprehensive-ai-training',
    siteName: 'LandBridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: '生成AI活用研修 - LandBridge株式会社',
    description: 'LandBridge株式会社の生成AI活用研修。ChatGPT、Claude等の生成AIツールを活用し、未経験者から実務レベルまで体系的に学習。企業の現場で即戦力として活躍できる人材を育成します。',
  },
}

export const revalidate = 60 // ISR: 60秒ごとに再生成

async function getProjects() {
  const supabase = createStaticClient()
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching projects:', error)
  }
  
  return projects || []
}

async function getLatestColumns() {
  const supabase = createStaticClient()
  const { data: columns, error } = await supabase
    .from('columns')
    .select('*')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(3)
  
  if (error) {
    console.error('Error fetching columns:', error)
  }
  
  return columns || []
}

export default async function CorporateTrainingPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  // Template data for 生成AI活用研修
  const serviceData = {
    pageTitle: "生成AI活用研修",
    heroTitle: "生成AI活用研修",
    heroImage: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=1920&h=1080&fit=crop&crop=center",
    seoTitle: "AI人材を社内で育てる企業向けAI研修 - LandBridge株式会社",
    
    heroCTA: {
      inquiryText: "お問い合わせ",
      documentText: "資料ダウンロード",
      inquiryHref: "/contact?source=ai_training_hero_inquiry",
      documentHref: "/documents/request/ai-training-overview"
    },
    
    serviceOverview: {
      title: "生成AI活用研修",
      subtitle: "現代のビジネス環境において、AI技術の活用は競争優位を築く重要な要素となっています。当研修では、ChatGPTをはじめとする生成AIツールを実際の業務で効果的に活用するためのスキルを、体系的かつ実践的に習得していただけます。",
      items: [
        {
          title: "実践重視",
          description: "理論だけでなく、実際の業務シーンを想定したワークショップで即戦力として活躍できる人材を確実に育成します",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&crop=center"
        },
        {
          title: "段階的学習",
          description: "未経験者からでもステップバイステップで確実にスキルアップできる体系的なカリキュラムを提供いたします",
          image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&crop=center"
        },
        {
          title: "企業カスタマイズ",
          description: "貴社の業務内容や特有の課題に合わせてカリキュラムを柔軟にカスタマイズし最適化いたします",
          image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=225&fit=crop&crop=center"
        }
      ]
    },
    
    midCTA: {
      title: "まずはお気軽にご相談ください",
      description: "貴社の課題に合わせたカスタム研修プランをご提案いたします",
      inquiryHref: "/contact?source=ai_training_mid_inquiry",
      documentHref: "/documents/request/ai-training-overview"
    },
    
    targetAudience: {
      title: "こんな方におすすめです",
      subtitle: "様々な職種・レベルの方に対応した研修内容をご用意しています",
      audiences: [
        {
          name: "管理職・リーダー",
          subtitle: "チームマネジメント・戦略立案担当",
          description: "AI活用の戦略的視点を習得",
          rating: 5,
          iconName: "Crown"
        },
        {
          name: "中堅社員",
          subtitle: "キャリアアップ・スキルアップ希望",
          description: "実務レベルのAI活用を学習",
          rating: 4,
          iconName: "UserCheck"
        },
        {
          name: "新社員・内定者",
          subtitle: "これから社会に出る方・専門知識不足",
          description: "基礎から段階的に学習可能",
          rating: 5,
          iconName: "GraduationCap"
        },
        {
          name: "技術者・エンジニア",
          subtitle: "開発効率化・新技術習得希望",
          description: "AI支援開発ツールを活用",
          rating: 4,
          iconName: "Zap"
        }
      ]
    },
    
    expectedChanges: {
      title: "導入で得られる変化",
      subtitle: "AI研修の導入前後で、組織とメンバーにどのような変化が生まれるのかを具体的にご紹介します",
      beforeItems: [
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
      ],
      afterItems: [
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
      ]
    },
    
    curriculum: {
      title: "研修内容（カリキュラム例）",
      modules: [
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
      ]
    },
    
    flow: {
      title: "研修導入までの流れ",
      subtitle: "お問い合わせから研修実施、効果測定まで、貴社のニーズに合わせて丁寧にサポートいたします",
      steps: [
        "お問い合わせ・ご相談",
        "ヒアリングとご提案",
        "カリキュラム調整",
        "研修実施",
        "振り返り・効果共有"
      ],
      conclusionTitle: "研修導入をご検討の皆さまへ",
      conclusionText: "AIは話題で終わらせる時代ではありません。貴社の業務に根ざした実践型研修で、現場に\"使えるAI\"を届けます。LandBridgeは、現場にフィットしたAI教育設計を支援します。"
    },
    
    additionalCTA: {
      title: "生成AI活用研修で競争力強化",
      description: "貴社の人材をAI時代のリーダーに育成します",
      inquiryHref: "/contact?source=comprehensive_ai_training_additional_inquiry",
      documentHref: "/documents/request/comprehensive-ai-training-overview"
    },
    
    overviewTable: {
      title: "開催概要",
      rows: [
        ["対象者", "未経験〜実務レベルの全社員"],
        ["受講形式", "オンライン or 対面（社内実施可）"],
        ["受講内容", "要相談（受講者のレベルなどに合わせてカスタマイズ可）"],
        ["時間", "1回90分 × 最大3回"],
        ["費用", "要相談（内容・人数により変動）"]
      ]
    },
    
    faq: {
      title: "よくあるご質問",
      items: [
        {
          question: "未経験の社員でも受講できますか？",
          answer: "はい。AIの基礎から実務レベルまでカバーしています。専門知識がない方でも段階的に学習できるカリキュラムを提供しています。"
        },
        {
          question: "他の部署にも展開できますか？",
          answer: "社内展開向けのスケーラブルな設計が可能です。部署ごとの特性に合わせたカスタマイズも承ります。"
        },
        {
          question: "自社業務に即した内容にできますか？",
          answer: "事前ヒアリングに基づき、業務シナリオに合わせて調整します。実際の業務フローにAIを組み込む具体的な手法をお教えします。"
        },
        {
          question: "研修時間はどの程度必要ですか？",
          answer: "標準では1回90分×3回構成ですが、受講者のレベルや要望に応じて柔軟に調整可能です。短時間集中型から長期継続型まで対応いたします。"
        },
        {
          question: "研修後のフォローアップはありますか？",
          answer: "研修終了後も質問対応や追加相談を承ります。継続的なAI活用推進のためのサポート体制も構築可能です。"
        }
      ]
    },
    
    otherTrainingPrograms: {
      title: "その他の研修プログラム",
      currentPageId: "comprehensive-ai-training",
      programs: [
        {
          id: "ai-writing",
          title: "AIライティング研修",
          description: "ChatGPTやClaude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。",
          href: "/services/ai-writing-training",
          image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop&crop=center",
          available: true,
          category: "enterprise"
        },
        {
          id: "ai-video",
          title: "AI動画生成研修",
          description: "最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。",
          href: "/services/ai-video-training",
          image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center",
          available: true,
          category: "enterprise"
        },
        {
          id: "ai-coding",
          title: "AIコーディング研修",
          description: "GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。",
          href: "/services/ai-coding-training",
          image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center",
          available: true,
          category: "enterprise"
        },
        {
          id: "practical-ai",
          title: "生成AI実務活用研修",
          description: "日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。",
          href: "/services/practical-ai-training",
          image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&crop=center",
          available: true,
          category: "enterprise"
        },
        {
          id: "individual-coaching",
          title: "AI人材育成所",
          description: "個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。",
          href: "/services/ai-talent-development",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
          available: true,
          category: "individual"
        }
      ]
    },
    
    finalCTA: {
      title: "まずはご相談・資料ダウンロードから",
      description: "貴社に最適なAI研修プランをご提案いたします",
      inquiryHref: "/contact?source=ai_training_final_inquiry",
      documentHref: "/documents/request/ai-training-overview"
    }
  }
  
  return (
    <MainLayout hideRightSidebar={true}>
      <ServiceTrainingLP 
        {...serviceData}
        latestColumns={columns}
        featuredProjects={featuredProjects}
      />
    </MainLayout>
  )
}