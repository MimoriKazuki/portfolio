import LoginForm from './LoginForm'
import Image from 'next/image'

export default function AdminLoginPage() {

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200 w-full max-w-md">
        <div className="flex items-center justify-center mb-8">
          <Image
            src="/AI_driven_logo_light.png"
            alt="AI駆動研究所"
            width={168}
            height={48}
            className="object-contain h-12 w-auto"
            style={{ height: '48px', width: 'auto' }}
            priority
          />
        </div>
        
        <h1 className="text-2xl font-bold text-center mb-8 text-gray-900">管理者ログイン</h1>
        
        <LoginForm />
      </div>
    </div>
  )
}