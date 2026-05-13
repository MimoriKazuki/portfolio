import { redirect } from 'next/navigation'

export default async function LoginPageRedirect({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>
}) {
  const { returnTo } = await searchParams
  const dest = returnTo
    ? `/auth/login?returnTo=${encodeURIComponent(returnTo)}`
    : '/auth/login'
  redirect(dest)
}
