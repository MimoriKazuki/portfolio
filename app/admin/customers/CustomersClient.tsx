'use client'

import { useState, useMemo } from 'react'
import { Search, Download, Users, Filter, Building2, Plus, Pencil, Trash2, X } from 'lucide-react'
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
  last_sign_in_at: string | null
  purchases: Purchase[]
}

interface CorporateUser {
  id: string
  email: string
  created_at: string
}

interface CorporateCustomer {
  id: string
  company_name: string
  contact_person: string | null
  contact_email: string | null
  contact_phone: string | null
  contract_status: 'active' | 'expired' | 'pending'
  contract_start_date: string | null
  contract_end_date: string | null
  notes: string | null
  created_at: string
  updated_at: string
  users: CorporateUser[]
}

interface CustomersClientProps {
  customers: Customer[]
  corporateCustomers: CorporateCustomer[]
}

type TabType = 'individual' | 'corporate'

export default function CustomersClient({ customers: initialCustomers, corporateCustomers: initialCorporate }: CustomersClientProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [corporateCustomers, setCorporateCustomers] = useState(initialCorporate)
  const [activeTab, setActiveTab] = useState<TabType>('individual')
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | 'paid' | 'free'>('all')
  const [corporateStatusFilter, setCorporateStatusFilter] = useState<'all' | 'active' | 'expired' | 'pending'>('all')
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null)
  const [showCorporateModal, setShowCorporateModal] = useState(false)
  const [editingCorporate, setEditingCorporate] = useState<CorporateCustomer | null>(null)
  const [corporateForm, setCorporateForm] = useState({
    company_name: '',
    contact_person: '',
    contact_email: '',
    contact_phone: '',
    contract_status: 'active' as 'active' | 'expired' | 'pending',
    contract_start_date: '',
    contract_end_date: '',
    notes: '',
  })
  const [saving, setSaving] = useState(false)
  const [statusConfirmModal, setStatusConfirmModal] = useState<Customer | null>(null)
  const [newUserEmail, setNewUserEmail] = useState('')
  const [addingUser, setAddingUser] = useState(false)
  const [userError, setUserError] = useState('')

  // フィルタリングされた顧客リスト（個人）
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const matchesSearch =
        searchQuery === '' ||
        customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (customer.display_name?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'paid' && customer.has_paid_access) ||
        (statusFilter === 'free' && !customer.has_paid_access)

      return matchesSearch && matchesStatus
    })
  }, [customers, searchQuery, statusFilter])

  // フィルタリングされた企業リスト
  const filteredCorporate = useMemo(() => {
    return corporateCustomers.filter((corp) => {
      const matchesSearch =
        searchQuery === '' ||
        corp.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (corp.contact_person?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
        (corp.contact_email?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false)

      const matchesStatus =
        corporateStatusFilter === 'all' || corp.contract_status === corporateStatusFilter

      return matchesSearch && matchesStatus
    })
  }, [corporateCustomers, searchQuery, corporateStatusFilter])

  // 統計情報
  const stats = useMemo(() => {
    const total = customers.length
    const paid = customers.filter((c) => c.has_paid_access).length
    const free = total - paid
    const corporate = corporateCustomers.filter((c) => c.contract_status === 'active').length
    const totalRevenue = customers.reduce((sum, c) => {
      return sum + c.purchases.reduce((pSum, p) => pSum + (p.status === 'completed' ? p.amount : 0), 0)
    }, 0)
    return { total, paid, free, corporate, totalRevenue }
  }, [customers, corporateCustomers])

  // ステータス変更確認モーダルを開く
  const openStatusConfirmModal = (customer: Customer) => {
    setStatusConfirmModal(customer)
  }

  // ステータス更新を実行
  const handleConfirmStatusChange = async () => {
    if (!statusConfirmModal) return

    const customer = statusConfirmModal
    setStatusConfirmModal(null)
    setUpdatingStatus(customer.id)

    try {
      const res = await fetch(`/api/admin/customers/${customer.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ has_paid_access: !customer.has_paid_access }),
      })

      if (res.ok) {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === customer.id ? { ...c, has_paid_access: !c.has_paid_access } : c
          )
        )
      }
    } catch (error) {
      console.error('Failed to update status:', error)
    } finally {
      setUpdatingStatus(null)
    }
  }

  // 企業モーダルを開く
  const openCorporateModal = (corp?: CorporateCustomer) => {
    if (corp) {
      setEditingCorporate(corp)
      setCorporateForm({
        company_name: corp.company_name,
        contact_person: corp.contact_person || '',
        contact_email: corp.contact_email || '',
        contact_phone: corp.contact_phone || '',
        contract_status: corp.contract_status,
        contract_start_date: corp.contract_start_date || '',
        contract_end_date: corp.contract_end_date || '',
        notes: corp.notes || '',
      })
    } else {
      setEditingCorporate(null)
      setCorporateForm({
        company_name: '',
        contact_person: '',
        contact_email: '',
        contact_phone: '',
        contract_status: 'active',
        contract_start_date: '',
        contract_end_date: '',
        notes: '',
      })
    }
    setShowCorporateModal(true)
  }

  // 企業を保存
  const handleSaveCorporate = async () => {
    if (!corporateForm.company_name.trim()) return

    setSaving(true)
    try {
      const url = editingCorporate
        ? `/api/admin/corporate-customers/${editingCorporate.id}`
        : '/api/admin/corporate-customers'
      const method = editingCorporate ? 'PUT' : 'POST'

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(corporateForm),
      })

      if (res.ok) {
        const data = await res.json()
        if (editingCorporate) {
          setCorporateCustomers((prev) =>
            prev.map((c) => (c.id === editingCorporate.id ? { ...data, users: c.users || [] } : c))
          )
        } else {
          // 新規作成時はusers配列を初期化
          setCorporateCustomers((prev) => [{ ...data, users: [] }, ...prev])
        }
        setShowCorporateModal(false)
      }
    } catch (error) {
      console.error('Failed to save corporate customer:', error)
    } finally {
      setSaving(false)
    }
  }

  // 企業を削除
  const handleDeleteCorporate = async (id: string) => {
    if (!confirm('この企業を削除しますか？')) return

    try {
      const res = await fetch(`/api/admin/corporate-customers/${id}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setCorporateCustomers((prev) => prev.filter((c) => c.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete corporate customer:', error)
    }
  }

  // 企業ユーザーを追加（企業モーダル内で使用）
  const handleAddCorporateUser = async () => {
    if (!editingCorporate || !newUserEmail.trim()) return

    setAddingUser(true)
    setUserError('')

    try {
      const res = await fetch(`/api/admin/corporate-customers/${editingCorporate.id}/users`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newUserEmail.trim() }),
      })

      if (res.ok) {
        const newUser = await res.json()
        setCorporateCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCorporate.id
              ? { ...c, users: [...(c.users || []), newUser] }
              : c
          )
        )
        setEditingCorporate((prev) =>
          prev ? { ...prev, users: [...(prev.users || []), newUser] } : null
        )
        setNewUserEmail('')
      } else {
        const data = await res.json()
        setUserError(data.error || 'ユーザーの追加に失敗しました')
      }
    } catch (error) {
      console.error('Failed to add corporate user:', error)
      setUserError('ユーザーの追加に失敗しました')
    } finally {
      setAddingUser(false)
    }
  }

  // 企業ユーザーを削除
  const handleRemoveCorporateUser = async (email: string) => {
    if (!editingCorporate) return

    try {
      const res = await fetch(
        `/api/admin/corporate-customers/${editingCorporate.id}/users?email=${encodeURIComponent(email)}`,
        { method: 'DELETE' }
      )

      if (res.ok) {
        setCorporateCustomers((prev) =>
          prev.map((c) =>
            c.id === editingCorporate.id
              ? { ...c, users: (c.users || []).filter((u) => u.email !== email) }
              : c
          )
        )
        setEditingCorporate((prev) =>
          prev ? { ...prev, users: (prev.users || []).filter((u) => u.email !== email) } : null
        )
      }
    } catch (error) {
      console.error('Failed to remove corporate user:', error)
    }
  }

  // CSV出力（個人）
  const handleExportCSV = () => {
    const headers = ['メールアドレス', '表示名', 'ステータス', '登録日', '最終ログイン', '購入日']
    const rows = filteredCustomers.map((customer) => {
      const completedPurchases = customer.purchases.filter((p) => p.status === 'completed')
      const latestPurchaseDate = completedPurchases.length > 0
        ? completedPurchases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
        : null

      return [
        customer.email,
        customer.display_name || '',
        customer.has_paid_access ? '有料' : '無料',
        format(new Date(customer.created_at), 'yyyy/MM/dd HH:mm', { locale: ja }),
        customer.last_sign_in_at
          ? format(new Date(customer.last_sign_in_at), 'yyyy/MM/dd HH:mm', { locale: ja })
          : '',
        latestPurchaseDate
          ? format(new Date(latestPurchaseDate), 'yyyy/MM/dd HH:mm', { locale: ja })
          : '',
      ]
    })

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
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

  // CSV出力（企業）
  const handleExportCorporateCSV = () => {
    const headers = ['会社名', '担当者', 'メールアドレス', '電話番号', '契約ステータス', '契約開始日', '契約終了日', '備考']
    const statusLabel = { active: '契約中', expired: '契約終了', pending: '契約準備中' }
    const rows = filteredCorporate.map((corp) => [
      corp.company_name,
      corp.contact_person || '',
      corp.contact_email || '',
      corp.contact_phone || '',
      statusLabel[corp.contract_status],
      corp.contract_start_date || '',
      corp.contract_end_date || '',
      corp.notes || '',
    ])

    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n')
    const bom = '\uFEFF'
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `corporate_customers_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const contractStatusLabel = {
    active: { text: '契約中', class: 'bg-green-100 text-green-700' },
    expired: { text: '契約終了', class: 'bg-gray-100 text-gray-700' },
    pending: { text: '契約準備中', class: 'bg-yellow-100 text-yellow-700' },
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">顧客管理</h1>

      <div className="space-y-6">
        {/* 統計カード */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
            <div className="text-3xl font-bold text-blue-600">{stats.corporate}</div>
            <div className="text-sm text-gray-600">契約企業</div>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <div className="text-3xl font-bold text-purple-600">¥{stats.totalRevenue.toLocaleString()}</div>
            <div className="text-sm text-gray-600">総売上</div>
          </div>
        </div>

        {/* タブ切り替え */}
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab('individual')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'individual'
                ? 'text-portfolio-blue border-b-2 border-portfolio-blue'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Users className="inline-block h-4 w-4 mr-2" />
            個人ユーザー ({customers.length})
          </button>
          <button
            onClick={() => setActiveTab('corporate')}
            className={`px-6 py-3 text-sm font-medium transition-colors ${
              activeTab === 'corporate'
                ? 'text-portfolio-blue border-b-2 border-portfolio-blue'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <Building2 className="inline-block h-4 w-4 mr-2" />
            契約企業 ({corporateCustomers.length})
          </button>
        </div>

        {/* Action bar */}
        <div className="flex items-center justify-between gap-4">
          {activeTab === 'individual' ? (
            <button
              onClick={handleExportCSV}
              className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Download className="h-5 w-5" />
              CSV出力
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => openCorporateModal()}
                className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                企業を追加
              </button>
              <button
                onClick={handleExportCorporateCSV}
                className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                <Download className="h-5 w-5" />
                CSV出力
              </button>
            </div>
          )}

          <div className="flex items-center gap-4 flex-1 justify-end">
            {/* ステータスフィルター */}
            <div className="relative">
              {activeTab === 'individual' ? (
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as 'all' | 'paid' | 'free')}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="paid">有料ユーザー</option>
                  <option value="free">無料ユーザー</option>
                </select>
              ) : (
                <select
                  value={corporateStatusFilter}
                  onChange={(e) => setCorporateStatusFilter(e.target.value as 'all' | 'active' | 'expired' | 'pending')}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべての契約ステータス</option>
                  <option value="active">契約中</option>
                  <option value="pending">契約準備中</option>
                  <option value="expired">契約終了</option>
                </select>
              )}
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

        {/* テーブル */}
        {activeTab === 'individual' ? (
          /* 個人ユーザーリスト */
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">ユーザー</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="w-[160px] text-center px-6 py-3 text-sm font-medium text-gray-700">登録日</th>
                  <th className="w-[160px] text-center px-6 py-3 text-sm font-medium text-gray-700">最終ログイン</th>
                  <th className="w-[160px] text-center px-6 py-3 text-sm font-medium text-gray-700">購入日</th>
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
                    // 最新の購入日を取得
                    const latestPurchaseDate = completedPurchases.length > 0
                      ? completedPurchases.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())[0].created_at
                      : null

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
                        <td className="w-[120px] px-6 py-4 text-center">
                          <button
                            onClick={() => openStatusConfirmModal(customer)}
                            disabled={updatingStatus === customer.id}
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                              customer.has_paid_access
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            } ${updatingStatus === customer.id ? 'opacity-50' : ''}`}
                          >
                            {updatingStatus === customer.id ? '...' : customer.has_paid_access ? '有料' : '無料'}
                          </button>
                        </td>
                        <td className="w-[160px] px-6 py-4 text-center text-sm text-gray-600">
                          {format(new Date(customer.created_at), 'yyyy/MM/dd HH:mm', { locale: ja })}
                        </td>
                        <td className="w-[160px] px-6 py-4 text-center text-sm text-gray-600">
                          {customer.last_sign_in_at
                            ? format(new Date(customer.last_sign_in_at), 'yyyy/MM/dd HH:mm', { locale: ja })
                            : '-'}
                        </td>
                        <td className="w-[160px] px-6 py-4 text-center text-sm text-gray-600">
                          {latestPurchaseDate
                            ? format(new Date(latestPurchaseDate), 'yyyy/MM/dd HH:mm', { locale: ja })
                            : '-'}
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : (
          /* 契約企業リスト */
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full table-fixed">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">会社名</th>
                  <th className="w-[180px] text-left px-6 py-3 text-sm font-medium text-gray-700">担当者</th>
                  <th className="w-[120px] text-center px-6 py-3 text-sm font-medium text-gray-700">契約ステータス</th>
                  <th className="w-[100px] text-center px-6 py-3 text-sm font-medium text-gray-700">ユーザー数</th>
                  <th className="w-[200px] text-center px-6 py-3 text-sm font-medium text-gray-700">契約期間</th>
                  <th className="w-[100px] text-center px-6 py-3 text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCorporate.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      {corporateCustomers.length === 0
                        ? '契約企業が登録されていません'
                        : '検索結果が見つかりませんでした'}
                    </td>
                  </tr>
                ) : (
                  filteredCorporate.map((corp) => (
                    <tr key={corp.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center flex-shrink-0">
                            <Building2 className="h-5 w-5 text-blue-600" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 truncate">{corp.company_name}</p>
                            {corp.contact_email && (
                              <p className="text-sm text-gray-500 truncate">{corp.contact_email}</p>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="w-[180px] px-6 py-4 text-sm text-gray-600">
                        <div>
                          <p className="truncate">{corp.contact_person || '-'}</p>
                          {corp.contact_phone && (
                            <p className="text-xs text-gray-400">{corp.contact_phone}</p>
                          )}
                        </div>
                      </td>
                      <td className="w-[120px] px-6 py-4 text-center">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            contractStatusLabel[corp.contract_status].class
                          }`}
                        >
                          {contractStatusLabel[corp.contract_status].text}
                        </span>
                      </td>
                      <td className="w-[100px] px-6 py-4 text-center">
                        <button
                          onClick={() => openCorporateModal(corp)}
                          className="inline-flex items-center gap-1 px-2 py-1 text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
                        >
                          <Users className="h-4 w-4" />
                          <span>{corp.users?.length || 0}名</span>
                        </button>
                      </td>
                      <td className="w-[200px] px-6 py-4 text-center text-sm text-gray-600">
                        {corp.contract_start_date || corp.contract_end_date ? (
                          <span>
                            {corp.contract_start_date || '-'} ～ {corp.contract_end_date || '-'}
                          </span>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="w-[100px] px-6 py-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => openCorporateModal(corp)}
                            className="p-1.5 text-gray-500 hover:text-portfolio-blue hover:bg-gray-100 rounded transition-colors"
                            title="編集"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteCorporate(corp.id)}
                            className="p-1.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="削除"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 企業登録/編集モーダル */}
      {showCorporateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCorporate ? '企業情報を編集' : '新規企業を追加'}
              </h2>
              <button
                onClick={() => setShowCorporateModal(false)}
                className="p-1 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  会社名 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={corporateForm.company_name}
                  onChange={(e) => setCorporateForm({ ...corporateForm, company_name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                  placeholder="株式会社〇〇"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">担当者名</label>
                  <input
                    type="text"
                    value={corporateForm.contact_person}
                    onChange={(e) => setCorporateForm({ ...corporateForm, contact_person: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                    placeholder="山田 太郎"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">契約ステータス</label>
                  <select
                    value={corporateForm.contract_status}
                    onChange={(e) =>
                      setCorporateForm({
                        ...corporateForm,
                        contract_status: e.target.value as 'active' | 'expired' | 'pending',
                      })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                  >
                    <option value="active">契約中</option>
                    <option value="pending">契約準備中</option>
                    <option value="expired">契約終了</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">メールアドレス</label>
                  <input
                    type="email"
                    value={corporateForm.contact_email}
                    onChange={(e) => setCorporateForm({ ...corporateForm, contact_email: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                    placeholder="example@company.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">電話番号</label>
                  <input
                    type="tel"
                    value={corporateForm.contact_phone}
                    onChange={(e) => setCorporateForm({ ...corporateForm, contact_phone: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                    placeholder="03-1234-5678"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">契約開始日</label>
                  <input
                    type="date"
                    value={corporateForm.contract_start_date}
                    onChange={(e) => setCorporateForm({ ...corporateForm, contract_start_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">契約終了日</label>
                  <input
                    type="date"
                    value={corporateForm.contract_end_date}
                    onChange={(e) => setCorporateForm({ ...corporateForm, contract_end_date: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">備考</label>
                <textarea
                  value={corporateForm.notes}
                  onChange={(e) => setCorporateForm({ ...corporateForm, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                  rows={3}
                  placeholder="契約内容や特記事項など"
                />
              </div>

              {/* ユーザー管理セクション */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h3 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  ログイン許可ユーザー
                </h3>

                {editingCorporate ? (
                  <>
                    {/* ユーザー追加フォーム */}
                    <div className="mb-4">
                      <div className="flex gap-2">
                        <input
                          type="email"
                          value={newUserEmail}
                          onChange={(e) => {
                            setNewUserEmail(e.target.value)
                            setUserError('')
                          }}
                          placeholder="user@example.com"
                          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-sm"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && newUserEmail.trim()) {
                              e.preventDefault()
                              handleAddCorporateUser()
                            }
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleAddCorporateUser}
                          disabled={addingUser || !newUserEmail.trim()}
                          className="px-3 py-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 text-sm"
                        >
                          {addingUser ? '...' : <><Plus className="h-4 w-4" />追加</>}
                        </button>
                      </div>
                      {userError && (
                        <p className="mt-1 text-xs text-red-600">{userError}</p>
                      )}
                      <p className="mt-1 text-xs text-gray-500">
                        登録されたメールアドレスでログインすると有料コンテンツにアクセスできます
                      </p>
                    </div>

                    {/* ユーザー一覧 */}
                    <div className="bg-gray-50 rounded-lg">
                      {(!editingCorporate.users || editingCorporate.users.length === 0) ? (
                        <div className="p-3 text-center text-gray-500 text-sm">
                          まだユーザーが登録されていません
                        </div>
                      ) : (
                        <div className="divide-y divide-gray-200 max-h-40 overflow-y-auto">
                          {editingCorporate.users.map((user) => (
                            <div
                              key={user.id}
                              className="flex items-center justify-between px-3 py-2"
                            >
                              <span className="text-sm text-gray-900">{user.email}</span>
                              <button
                                type="button"
                                onClick={() => handleRemoveCorporateUser(user.email)}
                                className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="削除"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-3 text-center text-gray-500 text-sm">
                    企業を保存後にユーザーを追加できます
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowCorporateModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                閉じる
              </button>
              <button
                onClick={handleSaveCorporate}
                disabled={saving || !corporateForm.company_name.trim()}
                className="px-4 py-2 text-white bg-portfolio-blue hover:bg-portfolio-blue-dark rounded-lg transition-colors disabled:opacity-50"
              >
                {saving ? '保存中...' : editingCorporate ? '更新' : '追加'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ステータス変更確認モーダル */}
      {statusConfirmModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-gray-900 mb-4">ステータス変更の確認</h2>
            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                以下のユーザーのステータスを変更しますか？
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="font-medium text-gray-900">
                  {statusConfirmModal.display_name || statusConfirmModal.email}
                </p>
                <p className="text-sm text-gray-500">{statusConfirmModal.email}</p>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      statusConfirmModal.has_paid_access
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {statusConfirmModal.has_paid_access ? '有料' : '無料'}
                  </span>
                  <span className="text-gray-400">→</span>
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                      !statusConfirmModal.has_paid_access
                        ? 'bg-green-100 text-green-700'
                        : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {!statusConfirmModal.has_paid_access ? '有料' : '無料'}
                  </span>
                </div>
              </div>
              {!statusConfirmModal.has_paid_access && (
                <p className="mt-4 text-sm text-blue-600">
                  有料に変更すると、eラーニングの有料コンテンツにアクセスできるようになります。
                </p>
              )}
              {statusConfirmModal.has_paid_access && (
                <p className="mt-4 text-sm text-orange-600">
                  無料に変更すると、eラーニングの有料コンテンツへのアクセスが制限されます。
                </p>
              )}
            </div>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setStatusConfirmModal(null)}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                キャンセル
              </button>
              <button
                onClick={handleConfirmStatusChange}
                className={`px-4 py-2 text-white rounded-lg transition-colors ${
                  !statusConfirmModal.has_paid_access
                    ? 'bg-green-600 hover:bg-green-700'
                    : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {!statusConfirmModal.has_paid_access ? '有料に変更' : '無料に変更'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  )
}
