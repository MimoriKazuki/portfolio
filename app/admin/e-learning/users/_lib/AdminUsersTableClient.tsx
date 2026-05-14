'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/atoms/Avatar'
import { Badge } from '@/app/components/atoms/Badge'
import { Button } from '@/app/components/atoms/Button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/app/components/molecules/Dialog'
import {
  AdminDataTable,
  type AdminDataTableColumn,
} from '@/app/components/organisms/AdminDataTable'
import { toggleFullAccessAction } from '../_actions/toggle-full-access'
import type { AdminUserRow } from './get-admin-users'

/**
 * C010 フルアクセスユーザー管理：テーブル + has_full_access 切替（Client Component）。
 *
 * 設計：
 * - 「フルアクセス付与/解除」ボタン押下 → 確認 Dialog → Server Action
 * - 楽観的 UI ではなく **確認モーダル付き**（運用上の取消困難な操作のため安全側）
 * - 切替成功後にローカル state を更新
 */

export interface AdminUsersTableClientProps {
  users: AdminUserRow[]
}

function initialsFrom(name: string | null, email: string | null): string {
  return (name?.trim() || email?.trim() || '?').slice(0, 1).toUpperCase()
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

export function AdminUsersTableClient({ users: initial }: AdminUsersTableClientProps) {
  const [users, setUsers] = React.useState(initial)
  const [pending, setPending] = React.useState<{ user: AdminUserRow; nextValue: boolean } | null>(
    null,
  )
  const [submitting, setSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  React.useEffect(() => {
    setUsers(initial)
  }, [initial])

  const handleConfirm = async () => {
    if (!pending) return
    setSubmitting(true)
    setError(null)
    try {
      const result = await toggleFullAccessAction(pending.user.id, pending.nextValue)
      if (result.success === true) {
        setUsers(us =>
          us.map(u =>
            u.id === pending.user.id ? { ...u, has_full_access: result.has_full_access } : u,
          ),
        )
        setPending(null)
      } else {
        setError(
          result.code === 'NOT_FOUND'
            ? 'ユーザーが見つかりませんでした'
            : 'フルアクセス変更に失敗しました',
        )
      }
    } catch (err) {
      console.error('[c010] toggle error', err)
      setError('フルアクセス変更に失敗しました')
    } finally {
      setSubmitting(false)
    }
  }

  const columns: AdminDataTableColumn<AdminUserRow>[] = [
    {
      key: 'user',
      label: 'ユーザー',
      render: row => (
        <div className="flex items-center gap-3">
          <Avatar size="sm">
            {row.avatar_url && (
              <AvatarImage src={row.avatar_url} alt={`${row.display_name ?? 'ユーザー'} のアバター`} />
            )}
            <AvatarFallback>{initialsFrom(row.display_name, row.email)}</AvatarFallback>
          </Avatar>
          <div className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-sm text-foreground">
              {row.display_name ?? '（表示名未設定）'}
            </span>
            <span className="truncate text-xs text-muted-foreground">{row.email ?? '—'}</span>
          </div>
        </div>
      ),
    },
    {
      key: 'has_full_access',
      label: 'フルアクセス',
      align: 'center',
      render: row =>
        row.has_full_access ? (
          <Badge variant="info">付与済</Badge>
        ) : (
          <Badge variant="neutral">未付与</Badge>
        ),
    },
    {
      key: 'created_at',
      label: '登録日',
      align: 'right',
      render: row => (
        <span className="text-xs text-muted-foreground">{formatDate(row.created_at)}</span>
      ),
    },
    {
      key: 'actions',
      label: '操作',
      align: 'right',
      render: row => (
        <Button
          size="sm"
          variant={row.has_full_access ? 'outline' : 'primary'}
          onClick={() => setPending({ user: row, nextValue: !row.has_full_access })}
        >
          {row.has_full_access ? '解除' : '付与'}
        </Button>
      ),
    },
  ]

  return (
    <>
      <AdminDataTable columns={columns} data={users} isEmpty={users.length === 0} />

      <Dialog
        open={!!pending}
        onOpenChange={submitting ? () => {} : open => !open && setPending(null)}
      >
        <DialogContent size="md">
          <DialogHeader>
            <DialogTitle>
              {pending?.nextValue ? 'フルアクセスを付与' : 'フルアクセスを解除'}
            </DialogTitle>
            <DialogDescription>
              {pending?.user.display_name ?? pending?.user.email ?? 'このユーザー'} のフルアクセス権を
              {pending?.nextValue ? '付与' : '解除'}します。
            </DialogDescription>
          </DialogHeader>

          <p className="text-sm text-muted-foreground">
            この操作は監査ログに記録されます。間違いがないかご確認ください。
          </p>

          {error && (
            <p
              role="alert"
              className="rounded-md border border-destructive/20 bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </p>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setPending(null)} disabled={submitting}>
              キャンセル
            </Button>
            <Button
              variant={pending?.nextValue ? 'primary' : 'danger'}
              onClick={handleConfirm}
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                  処理中...
                </>
              ) : pending?.nextValue ? (
                '付与する'
              ) : (
                '解除する'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
