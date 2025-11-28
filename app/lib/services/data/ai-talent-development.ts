import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_TALENT_DEVELOPMENT_METADATA: ServicePageMetadata = {
  title: 'AI駆動開発育成所 - AI駆動研究所',
  description: 'AI駆動研究所のAI駆動開発育成所。バイブコーディング特化の個人向けコーチング。Claude CodeやCursorを活用したAI駆動開発スキルを習得し、開発効率を飛躍的に向上させます。',
  keywords: ['LandBridge', 'AI駆動開発育成所', 'バイブコーディング', 'Claude Code', 'Cursor', 'AI駆動開発', '個人向けコーチング', 'AIプログラミング'],
  url: 'https://www.landbridge.ai/services/ai-talent-development'
}

export const AI_TALENT_DEVELOPMENT_DATA: ServiceData = {
  pageTitle: "AI駆動開発育成所",
  heroTitle: "AI駆動開発育成所",
  heroSubtitle: "バイブコーディング特化の個人向けコーチング",
  heroImage: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=1920&h=1080&fit=crop&crop=center",
  seoTitle: "バイブコーディングで開発力を革新 - AI駆動開発育成所 | AI駆動研究所",

  heroCTA: {
    inquiryText: "無料相談を申し込む",
    documentText: "プログラム資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents/request/57a09c9d-eb2e-48b5-9138-1cbfb9845c38"
  },

  serviceOverview: {
    title: "AI駆動開発育成所の特徴",
    subtitle: "AI駆動開発育成所は、バイブコーディングに特化した個人向けコーチングプログラムです。Claude CodeやCursorなどの最先端AIツールを活用し、自然言語でアプリケーションを構築する「バイブコーディング」のスキルを体系的に習得していただけます。",
    descriptionTop: "本気でAI駆動開発スキルを身につけたい方を対象とした、少人数制のコーチングプログラムです。専任コーチによる個別指導で、バイブコーディングの実践的スキルを徹底的に伝授します。",
    tools: [
      { name: "Claude Code", logo: "claudecode" },
      { name: "Cursor", logo: "cursor" },
      { name: "Gemini", logo: "gemini" }
    ],
    descriptionBottom: "プロンプト設計からアプリケーション構築、デバッグ、リファクタリングまで、バイブコーディングの全プロセスを実践的に学習。コードを書かずに高品質なアプリケーションを開発する技術を習得し、開発効率を飛躍的に向上させます。修了後も3ヶ月間の継続サポート付きで、実践での課題解決をサポートします。",
    featureImage: "https://images.unsplash.com/photo-1696921881903-e87e5662d9b4?w=400&h=600&fit=crop&crop=center",
    items: [
      {
        title: "少人数制",
        description: "質の高いコーチングを提供するため、少人数制で丁寧に指導します",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "バイブコーディング特化",
        description: "自然言語でアプリを構築するバイブコーディングの技術を、基礎から応用まで体系的に習得",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "実践プロジェクト",
        description: "実際のアプリケーション開発を通じて、即戦力となるAI駆動開発スキルを身につけます",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop&crop=center"
      }
    ]
  },

  midCTA: {
    title: "バイブコーディングで開発を革新しませんか？",
    description: "専任コーチによる個別指導で、AI駆動開発のスキルを確実に習得します",
    inquiryHref: "/contact",
    documentHref: "/documents/request/57a09c9d-eb2e-48b5-9138-1cbfb9845c38"
  },

  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "AI駆動開発を本格的に習得したい方を対象としています",
    audiences: [
      {
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop&crop=center",
        text: "{バイブコーディング}で{開発効率}を上げたいエンジニアの方"
      },
      {
        image: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=300&h=300&fit=crop&crop=center",
        text: "{非エンジニア}だが{自分でアプリ}を作れるようになりたい方"
      },
      {
        image: "https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=300&h=300&fit=crop&crop=center",
        text: "{フリーランス・副業}で{AI開発案件}を獲得したい方"
      },
      {
        image: "https://images.unsplash.com/photo-1507925921958-8a62f3d1a50d?w=300&h=300&fit=crop&crop=center",
        text: "{起業・新規事業}で{プロトタイプ}を素早く作りたい方"
      }
    ]
  },

  expectedChanges: {
    title: "プログラム受講で得られる変化",
    subtitle: "AI駆動開発育成所のコーチング受講前後で、あなたの開発力にこのような変化が生まれます",
    beforeItems: [
      {
        category: "開発速度",
        issue: "コード作成に時間がかかり、アイデアを形にするまでに長い時間を要している"
      },
      {
        category: "技術的障壁",
        issue: "プログラミングスキルの不足により、作りたいものが作れない"
      },
      {
        category: "AIツール活用",
        issue: "AIツールの存在は知っているが、効果的な活用方法がわからない"
      },
      {
        category: "学習効率",
        issue: "独学では限界があり、体系的なスキル習得ができていない"
      },
      {
        category: "実践経験",
        issue: "理論は知っているが、実際のプロジェクトでの経験が不足"
      },
      {
        category: "品質管理",
        issue: "AIが生成したコードの品質判断や改善ができない"
      }
    ],
    afterItems: [
      {
        category: "高速開発",
        achievement: "バイブコーディングで開発効率が3-5倍向上し、アイデアを即座に形に"
      },
      {
        category: "技術革新",
        achievement: "コードを書かずに高品質なアプリケーションを開発できるスキルを習得"
      },
      {
        category: "AIツール習熟",
        achievement: "Claude Code、Cursor等を使いこなし、最大限の効果を引き出せる"
      },
      {
        category: "体系的知識",
        achievement: "バイブコーディングの全プロセスを体系的に理解し実践できる"
      },
      {
        category: "実務能力",
        achievement: "実際のプロジェクトで即戦力として活躍できる実践的スキルを保有"
      },
      {
        category: "品質制御",
        achievement: "AIが生成したコードの品質評価と改善を適切に行える"
      }
    ]
  },

  curriculum: {
    title: "プログラム内容（カリキュラム例）",
    modules: [
      {
        title: "AI駆動開発環境構築",
        description: "Claude Code、Cursor等の主要AI開発ツールのセットアップから基本操作まで、バイブコーディングに必要な環境構築と基礎知識を体系的に習得します",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
      },
      {
        title: "プロンプトエンジニアリング",
        description: "AIに的確な指示を出すためのプロンプト設計技術を習得。効率的なコード生成、デバッグ、リファクタリングを実現するプロンプトの書き方を学びます",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop"
      },
      {
        title: "実践アプリケーション開発",
        description: "実際のWebアプリケーション開発を通じて、バイブコーディングの実践的スキルを習得。フロントエンド、バックエンド、データベース操作まで一貫して学びます",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop"
      },
      {
        title: "品質管理とデバッグ",
        description: "AIが生成したコードの品質評価、テスト作成、デバッグ技術を習得。保守性と拡張性に優れたアプリケーション開発の手法を身につけます",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop"
      }
    ]
  },

  flow: {
    title: "受講までの流れ",
    subtitle: "本気でスキル習得を目指す方を対象としています",
    steps: [
      "お申し込み",
      "ヒアリング・面談",
      "プラン決定",
      "個別コーチング開始",
      "実践プロジェクト・修了"
    ],
    conclusionTitle: "AI駆動開発を本気で学びたい方へ",
    conclusionText: "AI駆動開発育成所は、本気でスキル習得を目指す方に質の高いコーチングを提供します。事前面談では、学習目標や現在のスキルレベルをお聞きし、最適なプランをご提案します。バイブコーディングで開発の世界を変えたい方のご応募をお待ちしています。"
  },

  additionalCTA: {
    title: "AI駆動開発スキルを習得",
    description: "専任コーチによるコーチングで確実にスキルアップ",
    inquiryHref: "/contact",
    documentHref: "/documents/request/57a09c9d-eb2e-48b5-9138-1cbfb9845c38"
  },

  overviewTable: {
    title: "プログラム概要",
    rows: [
      ["対象者", "AIスキル習得を目指す個人（審査制）"],
      ["受講形式", "オンライン個別コーチング"],
      ["プログラム内容", "バイブコーディング特化"],
      ["期間", "3ヶ月（週1回のセッション）"],
      ["費用", "要相談（目標・内容により変動）"],
      ["サポート", "専任コーチ + 修了後3ヶ月サポート"]
    ]
  },

  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "プログラミング経験がなくても受講できますか？",
        answer: "はい。バイブコーディングは自然言語でアプリを構築する技術のため、プログラミング経験がない方でも受講可能です。事前面談で学習目標をお聞きし、最適なプランをご提案します。"
      },
      {
        question: "事前面談ではどのようなことを聞かれますか？",
        answer: "学習目標や現在のスキルレベル、確保できる学習時間などをお聞きします。お客様に最適なコーチングプランをご提案するためのヒアリングです。"
      },
      {
        question: "仕事をしながらでも受講可能ですか？",
        answer: "可能です。週1回のオンラインセッション（90分程度）と、週5-10時間程度の自習時間を確保いただければ受講いただけます。セッション時間は柔軟に調整可能です。"
      },
      {
        question: "どのようなアプリケーションが作れるようになりますか？",
        answer: "Webアプリケーション、業務効率化ツール、データ分析アプリ等、幅広いアプリケーションを開発できるようになります。受講者の目標に合わせてカリキュラムをカスタマイズします。"
      },
      {
        question: "修了後のサポートはありますか？",
        answer: "修了後も3ヶ月間の継続サポートを提供。実際のプロジェクトで直面する課題について、引き続き相談・アドバイスを受けることができます。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("individual-coaching"),

  finalCTA: {
    title: "AI駆動開発の扉を開きませんか？",
    description: "専任コーチによる個別指導で、バイブコーディングスキルを確実に習得いただけます",
    inquiryHref: "/contact",
    documentHref: "/documents/request/57a09c9d-eb2e-48b5-9138-1cbfb9845c38"
  }
}
