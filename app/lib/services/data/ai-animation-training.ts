import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_ANIMATION_TRAINING_METADATA: ServicePageMetadata = {
  title: 'AIアニメ制作研修 - AI駆動研究所',
  description: 'AI駆動研究所のAIアニメ制作研修。キャラクター生成、シーン生成、リップシンク、声優AIまで、AIを駆使したアニメ制作を体系的に習得し、企画から完成までを大幅に短縮します。',
  keywords: ['LandBridge', 'AIアニメ制作研修', 'AIアニメ', 'アニメ制作', 'キャラクター生成', 'リップシンク', '声優AI', 'AI動画', '企業研修', 'クリエイティブ'],
  url: 'https://www.landbridge.ai/services/ai-animation-training'
}

export const AI_ANIMATION_TRAINING_DATA: ServiceData = {
  pageTitle: "AIアニメ制作研修",
  heroTitle: "AIアニメ制作研修",
  heroSubtitle: "AIでアニメ制作の常識を覆し、企画から完成までを大幅短縮",
  heroImage: "/images/services/hero/ai-animation-training-hero.jpg",
  seoTitle: "AIアニメ制作研修 - 企画から完成までを大幅短縮 - AI駆動研究所",

  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  serviceOverview: {
    title: "AIアニメ制作研修の特徴",
    subtitle: "従来、アニメ制作は長期間・大規模・高コストが当たり前の領域でした。AIによるキャラクター生成・シーン生成・リップシンク・音声合成の進化により、企画から完成までの全工程が抜本的に見直されつつあります。当研修では、AIを駆使したアニメ制作の全プロセスを体系的に習得し、貴社のクリエイティブ制作を一段引き上げる技術をお伝えします。",
    descriptionTop: "AIアニメ制作の最新動向を踏まえ、キャラクター生成・シーン生成・リップシンク・音声合成・統合編集まで、アニメ制作の全工程をAIで効率化する専門研修プログラムです。制作期間を大幅に短縮しながら、企画意図に忠実な作品を仕上げる実践的なスキルを習得していただきます。",
    tools: [
      { name: "Claude", logo: "claude" },
      { name: "Higgsfield", logo: "higgsfield" }
    ],
    descriptionBottom: "キャラクターのビジュアル生成からシーン構築、リップシンク、声優AIによるボイス制作、編集ソフトでの統合作業まで、AIアニメ制作の全工程をハンズオンで習得。広告・販促アニメ、教育コンテンツ、社内向けアニメ動画など、様々な用途に対応した制作技術を学習します。研修後は外部スタジオへの依存を減らしつつ、企画から完成まで自社主導で進められる体制を構築できます。",
    featureImage: "/images/services/features/ai-animation-training-feature.jpg",
    items: [
      {
        title: "制作期間短縮",
        description: "従来数ヶ月かかっていたアニメ制作を、AI活用で大幅に短縮できます",
        image: "/images/services/detail/1485846234645-video.jpg"
      },
      {
        title: "コスト最適化",
        description: "外部スタジオへの依存を減らし、社内でアニメコンテンツを内製できる体制を構築します",
        image: "/images/services/detail/1460925895917-data.jpg"
      },
      {
        title: "表現の拡張",
        description: "キャラクター生成・声優AI・リップシンクで、これまでにない表現を低コストで実現します",
        image: "/images/services/detail/1509966756634-creative.jpg"
      }
    ]
  },

  midCTA: {
    title: "アニメ制作にAIを取り入れませんか？",
    description: "企画から完成までを大幅に短縮する、AIアニメ制作技術をご提案します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "アニメコンテンツの企画・制作に関わる全ての職種の皆さまに価値をお届けします",
    audiences: [
      {
        image: "/images/services/detail/1509966756634-creative.jpg",
        text: "{アニメ表現}をAIで強化したい{クリエイティブ}部門の方"
      },
      {
        image: "/images/services/detail/1551836022-marketing.jpg",
        text: "{広告・販促用アニメ}をスピーディに制作したい{広告・販促}担当の方"
      },
      {
        image: "/images/services/detail/1524178232363-classroom.jpg",
        text: "{教育・解説アニメ}を内製化したい{教育コンテンツ制作}担当の方"
      },
      {
        image: "/images/services/detail/1574717024653-camera.jpg",
        text: "{制作プロセス}を抜本的に効率化したい{映像制作}ディレクターの方"
      }
    ]
  },

  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "AIアニメ制作研修の導入前後で、制作プロセスと成果物にこのような変化が生まれます",
    beforeItems: [
      {
        category: "制作期間",
        issue: "1本のアニメ制作に数ヶ月単位の期間を要している"
      },
      {
        category: "制作コスト",
        issue: "外部スタジオ・声優への依存度が高く、コストが大きい"
      },
      {
        category: "企画と制作の距離",
        issue: "企画意図が制作工程で薄まり、最終成果物に反映しきれていない"
      },
      {
        category: "キャラクター制作",
        issue: "キャラクターデザインや作画の確保が難しく、制作開始が遅れがち"
      },
      {
        category: "音声収録",
        issue: "声優手配やスタジオ収録の調整に時間がかかっている"
      },
      {
        category: "更新運用",
        issue: "完成後の修正・派生展開のたびに、再制作コストが発生している"
      }
    ],
    afterItems: [
      {
        category: "期間短縮",
        achievement: "AIによる素材生成と編集自動化で、制作リードタイムを大幅に短縮"
      },
      {
        category: "コスト最適化",
        achievement: "外部依存を減らし、社内主導で制作する体制を構築可能"
      },
      {
        category: "企画反映",
        achievement: "企画担当者が制作工程に深く関与し、意図を成果物まで一気通貫で反映"
      },
      {
        category: "キャラ表現",
        achievement: "AIキャラクター生成により、ビジュアル設計の自由度を大きく拡張"
      },
      {
        category: "音声制作",
        achievement: "声優AIとリップシンクで、収録工程を大幅に効率化"
      },
      {
        category: "派生展開",
        achievement: "差分制作・別言語展開・修正対応がAIベースで容易に実現可能"
      }
    ]
  },

  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "AIアニメ制作の基礎と最新動向",
        description: "AIアニメ制作の全体像、従来制作との違い、主要ツール群の位置付け、商用利用と権利関係の基礎を体系的に整理。貴社のアニメ制作にAIをどう組み込むかの判断軸を持てるようになります",
        image: "/images/services/detail/1485827404703-robot.jpg"
      },
      {
        title: "キャラクター・シーン生成",
        description: "AIによるキャラクターデザイン、シーン背景の生成、世界観の統一手法、リファレンスを活用したスタイル固定など、アニメの土台となるビジュアル生成の実践技術を習得します",
        image: "/images/services/detail/1509966756634-creative.jpg"
      },
      {
        title: "音声・リップシンクと演出",
        description: "声優AIによるボイス制作、リップシンクの自動化、BGM・SE設計、演出意図に合わせた音響設計までをハンズオンで学習。アニメ作品としての完成度を引き上げる技術を習得します",
        image: "/images/services/detail/1574717024653-camera.jpg"
      },
      {
        title: "統合制作ワーク",
        description: "シナリオ・絵コンテ・素材生成・編集・音声統合まで、1本のアニメを企画から完成までAIベースで作り上げる統合ワークを実践。社内に再現可能な制作フローを定着させる方法を習得します",
        image: "/images/services/detail/1552664730-workshop.jpg"
      }
    ]
  },

  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社のアニメ制作ニーズに合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在のアニメ制作課題ヒアリング",
      "カスタマイズ研修プラン策定",
      "AIアニメ制作研修実施",
      "成果測定・継続サポート"
    ],
    conclusionTitle: "アニメ制作革新をお考えの皆さまへ",
    conclusionText: "AIアニメ制作は、単に作業時間を縮める手段ではありません。これまでコスト・期間の壁で諦めていた表現を社内で実現可能にし、企画意図を完成形まで一気通貫で運べる新しい制作モデルです。LandBridgeは、現場で即活用できるAIアニメ制作技術の習得を全力で支援します。"
  },

  additionalCTA: {
    title: "AIアニメ制作研修でクリエイティブを刷新",
    description: "AIで企画から完成までを大幅短縮し、表現の幅を広げます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },

  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "クリエイティブ・広告販促・教育コンテンツ制作担当"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "AIアニメ制作技術・統合制作フロー"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },

  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "アニメ制作の経験がなくても受講できますか？",
        answer: "はい。AIツールが多くの工程を支援するため、アニメ制作未経験の方でも段階的に学習いただけます。基礎概念から実践まで体系的にカバーする構成です。"
      },
      {
        question: "どのようなAIツールを使用しますか？",
        answer: "キャラクター・シーン生成、リップシンク、声優AI、編集など、各工程ごとに最適なAIツールを組み合わせて使用します。受講者の制作テーマに応じて、最適なツールセットをご提案いたします。"
      },
      {
        question: "商用利用や権利関係は問題ありませんか？",
        answer: "各AIツールの利用規約・商用利用条件・学習データの取り扱いを整理し、商用展開時に確認すべきポイントをカリキュラム内で解説します。貴社のリスク管理方針に沿った運用設計をご支援いたします。"
      },
      {
        question: "自社キャラクターのスタイルを維持できますか？",
        answer: "リファレンス画像の活用やスタイル固定のテクニックを通じて、シリーズや作品をまたいでもキャラクターの一貫性を維持できる手法を指導いたします。"
      },
      {
        question: "研修後はどのような成果物を作れるようになりますか？",
        answer: "広告・販促向けの短尺アニメ、サービス紹介アニメ、教育・解説アニメ、社内向け説明アニメなど、用途に応じた実用的なアニメコンテンツを企画から完成まで自走で制作できるようになります。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-animation-training"),

  finalCTA: {
    title: "アニメ制作革新の第一歩を踏み出しませんか？",
    description: "貴社のアニメ制作プロセスを抜本的に効率化する、AIアニメ制作研修をご提案いたします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}
