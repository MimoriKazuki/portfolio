import { createBrowserClient } from '@supabase/ssr'
import { Database } from '@/app/types/database'

// シングルトンインスタンス
let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null
let instanceCount = 0

export function createClient() {
  // 既にインスタンスがあればそれを返す
  if (supabaseInstance) {
    console.log('[Supabase Client] Returning existing instance')
    return supabaseInstance
  }

  instanceCount++
  console.log(`[Supabase Client] Creating new instance #${instanceCount}`)
  console.log('[Supabase Client] URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')

  // @supabase/ssr のブラウザクライアントを使用
  supabaseInstance = createBrowserClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  console.log('[Supabase Client] Instance created successfully')

  return supabaseInstance
}
