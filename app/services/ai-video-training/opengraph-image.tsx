import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'AI動画生成研修 - LandBridge株式会社'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'
 
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 48,
          background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          fontFamily: 'system-ui, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background Pattern */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)',
          }}
        />
        
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            padding: '40px',
            zIndex: 1,
          }}
        >
          {/* Main Title */}
          <div
            style={{
              fontSize: 72,
              fontWeight: 'bold',
              marginBottom: '30px',
              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
            }}
          >
            AI動画生成研修
          </div>
          
          {/* Subtitle */}
          <div
            style={{
              fontSize: 32,
              marginBottom: '40px',
              opacity: 0.9,
              fontWeight: '500',
            }}
          >
            プロレベルの動画を誰でも作れる
          </div>
          
          {/* Key Points */}
          <div
            style={{
              display: 'flex',
              gap: '40px',
              fontSize: 24,
              opacity: 0.8,
              fontWeight: '400',
            }}
          >
            <div>Sora・Runway活用</div>
            <div>•</div>
            <div>マーケティング動画</div>
            <div>•</div>
            <div>制作効率化</div>
          </div>
          
          {/* Company Logo Area */}
          <div
            style={{
              position: 'absolute',
              bottom: '40px',
              right: '60px',
              fontSize: 24,
              fontWeight: 'bold',
              opacity: 0.8,
            }}
          >
            LandBridge株式会社
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}