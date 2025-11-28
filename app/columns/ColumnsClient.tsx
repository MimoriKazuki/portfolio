'use client'

import { useState, useMemo, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { FolderOpen } from 'lucide-react'
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
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])
  
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
    'ai-tools': 'border-emerald-200 text-emerald-700',
    'industry': 'border-blue-200 text-blue-700',
    'topics-news': 'border-purple-200 text-purple-700'
  }

  const categoryLabels = {
    'ai-tools': '生成AIツール',
    'industry': '業界別',
    'topics-news': 'トピック・ニュース'
  }
    
  return (
    <div className="w-full pt-8">
      <div
        className="mb-12"
        style={{
          opacity: isVisible ? 1 : 0,
          transform: isVisible ? 'translateY(0)' : 'translateY(20px)',
          transition: 'opacity 0.6s ease-out, transform 0.6s ease-out',
        }}
      >
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 tracking-tight">COLUMN</h1>
        <p className="text-lg text-gray-500">コラム</p>
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
      
      {/* カードコンテナ */}
      {filteredColumns.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <FolderOpen className="h-16 w-16 sm:h-24 sm:w-24 text-gray-400 mb-4" />
          <p className="text-lg sm:text-xl text-gray-500">このカテゴリにコラムはありません</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredColumns.map((column: Column) => (
            <Link 
              key={column.id} 
              href={`/columns/${column.id}`}
              className="group"
            >
              <article className="overflow-hidden border-2 border-transparent hover:border-gray-200 transition-colors duration-300 h-full flex flex-col p-4 rounded">
                {/* 画像 */}
                  {column.thumbnail && (
                  <div className="relative aspect-video overflow-hidden rounded">
                      <Image
                        src={column.thumbnail}
                        alt={column.title}
                        fill
                      className="object-cover"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        loading="lazy"
                        placeholder="blur"
                        blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAf/xAAhEAACAQMDBQAAAAAAAAAAAAABAgMABAUGIWEREiMxUf/EABUBAQEAAAAAAAAAAAAAAAAAAAMF/8QAGhEAAgIDAAAAAAAAAAAAAAAAAAECEgMRkf/aAAwDAQACEQMRAD8AltJagyeH0AthI5xdrLcNM91BF5pX2HaH9bcfaSXWGaRmknyJckliyjqTzSlT54b6bk+h0R//2Q=="
                      />
                  {column.is_featured && (
                      <div className="absolute top-2 left-2 bg-portfolio-blue text-white text-xs px-3 py-1 font-medium">
                      注目
                    </div>
                  )}
                </div>
                )}
                
                {/* テキスト群 */}
                <div className="pt-4 flex-1 flex flex-col">
                  <h2 className="font-semibold text-gray-900 mb-2 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {column.title}
                  </h2>
                  
                  <div className="flex-1">
                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">
                      {column.excerpt || ''}
                    </p>
                  </div>
                  
                  {/* 日付とカテゴリバッジ */}
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {new Date(column.created_at).toLocaleDateString('ja-JP')}
                    </span>
                    {column.category && (
                      <span className={`${categoryColors[column.category] || 'border-gray-200 text-gray-700'} bg-white text-xs px-3 py-1 border font-medium`}>
                        {categoryLabels[column.category] || column.category}
                      </span>
                    )}
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