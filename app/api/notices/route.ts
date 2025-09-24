import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    const { data: notices, error } = await supabase
      .from('notices')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Error fetching notices:', error)
      // テーブルが存在しない場合は空配列を返す
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('Notices table does not exist, returning empty array')
        return NextResponse.json([])
      }
      return NextResponse.json({ error: 'Failed to fetch notices' }, { status: 500 })
    }

    // 公開されたnoticesをフィルタリング
    const allNotices = notices || []
    const publishedNotices = allNotices
      .filter((n: any) => n.is_published !== false && n.published !== false)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
    
    return NextResponse.json(publishedNotices)
  } catch (error: any) {
    console.error('Error fetching notices:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}