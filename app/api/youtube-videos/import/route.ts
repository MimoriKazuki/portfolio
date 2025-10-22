import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { fetchChannelVideos } from '@/app/lib/youtube-api'
import { DEFAULT_ENTERPRISE_SERVICE, DEFAULT_INDIVIDUAL_SERVICE } from '@/app/lib/services/service-selector'

/**
 * チャンネルから最新動画を取得してデータベースにインポートするAPIエンドポイント
 * POST /api/youtube-videos/import
 * Body: { maxResults?: number } (optional, default: 10)
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { maxResults = 10 } = body

    const channelId = process.env.YOUTUBE_CHANNEL_ID

    if (!channelId) {
      return NextResponse.json(
        { error: 'YOUTUBE_CHANNEL_IDが設定されていません' },
        { status: 500 }
      )
    }

    const supabase = await createClient()

    // チャンネルから最新動画を取得
    const videos = await fetchChannelVideos(channelId, maxResults)

    if (!videos || videos.length === 0) {
      return NextResponse.json({
        message: 'チャンネルに動画が見つかりませんでした',
        imported: 0,
        skipped: 0
      })
    }

    // 既存の動画IDを取得
    const existingVideoIds = new Set<string>()
    const { data: existingVideos } = await supabase
      .from('youtube_videos')
      .select('youtube_video_id')

    if (existingVideos) {
      existingVideos.forEach(video => {
        existingVideoIds.add(video.youtube_video_id)
      })
    }

    // 新しい動画のみをフィルタリング
    const newVideos = videos.filter(video => !existingVideoIds.has(video.videoId))

    if (newVideos.length === 0) {
      return NextResponse.json({
        message: 'すべての動画が既に登録されています',
        imported: 0,
        skipped: videos.length
      })
    }

    // 新しい動画をデータベースに追加
    const videosToInsert = newVideos.map(video => ({
      title: video.title,
      description: video.description,
      youtube_url: `https://www.youtube.com/watch?v=${video.videoId}`,
      youtube_video_id: video.videoId,
      thumbnail_url: video.thumbnailUrl,
      featured: false,
      display_order: 0,
      view_count: video.viewCount,
      enterprise_service: DEFAULT_ENTERPRISE_SERVICE,
      individual_service: DEFAULT_INDIVIDUAL_SERVICE,
      // YouTube Data API v3 fields
      published_at: video.publishedAt,
      channel_title: video.channelTitle,
      channel_id: video.channelId,
      like_count: video.likeCount,
      comment_count: video.commentCount,
      duration: video.duration,
      import_source: 'api',
      last_synced_at: new Date().toISOString(),
    }))

    const { error: insertError } = await supabase
      .from('youtube_videos')
      .insert(videosToInsert)

    if (insertError) {
      throw insertError
    }

    return NextResponse.json({
      message: `${newVideos.length}件の新しい動画をインポートしました`,
      imported: newVideos.length,
      skipped: videos.length - newVideos.length,
      channelTitle: videos[0]?.channelTitle
    })
  } catch (error) {
    console.error('Error importing YouTube videos:', error)
    return NextResponse.json(
      { error: '動画のインポートに失敗しました' },
      { status: 500 }
    )
  }
}
