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

interface DocumentRequest {
  id: string
  document_id: string
  company_name: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  message?: string
  created_at: string
  document?: {
    id: string
    title: string
  }
}

interface PromptRequest {
  id: string
  type: string
  company_name: string
  name: string
  email: string
  phone?: string
  department?: string
  position?: string
  message?: string
  metadata?: {
    project_id?: string
    project_title?: string
  }
  created_at: string
  status?: string
}

interface ContactsClientProps {
  contacts: Contact[]
  documentRequests: DocumentRequest[]
  promptRequests?: PromptRequest[]
}

export default function ContactsClient({ contacts, documentRequests, promptRequests = [] }: ContactsClientProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all') // フォーム/資料請求のフィルター
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)
  const [selectedDocRequest, setSelectedDocRequest] = useState<DocumentRequest | null>(null)
  const [selectedPromptRequest, setSelectedPromptRequest] = useState<PromptRequest | null>(null)
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

  // すべての問い合わせを統合して管理するための型
  interface UnifiedInquiry {
    id: string
    name: string
    company: string
    email: string
    message: string
    type: 'contact' | 'document_request' | 'prompt_request'
    inquiry_type?: string
    status: 'new' | 'in_progress' | 'completed'
    created_at: string
    document_title?: string
    project_title?: string
    phone?: string
    department?: string
    position?: string
  }

  // データを統合
  const unifiedInquiries = useMemo(() => {
    const contactInquiries: UnifiedInquiry[] = contacts.map(contact => ({
      id: contact.id,
      name: contact.name,
      company: contact.company || '',
      email: contact.email,
      message: contact.message,
      type: 'contact' as const,
      inquiry_type: contact.inquiry_type,
      status: contact.status,
      created_at: contact.created_at
    }))

    const documentInquiries: UnifiedInquiry[] = documentRequests.map(req => ({
      id: req.id,
      name: req.name,
      company: req.company_name,
      email: req.email,
      message: req.message || '',
      type: 'document_request' as const,
      inquiry_type: 'document',
      status: 'new' as const, // 資料請求は常に新規として扱う
      created_at: req.created_at,
      document_title: req.document?.title,
      phone: req.phone,
      department: req.department,
      position: req.position
    }))

    const promptInquiries: UnifiedInquiry[] = promptRequests.map(req => ({
      id: req.id,
      name: req.name,
      company: req.company_name,
      email: req.email,
      message: req.message || '',
      type: 'prompt_request' as const,
      inquiry_type: 'prompt',
      status: (req.status || 'new') as 'new' | 'in_progress' | 'completed',
      created_at: req.created_at,
      project_title: req.metadata?.project_title,
      phone: req.phone,
      department: req.department,
      position: req.position
    }))

    return [...contactInquiries, ...documentInquiries, ...promptInquiries].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  }, [contacts, documentRequests, promptRequests])

  const filteredInquiries = useMemo(() => {
    return unifiedInquiries.filter(inquiry => {
      const matchesSearch = searchQuery === '' || 
        inquiry.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inquiry.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (inquiry.document_title && inquiry.document_title.toLowerCase().includes(searchQuery.toLowerCase()))
      
      const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter
      const matchesType = typeFilter === 'all' || 
        (typeFilter === 'document' && inquiry.type === 'document_request') ||
        (typeFilter === 'prompt' && inquiry.type === 'prompt_request') ||
        (typeFilter !== 'document' && typeFilter !== 'prompt' && inquiry.inquiry_type === typeFilter)
      const matchesSource = sourceFilter === 'all' || 
        (sourceFilter === 'form' && inquiry.type === 'contact') ||
        (sourceFilter === 'document' && inquiry.type === 'document_request') ||
        (sourceFilter === 'prompt' && inquiry.type === 'prompt_request')

      return matchesSearch && matchesStatus && matchesType && matchesSource
    })
  }, [unifiedInquiries, searchQuery, statusFilter, typeFilter, sourceFilter])

  const handleViewDetail = (inquiry: UnifiedInquiry) => {
    if (inquiry.type === 'contact') {
      const contact = contacts.find(c => c.id === inquiry.id)
      if (contact) {
        setSelectedContact(contact)
        setSelectedDocRequest(null)
        setSelectedPromptRequest(null)
      }
    } else if (inquiry.type === 'document_request') {
      const docRequest = documentRequests.find(d => d.id === inquiry.id)
      if (docRequest) {
        setSelectedDocRequest(docRequest)
        setSelectedContact(null)
        setSelectedPromptRequest(null)
      }
    } else if (inquiry.type === 'prompt_request') {
      const promptReq = promptRequests.find(p => p.id === inquiry.id)
      if (promptReq) {
        setSelectedPromptRequest(promptReq)
        setSelectedContact(null)
        setSelectedDocRequest(null)
      }
    }
    setShowDetailModal(true)
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">お問い合わせ管理</h1>
      
      {!unifiedInquiries || unifiedInquiries.length === 0 ? (
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
              <div className="text-3xl font-bold text-portfolio-blue">{unifiedInquiries.length}</div>
              <div className="text-sm text-gray-600">総お問い合わせ数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-red-600">
                {unifiedInquiries.filter(i => i.status === 'new').length}
              </div>
              <div className="text-sm text-gray-600">未対応</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-purple-600">
                {unifiedInquiries.filter(i => i.type === 'document_request').length}
              </div>
              <div className="text-sm text-gray-600">資料請求</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-blue-600">
                {unifiedInquiries.filter(i => i.type === 'contact').length}
              </div>
              <div className="text-sm text-gray-600">フォーム</div>
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
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Type filter */}
              <div className="relative">
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべての種別</option>
                  <option value="document">資料請求</option>
                  <option value="prompt">プロンプト</option>
                  <option value="service">サービスについて</option>
                  <option value="partnership">提携・協業</option>
                  <option value="recruit">採用関連</option>
                  <option value="other">その他</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>

              {/* Source filter */}
              <div className="relative">
                <select
                  value={sourceFilter}
                  onChange={(e) => setSourceFilter(e.target.value)}
                  className="appearance-none bg-white border border-gray-300 rounded-lg px-4 py-2 pr-10 text-gray-700 focus:outline-none focus:ring-2 focus:ring-portfolio-blue"
                >
                  <option value="all">すべての送信元</option>
                  <option value="form">フォーム</option>
                  <option value="document">資料請求</option>
                  <option value="prompt">プロンプト</option>
                </select>
                <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
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
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">送信元</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">問い合わせ種別</th>
                  <th className="text-left px-6 py-3 text-sm font-medium text-gray-700">メッセージ</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">ステータス</th>
                  <th className="text-center px-6 py-3 text-sm font-medium text-gray-700">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredInquiries.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredInquiries.map((inquiry) => (
                    <tr key={inquiry.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDistanceToNow(new Date(inquiry.created_at), { locale: ja, addSuffix: true })}</span>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                          {new Date(inquiry.created_at).toLocaleString('ja-JP')}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400" />
                            <span className="font-medium text-gray-900">{inquiry.name}</span>
                          </div>
                          {inquiry.company && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <Building className="h-3.5 w-3.5 text-gray-400" />
                              <span>{inquiry.company}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Mail className="h-3.5 w-3.5 text-gray-400" />
                            <a 
                              href={`mailto:${inquiry.email}`}
                              className="hover:text-portfolio-blue cursor-pointer"
                              onClick={(e) => {
                                e.preventDefault()
                                const subject = inquiry.type === 'document_request'
                                  ? `Re: 資料請求について - ${inquiry.document_title || ''}`
                                  : inquiry.type === 'prompt_request'
                                  ? `Re: プロンプトダウンロードについて - ${inquiry.project_title || ''}`
                                  : `Re: お問い合わせについて - ${inquiry.inquiry_type ? typeLabels[inquiry.inquiry_type as keyof typeof typeLabels] : ''}`
                                const body = `${inquiry.name} 様\n\nお問い合わせいただきありがとうございます。\n\n`
                                
                                // mailtoリンクを作成して直接クリック
                                const mailtoLink = document.createElement('a')
                                mailtoLink.href = `mailto:${inquiry.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                                
                                // 一時的にDOMに追加
                                document.body.appendChild(mailtoLink)
                                
                                // クリックイベントを発火
                                mailtoLink.click()
                                
                                // DOMから削除
                                document.body.removeChild(mailtoLink)
                              }}
                            >
                              {inquiry.email}
                            </a>
                          </div>
                          {inquiry.phone && (
                            <div className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-gray-400">📞</span>
                              <span>{inquiry.phone}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                          inquiry.type === 'document_request' 
                            ? 'bg-purple-100 text-purple-700' 
                            : inquiry.type === 'prompt_request'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}>
                          {inquiry.type === 'document_request' ? '資料請求' : 
                           inquiry.type === 'prompt_request' ? 'プロンプト' : 'フォーム'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {inquiry.type === 'document_request' || inquiry.type === 'prompt_request' ? (
                          <span className="text-gray-400">-</span>
                        ) : (
                          <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${
                            typeColors[inquiry.inquiry_type as keyof typeof typeColors] || 'bg-gray-100 text-gray-700'
                          }`}>
                            {typeLabels[inquiry.inquiry_type as keyof typeof typeLabels] || inquiry.inquiry_type}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm text-gray-600 line-clamp-2 max-w-xs">
                          {inquiry.message || '-'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${statusColors[inquiry.status]}`}>
                          {statusLabels[inquiry.status]}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleViewDetail(inquiry)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="詳細を見る"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          {inquiry.type === 'contact' && inquiry.status !== 'completed' && (
                            <UpdateContactStatusButton 
                              contactId={inquiry.id}
                              currentStatus={inquiry.status}
                            />
                          )}
                          {inquiry.type === 'contact' && (
                            <DeleteContactButton 
                              contactId={inquiry.id} 
                              contactName={inquiry.name}
                            />
                          )}
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
      {showDetailModal && (selectedContact || selectedDocRequest || selectedPromptRequest) && (
        <ContactDetailModal
          contact={selectedContact}
          documentRequest={selectedDocRequest}
          promptRequest={selectedPromptRequest}
          onClose={() => {
            setShowDetailModal(false)
            setSelectedContact(null)
            setSelectedDocRequest(null)
            setSelectedPromptRequest(null)
          }}
        />
      )}
    </div>
  )
}