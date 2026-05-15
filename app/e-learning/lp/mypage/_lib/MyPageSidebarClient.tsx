'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen, Receipt, User } from 'lucide-react'
import { cn } from '@/app/lib/utils'

/**
 * マイページ共通サブナビ（Client Component）。
 *
 * 仕様（Kosuke FB 2026-05-15 で再編）：
 * - 3 リンク：マイラーニング（購入 + ブックマーク 統合）/ 購入履歴 / プロフィール
 * - 旧「ブックマーク」「視聴履歴」はマイラーニングに統合（独立メニューは廃止）
 * - 現在 path に一致する項目は aria-current="page" + 強調スタイル
 * - usePathname() 使用のため Client Component
 */

const ITEMS: Array<{ href: string; label: string; icon: React.ElementType }> = [
  { href: '/e-learning/lp/mypage/learning', label: 'マイラーニング', icon: BookOpen },
  { href: '/e-learning/lp/mypage/purchases', label: '購入履歴', icon: Receipt },
  { href: '/e-learning/lp/mypage', label: 'プロフィール', icon: User },
]

export function MyPageSidebarClient() {
  const pathname = usePathname()

  return (
    <nav aria-label="マイページナビゲーション" className="flex flex-col gap-1">
      <p className="mb-2 text-xs text-muted-foreground">マイページ</p>
      <ul className="flex flex-col gap-1">
        {ITEMS.map(item => {
          const isActive = pathname === item.href
          const Icon = item.icon
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm transition',
                  isActive
                    ? 'bg-primary/10 text-foreground'
                    : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground',
                )}
              >
                <Icon className="h-4 w-4" aria-hidden="true" />
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
