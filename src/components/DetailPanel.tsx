import { useStore } from '../store'

function fmt(v: number): string {
  if (v >= 1e9) return `$${(v / 1e9).toFixed(2)}B`
  if (v >= 1e6) return `$${(v / 1e6).toFixed(1)}M`
  return `$${v.toLocaleString()}`
}

const PROTOCOL_URL: Record<string, string> = {
  sanctum:   'https://sanctum.so',
  jupiter:   'https://jup.ag',
  kamino:    'https://kamino.finance',
  loopscale: 'https://loopscale.com',
  exponent:  'https://www.exponent.finance',
}

const CATEGORY_COLOR: Record<string, string> = {
  Staking:        '#00D4FF',
  Lending:        '#00FFA3',
  Yield:          '#FF5FAD',
  Infrastructure: '#FF7A45',
}

const INTEGRATION_BASIS: Record<string, { status: 'LIVE' | 'ANNOUNCED'; detail: string }> = {
  sanctum:   { status: 'LIVE',     detail: 'LST infrastructure partner. rkuSOL routed through Sanctum Infinity pool at launch.' },
  jupiter:   { status: 'LIVE',     detail: 'Launch partner. rkuSOL accessible via Jupiter swap from day one.' },
  kamino:    { status: 'LIVE',     detail: 'rkuSOL accepted as collateral in Kamino lending markets.' },
  loopscale: { status: 'ANNOUNCED', detail: 'Confirmed launch partner (Solana Circuit Ep.29 + press release). rkuSOL looping strategy announced — Earn Vault deployment in progress.' },
  exponent:  { status: 'LIVE',     detail: 'rkuSOL listed on Exponent yield exchange. Rockaway X rkuSOL Earn Vault live.' },
}


export function DetailPanel() {
  const { selectedId, protocols, rkuSOL, setSelected } = useStore()
  if (!selectedId) return null

  const isRkuSOL = selectedId === 'rkusol'
  const protocol = protocols.find(p => p.id === selectedId)

  return (
    <div style={{
      position: 'fixed', top: 0, right: 0,
      width: '300px', height: '100vh',
      background: 'linear-gradient(to left, rgba(1,2,14,0.97), rgba(1,2,14,0.90))',
      borderLeft: '1px solid rgba(255,255,255,0.10)',
      padding: '40px 26px 32px',
      fontFamily: "'Geist Mono', 'Courier New', monospace",
      color: '#bbc',
      display: 'flex', flexDirection: 'column', gap: '20px',
      zIndex: 10,
      backdropFilter: 'blur(10px)',
      animation: 'slideIn 0.22s ease-out',
      overflowY: 'auto',
    }}>
      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>

      <button
        onClick={() => setSelected(null)}
        style={{
          position: 'absolute', top: '16px', right: '16px',
          background: 'none', border: 'none',
          color: '#778', fontSize: '20px', cursor: 'pointer',
          fontFamily: 'inherit', lineHeight: 1,
        }}
      >✕</button>

      {isRkuSOL ? (
        <RkuSOLDetail rkuSOL={rkuSOL} protocolCount={protocols.length} />
      ) : protocol ? (
        <ProtocolDetail protocol={protocol} />
      ) : null}
    </div>
  )
}

function RkuSOLDetail({ rkuSOL, protocolCount }: { rkuSOL: any; protocolCount: number }) {
  return (
    <>
      <div>
        <div style={{ fontSize: '13px', letterSpacing: '4px', color: '#778' }}>CENTRAL STAR</div>
        <div style={{ fontSize: '29px', fontWeight: 'bold', color: '#FFB830', marginTop: '8px',
          textShadow: '0 0 20px #FFB83066' }}>
          rkuSOL
        </div>
        <div style={{ fontSize: '14px', color: '#778', marginTop: '6px', letterSpacing: '1px' }}>
          Liquid Staking Token · Solana
        </div>
      </div>

      <Divider />

      <StatRow label="Supply"    value={`${rkuSOL.supply.toLocaleString()} rkuSOL`} color="#C0FF38" />
      <div style={{ fontSize: '12px', color: '#556', marginTop: '-10px', lineHeight: 1.7 }}>
        Ranked in top 30 Solana LSTs within 1 week of launch (Sanctum tracker).
      </div>
      <StatRow label="Ecosystem" value={`${protocolCount} Protocols`}               color="#bbc" />

      <Divider />

      <Label>ABOUT</Label>
      <Body>
        Liquid Staking Token issued by Raiku, a Solana validator.
        Stakers receive base staking rewards plus additional yield
        from Raiku's validator operations — without locking up SOL.
      </Body>

      <Divider />

      <DataSources lines={[
        'Supply · Solana RPC (real-time)',
        'Updated every 5 minutes',
      ]} />
    </>
  )
}

