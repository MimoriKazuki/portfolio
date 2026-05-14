import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * LPTemplate（Atomic Design / templates）
 *
 * 起点：
 * - docs/frontend/page-templates.md § 1. LPTemplate
 * - 対応画面：B001 /e-learning（未ログイン向け）
 *
 * 想定構成（呼び出し側で N9 確定 8 セクションを渡す）：
 *   hero / valueProps / courseShowcase / contentShowcase / testimonials / stats / faq / contact
 *
 * ロジックは持たない（state / hooks / データ取得なし）。
 * 各 slot は organisms/landing 配下のコンポーネントを渡す想定。
 */

export interface LPTemplateProps {
  hero: React.ReactNode
  valueProps?: React.ReactNode
  courseShowcase?: React.ReactNode
  contentShowcase?: React.ReactNode
  testimonials?: React.ReactNode
  stats?: React.ReactNode
  faq?: React.ReactNode
  contact?: React.ReactNode
  className?: string
}

const LPTemplate: React.FC<LPTemplateProps> = ({
  hero,
  valueProps,
  courseShowcase,
  contentShowcase,
  testimonials,
  stats,
  faq,
  contact,
  className,
}) => {
  return (
    <main className={cn('flex w-full flex-col bg-background text-foreground', className)}>
      {hero}
      {valueProps}
      {courseShowcase}
      {contentShowcase}
      {testimonials}
      {stats}
      {faq}
      {contact}
    </main>
  )
}
LPTemplate.displayName = 'LPTemplate'

export { LPTemplate }
