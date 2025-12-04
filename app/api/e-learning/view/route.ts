import { createClient } from '@/app/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { contentId } = await request.json()

    if (!contentId) {
      return NextResponse.json(
        { error: 'Content ID is required' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    // 現在のview_countを取得してインクリメント
    const { data, error: selectError } = await supabase
      .from('e_learning_contents')
      .select('view_count')
      .eq('id', contentId)
      .single()

    if (selectError) {
      throw selectError
    }

    const newViewCount = (data?.view_count || 0) + 1

    const { error: updateError } = await supabase
      .from('e_learning_contents')
      .update({ view_count: newViewCount })
      .eq('id', contentId)

    if (updateError) {
      throw updateError
    }

    return NextResponse.json({ success: true, viewCount: newViewCount })
  } catch (error) {
    console.error('Error incrementing view count:', error)
    return NextResponse.json(
      { error: 'Failed to increment view count' },
      { status: 500 }
    )
  }
}
