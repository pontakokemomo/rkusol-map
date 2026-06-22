import { useState, useEffect } from 'react'

export function MobileGuard({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768)
    check()
    window.addEventListener('resize', check)
    return () => window.removeEventListener('resize', check)
  }, [])

  if (!isMobile || dismissed) return <>{children}</>

  return (
    <div style={{
      position: 'fixed', inset: 0,
      background: '#020208',
      display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      fontFamily: "'Geist Mono', 'Courier New', monospace",
      padding: '32px',
      textAlign: 'center',
      zIndex: 9999,
    }}>
      <img
        src="/rkusol-symbol.png"
        alt="rkuSOL"
        style={{ width: '80px', marginBottom: '32px', opacity: 0.9 }}
      />
      <div style={{ fontSize: '20px', fontWeight: '700', color: '#C0FF38', marginBottom: '12px', letterSpacing: '2px' }}>
        rkuSOL Ecosystem Map
      </div>
      <div style={{ fontSize: '14px', color: '#778', lineHeight: 1.8, marginBottom: '36px', maxWidth: '280px' }}>
        This 3D visualization is designed for desktop.<br />
        Please open on a computer for the full experience.
      </div>
      <button
        onClick={() => setDismissed(true)}
        style={{
          background: 'none',
          border: '1px solid rgba(255,255,255,0.15)',
          color: '#556',
          fontFamily: 'inherit',
          fontSize: '13px',
          padding: '10px 24px',
          borderRadius: '4px',
          cursor: 'pointer',
          letterSpacing: '1px',
        }}
      >
        View anyway
      </button>
    </div>
  )
}
