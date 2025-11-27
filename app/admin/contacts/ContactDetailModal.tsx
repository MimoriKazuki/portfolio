'use client'

import { X, Mail } from 'lucide-react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface Contact {
  id: string
  name: string
  company?: string
  email: string
  message: string
  inquiry_type: 'service' | 'partnership' | 'recruit' | 'other'
  service_type?: string
  created_at: string
  updated_at: string
}

// 研修タイプのラベルマッピング
const serviceTypeLabels: Record<string, string> = {
  'comprehensive-ai-training': '生成AI総合研修',
  'ai-writing-training': 'AIライティング研修',
  'ai-video-training': 'AI動画生成研修',
  'ai-coding-training': 'AIコーディング研修',
  'practical-ai-training': '生成AI実務活用研修',
  'ai-talent-development': 'AI人材育成所（個人向け）',
  'other-service': 'その他・未定',
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

interface ContactDetailModalProps {
  contact?: Contact | null
  documentRequest?: DocumentRequest | null
  promptRequest?: PromptRequest | null
  onClose: () => void
}

export default function ContactDetailModal({ contact, documentRequest, promptRequest, onClose }: ContactDetailModalProps) {
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

  const isDocumentRequest = !!documentRequest
  const isPromptRequest = !!promptRequest
  const data = promptRequest || documentRequest || contact
  if (!data) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {isPromptRequest ? 'プロンプト請求詳細' : isDocumentRequest ? '資料請求詳細' : 'お問い合わせ詳細'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto max-h-[calc(95vh-80px)]">
          <div className="space-y-6">
            {/* 基本情報 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">基本情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* 送信元 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">送信元</div>
                  <div className="font-medium">
                    <span className={`inline-flex px-3 py-1 rounded-full text-sm ${
                      isPromptRequest
                        ? 'bg-green-100 text-green-700'
                        : isDocumentRequest
                        ? 'bg-purple-100 text-purple-700'
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {isPromptRequest ? 'プロンプト' : isDocumentRequest ? '資料請求' : 'フォーム'}
                    </span>
                  </div>
                </div>
                
                {/* 問い合わせ種別 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">問い合わせ種別</div>
                  <div className="font-medium">
                    {contact ? (
                      <span className={`inline-flex px-3 py-1 rounded-full text-sm ${typeColors[contact.inquiry_type]}`}>
                        {typeLabels[contact.inquiry_type]}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </div>
                </div>

                {/* ご興味のある研修（サービスについての場合のみ） */}
                {contact && contact.inquiry_type === 'service' && contact.service_type && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">ご興味のある研修</div>
                    <div className="font-medium text-gray-900">
                      {serviceTypeLabels[contact.service_type] || contact.service_type}
                    </div>
                  </div>
                )}

                {/* 資料名/プロジェクト名 */}
                {(isDocumentRequest || isPromptRequest) && (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">
                      {isPromptRequest ? 'プロジェクト名' : '資料名'}
                    </div>
                    <div className="font-medium text-gray-900">
                      {isPromptRequest 
                        ? promptRequest?.metadata?.project_title || '-'
                        : documentRequest?.document?.title || '-'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* お客様情報 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">お客様情報</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* お名前 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">お名前</div>
                  <div className="font-medium text-gray-900">
                    {contact?.name || documentRequest?.name || promptRequest?.name || '-'}
                  </div>
                </div>
                
                {/* 会社名 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">会社名</div>
                  <div className="font-medium text-gray-900">
                    {contact?.company || documentRequest?.company_name || promptRequest?.company_name || '-'}
                  </div>
                </div>
                
                {/* メールアドレス */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">メールアドレス</div>
                  <div className="font-medium">
                    <a 
                      href={`mailto:${contact?.email || documentRequest?.email || promptRequest?.email}`}
                      className="text-portfolio-blue hover:underline"
                    >
                      {contact?.email || documentRequest?.email || promptRequest?.email || '-'}
                    </a>
                  </div>
                </div>
                
                {/* 電話番号 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">電話番号</div>
                  <div className="font-medium text-gray-900">
                    {documentRequest?.phone || promptRequest?.phone || '-'}
                  </div>
                </div>
                
                {/* 部署 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">部署</div>
                  <div className="font-medium text-gray-900">
                    {documentRequest?.department || promptRequest?.department || '-'}
                  </div>
                </div>
                
                {/* 役職 */}
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">役職</div>
                  <div className="font-medium text-gray-900">
                    {documentRequest?.position || promptRequest?.position || '-'}
                  </div>
                </div>
              </div>
            </div>

            {/* お問い合わせ内容と受信情報を横並びに */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* 左側 - お問い合わせ内容 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {isDocumentRequest || isPromptRequest ? 'ご要望・ご質問' : 'お問い合わせ内容'}
                </h3>
                <div className="bg-white rounded-lg p-6 border border-gray-200 min-h-[200px]">
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {contact?.message || documentRequest?.message || promptRequest?.message || '-'}
                  </p>
                </div>
              </div>
              
              {/* 右側 - 受信情報 */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">受信情報</h3>
                <div className="space-y-4">
                  {/* 受信日時 */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">受信日時</div>
                    <div className="font-medium text-gray-900">
                      {format(
                        new Date(contact?.created_at || documentRequest?.created_at || promptRequest?.created_at || ''), 
                        'yyyy年MM月dd日 HH:mm', 
                        { locale: ja }
                      )}
                    </div>
                  </div>
                  
                  {/* 最終更新日時 */}
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">最終更新日時</div>
                    <div className="font-medium text-gray-900">
                      {(contact && contact.updated_at !== contact.created_at) ? (
                        format(new Date(contact.updated_at), 'yyyy年MM月dd日 HH:mm', { locale: ja })
                      ) : (
                        '-'
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  const email = contact?.email || documentRequest?.email || promptRequest?.email || ''
                  const subject = isPromptRequest
                    ? `Re: プロンプト請求について - ${promptRequest?.metadata?.project_title || ''}`
                    : isDocumentRequest 
                    ? `Re: 資料請求について - ${documentRequest?.document?.title || ''}` 
                    : `Re: お問い合わせについて - ${contact?.inquiry_type ? typeLabels[contact.inquiry_type] : ''}`
                  const body = `${contact?.name || documentRequest?.name || promptRequest?.name} 様\n\nお問い合わせいただきありがとうございます。\n\n`
                  
                  // mailtoリンクを作成して直接クリック
                  const mailtoLink = document.createElement('a')
                  mailtoLink.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
                  
                  // 一時的にDOMに追加
                  document.body.appendChild(mailtoLink)
                  
                  // クリックイベントを発火
                  mailtoLink.click()
                  
                  // DOMから削除
                  document.body.removeChild(mailtoLink)
                }}
                className="flex-1 flex items-center justify-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Mail className="h-5 w-5" />
                メールで返信
              </button>
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