'use client'

import * as React from 'react'
import * as AccordionPrimitive from '@radix-ui/react-accordion'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * Accordion molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § Accordion
 * - shadcn accordion ベース（@radix-ui/react-accordion）
 *
 * 利用例：
 * ```
 * <Accordion type="single" collapsible defaultValue="item-1">
 *   <AccordionItem value="item-1">
 *     <AccordionTrigger>セクション 1</AccordionTrigger>
 *     <AccordionContent>本文…</AccordionContent>
 *   </AccordionItem>
 * </Accordion>
 * ```
 *
 * - type="single"（既定）：1つだけ開く
 * - type="multiple"：複数開ける
 * - ChevronDown が data-[state=open] 時に回転（180deg）
 *
 * アニメーション：
 * - 開閉アニメは `tailwindcss-animate` の `accordion-down` / `accordion-up` を利用
 *   （shadcn 標準・既存 tailwind.config.ts に同名 keyframes が定義済み前提）
 */

const Accordion = AccordionPrimitive.Root

const AccordionItem = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Item>
>(({ className, ...props }, ref) => (
  <AccordionPrimitive.Item
    ref={ref}
    className={cn('border-b border-border', className)}
    {...props}
  />
))
AccordionItem.displayName = 'AccordionItem'

const AccordionTrigger = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Trigger>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Header className="flex">
    <AccordionPrimitive.Trigger
      ref={ref}
      className={cn(
        'flex flex-1 items-center justify-between py-4 text-sm text-foreground transition-all hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 [&[data-state=open]>svg]:rotate-180',
        className,
      )}
      {...props}
    >
      {children}
      <ChevronDown
        aria-hidden="true"
        className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200"
      />
    </AccordionPrimitive.Trigger>
  </AccordionPrimitive.Header>
))
AccordionTrigger.displayName = 'AccordionTrigger'

const AccordionContent = React.forwardRef<
  React.ElementRef<typeof AccordionPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AccordionPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <AccordionPrimitive.Content
    ref={ref}
    className="overflow-hidden text-sm data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down"
    {...props}
  >
    <div className={cn('pb-4 pt-0 text-muted-foreground', className)}>{children}</div>
  </AccordionPrimitive.Content>
))
AccordionContent.displayName = 'AccordionContent'

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent }
