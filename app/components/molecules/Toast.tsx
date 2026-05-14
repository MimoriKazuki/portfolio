'use client'

import * as React from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'
import { CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * Toast molecule（Atomic Design / molecules）
 *
 * 起点：
 * - docs/frontend/component-candidates.md molecules § Toast
 * - sonner ベース（shadcn 推奨ライブラリ）
 *
 * 利用例：
 * ```
 * // layout.tsx
 * <Toaster />
 *
 * // 任意の場所
 * import { toast } from '@/app/components/molecules/Toast'
 * toast.success('保存しました')
 * toast.error('保存に失敗しました')
 * toast.warning('入力内容を確認してください')
 * toast.info('処理を開始しました')
 * ```
 *
 * - sonner の `<Toaster />` を `Toaster` として再 export（既定設定をプロジェクトトークンに合わせる）
 * - 4 variant（success / warning / danger / info）に対応するヘルパー（toast.success / toast.error / toast.warning / toast.info）
 * - 4 variant のアイコンは lucide で統一
 */

type ToastMessage = React.ReactNode

const toastIconClass = 'h-5 w-5 shrink-0'

const variantIcons = {
  success: <CheckCircle2 aria-hidden="true" className={cn(toastIconClass, 'text-primary')} />,
  warning: <AlertTriangle aria-hidden="true" className={cn(toastIconClass, 'text-foreground')} />,
  danger: <AlertCircle aria-hidden="true" className={cn(toastIconClass, 'text-destructive')} />,
  info: <Info aria-hidden="true" className={cn(toastIconClass, 'text-muted-foreground')} />,
} as const

export const toast = {
  success: (message: ToastMessage, options?: Parameters<typeof sonnerToast>[1]) =>
    sonnerToast(message, { icon: variantIcons.success, ...options }),
  warning: (message: ToastMessage, options?: Parameters<typeof sonnerToast>[1]) =>
    sonnerToast(message, { icon: variantIcons.warning, ...options }),
  error: (message: ToastMessage, options?: Parameters<typeof sonnerToast>[1]) =>
    sonnerToast(message, { icon: variantIcons.danger, ...options }),
  info: (message: ToastMessage, options?: Parameters<typeof sonnerToast>[1]) =>
    sonnerToast(message, { icon: variantIcons.info, ...options }),
  /** sonner 標準（カスタムアイコンなし）を必要時に直接呼ぶための pass-through */
  raw: sonnerToast,
} as const

export interface ToasterProps
  extends Omit<React.ComponentPropsWithoutRef<typeof SonnerToaster>, 'theme'> {
  /** 既定 'system'（OS テーマに従う）。 */
  theme?: React.ComponentPropsWithoutRef<typeof SonnerToaster>['theme']
}

/**
 * Toaster（プロジェクトトークンに合わせた sonner ラッパー）。
 * - 全画面のルート（layout.tsx 等）で 1 度だけマウントする
 * - 色・角丸はプロジェクト CSS 変数経由（toastOptions.classNames で指定）
 */
export const Toaster: React.FC<ToasterProps> = ({ theme = 'system', className, ...props }) => {
  return (
    <SonnerToaster
      theme={theme}
      className={cn('toaster group', className)}
      toastOptions={{
        classNames: {
          toast:
            'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border group-[.toaster]:border-border group-[.toaster]:shadow-md group-[.toaster]:rounded-md',
          description: 'group-[.toast]:text-muted-foreground',
          actionButton:
            'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
          cancelButton:
            'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground',
        },
      }}
      {...props}
    />
  )
}
Toaster.displayName = 'Toaster'
