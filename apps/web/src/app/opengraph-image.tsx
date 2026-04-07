import { ImageResponse } from 'next/og'

export const runtime = 'edge'

export const alt = 'SlideNerds - Build slides like you build code'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          width: '100%',
          height: '100%',
          backgroundImage: 'linear-gradient(135deg, #0f3460 0%, #1a1a2e 40%, #16213e 70%, #0f3460 100%)',
          color: '#fafafa',
          fontFamily: 'system-ui, -apple-system, sans-serif',
        }}
      >
        {/* Left 1/3: Presentation icon */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '400px',
            height: '100%',
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="180"
            height="180"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#fafafa"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M2 3h20" />
            <path d="M21 3v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V3" />
            <path d="m7 21 5-5 5 5" />
          </svg>
        </div>

        {/* Right 2/3: Title and subtext */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            width: '800px',
            height: '100%',
            paddingRight: '80px',
          }}
        >
          <div
            style={{
              fontSize: '72px',
              fontWeight: 700,
              letterSpacing: '-0.02em',
              lineHeight: 1.1,
            }}
          >
            SlideNerds
          </div>
          <div
            style={{
              fontSize: '32px',
              fontWeight: 400,
              color: '#a1a1a1',
              marginTop: '20px',
              lineHeight: 1.4,
            }}
          >
            Build slides like you build code.
          </div>
        </div>
      </div>
    ),
    { ...size },
  )
}
