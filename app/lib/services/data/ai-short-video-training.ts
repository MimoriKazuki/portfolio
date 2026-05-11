import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_SHORT_VIDEO_TRAINING_METADATA: ServicePageMetadata = {
  title: 'AIショート動画研修 - AI駆動研究所',
  description: 'AI駆動研究所のAIショート動画研修。ClaudeとHiggsfieldを組み合わせたAIワークフローでSNS向け縦動画を量産し、マーケティング・広報の発信力を加速します。',
  keywords: ['LandBridge', 'AIショート動画研修', 'ショート動画', '縦動画', 'SNSマーケティング', 'Claude', 'Higgsfield', '企業研修', 'AI活用'],
  url: 'https://www.landbridge.ai/services/ai-short-video-training'
}

export const AI_SHORT_VIDEO_TRAINING_DATA: ServiceData = {
  pageTitle: "AIショート動画研修",
  heroTitle: "AIショート動画研修",
  heroSubtitle: "縦動画コンテンツをAIで量産し、SNSマーケティングを加速する",
  heroImage: "/images/services/hero/ai-short-video-training-hero.jpg",
  seoTitle: "SNS向け縦動画をAIで量産するAIショート動画研修 - AI駆動研究所",

  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  serviceOverview: {
    title: "AIショート動画研修の特徴",
    subtitle: "TikTok、Instagram Reels、YouTube ShortsをはじめとするSNS縦動画は、企業の情報発信における主戦場となっています。当研修では、最新のAI動画生成・音声合成・編集ツールを組み合わせて、SNSで成果を出すショート動画を継続的に量産する技術を習得していただけます。",
    descriptionTop: "ClaudeとHiggsfieldを軸とした最新のAI動画生成ワークフローに加え、AI音声合成・編集自動化までを一気通貫で学ぶ実践型の専門研修プログラムです。動画制作未経験のSNS担当者でも、構成設計から投稿運用までを自走できるようになります。",
    tools: [
      { name: "Claude", logo: "claude" },
      { name: "Higgsfield", logo: "higgsfield" }
    ],
    descriptionBottom: "ショート動画特有の構成（冒頭2秒のフック、テンポの良いカット割り、字幕設計）の基本から、AIによる素材生成、AI音声合成、AI編集ツールでの仕上げ、SNS各プラットフォームへの最適化までをカバー。研修後はAIを軸とした制作フローを社内で確立し、これまで外注や担当者の手作業に依存していたショート動画を、必要なときに必要な本数だけ自走で量産できるようになります。",
    featureImage: "/images/services/features/ai-short-video-training-feature.jpg",
    items: [
      {
        title: "縦動画量産",
        description: "AIによる素材生成と編集自動化で、SNS向け縦動画を継続的に量産できます",
        image: "/images/services/detail/1485846234645-video.jpg"
      },
      {
        title: "SNS最適化",
        description: "TikTok・Reels・Shortsの特性を踏まえた構成設計とフォーマット最適化を実現します",
        image: "/images/services/detail/1551836022-marketing.jpg"
      },
      {
        title: "音声・編集自動化",
        description: "AI音声合成とAI編集ツールで仕上げ工程を大幅短縮します",
        image: "/images/services/detail/1574717024653-camera.jpg"
      }
    ]
  },

  midCTA: {
    title: "ショート動画運用を加速しませんか？",
    description: "AIでSNS向け縦動画を量産する制作フローをご提案します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "SNS発信に関わる全ての職種・部署の皆さまに価値をお届けします",
    audiences: [
      {
        image: "/images/services/detail/1551836022-marketing.jpg",
        text: "{SNS向けショート動画}を継続発信したい{SNSマーケティング}担当の方"
      },
      {
        image: "/images/services/detail/1556761175-office.jpg",
        text: "{採用・広報動画}をスピーディに制作したい{広報・人事}担当の方"
      },
      {
        image: "/images/services/detail/1558655146-work.jpg",
        text: "{コンテンツ量産体制}を構築したい{コンテンツ制作}担当の方"
      },
      {
        image: "/images/services/detail/1574717024653-camera.jpg",
        text: "{縦動画クリエイティブ}の幅を広げたい{クリエイティブ}担当の方"
      }
    ]
  },

  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "AIショート動画研修の導入前後で、SNS運用と制作プロセスにこのような変化が生まれます",
    beforeItems: [
      {
        category: "投稿頻度",
        issue: "ショート動画の制作工数が重く、投稿頻度を維持できていない"
      },
      {
        category: "制作コスト",
        issue: "外注費や撮影費が高く、ショート動画への投資判断が鈍っている"
      },
      {
        category: "企画設計",
        issue: "縦動画の構成や見せ方が分からず、再生数が安定しない"
      },
      {
        category: "素材確保",
        issue: "撮影・素材調達に時間がかかり、機動的な発信ができていない"
      },
      {
        category: "音声品質",
        issue: "ナレーション収録の手間が大きく、音声クオリティが安定しない"
      },
      {
        category: "編集効率",
        issue: "編集工程が属人化し、担当者の手が空かないと投稿が止まる"
      }
    ],
    afterItems: [
      {
        category: "投稿継続",
        achievement: "AI量産フローで、計画通りの投稿頻度を継続的に維持可能"
      },
      {
        category: "コスト最適化",
        achievement: "外注・撮影への依存を大幅に削減し、社内で完結できる体制を構築"
      },
      {
        category: "構成設計",
        achievement: "SNS縦動画特有の構成原則を理解し、再生数の出る企画を量産可能"
      },
      {
        category: "素材生成",
        achievement: "AIによる映像生成で素材確保のボトルネックを解消し、機動的に発信可能"
      },
      {
        category: "音声統一",
        achievement: "AI音声合成により、ブランドに合った音声品質を安定供給"
      },
      {
        category: "編集自動化",
        achievement: "AI編集ツール活用と編集テンプレ化により、属人化を解消し編集スピードを大幅向上"
      }
    ]
  },

  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "ショート動画基礎と最新AIツール",
        description: "TikTok・Reels・Shortsそれぞれの特性、SNSアルゴリズムの基本、ショート動画市場の動向を整理。ClaudeとHiggsfieldを中心とした主要なAI動画生成ワークフローの位置付けと使い分けを体系的に習得します",
        image: "/images/services/detail/1551836022-marketing.jpg"
      },
      {
        title: "構成設計とプロンプト",
        description: "冒頭フック・展開・締めといった縦動画特有の構成設計、伝えたいメッセージを動画に落とし込むためのシナリオ作成、AI動画生成を成功させるプロンプト設計の実践技術を習得します",
        image: "/images/services/detail/1553028826-whiteboard.jpg"
      },
      {
        title: "動画生成と編集ワーク",
        description: "AI動画生成ツールでの素材作成、AI音声合成によるナレーション制作、AI編集ツールでのカット編集・字幕・BGM挿入までをハンズオン形式で実践。1本のショート動画を完成させるフローを身につけます",
        image: "/images/services/detail/1574717024653-camera.jpg"
      },
      {
        title: "SNS投稿運用への組み込み",
        description: "投稿スケジュール設計、効果測定、KPI改善、ブランドガイドラインへの適合まで、ショート動画を継続的な運用に乗せるための仕組み化を学習。社内に量産体制を定着させる方法を習得します",
        image: "/images/services/detail/1552664730-workshop.jpg"
      }
    ]
  },

  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社のSNS運用に合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在のSNS運用課題ヒアリング",
      "カスタマイズ研修プラン策定",
      "AIショート動画研修実施",
      "投稿運用支援・継続サポート"
    ],
    conclusionTitle: "ショート動画運用の加速をお考えの皆さまへ",
    conclusionText: "ショート動画は、もはや量と継続性の戦いです。撮影・編集の負担を理由に投稿が止まれば、SNSアルゴリズム上の評価も伸びません。AIによる素材生成・音声合成・編集自動化を組み合わせれば、必要な本数を必要なタイミングで投下できる体制を構築できます。LandBridgeは、貴社のSNS発信を加速するショート動画量産フローの定着を全力で支援します。"
  },

  additionalCTA: {
    title: "AIショート動画研修でSNS発信を加速",
    description: "縦動画コンテンツの量産体制で、SNSマーケティングを強化します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "SNSマーケティング・広報・コンテンツ担当"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "AIショート動画制作・SNS運用技術"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },

  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "動画制作の経験がなくても受講できますか？",
        answer: "はい。AIツールが多くの工程を支援するため、動画制作未経験のSNS担当者でも問題なく受講していただけます。構成設計から編集までを段階的に習得できる構成です。"
      },
      {
        question: "どのSNSプラットフォームに対応していますか？",
        answer: "TikTok、Instagram Reels、YouTube Shortsを中心に、縦動画フォーマット全般に対応します。各プラットフォーム特有のアルゴリズム傾向や尺の最適化にも触れます。"
      },
      {
        question: "AIで作った動画はブランドイメージに合わせられますか？",
        answer: "事前にブランドガイドラインや既存クリエイティブを共有いただき、トーン・配色・キャラクター方針に合致するプロンプト設計と編集テンプレを整備します。安心して継続運用していただけます。"
      },
      {
        question: "BGMやナレーションはどう対応しますか？",
        answer: "AI音声合成によるナレーション制作、ロイヤリティフリー音源の活用、商用利用ライセンスの確認方法など、音声・音楽周りを安全に運用するための実務知識まで含めて指導いたします。"
      },
      {
        question: "研修後、どれくらいの本数を量産できるようになりますか？",
        answer: "受講者・ツールの組み合わせにより異なりますが、企画から投稿までの工数を大幅に短縮できるため、従来比で数倍の本数を継続的に投稿できる体制構築が現実的に可能です。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-short-video-training"),

  finalCTA: {
    title: "ショート動画量産体制の構築に踏み出しませんか？",
    description: "貴社のSNS発信を加速する、AIショート動画研修をご提案いたします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}
