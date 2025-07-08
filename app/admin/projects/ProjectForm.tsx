'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Save, X, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProjectFormData {
  title: string
  description: string
  thumbnail: string
  live_url: string
  technologies: string[]
  featured: boolean
  category: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app'
  duration: string
  order: number
}

interface ProjectFormProps {
  initialData?: Partial<ProjectFormData>
  projectId?: string
}

export default function ProjectForm({ initialData, projectId }: ProjectFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [techInput, setTechInput] = useState('')
  const [uploading, setUploading] = useState(false)
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || '')
  const [featuredCount, setFeaturedCount] = useState(0)
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    live_url: initialData?.live_url || '',
    technologies: initialData?.technologies || [],
    featured: initialData?.featured || false,
    category: initialData?.category || 'web-app',
    duration: initialData?.duration || '',
    order: initialData?.order || 0,
  })

  // Featured project countを取得
  useEffect(() => {
    const fetchFeaturedCount = async () => {
      const { data, error } = await supabase
        .from('projects')
        .select('id')
        .eq('featured', true)
        .neq('id', projectId || '')
      
      if (!error) {
        setFeaturedCount(data?.length || 0)
      }
    }
    fetchFeaturedCount()
  }, [supabase, projectId])

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

  const uploadThumbnail = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('project-thumbnails')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-thumbnails')
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

      const projectData = {
        ...formData,
        thumbnail: thumbnailUrl
      }

      if (projectId) {
        // Update existing project
        const { error } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)

        if (error) throw error
      } else {
        // Create new project
        const { error } = await supabase
          .from('projects')
          .insert([projectData])

        if (error) throw error
      }

      router.push('/admin')
      router.refresh()
    } catch (error: unknown) {
      alert('Error saving project: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  const addTechnology = () => {
    if (techInput.trim() && !formData.technologies.includes(techInput.trim())) {
      setFormData({
        ...formData,
        technologies: [...formData.technologies, techInput.trim()]
      })
      setTechInput('')
    }
  }

  const removeTechnology = (tech: string) => {
    setFormData({
      ...formData,
      technologies: formData.technologies.filter(t => t !== tech)
    })
  }

  const handleFeaturedChange = (checked: boolean) => {
    // 3つまでの制限をチェック
    if (checked && featuredCount >= 3 && !initialData?.featured) {
      alert('注目プロジェクトは最大3つまでです。')
      return
    }
    setFormData({ ...formData, featured: checked })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium mb-2">
            プロジェクト名 *
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            className="w-full px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            カテゴリ
          </label>
          <select
            value={formData.category}
            onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectFormData['category'] })}
            className="w-full px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="homepage">ホームページ</option>
            <option value="landing-page">ランディングページ</option>
            <option value="web-app">Webアプリ</option>
            <option value="mobile-app">モバイルアプリ</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            開発期間
          </label>
          <input
            type="text"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            className="w-full px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="2週間"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          説明 *
        </label>
        <textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="w-full px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          rows={4}
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          サムネイル画像 *
        </label>
        <div className="space-y-4">
          {thumbnailPreview && (
            <div className="relative w-full max-w-md">
              <Image
                src={thumbnailPreview}
                alt="サムネイルプレビュー"
                width={400}
                height={225}
                className="rounded-lg border border-border"
              />
            </div>
          )}
          <div className="flex items-center gap-4">
            <label className="cursor-pointer">
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailChange}
                className="hidden"
                required={!formData.thumbnail}
              />
              <div className="flex items-center gap-2 bg-youtube-gray hover:bg-youtube-dark px-4 py-2 rounded-lg transition-colors">
                <Upload className="h-5 w-5" />
                {thumbnailFile ? '画像を変更' : '画像を選択'}
              </div>
            </label>
            {thumbnailFile && (
              <span className="text-sm text-muted-foreground">
                {thumbnailFile.name}
              </span>
            )}
          </div>
          {uploading && (
            <p className="text-sm text-muted-foreground">アップロード中...</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          サイトURL
        </label>
        <input
          type="url"
          value={formData.live_url}
          onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
          className="w-full px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          placeholder="https://example.com"
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-2">
          使用技術
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={techInput}
            onChange={(e) => setTechInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
            className="flex-1 px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
            placeholder="技術を追加..."
          />
          <button
            type="button"
            onClick={addTechnology}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
追加
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.technologies.map((tech) => (
            <span
              key={tech}
              className="bg-youtube-gray px-3 py-1 rounded-full text-sm flex items-center gap-2"
            >
              {tech}
              <button
                type="button"
                onClick={() => removeTechnology(tech)}
                className="text-red-400 hover:text-red-300"
              >
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleFeaturedChange(e.target.checked)}
              disabled={!formData.featured && featuredCount >= 3}
              className="w-4 h-4 text-youtube-red bg-youtube-dark border-border rounded focus:ring-blue-600 disabled:opacity-50"
            />
            <span className="text-sm font-medium">
              注目プロジェクト
              {featuredCount >= 3 && !formData.featured && (
                <span className="text-xs text-red-400 ml-2">(上限達成: {featuredCount}/3)</span>
              )}
            </span>
          </label>
          <p className="text-xs text-muted-foreground mt-1">
            現在の注目プロジェクト: {featuredCount}/3
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">
            表示順序
          </label>
          <input
            type="number"
            value={formData.order}
            onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 bg-youtube-dark border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors disabled:opacity-50"
        >
          <Save className="h-5 w-5" />
          {loading ? '保存中...' : '保存する'}
        </button>
        
        <Link
          href="/admin"
          className="flex items-center gap-2 bg-youtube-gray hover:bg-youtube-dark px-6 py-2 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
          キャンセル
        </Link>
      </div>
    </form>
  )
}