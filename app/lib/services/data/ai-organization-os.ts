import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_ORGANIZATION_OS_METADATA: ServicePageMetadata = {
  title: 'AI組織OS研修 - AI駆動研究所',
  description: 'AI駆動研究所のAI組織OS研修。CursorとGitHubを活用した社内ナレッジ管理で「組織の脳みそ」を構築。情報共有・引き継ぎ業務を革新し、組織全体の生産性を向上させます。',
  keywords: ['LandBridge', 'AI組織OS研修', 'Cursor', 'GitHub', 'ナレッジ管理', '組織OS', '情報共有', '引き継ぎ', 'AI活用', '企業研修', 'DX推進'],
  url: 'https://www.landbridge.ai/services/ai-organization-os'
}

export const AI_ORGANIZATION_OS_DATA: ServiceData = {
  pageTitle: "AI組織OS研修",
  heroTitle: "AI組織OS研修",
  heroSubtitle: "CursorとGitHubで「組織の脳みそ」を構築し、情報共有を革新する",
  heroImage: "/images/services/hero/ai-organization-os-hero.jpg",
  seoTitle: "組織の知識をAIで活用 - AI組織OS研修 | AI駆動研究所",

  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  serviceOverview: {
    title: "AI組織OS研修の特徴",
    subtitle: "シリコンバレーで注目されている「組織OS」の概念を日本企業に導入。社員の役割・タスク・進捗をGitHubで管理し、CursorのAIに質問することで組織全体の状況を誰でも把握できる環境を構築します。",
    descriptionTop: "「組織の脳みそ」を作る革新的なナレッジ管理研修です。社員が日々の業務情報を更新することで、AIが組織全体の知識ベースとなり、誰でも必要な情報に瞬時にアクセスできる環境を実現します。",
    tools: [
      { name: "Cursor", logo: "cursor" },
      { name: "GitHub", logo: "github" }
    ],
    descriptionBottom: "管理者は社員に状況確認をせずともAIに質問するだけで現状を把握でき、社員も自分のタスクや部署の状況をAIに聞くことで漏れなく対応可能に。異動・退職時の引き継ぎも、更新さえしていればAIに質問して確認できるため、引き継ぎ業務からも解放されます。ディレクトリ設計から運用ノウハウまで、組織OS導入を成功させるすべてを伝授します。",
    featureImage: "/images/services/features/ai-organization-os-feature.jpg",
    items: [
      {
        title: "組織の脳みそ構築",
        description: "社員の役割・タスク・進捗をGitHubで一元管理し、AIが組織全体を理解できる基盤を構築",
        image: "/images/services/detail/1553028826-whiteboard.jpg"
      },
      {
        title: "AIへの質問で状況把握",
        description: "Cursor内でAIに質問するだけで、組織の今を瞬時に把握。確認作業の時間を大幅削減",
        image: "/images/services/detail/1516321318423-laptop.jpg"
      },
      {
        title: "引き継ぎ不要化",
        description: "日々の更新さえしていれば、異動・退職時もAIに質問することで業務を引き継ぎ可能に",
        image: "/images/services/detail/1434626881859-chart.jpg"
      }
    ]
  },

  midCTA: {
    title: "組織の情報共有を根本から変えませんか？",
    description: "CursorとGitHubで「組織の脳みそ」を構築し、情報の属人化から解放されます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "組織の情報共有・ナレッジ管理に課題を感じている方に価値をお届けします",
    audiences: [
      {
        image: "/images/services/detail/1519085360753-business.jpg",
        text: "{部下の状況把握}に時間がかかっている{マネージャー・管理職}の方"
      },
      {
        image: "/images/services/detail/1560250097-executive.jpg",
        text: "{組織全体の可視化}を進めたい{経営者・役員}の方"
      },
      {
        image: "/images/services/detail/1573497019940-woman.jpg",
        text: "{ナレッジ管理・DX推進}を担当している{情報システム部門}の方"
      },
      {
        image: "/images/services/detail/1517048676732-team.jpg",
        text: "{引き継ぎ・情報共有}の効率化を目指す{人事・総務}の方"
      }
    ]
  },

  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "AI組織OS研修の導入前後で、組織の情報共有にこのような変化が生まれます",
    beforeItems: [
      {
        category: "状況確認",
        issue: "部下やチームの状況把握のため、毎回個別に確認が必要で時間がかかる"
      },
      {
        category: "情報の属人化",
        issue: "特定の人しか知らない情報が多く、その人がいないと業務が止まる"
      },
      {
        category: "引き継ぎ負担",
        issue: "異動・退職時の引き継ぎに膨大な時間と労力がかかる"
      },
      {
        category: "ナレッジ散逸",
        issue: "過去の経緯や決定事項が分からず、同じ議論を繰り返してしまう"
      },
      {
        category: "情報検索",
        issue: "必要な情報がどこにあるか分からず、探すのに時間がかかる"
      },
      {
        category: "組織理解",
        issue: "他部署で何が起きているか把握できず、連携がうまくいかない"
      }
    ],
    afterItems: [
      {
        category: "即時把握",
        achievement: "AIに質問するだけで、チームや組織の状況を瞬時に把握できる"
      },
      {
        category: "知識の共有化",
        achievement: "情報が組織全体で共有され、誰でも必要な情報にアクセス可能"
      },
      {
        category: "引き継ぎ解放",
        achievement: "日々の更新でAIが引き継ぎ資料となり、引き継ぎ業務が激減"
      },
      {
        category: "ナレッジ蓄積",
        achievement: "過去の経緯や決定事項もAIが記憶し、いつでも参照可能に"
      },
      {
        category: "瞬時検索",
        achievement: "自然言語でAIに質問するだけで、必要な情報に即座にアクセス"
      },
      {
        category: "組織可視化",
        achievement: "全社の動きがAIを通じて可視化され、部門間連携がスムーズに"
      }
    ]
  },

  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "組織OS概念とツール導入",
        description: "シリコンバレー発の組織OS概念を解説し、CursorとGitHubの基本操作から環境構築まで、導入に必要な基礎知識と技術を習得します",
        image: "/images/services/detail/1552664730-workshop.jpg"
      },
      {
        title: "ディレクトリ設計・運用ルール",
        description: "組織構造に合わせたフォルダ・ファイル設計、更新ルールの策定、命名規則など、持続可能な運用のためのベストプラクティスを学びます",
        image: "/images/services/detail/1507925921958-desk.jpg"
      },
      {
        title: "情報更新・記録の実践",
        description: "日々のタスク・進捗・決定事項の記録方法、効果的な情報の構造化、AIが理解しやすい記述方法など、実践的なスキルを習得します",
        image: "/images/services/detail/1531482615713-meeting.jpg"
      },
      {
        title: "AI活用・運用定着ワークショップ",
        description: "CursorでのAI質問テクニック、組織内への展開方法、継続的な運用のコツなど、実際の業務への適用と定着を支援します",
        image: "/images/services/detail/1522071820081-teamwork.jpg"
      }
    ]
  },

  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、組織OS定着まで、貴社の状況に合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "組織構造・課題ヒアリング",
      "カスタマイズ研修プラン策定",
      "AI組織OS研修実施",
      "運用定着・継続サポート"
    ],
    conclusionTitle: "組織の情報共有革新をお考えの皆さまへ",
    conclusionText: "AI組織OSは単なるツール導入ではありません。組織の知識を誰もがAIを通じてアクセスできる「組織の脳みそ」を構築し、情報の属人化から解放される根本的な変革です。LandBridgeは、貴社の組織構造に最適化された組織OS構築を全力で支援します。"
  },

  additionalCTA: {
    title: "AI組織OSで情報共有を革新",
    description: "「組織の脳みそ」構築で、情報の属人化から解放されます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "経営層・管理職・情報システム部門"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "組織OS構築・Cursor/GitHub活用"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（組織規模・内容により変動）"]
    ]
  },

  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "プログラミング経験がなくても導入できますか？",
        answer: "はい。GitHubやCursorの操作は直感的で、プログラミング経験がなくても導入可能です。研修ではITに不慣れな方でも使いこなせるよう丁寧に指導します。"
      },
      {
        question: "社員全員が毎日更新する必要がありますか？",
        answer: "理想的には毎日の更新が望ましいですが、週次など組織の状況に合わせた運用ルールを設計可能です。最低限の更新でも十分な効果が得られる仕組みを構築します。"
      },
      {
        question: "セキュリティ面は大丈夫ですか？",
        answer: "GitHub Enterpriseの活用やプライベートリポジトリ設定により、セキュリティを確保できます。研修では適切なアクセス権限設定も含めて指導します。"
      },
      {
        question: "既存のナレッジ管理ツールとの併用は可能ですか？",
        answer: "可能です。既存ツールからの段階的な移行や、併用運用の方法についてもアドバイスいたします。"
      },
      {
        question: "導入後の運用サポートはありますか？",
        answer: "研修後も運用定着までの継続サポートを提供。運用上の課題や改善点について、定期的なフォローアップを行います。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-organization-os"),

  finalCTA: {
    title: "組織の情報共有革新を始めませんか？",
    description: "CursorとGitHubで「組織の脳みそ」を構築し、情報の属人化から解放されます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}
