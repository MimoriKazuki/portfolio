'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { createClient } from '@/app/lib/supabase/client'
import ComingSoonModal from '@/app/e-learning/ComingSoonModal'

interface ELearningReleaseContextType {
  isReleased: boolean
  isLoading: boolean
  showComingSoonModal: () => void
  handleELearningClick: (e: React.MouseEvent) => boolean // trueならナビゲーション許可
}

const ELearningReleaseContext = createContext<ELearningReleaseContextType | undefined>(undefined)

export function ELearningReleaseProvider({ children }: { children: ReactNode }) {
  const [isReleased, setIsReleased] = useState(true) // デフォルトはtrue（ローディング中はリンクを許可）
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    const fetchReleaseSetting = async () => {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('site_settings')
          .select('value')
          .eq('key', 'e_learning_released')
          .single()

        setIsReleased(data?.value === true)
      } catch (error) {
        console.error('Error fetching release setting:', error)
        setIsReleased(true) // エラー時はリリース済みとして扱う
      } finally {
        setIsLoading(false)
      }
    }

    fetchReleaseSetting()
  }, [])

  const showComingSoonModal = () => {
    setShowModal(true)
  }

  const handleELearningClick = (e: React.MouseEvent): boolean => {
    if (!isReleased && !isLoading) {
      e.preventDefault()
      setShowModal(true)
      return false
    }
    return true
  }

  return (
    <ELearningReleaseContext.Provider
      value={{
        isReleased,
        isLoading,
        showComingSoonModal,
        handleELearningClick,
      }}
    >
      {children}
      <ComingSoonModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </ELearningReleaseContext.Provider>
  )
}

export function useELearningRelease() {
  const context = useContext(ELearningReleaseContext)
  if (context === undefined) {
    throw new Error('useELearningRelease must be used within a ELearningReleaseProvider')
  }
  return context
}