function ProtocolDetail({ protocol }: { protocol: any }) {
  const catColor = CATEGORY_COLOR[protocol.category] ?? '#aaa'
  const hasRkuSOLTvl = protocol.connectedLiquidity !== null

  return (
    <>
      <div>
        <div style={{ fontSize: '13px', letterSpacing: '4px', color: '#778' }}>PROTOCOL</div>
        <div style={{ fontSize: '25px', fontWeight: 'bold', color: protocol.color, marginTop: '8px',
          textShadow: `0 0 16px ${protocol.color}55` }}>
          {protocol.name}
        </div>
        <div style={{
          display: 'inline-block', marginTop: '10px',
          padding: '3px 12px', borderRadius: '3px',
          border: `1px solid ${catColor}55`,
          background: `${catColor}18`,
          color: catColor, fontSize: '13px', letterSpacing: '1px',
        }}>
          {protocol.category.toUpperCase()}
        </div>
      </div>

      <Divider />

      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <StatRow label="Protocol TVL" value={fmt(protocol.tvl)} color={protocol.color} />
          <div style={{ fontSize: '12px', color: '#556', marginTop: '5px', lineHeight: 1.7 }}>
            Total value locked in {protocol.name} across all assets.
            {hasRkuSOLTvl
              ? ' Planet size reflects rkuSOL deposits specifically.'
              : ' Planet size uses a fixed default — rkuSOL-specific data not available.'}
          </div>
        </div>

        {hasRkuSOLTvl && (
          <div>
            <StatRow label="rkuSOL TVL" value={fmt(protocol.connectedLiquidity)} color="#FFB830" />
            <div style={{ fontSize: '12px', color: '#556', marginTop: '5px', lineHeight: 1.7 }}>
              Actual rkuSOL deposited in this protocol specifically.
              Sourced from DeFiLlama yield pools.
            </div>
          </div>
        )}
      </div>

      <Divider />

      <Label>ROLE WITH rkuSOL</Label>
      <Body>{protocol.description}</Body>

      {INTEGRATION_BASIS[protocol.id] && (() => {
        const b = INTEGRATION_BASIS[protocol.id]
        const isLive = b.status === 'LIVE'
        return (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <div style={{ fontSize: '13px', color: '#889', letterSpacing: '3px' }}>INTEGRATION</div>
              <div style={{
                fontSize: '10px', letterSpacing: '2px',
                color: isLive ? '#00E5AA' : '#B06EFF',
                border: `1px solid ${isLive ? 'rgba(0,229,170,0.3)' : 'rgba(176,110,255,0.3)'}`,
                borderRadius: '2px', padding: '1px 7px',
              }}>
                ● {b.status}
              </div>
            </div>
            <div style={{ fontSize: '13px', color: '#778', lineHeight: 1.8 }}>
              {b.detail}
            </div>
          </div>
        )
      })()}

      {PROTOCOL_URL[protocol.id] && (
        <a
          href={PROTOCOL_URL[protocol.id]}
          target="_blank"
          rel="noopener noreferrer"
          style={{
            display: 'block',
            padding: '10px 16px',
            border: `1px solid ${protocol.color}33`,
            borderRadius: '4px',
            background: `${protocol.color}0a`,
            color: protocol.color,
            fontFamily: "'Geist Mono', 'Courier New', monospace",
            fontSize: '13px',
            fontWeight: '600',
            letterSpacing: '2px',
            textDecoration: 'none',
            textAlign: 'center',
          }}
        >
          Visit {protocol.name} →
        </a>
      )}

      <Divider />

      <DataSources lines={[
        'Protocol TVL · DeFiLlama (real-time)',
        hasRkuSOLTvl
          ? 'rkuSOL TVL · DeFiLlama Yields (real-time)'
          : 'rkuSOL TVL · data not available',
        'Updated every 5 minutes',
      ]} />
    </>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

function StatRow({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
      <span style={{ fontSize: '14px', color: '#889', letterSpacing: '1px' }}>{label}</span>
      <span style={{ fontSize: '17px', fontWeight: 'bold', color }}>{value}</span>
    </div>
  )
}

function DataSources({ lines }: { lines: string[] }) {
  return (
    <div style={{
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '4px',
      padding: '12px 14px',
    }}>
      <div style={{ fontSize: '11px', letterSpacing: '3px', color: '#556', marginBottom: '8px' }}>
        DATA SOURCES
      </div>
      {lines.map(line => (
        <div key={line} style={{ fontSize: '12px', color: '#667', lineHeight: 1.9 }}>
          · {line}
        </div>
      ))}
    </div>
  )
}

function Divider() {
  return <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
}

function Label({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '13px', color: '#889', letterSpacing: '3px' }}>{children}</div>
}

function Body({ children }: { children: React.ReactNode }) {
  return <div style={{ fontSize: '16px', color: '#99a', lineHeight: 1.85 }}>{children}</div>
}
