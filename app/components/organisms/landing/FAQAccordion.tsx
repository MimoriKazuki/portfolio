'use client'

import * as React from 'react'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/app/components/molecules/Accordion'
import { cn } from '@/app/lib/utils'

/**
 * FAQAccordion organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § FAQAccordion
 * - B001 FAQ セクション
 *
 * 構成：
 * - title / description（任意）
 * - items 各要素を Accordion molecule で描画
 * - 単一展開（type="single"）/ 複数展開（type="multiple"）切替（既定 single）
 *
 * 中身（質問・回答テキスト）は Phase 3 で具体化。
 */

export type FAQItem = {
  question: string
  answer: React.ReactNode
}

export interface FAQAccordionProps extends React.HTMLAttributes<HTMLElement> {
  title?: string
  description?: string
  items: FAQItem[]
  /** Accordion の type（既定 'single'）。 */
  type?: 'single' | 'multiple'
}

const FAQAccordion = React.forwardRef<HTMLElement, FAQAccordionProps>(
  ({ title, description, items, type = 'single', className, ...props }, ref) => {
    return (
      <section
        ref={ref}
        aria-label={title ?? 'よくあるご質問'}
        className={cn('w-full bg-background px-6 py-16 md:py-20', className)}
        {...props}
      >
        <div className="mx-auto w-full max-w-3xl">
          {(title || description) && (
            <header className="mb-8 text-center">
              {title && (
                <h2 className="text-2xl text-foreground md:text-3xl">{title}</h2>
              )}
              {description && (
                <p className="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground md:text-base">
                  {description}
                </p>
              )}
            </header>
          )}

          {type === 'multiple' ? (
            <Accordion type="multiple">
              {items.map((item, idx) => (
                <AccordionItem key={`faq-${idx}`} value={`faq-${idx}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Accordion type="single" collapsible>
              {items.map((item, idx) => (
                <AccordionItem key={`faq-${idx}`} value={`faq-${idx}`}>
                  <AccordionTrigger>{item.question}</AccordionTrigger>
                  <AccordionContent>{item.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          )}
        </div>
      </section>
    )
  },
)
FAQAccordion.displayName = 'FAQAccordion'

export { FAQAccordion }
