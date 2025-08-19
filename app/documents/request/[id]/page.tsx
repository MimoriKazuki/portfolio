'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/app/lib/supabase/client'
import { Document } from '@/app/types'
import { ChevronLeft, FileText, Loader2 } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function DocumentRequestPage({ params }: PageProps) {
  const router = useRouter()
  const [document, setDocument] = useState<Document | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [documentId, setDocumentId] = useState<string>('')
  const [formData, setFormData] = useState({
    company_name: '',
    name: '',
    email: '',
    phone: '',
    department: '',
    position: '',
    message: ''
  })
  const [emailError, setEmailError] = useState('')

  // メールアドレスのバリデーション
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // フォームが有効かチェック
  const isFormValid = formData.company_name.trim() !== '' && 
                      formData.name.trim() !== '' && 
                      formData.email.trim() !== '' &&
                      validateEmail(formData.email)

  useEffect(() => {
    async function loadDocument() {
      const { id } = await params
      setDocumentId(id)
      
      const supabase = createClient()
      const { data, error } = await supabase
        .from('documents')
        .select('*')
        .eq('id', id)
        .eq('is_active', true)
        .single()

      if (error || !data) {
        router.push('/documents')
        return
      }

      setDocument(data)
      setLoading(false)
    }

    loadDocument()
  }, [params, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })

    // メールアドレスの場合はバリデーション
    if (name === 'email') {
      if (value && !validateEmail(value)) {
        setEmailError('正しいメールアドレスを入力してください')
      } else {
        setEmailError('')
      }
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setSubmitting(true)

    const requestData = {
      document_id: documentId,
      ...formData
    }

    try {
      const response = await fetch('/api/document-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
      })

      if (response.ok) {
        router.push('/documents/request/complete')
      } else {
        alert('送信に失敗しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Error submitting request:', error)
      alert('送信に失敗しました。もう一度お試しください。')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <MainLayout hideRightSidebar={true} hideContactButton={true}>
        <div className="flex justify-center items-center min-h-[400px]">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      </MainLayout>
    )
  }

  if (!document) {
    return null
  }

  return (
    <MainLayout hideRightSidebar={true} hideContactButton={true}>
      <div className="w-full">
        <Link 
          href="/documents" 
          className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          資料一覧に戻る
        </Link>

        <div className="grid lg:grid-cols-2 gap-8">
          <div>
            <div className="bg-gray-100 rounded-lg p-6 mb-6">
              {document.thumbnail && (
                <div className="relative aspect-video mb-4 rounded-lg overflow-hidden">
                  <Image
                    src={document.thumbnail}
                    alt={document.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              
              <div>
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {document.title}
                </h2>
                {document.description && (
                  <p className="text-gray-600 text-sm">
                    {document.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  お客様情報
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label htmlFor="company_name" className="block text-sm font-medium text-gray-700 mb-1">
                      会社名 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="company_name"
                      name="company_name"
                      required
                      value={formData.company_name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                      placeholder="株式会社〇〇"
                    />
                  </div>

                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      お名前 <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                      placeholder="山田 太郎"
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      メールアドレス <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none transition-colors ${
                        emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-portfolio-blue'
                      }`}
                      placeholder="example@company.com"
                    />
                    {emailError && (
                      <p className="mt-1 text-sm text-red-600">{emailError}</p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      電話番号
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                      placeholder="090-1234-5678"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
                        部署
                      </label>
                      <input
                        type="text"
                        id="department"
                        name="department"
                        value={formData.department}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                        placeholder="営業部"
                      />
                    </div>

                    <div>
                      <label htmlFor="position" className="block text-sm font-medium text-gray-700 mb-1">
                        役職
                      </label>
                      <input
                        type="text"
                        id="position"
                        name="position"
                        value={formData.position}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                        placeholder="部長"
                      />
                    </div>
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                      ご要望・ご質問
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      rows={4}
                      value={formData.message}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors resize-none"
                      placeholder="資料に関するご要望やご質問がございましたらご記入ください"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting || !isFormValid}
                className="w-full text-white font-medium py-3 px-6 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:opacity-90"
                style={{ backgroundColor: 'rgb(37, 99, 235)' }}
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    送信中...
                  </>
                ) : (
                  '資料をダウンロードする'
                )}
              </button>

              <p className="text-xs text-gray-600 text-center">
                送信いただいた情報は、資料送付およびご連絡のためにのみ使用いたします。
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}