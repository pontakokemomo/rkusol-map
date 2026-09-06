// 過去分の「Kaminoに預けられた rkuSOL」を public/history.json に流し込む。
// 最初に1回だけ実行すればよい（何度実行しても既存の記録は書き換えない）。
//
// 発行量とホルダー数は過去データを配布しているAPIが無いため、
// ここで埋められるのは Kamino の預入分と価格だけ。
//
// 実行: node scripts/seed-history.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const RKUSOL_MINT = 'rkubjTrZYioRSeXwDnhwGQzvW3qkcin72JSxUt3WMVp'
const YIELDS_POOLS = 'https://yields.llama.fi/pools'
const YIELDS_CHART = 'https://yields.llama.fi/chart'
const PRICE_CHART = `https://coins.llama.fi/chart/solana:${RKUSOL_MINT}?span=400&period=1d`
const HISTORY_PATH = resolve(import.meta.dirname, '../public/history.json')

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// 日付ごとの価格。ドル額を枚数に直すために使う
async function fetchPriceByDate() {
  const coins = await getJson(PRICE_CHART)
  const prices = Object.values(coins.coins ?? {})[0]?.prices ?? []
  const map = new Map()
  for (const p of prices) {
    if (!(p.price > 0)) continue
    const date = new Date(p.timestamp * 1000).toISOString().slice(0, 10)
    map.set(date, p.price)
  }
  return map
}

// Kamino の rkuSOL 担保プールの日次TVL（ドル）
async function fetchKaminoUsdByDate() {
  const { data } = await getJson(YIELDS_POOLS)
  const pool = data?.find(p =>
    p.project === 'kamino-lend' &&
    (p.symbol ?? '').toUpperCase() === 'RKUSOL'
  )
  if (!pool) throw new Error('Kamino の rkuSOL プールが見つかりません')

  const chart = await getJson(`${YIELDS_CHART}/${pool.pool}`)
  const map = new Map()
  for (const point of chart.data ?? []) {
    if (!(point.tvlUsd > 0)) continue
    map.set(point.timestamp.slice(0, 10), point.tvlUsd)
  }
  return map
}

async function readHistory() {
  try {
    const raw = await readFile(HISTORY_PATH, 'utf8')
    const json = JSON.parse(raw)
    return Array.isArray(json.days) ? json : { days: [] }
  } catch {
    return { days: [] }
  }
}

async function main() {
  const [priceByDate, usdByDate] = await Promise.all([
    fetchPriceByDate(),
    fetchKaminoUsdByDate(),
  ])

  const history = await readHistory()
  const byDate = new Map(history.days.map(d => [d.date, d]))
  let added = 0

  for (const [date, usd] of [...usdByDate].sort()) {
    const price = priceByDate.get(date)
    if (!price) continue

    const day = byDate.get(date) ?? { date }
    // 既にある値は触らない。当日分は snapshot が入れた実測値のほうが正確
    if (day.price === undefined) day.price = Number(price.toFixed(4))
    if (day.kaminoUsd === undefined) day.kaminoUsd = Math.round(usd)
    if (day.kaminoTokens === undefined) day.kaminoTokens = Math.round(usd / price)

    if (!byDate.has(date)) {
      byDate.set(date, day)
      added++
    }
  }

  history.days = [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
  history.updatedAt = new Date().toISOString()

  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n')

  const first = history.days[0]
  const last = history.days[history.days.length - 1]
  console.log(`過去分を ${added} 日追加しました（合計 ${history.days.length} 日）`)
  console.log(`  ${first.date}  Kamino ${first.kaminoTokens?.toLocaleString()} rkuSOL`)
  console.log(`  ${last.date}  Kamino ${last.kaminoTokens?.toLocaleString()} rkuSOL`)
}

main().catch(e => {
  console.error('失敗:', e.message)
  process.exit(1)
})
