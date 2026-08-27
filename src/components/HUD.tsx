import { useState } from 'react'
import { useStore } from '../store'
import { useIsMobile } from '../hooks/useIsMobile'

const FONT = "'Geist Mono', 'Courier New', monospace"

const CATEGORY_COLORS = [
  { label: 'Staking',        color: '#00D4FF' },
  { label: 'Lending',        color: '#00FFA3' },
  { label: 'Yield',          color: '#FF5FAD' },
  { label: 'Infrastructure', color: '#FF7A45' },
  { label: 'Validator',      color: '#8B93A7' },
]

const RAIKU_LOGO = '/raiku-logo.png'

// ── Ecosystem Progress (desktop bottom CTA) ───────────────────────────────────
function BottomCTA() {
  const { selectedId, protocols } = useStore()
  if (selectedId) return null

  const liveCount      = protocols.filter(p => p.status !== 'announced' && p.kind !== 'validator-stake').length
  const announcedCount = protocols.filter(p => p.status === 'announced').length

  return (
    <div style={{
      position: 'fixed', bottom: '28px', left: '50%',
      transform: 'translateX(-50%)',
      fontFamily: FONT, textAlign: 'center',
      pointerEvents: 'auto', zIndex: 5,
    }}>
      {/* Progress blocks */}
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '14px' }}>
        <ProgressBlock value={String(liveCount)}      label="LIVE"         color="#00E5AA" />
        <BlockDivider />
        <ProgressBlock value={String(announcedCount)} label="COMING SOON"  color="#B06EFF" />
        <BlockDivider />
        <ProgressBlock value="?"                      label="MORE COMING"  color="#445" />
      </div>

      {/* Get rkuSOL button */}
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
          fontSize: '13px', fontWeight: '600',
          letterSpacing: '2px', textDecoration: 'none',
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => {
          (e.currentTarget as HTMLAnchorElement).style.background    = 'rgba(192,255,56,0.14)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor  = 'rgba(192,255,56,0.6)'
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLAnchorElement).style.background    = 'rgba(192,255,56,0.07)'
          ;(e.currentTarget as HTMLAnchorElement).style.borderColor  = 'rgba(192,255,56,0.35)'
        }}
      >
        Get rkuSOL →
      </a>
    </div>
  )
}

