import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_VIDEO_TRAINING_METADATA: ServicePageMetadata = {
  title: 'AI動画生成研修 - AI駆動研究所',
  description: 'AI駆動研究所のAI動画生成研修。Sora、Gemini、Higgsfieldなど最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。',
  keywords: ['LandBridge', 'AI動画生成研修', 'AI動画', '動画制作', 'マーケティング動画', 'プレゼン動画', 'Sora', 'Gemini', 'Higgsfield', '企業研修', 'AI活用'],
  url: 'https://www.landbridge.ai/services/ai-video-training'
}

export const AI_VIDEO_TRAINING_DATA: ServiceData = {
  pageTitle: "AI動画生成研修",
  heroTitle: "AI動画生成研修",
  heroSubtitle: "最新のAI技術で、プロレベルの動画を誰でも短時間で制作",
  heroImage: "/images/services/hero/ai-video-training-hero.jpg",
  seoTitle: "プロレベルの動画を誰でも作れるAI動画生成研修 - AI駆動研究所",
  
  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  serviceOverview: {
    title: "AI動画生成研修の特徴",
    subtitle: "動画コンテンツが求められる現代において、高品質な動画制作技術は強力なビジネス武器となります。当研修では、最新のAI動画生成ツールを活用して、従来の制作工程を大幅に効率化しながらプロレベルの動画を制作する技術を習得していただけます。",
    descriptionTop: "最新のAI動画生成技術を活用して、プロレベルの動画を効率的に制作するスキルを習得する専門研修プログラムです。動画制作の経験がない方でも、短期間で実践的な動画制作技術を身につけることができます。",
    tools: [
      { name: "Sora", logo: "sora" },
      { name: "Gemini", logo: "gemini" },
      { name: "Higgsfield", logo: "higgsfield" }
    ],
    descriptionBottom: "マーケティング動画、プレゼンテーション動画、研修コンテンツなど、様々な用途に対応した動画制作技術を学習。テキストから動画を生成する技術、既存映像の編集・加工、音声合成との連携まで、AI動画制作の全プロセスをカバーします。制作時間を90%短縮しながら、外注レベルの品質を実現します。",
    featureImage: "/images/services/features/ai-video-training-feature.jpg",
    items: [
      {
        title: "制作時間短縮",
        description: "従来数日かかっていた動画制作を数時間で完成させる革新的な効率化を実現します",
        image: "/images/services/detail/1485846234645-video.jpg"
      },
      {
        title: "コスト削減",
        description: "外注費用や高額な制作ツール不要で、社内でプロレベルの動画制作が可能になります",
        image: "/images/services/detail/1460925895917-data.jpg"
      },
      {
        title: "多様な用途対応",
        description: "マーケティング動画からプレゼン資料、研修コンテンツまで幅広く対応します",
        image: "/images/services/detail/1574717024653-camera.jpg"
      }
    ]
  },
  
  midCTA: {
    title: "動画制作を革新しませんか？",
    description: "AI技術で動画制作の常識を変える研修プログラムをご提案します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "動画制作に関わる全ての部署・職種の方に価値をお届けします",
    audiences: [
      {
        image: "/images/services/detail/1551836022-marketing.jpg",
        text: "{PR動画}を効率的に制作したい{マーケティング・広報}の方"
      },
      {
        image: "/images/services/detail/1556761175-office.jpg",
        text: "{提案動画・デモ}を素早く作成したい{営業・セールス}担当の方"
      },
      {
        image: "/images/services/detail/1524178232363-classroom.jpg",
        text: "{教育コンテンツ}を効率的に制作したい{人事・研修}担当の方"
      },
      {
        image: "/images/services/detail/1558655146-work.jpg",
        text: "{クリエイティブ}の可能性を拡張したい{デザイナー}の方"
      }
    ]
  },
  
  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "AI動画生成研修の導入前後で、制作プロセスと成果物にこのような変化が生まれます",
    beforeItems: [
      {
        category: "制作時間",
        issue: "動画制作に数日から数週間の長期間を要している"
      },
      {
        category: "制作コスト", 
        issue: "外注費用や高額なソフトウェアライセンス費が負担となっている"
      },
      {
        category: "専門知識",
        issue: "動画編集の専門スキルがなく、社内制作が困難"
      },
      {
        category: "品質統一",
        issue: "制作者によって動画の品質にバラつきが生じている"
      },
      {
        category: "更新頻度",
        issue: "制作工程の複雑さから動画コンテンツの更新が滞っている"
      },
      {
        category: "制作範囲",
        issue: "限られた用途でしか動画を活用できていない"
      }
    ],
    afterItems: [
      {
        category: "効率化",
        achievement: "制作時間を90%短縮し、迅速な動画コンテンツ展開が可能"
      },
      {
        category: "コスト最適化",
        achievement: "外注費用を大幅削減し、社内でプロ品質の動画を制作"
      },
      {
        category: "技術習得",
        achievement: "専門知識不要でプロレベルの動画制作技術を全社員が習得"
      },
      {
        category: "品質向上",
        achievement: "AI支援により一定以上の高品質を安定して維持"
      },
      {
        category: "継続運用",
        achievement: "簡単操作で定期的な動画コンテンツ更新が実現"
      },
      {
        category: "活用拡大",
        achievement: "マーケティングから研修まで幅広い用途で動画を戦略的活用"
      }
    ]
  },
  
  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "AI動画生成基礎",
        description: "AI動画生成技術の基本概念から主要ツールの概要、プロンプト設計の基礎まで、AI動画制作に必要な土台知識を体系的に習得し、効率的な制作ワークフローを理解します",
        image: "/images/services/detail/1574717024653-camera.jpg"
      },
      {
        title: "実践的制作技術",
        description: "Sora、Gemini、Higgsfield等の最新AI動画生成ツールを使った実践的な制作手法を学習。シーン設定からカメラワーク、音声同期まで、プロレベルの動画制作技術を身につけます",
        image: "/images/services/detail/1485846234645-video.jpg"
      },
      {
        title: "用途別制作手法",
        description: "マーケティング動画、プレゼンテーション動画、研修動画など、用途に応じた最適な制作アプローチと表現技法を習得。目的に合わせた効果的な動画コンテンツを制作できるようになります",
        image: "/images/services/detail/1460925895917-data.jpg"
      },
      {
        title: "業務活用ワークショップ",
        description: "実際の業務課題を題材として、AI動画生成技術を活用した解決策を検討・制作します。現場ですぐに活用できる実践的なノウハウと制作プロセスを確立できます",
        image: "/images/services/detail/1552664730-workshop.jpg"
      }
    ]
  },
  
  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社の動画制作ニーズに合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在の動画制作課題ヒアリング",
      "カスタマイズ研修プラン策定",
      "AI動画生成研修実施",
      "成果測定・継続サポート"
    ],
    conclusionTitle: "動画制作革新をお考えの皆さまへ",
    conclusionText: "AI動画生成は単なる効率化ツールではありません。貴社のコンテンツ戦略を根本から変革し、マーケティング効果を飛躍的に向上させる戦略的技術です。LandBridgeは、現場で即活用できるAI動画制作技術の習得を全力で支援します。"
  },
  
  additionalCTA: {
    title: "AI動画生成研修でマーケティング革新",
    description: "効率的な動画制作で訴求力を大幅向上します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "動画制作に関わる全職種"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "AI動画生成技術・制作手法"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },
  
  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "動画制作の経験がなくても受講できますか？",
        answer: "はい。動画制作未経験の方でも、AIツールの支援により短期間でプロレベルの動画制作技術を習得していただけるカリキュラムをご用意しています。"
      },
      {
        question: "どのようなAI動画生成ツールを使用しますか？",
        answer: "ChatGPTのSora、Gemini、Higgsfield等の最新AI動画生成ツールを使用します。受講者のニーズに応じて、最適なツールの組み合わせをご提案いたします。"
      },
      {
        question: "企業のブランドイメージに合った動画は作れますか？",
        answer: "事前ヒアリングで企業のブランドガイドラインを把握し、ブランドイメージに一致した動画制作技術をカスタマイズして提供いたします。"
      },
      {
        question: "研修後すぐに実務で活用できますか？",
        answer: "実際の業務課題を題材とした実践的なワークショップにより、研修終了後すぐに現場で活用できる技術を習得していただけます。"
      },
      {
        question: "動画のクオリティはどの程度まで向上しますか？",
        answer: "AI技術の活用により、従来の外注レベルに匹敵する高品質な動画を社内で制作できるようになります。制作スピードも大幅に向上します。"
      }
    ]
  },
  
  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-video"),
  
  finalCTA: {
    title: "動画制作革新の第一歩を踏み出しませんか？",
    description: "貴社の動画制作プロセスを劇的に効率化するAI動画生成研修をご提案いたします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}