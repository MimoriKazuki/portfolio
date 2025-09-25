import { ImageResponse } from 'next/og'
 
export const runtime = 'edge'
export const alt = 'AI人材育成所 - LandBridge株式会社'
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
          background: 'linear-gradient(135deg, #ea580c 0%, #fb923c 100%)',
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
            AI人材育成所
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
            個人でAIスキルを身につけキャリアアップ
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
            <div>個人向けプログラム</div>
            <div>•</div>
            <div>自分のペース</div>
            <div>•</div>
            <div>AI人材転職支援</div>
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