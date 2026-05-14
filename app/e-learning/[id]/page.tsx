import { createClient } from '@/app/lib/supabase/server'
import { createStaticClient } from '@/app/lib/supabase/static'
import { ELearningContent } from '@/app/types'
import { notFound, redirect } from 'next/navigation'
import ELearningDetailClient from './ELearningDetailClient'
import type { Metadata } from 'next'
import { canViewContent } from '@/app/lib/services/access-service'

export const revalidate = 60
export const dynamicParams = true

interface PageProps {
  params: Promise<{ id: string }>
}

// 静的パラメータを生成
export async function generateStaticParams() {
  try {
    const supabase = createStaticClient()
    const { data: contents, error } = await supabase
      .from('e_learning_contents')
      .select('id')
      .eq('is_published', true)

    if (error) {
      console.error('Error in generateStaticParams:', error)
      return []
    }

    return contents?.map((content) => ({
      id: content.id,
    })) || []
  } catch (err) {
    console.error('Error generating static params:', err)
    return []
  }
}

// メタデータを生成
export async function generateMetadata({
  params
}: {
  params: Promise<{ id: string }>
}): Promise<Metadata> {
  const { id } = await params
  const supabase = createStaticClient()

  const { data: content, error } = await supabase
    .from('e_learning_contents')
    .select('*')
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !content) {
    return {
      title: 'eラーニング - AI駆動研究所',
      description: 'AI駆動研究所のeラーニングコンテンツ',
    }
  }

  const baseUrl = 'https://www.landbridge.ai'

  return {
    title: `${content.title} - eラーニング | AI駆動研究所`,
    description: content.description || `${content.title}の解説動画`,
    openGraph: {
      title: content.title,
      description: content.description || `${content.title}の解説動画`,
      images: content.thumbnail_url ? [{ url: content.thumbnail_url }] : [],
      type: 'video.other',
      siteName: 'AI駆動研究所',
      url: `${baseUrl}/e-learning/${content.id}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: content.title,
      description: content.description || `${content.title}の解説動画`,
      images: content.thumbnail_url ? [content.thumbnail_url] : [],
    },
  }
}

export default async function ELearningDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  // ユーザー認証チェック
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // 未ログインの場合はeラーニング一覧ページへリダイレクト（そこでログインモーダルが表示される）
    redirect('/e-learning')
  }

  // コンテンツ取得
  const { data: content, error } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      category:e_learning_categories(id, name, slug),
      materials:e_learning_materials(id, title, file_url, file_size, display_order)
    `)
    .eq('id', id)
    .eq('is_published', true)
    .single()

  if (error || !content) {
    notFound()
  }

  // eラーニングユーザーを取得（access-service の userId 引数として e_learning_users.id を使うため）
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id')
    .eq('auth_user_id', user.id)
    .single()

  // 視聴権限判定：access-service に集約（has_paid_access 直書きを廃止・M5 安全順序 Step3）
  // is_free / has_full_access / 単体購入 のいずれかなら canView=true
  const hasViewAccess = eLearningUser
    ? (await canViewContent(eLearningUser.id, content.id)).canView
    : false

  // 関連コンテンツを取得（同じカテゴリの動画、現在の動画を除く最新3件）
  const { data: relatedContents } = await supabase
    .from('e_learning_contents')
    .select(`
      *,
      category:e_learning_categories(id, name, slug)
    `)
    .eq('is_published', true)
    .eq('category_id', content.category_id)
    .neq('id', content.id)
    .order('created_at', { ascending: false })
    .limit(3)

  // ブックマーク状態を取得（FB-SYS-001 適用済：user_id は e_learning_users.id 参照）
  const { data: bookmark } = eLearningUser
    ? await supabase
        .from('e_learning_bookmarks')
        .select('id')
        .eq('user_id', eLearningUser.id)
        .eq('content_id', content.id)
        .maybeSingle()
    : { data: null }

  return (
    <ELearningDetailClient
      content={content as ELearningContent}
      user={user}
      hasPurchased={hasViewAccess}
      relatedContents={relatedContents as ELearningContent[] || []}
      initialBookmarked={!!bookmark}
    />
  )
}
