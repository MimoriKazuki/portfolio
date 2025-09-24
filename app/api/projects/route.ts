import { createClient } from '@/app/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()
    
    // 全プロジェクトを取得
    const { data: projects, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching projects:', error)
      // テーブルが存在しない場合は空配列を返す
      if (error.code === 'PGRST116' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
        console.log('Projects table does not exist, returning empty array')
        return NextResponse.json([])
      }
      return NextResponse.json({ error: 'Failed to fetch projects' }, { status: 500 })
    }

    // 公開されたプロジェクトをフィルタリングし、注目順でソート
    const publishedProjects = (projects || [])
      .filter((p: any) => p.is_published !== false)
      .sort((a: any, b: any) => {
        // 注目フラグを優先してソート
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        
        // 注目フラグが同じ場合は作成日で新しい順
        return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
      })
    
    return NextResponse.json(publishedProjects)
  } catch (error: any) {
    console.error('Error fetching projects:', error)
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 })
  }
}