'use client'

import Link from 'next/link'
import { Edit, Eye, Trophy, TrendingUp, Clock } from 'lucide-react'
import Image from 'next/image'

interface TopColumn {
  pagePath: string
  views: number
  avgEngagementTime?: number
}

interface TopColumnsListProps {
  topPages: TopColumn[]
  columns?: any[]
}

export default function TopColumnsList({ topPages, columns = [] }: TopColumnsListProps) {
  const categoryColors: Record<string, string> = {
    'ai-tools': 'bg-emerald-100 text-emerald-700',
    'industry': 'bg-blue-100 text-blue-700',
    'topics-news': 'bg-purple-100 text-purple-700',
    'ai-driven-dev': 'bg-orange-100 text-orange-700'
  }

  const categoryLabels: Record<string, string> = {
    'ai-tools': '生成AIツール',
    'industry': '業界別',
    'topics-news': 'トピック・ニュース',
    'ai-driven-dev': 'AI駆動開発'
  }

  // 秒数を分:秒形式に変換
  const formatDuration = (seconds?: number) => {
    if (!seconds || seconds === 0) return '-'
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // URLからIDを抽出してコラム情報を取得
  const getColumnInfo = (pagePath: string) => {
    // GA4では /column/[id] だが、実際のアプリでは /columns/[id] なので両方に対応
    const match = pagePath.match(/^\/columns?\/([^\/]+)\/?$/)
    if (match) {
      const idOrSlug = match[1]
      
      // 数字IDの場合は、created_at順でソートしたコラムの順番でマッピング
      if (/^\d+$/.test(idOrSlug)) {
        const numericId = parseInt(idOrSlug)
        // created_at順でソート（古い順）
        const sortedColumns = [...columns].sort((a, b) => 
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        )
        // 1から始まる番号でマッピング（numericId - 1 がインデックス）
        if (numericId > 0 && numericId <= sortedColumns.length) {
          return sortedColumns[numericId - 1]
        }
      }
      
      // UUIDまたはslugでマッチングを試みる
      const column = columns.find(col => 
        col.id === idOrSlug || 
        col.slug === idOrSlug ||
        // slugがnullの場合も考慮
        (col.slug && col.slug.toLowerCase() === idOrSlug.toLowerCase())
      )
      
      if (!column) {
        // console.log(`No column found for path: ${pagePath}, idOrSlug: ${idOrSlug}`)
      }
      
      return column
    }
    return null
  }

  // デバッグ情報を追加（開発時のみ）
  // console.log('TopColumnsList Debug:', {
  //   topPagesCount: topPages.length,
  //   columnsCount: columns.length,
  //   topPages: topPages.slice(0, 3),
  //   sampleColumns: columns.slice(0, 3).map(c => ({ id: c.id, slug: c.slug, title: c.title }))
  // })

  return (
    <div className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            ビュー数TOP 10
          </h2>
          <span className="text-sm text-gray-500">過去90日間</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full table-fixed">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="w-[80px] text-center px-6 py-3 text-sm font-medium text-gray-700">順位</th>
              <th className="w-40 text-center px-6 py-3 text-sm font-medium text-gray-700">画像</th>
              <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">内容</th>
              <th className="w-[140px] text-center px-6 py-3 text-sm font-medium text-gray-700">カテゴリ</th>
              <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">ビュー数</th>
              <th className="w-[140px] text-center px-6 py-3 text-sm font-medium text-gray-700">平均滞在時間</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {topPages.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                  データがありません
                </td>
              </tr>
            ) : (
              topPages.map((page, index) => {
                const column = getColumnInfo(page.pagePath)
                if (!column) {
                  // コラム情報が見つからない場合でもパスとビュー数を表示
                  return (
                    <tr key={page.pagePath} className="hover:bg-gray-50 transition-colors">
                      <td className="w-[80px] px-6 py-4">
                        <div className="flex justify-center">
                          <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                            index === 0 ? 'bg-yellow-500 text-white' : 
                            index === 1 ? 'bg-gray-400 text-white' : 
                            index === 2 ? 'bg-orange-600 text-white' : 
                            'bg-gray-200 text-gray-700'
                          }`}>
                            {index + 1}
                          </div>
                        </div>
                      </td>
                      <td className="w-40 px-6 py-4">
                        <div className="flex justify-center">
                          <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <Trophy className="w-6 h-6 text-gray-400" />
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-left text-gray-700 min-w-0">
                          {(() => {
                            const pathMatch = page.pagePath.match(/^\/columns?\/([^\/]+)\/?$/)
                            if (pathMatch) {
                              const idOrSlug = pathMatch[1]
                              // IDまたはslugを表示（より読みやすい形式で）
                              return idOrSlug.replace(/-/g, ' ').replace(/_/g, ' ')
                            }
                            return page.pagePath
                          })()}
                          <span className="text-xs block text-gray-400 mt-1">ID: {page.pagePath}</span>
                        </div>
                      </td>
                      <td className="w-[140px] px-6 py-4 text-center">
                        <span className="text-gray-400">-</span>
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <TrendingUp className="h-4 w-4 text-green-500" />
                          <span className="font-medium text-gray-900">
                            {page.views.toLocaleString()}
                          </span>
                        </div>
                      </td>
                      <td className="w-[140px] px-6 py-4 text-center">
                        <span className="font-medium text-gray-700">
                          {formatDuration(page.avgEngagementTime)}
                        </span>
                      </td>
                    </tr>
                  )
                }

                return (
                <tr key={page.pagePath} className="hover:bg-gray-50 transition-colors">
                  <td className="w-[80px] px-6 py-4">
                    <div className="flex justify-center">
                      <div className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                        index === 0 ? 'bg-yellow-500 text-white' : 
                        index === 1 ? 'bg-gray-400 text-white' : 
                        index === 2 ? 'bg-orange-600 text-white' : 
                        'bg-gray-200 text-gray-700'
                      }`}>
                        {index + 1}
                      </div>
                    </div>
                  </td>
                  <td className="w-40 px-6 py-4">
                    <div className="flex justify-center">
                      {column.thumbnail ? (
                        <Image
                          src={column.thumbnail}
                          alt=""
                          width={80}
                          height={48}
                          className="rounded object-cover"
                        />
                      ) : (
                        <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                          <Trophy className="w-6 h-6 text-gray-400" />
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-left min-w-0">
                      <h3 className="font-medium text-gray-900 truncate hover:text-portfolio-blue">
                        <Link href={`/admin/columns/${column.id}/edit`}>
                          {column.title}
                        </Link>
                      </h3>
                      {column.excerpt && (
                        <p className="text-sm text-gray-500 line-clamp-1 mt-1">
                          {column.excerpt}
                        </p>
                      )}
                    </div>
                  </td>
                  <td className="w-[140px] px-6 py-4 text-center">
                    {column.category && (
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                        categoryColors[column.category] || 'bg-gray-100 text-gray-700'
                      }`}>
                        {categoryLabels[column.category] || column.category}
                      </span>
                    )}
                  </td>
                  <td className="w-[120px] px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <TrendingUp className="h-4 w-4 text-green-500" />
                      <span className="font-medium text-gray-900">
                        {page.views.toLocaleString()}
                      </span>
                    </div>
                  </td>
                  <td className="w-[120px] px-6 py-4 text-center">
                    <span className="font-medium text-gray-700">
                      {formatDuration(page.avgEngagementTime)}
                    </span>
                  </td>
                </tr>
              )
            })
          )}
          </tbody>
        </table>
      </div>
    </div>
  )
}