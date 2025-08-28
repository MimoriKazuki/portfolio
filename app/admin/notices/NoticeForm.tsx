'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Upload, Loader2, Bell } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface NoticeFormData {
  title: string
  category: 'news' | 'webinar' | 'event' | 'maintenance' | 'other'
  site_url?: string
  thumbnail?: string
  description?: string
  is_featured: boolean
  is_published: boolean
}

interface NoticeFormProps {
  initialData?: Partial<NoticeFormData>
  noticeId?: string
}

export default function NoticeForm({ initialData, noticeId }: NoticeFormProps) {
  const [featuredCount, setFeaturedCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || '')
  const [dragOver, setDragOver] = useState(false)
  
  const [formData, setFormData] = useState<NoticeFormData>({
    title: initialData?.title || '',
    category: initialData?.category || 'news',
    site_url: initialData?.site_url || '',
    thumbnail: initialData?.thumbnail || '',
    description: initialData?.description || '',
    is_featured: initialData?.is_featured || false,
    is_published: initialData?.is_published || false,
  })

  const categoryLabels = {
    news: 'ニュース',
    webinar: 'ウェビナー',
    event: 'イベント',
    maintenance: 'メンテナンス',
    other: 'その他'
  }

  // 注目お知らせの数を取得
  useEffect(() => {
    const fetchFeaturedCount = async () => {
      const query = supabase
        .from('notices')
        .select('id', { count: 'exact', head: true })
        .eq('is_featured', true)
      
      // 編集時は自分自身を除外
      if (noticeId) {
        query.neq('id', noticeId)
      }
      
      const { count, error } = await query
      
      if (error) {
        console.error('Error fetching featured count:', error)
      } else {
        setFeaturedCount(count || 0)
      }
    }
    fetchFeaturedCount()
  }, [noticeId, supabase])

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

    // First, ensure the bucket exists
    try {
      const { data: buckets } = await supabase.storage.listBuckets()
      const bucketExists = buckets?.some(bucket => bucket.name === 'notice-thumbnails')
      
      if (!bucketExists) {
        // Create the bucket if it doesn't exist
        await supabase.storage.createBucket('notice-thumbnails', {
          public: true
        })
      }
    } catch (error) {
      console.error('Error checking/creating bucket:', error)
    }

    const { error: uploadError, data } = await supabase.storage
      .from('notice-thumbnails')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('notice-thumbnails')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let thumbnailUrl = formData.thumbnail

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        setUploading(true)
        thumbnailUrl = await uploadThumbnail(thumbnailFile)
        setUploading(false)
      }

      const noticeData = {
        ...formData,
        thumbnail: thumbnailUrl,
        published_date: new Date().toISOString()
      }

      if (noticeId) {
        // Update existing notice
        const { error } = await supabase
          .from('notices')
          .update(noticeData)
          .eq('id', noticeId)

        if (error) throw error
      } else {
        // Create new notice
        const { data, error } = await supabase
          .from('notices')
          .insert([noticeData])
          .select()

        if (error) throw error
      }

      router.push('/admin/notices')
      router.refresh()
    } catch (error: any) {
      console.error('Error saving notice:', error)
      alert('Error saving notice: ' + (error?.message || 'Unknown error'))
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
              お知らせ名 <span className="text-red-500">*</span>
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value as NoticeFormData['category'] })}
                className="w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
                required
              >
                {Object.entries(categoryLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
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
            サイトURL
          </label>
          <input
            type="url"
            value={formData.site_url || ''}
            onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
            placeholder="https://example.com"
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
          />
          <p className="mt-1 text-xs text-gray-500">外部サイトに飛ばす場合はURLを入力してください</p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            サムネイル画像
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
                onClick={() => document.getElementById('thumbnail-input')?.click()}
              >
                <span className="text-gray-500">ここにファイルをドラッグ&ドロップ</span>
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-block">
                <input
                  id="thumbnail-input"
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
            説明
          </label>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
            placeholder="お知らせの内容を入力してください"
          />
        </div>

        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-portfolio-blue bg-white border-gray-300 rounded focus:ring-portfolio-blue"
            />
            <span className="text-sm font-medium text-gray-700">公開する</span>
          </label>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => {
                const checked = e.target.checked
                // 1つまでの制限をチェック
                if (checked && featuredCount >= 1 && !initialData?.is_featured) {
                  alert('注目のお知らせは最大1つまでです。')
                  return
                }
                setFormData({ ...formData, is_featured: checked })
              }}
              disabled={!formData.is_featured && featuredCount >= 1}
              className="w-4 h-4 text-portfolio-blue bg-white border-gray-300 rounded focus:ring-portfolio-blue disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700">
              注目のお知らせ
              {featuredCount >= 1 && !formData.is_featured && (
                <span className="text-xs text-red-500 ml-2">(上限達成: {featuredCount}/1)</span>
              )}
            </span>
          </label>
        </div>

        <div className="flex justify-end gap-4 pt-4">
          <Link
            href="/admin/notices"
            className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading || uploading}
            className="px-6 py-2 bg-portfolio-blue text-white rounded-lg hover:bg-portfolio-blue-dark transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {(loading || uploading) ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {uploading ? 'アップロード中...' : '保存中...'}
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                {noticeId ? '更新' : '作成'}
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  )
}