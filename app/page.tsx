import MainLayout from './components/MainLayout'
import HomeContent from './components/HomeContent'
import { Suspense } from 'react'

// 静的生成を最適化 - ISRを無効化して完全静的にする
export const revalidate = false

export default function HomePage() {
  return (
    <MainLayout hideRightSidebar={true}>
      <Suspense fallback={<div>Loading...</div>}>
        <HomeContent />
      </Suspense>
    </MainLayout>
  )
}