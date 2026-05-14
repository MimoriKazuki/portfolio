import { redirect } from 'next/navigation'
import { ShieldCheck } from 'lucide-react'
import { createClient } from '@/app/lib/supabase/server'
import { Avatar, AvatarFallback, AvatarImage } from '@/app/components/atoms/Avatar'
import { MyPageTemplate } from '@/app/components/templates/MyPageTemplate'
import { MyPageSidebarClient } from '@/app/e-learning/lp/mypage/_lib/MyPageSidebarClient'
import { WithdrawDialogClient } from '@/app/e-learning/lp/mypage/_lib/WithdrawDialogClient'
import { getMyProfile } from '@/app/e-learning/lp/mypage/_lib/get-my-profile'

/**
 * B014 マイページ：プロフィール（/e-learning/lp/mypage）— Server Component
 *
 * 起点：
 * - docs/frontend/screens.md B014
 * - docs/auth/flow.md §G（退会フロー）
 *
 * 設計：
 * - 表示専用（OAuth 由来情報のため Phase 1 では編集不可）
 * - 退会導線：WithdrawDialogClient（Dialog で確認後 POST /api/me/withdraw）
 * - 他マイページ画面と同じ MyPageTemplate + MyPageSidebarClient レイアウト
 *
 * 個人別情報のため認証必須
 */

export const dynamic = 'force-dynamic'

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    })
  } catch {
    return iso
  }
}

function initialsFrom(name: string | null, email: string | null): string {
  const source = (name?.trim() || email?.trim() || '?').toUpperCase()
  return source.slice(0, 1)
}

export default async function ELearningLPMyProfilePage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    redirect('/auth/login?returnTo=/e-learning/lp/mypage')
  }

  const profile = await getMyProfile(user.id)

  return (
    <MyPageTemplate
      header={
        <header className="flex flex-col gap-1">
          <h1 className="text-2xl text-foreground md:text-3xl">プロフィール</h1>
          <p className="text-sm text-muted-foreground">
            アカウント情報を確認できます。表示名・アバターは Google アカウント側で変更してください。
          </p>
        </header>
      }
      sidebar={<MyPageSidebarClient />}
    >
      {profile ? (
        <div className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-lg border border-border bg-card p-6 text-card-foreground">
            <div className="flex items-center gap-4">
              <Avatar size="lg">
                {profile.avatar_url && (
                  <AvatarImage
                    src={profile.avatar_url}
                    alt={`${profile.display_name ?? 'ユーザー'} のアバター`}
                  />
                )}
                <AvatarFallback>
                  {initialsFrom(profile.display_name, profile.email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-1 flex-col gap-1">
                <p className="truncate text-lg text-foreground">
                  {profile.display_name ?? '（表示名未設定）'}
                </p>
                {profile.email && (
                  <p className="truncate text-sm text-muted-foreground">
                    {profile.email}
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  登録日：{formatDate(profile.created_at)}
                </p>
              </div>
            </div>

            {profile.has_full_access && (
              <aside
                role="status"
                className="flex items-start gap-3 rounded-md border border-primary/20 bg-primary/5 p-4 text-sm text-foreground"
              >
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" aria-hidden="true" />
                <div className="flex flex-col gap-1">
                  <p className="text-foreground">全コンテンツ視聴権限あり</p>
                  <p className="text-xs text-muted-foreground">
                    すべての公開コース・単体動画が視聴できます。
                  </p>
                </div>
              </aside>
            )}
          </section>

          <section className="flex flex-col gap-4 rounded-lg border border-destructive/20 bg-card p-6 text-card-foreground">
            <header className="flex flex-col gap-1">
              <h2 className="text-base text-destructive">アカウントの退会</h2>
              <p className="text-sm text-muted-foreground">
                退会するとブックマーク・視聴履歴は削除されます。購入履歴は税務上保持されます。
                同じメールアドレスで再登録された場合、視聴権限は引き継がれます。
              </p>
            </header>
            <div>
              <WithdrawDialogClient />
            </div>
          </section>
        </div>
      ) : (
        <p
          role="alert"
          className="rounded-lg border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive"
        >
          プロフィール情報を取得できませんでした。時間を置いて再度お試しください。
        </p>
      )}
    </MyPageTemplate>
  )
}
