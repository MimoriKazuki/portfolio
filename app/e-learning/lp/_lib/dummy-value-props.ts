import { Sparkles, GraduationCap, Users } from 'lucide-react'
import type { ValuePropItem } from '@/app/components/organisms/landing/ValuePropsSection'

/**
 * B001 LP の価値訴求セクション仮素材。
 * 実コンテンツはディレクター（Kosuke）が後で確定。差し替え時はこのファイルだけ更新する。
 */
export const dummyValueProps: ValuePropItem[] = [
  {
    icon: Sparkles,
    title: '実務に直結する学習体験',
    description:
      '生成 AI を「使える」レベルまで引き上げる、実務シナリオベースの学習構成。',
  },
  {
    icon: GraduationCap,
    title: 'コースと単発、両方の学び方',
    description:
      '体系的に学べるコースと、ピンポイントで学べる単体動画。学習スタイルに応じて選べます。',
  },
  {
    icon: Users,
    title: 'チーム導入もサポート',
    description:
      '社内研修としても活用可能。お問い合わせから法人向けプランをご案内します。',
  },
]
