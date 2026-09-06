import { create } from 'zustand'
import type { Protocol, RkuSOLData } from './types'

interface AppStore {
  selectedId: string | null
  hoveredId: string | null
  rkuSOL: RkuSOLData
  protocols: Protocol[]
  lastUpdated: Date | null
  fetchError: string | null
  setSelected: (id: string | null) => void
  setHovered: (id: string | null) => void
  setData: (rkuSOL: RkuSOLData, protocols: Protocol[]) => void
  setLastUpdated: (d: Date) => void
  setFetchError: (e: string | null) => void
}

const DEFAULT_PROTOCOLS: Protocol[] = [
  {
    id: 'sanctum',
    name: 'Sanctum',
    category: 'Staking',
    color: '#00D4FF',
    hex: 0x00D4FF,
    role: 'Staking / Swap',
    orbitRadius: 7,
    orbitSpeed: 0.0040,
    orbitPhase: 0,
    planetSize: 0.85,
    tvl: 1300000000,
    apy: null,
    connectedLiquidity: null,
    description: 'LST infrastructure partner for rkuSOL. Provides instant liquidity and routing through the Sanctum Infinity pool, making rkuSOL seamlessly swappable across Solana.',
    streamParticles: 80,
  },
  {
    id: 'jupiter',
    name: 'Jupiter',
    category: 'Infrastructure',
    color: '#FF7A45',
    hex: 0xFF7A45,
    role: 'Aggregator',
    orbitRadius: 10,
    orbitSpeed: 0.0028,
    orbitPhase: Math.PI * 0.55,
    planetSize: 0.92,
    tvl: 1540000000,
    apy: null,
    connectedLiquidity: null,
    description: "Solana's leading DEX aggregator. Provides swap liquidity for rkuSOL and serves as the primary price discovery venue across the ecosystem.",
    streamParticles: 70,
  },
  {
    id: 'kamino',
    name: 'Kamino',
    category: 'Lending',
    color: '#00FFA3',
    hex: 0x00FFA3,
    role: 'Lending',
    orbitRadius: 13,
    orbitSpeed: 0.0019,
    orbitPhase: Math.PI * 1.05,
    planetSize: 0.85,
    tvl: 1240000000,
    apy: null,
    connectedLiquidity: null,
    description: 'Leading lending platform on Solana accepting rkuSOL as collateral. Supports leveraged strategies and borrowing against staked positions.',
    streamParticles: 55,
  },
  {
    id: 'loopscale',
    name: 'Loopscale',
    category: 'Lending',
    color: '#B06EFF',
    hex: 0xB06EFF,
    role: 'Loop Lending',
    orbitRadius: 16,
    orbitSpeed: 0.0013,
    orbitPhase: Math.PI * 1.55,
    planetSize: 0.50,
    tvl: 80820000,
    apy: null,
    connectedLiquidity: null,
    description: 'Modular lending protocol supporting leveraged loop strategies for rkuSOL. The rkuSOL/SOL loop market lets users borrow SOL against rkuSOL to increase rkuSOL exposure with up to 10x leverage. A separate PT-rkuSOL-31OCT26/SOL loop market (up to 4x leverage) is also listed. Verified on the Loopscale app (2026-08-01).',
    streamParticles: 30,
  },
  {
    id: 'exponent',
    name: 'Exponent',
    category: 'Yield',
    color: '#FF5FAD',
    hex: 0xFF5FAD,
    role: 'Fixed Yield',
    orbitRadius: 19,
    orbitSpeed: 0.0009,
    orbitPhase: Math.PI * 0.25,
    planetSize: 0.45,
    tvl: 73900000,
    apy: null,
    connectedLiquidity: null,
    description: 'Fixed-rate yield exchange on Solana. Trade the future yield of rkuSOL as a tokenized instrument — separate principal from yield.',
    streamParticles: 25,
  },
  {
    id: 'shinobi',
    name: 'Shinobi Stake Pool',
    category: 'Validator',
    kind: 'validator-stake',
    color: '#8B93A7',
    hex: 0x8B93A7,
    role: 'Validator Stake',
    orbitRadius: 5.5,
    orbitSpeed: 0.0055,
    orbitPhase: Math.PI * 0.8,
    planetSize: 0.4,
    tvl: 0,
    apy: null,
    connectedLiquidity: null,
    description: 'Solana stake pool delegating SOL to the Raiku validator, strengthening the stake base behind rkuSOL. Confirmed on the official Raiku Town Hall (2026-07-17).',
    streamParticles: 18,
  },
]

export const useStore = create<AppStore>((set) => ({
  selectedId: null,
  hoveredId: null,
  rkuSOL: {
    // 取得失敗時のみ表示されるフォールバック値（2026-09-02の実測値に更新）
    supply: 180724,
    tvl: 0,
    apy: 7.5,
    growthRate: 0,
    ecosystemCount: DEFAULT_PROTOCOLS.filter(p => p.kind !== 'validator-stake').length,
  },
  protocols: DEFAULT_PROTOCOLS,
  lastUpdated: null,
  fetchError: null,
  setSelected: (id) => set({ selectedId: id }),
  setHovered: (id) => set({ hoveredId: id }),
  setData: (rkuSOL, protocols) => set({ rkuSOL, protocols }),
  setLastUpdated: (d) => set({ lastUpdated: d }),
  setFetchError: (e) => set({ fetchError: e }),
}))
