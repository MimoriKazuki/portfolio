import * as React from 'react'
import { cn } from '@/app/lib/utils'

/**
 * HeroSection organism（Atomic Design / organisms / landing）
 *
 * 起点：
 * - docs/frontend/component-candidates.md organisms § HeroSection
 * - B001（Eラーニング LP）用キービジュアル
 *
 * 構成（枠）：
 * - 背景：backgroundImage が渡されると CSS background として描画
 * - 上下中央寄せ：title（大型タイポ・h1）/ description / cta スロット
 *
 * 中身は Phase 3 で具体化（既存 AITrainingLP のスクロールアニメパターンは touch しない）。
 */

export interface HeroSectionProps extends React.HTMLAttributes<HTMLElement> {
  /** ヘッダー（h1）。 */
  title: string
  /** 補足コピー。 */
  description?: string
  /** CTA スロット（Button 等）。 */
  cta?: React.ReactNode
  /** 背景画像 URL（任意・next/image は呼び出し側で）。 */
  backgroundImage?: string
  /** テキストの水平方向位置。 */
  align?: 'left' | 'center'
}

const HeroSection = React.forwardRef<HTMLElement, HeroSectionProps>(
  (
    { title, description, cta, backgroundImage, align = 'center', className, ...props },
    ref,
  ) => {
    const alignClass = align === 'center' ? 'items-center text-center' : 'items-start text-left'

    return (
      <section
        ref={ref}
        aria-label="ヒーロー"
        className={cn(
          'relative flex w-full flex-col justify-center gap-6 overflow-hidden bg-background px-6 py-16 md:py-24',
          alignClass,
          className,
        )}
        style={
          backgroundImage
            ? {
                backgroundImage: `url("${backgroundImage}")`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }
            : undefined
        }
        {...props}
      >
        <div className={cn('relative z-10 mx-auto flex w-full max-w-4xl flex-col gap-6', alignClass)}>
          <h1 className="text-3xl text-foreground md:text-5xl">{title}</h1>
          {description && (
            <p className="max-w-2xl text-base text-muted-foreground md:text-lg">
              {description}
            </p>
          )}
          {cta && <div className="flex flex-wrap items-center gap-3">{cta}</div>}
        </div>
      </section>
    )
  },
)
HeroSection.displayName = 'HeroSection'

export { HeroSection }
