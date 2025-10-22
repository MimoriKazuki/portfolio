import { NextResponse } from 'next/server'
import { fetchYouTubeVideoData } from '@/app/lib/youtube-api'

/**
 * YouTube動画IDから動画情報を取得するAPIエンドポイント
 * GET /api/youtube-videos/fetch?videoId=VIDEO_ID
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const videoId = searchParams.get('videoId')

    if (!videoId) {
      return NextResponse.json(
        { error: '動画IDが指定されていません' },
        { status: 400 }
      )
    }

    const videoData = await fetchYouTubeVideoData(videoId)

    if (!videoData) {
      return NextResponse.json(
        { error: '動画が見つかりませんでした' },
        { status: 404 }
      )
    }

    return NextResponse.json(videoData)
  } catch (error) {
    console.error('Error fetching YouTube video:', error)
    return NextResponse.json(
      { error: 'YouTube動画の取得に失敗しました' },
      { status: 500 }
    )
  }
}
