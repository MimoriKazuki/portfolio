import { NextRequest, NextResponse } from 'next/server'
import { createStaticClient } from '@/app/lib/supabase/static'
import type { Metadata } from 'next'

// Import the generateMetadata functions from different pages
import { generateMetadata as generateProjectMetadata } from '@/app/projects/[id]/page'
import { generateMetadata as generateColumnMetadata } from '@/app/columns/[slug]/page'

export async function GET(request: NextRequest) {
  const type = request.nextUrl.searchParams.get('type')
  const id = request.nextUrl.searchParams.get('id')

  if (!type || !id) {
    return NextResponse.json({ 
      error: 'Both type and id parameters are required' 
    }, { status: 400 })
  }

  try {
    let metadata: Metadata | null = null
    let data: any = null

    if (type === 'project') {
      // Get project data
      const supabase = createStaticClient()
      const { data: project, error } = await supabase
        .from('projects')
        .select('*')
        .eq('id', id)
        .single()

      if (error || !project) {
        return NextResponse.json({ 
          error: `Project not found: ${id}`,
          supabaseError: error 
        }, { status: 404 })
      }

      data = project

      // Generate metadata using the same function as the page
      metadata = await generateProjectMetadata({ 
        params: Promise.resolve({ id }) 
      })

    } else if (type === 'column') {
      // Get column data
      const supabase = createStaticClient()
      const { data: column, error } = await supabase
        .from('columns')
        .select('*')
        .eq('slug', id)
        .single()

      if (error || !column) {
        return NextResponse.json({ 
          error: `Column not found: ${id}`,
          supabaseError: error 
        }, { status: 404 })
      }

      data = column

      // Generate metadata using the same function as the page
      metadata = await generateColumnMetadata({ 
        params: Promise.resolve({ slug: id }) 
      })
    } else {
      return NextResponse.json({ 
        error: 'Invalid type. Use "project" or "column"' 
      }, { status: 400 })
    }

    // Return both the data and generated metadata
    return NextResponse.json({
      type,
      id,
      data,
      generatedMetadata: metadata,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        VERCEL_ENV: process.env.VERCEL_ENV,
        VERCEL_URL: process.env.VERCEL_URL,
      },
      timestamp: new Date().toISOString(),
    }, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    })
  } catch (error) {
    console.error('Error in check-metadata:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      stack: error instanceof Error ? error.stack : undefined,
    }, { status: 500 })
  }
}