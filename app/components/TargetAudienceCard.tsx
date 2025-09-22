import { LucideIcon } from 'lucide-react'

interface TargetAudienceCardProps {
  name: string
  subtitle: string
  description: string
  rating: number
  icon: LucideIcon
}

export default function TargetAudienceCard({ 
  name, 
  subtitle, 
  description, 
  rating, 
  icon: Icon 
}: TargetAudienceCardProps) {
  return (
    <div className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-300 border border-gray-200 relative">
      {/* Rating in top-right */}
      <div className="absolute top-6 right-6 text-center">
        <p className="text-xs text-gray-500 mb-1">おすすめ度</p>
        <div className="flex justify-center gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`h-3 w-3 ${
                i < rating ? 'text-yellow-400' : 'text-gray-300'
              }`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-4 pr-16">
        <div className="h-12 w-12 flex-shrink-0 bg-portfolio-blue/10 rounded-full flex items-center justify-center">
          <Icon className="h-6 w-6 text-portfolio-blue" />
        </div>
        <div className="flex-1">
          <h4 className="text-lg font-semibold text-gray-900 mb-1">{name}</h4>
          <p className="text-sm text-gray-600 mb-3">{subtitle}</p>
          <p className="text-gray-700 text-sm leading-relaxed">{description}</p>
        </div>
      </div>
    </div>
  )
}