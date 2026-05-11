import type { OtherTrainingProgram } from '@/app/lib/types/service'

/**
 * All available training programs data
 */
export const ALL_TRAINING_PROGRAMS: OtherTrainingProgram[] = [
  {
    id: "ai-coding",
    title: "AIコーディング研修",
    description: "GitHub Copilot、Claude Code等を活用したAI支援プログラミング技術を習得し、開発効率を飛躍的に向上させます。",
    href: "/services/ai-coding-training",
    image: "/images/services/list/ai-coding-training.jpg",
    available: true,
    category: "enterprise"
  },
  {
    id: "claude-training",
    title: "Claude研修",
    description: "CoWork、Claude in Chrome、Claude Designなど、Claudeの多様な機能を業務全般で使いこなし、組織の生産性を引き上げる研修です。",
    href: "/services/claude-training",
    image: "/images/services/list/claude-training.jpg",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-organization-os",
    title: "AI組織OS研修",
    description: "CursorとGitHubで「組織の脳みそ」を構築し、情報共有・引き継ぎ業務を革新。組織全体の生産性を向上させます。",
    href: "/services/ai-organization-os",
    image: "/images/services/list/ai-organization-os.jpg",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-video",
    title: "AI動画生成研修",
    description: "Sora、Gemini、Higgsfield等のAI動画生成ツールを活用して、マーケティング動画やプレゼン動画を効率的に制作する技術を学びます。",
    href: "/services/ai-video-training",
    image: "/images/services/list/ai-video-training.jpg",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-short-video-training",
    title: "AIショート動画研修",
    description: "Sora、Runway、Pika、ElevenLabs、CapCut等を活用し、SNS向け縦動画をAIで量産。SNSマーケティングを加速する技術を学びます。",
    href: "/services/ai-short-video-training",
    image: "/images/services/list/ai-short-video-training.jpg",
    available: true,
    category: "enterprise"
  },
  {
    id: "ai-animation-training",
    title: "AIアニメ制作研修",
    description: "キャラクター生成、シーン生成、リップシンク、声優AIまでAIを駆使したアニメ制作を体系的に学び、企画から完成までを大幅に短縮します。",
    href: "/services/ai-animation-training",
    image: "/images/services/list/ai-animation-training.jpg",
    available: true,
    category: "enterprise"
  },
  {
    id: "individual-coaching",
    title: "AI駆動開発育成所",
    description: "完全審査制の個人向けバイブコーディング特化コーチング。Claude CodeやCursorを活用したAI駆動開発スキルを習得できます。",
    href: "/services/ai-talent-development",
    image: "/images/services/list/ai-talent-development.jpg",
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