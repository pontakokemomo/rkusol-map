import { useStore } from '../store'

const FONT = "'Geist Mono', 'Courier New', monospace"

const CATEGORY_COLORS = [
  { label: 'Staking',        color: '#00D4FF' },
  { label: 'Lending',        color: '#00FFA3' },
  { label: 'Yield',          color: '#FF5FAD' },
  { label: 'Infrastructure', color: '#FF7A45' },
]

const RAIKU_LOGO = '/raiku-logo.png'

// ── Bottom CTA ────────────────────────────────────────────────────────────────
function BottomCTA() {
  const { selectedId } = useStore()
  if (selectedId) return null

  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: FONT,
      textAlign: 'center',
      pointerEvents: 'auto', zIndex: 5,
    }}>
      <div style={{ fontSize: '14px', color: '#aab', letterSpacing: '1px', marginBottom: '10px' }}>
        4 live integrations · 1 coming soon — click any planet to explore
      </div>
      <a
        href="https://raiku.com"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          display: 'inline-block',
          padding: '9px 22px',
          border: '1px solid rgba(192,255,56,0.35)',
          borderRadius: '4px',
          background: 'rgba(192,255,56,0.07)',
          color: '#C0FF38',
          fontFamily: FONT,
          fontSize: '13px',
          fontWeight: '600',
          letterSpacing: '2px',
          textDecoration: 'none',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(192,255,56,0.14)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(192,255,56,0.6)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(192,255,56,0.07)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor = 'rgba(192,255,56,0.35)'
        }}
      >
        Get rkuSOL →
      </a>
    </div>
  )
}

// ── Bottom-right hint ─────────────────────────────────────────────────────────
function BottomHint() {
  const { selectedId } = useStore()

  return (
    <div style={{
      position: 'fixed', bottom: '28px', right: '32px',
      fontFamily: FONT,
      fontSize: '14px', color: '#bbc', letterSpacing: '1px',
      pointerEvents: 'none', zIndex: 5,
      textAlign: 'right', lineHeight: 2.0,
      textShadow: '0 1px 4px rgba(0,0,0,0.9)',
    }}>
      {!selectedId && <>Click planet for details<br /></>}
      Drag to rotate · Scroll to zoom
    </div>
  )
}

// ── Main HUD ─────────────────────────────────────────────────────────────────
export function HUD() {
  const { rkuSOL, lastUpdated } = useStore()

  return (
    <>
      {/* Top-left */}
      <div style={{
        position: 'fixed', top: '28px', left: '32px',
        fontFamily: FONT,
        pointerEvents: 'none', zIndex: 5,
      }}>
        <img
          src={RAIKU_LOGO}
          alt="Raiku"
          style={{ height: '38px', display: 'block', marginBottom: '14px' }}
        />
        <div style={{
          fontSize: '38px', fontWeight: 'bold', letterSpacing: '8px', color: '#C0FF38',
          textShadow: '0 0 28px #C0FF3888, 0 0 70px #C0FF3833',
        }}>
          rkuSOL
        </div>
        <div style={{ fontSize: '14px', letterSpacing: '3px', color: '#aab', marginTop: '6px' }}>
          Liquid Staking Token on Solana
        </div>
        <div style={{ marginTop: '16px', fontSize: '16px', color: '#bbc', lineHeight: 2.0 }}>
          Supply&nbsp;&nbsp;
          <span style={{ color: '#FFB830', fontWeight: 'bold' }}>
            {rkuSOL.supply.toLocaleString()}
          </span>
          {' '}rkuSOL
        </div>
      </div>

      {/* Bottom-left */}
      <div style={{
        position: 'fixed', bottom: '28px', left: '32px',
        fontFamily: FONT,
        pointerEvents: 'none', zIndex: 5,
      }}>
        {/* LIVE indicator */}
        <div style={{ fontSize: '14px', color: '#bbc', letterSpacing: '2px', marginBottom: '16px' }}>
          <span style={{
            display: 'inline-block', width: '7px', height: '7px',
            borderRadius: '50%', background: '#00E5AA',
            marginRight: '8px', verticalAlign: 'middle',
            animation: 'blink 2.4s ease-in-out infinite',
          }} />
          LIVE&nbsp;&nbsp;·&nbsp;&nbsp;
          {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
        </div>

        {/* Category legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
          {CATEGORY_COLORS.map(c => (
            <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '10px', height: '10px', borderRadius: '50%', background: c.color,
                boxShadow: `0 0 8px ${c.color}99`, flexShrink: 0,
              }} />
              <span style={{ fontSize: '14px', color: '#bbc', letterSpacing: '1px', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{c.label}</span>
            </div>
          ))}
        </div>

        {/* Map legend */}
        <div style={{ marginTop: '14px', fontSize: '13px', color: '#aab', lineHeight: 1.9, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
          <div>◎ Size = rkuSOL TVL&nbsp;&nbsp;· · · Flow = Liquidity</div>
          <div>🪐 Orbit = Integration Role</div>
        </div>
      </div>

      {/* Bottom-right hint */}
      <BottomHint />

      {/* Bottom CTA */}
      <BottomCTA />
    </>
  )
}
