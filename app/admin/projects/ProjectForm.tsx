'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Upload, Loader2, Eye } from 'lucide-react'
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
  prompt: string
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
  const [showPromptPreview, setShowPromptPreview] = useState(false)
  
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
      alert('注目プロジェクトは最大3つまでです。')
      return
    }
    setFormData({ ...formData, featured: checked })
  }

  const parseCSVPrompt = (csvText: string) => {
    if (!csvText.trim()) return []
    
    const lines = csvText.trim().split('\n')
    const results = []
    
    for (const line of lines) {
      const values = line.split(',').map(v => v.trim())
      if (values.length >= 3) {
        results.push({
          number: values[0],
          category: values[1],
          prompt: values[2],
          description: values[3] || ''
        })
      }
    }
    
    return results
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              プロジェクト名 <span className="text-red-500">*</span>
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
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectFormData['category'] })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
            >
              <option value="homepage">ホームページ</option>
              <option value="landing-page">ランディングページ</option>
              <option value="web-app">Webアプリ</option>
              <option value="mobile-app">モバイルアプリ</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
              開発期間
            </label>
            <input
              type="text"
              value={formData.duration}
              onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
              className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
              placeholder="2週間"
            />
          </div>

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
            プロンプト（CSV形式）
          </label>
          <textarea
            value={formData.prompt}
            onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900 font-mono text-sm"
            rows={6}
            placeholder={`番号,カテゴリ,プロンプト,説明
1,UI設計,モダンなECサイトのUIを設計してください,レスポンシブデザインを重視
2,実装,React + TypeScriptで実装してください,最新のベストプラクティスに従う`}
          />
          <div className="flex items-center justify-between mt-1">
            <p className="text-xs text-gray-600">
              CSV形式でプロンプトを入力してください。ヘッダー行は自動的に追加されます。
            </p>
            {formData.prompt && (
              <button
                type="button"
                onClick={() => setShowPromptPreview(!showPromptPreview)}
                className="text-xs text-portfolio-blue hover:text-portfolio-blue-dark flex items-center gap-1"
              >
                <Eye className="h-3 w-3" />
                プレビュー
              </button>
            )}
          </div>
          
          {showPromptPreview && formData.prompt && (
            <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h4 className="text-sm font-medium mb-2 text-gray-700">プロンプトプレビュー</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-gray-300">
                      <th className="text-left p-2">番号</th>
                      <th className="text-left p-2">カテゴリ</th>
                      <th className="text-left p-2">プロンプト</th>
                      <th className="text-left p-2">説明</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parseCSVPrompt(formData.prompt).map((row, index) => (
                      <tr key={index} className="border-b border-gray-200">
                        <td className="p-2">{row.number}</td>
                        <td className="p-2">{row.category}</td>
                        <td className="p-2">{row.prompt}</td>
                        <td className="p-2">{row.description}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
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
              注目プロジェクト
              {featuredCount >= 3 && !formData.featured && (
                <span className="text-xs text-red-500 ml-2">(上限達成: {featuredCount}/3)</span>
              )}
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-1">
            現在の注目プロジェクト: {featuredCount}/3
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