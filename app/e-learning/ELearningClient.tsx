'use client'

import { useState, useEffect } from 'react'
import { ELearningContent } from '@/app/types'
import ELearningCard from './ELearningCard'
import LoginPromptModal from './LoginPromptModal'

interface ELearningClientProps {
  contents: ELearningContent[]
  isLoggedIn: boolean
}

export default function ELearningClient({ contents, isLoggedIn }: ELearningClientProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [showLoginModal, setShowLoginModal] = useState(false)

  useEffect(() => {
    setIsVisible(true)
    // 未ログイン時はモーダルを自動表示
    if (!isLoggedIn) {
      setShowLoginModal(true)
    }
  }, [isLoggedIn])

  const handleCardClick = (contentId: string) => {
    if (!isLoggedIn) {
      setShowLoginModal(true)
      return false
    }
    return true
  }

  return (
    <div className="w-full pt-8 max-mid:pt-0 min-h-screen">
      <div
        className="mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">Learning Videos</h1>
        <p className="text-lg text-gray-500">eラーニング</p>
      </div>

      {/* カードコンテナ */}
      {contents.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-lg sm:text-xl text-gray-500">コンテンツは準備中です</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {contents.map((content) => (
            <div key={content.id}>
              <ELearningCard
                content={content}
                onCardClick={handleCardClick}
                isLoggedIn={isLoggedIn}
              />
            </div>
          ))}
        </div>
      )}

      {/* ログインモーダル */}
      <LoginPromptModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />
    </div>
  )
}
