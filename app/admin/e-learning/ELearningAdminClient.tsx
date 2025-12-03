'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FolderOpen, Search, Eye, Filter, PlayCircle } from 'lucide-react'
import Image from 'next/image'
import DeleteELearningButton from './DeleteELearningButton'
import { ELearningContent } from '@/app/types'
import { formatDate } from '@/app/lib/date-utils'

interface ELearningAdminClientProps {
  contents: ELearningContent[]
}

export default function ELearningAdminClient({ contents }: ELearningAdminClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [priceFilter, setPriceFilter] = useState('')
  const [publishFilter, setPublishFilter] = useState('')

  const filteredContents = useMemo(() => {
    return contents.filter(content => {
      const matchesSearch = searchQuery === '' ||
        content.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (content.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesPrice = priceFilter === '' ||
        (priceFilter === 'free' && content.is_free) ||
        (priceFilter === 'paid' && !content.is_free)

      const matchesPublish = publishFilter === '' ||
        (publishFilter === 'published' && content.is_published) ||
        (publishFilter === 'draft' && !content.is_published)

      return matchesSearch && matchesPrice && matchesPublish
    })
  }, [contents, searchQuery, priceFilter, publishFilter])

  // 統計情報
  const stats = useMemo(() => ({
    total: contents.length,
    free: contents.filter(c => c.is_free).length,
    paid: contents.filter(c => !c.is_free).length,
    published: contents.filter(c => c.is_published).length,
  }), [contents])

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">eラーニング管理</h1>

      {!contents || contents.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <PlayCircle className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">eラーニングコンテンツがありません</h2>
          <p className="text-gray-600 mb-8">最初のコンテンツを追加しましょう</p>
          <Link
            href="/admin/e-learning/new"
            className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            コンテンツを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{stats.total}</div>
              <div className="text-sm text-gray-600">総コンテンツ数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">{stats.free}</div>
              <div className="text-sm text-gray-600">無料コンテンツ</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-orange-600">{stats.paid}</div>
              <div className="text-sm text-gray-600">有料コンテンツ</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">{stats.published}</div>
              <div className="text-sm text-gray-600">公開中</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Link
              href="/admin/e-learning/new"
              className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              新規追加
            </Link>

            <div className="flex items-center gap-4 flex-1 justify-end flex-wrap">
              {/* Price Filter */}
              <div className="relative">
                <select
                  value={priceFilter}
                  onChange={(e) => setPriceFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="">すべて</option>
                  <option value="free">無料</option>
                  <option value="paid">有料</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Publish Filter */}
              <div className="relative">
                <select
                  value={publishFilter}
                  onChange={(e) => setPublishFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="">公開状態</option>
                  <option value="published">公開</option>
                  <option value="draft">下書き</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Contents Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-32 text-center px-4 py-3 text-xs font-medium text-gray-700">画像</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-700 min-w-[200px]">タイトル</th>
                  <th className="w-20 text-center px-4 py-3 text-xs font-medium text-gray-700">長さ</th>
                  <th className="w-24 text-center px-4 py-3 text-xs font-medium text-gray-700">料金</th>
                  <th className="w-24 text-center px-4 py-3 text-xs font-medium text-gray-700">公開</th>
                  <th className="w-20 text-center px-4 py-3 text-xs font-medium text-gray-700">注目</th>
                  <th className="w-20 text-center px-4 py-3 text-xs font-medium text-gray-700">資料</th>
                  <th className="w-28 text-center px-4 py-3 text-xs font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContents.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredContents.map((content) => (
                    <tr key={content.id} className="hover:bg-gray-50 transition-colors">
                      {/* サムネイル */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {content.thumbnail_url ? (
                            <div className="relative w-16 h-10 flex-shrink-0">
                              <Image
                                src={content.thumbnail_url}
                                alt={content.title}
                                fill
                                className="object-cover rounded"
                                sizes="64px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <PlayCircle className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* タイトル */}
                      <td className="px-4 py-3">
                        <div className="text-left">
                          <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {content.title}
                          </h3>
                        </div>
                      </td>
                      {/* 動画の長さ */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {content.duration || '-'}
                      </td>
                      {/* 料金 */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                          content.is_free
                            ? 'bg-green-100 text-green-800'
                            : 'bg-orange-100 text-orange-800'
                        }`}>
                          {content.is_free ? '無料' : `¥${content.price.toLocaleString()}`}
                        </span>
                      </td>
                      {/* 公開 */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                          content.is_published
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {content.is_published ? '公開' : '下書き'}
                        </span>
                      </td>
                      {/* 注目 */}
                      <td className="px-4 py-3 text-center text-sm">
                        <span className={content.is_featured ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {content.is_featured ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      {/* 資料数 */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {content.materials?.length || 0}件
                      </td>
                      {/* アクション */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/e-learning/${content.id}`}
                            target="_blank"
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="詳細"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/e-learning/${content.id}/edit`}
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteELearningButton contentId={content.id} contentTitle={content.title} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
