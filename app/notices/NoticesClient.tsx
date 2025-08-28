'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Bell, Calendar, ChevronRight } from 'lucide-react'
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

  const categoryColors = {
    news: 'bg-blue-100 text-blue-700',
    webinar: 'bg-purple-100 text-purple-700',
    event: 'bg-pink-100 text-pink-700',
    maintenance: 'bg-yellow-100 text-yellow-700',
    other: 'bg-gray-100 text-gray-700'
  }

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
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900">お知らせ</h1>
      </div>

      {/* Category Tabs */}
      <div className="mb-6 relative">
        <div className="absolute inset-x-0 -mx-4 sm:-mx-6 lg:static lg:mx-0">
          <div className="overflow-x-auto scrollbar-hide">
            <div className="flex gap-2 px-4 sm:px-6 lg:px-0 pb-2 lg:pb-0 lg:flex-wrap">
              {visibleCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setActiveCategory(category.id)}
                  className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0 ${
                    activeCategory === category.id
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {category.label}
                  <span className="ml-1.5 sm:ml-2 text-xs">
                    ({categoryCounts[category.id]})
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
        {/* スペーサー */}
        <div className="h-10 lg:hidden" />
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
        <div className="space-y-3">
          {filteredNotices.map((notice) => (
            <Link
              key={notice.id}
              href={`/notices/${notice.id}`}
              className="block group"
            >
              <div className="bg-white rounded-lg overflow-hidden border border-gray-200 hover:shadow-lg transition-all duration-300 hover:border-blue-300 md:h-[118px]">
                <div className="flex h-full p-4 md:p-5">
                  {/* Thumbnail - PC only */}
                  <div className="hidden md:block relative w-[139px] h-[78px] flex-shrink-0 overflow-hidden rounded">
                    {notice.thumbnail ? (
                      <Image
                        src={notice.thumbnail}
                        alt={notice.title}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 bg-gray-100 flex items-center justify-center">
                        <Bell className="h-10 w-10 text-gray-400" />
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 md:ml-5 flex flex-col justify-center">
                    {/* Mobile layout - title first */}
                    <h3 className="md:hidden font-semibold text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-1 mb-2">
                      {notice.title}
                    </h3>
                    
                    {/* PC layout - category and date first */}
                    <div className="flex items-center gap-2 md:mb-2">
                      <div className="flex items-center gap-1 text-gray-500 text-xs md:hidden">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(notice.published_date)}</span>
                      </div>
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        categoryColors[notice.category]
                      }`}>
                        {categoryLabels[notice.category]}
                      </span>
                      <div className="hidden md:flex items-center gap-1 text-gray-500 text-xs">
                        <Calendar className="h-3 w-3" />
                        {formatDate(notice.published_date)}
                      </div>
                    </div>
                    
                    {/* PC - title after category/date */}
                    <h3 className="hidden md:block font-bold text-lg text-gray-900 group-hover:text-portfolio-blue transition-colors line-clamp-1">
                      {notice.title}
                    </h3>
                  </div>

                  {/* Arrow */}
                  <div className="flex items-center justify-center ml-4">
                    <ChevronRight className="h-5 w-5 text-gray-400 group-hover:text-portfolio-blue transition-colors" />
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