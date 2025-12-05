'use client'

import { useState, useMemo } from 'react'
import { Search, Download, Users, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import Image from 'next/image'

interface Purchase {
  id: string
  amount: number
  status: string
  created_at: string
  content?: {
    id: string
    title: string
  }
}

interface Customer {
  id: string
  auth_user_id: string
  email: string
  display_name: string | null
  avatar_url: string | null
  is_active: boolean
  has_paid_access: boolean
  created_at: string
  updated_at: string
  purchases: Purchase[]
}

interface CustomersClientProps {
  customers: Customer[]
}

export default function CustomersClient({ customers }: CustomersClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'free'>('all')

  // フィルタリングされた顧客リスト
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      // 検索フィルター
      const matchesSearch =
        searchQuery === '' ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      // ステータスフィルター
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && customer.has_paid_access) ||
        (statusFilter === 'free' && !customer.has_paid_access)

      return matchesSearch && matchesStatus
    })
  }, [customers, searchQuery, statusFilter])

  // 統計情報
  const stats = useMemo(() => {
    const total = customers.length
    const paid = customers.filter((c) => c.has_paid_access).length
    const free = total - paid
    const totalRevenue = customers.reduce((sum, c) => {
      return sum + c.purchases.reduce((pSum, p) => pSum + (p.status === 'completed' ? p.amount : 0), 0)
    }, 0)
    return { total, paid, free, totalRevenue }
  }, [customers])

  // CSV出力
  const handleExportCSV = () => {
    const headers = ['メールアドレス', '表示名', 'ステータス', '登録日', '購入金額合計', '購入回数']
    const rows = filteredCustomers.map((customer) => {
      const totalPurchaseAmount = customer.purchases
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
      const purchaseCount = customer.purchases.filter((p) => p.status === 'completed').length

      return [
        customer.email,
        customer.display_name || '',
        customer.has_paid_access ? '有料' : '無料',
        format(new Date(customer.created_at), 'yyyy/MM/dd HH:mm', { locale: ja }),
        totalPurchaseAmount.toLocaleString(),
        purchaseCount.toString(),
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')

    // BOMを追加してExcelで文字化けしないようにする
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `customers_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">顧客管理</h1>

      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-portfolio-blue">{stats.total}</div>
            <div className="text-sm text-gray-600">総ユーザー数</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-green-600">{stats.paid}</div>
            <div className="text-sm text-gray-600">有料ユーザー</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-gray-600">{stats.free}</div>
            <div className="text-sm text-gray-600">無料ユーザー</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">¥{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">総売上</div>
          </div>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-4">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
          >
            <Download className="h-5 w-5" />
            CSV出力
          </button>

          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* ステータスフィルター */}
            <div className="relative">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'free')}
                className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
              >
                <option value="all">すべてのステータス</option>
                <option value="paid">有料ユーザー</option>
                <option value="free">無料ユーザー</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>

            {/* 検索 */}
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

        {/* 顧客リスト */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="w-full table-fixed">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">ユーザー</th>
                <th className="w-[100px] text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                <th className="w-[160px] text-center px-6 py-3 text-sm font-medium text-gray-700">登録日</th>
                <th className="w-[140px] text-center px-6 py-3 text-sm font-medium text-gray-700">購入履歴</th>
                <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">購入金額</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    検索結果が見つかりませんでした
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const completedPurchases = customer.purchases.filter((p) => p.status === 'completed')
                  const totalAmount = completedPurchases.reduce((sum, p) => sum + p.amount, 0)

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.avatar_url ? (
                            <div className="relative w-10 h-10 flex-shrink-0">
                              <Image
                                src={customer.avatar_url}
                                alt=""
                                fill
                                className="rounded-full object-cover"
                                sizes="40px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                              <Users className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">
                              {customer.display_name || '名前未設定'}
                            </p>
                            <p className="text-sm text-gray-500 truncate">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="w-[100px] px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            customer.has_paid_access
                              ? 'bg-green-100 text-green-700'
                              : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {customer.has_paid_access ? '有料' : '無料'}
                        </span>
                      </td>
                      <td className="w-[160px] px-6 py-4 text-center text-sm text-gray-600">
                        {format(new Date(customer.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </td>
                      <td className="w-[140px] px-6 py-4 text-center">
                        {completedPurchases.length > 0 ? (
                          <div className="text-sm">
                            <p className="text-gray-900 font-medium">{completedPurchases.length}件</p>
                            <p className="text-gray-500 text-xs truncate">
                              {completedPurchases[0]?.content?.title || '全コンテンツ'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center text-sm font-medium text-gray-900">
                        {totalAmount > 0 ? `¥${totalAmount.toLocaleString()}` : '-'}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
