/**
 * YouTube utility functions
 * YouTubeのURL処理やサムネイル取得などのユーティリティ関数
 */

/**
 * Extract YouTube video ID from URL
 * YouTubeのURLから動画IDを抽出
 *
 * Supported formats:
 * - https://www.youtube.com/watch?v=VIDEO_ID
 * - https://youtu.be/VIDEO_ID
 * - https://www.youtube.com/embed/VIDEO_ID
 * - https://www.youtube.com/v/VIDEO_ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url) return null

  try {
    const urlObj = new URL(url)

    // youtube.com/watch?v=VIDEO_ID
    if (urlObj.hostname.includes('youtube.com') && urlObj.searchParams.has('v')) {
      return urlObj.searchParams.get('v')
    }

    // youtu.be/VIDEO_ID
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1)
    }

    // youtube.com/embed/VIDEO_ID or youtube.com/v/VIDEO_ID
    if (urlObj.hostname.includes('youtube.com')) {
      const match = urlObj.pathname.match(/\/(embed|v)\/([^/?]+)/)
      if (match) {
        return match[2]
      }
    }

    return null
  } catch (error) {
    console.error('Invalid URL:', error)
    return null
  }
}

/**
 * Get YouTube thumbnail URL from video ID
 * 動画IDからYouTubeサムネイルURLを取得
 *
 * Quality options:
 * - maxresdefault: 1280x720 (best quality, may not exist for all videos)
 * - sddefault: 640x480 (standard definition)
 * - hqdefault: 480x360 (high quality)
 * - mqdefault: 320x180 (medium quality)
 * - default: 120x90 (default quality)
 */
export function getYouTubeThumbnailUrl(
  videoId: string,
  quality: 'maxresdefault' | 'sddefault' | 'hqdefault' | 'mqdefault' | 'default' = 'hqdefault'
): string {
  return `https://img.youtube.com/vi/${videoId}/${quality}.jpg`
}

/**
 * Get YouTube embed URL from video ID
 * 動画IDからYouTube埋め込みURLを取得
 */
export function getYouTubeEmbedUrl(videoId: string): string {
  return `https://www.youtube.com/embed/${videoId}`
}

/**
 * Validate YouTube URL
 * YouTubeのURLが有効かどうかを検証
 */
export function isValidYouTubeUrl(url: string): boolean {
  return extractYouTubeVideoId(url) !== null
}

/**
 * Process YouTube URL and extract necessary information
 * YouTubeのURLを処理して必要な情報を抽出
 */
export function processYouTubeUrl(url: string): {
  videoId: string
  thumbnailUrl: string
  embedUrl: string
} | null {
  const videoId = extractYouTubeVideoId(url)

  if (!videoId) return null

  return {
    videoId,
    thumbnailUrl: getYouTubeThumbnailUrl(videoId),
    embedUrl: getYouTubeEmbedUrl(videoId)
  }
}
