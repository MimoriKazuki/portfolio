'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Plus, Edit, Trash2, FolderOpen, Search, Eye, Download, Loader2 } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import DeleteYouTubeVideoButton from './DeleteYouTubeVideoButton'
import { YouTubeVideo } from '@/app/types'
import { formatDuration } from '@/app/lib/youtube-api'

interface YouTubeVideosClientProps {
  videos: YouTubeVideo[]
}

export default function YouTubeVideosClient({ videos }: YouTubeVideosClientProps) {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [importing, setImporting] = useState(false)

  const filteredVideos = useMemo(() => {
    return videos.filter(video => {
      const matchesSearch = searchQuery === '' ||
        video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        video.description.toLowerCase().includes(searchQuery.toLowerCase())

      return matchesSearch
    })
  }, [videos, searchQuery])

  // チャンネルから動画を自動取得
  const handleImportFromChannel = async () => {
    if (importing) return

    const isInitialImport = !videos || videos.length === 0
    const confirmMessage = isInitialImport
      ? 'チャンネルから全ての動画を取得しますか？\n（既存の動画はスキップされます）'
      : 'チャンネルから最新10件の動画を取得しますか？\n（既存の動画はスキップされます）'

    const confirmed = confirm(confirmMessage)
    if (!confirmed) return

    setImporting(true)
    try {
      const response = await fetch('/api/youtube-videos/import', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          maxResults: 10,
          fetchAll: isInitialImport
        }),
      })

      if (!response.ok) {
        throw new Error('インポートに失敗しました')
      }

      const result = await response.json()
      alert(result.message)

      // ページをリフレッシュして新しい動画を表示
      router.refresh()
    } catch (error) {
      console.error('Error importing videos:', error)
      alert('動画のインポートに失敗しました')
    } finally {
      setImporting(false)
    }
  }

  return (
    <div className="w-full">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">YouTube管理</h1>

      {!videos || videos.length === 0 ? (
        <div className="bg-white rounded-lg p-16 text-center border border-gray-200">
          <FolderOpen className="h-20 w-20 mx-auto mb-6 text-gray-400" />
          <h2 className="text-2xl font-bold mb-4 text-gray-900">YouTubeがありません</h2>
          <p className="text-gray-600 mb-8">最初のYouTubeを追加しましょう</p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/admin/youtube-videos/new"
              className="inline-flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-6 py-3 rounded-lg transition-colors text-lg"
            >
              <Plus className="h-6 w-6" />
              YouTubeを追加
            </Link>
            <button
              onClick={handleImportFromChannel}
              disabled={importing}
              className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg transition-colors text-lg disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {importing ? (
                <>
                  <Loader2 className="h-6 w-6 animate-spin" />
                  取得中...
                </>
              ) : (
                <>
                  <Download className="h-6 w-6" />
                  チャンネルから自動取得
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-portfolio-blue">{videos.length}</div>
              <div className="text-sm text-gray-600">総動画数</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-green-600">
                {videos.filter(v => v.featured).length}
              </div>
              <div className="text-sm text-gray-600">注目動画</div>
            </div>
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
              <div className="text-3xl font-bold text-orange-600">
                {videos.length - videos.filter(v => v.featured).length}
              </div>
              <div className="text-sm text-gray-600">通常動画</div>
            </div>
          </div>

          {/* Action bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Link
                href="/admin/youtube-videos/new"
                className="flex items-center gap-2 bg-portfolio-blue hover:bg-portfolio-blue-dark text-white px-4 py-2 rounded-lg transition-colors"
              >
                <Plus className="h-5 w-5" />
                新規追加
              </Link>
              <button
                onClick={handleImportFromChannel}
                disabled={importing}
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {importing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    取得中...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5" />
                    チャンネルから自動取得
                  </>
                )}
              </button>
            </div>

            <div className="flex items-center gap-4 flex-1 justify-end">
              {/* Search box */}
              <div className="relative">
                <input
                  type="text"
                  placeholder="検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-gray-900 w-64"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              </div>
            </div>
          </div>

          {/* Videos Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="w-32 text-center px-4 py-3 text-xs font-medium text-gray-700">画像</th>
                  <th className="text-center px-4 py-3 text-xs font-medium text-gray-700 min-w-[200px]">タイトル</th>
                  <th className="w-20 text-center px-4 py-3 text-xs font-medium text-gray-700">長さ</th>
                  <th className="w-32 text-center px-4 py-3 text-xs font-medium text-gray-700">公開日</th>
                  <th className="w-36 text-center px-4 py-3 text-xs font-medium text-gray-700">チャンネル</th>
                  <th className="w-28 text-center px-4 py-3 text-xs font-medium text-gray-700">種別</th>
                  <th className="w-20 text-center px-4 py-3 text-xs font-medium text-gray-700">注目</th>
                  <th className="w-28 text-center px-4 py-3 text-xs font-medium text-gray-700">アクション</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredVideos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                      検索結果が見つかりませんでした
                    </td>
                  </tr>
                ) : (
                  filteredVideos.map((video) => (
                    <tr key={video.id} className="hover:bg-gray-50 transition-colors">
                      {/* サムネイル */}
                      <td className="px-4 py-3">
                        <div className="flex justify-center">
                          {video.thumbnail_url ? (
                            <div className="relative w-16 h-10 flex-shrink-0">
                              <Image
                                src={video.thumbnail_url}
                                alt={video.title}
                                fill
                                className="object-cover rounded"
                                sizes="64px"
                                unoptimized
                              />
                            </div>
                          ) : (
                            <div className="w-16 h-10 bg-gray-100 rounded flex items-center justify-center">
                              <FolderOpen className="w-4 h-4 text-gray-400" />
                            </div>
                          )}
                        </div>
                      </td>
                      {/* タイトル */}
                      <td className="px-4 py-3">
                        <div className="text-left">
                          <h3 className="font-medium text-sm text-gray-900 line-clamp-2">
                            {video.title}
                          </h3>
                        </div>
                      </td>
                      {/* 動画の長さ */}
                      <td className="px-4 py-3 text-center text-sm text-gray-700">
                        {video.duration ? formatDuration(video.duration) : '-'}
                      </td>
                      {/* 公開日 */}
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        {/* 外部チャンネルはシステム登録日、自社チャンネルはYouTube公開日 */}
                        {!video.is_own_channel ? (
                          new Date(video.created_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        ) : video.published_at ? (
                          new Date(video.published_at).toLocaleDateString('ja-JP', {
                            year: 'numeric',
                            month: '2-digit',
                            day: '2-digit'
                          })
                        ) : '-'}
                      </td>
                      {/* チャンネル名 */}
                      <td className="px-4 py-3 text-center text-xs text-gray-600">
                        <span className="truncate">{video.channel_title || '-'}</span>
                      </td>
                      {/* 種別 */}
                      <td className="px-4 py-3 text-center">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold whitespace-nowrap ${
                          video.is_own_channel
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {video.is_own_channel ? '自社' : '外部'}
                        </span>
                      </td>
                      {/* 注目 */}
                      <td className="px-4 py-3 text-center text-sm">
                        <span className={video.featured ? 'text-green-600 font-medium' : 'text-gray-600'}>
                          {video.featured ? 'ON' : 'OFF'}
                        </span>
                      </td>
                      {/* アクション */}
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-1">
                          <Link
                            href={`/youtube-videos/${video.id}`}
                            target="_blank"
                            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors text-gray-600"
                            title="詳細"
                          >
                            <Eye className="h-4 w-4" />
                          </Link>
                          <Link
                            href={`/admin/youtube-videos/${video.id}/edit`}
                            className="p-1.5 hover:bg-blue-100 rounded-lg transition-colors text-blue-600"
                            title="編集"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                          <DeleteYouTubeVideoButton videoId={video.id} videoTitle={video.title} />
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
