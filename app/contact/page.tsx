'use client'

import { useState, useCallback } from 'react'
import MainLayout from '@/app/components/MainLayout'
import { Send, Mail, User, Building, MessageSquare } from 'lucide-react'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    email: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState('')

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
    <MainLayout>
      <div className="min-h-screen py-4 sm:py-6 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h1 className="text-4xl font-bold mb-4">お問い合わせ</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              システム開発のご相談・お見積りなど、お気軽にお問い合わせください。
              プロジェクトの規模やスケジュールに関わらず、まずはお話をお聞かせください。
            </p>
          </div>
          
          <div className="bg-youtube-gray rounded-xl p-8 shadow-2xl max-w-3xl mx-auto">
          
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-3">
                  お名前 <span className="text-blue-400">*</span>
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="山田 太郎"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-3">
                  会社名
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    className="w-full pl-10 pr-3 py-3 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="株式会社〇〇"
                  />
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3">
                メールアドレス <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="example@company.com"
                  required
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-3">
                お問い合わせ内容 <span className="text-blue-400">*</span>
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full pl-10 pr-3 py-3 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                  placeholder="プロジェクトの詳細、ご要望などをお聞かせください。例：サイトのリニューアル、新規アプリ開発、ECサイト構築など"
                  rows={6}
                  required
                />
              </div>
            </div>
            
            {submitMessage && (
              <div className={`${
                submitMessage.includes('エラー') 
                  ? 'bg-red-900/20 border-red-500/30 text-red-400' 
                  : 'bg-green-900/20 border-green-500/30 text-green-400'
              } border rounded-lg p-4 text-center`}>
                <div className="flex items-center justify-center gap-2">
                  <div className={`w-2 h-2 ${
                    submitMessage.includes('エラー') ? 'bg-red-400' : 'bg-green-400'
                  } rounded-full animate-pulse`}></div>
                  {submitMessage}
                </div>
              </div>
            )}
            
            <div className="text-center">
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 shadow-lg"
              >
                <Send className="h-5 w-5" />
                {isSubmitting ? '送信中...' : '送信する'}
              </button>
            </div>
          </form>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}