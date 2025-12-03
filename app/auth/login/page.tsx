import { Metadata } from 'next'
import GoogleLoginButton from './GoogleLoginButton'
import Link from 'next/link'
import Image from 'next/image'

export const metadata: Metadata = {
  title: 'ログイン | eラーニング - AI駆動研究所',
  description: 'eラーニングコンテンツを視聴するにはGoogleアカウントでログインしてください。',
}

export default function AuthLoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <Link href="/">
            <Image
              src="/images/brand/AI_driven_logo_light.png"
              alt="AI駆動研究所"
              width={200}
              height={60}
              className="object-contain"
              priority
            />
          </Link>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold text-gray-900">
          eラーニングにログイン
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          動画コンテンツを視聴するにはログインが必要です
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-lg sm:rounded-lg sm:px-10">
          <div className="space-y-6">
            <GoogleLoginButton />

            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/"
                className="text-sm text-portfolio-blue hover:text-portfolio-blue-dark"
              >
                トップページに戻る
              </Link>
            </div>
          </div>

          <div className="mt-6">
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-2">ログインについて</h3>
              <ul className="text-xs text-gray-600 space-y-1">
                <li>• Googleアカウントで簡単にログインできます</li>
                <li>• 無料コンテンツはログイン後すぐに視聴可能です</li>
                <li>• 有料コンテンツは購入後に視聴できます</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
