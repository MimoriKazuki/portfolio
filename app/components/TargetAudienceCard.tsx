'use client'

interface TargetAudienceCardProps {
  image: string
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
  image,
  text,
  theme = 'blue'
}: TargetAudienceCardProps) {
  const themeColors = {
    blue: {
      highlight: 'text-blue-600 font-bold',
    },
    green: {
      highlight: 'text-emerald-600 font-bold',
    }
  }
  const colors = themeColors[theme]

  return (
    <div className="flex items-center gap-5 p-5 bg-white border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
      {/* Image */}
      <div className="w-28 h-28 flex-shrink-0 overflow-hidden bg-gray-100">
        <img
          src={image}
          alt=""
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <p className="text-sm md:text-base text-gray-800 leading-relaxed flex-1">
        {parseHighlightedText(text, colors.highlight)}
      </p>
    </div>
  )
}
