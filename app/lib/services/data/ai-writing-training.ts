import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_WRITING_TRAINING_METADATA: ServicePageMetadata = {
  title: 'AIライティング研修 - LandBridge株式会社',
  description: 'LandBridge株式会社のAIライティング研修。ChatGPT、Claude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。',
  keywords: ['LandBridge', 'AIライティング研修', 'ChatGPT', 'Claude', '文章作成', 'ライティング', 'AI文章生成', '業務文書', '効率化', '企業研修', 'AI活用'],
  url: 'https://www.landbridge.ai/services/ai-writing-training'
}

export const AI_WRITING_TRAINING_DATA: ServiceData = {
  pageTitle: "AIライティング研修",
  heroTitle: "AIライティング研修",
  heroImage: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=1920&h=1080&fit=crop&crop=center",
  seoTitle: "ビジネス文書作成の効率化を実現するAIライティング研修 - LandBridge株式会社",
  
  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact?source=ai_writing_hero_inquiry",
    documentHref: "/documents/request/ai-writing-overview"
  },
  
  serviceOverview: {
    title: "AIライティング研修の特徴",
    subtitle: "現代のビジネスにおいて、高品質な文書作成は競争力の源泉となっています。当研修では、ChatGPTやClaude等の生成AIツールを活用して、効果的で魅力的な文章を素早く作成する技術を習得していただけます。",
    items: [
      {
        title: "効率重視",
        description: "従来の半分以下の時間で、より質の高いビジネス文書を作成できるようになります",
        image: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "品質向上",
        description: "AIの支援により、論理的で説得力のある文章構成と表現力を身につけます",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "多様な文書対応",
        description: "企画書、報告書、メール、プレゼン資料まで幅広い文書作成に対応します",
        image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=400&h=225&fit=crop&crop=center"
      }
    ]
  },
  
  midCTA: {
    title: "文書作成効率を劇的に改善しませんか？",
    description: "貴社の文書作成業務に特化したAIライティング技術をお教えします",
    inquiryHref: "/contact?source=ai_writing_mid_inquiry",
    documentHref: "/documents/request/ai-writing-overview"
  },
  
  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "文書作成業務に関わる全ての方に価値をお届けします",
    audiences: [
      {
        name: "営業・マーケティング",
        subtitle: "提案書・企画書作成担当",
        description: "説得力のある提案書や魅力的なマーケティング文書を効率的に作成",
        rating: 5,
        iconName: "Target"
      },
      {
        name: "人事・総務",
        subtitle: "社内文書・規定作成担当",
        description: "明確で分かりやすい社内文書や規定を迅速に作成",
        rating: 4,
        iconName: "Users"
      },
      {
        name: "経営企画",
        subtitle: "戦略文書・報告書作成担当",
        description: "経営層向けの戦略的文書を論理的かつ簡潔に作成",
        rating: 5,
        iconName: "Crown"
      },
      {
        name: "技術者・エンジニア",
        subtitle: "技術文書・仕様書作成担当",
        description: "技術的内容を分かりやすく文書化し、チーム内での情報共有を効率化",
        rating: 4,
        iconName: "Settings"
      }
    ]
  },
  
  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "AIライティング研修の導入前後で、業務効率と文書品質にこのような変化が生まれます",
    beforeItems: [
      {
        category: "作業時間",
        issue: "文書作成に長時間かかり、他の重要業務が圧迫される"
      },
      {
        category: "文章品質", 
        issue: "思うような文章が書けず、伝わりにくい内容になってしまう"
      },
      {
        category: "構成力",
        issue: "論理的な文書構成を組み立てるのに苦労している"
      },
      {
        category: "表現力",
        issue: "同じような表現の繰り返しで、魅力的な文章が書けない"
      },
      {
        category: "校正作業",
        issue: "誤字脱字や文法チェックに時間がかかる"
      },
      {
        category: "個人差",
        issue: "チーム内で文書品質にバラつきがあり統一性がない"
      }
    ],
    afterItems: [
      {
        category: "作業効率",
        achievement: "文書作成時間を50%以上短縮し、重要業務に集中できる"
      },
      {
        category: "文章品質",
        achievement: "読み手に響く説得力のある文章を一貫して作成できる"
      },
      {
        category: "構成スキル",
        achievement: "論理的で分かりやすい文書構成を素早く組み立てられる"
      },
      {
        category: "表現技術",
        achievement: "多彩な表現技法を使い分けて魅力的な文章を作成できる"
      },
      {
        category: "品質保証",
        achievement: "AIによる校正支援で高品質な文書を効率的に完成できる"
      },
      {
        category: "チーム統一",
        achievement: "組織全体で一定レベル以上の文書品質を維持できる"
      }
    ]
  },
  
  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "AIライティング基礎",
        description: "生成AIを活用した文章作成の基本概念から、効果的なプロンプト設計、文書の種類別アプローチまで、AIライティングの土台となる知識と技術を体系的に習得します",
        image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=300&h=200&fit=crop"
      },
      {
        title: "ビジネス文書実践",
        description: "企画書、提案書、報告書、メール文書等、実際のビジネスシーンで使用される各種文書の作成技術を実践的に学習し、即座に業務で活用できるスキルを身につけます",
        image: "https://images.unsplash.com/photo-1434626881859-194d67b2b86f?w=300&h=200&fit=crop"
      },
      {
        title: "文章構成・編集技術",
        description: "論理的な文章構成の組み立て方から、読みやすさを向上させる編集技術、AIを活用した校正・推敲方法まで、文書品質を劇的に向上させる技術を習得します",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop"
      },
      {
        title: "業務適用ワークショップ",
        description: "受講者の実際の業務文書を題材として、AIライティング技術を活用した改善案を作成・検証します。現場ですぐに活用できる実践的なノウハウを獲得できます",
        image: "https://images.unsplash.com/photo-1553028826-f4804a6dba3b?w=300&h=200&fit=crop"
      }
    ]
  },
  
  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社の文書作成業務に合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在の文書作成課題ヒアリング",
      "カスタマイズ研修プラン策定",
      "AIライティング研修実施",
      "成果測定・継続サポート"
    ],
    conclusionTitle: "文書作成革新をお考えの皆さまへ",
    conclusionText: "AIライティングは単なる効率化ツールではありません。貴社の文書品質を根本から変革し、競争力強化に直結する戦略的スキルです。LandBridgeは、現場で即活用できるAIライティング技術の習得を全力で支援します。"
  },
  
  additionalCTA: {
    title: "AIライティング研修で文書作成を革新",
    description: "貴社の文書品質と作業効率を劇的に改善します",
    inquiryHref: "/contact?source=ai_writing_additional_inquiry",
    documentHref: "/documents/request/ai-writing-overview"
  },
  
  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "文書作成業務に携わる全社員"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "ビジネス文書作成技術・AI活用手法"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },
  
  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "文章を書くのが苦手でも受講できますか？",
        answer: "はい。むしろ文章作成に苦手意識のある方にこそ受講していただきたい研修です。AIの支援により、驚くほど質の高い文章が作成できるようになります。"
      },
      {
        question: "既存の文書テンプレートとの併用は可能ですか？",
        answer: "可能です。既存のテンプレートやフォーマットを活かしながら、AI技術で内容の質を向上させる手法をお教えします。"
      },
      {
        question: "業界特有の専門用語にも対応していますか？",
        answer: "事前ヒアリングで業界特性を把握し、専門分野に特化したAIライティング技術をカスタマイズして提供いたします。"
      },
      {
        question: "研修後すぐに実務で活用できますか？",
        answer: "実際の業務文書を題材とした実践的なカリキュラムにより、研修終了後すぐに現場で活用できる技術を習得していただけます。"
      },
      {
        question: "チーム全体のライティングレベル向上は期待できますか？",
        answer: "個人スキル向上に加え、チーム内でのナレッジ共有方法もお教えします。組織全体の文書作成能力の底上げを実現できます。"
      }
    ]
  },
  
  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-writing"),
  
  finalCTA: {
    title: "文書作成革新の第一歩を踏み出しませんか？",
    description: "貴社の文書品質と作業効率を劇的に改善するAIライティング研修をご提案いたします",
    inquiryHref: "/contact?source=ai_writing_final_inquiry",
    documentHref: "/documents/request/ai-writing-overview"
  }
}