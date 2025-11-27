'use client'

import { Check } from 'lucide-react'

interface TargetAudienceCardProps {
  image?: string // 後方互換性のため残す（使用しない）
  text: string
  theme?: 'blue' | 'green'
}

// Parse text with {highlighted} parts
function parseHighlightedText(text: string, highlightClass: string) {
  const parts = text.split(/(\{[^}]+\})/)
  return parts.map((part, index) => {
    if (part.startsWith('{') && part.endsWith('}')) {
      const content = part.slice(1, -1)
      return (
        <span key={index} className={highlightClass}>
          {content}
        </span>
      )
    }
    return <span key={index}>{part}</span>
  })
}

export default function TargetAudienceCard({
  text,
  theme = 'blue'
}: TargetAudienceCardProps) {
  const themeColors = {
    blue: {
      highlight: 'text-blue-600 font-bold',
      iconBg: 'bg-blue-500',
    },
    green: {
      highlight: 'text-emerald-600 font-bold',
      iconBg: 'bg-emerald-500',
    }
  }
  const colors = themeColors[theme]

  return (
    <div className="flex items-start gap-4 py-6">
      {/* Checkmark Icon - Filled circle with white check */}
      <div className={`flex-shrink-0 w-7 h-7 rounded-full ${colors.iconBg} flex items-center justify-center`}>
        <Check className="w-4 h-4 text-white" strokeWidth={3} />
      </div>

      {/* Text */}
      <p className="text-base md:text-lg text-gray-800 font-medium leading-relaxed flex-1 pt-0.5">
        {parseHighlightedText(text, colors.highlight)}
      </p>
    </div>
  )
}
