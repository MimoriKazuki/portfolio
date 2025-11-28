'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Document } from '@/app/types'
import { Loader2 } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'

interface DocumentRequestClientProps {
  documentId: string
  initialDocument: Document | null
}

export default function DocumentRequestClient({ documentId, initialDocument }: DocumentRequestClientProps) {
  const router = useRouter()
  const [isVisible, setIsVisible] = useState(false)
  const [documentData, setDocumentData] = useState<Document | null>(initialDocument)
  const [submitting, setSubmitting] = useState(false)
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

  useEffect(() => {
    setIsVisible(true)
  }, [])

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
        const result = await response.json()

        // PDFのダウンロードURLがある場合は自動ダウンロード
        if (result.downloadUrl) {
          // PDFファイルを直接ダウンロード
          try {
            const response = await fetch(result.downloadUrl)
            const blob = await response.blob()
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement('a')
            link.href = url
            link.download = `${documentData?.title || 'document'}.pdf`
            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)
            window.URL.revokeObjectURL(url)
          } catch (error) {
            console.error('Download failed:', error)
            // フォールバック: 新しいウィンドウで開く
            window.open(result.downloadUrl, '_blank')
          }
        }

        // Thanksページに遷移
        router.push('/thanks?type=document')
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

  if (!documentData) {
    return (
      <MainLayout hideRightSidebar={true} hideContactButton={true}>
        <div className="flex justify-center items-center min-h-[400px]">
          <p className="text-gray-500">資料が見つかりません</p>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout hideRightSidebar={true} hideContactButton={true}>
      <div className="w-full pt-8">
        {/* Header */}
        <div
          className="mb-12"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
          }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">DOWNLOAD</h1>
          <p className="text-lg text-gray-500">資料ダウンロード</p>
        </div>

        {/* Two Column Layout */}
        <div
          className="grid grid-cols-1 lg:grid-cols-10 gap-12 lg:gap-16"
          style={{
            opacity: isVisible ? 1 : 0,
            transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.6s ease-out 0.1s, transform 0.6s ease-out 0.1s',
          }}
        >
          {/* Left Column - Document Info */}
          <div className="lg:col-span-4">
            {documentData.thumbnail && (
              <div className="relative aspect-video mb-6 rounded-lg overflow-hidden">
                <Image
                  src={documentData.thumbnail}
                  alt={documentData.title}
                  fill
                  className="object-cover"
                />
              </div>
            )}
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              {documentData.title}
            </h2>
            {documentData.description && (
              <p className="text-gray-600 leading-loose mb-8">
                {documentData.description}
              </p>
            )}
            <p className="text-gray-600 leading-loose">
              フォームに必要事項をご入力いただくと、資料をダウンロードいただけます。
            </p>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="company_name" className="block text-sm font-medium text-gray-900 mb-2">
                    会社名 <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="company_name"
                    name="company_name"
                    required
                    value={formData.company_name}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400"
                    placeholder="株式会社〇〇"
                  />
                </div>

                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-900 mb-2">
                    お名前 <span className="text-blue-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400"
                    placeholder="山田 太郎"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  メールアドレス <span className="text-blue-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full px-0 py-3 bg-transparent border-0 border-b text-gray-900 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="example@company.com"
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-900 mb-2">
                  電話番号
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400"
                  placeholder="090-1234-5678"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="department" className="block text-sm font-medium text-gray-900 mb-2">
                    部署
                  </label>
                  <input
                    type="text"
                    id="department"
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400"
                    placeholder="営業部"
                  />
                </div>

                <div>
                  <label htmlFor="position" className="block text-sm font-medium text-gray-900 mb-2">
                    役職
                  </label>
                  <input
                    type="text"
                    id="position"
                    name="position"
                    value={formData.position}
                    onChange={handleInputChange}
                    className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400"
                    placeholder="部長"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  ご要望・ご質問
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={4}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors resize-none placeholder:text-gray-400"
                  placeholder="資料に関するご要望やご質問がございましたらご記入ください"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={submitting || !isFormValid}
                  className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
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

                <p className="text-sm text-gray-500 mt-6">
                  送信することで、
                  <Link href="/privacy" className="text-blue-600 hover:underline">
                    プライバシーポリシー
                  </Link>
                  に同意したものとします。
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
