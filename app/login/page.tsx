import { Lock } from 'lucide-react'
import LoginForm from './LoginForm'

export default function AdminLoginPage() {

  return (
    <div className="min-h-screen bg-youtube-dark flex items-center justify-center">
      <div className="bg-youtube-gray p-8 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <Lock className="h-7 w-7 text-white" />
          </div>
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-8">管理者ログイン</h1>
        
        <LoginForm />
        
        <div className="mt-6 text-center text-sm text-muted-foreground">
          <a href="/" className="hover:text-white transition-colors">
            ← ポートフォリオに戻る
          </a>
        </div>
      </div>
    </div>
  )
}