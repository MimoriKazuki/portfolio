import { createClient } from '@supabase/supabase-js'
import * as dotenv from 'dotenv'
import { resolve } from 'path'

// Load environment variables
dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const adminEmail = process.env.ADMIN_EMAIL!

if (!supabaseUrl || !supabaseServiceKey || !adminEmail) {
  console.error('必要な環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function setupAdmin() {
  console.log('管理者ユーザーのセットアップを開始します...')
  
  try {
    // 既存ユーザーを確認
    const { data: existingUser } = await supabase.auth.admin.getUserById(adminEmail).catch(() => ({ data: null }))
    
    if (existingUser) {
      console.log('管理者ユーザーは既に存在します:', adminEmail)
      return
    }
    
    // デフォルトパスワード
    const defaultPassword = 'Lb@123456'
    
    // ユーザーを作成
    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: defaultPassword,
      email_confirm: true,
      user_metadata: {
        role: 'admin'
      }
    })
    
    if (error) {
      console.error('ユーザー作成エラー:', error)
      return
    }
    
    console.log('管理者ユーザーが作成されました!')
    console.log('=====================================')
    console.log('メールアドレス:', adminEmail)
    console.log('初期パスワード:', defaultPassword)
    console.log('=====================================')
    console.log('※ セキュリティのため、ログイン後すぐにパスワードを変更してください')
    
  } catch (error) {
    console.error('エラーが発生しました:', error)
  }
}

setupAdmin()