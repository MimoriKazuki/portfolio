import { Lock } from 'lucide-react'
import LoginForm from './LoginForm'

export default function AdminLoginPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-portfolio-blue rounded-lg flex items-center justify-center">
            <Lock className="h-7 w-7 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">管理者ログイン</h1>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-sm text-gray-600">
          <a href="/" className="hover:text-portfolio-blue transition-colors">
            ← ポートフォリオに戻る
          </a>
        </div>
      </div>
    </div>
  )
}