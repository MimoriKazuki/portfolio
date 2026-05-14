'use client'

import * as React from 'react'
import { Badge } from '@/app/components/atoms/Badge'
import { Button } from '@/app/components/atoms/Button'
import {
  AdminDataTable,
  type AdminDataTableColumn,
} from '@/app/components/organisms/AdminDataTable'
import type { LegacyPurchaseRow } from './get-legacy-purchases'

/**
 * C011 レガシー購入レコード一覧（読み取り専用・Client Component）。
 *
 * 起点：screens.md C011 補足「行クリック挙動：インラインモーダル or 行展開のみ（詳細画面遷移なし）」
 *
 * 設計：
 * - 編集ボタン・削除ボタンは**絶対に追加しない**（読み取り専用・誤削除防止ルール遵守）
 * - 行クリックで「詳細を表示」ボタン → useState で expanded ID を管理（インライン展開）
 * - JOIN 取得済の user / content 情報を表示
 */

function formatDateTime(iso: string): string {
  try {
    return new Date(iso).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
  } catch {
    return iso
  }
}

export interface LegacyPurchasesTableClientProps {
  rows: LegacyPurchaseRow[]
}

export function LegacyPurchasesTableClient({ rows }: LegacyPurchasesTableClientProps) {
  const [expandedId, setExpandedId] = React.useState<string | null>(null)

  const expanded = React.useMemo(
    () => (expandedId ? rows.find(r => r.id === expandedId) ?? null : null),
    [expandedId, rows],
  )

  const columns: AdminDataTableColumn<LegacyPurchaseRow>[] = [
    {
      key: 'user',
      label: 'ユーザー',
      render: row => (
        <div className="flex flex-col gap-0.5">
          <span className="truncate text-sm text-foreground">
            {row.user_display_name ?? '（表示名未設定）'}
          </span>
          <span className="truncate text-xs text-muted-foreground">
            {row.user_email ?? '—'}
          </span>
        </div>
      ),
    },
    {
      key: 'amount',
      label: '金額',
      align: 'right',
      render: row => (
        <span className="text-sm text-foreground">¥{row.amount.toLocaleString()}</span>
      ),
    },
    {
      key: 'status',
      label: 'ステータス',
      align: 'center',
      render: row =>
        row.status === 'refunded' ? (
          <Badge variant="danger">返金済</Badge>
        ) : (
          <Badge variant="success">完了</Badge>
        ),
    },
    {
      key: 'original_created_at',
      label: '元購入日時',
      align: 'right',
      render: row => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.original_created_at)}
        </span>
      ),
    },
    {
      key: 'migrated_at',
      label: '退避日時',
      align: 'right',
      render: row => (
        <span className="text-xs text-muted-foreground">
          {formatDateTime(row.migrated_at)}
        </span>
      ),
    },
    {
      key: 'actions',
      label: '詳細',
      align: 'right',
      render: row => (
        <Button
          size="sm"
          variant="ghost"
          onClick={() => setExpandedId(prev => (prev === row.id ? null : row.id))}
        >
          {expandedId === row.id ? '閉じる' : '詳細'}
        </Button>
      ),
    },
  ]

  return (
    <div className="flex flex-col gap-4">
      <AdminDataTable columns={columns} data={rows} isEmpty={rows.length === 0} />
      {expanded && (
        <aside
          role="region"
          aria-label="レガシー購入レコード詳細"
          className="rounded-lg border border-border bg-card p-5 text-card-foreground"
        >
          <h2 className="text-base text-foreground">詳細</h2>
          <dl className="mt-3 grid grid-cols-1 gap-3 text-sm md:grid-cols-2">
            <div>
              <dt className="text-xs text-muted-foreground">ID</dt>
              <dd className="break-all text-foreground">{expanded.id}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">user_id</dt>
              <dd className="break-all text-foreground">{expanded.user_id}</dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">content_id</dt>
              <dd className="break-all text-foreground">
                {expanded.content_id ?? '（NULL・全コンテンツ買い切り）'}
              </dd>
            </div>
            <div>
              <dt className="text-xs text-muted-foreground">Stripe Session ID</dt>
              <dd className="break-all text-foreground">
                {expanded.stripe_session_id ?? '（NULL・不明）'}
              </dd>
            </div>
            <div className="md:col-span-2">
              <dt className="text-xs text-muted-foreground">note（業務メモ）</dt>
              <dd className="whitespace-pre-wrap text-foreground">
                {expanded.note ?? '（なし）'}
              </dd>
            </div>
          </dl>
        </aside>
      )}
    </div>
  )
}
