import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const CLAUDE_TRAINING_METADATA: ServicePageMetadata = {
  title: 'Claude研修 - AI駆動研究所',
  description: 'AI駆動研究所のClaude研修。CoWork、Claude in Chrome、Claude Designなど、Claudeの多様な機能を業務全般で使いこなし、組織全体の生産性を引き上げる実践型研修プログラムです。',
  keywords: ['LandBridge', 'Claude研修', 'Claude', 'CoWork', 'Claude in Chrome', 'Claude Design', 'Anthropic', 'AI活用', '業務効率化', '企業研修'],
  url: 'https://www.landbridge.ai/services/claude-training'
}

export const CLAUDE_TRAINING_DATA: ServiceData = {
  pageTitle: "Claude研修",
  heroTitle: "Claude研修",
  heroSubtitle: "Claudeの多様な機能を使いこなし、業務全般の生産性を引き上げる",
  heroImage: "/images/services/hero/claude-training-hero.jpg",
  seoTitle: "Claudeを業務全般で使いこなすClaude研修 - AI駆動研究所",

  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  serviceOverview: {
    title: "Claude研修の特徴",
    subtitle: "Claudeは単なるチャット型AIではなく、CoWorkによる共同作業、Claude in Chromeによるブラウザ操作、Claude Designによる成果物制作など、業務領域を横断して使える総合プラットフォームへと進化しています。当研修では、Claudeの主要機能を体系的に学び、貴社の日常業務に組み込んで成果に直結させる実践技術を習得していただきます。",
    descriptionTop: "Claudeの基礎から最新機能まで、業務で実際に活用できる形で体系的に習得する専門研修プログラムです。文章作成・要約・分析といった基本機能に加え、CoWork、Claude in Chrome、Claude Designなどの応用機能を、開発者・非開発者を問わず使いこなせるようになります。",
    tools: [
      { name: "Claude", logo: "claude" },
      { name: "Claude Code", logo: "claudecode" },
      { name: "Claude Design", logo: "claudedesign" }
    ],
    descriptionBottom: "プロンプト設計の基礎から、Projects・Artifacts機能の使い分け、CoWorkによる共同編集、Claude in Chromeを使ったブラウザ上の作業自動化、Claude Designによるドキュメント・スライド制作まで、Claudeを業務全般で使い倒すノウハウを実例ベースで学習。研修後は、調査・資料作成・分析・コミュニケーションなど幅広い業務でClaudeを起点とした生産性向上を実現できます。",
    featureImage: "/images/services/features/claude-training-feature.jpg",
    items: [
      {
        title: "業務全般の効率化",
        description: "文章作成・要約・分析・調査など、日常業務の多様なタスクをClaudeで効率化します",
        image: "/images/services/detail/1519389950473-workspace.jpg"
      },
      {
        title: "共同作業の高度化",
        description: "CoWorkを活用し、チームでClaudeを共同利用しながら成果物の品質を高めます",
        image: "/images/services/detail/1522202176988-collaboration.jpg"
      },
      {
        title: "成果物制作の加速",
        description: "Claude Designでドキュメント・スライド・図表まで、Claude1つで完成度高く仕上げます",
        image: "/images/services/detail/1516321318423-laptop.jpg"
      }
    ]
  },

  midCTA: {
    title: "Claudeを業務の中核に据えませんか？",
    description: "Claudeの主要機能を体系的に習得し、業務全般の生産性を引き上げます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "業務でClaudeを使いこなしたい全ての職種・部署の皆さまに価値をお届けします",
    audiences: [
      {
        image: "/images/services/detail/1519389950473-workspace.jpg",
        text: "{業務全般の生産性}を底上げしたい{経営企画・管理部門}の方"
      },
      {
        image: "/images/services/detail/1531482615713-meeting.jpg",
        text: "{資料作成・調査業務}を効率化したい{企画・マーケティング}担当の方"
      },
      {
        image: "/images/services/detail/1555066931-code.jpg",
        text: "{Claude Code・CoWork}で開発業務を強化したい{エンジニア}の方"
      },
      {
        image: "/images/services/detail/1524178232363-classroom.jpg",
        text: "{全社員のAI活用レベル}を引き上げたい{人事・研修}担当の方"
      }
    ]
  },

  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "Claude研修の導入前後で、業務プロセスと成果物にこのような変化が生まれます",
    beforeItems: [
      {
        category: "活用範囲",
        issue: "Claudeをチャット用途のみに限定しており、多様な機能を活かせていない"
      },
      {
        category: "プロンプト品質",
        issue: "プロンプト設計が属人化し、期待する回答を安定して引き出せていない"
      },
      {
        category: "共同作業",
        issue: "個人利用にとどまり、チームでの共同利用や知見共有が進んでいない"
      },
      {
        category: "業務横断",
        issue: "資料作成・調査・分析など、業務を横断した一気通貫の活用ができていない"
      },
      {
        category: "ブラウザ業務",
        issue: "ブラウザ上の繰り返し作業をAIで効率化する手段を持っていない"
      },
      {
        category: "成果物品質",
        issue: "Claudeで作る成果物の完成度が低く、最終的に手作業での修正が発生している"
      }
    ],
    afterItems: [
      {
        category: "機能網羅",
        achievement: "CoWork・Claude in Chrome・Claude Design等を含む主要機能を業務で使いこなせる"
      },
      {
        category: "プロンプト標準化",
        achievement: "業務テンプレートとしてプロンプトを設計でき、品質を安定的に再現可能"
      },
      {
        category: "チーム活用",
        achievement: "CoWorkを起点に、チームでの共同編集・ナレッジ共有が日常運用に組み込まれる"
      },
      {
        category: "業務一気通貫",
        achievement: "調査から資料化・分析・社内共有までClaude1つで完結する業務フローを構築"
      },
      {
        category: "ブラウザ自動化",
        achievement: "Claude in Chromeを活用し、ブラウザ上の定型業務を大幅に効率化"
      },
      {
        category: "成果物完成度",
        achievement: "Claude Designにより、ドキュメント・スライド・図表まで高品質に仕上げ可能"
      }
    ]
  },

  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "Claude基礎と主要機能",
        description: "Claudeの全体像、ProjectsやArtifactsといった基本機能、プロンプト設計の原則を体系的に習得します。日常業務のどの場面でClaudeを使うべきか、判断基準を含めて理解できるようになります",
        image: "/images/services/detail/1485827404703-robot.jpg"
      },
      {
        title: "CoWork活用",
        description: "CoWorkを使った共同作業の進め方、チーム内でのナレッジ共有、レビューや承認を含む業務フローへの組み込みを習得。個人利用から組織利用へとClaudeの活用範囲を拡張します",
        image: "/images/services/detail/1522202176988-collaboration.jpg"
      },
      {
        title: "Claude in Chrome実践",
        description: "Claude in Chromeを使ったブラウザ上での情報収集・フォーム入力・サイト操作の自動化、社内システムとの連携など、日々の繰り返し業務を効率化する実践手法を習得します",
        image: "/images/services/detail/1516321318423-laptop.jpg"
      },
      {
        title: "Claude Designによる成果物制作",
        description: "Claude Designを使ったドキュメント・スライド・図表・レポートなどの成果物制作を実践。アイデア出しから完成までをClaude上で完結させ、社外提出にも耐える品質を実現する技術を習得します",
        image: "/images/services/detail/1553028826-whiteboard.jpg"
      }
    ]
  },

  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社の業務環境に合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在のClaude活用状況ヒアリング",
      "業務適合プラン策定",
      "Claude研修実施",
      "効果測定・継続サポート"
    ],
    conclusionTitle: "Claude活用の高度化をお考えの皆さまへ",
    conclusionText: "Claudeは使い方次第で、単なるAIアシスタントから業務の中核プラットフォームへと姿を変えます。CoWork・Claude in Chrome・Claude Design等の機能を組み合わせれば、調査・資料作成・共同編集・ブラウザ業務まで一気通貫で効率化が可能です。LandBridgeは、貴社の業務に即したClaude活用の定着を全力で支援します。"
  },

  additionalCTA: {
    title: "Claude研修で業務全般の生産性向上",
    description: "Claudeを業務の中核に据え、組織の生産性を引き上げます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "業務でClaudeを活用したい全職種"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "Claude主要機能・実践活用技術"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },

  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "Claudeを使ったことがない社員でも受講できますか？",
        answer: "はい。基礎機能から段階的に学習する構成のため、Claude未経験の方でも問題なく受講していただけます。受講者のレベルに応じてカリキュラムをカスタマイズいたします。"
      },
      {
        question: "ChatGPTなど他のAIを既に使っている場合、重複しませんか？",
        answer: "Claudeは長文処理・コード生成・Projects機能などに強みがあり、他AIとの使い分けを前提に設計しています。研修では併用方針も含めて整理し、業務最適な使い分けを習得していただきます。"
      },
      {
        question: "開発者でなくても、Claude Codeの内容についていけますか？",
        answer: "開発者向け内容は希望に応じて深度を調整します。非開発者中心の場合はCoWork・Claude Design・Claude in Chrome等、業務寄りの機能を中心に構成いたします。"
      },
      {
        question: "セキュリティや情報管理面で配慮すべき点はありますか？",
        answer: "企業のセキュリティポリシーに準拠した利用方法、機密情報の取り扱い、業務データの入力可否判断などを実践的に指導いたします。社内ガイドライン策定の支援も可能です。"
      },
      {
        question: "研修後、社内にClaude活用を定着させるためのフォローはありますか？",
        answer: "研修後のQ&Aサポート、業務テンプレート集の提供、定着度のモニタリングなど、継続的なフォロー体制をご用意しています。段階的な全社展開もご支援可能です。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("claude-training"),

  finalCTA: {
    title: "Claude活用の本格化に踏み出しませんか？",
    description: "貴社の業務にClaudeを深く組み込み、生産性を飛躍的に向上させるClaude研修をご提案いたします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}
