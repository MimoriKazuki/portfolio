'use client'

import { useState, useCallback } from 'react'
import MainLayout from '@/app/components/MainLayout'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: ''
  })
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
        setSubmitMessage('お問い合わせありがとうございます。内容を確認次第、ご連絡させていただきます。')
        setFormData({ name: '', company: '', email: '', message: '' })
      } else {
        setSubmitMessage(result.error || 'エラーが発生しました。もう一度お試しください。')
      }
    } catch (error) {
      console.error('Form submission error:', error)
      setSubmitMessage('通信エラーが発生しました。もう一度お試しください。')
    } finally {
      setIsSubmitting(false)
    }
  }, [formData])

  return (
    <MainLayout hideRightSidebar={true}>
      <div className="w-full max-w-4xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-2xl sm:text-3xl font-bold mb-4 text-gray-900">お問い合わせ</h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">
            システム開発のご相談・お見積りなど、お気軽にお問い合わせください。
            プロジェクトの規模やスケジュールに関わらず、まずはお話をお聞かせください。
          </p>
        </div>
        
        <div className="grid lg:grid-cols-1 gap-8 max-w-2xl mx-auto">
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-6">お問い合わせフォーム</h3>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    お名前 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                    placeholder="山田 太郎"
                    required
                  />
                </div>
                
                <div>
                  <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
                    会社名
                  </label>
                  <input
                    type="text"
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors"
                    placeholder="株式会社〇〇"
                  />
                </div>
              </div>
            
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  メールアドレス <span className="text-red-500">*</span>
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
                  className={`w-full px-4 py-2 bg-white border rounded-lg text-gray-900 focus:outline-none transition-colors ${
                    emailError ? 'border-red-500 focus:border-red-500' : 'border-gray-300 focus:border-portfolio-blue'
                  }`}
                  placeholder="example@company.com"
                  required
                />
                {emailError && (
                  <p className="mt-1 text-sm text-red-600">{emailError}</p>
                )}
              </div>
            
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  お問い合わせ内容 <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-900 focus:outline-none focus:border-portfolio-blue transition-colors resize-none"
                  placeholder="プロジェクトの詳細、ご要望などをお聞かせください。"
                  rows={6}
                  required
                />
              </div>
            
              {submitMessage && (
                <div className={`${
                  submitMessage.includes('エラー') 
                    ? 'bg-red-50 border-red-200 text-red-700' 
                    : 'bg-green-50 border-green-200 text-green-700'
                } border rounded-lg p-4 text-center`}>
                  {submitMessage}
                </div>
              )}
            
              <button
                type="submit"
                disabled={isSubmitting || !isFormValid}
                className="w-full text-white font-medium py-3 px-6 rounded-lg transition-opacity hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                style={{ backgroundColor: 'rgb(37, 99, 235)' }}
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

              <p className="text-xs text-gray-600 text-center">
                お送りいただいた内容は、お問い合わせへの回答のためにのみ使用いたします。
              </p>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}