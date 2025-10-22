/**
 * YouTube Data API v3 Client
 *
 * このファイルはYouTube Data APIとの通信を担当します。
 * 動画情報の取得、チャンネル情報の取得などの機能を提供します。
 */

const YOUTUBE_API_BASE_URL = 'https://www.googleapis.com/youtube/v3'

export interface YouTubeVideoData {
  videoId: string
  title: string
  description: string
  publishedAt: string
  channelTitle: string
  channelId: string
  thumbnailUrl: string
  viewCount: number
  likeCount: number
  commentCount: number
  duration: string
}

/**
 * YouTube動画IDからフル動画情報を取得
 */
export async function fetchYouTubeVideoData(videoId: string): Promise<YouTubeVideoData | null> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured')
  }

  try {
    const url = new URL(`${YOUTUBE_API_BASE_URL}/videos`)
    url.searchParams.set('part', 'snippet,statistics,contentDetails')
    url.searchParams.set('id', videoId)
    url.searchParams.set('key', apiKey)

    const response = await fetch(url.toString())

    if (!response.ok) {
      throw new Error(`YouTube API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    if (!data.items || data.items.length === 0) {
      return null
    }

    const video = data.items[0]
    const snippet = video.snippet
    const statistics = video.statistics
    const contentDetails = video.contentDetails

    return {
      videoId,
      title: snippet.title,
      description: snippet.description,
      publishedAt: snippet.publishedAt,
      channelTitle: snippet.channelTitle,
      channelId: snippet.channelId,
      thumbnailUrl: snippet.thumbnails?.maxres?.url ||
                    snippet.thumbnails?.high?.url ||
                    snippet.thumbnails?.medium?.url ||
                    snippet.thumbnails?.default?.url,
      viewCount: parseInt(statistics.viewCount || '0', 10),
      likeCount: parseInt(statistics.likeCount || '0', 10),
      commentCount: parseInt(statistics.commentCount || '0', 10),
      duration: contentDetails.duration
    }
  } catch (error) {
    console.error('Error fetching YouTube video data:', error)
    throw error
  }
}

/**
 * チャンネルIDから最新動画を取得
 */
export async function fetchChannelVideos(channelId: string, maxResults: number = 10): Promise<YouTubeVideoData[]> {
  const apiKey = process.env.YOUTUBE_API_KEY

  if (!apiKey) {
    throw new Error('YOUTUBE_API_KEY is not configured')
  }

  try {
    // まず、チャンネルの最新動画IDリストを取得
    const searchUrl = new URL(`${YOUTUBE_API_BASE_URL}/search`)
    searchUrl.searchParams.set('part', 'id')
    searchUrl.searchParams.set('channelId', channelId)
    searchUrl.searchParams.set('order', 'date')
    searchUrl.searchParams.set('type', 'video')
    searchUrl.searchParams.set('maxResults', maxResults.toString())
    searchUrl.searchParams.set('key', apiKey)

    const searchResponse = await fetch(searchUrl.toString())

    if (!searchResponse.ok) {
      throw new Error(`YouTube API error: ${searchResponse.status} ${searchResponse.statusText}`)
    }

    const searchData = await searchResponse.json()

    if (!searchData.items || searchData.items.length === 0) {
      return []
    }

    // 動画IDのリストを取得
    const videoIds = searchData.items.map((item: any) => item.id.videoId).join(',')

    // 各動画の詳細情報を取得
    const videosUrl = new URL(`${YOUTUBE_API_BASE_URL}/videos`)
    videosUrl.searchParams.set('part', 'snippet,statistics,contentDetails')
    videosUrl.searchParams.set('id', videoIds)
    videosUrl.searchParams.set('key', apiKey)

    const videosResponse = await fetch(videosUrl.toString())

    if (!videosResponse.ok) {
      throw new Error(`YouTube API error: ${videosResponse.status} ${videosResponse.statusText}`)
    }

    const videosData = await videosResponse.json()

    return videosData.items.map((video: any) => {
      const snippet = video.snippet
      const statistics = video.statistics
      const contentDetails = video.contentDetails

      return {
        videoId: video.id,
        title: snippet.title,
        description: snippet.description,
        publishedAt: snippet.publishedAt,
        channelTitle: snippet.channelTitle,
        channelId: snippet.channelId,
        thumbnailUrl: snippet.thumbnails?.maxres?.url ||
                      snippet.thumbnails?.high?.url ||
                      snippet.thumbnails?.medium?.url ||
                      snippet.thumbnails?.default?.url,
        viewCount: parseInt(statistics.viewCount || '0', 10),
        likeCount: parseInt(statistics.likeCount || '0', 10),
        commentCount: parseInt(statistics.commentCount || '0', 10),
        duration: contentDetails.duration
      }
    })
  } catch (error) {
    console.error('Error fetching channel videos:', error)
    throw error
  }
}

/**
 * ISO 8601形式の動画の長さ（PT1H2M10Sなど）を人間が読める形式に変換
 */
export function formatDuration(duration: string): string {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/)

  if (!match) {
    return '不明'
  }

  const hours = match[1] ? parseInt(match[1], 10) : 0
  const minutes = match[2] ? parseInt(match[2], 10) : 0
  const seconds = match[3] ? parseInt(match[3], 10) : 0

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
