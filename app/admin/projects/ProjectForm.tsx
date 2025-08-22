'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Upload, Loader2, FileText, Download } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface ProjectFormData {
  title: string
  description: string
  thumbnail: string
  live_url: string
  technologies: string[]
  featured: boolean
  category: 'homepage' | 'landing-page' | 'web-app' | 'mobile-app' | 'video'
  duration: string
  prompt: string
  prompt_filename: string
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
  const [dragOver, setDragOver] = useState(false)
  const [promptFile, setPromptFile] = useState<File | null>(null)
  const [promptFileName, setPromptFileName] = useState<string>('')
  const [videoFile, setVideoFile] = useState<File | null>(null)
  const [videoFileName, setVideoFileName] = useState<string>('')
  
  const [formData, setFormData] = useState<ProjectFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail: initialData?.thumbnail || '',
    live_url: initialData?.live_url || '',
    technologies: initialData?.technologies || [],
    featured: initialData?.featured || false,
    category: initialData?.category || 'web-app',
    duration: initialData?.duration || '',
    prompt: initialData?.prompt || '',
    prompt_filename: initialData?.prompt_filename || '',
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

  // 初期データにプロンプトファイル名がある場合は設定
  useEffect(() => {
    if (initialData?.prompt_filename) {
      setPromptFileName(initialData.prompt_filename)
    }
  }, [initialData?.prompt_filename])

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

  const uploadVideo = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = fileName

    const { error: uploadError, data } = await supabase.storage
      .from('project-videos')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (uploadError) {
      console.error('Video upload error:', uploadError)
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('project-videos')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 開発期間が必須
    if (!formData.duration) {
      alert('開発期間は必須項目です。')
      return
    }
    
    // 動画制作カテゴリの場合、動画ファイルまたはURLが必須
    if (formData.category === 'video' && !formData.live_url && !videoFile) {
      alert('動画制作カテゴリでは動画ファイルのアップロードまたはURLが必須です。')
      return
    }
    
    setLoading(true)

    try {
      let thumbnailUrl = formData.thumbnail
      let videoUrl = formData.live_url

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        setUploading(true)
        thumbnailUrl = await uploadThumbnail(thumbnailFile)
        setUploading(false)
      }

      // Upload video file if selected (for video category)
      if (formData.category === 'video' && videoFile) {
        setUploading(true)
        videoUrl = await uploadVideo(videoFile)
        setUploading(false)
      }

      const projectData = {
        ...formData,
        thumbnail: thumbnailUrl,
        live_url: videoUrl
      }

      console.log('Attempting to save project data:', projectData)
      console.log('Current auth status:', await supabase.auth.getUser())

      if (projectId) {
        // Update existing project
        const { error, data } = await supabase
          .from('projects')
          .update(projectData)
          .eq('id', projectId)
          .select()

        console.log('Update result:', { error, data })
        if (error) throw error
      } else {
        // Create new project
        const { error, data } = await supabase
          .from('projects')
          .insert([projectData])
          .select()

        console.log('Insert result:', { error, data })

        if (error) throw error
      }

      console.log('Project saved successfully')
      router.push('/admin/projects')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error saving project:', error)
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
      alert('注目ポートフォリオは最大3つまでです。')
      return
    }
    setFormData({ ...formData, featured: checked })
  }

  const handleVideoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 動画ファイルの検証
    const validTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
    if (!validTypes.includes(file.type)) {
      alert('MP4、WebM、OGG、MOV形式の動画ファイルを選択してください')
      return
    }

    // ファイルサイズの制限（100MB）
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      alert('動画ファイルのサイズは100MB以下にしてください')
      return
    }

    setVideoFile(file)
    setVideoFileName(file.name)
  }

  const handlePromptFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !file.name.endsWith('.csv')) {
      alert('CSVファイルを選択してください')
      return
    }

    setPromptFile(file)
    setPromptFileName(file.name)
    
    // エンコーディングを自動検出して読み込む
    const tryReadWithEncoding = (encoding: string) => {
      return new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = (event) => {
          const text = event.target?.result as string
          resolve(text)
        }
        reader.onerror = reject
        reader.readAsText(file, encoding)
      })
    }
    
    try {
      // まずShift-JISで試す（日本語CSVの一般的なエンコーディング）
      let csvText = await tryReadWithEncoding('Shift-JIS')
      console.log('Shift-JIS CSV preview:', csvText.substring(0, 200))
      
      // 文字化けチェック
      const hasReplacementChar = csvText.includes('�') || csvText.includes('\ufffd')
      
      if (hasReplacementChar) {
        console.log('Shift-JIS has replacement chars, trying UTF-8...')
        // UTF-8で再試行
        csvText = await tryReadWithEncoding('UTF-8')
        console.log('UTF-8 CSV preview:', csvText.substring(0, 200))
      }
      
      setFormData({ ...formData, prompt: csvText, prompt_filename: file.name })
    } catch (error) {
      console.error('Error reading CSV file:', error)
      alert('CSVファイルの読み込みに失敗しました')
    }
  }


  return (
    <div className="bg-white rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              ポートフォリオ名 <span className="text-red-500">*</span>
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
                onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectFormData['category'] })}
                className="w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
              >
                <option value="homepage">ホームページ</option>
                <option value="landing-page">ランディングページ</option>
                <option value="web-app">Webアプリ</option>
                <option value="mobile-app">モバイルアプリ</option>
                <option value="video">動画制作</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              開発期間 <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
              placeholder="2週間"
              required
            />
          </div>

          {formData.category === 'video' ? (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                動画ファイル <span className="text-red-500">*</span>
              </label>
              {videoFileName ? (
                <div className="space-y-3">
                  <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                    <span className="text-sm text-gray-700">{videoFileName}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setVideoFile(null)
                        setVideoFileName('')
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                  <p className="text-xs text-gray-600">
                    または、外部動画URLを入力:
                  </p>
                  <input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              ) : (
                <div>
                  <label className="cursor-pointer inline-block">
                    <input
                      type="file"
                      accept="video/mp4,video/webm,video/ogg,video/quicktime"
                      onChange={handleVideoFileChange}
                      className="hidden"
                    />
                    <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                      <Upload className="h-5 w-5" />
                      動画ファイルを選択
                    </div>
                  </label>
                  <p className="text-xs text-gray-600 mt-2">
                    MP4、WebM、OGG、MOV形式（最大100MB）
                  </p>
                  <p className="text-xs text-gray-600 mt-2">
                    または、外部動画URLを入力:
                  </p>
                  <input
                    type="url"
                    value={formData.live_url}
                    onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                    className="w-full mt-2 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
                    placeholder="https://example.com/video.mp4"
                  />
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                サイトURL
              </label>
              <input
                type="url"
                value={formData.live_url}
                onChange={(e) => setFormData({ ...formData, live_url: e.target.value })}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
                placeholder="https://example.com"
              />
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            サムネイル画像 <span className="text-red-500">*</span>
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
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
            rows={4}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            使用技術
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={techInput}
              onChange={(e) => setTechInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
              className="flex-1 px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
              placeholder="技術を追加..."
            />
            <button
              type="button"
              onClick={addTechnology}
              className="px-4 py-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white rounded-lg transition-colors"
            >
              追加
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.technologies.map((tech) => (
              <span
                key={tech}
                className="bg-gray-100 px-3 py-1 rounded-full text-sm flex items-center gap-2 text-gray-700"
              >
                {tech}
                <button
                  type="button"
                  onClick={() => removeTechnology(tech)}
                  className="text-red-500 hover:text-red-600"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            プロンプト（CSVファイル）
          </label>
          
          <div className="space-y-4">
            {(promptFile || formData.prompt) ? (
              <div className="space-y-3">
                <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                  <span className="text-sm text-gray-700">
                    {promptFileName || formData.prompt_filename || 'prompt_data.csv'}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setPromptFile(null)
                      setPromptFileName('')
                      setFormData({ ...formData, prompt: '', prompt_filename: '' })
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handlePromptFileChange}
                    className="hidden"
                  />
                  <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                    <Upload className="h-5 w-5" />
                    CSVファイルを選択
                  </div>
                </label>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleFeaturedChange(e.target.checked)}
              disabled={!formData.featured && featuredCount >= 3}
              className="w-4 h-4 text-portfolio-blue bg-white border-gray-300 rounded focus:ring-portfolio-blue disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700">
              注目ポートフォリオ
              {featuredCount >= 3 && !formData.featured && (
                <span className="text-xs text-red-500 ml-2">(上限達成: {featuredCount}/3)</span>
              )}
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-1">
            現在の注目ポートフォリオ: {featuredCount}/3
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/projects"
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