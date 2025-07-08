import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'LandBridge Portfolio'
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
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 50%, rgba(99, 102, 241, 0.5) 100%)',
            }}
          >
            {/* 追加のグラデーション層 */}
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
                LandBridge株式会社
              </h1>
              
              {/* サブタイトル - ProfileCardのスタイルに合わせる */}
              <p
                style={{
                  fontSize: '42px',
                  fontWeight: '500',
                  color: 'rgba(255, 255, 255, 0.95)',
                  margin: '0',
                  textAlign: 'center',
                  textShadow: '0 2px 4px rgba(0, 0, 0, 0.15)',
                  fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
              >
                AIによる自動コーディングを活用した開発実績
              </p>
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