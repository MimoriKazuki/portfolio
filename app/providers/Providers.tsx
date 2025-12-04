'use client'

import { ReactNode } from 'react'
import { ELearningReleaseProvider } from '@/app/contexts/ELearningReleaseContext'

interface ProvidersProps {
  children: ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <ELearningReleaseProvider>
      {children}
    </ELearningReleaseProvider>
  )
}
