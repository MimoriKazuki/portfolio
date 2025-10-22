'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/app/lib/supabase/client'
import { Check, X, Loader2, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { ENTERPRISE_SERVICE_OPTIONS, INDIVIDUAL_SERVICE_OPTIONS, DEFAULT_ENTERPRISE_SERVICE, DEFAULT_INDIVIDUAL_SERVICE } from '@/app/lib/services/service-selector'
import { extractYouTubeVideoId, getYouTubeThumbnailUrl, isValidYouTubeUrl } from '@/app/lib/youtube-utils'

interface YouTubeVideoFormData {
  title: string
  description: string
  youtube_url: string
  youtube_video_id: string
  thumbnail_url: string
  featured: boolean
  display_order: number
  view_count: number
  enterprise_service: string
  individual_service: string
  // YouTube Data API v3 fields
  published_at?: string
  channel_title?: string
  channel_id?: string
  like_count?: number
  comment_count?: number
  duration?: string
  import_source?: 'manual' | 'api'
  last_synced_at?: string
}

interface YouTubeVideoFormProps {
  initialData?: Partial<YouTubeVideoFormData>
  videoId?: string
}

export default function YouTubeVideoForm({ initialData, videoId }: YouTubeVideoFormProps) {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(false)
  const [featuredCount, setFeaturedCount] = useState(0)
  const [urlError, setUrlError] = useState('')

  const [formData, setFormData] = useState<YouTubeVideoFormData>({
    title: initialData?.title || '',
    description: initialData?.description || '',
    youtube_url: initialData?.youtube_url || '',
    youtube_video_id: initialData?.youtube_video_id || '',
    thumbnail_url: initialData?.thumbnail_url || '',
    featured: initialData?.featured || false,
    display_order: initialData?.display_order || 0,
    view_count: initialData?.view_count || 0,
    enterprise_service: initialData?.enterprise_service || DEFAULT_ENTERPRISE_SERVICE,
    individual_service: initialData?.individual_service || DEFAULT_INDIVIDUAL_SERVICE,
  })

  // Featured video countを取得
  useEffect(() => {
    const fetchFeaturedCount = async () => {
      const { data, error } = await supabase
        .from('youtube_videos')
        .select('id')
        .eq('featured', true)
        .neq('id', videoId || '')

      if (!error) {
        setFeaturedCount(data?.length || 0)
      }
    }
    fetchFeaturedCount()
  }, [supabase, videoId])

  const handleFeaturedChange = (checked: boolean) => {
    // 3つまでの制限をチェック
    if (checked && featuredCount >= 3 && !initialData?.featured) {
      alert('注目動画は最大3つまでです。')
      return
    }
    setFormData({ ...formData, featured: checked })
  }

  // YouTube URLの変更を監視してサムネイルを自動更新
  const handleYouTubeUrlChange = (url: string) => {
    setFormData({ ...formData, youtube_url: url })

    if (!url) {
      setUrlError('')
      setFormData(prev => ({ ...prev, youtube_video_id: '', thumbnail_url: '' }))
      return
    }

    if (!isValidYouTubeUrl(url)) {
      setUrlError('有効なYouTube URLを入力してください')
      setFormData(prev => ({ ...prev, youtube_video_id: '', thumbnail_url: '' }))
      return
    }

    const videoId = extractYouTubeVideoId(url)
    if (videoId) {
      setUrlError('')
      const thumbnailUrl = getYouTubeThumbnailUrl(videoId)
      setFormData(prev => ({
        ...prev,
        youtube_video_id: videoId,
        thumbnail_url: thumbnailUrl
      }))
    } else {
      setUrlError('YouTube動画IDを抽出できませんでした')
    }
  }

  // YouTube APIから動画情報を自動取得
  const handleFetchVideoInfo = async () => {
    if (!formData.youtube_video_id) {
      alert('有効なYouTube URLを入力してください')
      return
    }

    setFetching(true)
    try {
      const response = await fetch(`/api/youtube-videos/fetch?videoId=${formData.youtube_video_id}`)

      if (!response.ok) {
        throw new Error('動画情報の取得に失敗しました')
      }

      const videoData = await response.json()

      setFormData(prev => ({
        ...prev,
        title: videoData.title,
        description: videoData.description,
        view_count: videoData.viewCount,
        // 新しいYouTube Data API v3フィールド
        published_at: videoData.publishedAt,
        channel_title: videoData.channelTitle,
        channel_id: videoData.channelId,
        like_count: videoData.likeCount,
        comment_count: videoData.commentCount,
        duration: videoData.duration,
        import_source: 'api',
        last_synced_at: new Date().toISOString(),
      } as any))

      alert('YouTube動画情報を自動取得しました')
    } catch (error) {
      console.error('Error fetching video info:', error)
      alert('動画情報の取得に失敗しました。URLを確認してください。')
    } finally {
      setFetching(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.youtube_video_id) {
      alert('有効なYouTube URLを入力してください')
      return
    }

    setLoading(true)

    try {
      const dataToSave = {
        title: formData.title,
        description: formData.description,
        youtube_url: formData.youtube_url,
        youtube_video_id: formData.youtube_video_id,
        thumbnail_url: formData.thumbnail_url,
        featured: formData.featured,
        enterprise_service: formData.enterprise_service,
        individual_service: formData.individual_service,
        updated_at: new Date().toISOString(),
        // YouTube Data API v3 fields
        published_at: formData.published_at || null,
        channel_title: formData.channel_title || null,
        channel_id: formData.channel_id || null,
        like_count: formData.like_count || 0,
        comment_count: formData.comment_count || 0,
        duration: formData.duration || null,
        import_source: formData.import_source || 'manual',
        last_synced_at: formData.last_synced_at || null,
      }

      if (videoId) {
        // Update existing video
        const { error } = await supabase
          .from('youtube_videos')
          .update(dataToSave)
          .eq('id', videoId)

        if (error) throw error
        alert('YouTubeを更新しました')
      } else {
        // Create new video
        const { error } = await supabase
          .from('youtube_videos')
          .insert(dataToSave)

        if (error) throw error
        alert('YouTubeを作成しました')
      }

      router.push('/admin/youtube-videos')
      router.refresh()
    } catch (error) {
      console.error('Error saving YouTube video:', error)
      alert('エラーが発生しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">基本情報</h2>

        {/* YouTube URL */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            YouTube URL <span className="text-red-500">*</span>
          </label>
          <input
            type="url"
            value={formData.youtube_url}
            onChange={(e) => handleYouTubeUrlChange(e.target.value)}
            placeholder="https://www.youtube.com/watch?v=..."
            className={`w-full px-4 py-3 border ${urlError ? 'border-red-500' : 'border-gray-300'} rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent`}
            required
          />
          {urlError && (
            <p className="mt-1 text-sm text-red-600">{urlError}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <p className="text-sm text-gray-500">
              YouTubeのURLを入力してください（例: https://www.youtube.com/watch?v=VIDEO_ID）
            </p>
            <button
              type="button"
              onClick={handleFetchVideoInfo}
              disabled={fetching || !formData.youtube_video_id}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {fetching ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  取得中...
                </>
              ) : (
                <>
                  <ExternalLink className="h-4 w-4" />
                  YouTube APIから自動取得
                </>
              )}
            </button>
          </div>
        </div>

        {/* サムネイルプレビュー */}
        {formData.thumbnail_url && (
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              サムネイルプレビュー
            </label>
            <div className="relative aspect-video w-full max-w-md bg-gray-100 rounded-lg overflow-hidden">
              <Image
                src={formData.thumbnail_url}
                alt="YouTube thumbnail"
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                unoptimized
              />
            </div>
            <p className="mt-1 text-sm text-gray-500">
              Video ID: {formData.youtube_video_id}
            </p>
          </div>
        )}

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
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Description */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            説明 <span className="text-red-500">*</span>
          </label>
          <textarea
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="動画の説明を入力"
            rows={5}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            required
          />
        </div>

        {/* Featured */}
        <div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.featured}
              onChange={(e) => handleFeaturedChange(e.target.checked)}
              disabled={!formData.featured && featuredCount >= 3}
              className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-600 disabled:opacity-50"
            />
            <span className="text-sm font-medium text-gray-700">
              注目動画
              {featuredCount >= 3 && !formData.featured && (
                <span className="text-xs text-red-500 ml-2">(上限達成: {featuredCount}/3)</span>
              )}
            </span>
          </label>
          <p className="text-xs text-gray-600 mt-1">
            現在の注目動画: {featuredCount}/3
          </p>
        </div>

        {/* サービスセレクター */}
        <div className="bg-gray-50 p-4 rounded-lg mt-6">
          <h3 className="text-lg font-medium mb-4 text-gray-800">右サイドバー表示サービス設定</h3>
          <p className="text-sm text-gray-600 mb-4">
            このYouTube詳細ページの右サイドバーに表示するサービスを選択してください。
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* 企業向けサービス */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                企業向けサービス
              </label>
              <div className="relative">
                <select
                  value={formData.enterprise_service}
                  onChange={(e) => setFormData({ ...formData, enterprise_service: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {ENTERPRISE_SERVICE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 個人向けサービス */}
            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                個人向けサービス
              </label>
              <div className="relative">
                <select
                  value={formData.individual_service}
                  onChange={(e) => setFormData({ ...formData, individual_service: e.target.value })}
                  className="w-full appearance-none px-3 py-2 pr-10 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                >
                  {INDIVIDUAL_SERVICE_OPTIONS.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
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
        </div>
      </div>

      {/* Submit buttons */}
      <div className="flex justify-end gap-4">
        <Link
          href="/admin/youtube-videos"
          className="flex items-center gap-2 px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 rounded-lg transition-colors"
        >
          <X className="h-5 w-5" />
          キャンセル
        </Link>
        <button
          type="submit"
          disabled={loading || !formData.youtube_video_id}
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
              {videoId ? '保存する' : '保存する'}
            </>
          )}
        </button>
      </div>
    </form>
  )
}
