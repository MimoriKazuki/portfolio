import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get('url')
  
  if (!url) {
    return NextResponse.json({ error: 'URL parameter is required' }, { status: 400 })
  }

  try {
    // Fetch the page
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; MetadataDebugger/1.0)',
      },
    })

    if (!response.ok) {
      return NextResponse.json({ 
        error: `Failed to fetch URL: ${response.status} ${response.statusText}` 
      }, { status: response.status })
    }

    const html = await response.text()

    // Extract metadata
    const metadata: any = {
      url,
      fetchedAt: new Date().toISOString(),
      headers: Object.fromEntries(response.headers.entries()),
    }

    // Extract title
    const titleMatch = html.match(/<title>(.*?)<\/title>/i)
    metadata.title = titleMatch ? titleMatch[1] : null

    // Extract meta tags
    const metaTags: any[] = []
    const metaRegex = /<meta\s+([^>]+)>/gi
    let match

    while ((match = metaRegex.exec(html)) !== null) {
      const attributes = match[1]
      const tag: any = {}

      // Extract attributes
      const attrRegex = /(\w+)=["']([^"']+)["']/g
      let attrMatch

      while ((attrMatch = attrRegex.exec(attributes)) !== null) {
        tag[attrMatch[1]] = attrMatch[2]
      }

      if (Object.keys(tag).length > 0) {
        metaTags.push(tag)
      }
    }

    metadata.metaTags = metaTags

    // Extract Open Graph tags
    metadata.openGraph = metaTags
      .filter(tag => tag.property && tag.property.startsWith('og:'))
      .reduce((acc, tag) => {
        const key = tag.property.replace('og:', '')
        acc[key] = tag.content
        return acc
      }, {})

    // Extract Twitter Card tags
    metadata.twitter = metaTags
      .filter(tag => tag.name && tag.name.startsWith('twitter:'))
      .reduce((acc, tag) => {
        const key = tag.name.replace('twitter:', '')
        acc[key] = tag.content
        return acc
      }, {})

    // Extract canonical URL
    const canonicalMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i)
    metadata.canonical = canonicalMatch ? canonicalMatch[1] : null

    // Check for Next.js metadata
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">([\s\S]*?)<\/script>/)
    if (nextDataMatch) {
      try {
        const nextData = JSON.parse(nextDataMatch[1])
        metadata.nextjs = {
          buildId: nextData.buildId,
          isFallback: nextData.isFallback,
          gssp: nextData.gssp,
          gsp: nextData.gsp,
          page: nextData.page,
        }
      } catch (e) {
        metadata.nextjs = { error: 'Failed to parse __NEXT_DATA__' }
      }
    }

    return NextResponse.json(metadata, { 
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      }
    })
  } catch (error) {
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }, { status: 500 })
  }
}