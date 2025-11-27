'use client'

import { useEffect, useRef, useState, ReactNode } from 'react'

interface ScrollAnimationProps {
  children: ReactNode
  className?: string
  animation?: 'fadeUp' | 'fadeIn' | 'fadeLeft' | 'fadeRight' | 'scaleUp' | 'stagger'
  delay?: number
  duration?: number
  staggerDelay?: number
  threshold?: number
}

export function ScrollAnimation({
  children,
  className = '',
  animation = 'fadeUp',
  delay = 0,
  duration = 0.8,
  staggerDelay = 0.1,
  threshold = 0.2,
}: ScrollAnimationProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return
    
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      {
        threshold,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasMounted, threshold])

  // アニメーションスタイルを取得
  const getAnimationStyles = () => {
    if (!hasMounted) {
      // SSR時は初期状態を返す
      return {}
    }

    const baseTransition = `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s`

    if (!isVisible) {
      switch (animation) {
        case 'fadeUp':
          return {
            opacity: 0,
            transform: 'translateY(40px)',
            transition: baseTransition,
          }
        case 'fadeIn':
          return {
            opacity: 0,
            transition: baseTransition,
          }
        case 'fadeLeft':
          return {
            opacity: 0,
            transform: 'translateX(-40px)',
            transition: baseTransition,
          }
        case 'fadeRight':
          return {
            opacity: 0,
            transform: 'translateX(40px)',
            transition: baseTransition,
          }
        case 'scaleUp':
          return {
            opacity: 0,
            transform: 'scale(0.95)',
            transition: baseTransition,
          }
        case 'stagger':
          return {
            opacity: 1,
          }
        default:
          return {
            opacity: 0,
            transform: 'translateY(40px)',
            transition: baseTransition,
          }
      }
    }

    return {
      opacity: 1,
      transform: 'translateY(0) translateX(0) scale(1)',
      transition: baseTransition,
    }
  }

  return (
    <div ref={ref} className={className} style={getAnimationStyles()}>
      {children}
    </div>
  )
}

// スタガーアニメーション用コンポーネント
interface StaggerContainerProps {
  children: ReactNode
  className?: string
  staggerDelay?: number
  duration?: number
}

export function StaggerContainer({ 
  children, 
  className = '',
  staggerDelay = 0.15,
  duration = 0.6,
}: StaggerContainerProps) {
  const ref = useRef<HTMLDivElement>(null)
  const [isVisible, setIsVisible] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  useEffect(() => {
    if (!hasMounted) return

    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.unobserve(element)
        }
      },
      {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px',
      }
    )

    observer.observe(element)

    return () => {
      observer.disconnect()
    }
  }, [hasMounted])

  return (
    <div ref={ref} className={className}>
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <div
            key={index}
            style={{
              opacity: hasMounted ? (isVisible ? 1 : 0) : 1,
              transform: hasMounted ? (isVisible ? 'translateY(0)' : 'translateY(30px)') : 'translateY(0)',
              transition: `opacity ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerDelay}s, transform ${duration}s cubic-bezier(0.16, 1, 0.3, 1) ${index * staggerDelay}s`,
            }}
          >
            {child}
          </div>
        ))
      ) : (
        children
      )}
    </div>
  )
}

// セクション全体のアニメーション用ラッパー
interface AnimatedSectionProps {
  children: ReactNode
  className?: string
  delay?: number
}

export function AnimatedSection({ children, className = '', delay = 0 }: AnimatedSectionProps) {
  return (
    <ScrollAnimation animation="fadeUp" delay={delay} className={className}>
      {children}
    </ScrollAnimation>
  )
}
