'use client'

import { useState, useMemo } from 'react'
import { Search, Download, Users, CreditCard, UserCheck, UserX } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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
    <div className="space-y-6">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">顧客管理</h1>
          <p className="text-sm text-gray-500 mt-1">eラーニングユーザーの一覧と管理</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Download className="h-4 w-4" />
          CSV出力
        </button>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">総ユーザー数</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <UserCheck className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">有料ユーザー</p>
              <p className="text-2xl font-bold text-gray-900">{stats.paid}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gray-100 rounded-lg">
              <UserX className="h-5 w-5 text-gray-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">無料ユーザー</p>
              <p className="text-2xl font-bold text-gray-900">{stats.free}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-gray-200 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CreditCard className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">総売上</p>
              <p className="text-2xl font-bold text-gray-900">¥{stats.totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* フィルター */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 検索 */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="メールアドレスまたは名前で検索..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* ステータスフィルター */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'free')}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">すべて</option>
            <option value="paid">有料ユーザー</option>
            <option value="free">無料ユーザー</option>
          </select>
        </div>
      </div>

      {/* 顧客リスト */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ユーザー
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ステータス
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  登録日
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  購入履歴
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  購入金額
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                    該当する顧客が見つかりません
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => {
                  const completedPurchases = customer.purchases.filter((p) => p.status === 'completed')
                  const totalAmount = completedPurchases.reduce((sum, p) => sum + p.amount, 0)

                  return (
                    <tr key={customer.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {customer.avatar_url ? (
                            <img
                              src={customer.avatar_url}
                              alt=""
                              className="h-10 w-10 rounded-full object-cover"
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <Users className="h-5 w-5 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.display_name || '名前未設定'}
                            </p>
                            <p className="text-sm text-gray-500">{customer.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            customer.has_paid_access
                              ? 'bg-green-100 text-green-800'
                              : 'bg-gray-100 text-gray-800'
                          }`}
                        >
                          {customer.has_paid_access ? '有料' : '無料'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {format(new Date(customer.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                      </td>
                      <td className="px-6 py-4">
                        {completedPurchases.length > 0 ? (
                          <div className="text-sm">
                            <p className="text-gray-900">{completedPurchases.length}件</p>
                            <p className="text-gray-500 text-xs">
                              最新: {completedPurchases[0]?.content?.title || '不明'}
                            </p>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
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

      {/* フッター情報 */}
      <div className="text-sm text-gray-500 text-right">
        {filteredCustomers.length}件表示（全{customers.length}件中）
      </div>
    </div>
  )
}
