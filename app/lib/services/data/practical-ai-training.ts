import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const PRACTICAL_AI_TRAINING_METADATA: ServicePageMetadata = {
  title: '生成AI実務活用研修 - AI駆動研究所',
  description: 'AI駆動研究所の生成AI実務活用研修。実際の業務課題を題材に、生成AIの実践的な活用方法を習得。即座に現場で成果を出せるスキルを身につけます。',
  keywords: ['生成AI実務活用', 'AI研修', '企業研修', 'ChatGPT', 'Claude', '業務効率化', '実践研修', 'DX推進', 'AI活用'],
  url: 'https://www.landbridge.ai/services/practical-ai-training'
}

export const PRACTICAL_AI_TRAINING_DATA: ServiceData = {
  pageTitle: "生成AI実務活用研修",
  heroTitle: "生成AI実務活用研修",
  heroSubtitle: "実際の業務課題で学ぶ、即戦力のAIスキル",
  heroImage: "/images/services/hero/practical-ai-training-hero.jpg",
  seoTitle: "生成AI実務活用研修 - 現場で成果を出すAI活用 | AI駆動研究所",

  heroCTA: {
    inquiryText: "お問い合わせ",
    documentText: "資料ダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  },

  serviceOverview: {
    title: "生成AI実務活用研修の特徴",
    subtitle: "理論だけでなく、貴社の実際の業務課題を題材にした実践型研修。研修終了後すぐに現場で成果を出せるスキルを習得します。",
    descriptionTop: "生成AIの理論学習と実務への応用を組み合わせた実践重視の研修プログラムです。貴社の実際の業務フローを分析し、AI導入による具体的な改善効果を体感しながら学習します。",
    tools: [
      { name: "ChatGPT", logo: "chatgpt" },
      { name: "Claude", logo: "claude" },
      { name: "Gemini", logo: "gemini" }
    ],
    descriptionBottom: "研修では、受講者様が日常的に行っている業務を題材に、生成AIを活用した効率化・品質向上の手法を実践的に学びます。研修終了後は、学んだスキルをそのまま現場で活用し、即座に成果を出すことができます。",
    featureImage: "/images/services/features/practical-ai-training-feature.jpg",
    items: [
      {
        title: "実務直結の学習",
        description: "貴社の実際の業務課題を題材に学習するため、研修内容をそのまま現場で活用できます",
        image: "/images/services/detail/1677442136019-ai-gen.jpg"
      },
      {
        title: "即効性のある成果",
        description: "研修中に実際の業務改善を行うため、研修終了と同時に効率化効果を実感できます",
        image: "/images/services/detail/1552664730-workshop.jpg"
      },
      {
        title: "継続的な活用支援",
        description: "研修後も実務でのAI活用をサポートし、組織全体への展開を支援します",
        image: "/images/services/detail/1434030216411-study.jpg"
      }
    ]
  },

  midCTA: {
    title: "実務で成果を出すAI活用スキル",
    description: "理論だけで終わらない、現場で即座に活きる実践的なAIスキルを習得します",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  },

  targetAudience: {
    title: "生成AI実務活用研修の対象者",
    subtitle: "AIを実務で活用したいすべての方が対象です",
    audiences: [
      {
        image: "/images/services/detail/1560250097-executive.jpg",
        text: "部門の{業務効率化}を推進する{マネージャー}の方"
      },
      {
        image: "/images/services/detail/1552664730-workshop.jpg",
        text: "{DX推進}の具体的成果を求める{プロジェクトリーダー}の方"
      },
      {
        image: "/images/services/detail/1600880292203-group.jpg",
        text: "日々の業務で{生産性向上}を図りたい{実務担当者}の方"
      },
      {
        image: "/images/services/detail/1529156069898-friends.jpg",
        text: "{実践的なAIスキル}を身につけたい{意欲的な社員}の方"
      }
    ]
  },

  expectedChanges: {
    title: "生成AI実務活用研修による変化",
    subtitle: "実際の業務を題材にした研修で、即座に成果を出せるスキルを習得します",
    beforeItems: [
      {
        category: "理論偏重",
        issue: "AI研修を受けたが、実際の業務でどう活用すればいいかわからない"
      },
      {
        category: "成果不明",
        issue: "AIツールを導入したが、具体的な効果が見えない"
      },
      {
        category: "活用限定",
        issue: "簡単な質問応答にしかAIを使えていない"
      },
      {
        category: "定着しない",
        issue: "研修後、学んだ内容が日常業務で活かせていない"
      },
      {
        category: "個人差",
        issue: "社員によってAI活用のレベルに大きな差がある"
      },
      {
        category: "展開困難",
        issue: "一部の社員のスキルを組織全体に広げられない"
      }
    ],
    afterItems: [
      {
        category: "実践主義",
        achievement: "自社の業務課題を題材に学び、即座に実務で活用"
      },
      {
        category: "効果可視化",
        achievement: "研修中に業務改善を実施し、具体的な効果を数値で確認"
      },
      {
        category: "高度活用",
        achievement: "複雑な業務プロセスにもAIを効果的に組み込む"
      },
      {
        category: "定着促進",
        achievement: "実務に直結した学習により、習得スキルが確実に定着"
      },
      {
        category: "底上げ",
        achievement: "全社員が一定レベル以上のAI活用スキルを習得"
      },
      {
        category: "組織展開",
        achievement: "成功事例を元に、組織全体でのAI活用を推進"
      }
    ]
  },

  curriculum: {
    title: "生成AI実務活用研修のカリキュラム",
    modules: [
      {
        title: "業務分析とAI適用設計",
        description: "受講者様の実際の業務フローを詳細に分析し、AI導入による改善ポイントを特定。具体的な効率化目標を設定し、実現に向けたロードマップを策定します",
        image: "/images/services/detail/1485827404703-robot.jpg"
      },
      {
        title: "実務プロンプト設計",
        description: "特定された業務改善ポイントに対応するプロンプトを設計。実際の業務データを使用したテストと改善を繰り返し、最適なプロンプトを完成させます",
        image: "/images/services/detail/1677442136019-ai-gen.jpg"
      },
      {
        title: "業務プロセス改善実践",
        description: "設計したプロンプトを実際の業務に適用し、効率化効果を検証。問題点の洗い出しと改善を行い、実用レベルのAI活用ワークフローを確立します",
        image: "/images/services/detail/1556761175-b413-meeting.jpg"
      },
      {
        title: "展開計画と効果測定",
        description: "研修で構築したAI活用手法を組織全体に展開するための計画を策定。KPI設定と効果測定の仕組みを構築し、継続的な改善サイクルを確立します",
        image: "/images/services/detail/1600880292203-group.jpg"
      }
    ]
  },

  flow: {
    title: "生成AI実務活用研修の導入ステップ",
    subtitle: "貴社の業務を深く理解し、最適なAI活用スキルを習得いただきます",
    steps: [
      "業務ヒアリング",
      "改善ポイント特定",
      "実践研修実施",
      "効果検証・調整",
      "組織展開支援"
    ],
    conclusionTitle: "実務で成果を出すAI活用",
    conclusionText: "生成AI実務活用研修は、理論だけで終わらない実践重視のプログラムです。貴社の実際の業務課題を解決しながらスキルを習得するため、研修終了後すぐに現場で成果を出すことができます。"
  },

  additionalCTA: {
    title: "即座に成果を出せるAI活用スキル",
    description: "実務を題材にした研修で、研修終了と同時に業務改善効果を実感",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  },

  overviewTable: {
    title: "生成AI実務活用研修　開催概要",
    rows: [
      ["対象者", "AIを実務で活用したいすべてのビジネスパーソン"],
      ["受講形式", "対面・オンライン・ハイブリッド対応"],
      ["研修構成", "4回セット（業務分析→プロンプト設計→実践→展開）"],
      ["1回の時間", "120分〜180分（実践ワーク重視）"],
      ["受講人数", "5名〜20名程度（個別サポート重視）"],
      ["カスタマイズ", "貴社の実際の業務課題を題材に完全カスタマイズ"],
      ["費用", "お見積り（規模・内容により個別算出）"]
    ]
  },

  faq: {
    title: "生成AI実務活用研修に関するよくあるご質問",
    items: [
      {
        question: "他のAI研修との違いは何ですか？",
        answer: "最大の違いは「実務直結」であることです。一般的なAI研修は汎用的な内容が中心ですが、当研修は貴社の実際の業務課題を題材に学習します。研修中に実際の業務改善を行うため、研修終了と同時に効果を実感できます。"
      },
      {
        question: "事前に業務データを提供する必要がありますか？",
        answer: "より効果的な研修のため、研修前に業務フローや課題についてヒアリングを行います。実際のデータの提供は必須ではありませんが、サンプルデータをご用意いただくことで、より実践的な研修が可能になります。"
      },
      {
        question: "研修中に構築したプロンプトはそのまま使用できますか？",
        answer: "はい、研修中に設計・検証したプロンプトは、そのまま実務でご使用いただけます。また、研修後も継続的に改善・更新していただけるよう、プロンプト管理の手法もお伝えします。"
      },
      {
        question: "どのような業務に適用できますか？",
        answer: "文書作成、データ分析、企画立案、カスタマーサポート、マーケティングなど、幅広い業務に適用可能です。事前ヒアリングにより、貴社の業務で最も効果が出やすい領域を特定し、重点的に取り組みます。"
      },
      {
        question: "研修後のサポートはありますか？",
        answer: "はい、研修後も実務でのAI活用をサポートいたします。定期的なフォローアップセッションや、追加の質問対応、組織展開に向けたコンサルティングなど、継続的な支援メニューをご用意しています。"
      },
      {
        question: "効果測定はどのように行いますか？",
        answer: "研修開始前に現状の業務効率を測定し、研修後の改善効果を数値で可視化します。作業時間の短縮率、処理件数の増加、品質スコアの向上など、貴社の業務に適したKPIを設定して効果を測定します。"
      }
    ]
  },

  otherTrainingPrograms: generateOtherTrainingProgramsData("practical-ai-training"),

  finalCTA: {
    title: "実務で即座に成果を出すAI活用",
    description: "貴社の業務課題を解決しながら、実践的なAIスキルを習得します",
    inquiryHref: "/contact",
    documentHref: "/documents/request/c8793579-1dea-4772-aa68-7aa7a48268f8"
  }
}
