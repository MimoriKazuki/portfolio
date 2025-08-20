'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Upload, Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

interface DocumentFormData {
  title: string
  description?: string
  file_url?: string
  thumbnail?: string
  category?: string
  tags?: string[]
  is_active: boolean
}

interface DocumentFormProps {
  initialData?: Partial<DocumentFormData>
  documentId?: string
}

export default function DocumentForm({ initialData, documentId }: DocumentFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string>(initialData?.file_url || '')
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null)
  const [thumbnailPreview, setThumbnailPreview] = useState<string>(initialData?.thumbnail || '')
  const [dragOverThumbnail, setDragOverThumbnail] = useState(false)
  const [dragOverPdf, setDragOverPdf] = useState(false)
  
  const [formData, setFormData] = useState<DocumentFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    file_url: initialData?.file_url || '',
    thumbnail: initialData?.thumbnail || '',
    category: initialData?.category || 'サービス紹介',
    tags: initialData?.tags || [],
    is_active: initialData?.is_active ?? true,
  })
  const [tagInput, setTagInput] = useState('')

  const handlePdfChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate that it's a PDF
    if (file.type !== 'application/pdf') {
      alert('PDFファイルのみアップロード可能です。')
      return
    }

    setPdfFile(file)
  }

  const uploadPdf = async (file: File): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${fileName}`

    const { error: uploadError, data } = await supabase.storage
      .from('documents')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('documents')
      .getPublicUrl(filePath)

    return publicUrl
  }

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
      .from('document-thumbnails')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    const { data: { publicUrl } } = supabase.storage
      .from('document-thumbnails')
      .getPublicUrl(filePath)

    return publicUrl
  }

  const addTag = () => {
    if (tagInput.trim() && !formData.tags?.includes(tagInput.trim())) {
      setFormData({
        ...formData,
        tags: [...(formData.tags || []), tagInput.trim()]
      })
      setTagInput('')
    }
  }

  const removeTag = (tag: string) => {
    setFormData({
      ...formData,
      tags: formData.tags?.filter(t => t !== tag) || []
    })
  }

  const handleThumbnailDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverThumbnail(false)
    
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

  const handlePdfDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverPdf(false)
    
    const files = Array.from(e.dataTransfer.files)
    const pdfFile = files.find(file => file.type === 'application/pdf')
    
    if (pdfFile) {
      setPdfFile(pdfFile)
    }
  }

  const handleThumbnailDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverThumbnail(true)
  }

  const handleThumbnailDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverThumbnail(false)
  }

  const handlePdfDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverPdf(true)
  }

  const handlePdfDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setDragOverPdf(false)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let fileUrl = formData.file_url
      let thumbnailUrl = formData.thumbnail

      // Upload new PDF if selected
      if (pdfFile) {
        setUploading(true)
        fileUrl = await uploadPdf(pdfFile)
        setUploading(false)
      }

      // Upload new thumbnail if selected
      if (thumbnailFile) {
        setUploading(true)
        thumbnailUrl = await uploadThumbnail(thumbnailFile)
        setUploading(false)
      }

      const documentData = {
        title: formData.title,
        description: formData.description,
        file_url: fileUrl,
        thumbnail: thumbnailUrl,
        is_active: true,
      }

      if (documentId) {
        // Update existing document
        const { error } = await supabase
          .from('documents')
          .update(documentData)
          .eq('id', documentId)

        if (error) throw error
      } else {
        // Create new document
        const { error } = await supabase
          .from('documents')
          .insert([documentData])

        if (error) throw error
      }

      console.log('Document saved successfully')
      router.push('/admin/documents')
      router.refresh()
    } catch (error: unknown) {
      console.error('Error saving document:', error)
      alert('Error saving document: ' + (error instanceof Error ? error.message : 'Unknown error'))
    } finally {
      setLoading(false)
      setUploading(false)
    }
  }

  return (
    <div className="bg-white rounded-lg p-4">
      <form onSubmit={handleSubmit} className="space-y-6">
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
                  dragOverThumbnail 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                onDrop={handleThumbnailDrop}
                onDragOver={handleThumbnailDragOver}
                onDragLeave={handleThumbnailDragLeave}
                onClick={() => document.getElementById('document-thumbnail-input')?.click()}
              >
                <span className="text-gray-500">ここにファイルをドラッグ&ドロップ</span>
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-block">
                <input
                  id="document-thumbnail-input"
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
              {thumbnailFile && (
                <span className="ml-3 text-sm text-gray-600">
                  {thumbnailFile.name}
                </span>
              )}
            </div>
            {uploading && (
              <p className="text-sm text-blue-600">アップロード中...</p>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            PDFファイル <span className="text-red-500">*</span>
          </label>
          <div className="space-y-4">
            {pdfUrl && !pdfFile ? (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-700 font-medium mb-1">現在のファイル:</p>
                <a 
                  href={pdfUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-portfolio-blue hover:text-portfolio-blue-dark underline text-sm"
                >
                  PDFを表示
                </a>
              </div>
            ) : (
              <div 
                className={`w-80 aspect-video border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition-colors ${
                  dragOverPdf 
                    ? 'bg-blue-50 border-blue-300' 
                    : 'bg-gray-100 border-gray-300 hover:bg-gray-200'
                }`}
                onDrop={handlePdfDrop}
                onDragOver={handlePdfDragOver}
                onDragLeave={handlePdfDragLeave}
                onClick={() => document.getElementById('document-pdf-input')?.click()}
              >
                <span className="text-gray-500">ここにファイルをドラッグ&ドロップ</span>
              </div>
            )}
            <div>
              <label className="cursor-pointer inline-block">
                <input
                  id="document-pdf-input"
                  type="file"
                  accept="application/pdf"
                  onChange={handlePdfChange}
                  className="hidden"
                  required={!pdfUrl}
                />
                <div className="flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors">
                  <Upload className="h-5 w-5" />
                  {pdfFile ? 'PDFを変更' : 'PDFを選択'}
                </div>
              </label>
              {pdfFile && (
                <span className="ml-3 text-sm text-gray-600">
                  {pdfFile.name}
                </span>
              )}
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
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-3 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-portfolio-blue text-gray-900"
            rows={4}
            placeholder="資料の内容について簡潔に説明してください"
          />
        </div>

        <div className="flex justify-end gap-4">
          <Link
            href="/admin/documents"
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