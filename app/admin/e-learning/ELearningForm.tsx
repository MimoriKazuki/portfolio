'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Loader2, Plus, Trash2, FileText, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ELearningCategory, ELearningMaterial } from '@/app/types'

interface ELearningFormData {
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  duration: string
  category_id: string
  is_free: boolean
  price: number
  display_order: number
  is_published: boolean
  is_featured: boolean
}

interface MaterialFormData {
  id?: string
  title: string
  file_url: string
  file_size?: number
  display_order: number
  isNew?: boolean
  isDeleted?: boolean
}

interface ELearningFormProps {
  initialData?: Partial<ELearningFormData>
  initialMaterials?: ELearningMaterial[]
  contentId?: string
  categories?: ELearningCategory[]
}

export default function ELearningForm({ initialData, initialMaterials, contentId, categories = [] }: ELearningFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false)
  const [uploadingMaterial, setUploadingMaterial] = useState(false)

  const [formData, setFormData] = useState<ELearningFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    video_url: initialData?.video_url || '',
    duration: initialData?.duration || '',
    category_id: initialData?.category_id || '',
    is_free: initialData?.is_free ?? true,
    price: initialData?.price || 0,
    display_order: initialData?.display_order || 0,
    is_published: initialData?.is_published ?? true,
    is_featured: initialData?.is_featured ?? false,
  })

  const [materials, setMaterials] = useState<MaterialFormData[]>(
    initialMaterials?.map(m => ({
      id: m.id,
      title: m.title,
      file_url: m.file_url,
      file_size: m.file_size,
      display_order: m.display_order,
    })) || []
  )

  // サムネイル画像アップロード
  const handleThumbnailUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingThumbnail(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `thumbnails/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('e-learning-thumbnails')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('e-learning-thumbnails')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, thumbnail_url: publicUrl }))
    } catch (error) {
      console.error('Error uploading thumbnail:', error)
      alert('サムネイルのアップロードに失敗しました')
    } finally {
      setUploadingThumbnail(false)
    }
  }

  // 資料PDFアップロード
  const handleMaterialUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingMaterial(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`
      const filePath = `materials/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('e-learning-materials')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('e-learning-materials')
        .getPublicUrl(filePath)

      // 新しい資料を追加
      setMaterials(prev => [
        ...prev,
        {
          title: file.name.replace(/\.[^/.]+$/, ''), // 拡張子を除いたファイル名
          file_url: publicUrl,
          file_size: file.size,
          display_order: prev.length,
          isNew: true,
        }
      ])
    } catch (error) {
      console.error('Error uploading material:', error)
      alert('資料のアップロードに失敗しました')
    } finally {
      setUploadingMaterial(false)
    }
  }

  // 資料を削除（削除フラグを立てる）
  const handleRemoveMaterial = (index: number) => {
    setMaterials(prev => {
      const updated = [...prev]
      if (updated[index].id) {
        // 既存の資料は削除フラグを立てる
        updated[index].isDeleted = true
      } else {
        // 新規追加の資料はリストから削除
        updated.splice(index, 1)
      }
      return updated
    })
  }

  // 資料タイトル変更
  const handleMaterialTitleChange = (index: number, title: string) => {
    setMaterials(prev => {
      const updated = [...prev]
      updated[index].title = title
      return updated
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title.trim()) {
      alert('タイトルを入力してください')
      return
    }

    if (!formData.video_url.trim()) {
      alert('動画URLを入力してください')
      return
    }

    setLoading(true)

    try {
      const dataToSave = {
        title: formData.title,
        description: formData.description || null,
        thumbnail_url: formData.thumbnail_url || null,
        video_url: formData.video_url,
        category_id: formData.category_id || null,
        is_free: formData.is_free,
        price: formData.is_free ? 0 : formData.price,
        display_order: formData.display_order,
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        updated_at: new Date().toISOString(),
      }

      let savedContentId = contentId

      if (contentId) {
        // Update existing content
        const { error } = await supabase
          .from('e_learning_contents')
          .update(dataToSave)
          .eq('id', contentId)

        if (error) throw error
      } else {
        // Create new content
        const { data, error } = await supabase
          .from('e_learning_contents')
          .insert(dataToSave)
          .select('id')
          .single()

        if (error) throw error
        savedContentId = data.id
      }

      // 資料の保存処理
      // 1. 削除フラグが立っている資料を削除
      const materialsToDelete = materials.filter(m => m.isDeleted && m.id)
      for (const material of materialsToDelete) {
        await supabase
          .from('e_learning_materials')
          .delete()
          .eq('id', material.id)
      }

      // 2. 新規資料を追加
      const materialsToInsert = materials.filter(m => m.isNew && !m.isDeleted)
      for (const material of materialsToInsert) {
        await supabase
          .from('e_learning_materials')
          .insert({
            content_id: savedContentId,
            title: material.title,
            file_url: material.file_url,
            file_size: material.file_size,
            display_order: material.display_order,
          })
      }

      // 3. 既存資料の更新（タイトルや順序）
      const materialsToUpdate = materials.filter(m => m.id && !m.isNew && !m.isDeleted)
      for (const material of materialsToUpdate) {
        await supabase
          .from('e_learning_materials')
          .update({
            title: material.title,
            display_order: material.display_order,
          })
          .eq('id', material.id)
      }

      alert(contentId ? 'コンテンツを更新しました' : 'コンテンツを作成しました')
      router.push('/admin/e-learning')
      router.refresh()
    } catch (error) {
      console.error('Error saving content:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  // 表示用の資料（削除フラグが立っていないもの）
  const visibleMaterials = materials.filter(m => !m.isDeleted)

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">基本情報</h2>

        {/* Title */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="動画のタイトルを入力"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="動画の説明を入力"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
          />
        </div>

        {/* Thumbnail */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            サムネイル画像
          </label>
          <div className="flex items-start gap-4">
            {formData.thumbnail_url ? (
              <div className="relative w-40 h-24 bg-gray-100 rounded-lg overflow-hidden">
                <Image
                  src={formData.thumbnail_url}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  sizes="160px"
                  unoptimized
                />
              </div>
            ) : (
              <div className="w-40 h-24 bg-gray-100 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">No image</span>
              </div>
            )}
            <div>
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
                {uploadingThumbnail ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    アップロード中...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4" />
                    画像を選択
                  </>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleThumbnailUpload}
                  className="hidden"
                  disabled={uploadingThumbnail}
                />
              </label>
              <p className="text-xs text-gray-500 mt-2">推奨: 16:9のアスペクト比</p>
            </div>
          </div>
        </div>

        {/* Video URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            動画URL (Google Drive) <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.video_url}
            onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
            placeholder="https://drive.google.com/file/d/..."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
            required
          />
          <p className="text-sm text-gray-500 mt-2">
            Google Driveにアップロードした動画のURLを入力してください
          </p>
        </div>

        {/* Category */}
        {categories.length > 0 && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <select
              value={formData.category_id}
              onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
            >
              <option value="">カテゴリなし</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Price Settings */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">料金設定</h2>

        {/* Free/Paid Toggle */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            料金タイプ
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_free: true, price: 0 })}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                formData.is_free
                  ? 'bg-green-100 text-green-800 ring-2 ring-green-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              無料
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, is_free: false })}
              className={`px-6 py-2 rounded-lg font-semibold text-sm transition-all ${
                !formData.is_free
                  ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-500'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              有料
            </button>
          </div>
        </div>

        {/* Price (only for paid content) */}
        {!formData.is_free && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              価格 (円)
            </label>
            <input
              type="number"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseInt(e.target.value) || 0 })}
              min="0"
              step="100"
              className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
            />
            <p className="text-sm text-gray-500 mt-2">
              ※Stripe連携は後日実装予定です
            </p>
          </div>
        )}
      </div>

      {/* Publication Settings */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">公開設定</h2>

        <div className="flex flex-wrap gap-6">
          {/* Published */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_published}
              onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">公開する</span>
          </label>

          {/* Featured */}
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.is_featured}
              onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600"
            />
            <span className="text-sm font-medium text-gray-700">注目コンテンツ</span>
          </label>
        </div>

        {/* Display Order */}
        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            表示順
          </label>
          <input
            type="number"
            value={formData.display_order}
            onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) || 0 })}
            min="0"
            className="w-full max-w-xs px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
          />
          <p className="text-sm text-gray-500 mt-2">
            数字が小さいほど先に表示されます
          </p>
        </div>
      </div>

      {/* Materials */}
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">資料 (PDF)</h2>

        {/* Material List */}
        {visibleMaterials.length > 0 && (
          <div className="space-y-3 mb-6">
            {visibleMaterials.map((material, index) => (
              <div key={material.id || index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <FileText className="h-5 w-5 text-red-500 flex-shrink-0" />
                <input
                  type="text"
                  value={material.title}
                  onChange={(e) => handleMaterialTitleChange(materials.indexOf(material), e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900 text-sm"
                />
                {material.file_size && (
                  <span className="text-xs text-gray-500">
                    {(material.file_size / 1024 / 1024).toFixed(1)}MB
                  </span>
                )}
                <a
                  href={material.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  プレビュー
                </a>
                <button
                  type="button"
                  onClick={() => handleRemoveMaterial(materials.indexOf(material))}
                  className="p-1.5 hover:bg-red-100 rounded-lg transition-colors text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors">
          {uploadingMaterial ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              アップロード中...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              PDFを追加
            </>
          )}
          <input
            type="file"
            accept=".pdf"
            onChange={handleMaterialUpload}
            className="hidden"
            disabled={uploadingMaterial}
          />
        </label>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end gap-4">
        <Link
          href="/admin/e-learning"
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
  )
}
