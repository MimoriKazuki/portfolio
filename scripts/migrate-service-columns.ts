/**
 * Database migration script to add service selection columns
 * Run this with: npx tsx scripts/migrate-service-columns.ts
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { join } from 'path'

// Load environment variables from .env.local
config({ path: join(process.cwd(), '.env.local') })

console.log('Environment check:')
console.log('NEXT_PUBLIC_SUPABASE_URL exists:', !!process.env.NEXT_PUBLIC_SUPABASE_URL)
console.log('SUPABASE_SERVICE_ROLE_KEY exists:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

// Load environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing required environment variables:')
  console.error('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl)
  console.error('SUPABASE_SERVICE_ROLE_KEY:', !!supabaseServiceKey)
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function runMigration() {
  console.log('🚀 Starting service columns data migration...')
  console.log('')
  console.log('⚠️  Note: This script only updates data. Database schema changes must be done manually in Supabase dashboard.')
  console.log('')
  console.log('Please run the following SQL in your Supabase SQL editor first:')
  console.log('----------------------------------------')
  console.log(`ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
ADD COLUMN IF NOT EXISTS individual_service TEXT DEFAULT 'individual-coaching';

ALTER TABLE columns 
ADD COLUMN IF NOT EXISTS enterprise_service TEXT DEFAULT 'comprehensive-ai-training',
ADD COLUMN IF NOT EXISTS individual_service TEXT DEFAULT 'individual-coaching';`)
  console.log('----------------------------------------')
  console.log('')
  
  // Ask user to confirm they have run the schema changes
  console.log('Have you already run the above SQL in Supabase? (Press Enter to continue after running the SQL, or Ctrl+C to exit)')
  
  // For automation purposes, let's just proceed with data updates
  try {
    // First, let's check if columns exist by trying to select them
    console.log('🔍 Checking if columns exist...')
    
    const { data: projectData, error: projectCheckError } = await supabase
      .from('projects')
      .select('id, enterprise_service, individual_service')
      .limit(1)
    
    if (projectCheckError) {
      console.log('⚠️  Columns may not exist yet. Please run the SQL schema changes first.')
      console.log('Error:', projectCheckError.message)
      return
    }
    
    const { data: columnData, error: columnCheckError } = await supabase
      .from('columns')
      .select('id, enterprise_service, individual_service')
      .limit(1)
    
    if (columnCheckError) {
      console.log('⚠️  Columns may not exist yet. Please run the SQL schema changes first.')
      console.log('Error:', columnCheckError.message)
      return
    }

    console.log('✅ Columns exist, proceeding with data updates...')

    // Get all projects without service settings
    const { data: projectsToUpdate, error: getProjectsError } = await supabase
      .from('projects')
      .select('id')
      .or('enterprise_service.is.null,individual_service.is.null')
    
    if (getProjectsError) {
      console.error('❌ Error getting projects:', getProjectsError)
      throw getProjectsError
    }

    if (projectsToUpdate && projectsToUpdate.length > 0) {
      console.log(`🔄 Updating ${projectsToUpdate.length} projects with default service values...`)
      
      const { error: updateProjectsError } = await supabase
        .from('projects')
        .update({
          enterprise_service: 'comprehensive-ai-training',
          individual_service: 'individual-coaching'
        })
        .or('enterprise_service.is.null,individual_service.is.null')
      
      if (updateProjectsError) {
        console.error('❌ Error updating projects:', updateProjectsError)
        throw updateProjectsError
      }
      
      console.log(`✅ Updated ${projectsToUpdate.length} projects`)
    } else {
      console.log('✅ All projects already have service values set')
    }
    
    // Get all columns without service settings
    const { data: columnsToUpdate, error: getColumnsError } = await supabase
      .from('columns')
      .select('id')
      .or('enterprise_service.is.null,individual_service.is.null')
    
    if (getColumnsError) {
      console.error('❌ Error getting columns:', getColumnsError)
      throw getColumnsError
    }

    if (columnsToUpdate && columnsToUpdate.length > 0) {
      console.log(`🔄 Updating ${columnsToUpdate.length} columns with default service values...`)
      
      const { error: updateColumnsError } = await supabase
        .from('columns')
        .update({
          enterprise_service: 'comprehensive-ai-training',
          individual_service: 'individual-coaching'
        })
        .or('enterprise_service.is.null,individual_service.is.null')
      
      if (updateColumnsError) {
        console.error('❌ Error updating columns:', updateColumnsError)
        throw updateColumnsError
      }
      
      console.log(`✅ Updated ${columnsToUpdate.length} columns`)
    } else {
      console.log('✅ All columns already have service values set')
    }

    console.log('')
    console.log('✅ Data migration completed successfully!')
    console.log('')
    console.log('📋 Summary:')
    console.log('- Set default service values for existing records')
    console.log('- enterprise_service: comprehensive-ai-training (生成AI総合研修)')
    console.log('- individual_service: individual-coaching (AI人材育成所)')
    
  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  }
}

// Run the migration
runMigration()