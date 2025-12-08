import { createBrowserClient } from '@supabase/ssr'

// シングルトンインスタンス
let supabaseInstance: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // 既にインスタンスがあればそれを返す
  if (supabaseInstance) {
    return supabaseInstance
  }

  // なければ新規作成
  supabaseInstance = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  return supabaseInstance
}
