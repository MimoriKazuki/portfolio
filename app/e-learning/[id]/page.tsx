import { createClient } from '@/app/lib/supabase/server'
import { createStaticClient } from '@/app/lib/supabase/static'
import { ELearningContent } from '@/app/types'
import { notFound, redirect } from 'next/navigation'
import MainLayout from '@/app/components/MainLayout'
import ELearningDetailClient from './ELearningDetailClient'
import type { Metadata } from 'next'

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

  // eラーニングユーザーを取得（has_paid_accessを含む）
  const { data: eLearningUser } = await supabase
    .from('e_learning_users')
    .select('id, has_paid_access')
    .eq('auth_user_id', user.id)
    .single()

  // 有料コンテンツへのアクセス権限を判定
  // 無料コンテンツまたはhas_paid_access=trueの場合はアクセス可能
  const hasPaidAccess = content.is_free || (eLearningUser?.has_paid_access ?? false)

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

  // ブックマーク状態を取得
  const { data: bookmark } = await supabase
    .from('e_learning_bookmarks')
    .select('id')
    .eq('user_id', user.id)
    .eq('content_id', content.id)
    .single()

  // 最終アクセス日時を更新（非同期で実行、エラーは無視）
  supabase
    .from('e_learning_users')
    .update({ last_accessed_at: new Date().toISOString() })
    .eq('auth_user_id', user.id)
    .then(() => {})
    .catch(() => {})

  return (
    <MainLayout>
      <ELearningDetailClient
        content={content as ELearningContent}
        user={user}
        hasPurchased={hasPaidAccess}
        relatedContents={relatedContents as ELearningContent[] || []}
        initialBookmarked={!!bookmark}
      />
    </MainLayout>
  )
}
