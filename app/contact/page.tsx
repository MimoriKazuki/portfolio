'use client'

import { useState, useCallback, useEffect, Suspense } from 'react'
import Link from 'next/link'
import MainLayout from '@/app/components/MainLayout'
import { trackContactFormSubmit } from '@/app/components/GoogleAnalyticsEvent'
import { useRouter, useSearchParams } from 'next/navigation'
import CustomSelect from '@/app/components/ui/CustomSelect'

function ContactForm() {
  const [isVisible, setIsVisible] = useState(false)
  const searchParams = useSearchParams()

  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: '',
    inquiry_type: 'service' as 'service' | 'partnership' | 'recruit' | 'other',
    service_type: '' as string
  })

  // URLパラメータからサービスタイプを取得して事前選択
  useEffect(() => {
    const serviceParam = searchParams.get('service')
    if (serviceParam) {
      setFormData(prev => ({
        ...prev,
        inquiry_type: 'service',
        service_type: serviceParam
      }))
    }
  }, [searchParams])

  useEffect(() => {
    setIsVisible(true)
  }, [])

  // 研修サービスの選択肢
  const serviceOptions = [
    { value: '', label: '選択してください' },
    // 企業向けサービス
    { value: 'comprehensive-ai-training', label: '【企業向け】生成AI総合研修' },
    { value: 'ai-coding-training', label: '【企業向け】AIコーディング研修' },
    { value: 'ai-organization-os', label: '【企業向け】AI組織OS研修' },
    { value: 'ai-video-training', label: '【企業向け】AI動画生成研修' },
    // 個人向けサービス
    { value: 'ai-talent-development', label: '【個人向け】AI駆動開発育成所' },
  ]
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')
  const [emailError, setEmailError] = useState('')

  // メールアドレスのバリデーション
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // フォームが有効かチェック
  const isFormValid = formData.name.trim() !== '' && 
                      formData.email.trim() !== '' && 
                      formData.message.trim() !== '' &&
                      validateEmail(formData.email)

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage('')
    
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        // Google Analyticsにイベントを送信
        trackContactFormSubmit('general_inquiry')

        // Thanksページに遷移
        router.push('/thanks?type=contact')
      } else {
        setSubmitMessage(result.error || 'エラーが発生しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitMessage('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData, router])

  return (
    <MainLayout hideRightSidebar={true}>
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
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">CONTACT</h1>
          <p className="text-lg text-gray-500">お問い合わせ</p>
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
          {/* Left Column - Description */}
          <div className="lg:col-span-4">
            <p className="text-gray-600 leading-loose mb-8">
              AI研修・コンサルティングに関するご質問やご相談など、お気軽にお問い合わせください。
            </p>
            <p className="text-gray-600 leading-loose">
              担当者より2営業日以内にご連絡いたします。
            </p>
          </div>

          {/* Right Column - Form */}
          <div className="lg:col-span-6">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div>
                <label htmlFor="company" className="block text-sm font-medium text-gray-900 mb-2">
                  会社名
                </label>
                <input
                  type="text"
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={(e) => setFormData({ ...formData, company: e.target.value })}
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
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors placeholder:text-gray-400"
                  placeholder="山田 太郎"
                  required
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-900 mb-2">
                  メールアドレス <span className="text-blue-600">*</span>
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData({ ...formData, email: value })
                    if (value && !validateEmail(value)) {
                      setEmailError('正しいメールアドレスを入力してください')
                    } else {
                      setEmailError('')
                    }
                  }}
                  className={`w-full px-0 py-3 bg-transparent border-0 border-b text-gray-900 focus:outline-none transition-colors placeholder:text-gray-400 ${
                    emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-blue-600'
                  }`}
                  placeholder="example@company.com"
                  required
                />
                {emailError && (
                  <p className="mt-2 text-sm text-red-600">{emailError}</p>
                )}
              </div>

              <div>
                <label htmlFor="inquiry_type" className="block text-sm font-medium text-gray-900 mb-2">
                  お問い合わせ種別 <span className="text-blue-600">*</span>
                </label>
                <CustomSelect
                  id="inquiry_type"
                  name="inquiry_type"
                  value={formData.inquiry_type}
                  onChange={(value) => setFormData({ ...formData, inquiry_type: value as any, service_type: '' })}
                  options={[
                    { value: 'service', label: 'サービスについて' },
                    { value: 'partnership', label: '提携・協業' },
                    { value: 'recruit', label: '採用関連' },
                    { value: 'other', label: 'その他' },
                  ]}
                  required
                />
              </div>

              {/* サービス選択時の研修タイプ選択 */}
              {formData.inquiry_type === 'service' && (
                <div>
                  <label htmlFor="service_type" className="block text-sm font-medium text-gray-900 mb-2">
                    ご興味のある研修
                  </label>
                  <CustomSelect
                    id="service_type"
                    name="service_type"
                    value={formData.service_type}
                    onChange={(value) => setFormData({ ...formData, service_type: value })}
                    options={serviceOptions}
                  />
                </div>
              )}

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-900 mb-2">
                  お問い合わせ内容 <span className="text-blue-600">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-0 py-3 bg-transparent border-0 border-b border-gray-300 text-gray-900 focus:outline-none focus:border-blue-600 transition-colors resize-none placeholder:text-gray-400"
                  placeholder="プロジェクトの詳細、ご要望などをお聞かせください。"
                  rows={4}
                  required
                />
              </div>

              {submitMessage && (
                <div className={`${
                  submitMessage.includes('エラー')
                    ? 'bg-red-50 border-red-200 text-red-700'
                    : 'bg-green-50 border-green-200 text-green-700'
                } border p-4 text-center text-sm`}>
                  {submitMessage}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isSubmitting || !isFormValid}
                  className="inline-flex items-center justify-center gap-2 px-12 py-4 bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      送信中...
                    </>
                  ) : (
                    '送信する'
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

export default function ContactPage() {
  return (
    <Suspense fallback={<div className="min-h-screen" />}>
      <ContactForm />
    </Suspense>
  )
}