import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const PRACTICAL_AI_TRAINING_METADATA: ServicePageMetadata = {
  title: '生成AI実務活用研修 - AI駆動研究所',
  description: 'AI駆動研究所の生成AI実務活用研修。日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。',
  keywords: ['LandBridge', '生成AI実務活用研修', '業務効率化', 'AI活用', '実務応用', 'プロセス改善', '生産性向上', '企業研修', 'DX推進'],
  url: 'https://www.landbridge.ai/services/practical-ai-training'
}

export const PRACTICAL_AI_TRAINING_DATA: ServiceData = {
  pageTitle: "生成AI実務活用研修",
  heroTitle: "生成AI実務活用研修",
  heroSubtitle: "明日から使える実践的なAI活用スキルで、業務効率を劇的に向上",
  heroImage: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=1920&h=1080&fit=crop&crop=center",
  seoTitle: "日常業務を革新する生成AI実務活用研修 - AI駆動研究所",
  
  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  serviceOverview: {
    title: "生成AI実務活用研修の特徴",
    subtitle: "AI技術が急速に進歩する中、日常業務での具体的な活用方法を知ることが競争力の源泉となっています。当研修では、様々な業務シーンにおける生成AIの実践的な活用方法を学び、業務プロセス全体の効率化と品質向上を実現する技術を習得していただけます。",
    items: [
      {
        title: "実務直結",
        description: "理論ではなく、明日から使える具体的な業務活用方法を重点的に学習します",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "部門横断",
        description: "営業、マーケティング、人事、経理など、あらゆる部門での活用方法をカバーします",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "プロセス改善",
        description: "個別業務の効率化から業務フロー全体の最適化まで、段階的に改善を実現します",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=225&fit=crop&crop=center"
      }
    ]
  },
  
  midCTA: {
    title: "業務革新を実現しませんか？",
    description: "貴社の業務プロセスに特化したAI活用方法をお教えします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "全ての職種・部門の方が対象です。業務効率化を求める全ての方に価値をお届けします",
    audiences: [
      {
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=300&fit=crop&crop=center",
        text: "{顧客対応・販促活動}をAIで効率化したい{営業・マーケティング}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=300&h=300&fit=crop&crop=center",
        text: "{採用・人事評価}等の業務を効率化したい{人事・総務}担当の方"
      },
      {
        image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=300&h=300&fit=crop&crop=center",
        text: "{データ分析・レポート作成}を効率化したい{経理・財務}担当の方"
      },
      {
        image: "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=300&h=300&fit=crop&crop=center",
        text: "{日常業務}をAIで劇的に効率化したい{一般事務・アシスタント}の方"
      }
    ]
  },
  
  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "生成AI実務活用研修の導入前後で、日常業務にこのような変化が生まれます",
    beforeItems: [
      {
        category: "作業時間",
        issue: "定型業務に多くの時間を取られ、重要な業務に集中できない"
      },
      {
        category: "業務品質", 
        issue: "人的ミスが発生しやすく、品質のバラつきが課題となっている"
      },
      {
        category: "情報収集",
        issue: "必要な情報の収集・整理に時間がかかり、意思決定が遅れる"
      },
      {
        category: "創造性",
        issue: "ルーティンワークに追われ、創造的な業務に時間を割けない"
      },
      {
        category: "学習コスト",
        issue: "新しいツールや手法の習得に時間がかかり、変化に対応できない"
      },
      {
        category: "スキル格差",
        issue: "チーム内でのスキル差が大きく、業務効率にバラつきがある"
      }
    ],
    afterItems: [
      {
        category: "時間活用",
        achievement: "定型業務の自動化により、戦略的業務に集中できる時間を確保"
      },
      {
        category: "品質向上",
        achievement: "AI支援により一定品質を保った成果物を安定して産出"
      },
      {
        category: "意思決定",
        achievement: "AI活用による迅速な情報収集・分析で、素早い意思決定を実現"
      },
      {
        category: "付加価値",
        achievement: "効率化で生まれた時間を使い、より高付加価値な業務を創出"
      },
      {
        category: "適応力",
        achievement: "AI支援により新技術・新手法への適応が迅速に"
      },
      {
        category: "チーム力",
        achievement: "全員がAI活用できることで、チーム全体の生産性が向上"
      }
    ]
  },
  
  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "業務分析とAI適用設計",
        description: "現在の業務フローを分析し、AI活用によって効率化できるポイントを特定。業務の特性に応じた最適なAIツールの選択と活用戦略を策定する手法を習得します",
        image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=300&h=200&fit=crop"
      },
      {
        title: "部門別AI活用実践",
        description: "営業、マーケティング、人事、経理等、各部門特有の業務でのAI活用方法を実践的に学習。部門固有の課題に対する具体的なソリューションを習得します",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop"
      },
      {
        title: "業務自動化・効率化技術",
        description: "定型業務の自動化から複雑なタスクの効率化まで、AIを活用した業務改善技術を体系的に学習。実際の業務に即座に適用できるスキルを身につけます",
        image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=300&h=200&fit=crop"
      },
      {
        title: "組織レベルでの導入・運用",
        description: "個人レベルでの活用から組織全体への展開まで、AI活用を組織に根付かせるための導入戦略、運用ルール、効果測定方法を習得します",
        image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=300&h=200&fit=crop"
      }
    ]
  },
  
  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社の業務特性に合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在の業務フロー分析",
      "AI活用ポイントの特定",
      "カスタマイズ研修実施",
      "効果測定・継続改善"
    ],
    conclusionTitle: "業務革新をお考えの皆さまへ",
    conclusionText: "生成AIの真の価値は、日常業務での実践的活用にあります。理論ではなく、明日から使える具体的な手法で、貴社の業務プロセスを根本から変革します。LandBridgeは、現場に即したAI実務活用技術の習得を全力で支援します。"
  },
  
  additionalCTA: {
    title: "生成AI実務活用で業務を革新",
    description: "貴社の業務プロセスを劇的に効率化します",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "全職種・全部門の社員"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "実務でのAI活用手法"],
      ["時間", "1回90分 × 4回（計6時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },
  
  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "AI初心者でも業務で活用できるようになりますか？",
        answer: "はい。専門知識不要で、日常業務で即活用できる実践的な手法に特化したカリキュラムです。研修終了後すぐに業務効率化を実感していただけます。"
      },
      {
        question: "業界特有の業務にも対応していますか？",
        answer: "事前ヒアリングで業界・業種特有の課題を把握し、貴社の業務内容に特化したAI活用方法をカスタマイズして提供いたします。"
      },
      {
        question: "既存のシステムとの連携は可能ですか？",
        answer: "可能です。既存の業務システムやツールとAIを連携させる方法も含めて指導いたします。段階的な導入により、現行業務への影響を最小化できます。"
      },
      {
        question: "どの程度の業務効率向上が期待できますか？",
        answer: "業務内容により差はありますが、一般的に30-50%の作業時間短縮が見込まれます。定型業務では80%以上の効率化も可能です。"
      },
      {
        question: "研修後の継続サポートはありますか？",
        answer: "研修終了後も実務での活用に関する質問対応や、新たな活用方法の提案等、継続的なサポートを提供いたします。"
      }
    ]
  },
  
  otherTrainingPrograms: generateOtherTrainingProgramsData("practical-ai"),
  
  finalCTA: {
    title: "業務革新の第一歩を踏み出しませんか？",
    description: "貴社の日常業務を劇的に効率化する生成AI実務活用研修をご提案いたします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}