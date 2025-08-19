'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Column } from '@/app/types'
import Image from 'next/image'
import { Upload, X } from 'lucide-react'

interface ColumnFormProps {
  column?: Column
}

export default function ColumnForm({ column }: ColumnFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  const [formData, setFormData] = useState({
    title: column?.title || '',
    slug: column?.slug || '',
    excerpt: column?.excerpt || '',
    content: column?.content || '',
    thumbnail: column?.thumbnail || '',
    tags: column?.tags?.join(', ') || '',
    is_published: column?.is_published || false,
    published_date: column?.published_date || new Date().toISOString().split('T')[0],
  })

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const columnData = {
        title: formData.title,
        slug: formData.slug,
        excerpt: formData.excerpt,
        content: formData.content,
        thumbnail: formData.thumbnail,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        is_published: formData.is_published,
        published_date: formData.is_published ? formData.published_date : null,
      }

      if (column) {
        const { error } = await supabase
          .from('columns')
          .update(columnData)
          .eq('id', column.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('columns')
          .insert([columnData])

        if (error) throw error
      }

      router.push('/admin/columns')
      router.refresh()
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">基本情報</h2>
        
        <div className="space-y-4">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              value={formData.title}
              onChange={(e) => {
                setFormData({ 
                  ...formData, 
                  title: e.target.value,
                  slug: generateSlug(e.target.value)
                })
              }}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
              required
            />
          </div>
          
          <div>
            <label htmlFor="slug" className="block text-sm font-medium text-gray-700 mb-1">
              スラッグ（URL） <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="slug"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
              pattern="[a-z0-9-]+"
              required
            />
            <p className="text-xs text-gray-500 mt-1">
              URLに使用されます。英数字とハイフンのみ使用可能
            </p>
          </div>
          
          <div>
            <label htmlFor="excerpt" className="block text-sm font-medium text-gray-700 mb-1">
              抜粋
            </label>
            <textarea
              id="excerpt"
              value={formData.excerpt}
              onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
              rows={2}
            />
            <p className="text-xs text-gray-500 mt-1">
              記事一覧で表示される短い説明文
            </p>
          </div>
          
          <div>
            <label htmlFor="thumbnail" className="block text-sm font-medium text-gray-700 mb-1">
              サムネイル画像URL
            </label>
            <input
              type="url"
              id="thumbnail"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
              placeholder="https://example.com/image.jpg"
            />
            {formData.thumbnail && (
              <div className="mt-2 relative w-32 h-20">
                <Image
                  src={formData.thumbnail}
                  alt="サムネイルプレビュー"
                  fill
                  className="object-cover rounded"
                />
              </div>
            )}
          </div>
          
          <div>
            <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">
              タグ
            </label>
            <input
              type="text"
              id="tags"
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
              placeholder="React, Next.js, TypeScript"
            />
            <p className="text-xs text-gray-500 mt-1">
              カンマ区切りで複数入力可能
            </p>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">本文</h2>
        
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            コンテンツ <span className="text-red-500">*</span>
          </label>
          <textarea
            id="content"
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900 font-mono text-sm"
            rows={20}
            required
          />
          <p className="text-xs text-gray-500 mt-1">
            Markdown形式で記述できます
          </p>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-semibold mb-4 text-gray-900">公開設定</h2>
        
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="is_published"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-portfolio-blue border-gray-300 rounded focus:ring-portfolio-blue"
            />
            <label htmlFor="is_published" className="text-sm font-medium text-gray-700">
              公開する
            </label>
          </div>
          
          {formData.is_published && (
            <div>
              <label htmlFor="published_date" className="block text-sm font-medium text-gray-700 mb-1">
                公開日
              </label>
              <input
                type="date"
                id="published_date"
                value={formData.published_date}
                onChange={(e) => setFormData({ ...formData, published_date: e.target.value })}
                className="w-full px-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue focus:border-portfolio-blue text-gray-900"
              />
            </div>
          )}
        </div>
      </div>
      
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-sm text-red-600">
          {error}
        </div>
      )}
      
      <div className="flex items-center gap-4">
        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {loading ? '保存中...' : column ? '更新する' : '作成する'}
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          キャンセル
        </button>
      </div>
    </form>
  )
}