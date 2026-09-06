// rkuSOL の「今日の1点」を public/history.json に追記する。
// 毎日1回だけ実行する想定。同じ日付が既にある場合は上書きするので、
// 二重に実行してもファイルは壊れない。
//
// 実行: node scripts/snapshot.mjs

import { readFile, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const RKUSOL_MINT = 'rkubjTrZYioRSeXwDnhwGQzvW3qkcin72JSxUt3WMVp'
const JUP_TOKEN_API = 'https://lite-api.jup.ag/tokens/v2/search'
const YIELDS_POOLS = 'https://yields.llama.fi/pools'
const HISTORY_PATH = resolve(import.meta.dirname, '../public/history.json')

// UTCの日付。実行時刻がずれても同じ日は1点にまとまる
function today() {
  return new Date().toISOString().slice(0, 10)
}

async function getJson(url) {
  const res = await fetch(url, { headers: { accept: 'application/json' } })
  if (!res.ok) throw new Error(`${res.status} ${url}`)
  return res.json()
}

// 発行量・ホルダー数・価格（Jupiter Token API 1回で全部取れる）
async function fetchToken() {
  const list = await getJson(`${JUP_TOKEN_API}?query=${RKUSOL_MINT}`)
  const t = Array.isArray(list) ? list.find(x => x?.id === RKUSOL_MINT) : null
  if (!t) throw new Error('rkuSOL がレスポンスに見つかりません')

  const supply = t.totalSupply
  const holders = t.holderCount
  const price = t.usdPrice
  // 0 や null をそのまま記録すると「急に消えた」グラフになるため弾く
  if (!(supply > 0) || !(price > 0)) throw new Error('発行量または価格が不正です')

  return { supply, holders: holders > 0 ? holders : null, price }
}

// Kamino に担保として預けられている rkuSOL（ドル額）
// PT-RKUSOL は別物なので含めない
async function fetchKaminoUsd() {
  const { data } = await getJson(YIELDS_POOLS)
  const pool = data?.find(p =>
    p.project === 'kamino-lend' &&
    (p.symbol ?? '').toUpperCase() === 'RKUSOL'
  )
  if (!pool || !(pool.tvlUsd > 0)) throw new Error('Kamino の rkuSOL プールが見つかりません')
  return pool.tvlUsd
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
  const date = today()
  const entry = { date }
  const failed = []

  try {
    const t = await fetchToken()
    entry.supply = Math.round(t.supply)
    entry.price = Number(t.price.toFixed(4))
    if (t.holders !== null) entry.holders = t.holders
  } catch (e) {
    failed.push(`Jupiter: ${e.message}`)
  }

  try {
    const usd = await fetchKaminoUsd()
    entry.kaminoUsd = Math.round(usd)
    // 枚数は価格が取れたときだけ。ドル額は価格の値上がりでも増えてしまうため、
    // 「実際に預けられた量」を見るには枚数が必要
    if (entry.price) entry.kaminoTokens = Math.round(usd / entry.price)
  } catch (e) {
    failed.push(`DeFiLlama: ${e.message}`)
  }

  // 何ひとつ取れなかった日は記録しない（空の点を残すと折れ線が途切れる）
  if (Object.keys(entry).length === 1) {
    console.error('取得に失敗したため記録しません')
    failed.forEach(m => console.error('  ' + m))
    process.exit(1)
  }

  const history = await readHistory()
  const i = history.days.findIndex(d => d.date === date)
  if (i >= 0) history.days[i] = { ...history.days[i], ...entry }
  else history.days.push(entry)
  history.days.sort((a, b) => a.date.localeCompare(b.date))
  history.updatedAt = new Date().toISOString()

  await writeFile(HISTORY_PATH, JSON.stringify(history, null, 2) + '\n')

  console.log(`${date} を記録しました (${history.days.length}日分)`)
  console.log('  ' + JSON.stringify(entry))
  if (failed.length) {
    console.warn('一部取得できませんでした:')
    failed.forEach(m => console.warn('  ' + m))
  }
}

main().catch(e => {
  console.error('失敗:', e.message)
  process.exit(1)
})
