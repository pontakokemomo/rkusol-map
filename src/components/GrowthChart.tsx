import { useEffect, useState } from 'react'

const FONT = "'Geist Mono', 'Courier New', monospace"

export interface Day {
  date: string
  supply?: number
  holders?: number
  kaminoTokens?: number
}

export type SeriesKey = 'supply' | 'holders' | 'kaminoTokens'

interface SeriesDef {
  key: SeriesKey
  label: string
  color: string
  note: string
}

const SERIES: Record<SeriesKey, SeriesDef> = {
  supply: {
    key: 'supply',
    label: 'SUPPLY',
    color: '#C0FF38',
    note: 'Total rkuSOL minted.',
  },
  holders: {
    key: 'holders',
    label: 'HOLDERS',
    color: '#FFB830',
    note: 'Wallets holding rkuSOL.',
  },
  kaminoTokens: {
    key: 'kaminoTokens',
    label: 'KAMINO COLLATERAL',
    color: '#00FFA3',
    note: 'rkuSOL deposited on Kamino. Counted in tokens, not USD, so price moves do not inflate it.',
  },
}

// 折れ線にするための最小点数。これ未満は線の形が意味を持たないため文章で出す
const MIN_POINTS_FOR_LINE = 5

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${MONTHS[Number(m) - 1]} ${d}`
}

function signed(n: number): string {
  return `${n >= 0 ? '+' : '−'}${Math.abs(n).toLocaleString()}`
}

// ── データ読み込み ────────────────────────────────────────────────────────────

let cache: Day[] | null = null

export function useHistory(): Day[] | null {
  const [days, setDays] = useState<Day[] | null>(cache)

  useEffect(() => {
    if (cache) return
    fetch('/history.json')
      .then(r => (r.ok ? r.json() : null))
      .then(j => {
        cache = Array.isArray(j?.days) ? j.days : []
        setDays(cache)
      })
      .catch(() => {
        cache = []
        setDays(cache)
      })
  }, [])

  return days
}

// ── まとめて出す用（rkuSOL パネル） ───────────────────────────────────────────

export function GrowthChart({ keys }: { keys: SeriesKey[] }) {
  const days = useHistory()
  if (!days) return null

  const ready = keys
    .map(k => ({ def: SERIES[k], rows: days.filter(d => typeof d[k] === 'number') }))
    // 1点しかない系列は変化を語れないので出さない。記録が育つと自動で現れる
    .filter(s => s.rows.length >= 2)

  if (ready.length === 0) return null

  return (
    <>
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)' }} />
      {ready.map(({ def, rows }) => (
        <Series key={def.key} def={def} rows={rows} />
      ))}
    </>
  )
}

// ── 1系列 ─────────────────────────────────────────────────────────────────────

function Series({ def, rows }: { def: SeriesDef; rows: Day[] }) {
  const values = rows.map(r => r[def.key] as number)
  const first = values[0]
  const last = values[values.length - 1]
  const delta = last - first

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: '10px', gap: '8px',
      }}>
        <span style={{ fontSize: '13px', color: '#889', letterSpacing: '3px' }}>{def.label}</span>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: def.color }}>
          {last.toLocaleString()}
        </span>
      </div>

      {rows.length >= MIN_POINTS_FOR_LINE
        ? <Sparkline rows={rows} values={values} color={def.color} />
        : <TextSummary rows={rows} delta={delta} color={def.color} />}

      <div style={{ fontSize: '12px', color: '#556', marginTop: '9px', lineHeight: 1.7 }}>
        {def.note}
      </div>
    </div>
  )
}

// 点が少ないうちは線にせず、変化を文章で出す
function TextSummary({ rows, delta, color }:
  { rows: Day[]; delta: number; color: string }) {
  const flat = delta === 0
  return (
    <div style={{
      display: 'flex', alignItems: 'baseline', gap: '8px',
      fontFamily: FONT, fontSize: '12px', color: '#778',
      padding: '10px 12px',
      background: 'rgba(255,255,255,0.03)',
      border: '1px solid rgba(255,255,255,0.07)',
      borderRadius: '4px',
    }}>
      <span>{shortDate(rows[0].date)} → {shortDate(rows[rows.length - 1].date)}</span>
      <span style={{ color: flat ? '#667' : color, fontWeight: 'bold', marginLeft: 'auto' }}>
        {flat ? 'no change' : signed(delta)}
      </span>
    </div>
  )
}

// 折れ線。棒と違いゼロ基準にしないので、わずかな変化も形として見える。
// そのぶん誇張になりうるため、上下の実数値を必ず併記する。
const W = 240
const H = 62
const PAD_Y = 6

function Sparkline({ rows, values, color }:
  { rows: Day[]; values: number[]; color: string }) {
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = max - min || 1

  // 記録が飛んだ日があっても正しい間隔で描くため、x は日付そのもので取る
  const times = rows.map(r => Date.parse(r.date))
  const t0 = times[0]
  const tSpan = times[times.length - 1] - t0 || 1

  const pts = values.map((v, i) => {
    const x = ((times[i] - t0) / tSpan) * W
    const y = PAD_Y + (1 - (v - min) / span) * (H - PAD_Y * 2)
    return [x, y] as const
  })

  const line = pts.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ')
  const area = `${line} L${W} ${H} L0 ${H} Z`
  const [lx, ly] = pts[pts.length - 1]
  const gid = `g-${color.slice(1)}`

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 'auto', display: 'block' }}>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"   stopColor={color} stopOpacity="0.22" />
            <stop offset="100%" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill={`url(#${gid})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="1.6"
          strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lx} cy={ly} r="2.6" fill={color} />
      </svg>

      {/* 縦軸をゼロから描いていないので、実際の範囲を数字で示す */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        fontFamily: FONT, fontSize: '11px', color: '#667', marginTop: '5px',
      }}>
        <span>{shortDate(rows[0].date)}</span>
        <span>range {min.toLocaleString()} – {max.toLocaleString()}</span>
        <span>{shortDate(rows[rows.length - 1].date)}</span>
      </div>
    </div>
  )
}
