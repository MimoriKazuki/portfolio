'use client'

import Image from 'next/image'
import { ExternalLink } from 'lucide-react'

export default function AnalyticsButtons() {
  const clarityUrl = 'https://clarity.microsoft.com/projects/view/t7b2215g90/dashboard?date=Last%203%20days&URL=2%3B6%3B%5Ehttps%3A%2F%2Fwww%5C.landbridge%5C.ai%2F(%5C%3F.*)%3F%24'
  const gaUrl = 'https://analytics.google.com/analytics/web/?authuser=1#/a365674072p501740063/reports/intelligenthome'

  return (
    <div className="flex items-center gap-3">
      {/* Microsoft Clarity Button */}
      <a
        href={clarityUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-blue-500 text-blue-600 text-sm font-medium rounded-lg hover:bg-blue-50 hover:border-blue-600 transition-all duration-200 shadow-sm"
        title="Microsoft Clarity ダッシュボード"
      >
        <Image
          src="/Clarity_logo.png"
          alt="Microsoft Clarity"
          width={16}
          height={16}
          className="h-4 w-4"
        />
        <span className="hidden sm:inline">Clarity</span>
        <ExternalLink className="h-4 w-4 text-blue-400 ml-1" />
      </a>

      {/* Google Analytics Button */}
      <a
        href={gaUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 px-3 py-2 bg-white border-2 border-orange-500 text-orange-600 text-sm font-medium rounded-lg hover:bg-orange-50 hover:border-orange-600 transition-all duration-200 shadow-sm"
        title="Google Analytics ダッシュボード"
      >
        <Image
          src="/GoogleAnalytics_logo.png"
          alt="Google Analytics"
          width={16}
          height={16}
          className="h-4 w-4"
        />
        <span className="hidden sm:inline">Analytics</span>
        <ExternalLink className="h-4 w-4 text-orange-400 ml-1" />
      </a>
    </div>
  )
}