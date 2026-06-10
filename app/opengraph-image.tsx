import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Social-share card rendered at build time with the real brand fonts so it
// matches the homepage hero exactly (Swiss-editorial: white, ink, one accent).

export const alt =
  'SessionRemind — automatic SMS & email reminders for photography sessions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const INK = '#141414'
const ACCENT = '#DD4D24'
const HAIRLINE = '#ECEAE4'
const MUTED = '#9A958C'

export default async function OpenGraphImage() {
  const fontsDir = join(process.cwd(), 'assets', 'fonts')
  const [hanken, hankenSemiBold, plexMono] = await Promise.all([
    readFile(join(fontsDir, 'HankenGrotesk-Regular.ttf')),
    readFile(join(fontsDir, 'HankenGrotesk-SemiBold.ttf')),
    readFile(join(fontsDir, 'IBMPlexMono-Medium.ttf')),
  ])

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: '#ffffff',
          color: INK,
          fontFamily: 'Hanken Grotesk',
          padding: '52px 64px 48px',
          position: 'relative',
        }}
      >
        {/* hairline grid texture, faded toward the bottom like the hero */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '630px',
            backgroundImage: `linear-gradient(${HAIRLINE} 1px, transparent 1px), linear-gradient(90deg, ${HAIRLINE} 1px, transparent 1px)`,
            backgroundSize: '64px 64px',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '630px',
            background:
              'linear-gradient(to bottom, rgba(255,255,255,0) 30%, rgba(255,255,255,1) 85%)',
          }}
        />

        {/* header: wordmark + domain */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '46px',
                height: '46px',
                borderRadius: '10px',
                background: INK,
                color: '#ffffff',
                fontSize: '22px',
                fontWeight: 600,
              }}
            >
              Sr
            </div>
            <div style={{ fontSize: '28px', fontWeight: 600, letterSpacing: '-0.5px' }}>
              SessionRemind
            </div>
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: '15px',
              letterSpacing: '3px',
              color: MUTED,
            }}
          >
            SESSIONREMIND.COM
          </div>
        </div>

        {/* main: headline left, product panel + bubble right */}
        <div
          style={{
            display: 'flex',
            flex: 1,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '620px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '9px',
                  height: '9px',
                  borderRadius: '9px',
                  background: ACCENT,
                }}
              />
              <div
                style={{
                  fontFamily: 'IBM Plex Mono',
                  fontSize: '16px',
                  letterSpacing: '3.5px',
                  color: '#6E6A63',
                }}
              >
                SET IT ONCE · NEVER CHASE A CLIENT AGAIN
              </div>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                marginTop: '26px',
                fontSize: '86px',
                fontWeight: 600,
                letterSpacing: '-3px',
                lineHeight: 0.98,
              }}
            >
              <div>They book.</div>
              <div>We remind.</div>
              <div style={{ color: ACCENT }}>You shoot.</div>
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              width: '400px',
            }}
          >
            {/* product panel */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '400px',
                borderRadius: '20px',
                border: `1px solid ${HAIRLINE}`,
                background: '#ffffff',
                boxShadow: '0 30px 80px -40px rgba(0,0,0,0.35)',
                overflow: 'hidden',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '16px 22px',
                  borderBottom: `1px solid ${HAIRLINE}`,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '9px' }}>
                  <div
                    style={{
                      width: '9px',
                      height: '9px',
                      borderRadius: '9px',
                      background: ACCENT,
                    }}
                  />
                  <div style={{ fontSize: '17px', fontWeight: 600, letterSpacing: '-0.3px' }}>
                    Connect
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '7px',
                      background: '#16a34a',
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '12px',
                      letterSpacing: '2px',
                      color: '#16a34a',
                    }}
                  >
                    SYNCED
                  </div>
                </div>
              </div>
              {[
                ['Ashley D.', 'Summer Greenhouse Mini', 'IN 3 DAYS'],
                ['Kayla W.', 'Watermelon Mini', 'TOMORROW'],
              ].map(([name, session, when], i) => (
                <div
                  key={name}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '15px 22px',
                    borderBottom: i === 0 ? `1px solid ${HAIRLINE}` : 'none',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <div style={{ fontSize: '16px', fontWeight: 600 }}>{name}</div>
                    <div style={{ fontSize: '13px', color: '#8A857C' }}>{session}</div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: '#8A857C',
                    }}
                  >
                    {`TEXTS ${when}`}
                  </div>
                </div>
              ))}
            </div>

            {/* dark SMS bubble, slightly rotated — the brand motif */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                bottom: '-100px',
                left: '-90px',
                width: '270px',
                borderRadius: '20px',
                background: INK,
                color: '#ffffff',
                padding: '18px 20px',
                transform: 'rotate(-3deg)',
                boxShadow: '0 24px 50px -20px rgba(0,0,0,0.45)',
              }}
            >
              <div style={{ fontSize: '15px', lineHeight: 1.4 }}>
                {"Hi Ashley! Reminder about your shoot Saturday at 10 AM. Can't wait! 📸"}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'rgba(255,255,255,0.5)',
                }}
              >
                SENT AUTOMATICALLY
              </div>
            </div>
          </div>
        </div>

        {/* footer */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontFamily: 'IBM Plex Mono',
            fontSize: '14px',
            letterSpacing: '2.5px',
            color: MUTED,
          }}
        >
          <div>{'SMS & EMAIL REMINDERS FOR PHOTO SESSIONS'}</div>
          <div>PLANS FROM $15/MO · CANCEL ANYTIME</div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: 'Hanken Grotesk', data: hanken, weight: 400, style: 'normal' },
        { name: 'Hanken Grotesk', data: hankenSemiBold, weight: 600, style: 'normal' },
        { name: 'IBM Plex Mono', data: plexMono, weight: 500, style: 'normal' },
      ],
    }
  )
}
