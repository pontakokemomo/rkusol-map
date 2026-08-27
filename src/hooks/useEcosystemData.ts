import { useEffect } from 'react'
import { useStore } from '../store'

const SLUGS = ['sanctum', 'jupiter', 'kamino', 'loopscale', 'exponent']
const RKUSOL_MINT = 'rkubjTrZYioRSeXwDnhwGQzvW3qkcin72JSxUt3WMVp'

const SOLANA_RPCS = [
  'https://api.mainnet-beta.solana.com',
  'https://rpc.ankr.com/solana',
  'https://solana-rpc.publicnode.com',
]

// Jupiter Token API（APIキー不要・CORS許可あり）
const JUP_TOKEN_API = 'https://lite-api.jup.ag/tokens/v2/search'

// 第1候補: Jupiter Token API から発行量を取得
async function fetchSupplyFromJupiter(): Promise<number | null> {
  try {
    const res = await fetch(`${JUP_TOKEN_API}?query=${RKUSOL_MINT}`)
      .then(r => r.json())
    if (!Array.isArray(res)) return null
    const token = res.find(t => t?.id === RKUSOL_MINT)
    const amount = token?.totalSupply
    return typeof amount === 'number' ? amount : null
  } catch {
    return null
  }
}

// 第2候補: Solana RPC（公開RPCは有料化・制限が入りやすいため fallback 扱い）
async function fetchSupplyFromRpc(): Promise<number | null> {
  const body = JSON.stringify({
    jsonrpc: '2.0', id: 1,
    method: 'getTokenSupply',
    params: [RKUSOL_MINT],
  })
  for (const rpc of SOLANA_RPCS) {
    try {
      const res = await fetch(rpc, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body,
      }).then(r => r.json())
      const amount = res?.result?.value?.uiAmount
      if (typeof amount === 'number') return amount
    } catch {
      // 次のRPCを試みる
    }
  }
  return null
}

async function fetchSupply(): Promise<number | null> {
  return (await fetchSupplyFromJupiter()) ?? (await fetchSupplyFromRpc())
}

// DeFiLlama yields API のプロジェクト名 → protocol.id（前方一致で対応）
function mapYieldsProject(project: string): string | null {
  const p = project.toLowerCase()
  if (p === 'kamino' || p.startsWith('kamino-')) return 'kamino'
  if (p === 'exponent' || p.startsWith('exponent')) return 'exponent'
  return null
}

export function useEcosystemData() {
  const { setData, setLastUpdated, setFetchError } = useStore()

  async function fetchAll() {
    try {
      const { protocols, rkuSOL } = useStore.getState()
      const [tvls, supplyAmount, yieldsRes] = await Promise.all([
        // プロトコル全体の TVL（DeFiLlama /tvl/{slug}）
        Promise.all(SLUGS.map(s =>
          fetch(`https://api.llama.fi/tvl/${s}`).then(r => r.json()).catch(() => null)
        )),
        // rkuSOL の発行量（Jupiter → Solana RPC の順に fallback）
        fetchSupply(),
        // rkuSOL 専用プール TVL（DeFiLlama yields API）
        fetch('https://yields.llama.fi/pools')
          .then(r => r.json())
          .catch(() => null),
      ])

      const supply = supplyAmount ?? rkuSOL.supply

      // rkuSOL mint を含むプールの TVL を protocol.id → tvlUsd でまとめる
      const rkusolPoolTvl: Record<string, number> = {}
      if (yieldsRes?.data) {
        for (const pool of yieldsRes.data) {
          const tokens: string[] = pool.underlyingTokens ?? []
          const mintMatch = tokens.some(
            (t: string) => t.toLowerCase() === RKUSOL_MINT.toLowerCase()
          )
          // symbol にも "rkusol" が含まれる場合を fallback で拾う
          const symbolMatch = (pool.symbol ?? '').toLowerCase().includes('rkusol')
          if ((mintMatch || symbolMatch) && pool.project) {
            const id = mapYieldsProject(pool.project)
            if (id) {
              rkusolPoolTvl[id] = (rkusolPoolTvl[id] ?? 0) + (pool.tvlUsd ?? 0)
            }
          }
        }
      }

      const rkusolTvlTotal = Object.values(rkusolPoolTvl).reduce((a, b) => a + b, 0)

      const updatedProtocols = protocols.map((p, i) => {
        // validator-stake（Shinobi等）はDeFiLlama非対応のためデフォルト値を維持
        if (p.kind === 'validator-stake') return p

        const protocolTvl = typeof tvls[i] === 'number' ? tvls[i] : p.tvl
        const rkusolTvl = rkusolPoolTvl[p.id]
        return {
          ...p,
          tvl: protocolTvl,
          // 惑星サイズはrkuSOL専用TVLが取れた場合のみ更新、それ以外はデフォルト維持
          planetSize: rkusolTvl != null ? calcPlanetSize(rkusolTvl) : p.planetSize,
          streamParticles: rkusolTvl != null
            ? Math.max(20, calcParticles(rkusolTvl, rkusolTvlTotal))
            : p.streamParticles,
          connectedLiquidity: rkusolTvl != null ? rkusolTvl : p.connectedLiquidity,
        }
      })

      const updatedRkuSOL = {
        ...rkuSOL,
        supply: Math.floor(supply),
        ecosystemCount: updatedProtocols.filter(p => p.kind !== 'validator-stake').length,
      }

      setData(updatedRkuSOL, updatedProtocols)
      setLastUpdated(new Date())
      // 発行量が取得できなかった場合は、古い値を黙って出さずに警告表示する
      setFetchError(supplyAmount == null ? 'Supply unavailable' : null)
    } catch (e) {
      setLastUpdated(new Date())
      setFetchError('Data update failed')
    }
  }

  useEffect(() => {
    fetchAll()
    const interval = setInterval(fetchAll, 5 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])
}

function calcPlanetSize(tvl: number): number {
  if (!tvl || tvl <= 0) return 0.4
  const logScale = Math.log10(tvl)
  // $0 → 0.4 (default), ~$16M → 0.35 (min), $100M → 0.55, $1B → 0.80, ~$16B → 1.1 (max)
  return Math.max(0.35, Math.min(1.1, (logScale - 7) * 0.25 + 0.3))
}

function calcParticles(tvl: number, total: number): number {
  if (!tvl || !total) return 20
  const ratio = Math.min(tvl / total, 1)
  return Math.round(20 + ratio * 120)
}
