export default function DebugPage() {
  const hasSupabaseUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasSupabaseKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  return (
    <div className="min-h-screen bg-youtube-dark text-white p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Debug</h1>
      <div className="bg-youtube-gray p-4 rounded-lg">
        <p>NEXT_PUBLIC_SUPABASE_URL: {hasSupabaseUrl ? '✅ Set' : '❌ Not set'}</p>
        <p>NEXT_PUBLIC_SUPABASE_ANON_KEY: {hasSupabaseKey ? '✅ Set' : '❌ Not set'}</p>
        <p className="mt-4 text-sm text-gray-400">
          Note: Actual values are hidden for security reasons.
        </p>
      </div>
    </div>
  )
}