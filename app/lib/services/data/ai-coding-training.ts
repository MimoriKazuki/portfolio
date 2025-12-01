import type { ServiceData, ServicePageMetadata } from '@/app/lib/types/service'
import { generateOtherTrainingProgramsData } from '../training-programs'

export const AI_CODING_TRAINING_METADATA: ServicePageMetadata = {
  title: 'AIコーディング研修 - AI駆動研究所',
  description: 'AI駆動研究所のAIコーディング研修。GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。',
  keywords: ['LandBridge', 'AIコーディング研修', 'GitHub Copilot', 'Claude Code', 'AI支援プログラミング', 'コード生成', '開発効率化', 'プログラミング研修', 'AI開発'],
  url: 'https://www.landbridge.ai/services/ai-coding-training'
}

export const AI_CODING_TRAINING_DATA: ServiceData = {
  pageTitle: "AIコーディング研修",
  heroTitle: "AIコーディング研修",
  heroSubtitle: "GitHub CopilotやClaude Codeを活用し、開発効率を3〜5倍に向上",
  heroImage: "/images/services/hero/ai-coding-training-hero.jpg",
  seoTitle: "開発効率を革新するAI支援プログラミング研修 - AI駆動研究所",
  
  heroCTA: {
    inquiryText: "無料相談を予約する",
    documentText: "研修資料をダウンロード",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  serviceOverview: {
    title: "AIコーディング研修の特徴",
    subtitle: "ソフトウェア開発の世界において、AI支援プログラミングは新たなスタンダードとなりつつあります。当研修では、GitHub Copilot、Claude Code等の最先端AIツールを活用して、従来の開発プロセスを革新し、コード品質と開発効率を飛躍的に向上させる技術を習得していただけます。",
    descriptionTop: "最先端のAIコーディングツールを活用して、開発効率を飛躍的に向上させるスキルを習得する専門研修プログラムです。コード生成、デバッグ、リファクタリング、テストコード作成まで、開発プロセス全体をAIで効率化します。",
    tools: [
      { name: "Claude Code", logo: "claudecode" },
      { name: "Cursor", logo: "cursor" },
      { name: "Gemini", logo: "gemini" }
    ],
    descriptionBottom: "AI支援開発環境の構築から、効果的なプロンプト設計、チーム開発への適用方法まで、実践的なスキルを体系的に学習。フロントエンド、バックエンド、データベース操作など、あらゆる開発領域でAIを活用できるようになります。研修後は開発効率が3〜5倍向上し、コード品質も大幅に改善されます。",
    featureImage: "/images/services/features/ai-coding-training-feature.jpg",
    items: [
      {
        title: "開発効率向上",
        description: "コード生成から debugging まで、AI支援により開発速度を3-5倍向上させます",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "コード品質改善",
        description: "AIによるコードレビューと最適化提案により、保守性の高いコードを作成します",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=400&h=225&fit=crop&crop=center"
      },
      {
        title: "学習効率化",
        description: "新しい技術やフレームワークの習得時間を大幅に短縮し、継続的なスキルアップを実現",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=225&fit=crop&crop=center"
      }
    ]
  },
  
  midCTA: {
    title: "開発プロセスを革新しませんか？",
    description: "AI支援でプログラミング効率を劇的に向上させる技術をお教えします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  targetAudience: {
    title: "こんな方におすすめです",
    subtitle: "開発に関わる全てのエンジニアとマネージャーに価値をお届けします",
    audiences: [
      {
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=300&fit=crop&crop=center",
        text: "{Web・モバイル開発}の効率化を図りたい{フロントエンジニア}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=300&fit=crop&crop=center",
        text: "{API設計・実装}を効率化したい{バックエンドエンジニア}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=300&h=300&fit=crop&crop=center",
        text: "チームの{開発生産性}を向上させたい{開発マネージャー}の方"
      },
      {
        image: "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=300&h=300&fit=crop&crop=center",
        text: "{コーディングスキル}を短期間で習得したい{新人エンジニア}の方"
      }
    ]
  },
  
  expectedChanges: {
    title: "導入で得られる変化",
    subtitle: "AIコーディング研修の導入前後で、開発プロセスと成果物にこのような変化が生まれます",
    beforeItems: [
      {
        category: "開発速度",
        issue: "コード作成に時間がかかり、開発スケジュールが遅延している"
      },
      {
        category: "コード品質", 
        issue: "バグの発生率が高く、品質の安定しないコードが多い"
      },
      {
        category: "学習コスト",
        issue: "新しい技術習得に時間がかかり、最新技術への対応が遅れる"
      },
      {
        category: "属人化",
        issue: "エンジニアのスキル差が大きく、チーム全体の生産性にバラつきがある"
      },
      {
        category: "保守性",
        issue: "可読性が低く、後から修正・拡張が困難なコードが多い"
      },
      {
        category: "デバッグ効率",
        issue: "バグ発見と修正に多大な時間を要している"
      }
    ],
    afterItems: [
      {
        category: "生産性向上",
        achievement: "開発効率が3-5倍向上し、プロジェクトの早期完成が可能"
      },
      {
        category: "品質保証",
        achievement: "AI支援によるコードレビューで高品質なコードを安定して生産"
      },
      {
        category: "技術習得",
        achievement: "新技術の習得時間を大幅短縮し、常に最新技術を活用"
      },
      {
        category: "チーム統一",
        achievement: "チーム全体のコーディングレベルが底上げされ生産性が均一化"
      },
      {
        category: "保守効率",
        achievement: "可読性の高いコードにより、保守・拡張作業が大幅に効率化"
      },
      {
        category: "問題解決",
        achievement: "AI支援でバグ発見・修正が迅速化し、開発サイクルが改善"
      }
    ]
  },
  
  curriculum: {
    title: "研修内容（カリキュラム例）",
    modules: [
      {
        title: "AI支援開発環境構築",
        description: "GitHub Copilot、Claude Code、Cursor等の主要AI開発ツールのセットアップから基本操作まで、AI支援開発に必要な環境構築と基礎知識を体系的に習得します",
        image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=300&h=200&fit=crop"
      },
      {
        title: "AI支援コーディング実践",
        description: "実際のプロジェクトを題材として、AI支援によるコード生成、リファクタリング、テストコード作成等の実践的な開発手法を習得し、開発効率を劇的に向上させます",
        image: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300&h=200&fit=crop"
      },
      {
        title: "コード品質最適化",
        description: "AIを活用したコードレビュー、バグ検出、パフォーマンス最適化等の品質向上技術を学習。保守性と拡張性に優れたコード作成技術を身につけます",
        image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=300&h=200&fit=crop"
      },
      {
        title: "チーム開発への適用",
        description: "AI支援開発をチーム全体で効果的に活用するための運用方法、コーディング規約の策定、知識共有の仕組みづくりまで、組織レベルでの導入方法を習得します",
        image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=300&h=200&fit=crop"
      }
    ]
  },
  
  flow: {
    title: "研修導入までの流れ",
    subtitle: "お問い合わせから研修実施、効果測定まで、貴社の開発環境に合わせて丁寧にサポートいたします",
    steps: [
      "お問い合わせ・ご相談",
      "現在の開発課題ヒアリング",
      "技術スタック適合性検証",
      "AIコーディング研修実施",
      "効果測定・継続サポート"
    ],
    conclusionTitle: "開発効率革新をお考えの皆さまへ",
    conclusionText: "AI支援プログラミングは単なる効率化ツールではありません。開発チームの創造性を解放し、より高次元の問題解決に集中できる環境を構築する戦略的技術です。LandBridgeは、現場で即活用できるAI支援開発技術の習得を全力で支援します。"
  },
  
  additionalCTA: {
    title: "AIコーディング研修で開発効率向上",
    description: "開発生産性を飛躍的に向上させます",
    inquiryHref: "/contact",
    documentHref: "/documents"
  },
  
  overviewTable: {
    title: "開催概要",
    rows: [
      ["対象者", "エンジニア・開発マネージャー"],
      ["受講形式", "オンライン or 対面（社内実施可）"],
      ["受講内容", "AI支援プログラミング技術"],
      ["時間", "1回90分 × 6回（計9時間）"],
      ["費用", "要相談（内容・人数により変動）"]
    ]
  },
  
  faq: {
    title: "よくあるご質問",
    items: [
      {
        question: "プログラミング初心者でも受講できますか？",
        answer: "基本的なプログラミング知識があれば受講可能です。AI支援により、従来よりも短期間で実践的な開発スキルを習得していただけます。"
      },
      {
        question: "どのプログラミング言語に対応していますか？",
        answer: "Python、JavaScript、TypeScript、Java、C#、Go等の主要言語に対応。受講者の技術スタックに合わせてカスタマイズいたします。"
      },
      {
        question: "既存のコードベースにも適用できますか？",
        answer: "はい。既存プロジェクトへのAI支援技術導入方法も含めて指導いたします。段階的な導入により、既存開発への影響を最小化できます。"
      },
      {
        question: "セキュリティ面での配慮はありますか？",
        answer: "企業のセキュリティポリシーに準拠したAIツールの利用方法をお教えします。機密情報の取り扱いについても詳しく指導いたします。"
      },
      {
        question: "研修後の開発効率向上はどの程度期待できますか？",
        answer: "一般的に3-5倍の開発効率向上が見込まれます。プロジェクトの性質や技術スタックによって効果は変動しますが、大幅な改善を実現できます。"
      }
    ]
  },
  
  otherTrainingPrograms: generateOtherTrainingProgramsData("ai-coding"),
  
  finalCTA: {
    title: "開発効率革新の第一歩を踏み出しませんか？",
    description: "貴社の開発プロセスを劇的に効率化するAI支援プログラミング研修をご提案いたします",
    inquiryHref: "/contact",
    documentHref: "/documents"
  }
}