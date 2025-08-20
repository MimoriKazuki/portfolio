'use client'

import { X, Mail, User, Building, Calendar, MessageSquare, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

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

interface ContactDetailModalProps {
  contact: Contact
  onClose: () => void
}

export default function ContactDetailModal({ contact, onClose }: ContactDetailModalProps) {
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

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">お問い合わせ詳細</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          <div className="space-y-6">
            {/* Status and Type */}
            <div className="flex items-center gap-4">
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${statusColors[contact.status]}`}>
                {statusLabels[contact.status]}
              </span>
              <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${typeColors[contact.inquiry_type]}`}>
                {typeLabels[contact.inquiry_type]}
              </span>
            </div>

            {/* Customer Info */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">お客様情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <User className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">お名前</div>
                    <div className="font-medium text-gray-900">{contact.name}</div>
                  </div>
                </div>
                {contact.company && (
                  <div className="flex items-start gap-3">
                    <Building className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">会社名</div>
                      <div className="font-medium text-gray-900">{contact.company}</div>
                    </div>
                  </div>
                )}
                <div className="flex items-start gap-3">
                  <Mail className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">メールアドレス</div>
                    <a 
                      href={`mailto:${contact.email}`}
                      className="font-medium text-portfolio-blue hover:underline"
                    >
                      {contact.email}
                    </a>
                  </div>
                </div>
              </div>
            </div>

            {/* Message */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">メッセージ</h3>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-700 whitespace-pre-wrap">{contact.message}</p>
              </div>
            </div>

            {/* Timestamps */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900">受信情報</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                  <div>
                    <div className="text-sm text-gray-600">受信日時</div>
                    <div className="font-medium text-gray-900">
                      {format(new Date(contact.created_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                    </div>
                  </div>
                </div>
                {contact.updated_at !== contact.created_at && (
                  <div className="flex items-start gap-3">
                    <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
                    <div>
                      <div className="text-sm text-gray-600">最終更新日時</div>
                      <div className="font-medium text-gray-900">
                        {format(new Date(contact.updated_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <a
                href={`mailto:${contact.email}`}
                className="flex-1 flex items-center justify-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5" />
                メールで返信
              </a>
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
              >
                閉じる
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}