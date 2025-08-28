'use client'

import dynamic from 'next/dynamic'

const AudioPlayer = dynamic(() => import('./AudioPlayer'), {
  ssr: false
})

interface AudioPlayerWrapperProps {
  audioUrl: string
}

export default function AudioPlayerWrapper({ audioUrl }: AudioPlayerWrapperProps) {
  return <AudioPlayer audioUrl={audioUrl} />
}