function ProgressBlock({ value, label, color }: { value: string; label: string; color: string }) {
  return (
    <div style={{ textAlign: 'center', padding: '0 22px' }}>
      <div style={{ fontSize: '26px', fontWeight: 'bold', color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#556', letterSpacing: '2px', marginTop: '6px' }}>{label}</div>
    </div>
  )
}

function BlockDivider() {
  return <div style={{ width: '1px', height: '38px', background: 'rgba(255,255,255,0.08)' }} />
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
  const { rkuSOL, lastUpdated, fetchError } = useStore()
  const isMobile = useIsMobile()
  const [showInfo, setShowInfo] = useState(false)

  return (
    <>
      {/* Top-left */}
      <div style={{
        position: 'fixed', top: isMobile ? '16px' : '28px', left: isMobile ? '16px' : '32px',
        fontFamily: FONT,
        pointerEvents: 'none', zIndex: 5,
      }}>
        <img
          src={RAIKU_LOGO}
          alt="Raiku"
          style={{ height: isMobile ? '24px' : '38px', display: 'block', marginBottom: isMobile ? '8px' : '14px' }}
        />

        {/* rkuSOL title + "?" button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            fontSize: isMobile ? '24px' : '38px', fontWeight: 'bold',
            letterSpacing: isMobile ? '4px' : '8px', color: '#C0FF38',
            textShadow: '0 0 28px #C0FF3888, 0 0 70px #C0FF3833',
          }}>
            rkuSOL
          </div>
          <button
            onClick={() => setShowInfo(v => !v)}
            style={{
              pointerEvents: 'auto',
              background: showInfo ? 'rgba(192,255,56,0.12)' : 'none',
              border: `1px solid ${showInfo ? 'rgba(192,255,56,0.4)' : 'rgba(255,255,255,0.2)'}`,
              borderRadius: '50%',
              width: isMobile ? '16px' : '20px',
              height: isMobile ? '16px' : '20px',
              color: showInfo ? '#C0FF38' : '#778',
              fontSize: isMobile ? '10px' : '12px',
              cursor: 'pointer',
              fontFamily: FONT,
              lineHeight: 1,
              flexShrink: 0,
              transition: 'background 0.2s, border-color 0.2s, color 0.2s',
            }}
          >
            ?
          </button>
        </div>

        {/* Tooltip */}
        {showInfo && (
          <div style={{
            marginTop: '8px',
            padding: '10px 14px',
            background: 'rgba(1,2,14,0.92)',
            border: '1px solid rgba(255,255,255,0.12)',
            borderRadius: '6px',
            fontSize: '13px', color: '#bbc',
            lineHeight: 1.75,
            maxWidth: isMobile ? '220px' : '260px',
          }}>
            Liquid staking token for Solana.<br />
            Stake SOL and use rkuSOL across DeFi.
          </div>
        )}

        <div style={{ fontSize: isMobile ? '11px' : '14px', letterSpacing: '3px', color: '#aab', marginTop: '6px' }}>
          Liquid Staking Token on Solana
        </div>

        {/* Supply — key triggers animation on update */}
        <div style={{ marginTop: isMobile ? '8px' : '16px', fontSize: isMobile ? '13px' : '16px', color: '#bbc', lineHeight: 2.0 }}>
          Supply&nbsp;&nbsp;
          <span
            key={lastUpdated ? rkuSOL.supply : 'loading'}
            style={{
              color: !lastUpdated ? '#556' : fetchError ? '#8a8f9e' : '#FFB830',
              fontWeight: 'bold',
              animation: lastUpdated && !fetchError ? 'supplyPulse 0.9s ease-out' : 'none',
            }}
          >
            {lastUpdated ? rkuSOL.supply.toLocaleString() : '· · ·'}
          </span>
          {lastUpdated && ' rkuSOL'}
        </div>

        {/* 発行量の取得に失敗した場合の注意書き */}
        {fetchError && (
          <div style={{ fontSize: isMobile ? '10px' : '12px', color: '#FF8A99', letterSpacing: '1px', marginTop: '2px' }}>
            Live supply unavailable · showing reference value
          </div>
        )}

        {/* Mobile: CTA + disclaimer */}
        {isMobile && (
          <a
            href="https://raiku.com"
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: 'inline-block',
              marginTop: '10px',
              padding: '6px 14px',
              border: '1px solid rgba(192,255,56,0.35)',
              borderRadius: '4px',
              background: 'rgba(192,255,56,0.07)',
              color: '#C0FF38',
              fontFamily: FONT,
              fontSize: '12px', fontWeight: '600',
              letterSpacing: '1px', textDecoration: 'none',
              pointerEvents: 'auto',
            }}
          >
            Get rkuSOL →
          </a>
        )}
        <div style={{ marginTop: '8px', fontSize: '11px', color: '#aab', letterSpacing: '1px' }}>
          Unofficial fan site · Not affiliated with Raiku
        </div>
      </div>

      {/* Bottom-left */}
      <div style={{
        position: 'fixed', bottom: isMobile ? '16px' : '28px', left: isMobile ? '16px' : '32px',
        fontFamily: FONT,
        pointerEvents: 'none', zIndex: 5,
      }}>
        {/* LIVE indicator */}
        <div style={{ fontSize: isMobile ? '12px' : '14px', color: '#bbc', letterSpacing: '2px', marginBottom: isMobile ? '6px' : '16px' }}>
          <span style={{
            display: 'inline-block', width: '7px', height: '7px',
            borderRadius: '50%', background: fetchError ? '#FF4455' : '#00E5AA',
            marginRight: '8px', verticalAlign: 'middle',
            animation: fetchError ? 'none' : 'blink 2.4s ease-in-out infinite',
          }} />
          {fetchError ? 'DATA ERROR' : 'LIVE'}&nbsp;&nbsp;·&nbsp;&nbsp;
          {lastUpdated ? lastUpdated.toLocaleTimeString() : '--:--:--'}
        </div>

        {/* Mobile: tap hint */}
        {isMobile && (
          <div style={{ fontSize: '11px', color: '#778', letterSpacing: '1px', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            Tap planet · Size = rkuSOL TVL
          </div>
        )}

        {/* Category legend — desktop only */}
        {!isMobile && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '9px', marginTop: '16px' }}>
            {CATEGORY_COLORS.map(c => (
              <div key={c.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%', background: c.color,
                  boxShadow: `0 0 8px ${c.color}99`, flexShrink: 0,
                }} />
                <span style={{ fontSize: '14px', color: '#bbc', letterSpacing: '1px', textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>{c.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Map legend — desktop only */}
        {!isMobile && (
          <div style={{ marginTop: '14px', fontSize: '13px', color: '#aab', lineHeight: 1.9, textShadow: '0 1px 4px rgba(0,0,0,0.9)' }}>
            <div>◎ Size = rkuSOL TVL&nbsp;&nbsp;· · · Flow = Liquidity</div>
            <div>🪐 Orbit = Integration Role</div>
            <div>◦ Inner orbit = SOL staked to Raiku validator</div>
          </div>
        )}
      </div>

      {/* Bottom-right hint — desktop only */}
      {!isMobile && <BottomHint />}

      {/* Ecosystem Progress + CTA — desktop only */}
      {!isMobile && <BottomCTA />}
    </>
  )
}
