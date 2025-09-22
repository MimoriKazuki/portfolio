import MainLayout from '../../components/MainLayout'
import ServiceTrainingLP from '../../components/ServiceTrainingLP'
import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AI人材育成所 - LandBridge株式会社',
  description: 'LandBridge株式会社のAI人材育成所。個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。',
  keywords: ['LandBridge', 'AI人材育成所', '個人向けAI研修', 'キャリアアップ', 'AIスキル', '個人学習', 'AI転職', 'スキルアップ', 'AI人材'],
  openGraph: {
    title: 'AI人材育成所 - LandBridge株式会社',
    description: 'LandBridge株式会社のAI人材育成所。個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。',
    type: 'website',
    locale: 'ja_JP',
    url: 'https://www.landbridge.ai/services/ai-talent-development',
    siteName: 'LandBridge',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AI人材育成所 - LandBridge株式会社',
    description: 'LandBridge株式会社のAI人材育成所。個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。',
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

export default async function AITalentDevelopmentPage() {
  const projects = await getProjects()
  const columns = await getLatestColumns()
  const featuredProjects = projects.filter(p => p.featured).slice(0, 3)
  
  // Template data for AI人材育成所
  const serviceData = {
    pageTitle: "AI人材育成所",
    heroTitle: "AI人材育成所",
    heroImage: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=1920&h=1080&fit=crop&crop=center",
    seoTitle: "個人でAIスキルを身につけてキャリアアップ - AI人材育成所 | LandBridge株式会社",
    
    heroCTA: {
      inquiryText: "無料相談を予約する",
      documentText: "プログラム資料をダウンロード",
      inquiryHref: "/contact?source=ai_talent_hero_inquiry",
      documentHref: "/documents/request/ai-talent-overview"
    },
    
    serviceOverview: {
      title: "AI人材育成所",
      subtitle: "AIが変革する未来に向けて、個人のキャリアアップと市場価値向上をサポートします。あなたのペースで学べる柔軟なプログラムにより、実践的なAIスキルを身につけ、次のキャリアステップを実現していただけます。",
      items: [
        {
          title: "個別最適化",
          description: "あなたの現在のスキルレベルとキャリア目標に合わせて完全カスタマイズされたプログラムを提供",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&crop=center"
        },
        {
          title: "実践重視",
          description: "理論だけでなく、実際のプロジェクトを通じて即戦力となるスキルを習得できます",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&crop=center"
        },
        {
          title: "キャリア支援",
          description: "スキル習得から転職・昇進まで、総合的なキャリアサポートを提供します",
          image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=400&h=225&fit=crop&crop=center"
        }
      ]
    },
    
    midCTA: {
      title: "AIスキルでキャリアを変えませんか？",
      description: "あなたの目標に合わせた個別プログラムで、確実にスキルアップを実現します",
      inquiryHref: "/contact?source=ai_talent_mid_inquiry",
      documentHref: "/documents/request/ai-talent-overview"
    },
    
    targetAudience: {
      title: "こんな方におすすめです",
      subtitle: "AIスキルでキャリアアップを目指す全ての個人の方が対象です",
      audiences: [
        {
          name: "転職を考えている方",
          subtitle: "AIスキルで市場価値を向上したい",
          description: "AI人材として転職市場での競争力を高め、理想のキャリアを実現",
          rating: 5,
          iconName: "TrendingUp"
        },
        {
          name: "現職でのスキルアップ希望",
          subtitle: "社内での評価・昇進を目指したい",
          description: "AIスキルで現在の職場での価値を高め、昇進・昇格を実現",
          rating: 4,
          iconName: "Crown"
        },
        {
          name: "フリーランス・副業志向",
          subtitle: "AIスキルで収入源を増やしたい",
          description: "AI関連の案件受注や副業展開で、収入の多様化を実現",
          rating: 4,
          iconName: "Zap"
        },
        {
          name: "学生・新卒",
          subtitle: "就職活動で差別化を図りたい",
          description: "AIスキルで就職活動を有利に進め、希望する企業への内定を獲得",
          rating: 5,
          iconName: "GraduationCap"
        }
      ]
    },
    
    expectedChanges: {
      title: "プログラム受講で得られる変化",
      subtitle: "AI人材育成所のプログラム受講前後で、あなたのキャリアにこのような変化が生まれます",
      beforeItems: [
        {
          category: "市場価値",
          issue: "AIスキル不足により転職市場での競争力が限定的"
        },
        {
          category: "業務効率", 
          issue: "従来の手法に依存し、効率的な業務遂行ができていない"
        },
        {
          category: "キャリア展望",
          issue: "将来のキャリアパスが不明確で、成長の方向性が見えない"
        },
        {
          category: "学習方法",
          issue: "独学では限界があり、体系的なスキル習得ができていない"
        },
        {
          category: "実践経験",
          issue: "理論は知っているが、実際のプロジェクトでの経験が不足"
        },
        {
          category: "ネットワーク",
          issue: "AI分野の専門家やコミュニティとのつながりが限定的"
        }
      ],
      afterItems: [
        {
          category: "市場競争力",
          achievement: "AI人材として高い市場価値を持ち、理想の転職・昇進を実現"
        },
        {
          category: "業務革新",
          achievement: "AIスキルで業務を劇的に効率化し、生産性を大幅に向上"
        },
        {
          category: "キャリア設計",
          achievement: "明確なキャリアビジョンを持ち、戦略的な成長を実現"
        },
        {
          category: "継続学習",
          achievement: "効果的な学習方法を習得し、継続的なスキルアップが可能"
        },
        {
          category: "実務能力",
          achievement: "即戦力として現場で活躍できる実践的なスキルを保有"
        },
        {
          category: "専門ネットワーク",
          achievement: "AI分野の専門家・同業者との強固なネットワークを構築"
        }
      ]
    },
    
    curriculum: {
      title: "プログラム内容（カリキュラム例）",
      modules: [
        {
          title: "AI基礎とキャリア設計",
          description: "AI技術の基礎知識から業界動向、キャリアパスの設計まで、AI人材として必要な土台知識を体系的に習得。あなただけのキャリア戦略を明確化します",
          image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop"
        },
        {
          title: "実践的AIスキル習得",
          description: "生成AI、機械学習、データ分析等、実際の業務で活用できるAI技術を実践的に学習。プロジェクトベースの学習で即戦力スキルを身につけます",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
        },
        {
          title: "ポートフォリオ作成",
          description: "学習成果を形にして、転職・昇進活動で活用できるポートフォリオを作成。あなたのAIスキルを効果的にアピールできる資料を完成させます",
          image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop"
        },
        {
          title: "キャリア実現サポート",
          description: "転職活動の戦略策定から面接対策、昇進に向けた社内アピール方法まで、目標実現に向けた具体的なサポートを提供します",
          image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=300&h=200&fit=crop"
        }
      ]
    },
    
    flow: {
      title: "プログラム受講の流れ",
      subtitle: "お申込みから目標達成まで、あなたのペースに合わせて丁寧にサポートいたします",
      steps: [
        "無料相談・目標設定",
        "スキルレベル診断",
        "個別プログラム策定",
        "スキル習得・実践",
        "キャリア実現サポート"
      ],
      conclusionTitle: "AIキャリアを目指す皆さまへ",
      conclusionText: "AI人材は今後ますます求められる存在です。早期にスキルを身につけることで、理想のキャリアを実現できます。LandBridgeは、あなただけの成長ストーリーを全力でサポートし、AI人材としての成功を共に目指します。"
    },
    
    additionalCTA: {
      title: "AI人材へのキャリアアップ",
      description: "あなたの理想のキャリアを実現します",
      inquiryHref: "/contact?source=ai_talent_additional_inquiry",
      documentHref: "/documents/request/ai-talent-overview"
    },
    
    overviewTable: {
      title: "プログラム概要",
      rows: [
        ["対象者", "AIスキル習得を目指す個人"],
        ["受講形式", "オンライン個別指導"],
        ["プログラム内容", "個別カスタマイズ"],
        ["期間", "3-6ヶ月（個人のペースに応じて調整可）"],
        ["費用", "要相談（目標・内容により変動）"],
        ["サポート", "専任メンター + キャリアコンサルタント"]
      ]
    },
    
    faq: {
      title: "よくあるご質問",
      items: [
        {
          question: "AIの知識が全くなくても受講できますか？",
          answer: "はい。完全初心者の方でも基礎から丁寧に指導いたします。あなたのレベルに合わせて個別にプログラムをカスタマイズするため、安心して受講いただけます。"
        },
        {
          question: "仕事をしながらでも受講可能ですか？",
          answer: "可能です。オンライン個別指導により、あなたのスケジュールに合わせて柔軟に進めることができます。平日夜間や週末の受講も対応しています。"
        },
        {
          question: "どのようなキャリアサポートが受けられますか？",
          answer: "転職希望の方には履歴書・職務経歴書の添削、面接対策、企業紹介等を提供。昇進希望の方には社内アピール戦略、スキル証明方法等をサポートします。"
        },
        {
          question: "プログラム修了後のサポートはありますか？",
          answer: "修了後も6ヶ月間の継続サポートを提供。転職活動や新しい職場での活動について、引き続き相談・アドバイスを受けることができます。"
        },
        {
          question: "受講料の分割払いは可能ですか？",
          answer: "ご相談に応じて分割払いのご案内も可能です。まずは無料相談でご希望をお聞かせください。あなたの状況に合わせた最適なプランをご提案いたします。"
        }
      ]
    },
    
    otherTrainingPrograms: {
      title: "その他の研修プログラム",
      currentPageId: "individual-coaching",
      programs: [
        {
          id: "comprehensive-ai-training",
          title: "生成AI活用研修",
          description: "ChatGPTやClaude等の生成AIツールを活用し、未経験者から実務レベルまで体系的に学習。企業の現場で即戦力として活躍できる人材を育成します。",
          href: "/services/comprehensive-ai-training",
          image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center",
          available: true,
          category: "enterprise"
        },
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
        }
      ]
    },
    
    finalCTA: {
      title: "AI人材への第一歩を踏み出しませんか？",
      description: "あなたの理想のキャリアを実現するAI人材育成プログラムをご提案いたします",
      inquiryHref: "/contact?source=ai_talent_final_inquiry",
      documentHref: "/documents/request/ai-talent-overview"
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