import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const COMPREHENSIVE_AI_TRAINING_METADATA: ServicePageMetadata = {
  title: '生成AI総合研修 - AI駆動研究所',
  description: 'AI駆動研究所の生成AI総合研修。ChatGPT、Claude等の生成AIツールを活用し、未経験者から実務レベルまで体系的に学習。企業の現場で即戦力として活躍できる人材を育成します。',
  keywords: ['LandBridge', '生成AI総合研修', 'AI研修', '企業研修', 'ChatGPT', 'Claude', '生成AI', 'DX推進', 'AI人材育成', 'ビジネスAI', '社員研修', 'AI活用'],
  url: 'https://www.landbridge.ai/services/comprehensive-ai-training'
}

export const COMPREHENSIVE_AI_TRAINING_DATA: ServiceData = {
  pageTitle: "生成AI総合研修",
  heroTitle: "生成AI総合研修",
  heroSubtitle: "全社員のAIリテラシーを底上げし、組織全体のDX推進を加速する",
  heroImage: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=1920&h=1080&fit=crop",
  seoTitle: "AI人材を社内で育てる企業向けAI研修 - AI駆動研究所",
  
  heroCTA: {
    inquiryText: "お問い合わせ",
    documentText: "資料ダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  serviceOverview: {
    title: "生成AI総合研修の特徴",
    subtitle: "ChatGPT、Claude、Geminiなどの主要な生成AIツールを活用し、未経験者から上級者まで幅広いレベルに対応した包括的な企業研修です。理論学習と実践ワークを組み合わせ、即座に現場で活用できるスキルを身につけます。",
    descriptionTop: "ChatGPT、Claude、Geminiなどの主要な生成AIツールを総合的に学習し、業務での活用スキルを身につける包括的な企業研修プログラムです。未経験者から上級者まで幅広いレベルに対応し、理論学習と実践ワークを組み合わせた効果的なカリキュラムを提供します。",
    tools: [
      { name: "ChatGPT", logo: "chatgpt" },
      { name: "Claude", logo: "claude" },
      { name: "Gemini", logo: "gemini" }
    ],
    descriptionBottom: "プロンプト設計、業務改善、セキュリティ対策まで、生成AI活用に必要なスキルを総合的に習得。文書作成、データ分析、企画立案、カスタマーサポートなど、あらゆる業務シーンでのAI活用方法を実践的に学びます。研修終了後は、即座に現場で活用できる実践力が身につきます。",
    featureImage: "https://images.unsplash.com/photo-1653299832314-5d3dc1e5a83c?w=400&h=600&fit=crop&crop=center",
    items: [
      {
        title: "包括的なAI学習",
        description: "生成AIの基礎知識から高度な活用テクニックまで、体系的に学習できる総合カリキュラムを提供します",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "実務直結の内容",
        description: "貴社の業務プロセスに合わせたカスタム事例とワークショップで、学習した内容を即座に現場で活用できます",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "全社員対応",
        description: "管理職から新入社員まで、職種やスキルレベルに関わらず全ての社員が効果的に学習できる柔軟な研修設計です",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&crop=center"
      }
    ]
  },
  
  midCTA: {
    title: "生成AI総合研修で組織変革を実現",
    description: "全社員のAIリテラシー向上により、組織全体のDX推進を加速します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  targetAudience: {
    title: "全社員が対象の総合研修",
    subtitle: "職種・スキルレベルに関わらず、すべての社員が効果的に学習できる包括的な研修プログラムです",
    audiences: [
      {
        image: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop&crop=center",
        text: "{AI戦略}の立案・推進を担う{経営陣・管理職}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=300&fit=crop&crop=center",
        text: "チームの{DX推進}をリードする{マネージャー層}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=300&fit=crop&crop=center",
        text: "日常業務で{生産性向上}を目指す{一般社員}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=300&h=300&fit=crop&crop=center",
        text: "{AI時代}のビジネススキルを身につけたい{新入社員・若手}の方"
      }
    ]
  },
  
  expectedChanges: {
    title: "生成AI総合研修による組織変革",
    subtitle: "全社員のAIリテラシー向上により、組織全体のデジタル変革を実現します",
    beforeItems: [
      {
        category: "AI認識",
        issue: "生成AIは一部の専門部署のみが使用する特別な技術だと思われている"
      },
      {
        category: "活用スキル", 
        issue: "ChatGPTなどのツールは知っているが効果的な活用方法がわからない"
      },
      {
        category: "組織体制",
        issue: "部署ごとに異なるAIツールを使用し、ナレッジ共有ができていない"
      },
      {
        category: "セキュリティ",
        issue: "AI利用時のセキュリティリスクや情報漏洩への対策が不十分"
      },
      {
        category: "業務効率",
        issue: "AI活用により改善可能な業務を手作業で継続している"
      },
      {
        category: "競争力",
        issue: "AI活用が進む同業他社との生産性格差が拡大している"
      }
    ],
    afterItems: [
      {
        category: "全社活用",
        achievement: "全部署でAIツールが日常的に活用され業務効率が大幅向上"
      },
      {
        category: "専門スキル",
        achievement: "職種に応じた最適なAIツール選択と高度な活用技術を習得"
      },
      {
        category: "組織連携",
        achievement: "部署横断でのAIベストプラクティス共有体制が確立"
      },
      {
        category: "リスク管理",
        achievement: "セキュリティを考慮した安全なAI活用体制の構築"
      },
      {
        category: "創造的業務",
        achievement: "ルーチンワークの自動化により戦略的業務に集中"
      },
      {
        category: "市場優位",
        achievement: "AI活用による革新的なサービス・プロダクト創出"
      }
    ]
  },
  
  curriculum: {
    title: "生成AI総合研修のカリキュラム",
    modules: [
      {
        title: "生成AI基礎理解",
        description: "生成AIの基本原理から最新動向まで包括的に学習。ChatGPT、Claude、Geminiなどの主要ツールの特徴比較と、セキュリティ・コンプライアンス対応まで幅広くカバーし、組織全体での活用基盤を構築します",
        image: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300&h=200&fit=crop"
      },
      {
        title: "実践的プロンプト設計",
        description: "効果的なプロンプトエンジニアリング技法を習得。職種別の活用パターンと業務シーン別の最適化手法を実践的に学習し、各部署での即戦力となるスキルを身につけます",
        image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=300&h=200&fit=crop"
      },
      {
        title: "業務プロセス改善ワーク",
        description: "貴社の実際の業務フローを題材に、AI導入による効率化シナリオを設計。部署横断でのワークフロー最適化から組織全体のDX戦略まで、実践的な導入計画を策定します",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop"
      },
      {
        title: "AI活用の組織展開",
        description: "研修で習得したスキルの組織展開方法を学習。社内でのAI活用推進体制構築、継続的な学習プログラム設計、ROI測定手法まで、持続可能なAI活用組織への変革を支援します",
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=200&fit=crop"
      }
    ]
  },
  
  flow: {
    title: "生成AI総合研修の導入ステップ",
    subtitle: "組織全体のAI活用推進を成功に導くため、段階的かつ体系的なアプローチでサポートします",
    steps: [
      "現状分析・課題整理",
      "カスタム研修設計",
      "段階的研修実施",
      "組織展開支援",
      "効果測定・継続改善"
    ],
    conclusionTitle: "生成AI総合研修で始める組織変革",
    conclusionText: "生成AIは単なるツールではなく、組織の競争力を決定づける重要な要素です。全社員が活用できる包括的な研修プログラムで、貴社のDX推進を加速し、持続可能な成長を実現します。"
  },
  
  additionalCTA: {
    title: "全社員のAIスキル底上げで組織を変革",
    description: "生成AI総合研修により、すべての部署でAI活用が日常となる組織を実現します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  overviewTable: {
    title: "生成AI総合研修　開催概要",
    rows: [
      ["対象者", "全社員（経営陣からスタッフまで全職種・全階層）"],
      ["受講形式", "対面・オンライン・ハイブリッド対応（社内・社外開催可）"],
      ["研修構成", "4回セット（基礎理解→実践技術→業務改善→組織展開）"],
      ["1回の時間", "90分〜120分（内容・レベルに応じて調整）"],
      ["受講人数", "5名〜50名程度（グループワーク重視のため）"],
      ["カスタマイズ", "業界・職種・企業課題に完全対応"],
      ["費用", "お見積り（規模・内容・期間により個別算出）"]
    ]
  },
  
  faq: {
    title: "生成AI総合研修に関するよくあるご質問",
    items: [
      {
        question: "全社員が対象とのことですが、IT知識がない社員でも受講できますか？",
        answer: "はい、安心してご受講いただけます。専門的なIT知識は一切不要です。生成AIの基本概念から丁寧に解説し、実際の操作も段階的に習得していただきます。経営陣から新入社員まで、すべての階層の方に対応したカリキュラム設計となっています。"
      },
      {
        question: "4回の研修で本当にAIを業務で活用できるようになりますか？",
        answer: "はい。体系的に設計された4回のプログラムにより、基礎理解から実践活用まで着実にスキルアップできます。特に業務プロセス改善ワークでは、受講者様の実際の業務を題材にするため、研修終了と同時に現場での活用が開始できます。"
      },
      {
        question: "他社との違いや生成AI総合研修の特色は何ですか？",
        answer: "最大の特色は「全社員対応」と「実務直結」です。一般的なAI研修は特定部署や技術者向けが多いですが、当研修は全職種・全階層に対応。また、貴社の実際の業務プロセスを題材とするため、学習内容が即座に現場で活用できる実践性の高さが特徴です。"
      },
      {
        question: "セキュリティリスクへの対応も学習できますか？",
        answer: "はい、セキュリティ・コンプライアンス対応も重要な学習項目として組み込まれています。生成AI基礎理解のモジュールでは、安全なAI活用のためのガイドライン策定も含め、組織全体でのリスク管理体制構築をサポートします。"
      },
      {
        question: "研修後の組織展開や定着化支援はありますか？",
        answer: "AI活用の組織展開モジュールで組織展開方法を詳しく学習し、その後も継続的なサポートを提供します。社内でのAI活用推進体制構築、定期的なスキルアップ研修、ROI測定まで、持続可能なAI活用組織への変革を長期的にサポートいたします。"
      },
      {
        question: "業界特有の活用事例も学習できますか？",
        answer: "はい。事前ヒアリングにより、貴社の業界・業務特性に合わせたカスタムカリキュラムを設計します。同業界での成功事例から、貴社特有の課題解決まで、実践的で即効性のある内容をお届けします。"
      }
    ]
  },
  
  otherTrainingPrograms: generateOtherTrainingProgramsData("comprehensive-ai-training"),
  
  finalCTA: {
    title: "生成AI総合研修で組織の未来を切り拓く",
    description: "全社員のAIリテラシー向上により、競争力のあるAI活用組織への変革を実現します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}