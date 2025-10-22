import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'
import { fetchYouTubeVideoData } from '@/app/lib/youtube-api'

/**
 * 既存の動画の統計情報をYouTube APIから更新するAPIエンドポイント
 * POST /api/youtube-videos/sync
 * Body: { videoId: string } または { syncAll: boolean }
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { videoId, syncAll } = body

    const supabase = await createClient()

    if (syncAll) {
      // すべての動画を同期
      const { data: videos, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('id, youtube_video_id')
        .order('created_at', { ascending: false })

      if (fetchError) {
        throw fetchError
      }

      if (!videos || videos.length === 0) {
        return NextResponse.json({ message: '同期する動画がありません' })
      }

      let successCount = 0
      let errorCount = 0

      for (const video of videos) {
        try {
          const youtubeData = await fetchYouTubeVideoData(video.youtube_video_id)

          if (youtubeData) {
            const { error: updateError } = await supabase
              .from('youtube_videos')
              .update({
                view_count: youtubeData.viewCount,
                like_count: youtubeData.likeCount,
                comment_count: youtubeData.commentCount,
                last_synced_at: new Date().toISOString()
              })
              .eq('id', video.id)

            if (updateError) {
              console.error(`Error updating video ${video.id}:`, updateError)
              errorCount++
            } else {
              successCount++
            }
          }
        } catch (error) {
          console.error(`Error syncing video ${video.id}:`, error)
          errorCount++
        }
      }

      return NextResponse.json({
        message: `${successCount}件の動画を同期しました（エラー: ${errorCount}件）`,
        successCount,
        errorCount
      })
    } else if (videoId) {
      // 特定の動画を同期
      const { data: video, error: fetchError } = await supabase
        .from('youtube_videos')
        .select('id, youtube_video_id')
        .eq('id', videoId)
        .single()

      if (fetchError || !video) {
        return NextResponse.json(
          { error: '動画が見つかりませんでした' },
          { status: 404 }
        )
      }

      const youtubeData = await fetchYouTubeVideoData(video.youtube_video_id)

      if (!youtubeData) {
        return NextResponse.json(
          { error: 'YouTube動画データの取得に失敗しました' },
          { status: 404 }
        )
      }

      const { error: updateError } = await supabase
        .from('youtube_videos')
        .update({
          view_count: youtubeData.viewCount,
          like_count: youtubeData.likeCount,
          comment_count: youtubeData.commentCount,
          last_synced_at: new Date().toISOString()
        })
        .eq('id', videoId)

      if (updateError) {
        throw updateError
      }

      return NextResponse.json({
        message: '動画を同期しました',
        data: youtubeData
      })
    } else {
      return NextResponse.json(
        { error: 'videoIdまたはsyncAllパラメータが必要です' },
        { status: 400 }
      )
    }
  } catch (error) {
    console.error('Error syncing YouTube video:', error)
    return NextResponse.json(
      { error: '動画の同期に失敗しました' },
      { status: 500 }
    )
  }
}
