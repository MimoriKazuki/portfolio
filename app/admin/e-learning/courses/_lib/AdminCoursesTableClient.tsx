'use client'

import * as React from 'react'
import Link from 'next/link'
import { Button } from '@/app/components/atoms/Button'
import { Badge } from '@/app/components/atoms/Badge'
import { Switch } from '@/app/components/atoms/Switch'
import { AdminDataTable, type AdminDataTableColumn } from '@/app/components/organisms/AdminDataTable'
import { toggleCoursePublishedAction } from '../_actions/toggle-published'
import type { AdminCourseRow } from './get-admin-courses'

/**
 * C005 管理画面コース一覧：テーブル + 公開／非公開トグル（Client Component）。
 *
 * Server Component から取得した行を AdminDataTable で表示し、公開トグルは Server Action を呼ぶ。
 * 楽観的 UI：トグル直後にローカル state を更新し、失敗時はロールバック。
 */

export interface AdminCoursesTableClientProps {
  courses: AdminCourseRow[]
}

export function AdminCoursesTableClient({ courses: initial }: AdminCoursesTableClientProps) {
  const [rows, setRows] = React.useState(initial)
  const [pendingId, setPendingId] = React.useState<string | null>(null)

  React.useEffect(() => {
    setRows(initial)
  }, [initial])

  const handleToggle = async (courseId: string, next: boolean) => {
    setPendingId(courseId)
    const prev = rows
    setRows(rs => rs.map(r => (r.id === courseId ? { ...r, is_published: next } : r)))
    try {
      const result = await toggleCoursePublishedAction(courseId, next)
      if (result.success === false) {
        // ロールバック
        setRows(prev)
        console.error('[c005] toggle failed:', result.code)
      }
    } catch (err) {
      setRows(prev)
      console.error('[c005] toggle error:', err)
    } finally {
      setPendingId(null)
    }
  }

  const columns: AdminDataTableColumn<AdminCourseRow>[] = [
    {
      key: 'title',
      label: 'タイトル',
      render: row => (
        <div className="flex flex-col gap-1">
          <span className="text-sm text-foreground">{row.title}</span>
          <span className="text-xs text-muted-foreground">{row.slug}</span>
        </div>
      ),
    },
    {
      key: 'category',
      label: 'カテゴリ',
      render: row => (
        <span className="text-sm text-muted-foreground">{row.category_name ?? '—'}</span>
      ),
    },
    {
      key: 'price',
      label: '価格',
      align: 'right',
      render: row =>
        row.is_free ? (
          <Badge variant="success">無料</Badge>
        ) : row.price !== null ? (
          <span className="text-sm text-foreground">¥{row.price.toLocaleString()}</span>
        ) : (
          <span className="text-sm text-muted-foreground">—</span>
        ),
    },
    {
      key: 'is_featured',
      label: '注目',
      align: 'center',
      render: row =>
        row.is_featured ? <Badge variant="info">注目</Badge> : <span className="text-xs text-muted-foreground">—</span>,
    },
    {
      key: 'is_published',
      label: '公開',
      align: 'center',
      render: row => {
        if (row.deleted_at) {
          return <Badge variant="danger">削除済</Badge>
        }
        return (
          <Switch
            checked={row.is_published}
            onCheckedChange={next => handleToggle(row.id, next)}
            disabled={pendingId === row.id}
            aria-label={`${row.title} の公開状態`}
          />
        )
      },
    },
    {
      key: 'actions',
      label: '操作',
      align: 'right',
      render: row => (
        <Button asChild size="sm" variant="outline">
          <Link href={`/admin/e-learning/courses/${row.id}/edit`}>編集</Link>
        </Button>
      ),
    },
  ]

  return (
    <AdminDataTable
      columns={columns}
      data={rows}
      isEmpty={rows.length === 0}
    />
  )
}
