import { NextResponse } from 'next/server'
import { createClient } from '@/app/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 認証確認
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // コラムデータを取得
    const { data: columns, error } = await supabase
      .from('columns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    // 公開されているコラムの数もカウント
    const publishedCount = columns?.filter(c => c.is_published).length || 0

    // デバッグ: 最初の3つのコラムの構造を確認
    // console.log('Sample columns structure:', columns?.slice(0, 3).map(c => ({
    //   id: c.id,
    //   slug: c.slug,
    //   title: c.title
    // })))

    return NextResponse.json({
      success: true,
      columns: columns || [],
      totalCount: columns?.length || 0,
      publishedCount
    })

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