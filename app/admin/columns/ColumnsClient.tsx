'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FileText, Search, Filter, FolderOpen } from 'lucide-react'
import Image from 'next/image'
import DeleteColumnButton from './DeleteColumnButton'

interface Column {
  id: string
  title: string
  slug: string
  excerpt?: string
  is_published: boolean
  is_featured: boolean
  view_count: number
  thumbnail?: string
}

interface ColumnsClientProps {
  columns: Column[]
}

export default function ColumnsClient({ columns }: ColumnsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')

  const filteredColumns = useMemo(() => {
    return columns.filter(column => {
      const matchesSearch = searchQuery === '' || 
        column.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        column.slug.toLowerCase().includes(searchQuery.toLowerCase())
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'published' && column.is_published) ||
        (statusFilter === 'draft' && !column.is_published)

      return matchesSearch && matchesStatus
    })
  }, [columns, searchQuery, statusFilter])

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">コラム管理</h1>
      
      {!columns || columns.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <FileText className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">コラムがありません</h2>
          <p className="text-gray-600 mb-8">最初のコラムを追加して情報を発信しましょう</p>
          <Link
            href="/admin/columns/new"
            className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
          >
            <Plus className="h-6 w-6" />
            コラムを追加
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{columns.length}</div>
              <div className="text-sm text-gray-600">総コラム数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {columns.filter(c => c.is_published).length}
              </div>
              <div className="text-sm text-gray-600">公開中</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-gray-600">
                {columns.filter(c => !c.is_published).length}
              </div>
              <div className="text-sm text-gray-600">下書き</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {columns.filter(c => c.is_featured).length}
              </div>
              <div className="text-sm text-gray-600">注目</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4">
            <Link
              href="/admin/columns/new"
              className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="h-5 w-5" />
              コラムを追加
            </Link>

            <div className="flex items-center gap-4 flex-1 justify-end">
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
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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

          {/* Columns Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-40 text-center px-6 py-3 text-sm font-medium text-gray-700">画像</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">内容</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">注目</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredColumns.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredColumns.map((column) => (
                    <tr key={column.id} className="hover:bg-gray-50 transition-colors">
                      <td className="w-40 px-6 py-4">
                        <div className="flex justify-center">
                          {column.thumbnail ? (
                            <div className="relative w-20 h-12 flex-shrink-0">
                              <Image
                                src={column.thumbnail}
                                alt={column.title}
                                fill
                                className="object-cover rounded"
                              />
                            </div>
                          ) : (
                            <div className="w-20 h-12 bg-gray-100 rounded flex items-center justify-center">
                              <FileText className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-left min-w-0">
                          <h3 className="font-medium text-gray-900 truncate">{column.title}</h3>
                          {column.excerpt && (
                            <p className="text-sm text-gray-600 truncate">
                              {column.excerpt}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          column.is_published 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {column.is_published ? '公開中' : '下書き'}
                        </span>
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center text-sm">
                        <span className={column.is_featured ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {column.is_featured ? 'YES' : 'NO'}
                        </span>
                      </td>
                      <td className="w-[120px] px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/admin/columns/${column.id}/edit`}
                            className="p-2 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteColumnButton columnId={column.id} columnTitle={column.title} />
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