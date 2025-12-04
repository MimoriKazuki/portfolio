'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Loader2, Upload } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ELearningCategory, ELearningMaterial } from '@/app/types'

interface ELearningFormData {
  title: string
  description: string
  thumbnail_url: string
  video_url: string
  category_id: string
  is_free: boolean
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
    category_id: initialData?.category_id || '',
    is_free: initialData?.is_free ?? true,
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

      setMaterials(prev => [
        ...prev,
        {
          title: file.name.replace(/\.[^/.]+$/, ''),
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

  // 資料を削除
  const handleRemoveMaterial = (index: number) => {
    setMaterials(prev => {
      const updated = [...prev]
      if (updated[index].id) {
        updated[index].isDeleted = true
      } else {
        updated.splice(index, 1)
      }
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
        is_published: formData.is_published,
        is_featured: formData.is_featured,
        updated_at: new Date().toISOString(),
      }

      let savedContentId = contentId

      if (contentId) {
        const { error } = await supabase
          .from('e_learning_contents')
          .update(dataToSave)
          .eq('id', contentId)

        if (error) throw error
      } else {
        const { data, error } = await supabase
          .from('e_learning_contents')
          .insert(dataToSave)
          .select('id')
          .single()

        if (error) throw error
        savedContentId = data.id
      }

      // 資料の保存処理
      const materialsToDelete = materials.filter(m => m.isDeleted && m.id)
      for (const material of materialsToDelete) {
        await supabase
          .from('e_learning_materials')
          .delete()
          .eq('id', material.id)
      }

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

  const visibleMaterials = materials.filter(m => !m.isDeleted)

  return (
    <div className="bg-white rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* タイトルとカテゴリ */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              タイトル <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="動画のタイトルを入力"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              カテゴリ
            </label>
            <div className="relative">
              <select
                value={formData.category_id}
                onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                className="w-full appearance-none px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
              >
                <option value="">カテゴリなし</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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

        {/* 説明文 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="動画の説明を入力"
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
          />
        </div>

        {/* サムネイル（左）と動画URL・設定（右）の左右分割 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 左: サムネイル画像 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              サムネイル画像
            </label>
            {formData.thumbnail_url ? (
              <div className="relative aspect-video w-full bg-gray-100 rounded-lg overflow-hidden mb-3">
                <Image
                  src={formData.thumbnail_url}
                  alt="Thumbnail"
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  unoptimized
                />
              </div>
            ) : (
              <div className="aspect-video w-full bg-gray-100 rounded-lg flex items-center justify-center mb-3">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            <div className="flex items-center gap-3">
              <label className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg cursor-pointer transition-colors text-sm">
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
              <p className="text-xs text-gray-500">推奨: 16:9</p>
            </div>
          </div>

          {/* 右: 動画URLと設定 */}
          <div className="space-y-4">
            {/* 動画URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                動画URL (Google Drive) <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://drive.google.com/file/d/..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-portfolio-blue focus:border-transparent text-gray-900"
                required
              />
              <p className="text-xs text-gray-500 mt-1">
                Google Driveの動画URLを入力
              </p>
            </div>

            {/* 料金タイプ */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                料金タイプ
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_free: true })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
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
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    !formData.is_free
                      ? 'bg-orange-100 text-orange-800 ring-2 ring-orange-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  有料
                </button>
              </div>
            </div>

            {/* 公開設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                公開設定
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_published: false })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    !formData.is_published
                      ? 'bg-gray-300 text-gray-700 ring-2 ring-gray-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  非公開
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_published: true })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    formData.is_published
                      ? 'bg-blue-100 text-blue-800 ring-2 ring-blue-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  公開
                </button>
              </div>
            </div>

            {/* おすすめ設定 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                おすすめに表示
              </label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_featured: false })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    !formData.is_featured
                      ? 'bg-gray-300 text-gray-700 ring-2 ring-gray-400'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  OFF
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, is_featured: true })}
                  className={`flex-1 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
                    formData.is_featured
                      ? 'bg-purple-100 text-purple-800 ring-2 ring-purple-500'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  ON
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* 資料（PDF） */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            資料 (PDF)
          </label>

          <div className="space-y-4">
            {visibleMaterials.length > 0 ? (
              <div className="space-y-3">
                {visibleMaterials.map((material, index) => (
                  <div key={material.id || index} className="space-y-3">
                    <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-between">
                      <span className="text-sm text-gray-700">
                        {material.title || 'PDFファイル'}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveMaterial(materials.indexOf(material))}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="h-5 w-5" />
                      </button>
                    </div>
                    <a
                      href={material.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-portfolio-blue hover:text-portfolio-blue-dark underline text-sm"
                    >
                      PDFを表示
                    </a>
                  </div>
                ))}
              </div>
            ) : (
              <div>
                <label className="cursor-pointer inline-block">
                  <input
                    type="file"
                    accept=".pdf"
                    onChange={handleMaterialUpload}
                    className="hidden"
                    disabled={uploadingMaterial}
                  />
                  <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                    {uploadingMaterial ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        アップロード中...
                      </>
                    ) : (
                      <>
                        <Upload className="h-5 w-5" />
                        PDFファイルを選択
                      </>
                    )}
                  </div>
                </label>
              </div>
            )}
            {uploadingMaterial && (
              <p className="text-sm text-blue-600">アップロード中...</p>
            )}
          </div>
        </div>

        {/* 送信ボタン */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-200">
          <Link
            href="/admin/e-learning"
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
          >
            <X className="h-5 w-5" />
            キャンセル
          </Link>
          <button
            type="submit"
            disabled={loading}
            className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
