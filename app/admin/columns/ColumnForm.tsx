'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import dynamic from 'next/dynamic'

const RichTextEditor = dynamic(() => import('./RichTextEditor'), {
  ssr: false,
  loading: () => <div className="h-[400px] bg-gray-100 rounded-lg animate-pulse" />
})
import './editor-styles.css'

interface ColumnFormData {
  title: string
  content: string
  excerpt?: string
  is_featured: boolean
  is_published: boolean
  author?: string
  thumbnail?: string
  category: 'ai-tools' | 'industry' | 'topics-news'
}

interface ColumnFormProps {
  initialData?: Partial<ColumnFormData>
  columnId?: string
}

export default function ColumnForm({ initialData, columnId }: ColumnFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || '')
  const [dragOver, setDragOver] = useState(false)
  
  const [formData, setFormData] = useState<ColumnFormData>({
    title: initialData?.title || '',
    content: initialData?.content || '',
    excerpt: initialData?.excerpt || '',
    is_featured: initialData?.is_featured || false,
    is_published: initialData?.is_published || false,
    author: initialData?.author || 'LandBridge開発チーム',
    thumbnail: initialData?.thumbnail || '',
    category: initialData?.category || 'topics-news',
  })


  const handleThumbnailChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setThumbnailFile(file)
    
    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setThumbnailPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
    
    const files = Array.from(e.dataTransfer.files)
    const imageFile = files.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      setThumbnailFile(imageFile)
      
      // Create preview
      const reader = new FileReader()
      reader.onload = (e) => {
        setThumbnailPreview(e.target?.result as string)
      }
      reader.readAsDataURL(imageFile)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOver(false)
  }

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('column-thumbnails')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('column-thumbnails')
      .getPublicUrl(filePath)

    return publicUrl
  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    console.log('Form data before submit:', formData)
    console.log('Supabase client:', supabase)

    try {
      let thumbnailUrl = formData.thumbnail

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        setUploading(true)
        thumbnailUrl = await uploadThumbnail(thumbnailFile)
        setUploading(false)
      }

      const columnData = {
        ...formData,
        thumbnail: thumbnailUrl,
        published_date: new Date().toISOString() // 公開日時を追加
      }

      if (columnId) {
        // Update existing column
        const { error } = await supabase
          .from('columns')
          .update(columnData)
          .eq('id', columnId)

        if (error) throw error
      } else {
        // Create new column
        console.log('Inserting column data:', columnData)
        
        try {
          const { data, error } = await supabase
            .from('columns')
            .insert([columnData])
            .select()

          console.log('Supabase response:', { data, error })

          if (error) {
            console.error('Supabase error object:', error)
            console.error('Error type:', typeof error)
            console.error('Error properties:', Object.getOwnPropertyNames(error))
            console.error('Error message:', error.message)
            console.error('Error code:', error.code)
            console.error('Error details:', error.details)
            console.error('Error hint:', error.hint)
            
            // PostgreSQLのエラーコードを確認
            if (error.code === '42501') {
              throw new Error('権限エラー: RLSポリシーを確認してください。')
            }
            
            // エラーメッセージを優先的に使用
            throw new Error(error.message || JSON.stringify(error))
          }
          
          if (!data) {
            throw new Error('No data returned from insert')
          }
        } catch (insertError) {
          console.error('Insert catch error:', insertError)
          throw insertError
        }
      }

      console.log('Column saved successfully')
      router.push('/admin/columns')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving column:', error)
      console.error('Error details:', {
        message: error?.message,
        details: error?.details,
        hint: error?.hint,
        code: error?.code,
        toString: error?.toString ? error.toString() : 'No toString method',
        stack: error?.stack
      })
      const errorMessage = error?.message || error?.toString?.() || 'Unknown error'
      alert('Error saving column: ' + errorMessage)
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              カテゴリ <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ColumnFormData['category'] })}
                className="w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
                required
              >
                <option value="ai-tools">生成AIツール</option>
                <option value="industry">業界別</option>
                <option value="topics-news">トピック・ニュース</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            メイン画像
          </label>
          <div className="space-y-4">
            {thumbnailPreview ? (
              <div className="relative w-80 aspect-video">
                <Image
                  src={thumbnailPreview}
                  alt="サムネイルプレビュー"
                  fill
                  className="object-cover rounded-lg border border-gray-200"
                />
              </div>
            ) : (
              <div 
                className={`w-80 aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                  dragOver 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => document.getElementById('column-thumbnail-input')?.click()}
              >
                <span className="text-gray-500">ここにファイルをドラッグ&ドロップ</span>
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-block">
                <input
                  id="column-thumbnail-input"
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailChange}
                  className="hidden"
                />
                <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Upload className="h-5 w-5" />
                  {thumbnailFile ? '画像を変更' : '画像を選択'}
                </div>
              </label>
            </div>
            {uploading && (
              <p className="text-sm text-blue-600">アップロード中...</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            概要
          </label>
          <textarea
            value={formData.excerpt}
            onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
            rows={3}
            placeholder="コラムの概要や要約を入力してください"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            本文 <span className="text-red-500">*</span>
          </label>
          <RichTextEditor
            content={formData.content}
            onChange={(content) => setFormData({ ...formData, content })}
          />
        </div>



        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-portfolio-blue bg-white border-gray-300 rounded focus:ring-portfolio-blue"
            />
            <span className="text-sm font-medium text-gray-700">
              注目コラム
            </span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-portfolio-blue bg-white border-gray-300 rounded focus:ring-portfolio-blue"
            />
            <span className="text-sm font-medium text-gray-700">
              公開する
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/columns"
            className="flex items-center gap-2 bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
            キャンセル
          </Link>
          
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                保存中...
              </>
            ) : (
              <>
                <Check className="h-5 w-5" />
                保存する
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}