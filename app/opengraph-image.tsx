import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'LandBridge Media'
export const size = {
  width: 1200,
  height: 630,
}

export const contentType = 'image/png'

export default async function Image() {
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
          {/* ProfileCardと同じグラデーション背景 */}
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              position: 'relative',
              borderRadius: '24px',
              overflow: 'hidden',
              background: 'linear-gradient(to bottom right, #3b82f6 0%, #2563eb 100%)',
            }}
          >
            {/* SVGパターンオーバーレイ */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                opacity: 0.1,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                backgroundSize: '60px 60px',
              }}
            />
            
            {/* コンテンツ */}
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
              {/* 会社名 - ProfileCardと同じスタイル */}
              <h1
                style={{
                  fontSize: '96px',
                  fontWeight: 'bold',
                  color: '#ffffff',
                  margin: '0',
                  marginBottom: '40px',
                  letterSpacing: '0.02em',
                  textShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                LandBridge Media
              </h1>
              
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