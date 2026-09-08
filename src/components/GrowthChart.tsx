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
  // 上の Supply 行と同じ数字を繰り返さないため、伸び率で見出しを出す指定
  head?: 'multiple'
  // 全体の何割かを併記する指定。形しか見ない読み手に「一部だ」と伝えるため
  shareOf?: SeriesKey
}

const SERIES: Record<SeriesKey, SeriesDef> = {
  supply: {
    key: 'supply',
    label: 'SUPPLY',
    color: '#C0FF38',
    note: 'Total rkuSOL minted. Recorded by this site since Jun 2026.',
    head: 'multiple',
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
    shareOf: 'supply',
  },
}

// 折れ線にするための最小点数。これ未満は線の形が意味を持たないため文章で出す
const MIN_POINTS_FOR_LINE = 5

// 記録が空いた区間を点線にする閾値。毎日記録なら1日なので、8日以上空いたら未測定とみなす
const GAP_DAYS = 7
const DAY_MS = 86400000

// 実測日に丸を打つ上限。毎日記録の系列（80点超）では潰れて読めなくなる
const SHOW_DOTS_MAX = 20

// この割合未満の増減は測定のゆらぎとみなし、増減として色をつけない
const NOISE_RATIO = 0.01

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function shortDate(iso: string): string {
  const [, m, d] = iso.split('-')
  return `${MONTHS[Number(m) - 1]} ${d}`
}

// 両方の値がそろう最新の日で割合を出す。記録日がずれても正しい組で計算するため
function shareOfLatest(days: Day[], key: SeriesKey, base: SeriesKey): string | null {
  for (let i = days.length - 1; i >= 0; i--) {
    const a = days[i][key]
    const b = days[i][base]
    if (typeof a === 'number' && typeof b === 'number' && b > 0) {
      return `${Math.round((a / b) * 100)}% of ${SERIES[base].label.toLowerCase()}`
    }
  }
  return null
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
        <Series key={def.key} def={def} rows={rows} days={days} />
      ))}
    </>
  )
}

// ── 1系列 ─────────────────────────────────────────────────────────────────────

function Series({ def, rows, days }: { def: SeriesDef; rows: Day[]; days: Day[] }) {
  const values = rows.map(r => r[def.key] as number)
  const first = values[0]
  const last = values[values.length - 1]
  const delta = last - first
  // 上の Supply 行と数字が重複するので、伸び率に置き換える
  const headline = def.head === 'multiple' && first > 0
    ? `×${(last / first).toFixed(1)}`
    : last.toLocaleString()
  const share = def.shareOf ? shareOfLatest(days, def.key, def.shareOf) : null

  return (
    <div>
      <div style={{
        display: 'flex', alignItems: 'baseline', justifyContent: 'space-between',
        marginBottom: share ? '3px' : '10px', gap: '8px',
      }}>
        <span style={{ fontSize: '13px', color: '#889', letterSpacing: '3px' }}>{def.label}</span>
        <span style={{ fontSize: '15px', fontWeight: 'bold', color: def.color }}>
          {headline}
        </span>
      </div>

      {/* 全体の一部であることを、文字が読めなくても数字で分かるようにする */}
      {share && (
        <div style={{
          textAlign: 'right', fontFamily: FONT,
          fontSize: '11px', color: '#667', marginBottom: '10px',
        }}>
          {share}
        </div>
      )}

      {rows.length >= MIN_POINTS_FOR_LINE
        ? <Sparkline rows={rows} values={values} color={def.color} />
        : <TextSummary rows={rows} first={first} delta={delta} color={def.color} />}

      <div style={{ fontSize: '12px', color: '#556', marginTop: '9px', lineHeight: 1.7 }}>
        {def.note}
      </div>
    </div>
  )
}

// 点が少ないうちは線にせず、変化を文章で出す
function TextSummary({ rows, first, delta, color }:
  { rows: Day[]; first: number; delta: number; color: string }) {
  // 1%未満の増減は測定のゆらぎの範囲。増減として色をつけず stable と出す
  const noise = first > 0 && Math.abs(delta) / first < NOISE_RATIO
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
      <span style={{ color: noise ? '#667' : color, fontWeight: 'bold', marginLeft: 'auto' }}>
        {noise ? 'stable' : signed(delta)}
      </span>
    </div>
  )
}

// 折れ線。棒と違いゼロ基準にしないので、わずかな変化も形として見える。
// そのぶん誇張になりうるため、上下の実数値を必ず併記する。
const W = 240
const H = 62
const PAD_Y = 6

interface Seg { d: string; gap: boolean }

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

  const at = (i: number) => `${pts[i][0].toFixed(1)} ${pts[i][1].toFixed(1)}`

  // 記録が空いた区間は点線にする。実線でつなぐと毎日測ったことになってしまう
  const segs: Seg[] = []
  for (let i = 1; i < pts.length; i++) {
    const gap = times[i] - times[i - 1] > GAP_DAYS * DAY_MS
    const prev = segs[segs.length - 1]
    if (prev && prev.gap === gap) prev.d += ` L${at(i)}`
    else segs.push({ d: `M${at(i - 1)} L${at(i)}`, gap })
  }
  const hasGap = segs.some(s => s.gap)

  const area = `${pts.map((_, i) => `${i ? 'L' : 'M'}${at(i)}`).join(' ')} L${W} ${H} L0 ${H} Z`
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
        {segs.map((s, i) => (
          <path key={i} d={s.d} fill="none" stroke={color} strokeWidth="1.6"
            strokeLinejoin="round" strokeLinecap="round"
            strokeOpacity={s.gap ? 0.55 : 1}
            strokeDasharray={s.gap ? '2 3' : undefined} />
        ))}
        {/* 点が少ないときだけ実測日に丸を打つ。毎日記録の系列では潰れるので出さない */}
        {pts.length <= SHOW_DOTS_MAX && pts.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="2" fill={color} />
        ))}
        <circle cx={lx} cy={ly} r="2.6" fill={color} />
      </svg>

      {/* 縦軸をゼロから描いていないので、実際の範囲を数字で示す。
          パネル幅が狭く1行に3つ入れると詰まって読めないため2行に分ける */}
      <div style={{ fontFamily: FONT, fontSize: '11px', color: '#667', marginTop: '5px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>{shortDate(rows[0].date)}</span>
          <span>{shortDate(rows[rows.length - 1].date)}</span>
        </div>
        <div style={{ marginTop: '3px' }}>
          range {min.toLocaleString()} – {max.toLocaleString()}
        </div>
      </div>

      {hasGap && (
        <div style={{ fontFamily: FONT, fontSize: '11px', color: '#556', marginTop: '4px' }}>
          Dotted = no records between marks.
        </div>
      )}
    </div>
  )
}
