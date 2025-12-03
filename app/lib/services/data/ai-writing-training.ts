import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_WRITING_TRAINING_METADATA: ServicePageMetadata = {
  title: 'AIライティング研修 - AI駆動研究所',
  description: 'AI駆動研究所のAIライティング研修。ChatGPT、Claudeなどの生成AIを活用したライティングスキルを習得。ビジネス文書、マーケティングコンテンツ、企画書作成の効率化を実現します。',
  keywords: ['AIライティング', 'AI研修', '企業研修', 'ChatGPT', 'Claude', '文章作成', 'ビジネス文書', 'コンテンツ作成', 'AI活用'],
  url: 'https://www.landbridge.ai/services/ai-writing-training'
}

export const AI_WRITING_TRAINING_DATA: ServiceData = {
  pageTitle: "AIライティング研修",
  heroTitle: "AIライティング研修",
  heroSubtitle: "生成AIで文章作成の効率を劇的に向上させる",
  heroImage: "/images/services/hero/ai-writing-training-hero.jpg",
  seoTitle: "AIライティング研修 - ビジネス文書作成を効率化 | AI駆動研究所",

  heroCTA: {
    inquiryText: "お問い合わせ",
    documentText: "資料ダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  },

  serviceOverview: {
    title: "AIライティング研修の特徴",
    subtitle: "ChatGPT、Claudeなどの生成AIを活用し、ビジネス文書からマーケティングコンテンツまで、あらゆる文章作成の効率を飛躍的に向上させます。",
    descriptionTop: "生成AIを活用した文章作成スキルを体系的に学習する研修プログラムです。ビジネスメール、企画書、プレゼン資料、マーケティングコンテンツなど、様々な文書作成にAIを効果的に活用する手法を習得します。",
    tools: [
      { name: "ChatGPT", logo: "chatgpt" },
      { name: "Claude", logo: "claude" },
      { name: "Gemini", logo: "gemini" }
    ],
    descriptionBottom: "プロンプトエンジニアリングの基礎から応用まで、実践的なワークショップを通じて学習。文章の構成、トーン調整、校正・編集など、AIと人間のコラボレーションによる高品質なコンテンツ作成を実現します。",
    featureImage: "/images/services/features/ai-writing-training-feature.jpg",
    items: [
      {
        title: "実践的な文書作成スキル",
        description: "ビジネスメール、報告書、企画書など、日常業務で必要な文書作成にAIを活用する具体的な手法を習得します",
        image: "/images/services/detail/1677442136019-ai-gen.jpg"
      },
      {
        title: "品質と効率の両立",
        description: "AIによる効率化と、人間によるクオリティコントロールを組み合わせた最適なワークフローを構築します",
        image: "/images/services/detail/1552664730-workshop.jpg"
      },
      {
        title: "カスタマイズ可能",
        description: "貴社の業種・業務に合わせた事例とワークで、すぐに実践できるスキルを身につけます",
        image: "/images/services/detail/1434030216411-study.jpg"
      }
    ]
  },

  midCTA: {
    title: "AIライティングで業務効率を革新",
    description: "文書作成時間を大幅削減し、より創造的な業務に集中できる環境を実現します",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  },

  targetAudience: {
    title: "AIライティング研修の対象者",
    subtitle: "文書作成に携わるすべてのビジネスパーソンが対象です",
    audiences: [
      {
        image: "/images/services/detail/1560250097-executive.jpg",
        text: "{経営企画}や{事業計画}の文書作成を担う{管理職}の方"
      },
      {
        image: "/images/services/detail/1552664730-workshop.jpg",
        text: "{マーケティング}コンテンツの作成・編集を行う{担当者}の方"
      },
      {
        image: "/images/services/detail/1600880292203-group.jpg",
        text: "日常的に{ビジネス文書}を作成する{一般社員}の方"
      },
      {
        image: "/images/services/detail/1529156069898-friends.jpg",
        text: "{文章力}を向上させたい{若手・新入社員}の方"
      }
    ]
  },

  expectedChanges: {
    title: "AIライティング研修による変化",
    subtitle: "文書作成業務の効率化と品質向上を同時に実現します",
    beforeItems: [
      {
        category: "作成時間",
        issue: "文書作成に多くの時間を費やし、他の業務に支障が出ている"
      },
      {
        category: "文章品質",
        issue: "書き手によって文章の品質やトーンにばらつきがある"
      },
      {
        category: "AI活用",
        issue: "生成AIの存在は知っているが、文書作成にどう活用すればいいかわからない"
      },
      {
        category: "校正作業",
        issue: "誤字脱字や表現のチェックに多くの時間がかかっている"
      },
      {
        category: "構成力",
        issue: "文章の構成やロジックの組み立てに苦手意識がある"
      },
      {
        category: "アイデア",
        issue: "新しいコンテンツのアイデア出しに時間がかかる"
      }
    ],
    afterItems: [
      {
        category: "時短効果",
        achievement: "文書作成時間が50%以上短縮され、業務効率が大幅に向上"
      },
      {
        category: "品質統一",
        achievement: "AI支援により、組織全体で一貫した品質の文書を作成可能に"
      },
      {
        category: "実践活用",
        achievement: "AIを効果的に活用した文書作成ワークフローを確立"
      },
      {
        category: "自動校正",
        achievement: "AIによる校正・添削で、ミスのない文書を効率的に作成"
      },
      {
        category: "構成支援",
        achievement: "AIを使った構成案作成で、論理的な文章を素早く作成"
      },
      {
        category: "発想支援",
        achievement: "AIとの対話でアイデアを広げ、創造的なコンテンツを生み出す"
      }
    ]
  },

  curriculum: {
    title: "AIライティング研修のカリキュラム",
    modules: [
      {
        title: "AIライティング基礎",
        description: "生成AIの文章作成能力と限界を正しく理解し、効果的な活用方法の基盤を構築。各AIツールの特徴と得意分野を把握し、目的に応じた最適なツール選択ができるようになります",
        image: "/images/services/detail/1485827404703-robot.jpg"
      },
      {
        title: "プロンプト設計実践",
        description: "高品質な文章を生成するためのプロンプトエンジニアリング技法を習得。文章のトーン、スタイル、長さをコントロールする具体的な指示の出し方を実践的に学びます",
        image: "/images/services/detail/1677442136019-ai-gen.jpg"
      },
      {
        title: "ビジネス文書作成ワーク",
        description: "メール、報告書、企画書、プレゼン資料など、実際の業務で使用する文書を題材にAIライティングを実践。即座に現場で活用できるスキルを身につけます",
        image: "/images/services/detail/1556761175-b413-meeting.jpg"
      },
      {
        title: "コンテンツ制作応用",
        description: "Webコンテンツ、SNS投稿、マーケティング資料など、より創造的な文書作成にAIを活用する手法を学習。AI生成コンテンツの編集・品質管理プロセスも確立します",
        image: "/images/services/detail/1600880292203-group.jpg"
      }
    ]
  },

  flow: {
    title: "AIライティング研修の導入ステップ",
    subtitle: "貴社の文書作成業務を分析し、最適なAIライティングスキルを習得いただきます",
    steps: [
      "現状ヒアリング",
      "カリキュラム設計",
      "研修実施",
      "実務適用支援",
      "効果測定・改善"
    ],
    conclusionTitle: "AIライティングで文書作成を変革",
    conclusionText: "生成AIを活用したライティングスキルは、これからのビジネスパーソンに必須の能力です。当研修で習得したスキルにより、文書作成業務の効率と品質を大幅に向上させ、より価値の高い業務に時間を割けるようになります。"
  },

  additionalCTA: {
    title: "文書作成の効率を劇的に向上",
    description: "AIライティング研修で、すべての社員が効率的に高品質な文書を作成できる組織へ",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  },

  overviewTable: {
    title: "AIライティング研修　開催概要",
    rows: [
      ["対象者", "文書作成に携わるすべてのビジネスパーソン"],
      ["受講形式", "対面・オンライン・ハイブリッド対応"],
      ["研修構成", "4回セット（基礎→プロンプト→ビジネス文書→応用）"],
      ["1回の時間", "90分〜120分"],
      ["受講人数", "5名〜30名程度"],
      ["カスタマイズ", "業界・業務・文書種類に応じて調整可能"],
      ["費用", "お見積り（規模・内容により個別算出）"]
    ]
  },

  faq: {
    title: "AIライティング研修に関するよくあるご質問",
    items: [
      {
        question: "文章を書くのが苦手な社員でも受講できますか？",
        answer: "はい、むしろそのような方にこそおすすめです。AIを活用することで、文章の構成やアイデア出しをサポートしてもらえるため、これまで文章作成に苦手意識があった方も効率的に高品質な文書を作成できるようになります。"
      },
      {
        question: "AIで作成した文章は、品質面で問題ないでしょうか？",
        answer: "研修では、AI生成文章の適切な編集・校正方法も学習します。AIはあくまでドラフト作成や構成の補助として活用し、最終的な品質管理は人間が行うワークフローを構築することで、高品質な文書作成を実現します。"
      },
      {
        question: "機密情報を含む文書作成にもAIを使用できますか？",
        answer: "研修では、情報セキュリティを考慮したAI活用方法も学習します。機密情報の取り扱いガイドラインの策定支援や、安全なAIツールの選定についてもアドバイスいたします。"
      },
      {
        question: "研修後、実際の業務でどれくらい効率化できますか？",
        answer: "文書の種類や業務内容により異なりますが、多くの受講者様から文書作成時間が30〜50%短縮されたとの報告をいただいています。特に定型的な文書やメール作成での効果が顕著です。"
      },
      {
        question: "マーケティング部門向けのコンテンツ作成にも対応していますか？",
        answer: "はい、対応しています。Webコンテンツ、ブログ記事、SNS投稿、広告コピーなど、マーケティング分野での文章作成にAIを活用する手法も研修内容に含まれています。"
      },
      {
        question: "英語など、日本語以外の文書作成にも活用できますか？",
        answer: "はい、生成AIは多言語に対応しているため、英語をはじめとする外国語での文書作成にも活用できます。翻訳補助や多言語コンテンツ作成の手法も、ご要望に応じて研修に組み込むことが可能です。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-writing-training"),

  finalCTA: {
    title: "AIライティングでビジネス文書を革新",
    description: "生成AIを活用した文書作成スキルで、業務効率と品質を同時に向上させます",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  }
}
