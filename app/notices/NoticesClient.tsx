'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import { Bell, ChevronRight } from 'lucide-react'
import type { Notice } from '@/app/types'

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'news', label: 'ニュース' },
  { id: 'webinar', label: 'ウェビナー' },
  { id: 'event', label: 'イベント' },
  { id: 'maintenance', label: 'メンテナンス' },
  { id: 'other', label: 'その他' },
]

interface NoticesClientProps {
  notices: Notice[]
}

export default function NoticesClient({ notices }: NoticesClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const categoryLabels = {
    news: 'ニュース',
    webinar: 'ウェビナー',
    event: 'イベント',
    maintenance: 'メンテナンス',
    other: 'その他'
  }

  // カテゴリごとのお知らせ数を計算
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach(category => {
      if (category.id === 'all') {
        counts[category.id] = notices.length
      } else {
        counts[category.id] = notices.filter(n => n.category === category.id).length
      }
    })
    return counts
  }, [notices])

  // コンテンツがあるカテゴリのみをフィルタリング
  const visibleCategories = useMemo(() => {
    return categories.filter(category => 
      category.id === 'all' || categoryCounts[category.id] > 0
    )
  }, [categoryCounts])

  // フィルタリングをメモ化
  const filteredNotices = useMemo(() => {
    return activeCategory === 'all' 
      ? notices 
      : notices.filter(notice => notice.category === activeCategory)
  }, [activeCategory, notices])

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = (date.getMonth() + 1).toString().padStart(2, '0')
    const day = date.getDate().toString().padStart(2, '0')
    return `${year}.${month}.${day}`
  }

  return (
    <div className="w-full pt-8 max-mid:pt-0">
      <div
        className="mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">NEWS</h1>
        <p className="text-lg text-gray-500">お知らせ</p>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 relative">
        <div className="absolute inset-x-0 -mx-4 sm:-mx-6 lg:static lg:mx-0">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex px-4 sm:px-6 lg:px-0 border-b border-gray-200">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-4 py-3 text-sm font-medium transition-colors whitespace-nowrap relative ${
                    activeCategory === category.id
                      ? 'text-gray-900'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {category.label}
                  {activeCategory === category.id && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gray-900"></span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* スペーサー */}
        <div className="h-12 lg:hidden" />
      </div>

      {/* Notices List */}
      {filteredNotices.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <Bell className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">
            {activeCategory === 'all' 
              ? 'お知らせはありません' 
              : `${categoryLabels[activeCategory as keyof typeof categoryLabels]}のお知らせはありません`}
          </p>
        </div>
      ) : (
        <div className="divide-y divide-gray-200">
          {filteredNotices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notices/${notice.id}`}
              className="block group"
            >
              <div className="py-6 hover:bg-gray-50 transition-colors duration-200">
                <div className="grid grid-cols-[1fr_auto] items-center gap-4 px-2">
                  {/* Content Area */}
                  <div className="flex flex-col sm:flex-row sm:items-center xl:flex-col xl:items-start wide:flex-row wide:items-center gap-2 sm:gap-4 xl:gap-2 wide:gap-4 min-w-0">
                    {/* Date + Category row */}
                    <div className="flex items-center gap-4">
                      {/* Date */}
                      <div className="text-sm text-gray-600 font-medium flex-shrink-0">
                        {formatDate(notice.created_at)}
                      </div>

                      {/* Category */}
                      <div className="flex-shrink-0">
                        <span className={`inline-flex px-3 py-1 text-xs font-medium border ${
                          notice.category === 'news' ? 'border-blue-200 text-blue-700' :
                          notice.category === 'webinar' ? 'border-purple-200 text-purple-700' :
                          notice.category === 'event' ? 'border-pink-200 text-pink-700' :
                          notice.category === 'maintenance' ? 'border-yellow-200 text-yellow-700' :
                          'border-gray-200 text-gray-700'
                          }`}>
                            {categoryLabels[notice.category]}
                          </span>
                      </div>
                    </div>

                    {/* Title */}
                    <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-1">
                      {notice.title}
                    </h3>
                  </div>

                  {/* Arrow Icon - always right aligned and vertically centered */}
                  <div className="flex-shrink-0">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}