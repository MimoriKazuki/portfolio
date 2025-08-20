'use client'

import { useState, useMemo } from 'react'
import { Mail, MessageSquare, Search, Filter, Eye, CheckCircle, Trash2, Calendar, User, Building } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import DeleteContactButton from './DeleteContactButton'
import ContactDetailModal from './ContactDetailModal'
import UpdateContactStatusButton from './UpdateContactStatusButton'

interface Contact {
  id: string
  name: string
  company?: string
  email: string
  message: string
  inquiry_type: 'service' | 'partnership' | 'recruit' | 'other'
  status: 'new' | 'in_progress' | 'completed'
  created_at: string
  updated_at: string
}

interface ContactsClientProps {
  contacts: Contact[]
}

export default function ContactsClient({ contacts }: ContactsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)

  const statusColors = {
    'new': 'bg-red-100 text-red-700',
    'in_progress': 'bg-yellow-100 text-yellow-700',
    'completed': 'bg-green-100 text-green-700'
  }

  const statusLabels = {
    'new': '新規',
    'in_progress': '対応中',
    'completed': '完了'
  }

  const typeColors = {
    'service': 'bg-purple-100 text-purple-700',
    'partnership': 'bg-blue-100 text-blue-700',
    'recruit': 'bg-pink-100 text-pink-700',
    'other': 'bg-gray-100 text-gray-700'
  }

  const typeLabels = {
    'service': 'サービスについて',
    'partnership': '提携・協業',
    'recruit': '採用関連',
    'other': 'その他'
  }

  const filteredContacts = useMemo(() => {
    return contacts.filter(contact => {
      const matchesSearch = searchQuery === '' || 
        contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        contact.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (contact.company && contact.company.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || contact.status === statusFilter
      const matchesType = typeFilter === 'all' || contact.inquiry_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [contacts, searchQuery, statusFilter, typeFilter])

  const handleViewDetail = (contact: Contact) => {
    setSelectedContact(contact)
    setShowDetailModal(true)
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">お問い合わせ管理</h1>
      
      {!contacts || contacts.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <Mail className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">お問い合わせがありません</h2>
          <p className="text-gray-600">新しいお問い合わせが届くとここに表示されます</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{contacts.length}</div>
              <div className="text-sm text-gray-600">総お問い合わせ数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-red-600">
                {contacts.filter(c => c.status === 'new').length}
              </div>
              <div className="text-sm text-gray-600">未対応</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-yellow-600">
                {contacts.filter(c => c.status === 'in_progress').length}
              </div>
              <div className="text-sm text-gray-600">対応中</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {contacts.filter(c => c.status === 'completed').length}
              </div>
              <div className="text-sm text-gray-600">完了</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-1">
              {/* Status filter */}
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべてのステータス</option>
                  <option value="new">新規</option>
                  <option value="in_progress">対応中</option>
                  <option value="completed">完了</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Type filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべての種別</option>
                  <option value="service">サービスについて</option>
                  <option value="partnership">提携・協業</option>
                  <option value="recruit">採用関連</option>
                  <option value="other">その他</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Search box */}
              <div className="relative flex-1 max-w-md">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Contacts Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">受信日時</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">お客様情報</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">問い合わせ種別</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">メッセージ</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredContacts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredContacts.map((contact) => (
                    <tr key={contact.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(contact.created_at), { locale: ja, addSuffix: true })}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(contact.created_at).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{contact.name}</span>
                          </div>
                          {contact.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-3.5 w-3.5 text-gray-400" />
                              <span>{contact.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <a href={`mailto:${contact.email}`} className="hover:text-portfolio-blue">
                              {contact.email}
                            </a>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${typeColors[contact.inquiry_type]}`}>
                          {typeLabels[contact.inquiry_type]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {contact.message}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[contact.status]}`}>
                          {statusLabels[contact.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(contact)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="詳細を見る"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {contact.status !== 'completed' && (
                            <UpdateContactStatusButton 
                              contactId={contact.id}
                              currentStatus={contact.status}
                            />
                          )}
                          <DeleteContactButton 
                            contactId={contact.id} 
                            contactName={contact.name}
                          />
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

      {/* Detail Modal */}
      {showDetailModal && selectedContact && (
        <ContactDetailModal
          contact={selectedContact}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedContact(null)
          }}
        />
      )}
    </div>
  )
}