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
    image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=800&h=600&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-organization-os",
    title: "AI組織OS研修",
    description: "CursorとGitHubで「組織の脳みそ」を構築し、情報共有・引き継ぎ業務を革新。組織全体の生産性を向上させます。",
    href: "/services/ai-organization-os",
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-video",
    title: "AI動画生成研修",
    description: "Sora、Gemini、Higgsfield等のAI動画生成ツールを活用して、マーケティング動画やプレゼン動画を効率的に制作する技術を学びます。",
    href: "/services/ai-video-training",
    image: "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?w=800&h=600&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-coding",
    title: "AIコーディング研修",
    description: "GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。",
    href: "/services/ai-coding-training",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center",
    available: true,
    category: "enterprise"
  },
  {
    id: "individual-coaching",
    title: "AI駆動開発育成所",
    description: "完全審査制の個人向けバイブコーディング特化コーチング。Claude CodeやCursorを活用したAI駆動開発スキルを習得できます。",
    href: "/services/ai-talent-development",
    image: "https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=800&h=600&fit=crop&crop=center",
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