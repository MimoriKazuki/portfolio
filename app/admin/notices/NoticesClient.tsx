'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit, FileText, Search, Filter, Bell } from 'lucide-react'
import Image from 'next/image'
import DeleteNoticeButton from './DeleteNoticeButton'

interface Notice {
  id: string
  title: string
  category: 'news' | 'webinar' | 'event' | 'maintenance' | 'other'
  site_url?: string
  thumbnail?: string
  description?: string
  is_featured: boolean
  is_published: boolean
  published_date: string
}

interface NoticesClientProps {
  notices: Notice[]
}

export default function NoticesClient({ notices }: NoticesClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const categoryColors = {
    news: 'bg-blue-100 text-blue-700',
    webinar: 'bg-purple-100 text-purple-700',
    event: 'bg-pink-100 text-pink-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700'
  }

  const categoryLabels = {
    news: 'ニュース',
    webinar: 'ウェビナー',
    event: 'イベント',
    maintenance: 'メンテナンス',
    other: 'その他'
  }

  const filteredNotices = useMemo(() => {
    return notices.filter(notice => {
      const matchesSearch = searchQuery === '' || 
        notice.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        notice.description?.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && notice.is_published) ||
        (statusFilter === 'draft' && !notice.is_published)

      const matchesCategory = categoryFilter === 'all' || notice.category === categoryFilter

      return matchesSearch && matchesStatus && matchesCategory
    })
  }, [notices, searchQuery, statusFilter, categoryFilter])

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">お知らせ管理</h1>
      
      {!notices || notices.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <Bell className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">お知らせがありません</h2>
          <p className="text-gray-600 mb-8">最初のお知らせを追加してユーザーに情報を届けましょう</p>
          <Link
            href="/admin/notices/new"
            className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            お知らせを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{notices.length}</div>
              <div className="text-sm text-gray-600">総お知らせ数</div>
            </div>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <div className={`text-3xl font-bold ${categoryColors[key as keyof typeof categoryColors].split(' ')[1]}`}>
                  {notices.filter(n => n.category === key).length}
                </div>
                <div className="text-sm text-gray-600">{label}</div>
              </div>
            ))}
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin/notices/new"
              className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              お知らせを追加
            </Link>

            <div className="flex items-center gap-4 flex-1 justify-end">
              {/* Category filter */}
              <div className="relative">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべてのカテゴリ</option>
                  {Object.entries(categoryLabels).map(([key, label]) => (
                    <option key={key} value={key}>{label}</option>
                  ))}
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="published">公開中</option>
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

          {/* Notices Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-40 text-center px-6 py-3 text-sm font-medium text-gray-700">画像</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">内容</th>
                  <th className="w-[140px] text-center px-6 py-3 text-sm font-medium text-gray-700">カテゴリ</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">注目</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredNotices.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredNotices.map((notice) => (
                    <tr key={notice.id} className="hover:bg-gray-50 transition-colors">
                      <td className="w-40 px-6 py-4">
                        <div className="flex justify-center">
                          {notice.thumbnail ? (
                            <div className="relative w-20 h-12 flex-shrink-0">
                              <Image
                                src={notice.thumbnail}
                                alt={notice.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <Bell className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-left min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{notice.title}</h3>
                          {notice.description && (
                            <p className="text-sm text-gray-600 truncate">
                              {notice.description}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="w-[140px] px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          categoryColors[notice.category] || 'bg-gray-100 text-gray-700'
                        }`}>
                          {categoryLabels[notice.category] || notice.category}
                        </span>
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          notice.is_published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {notice.is_published ? '公開中' : '下書き'}
                        </span>
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center text-sm">
                        <span className={notice.is_featured ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {notice.is_featured ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      <td className="w-[120px] px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/notices/${notice.id}/edit`}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteNoticeButton noticeId={notice.id} noticeTitle={notice.title} />
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