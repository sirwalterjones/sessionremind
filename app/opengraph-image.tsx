import { ImageResponse } from 'next/og'
import { readFile } from 'fs/promises'
import { join } from 'path'

// Social-share card rendered at build time with the real brand fonts so it
// matches the homepage hero exactly (Ink & Acid: graphite, lime, wide Archivo).

export const alt =
  'SessionRemind — automatic SMS & email reminders for photography sessions'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

const CANVAS = '#101113'
const CARD = '#1A1D22'
const INK = '#F4F6F0'
const ACCENT = '#C6F24E'
const ACCENT_INK = '#11130A'
const HAIRLINE = '#272B31'
const MUTED = '#A3A8A0'
const FAINT = '#6E736C'

export default async function OpenGraphImage() {
  const fontsDir = join(process.cwd(), 'assets', 'fonts')
  const [archivo, archivoBold, plexMono] = await Promise.all([
    readFile(join(fontsDir, 'Archivo-Expanded-Regular.ttf')),
    readFile(join(fontsDir, 'Archivo-Expanded-Bold.ttf')),
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
          background: CANVAS,
          color: INK,
          fontFamily: 'Archivo',
          padding: '52px 64px 48px',
          position: 'relative',
        }}
      >
        {/* lime spill from the top corner, like the hero */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '1200px',
            height: '630px',
            background:
              'radial-gradient(ellipse 60% 55% at 80% -10%, rgba(198,242,78,0.16), transparent 65%)',
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
                background: ACCENT,
                color: ACCENT_INK,
                fontSize: '22px',
                fontWeight: 700,
              }}
            >
              Sr
            </div>
            <div style={{ fontSize: '28px', fontWeight: 700, letterSpacing: '-0.5px' }}>
              SessionRemind
            </div>
          </div>
          <div
            style={{
              fontFamily: 'IBM Plex Mono',
              fontSize: '15px',
              letterSpacing: '3px',
              color: FAINT,
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
          <div style={{ display: 'flex', flexDirection: 'column', maxWidth: '640px' }}>
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
                  color: MUTED,
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
                fontSize: '74px',
                fontWeight: 700,
                letterSpacing: '-1px',
                lineHeight: 1.02,
                textTransform: 'uppercase',
              }}
            >
              <div>They book.</div>
              <div>We remind.</div>
              <div style={{ color: ACCENT, display: 'flex' }}>You shoot.</div>
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
                background: CARD,
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
                  <div style={{ fontSize: '17px', fontWeight: 700, letterSpacing: '-0.3px' }}>
                    Connect
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                  <div
                    style={{
                      width: '7px',
                      height: '7px',
                      borderRadius: '7px',
                      background: ACCENT,
                    }}
                  />
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '12px',
                      letterSpacing: '2px',
                      color: ACCENT,
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
                    <div style={{ fontSize: '16px', fontWeight: 700, color: INK }}>{name}</div>
                    <div style={{ fontSize: '13px', color: MUTED }}>{session}</div>
                  </div>
                  <div
                    style={{
                      fontFamily: 'IBM Plex Mono',
                      fontSize: '11px',
                      letterSpacing: '1.5px',
                      color: FAINT,
                    }}
                  >
                    {`TEXTS ${when}`}
                  </div>
                </div>
              ))}
            </div>

            {/* lime SMS bubble, slightly rotated — the brand motif */}
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                bottom: '-100px',
                left: '-90px',
                width: '270px',
                borderRadius: '20px',
                background: ACCENT,
                color: ACCENT_INK,
                padding: '18px 20px',
                transform: 'rotate(-3deg)',
                boxShadow: '0 24px 60px -20px rgba(198,242,78,0.35)',
              }}
            >
              <div style={{ fontSize: '15px', lineHeight: 1.4, fontWeight: 400 }}>
                {"Hi Ashley! Reminder about your shoot Saturday at 10 AM. Can't wait! 📸"}
              </div>
              <div
                style={{
                  marginTop: '10px',
                  fontFamily: 'IBM Plex Mono',
                  fontSize: '10px',
                  letterSpacing: '2px',
                  color: 'rgba(17,19,10,0.6)',
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
            color: FAINT,
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
        { name: 'Archivo', data: archivo, weight: 400, style: 'normal' },
        { name: 'Archivo', data: archivoBold, weight: 700, style: 'normal' },
        { name: 'IBM Plex Mono', data: plexMono, weight: 500, style: 'normal' },
      ],
    }
  )
}
