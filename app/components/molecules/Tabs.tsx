'use client'

import * as React from 'react'
import * as TabsPrimitive from '@radix-ui/react-tabs'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/app/lib/utils'

/**
 * Tabs molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § Tabs
 * - shadcn tabs ベース（@radix-ui/react-tabs）
 *
 * 利用例：
 * ```
 * <Tabs defaultValue="overview">
 *   <TabsList>
 *     <TabsTrigger value="overview">概要</TabsTrigger>
 *     <TabsTrigger value="materials">資料</TabsTrigger>
 *   </TabsList>
 *   <TabsContent value="overview">…</TabsContent>
 *   <TabsContent value="materials">…</TabsContent>
 * </Tabs>
 * ```
 *
 * variant:
 *  - default：背景塗り（shadcn 標準）
 *  - underline：下線スタイル（視聴画面 VideoTabs / 管理フォーム想定）
 * size:
 *  - sm / md
 */

const tabsListVariants = cva('inline-flex items-center text-muted-foreground', {
  variants: {
    variant: {
      default: 'h-10 rounded-md bg-muted p-1 justify-center',
      underline: 'h-10 border-b border-border w-full justify-start gap-2',
    },
    size: {
      sm: 'text-xs',
      md: 'text-sm',
    },
  },
  defaultVariants: {
    variant: 'default',
    size: 'md',
  },
})

const tabsTriggerVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'rounded-sm px-3 py-1.5 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm',
        underline:
          'h-10 px-3 -mb-px border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:text-foreground hover:text-foreground',
      },
      size: {
        sm: 'text-xs',
        md: 'text-sm',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'md',
    },
  },
)

export type TabsVariant = NonNullable<VariantProps<typeof tabsListVariants>['variant']>
export type TabsSize = NonNullable<VariantProps<typeof tabsListVariants>['size']>

type TabsContextValue = {
  variant: TabsVariant
  size: TabsSize
}

const TabsContext = React.createContext<TabsContextValue>({
  variant: 'default',
  size: 'md',
})

export interface TabsProps
  extends React.ComponentPropsWithoutRef<typeof TabsPrimitive.Root> {
  variant?: TabsVariant
  size?: TabsSize
}

const Tabs = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Root>,
  TabsProps
>(({ variant = 'default', size = 'md', className, ...props }, ref) => (
  <TabsContext.Provider value={{ variant, size }}>
    <TabsPrimitive.Root
      ref={ref}
      className={cn('w-full', className)}
      {...props}
    />
  </TabsContext.Provider>
))
Tabs.displayName = 'Tabs'

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => {
  const { variant, size } = React.useContext(TabsContext)
  return (
    <TabsPrimitive.List
      ref={ref}
      className={cn(tabsListVariants({ variant, size }), className)}
      {...props}
    />
  )
})
TabsList.displayName = 'TabsList'

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => {
  const { variant, size } = React.useContext(TabsContext)
  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn(tabsTriggerVariants({ variant, size }), className)}
      {...props}
    />
  )
})
TabsTrigger.displayName = 'TabsTrigger'

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      'mt-4 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
      className,
    )}
    {...props}
  />
))
TabsContent.displayName = 'TabsContent'

export { Tabs, TabsList, TabsTrigger, TabsContent, tabsListVariants, tabsTriggerVariants }
