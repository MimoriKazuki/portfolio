import Link from 'next/link'
import { CheckCircle2 } from 'lucide-react'
import MainLayout from '@/app/components/MainLayout'

export default function DocumentRequestCompletePage() {
  return (
    <MainLayout>
      <div className="w-full max-w-2xl mx-auto text-center py-12">
        <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-6" />
        
        <h1 className="text-3xl font-bold text-white mb-4">
          資料請求を受け付けました
        </h1>
        
        <p className="text-gray-400 mb-8">
          ご記入いただいたメールアドレス宛に、資料をお送りいたします。<br />
          通常1〜2営業日以内にお送りしておりますので、しばらくお待ちください。
        </p>
        
        <div className="space-y-4">
          <Link
            href="/documents"
            className="inline-block bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors"
          >
            他の資料を見る
          </Link>
          
          <div>
            <Link
              href="/"
              className="text-gray-400 hover:text-white transition-colors"
            >
              ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}