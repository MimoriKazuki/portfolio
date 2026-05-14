import * as React from 'react'

/**
 * B005 コース内動画プレイヤー（Server Component）。
 *
 * YouTube / Google Drive / その他 URL を埋め込み iframe で再生する。
 * 既存 ELearningDetailClient.tsx と同じ判別ロジックを踏襲し、複雑な再生制御は持たない（最小実装）。
 */

function getYouTubeId(url: string): string | null {
  const regex =
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/live\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

function getGoogleDriveEmbedUrl(url: string): string | null {
  const regex = /\/file\/d\/([a-zA-Z0-9_-]+)/
  const match = url.match(regex)
  if (match) {
    const fileId = match[1]
    return `https://drive.google.com/file/d/${fileId}/preview`
  }
  return null
}

export interface CourseVideoPlayerProps {
  videoUrl: string
  title: string
}

export function CourseVideoPlayer({ videoUrl, title }: CourseVideoPlayerProps) {
  const ytId = getYouTubeId(videoUrl)
  const gdriveUrl = getGoogleDriveEmbedUrl(videoUrl)

  const embedSrc = ytId
    ? `https://www.youtube.com/embed/${ytId}`
    : gdriveUrl ?? null

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-black">
      {embedSrc ? (
        <iframe
          src={embedSrc}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      ) : (
        <video
          src={videoUrl}
          controls
          className="h-full w-full"
          aria-label={title}
        >
          お使いのブラウザは動画再生に対応していません
        </video>
      )}
    </div>
  )
}
