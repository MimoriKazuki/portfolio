'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Calendar, FolderOpen } from 'lucide-react'
import { Column } from '@/app/types'

const categories = [
  { id: 'all', label: 'すべて' },
  { id: 'ai-tools', label: '生成AIツール' },
  { id: 'industry', label: '業界別' },
  { id: 'topics-news', label: 'トピック・ニュース' },
]

interface ColumnsClientProps {
  columns: Column[]
}

export default function ColumnsClient({ columns }: ColumnsClientProps) {
  const [activeCategory, setActiveCategory] = useState('all')
  
  // カテゴリごとのコラム数を計算
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    categories.forEach(category => {
      if (category.id === 'all') {
        counts[category.id] = columns.length
      } else {
        counts[category.id] = columns.filter(c => c.category === category.id).length
      }
    })
    return counts
  }, [columns])
  
  // コンテンツがあるカテゴリのみをフィルタリング
  const visibleCategories = useMemo(() => {
    return categories.filter(category => 
      category.id === 'all' || categoryCounts[category.id] > 0
    )
  }, [categoryCounts])
  
  // フィルタリングをメモ化
  const filteredColumns = useMemo(() => {
    return activeCategory === 'all' 
      ? columns 
      : columns.filter(column => column.category === activeCategory)
  }, [activeCategory, columns])

  const categoryColors = {
    'ai-tools': 'bg-emerald-100 text-emerald-700',
    'industry': 'bg-blue-100 text-blue-700',
    'topics-news': 'bg-purple-100 text-purple-700'
  }

  const categoryLabels = {
    'ai-tools': '生成AIツール',
    'industry': '業界別',
    'topics-news': 'トピック・ニュース'
  }
    
  return (
    <div className="w-full">
      <div className="mb-8">
        <h1 className="text-[28px] font-bold text-gray-900">コラム</h1>
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
      
      {/* カードコンテナ */}
      {filteredColumns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">このカテゴリにコラムはありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredColumns.map((column: Column) => (
            <Link 
              key={column.id} 
              href={`/columns/${column.slug}`}
              className="group"
            >
              <article className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 h-full flex flex-col">
                <div className="relative">
                  {column.thumbnail && (
                    <div className="relative aspect-video">
                      <Image
                        src={column.thumbnail}
                        alt={column.title}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                    </div>
                  )}
                  {column.category && (
                    <div className={`absolute top-1 sm:top-2 right-1 sm:right-2 ${categoryColors[column.category] || 'bg-gray-100 text-gray-700'} text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium`}>
                      {categoryLabels[column.category] || column.category}
                    </div>
                  )}
                  {column.is_featured && (
                    <div className="absolute top-1 sm:top-2 left-1 sm:left-2 bg-portfolio-blue text-white text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded font-medium">
                      注目
                    </div>
                  )}
                </div>
                
                <div className="p-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-portfolio-blue transition-colors">
                    {column.title}
                  </h2>
                  
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {column.excerpt || ''}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    <span>
                      {new Date(column.published_date).toLocaleDateString('ja-JP')}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}
        
      {/* 問い合わせボタンとの重なりを防ぐためのスペース */}
      <div className="h-24" />
    </div>
  )
}