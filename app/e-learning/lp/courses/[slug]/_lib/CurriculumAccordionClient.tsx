'use client'

import * as React from 'react'
import Link from 'next/link'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/app/components/molecules/Accordion'
import { FreeBadge } from '@/app/components/atoms/FreeBadge'
import { LockIcon } from '@/app/components/atoms/LockIcon'
import { ProgressCheckIcon } from '@/app/components/atoms/ProgressCheckIcon'

/**
 * B004 コース詳細：カリキュラム（章・動画）の Accordion 表示。
 *
 * 設計：
 * - 章ごとに Accordion で開閉
 * - 各動画行に：視聴済マーク / is_free バッジ / 視聴可否（鍵）アイコン / 動画タイトル / 視聴 CTA リンク
 * - 視聴可否は呼び出し側で判定済の hasCourseAccess + video.is_free + courseIsFree で決定
 *   - allowed: hasCourseAccess=true（has_full_access or コース購入済）
 *            OR courseIsFree=true
 *            OR video.is_free=true
 *   - それ以外は鍵アイコン表示・リンクは disabled
 *
 * Client Component：Accordion molecule が 'use client' 必要なため。
 */

export interface CurriculumAccordionClientProps {
  courseSlug: string
  courseIsFree: boolean
  hasCourseAccess: boolean
  completedVideoIds: string[]
  chapters: Array<{
    id: string
    title: string
    description: string | null
    display_order: number
    videos: Array<{
      id: string
      title: string
      description: string | null
      duration: string | null
      is_free: boolean
      display_order: number
    }>
  }>
}

export function CurriculumAccordionClient({
  courseSlug,
  courseIsFree,
  hasCourseAccess,
  completedVideoIds,
  chapters,
}: CurriculumAccordionClientProps) {
  const completedSet = React.useMemo(() => new Set(completedVideoIds), [completedVideoIds])

  if (chapters.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">カリキュラムは準備中です。</p>
    )
  }

  return (
    <Accordion type="multiple">
      {chapters.map(chapter => (
        <AccordionItem key={chapter.id} value={chapter.id}>
          <AccordionTrigger>
            <span className="flex items-baseline gap-3 text-left">
              <span className="text-xs text-muted-foreground">
                第{chapter.display_order}章
              </span>
              <span className="text-sm text-foreground">{chapter.title}</span>
            </span>
          </AccordionTrigger>
          <AccordionContent>
            <ul className="flex flex-col divide-y divide-border">
              {chapter.videos.map(video => {
                const allowed = hasCourseAccess || courseIsFree || video.is_free
                const isCompleted = completedSet.has(video.id)
                const videoHref = `/e-learning/lp/courses/${courseSlug}/videos/${video.id}`

                const Inner = (
                  <span className="flex w-full items-center gap-3 py-3">
                    <ProgressCheckIcon
                      variant={isCompleted ? 'completed' : 'pending'}
                      size="sm"
                      aria-label={isCompleted ? '視聴完了' : '未視聴'}
                    />
                    <span className="flex-1 truncate text-sm text-foreground">
                      {video.title}
                    </span>
                    {video.is_free && <FreeBadge size="sm" />}
                    {!allowed && <LockIcon size="sm" aria-label="視聴権限なし" />}
                    {video.duration && (
                      <span className="shrink-0 text-xs text-muted-foreground">
                        {video.duration}
                      </span>
                    )}
                  </span>
                )

                return (
                  <li key={video.id}>
                    {allowed ? (
                      <Link
                        href={videoHref}
                        className="block rounded-sm px-2 transition hover:bg-muted/50"
                      >
                        {Inner}
                      </Link>
                    ) : (
                      <div
                        className="block cursor-not-allowed px-2 opacity-60"
                        aria-disabled="true"
                      >
                        {Inner}
                      </div>
                    )}
                  </li>
                )
              })}
              {chapter.videos.length === 0 && (
                <li className="py-3 text-xs text-muted-foreground">
                  この章にはまだ動画がありません。
                </li>
              )}
            </ul>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
