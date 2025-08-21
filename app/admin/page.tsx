'use client'

import dynamic from 'next/dynamic'
import { Loader2 } from 'lucide-react'

const GoogleAnalyticsDashboard = dynamic(
  () => import('./GoogleAnalyticsDashboard'),
  { 
    loading: () => (
      <div className="w-full h-96 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    ),
    ssr: false 
  }
)

export default function AdminDashboard() {
  return <GoogleAnalyticsDashboard />
}