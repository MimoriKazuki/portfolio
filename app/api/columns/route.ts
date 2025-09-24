import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // 公開されているコラムのみを取得
    const { data: columns, error } = await supabase
      .from('columns')
      .select('*')
      .limit(10)

    if (error) {
      console.error('Error fetching columns:', error)
      // テーブルが存在しない場合は空配列を返す
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('Columns table does not exist, returning empty array')
        return NextResponse.json([])
      }
      return NextResponse.json({ error: 'Failed to fetch columns' }, { status: 500 })
    }

    // 公開されたcolumnsをフィルタリング
    const allColumns = columns || []
    const publishedColumns = allColumns
      .filter((c: any) => c.is_published !== false && c.published !== false)
      .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      .slice(0, 10)
    
    return NextResponse.json(publishedColumns)

  } catch (error: any) {
    console.error('Error fetching columns:', error)
    
    return NextResponse.json(
      { 
        error: 'Failed to fetch columns',
        message: error?.message || 'Unknown error'
      },
      { status: 500 }
    )
  }
}