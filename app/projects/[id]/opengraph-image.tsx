import { ImageResponse } from 'next/og'
import { createStaticClient } from '@/app/lib/supabase/static'

export const runtime = 'edge'

export const alt = 'Project Image'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

interface Props {
  params: Promise<{ id: string }>
}

export default async function Image({ params }: Props) {
  const { id } = await params
  const supabase = createStaticClient()
  
  const { data: project } = await supabase
    .from('projects')
    .select('title, description, thumbnail')
    .eq('id', id)
    .single()

  if (!project) {
    return new Response('Not found', { status: 404 })
  }

  // サムネイルがある場合はリダイレクト
  if (project.thumbnail) {
    return new Response(null, {
      status: 302,
      headers: {
        Location: project.thumbnail,
      },
    })
  }

  // サムネイルがない場合は動的に生成
  try {
    return new ImageResponse(
      (
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            backgroundColor: '#0f0f0f',
            padding: '40px',
          }}
        >
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 50%, rgba(99, 102, 241, 0.5) 100%)',
            }}
          >
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(45deg, rgba(37, 99, 235, 0.3) 0%, rgba(139, 92, 246, 0.3) 100%)',
              }}
            />
            
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                width: '100%',
                padding: '80px',
                position: 'relative',
                zIndex: 10,
              }}
            >
              <h1
                style={{
                  fontSize: '64px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: '0',
                  marginBottom: '24px',
                  letterSpacing: '0.02em',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                  textAlign: 'center',
                  lineHeight: '1.2',
                }}
              >
                {project.title}
              </h1>
              
              {project.description && (
                <p
                  style={{
                    fontSize: '28px',
                    fontWeight: '400',
                    color: 'rgba(255, 255, 255, 0.9)',
                    margin: '0',
                    textAlign: 'center',
                    textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                    maxWidth: '900px',
                    lineHeight: '1.4',
                  }}
                >
                  {project.description.length > 100 
                    ? project.description.substring(0, 100) + '...' 
                    : project.description}
                </p>
              )}
              
              <div
                style={{
                  position: 'absolute',
                  bottom: '40px',
                  right: '40px',
                  fontSize: '24px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.8)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                LandBridge Media
              </div>
            </div>
          </div>
        </div>
      ),
      {
        ...size,
      },
    )
  } catch (e: any) {
    console.log(`${e.message}`)
    return new Response(`Failed to generate the image`, {
      status: 500,
    })
  }
}