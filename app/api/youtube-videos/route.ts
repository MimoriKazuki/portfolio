import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    const { data: youtubeVideos, error } = await supabase
      .from('youtube_videos')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching YouTube videos:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ youtubeVideos })
  } catch (error) {
    console.error('Unexpected error:', error)
    return NextResponse.json(
      { error: 'サーバーエラーが発生しました' },
      { status: 500 }
    )
  }
}
