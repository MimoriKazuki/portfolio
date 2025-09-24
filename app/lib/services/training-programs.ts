import type { OtherTrainingProgram } from '@/app/lib/types/service'

/**
 * All available training programs data
 */
export const ALL_TRAINING_PROGRAMS: OtherTrainingProgram[] = [
  {
    id: "comprehensive-ai-training",
    title: "生成AI総合研修",
    description: "ChatGPTやClaude等の生成AIツールを活用し、未経験者から実務レベルまで体系的に学習。企業の現場で即戦力として活躍できる人材を育成します。",
    href: "/services/comprehensive-ai-training",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-writing",
    title: "AIライティング研修",
    description: "ChatGPTやClaude等を活用した効果的な文章作成技術を習得し、業務文書の品質向上と作業効率化を実現します。",
    href: "/services/ai-writing-training",
    image: "https://images.unsplash.com/photo-1455390582262-044cdead277a?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-video",
    title: "AI動画生成研修",
    description: "最新のAI動画生成ツールを活用して、マーケティング動画やプレゼンテーション動画を効率的に制作する技術を学びます。",
    href: "/services/ai-video-training",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-coding",
    title: "AIコーディング研修",
    description: "GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。",
    href: "/services/ai-coding-training",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "practical-ai",
    title: "生成AI実務活用研修",
    description: "日常業務における生成AIの具体的な活用シーンを学び、業務プロセス全体の効率化と品質向上を実現します。",
    href: "/services/practical-ai-training",
    image: "https://images.unsplash.com/photo-1556761175-b413da4baf72?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "individual-coaching",
    title: "AI人材育成所",
    description: "個人向けAIスキル向上プログラム。自分のペースでAIを学び、キャリアアップを目指せます。",
    href: "/services/ai-talent-development",
    image: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=400&h=300&fit=crop&crop=center",
    available: true,
    category: "individual"
  }
]

/**
 * Get other training programs excluding the current page
 */
export function getOtherTrainingPrograms(currentPageId: string): OtherTrainingProgram[] {
  return ALL_TRAINING_PROGRAMS.filter(program => program.id !== currentPageId)
}

/**
 * Generate otherTrainingPrograms section data
 */
export function generateOtherTrainingProgramsData(currentPageId: string) {
  return {
    title: "その他の研修プログラム",
    currentPageId,
    programs: getOtherTrainingPrograms(currentPageId)
  }
}