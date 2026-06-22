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
    description: 'Modular lending protocol enabling looped borrowing strategies with rkuSOL to amplify yield exposure with precision risk control.',
    streamParticles: 30,
    status: 'announced',
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
]

export const useStore = create<AppStore>((set) => ({
  selectedId: null,
  hoveredId: null,
  rkuSOL: {
    supply: 88812,
    tvl: 0,
    apy: 7.5,
    growthRate: 0,
    ecosystemCount: DEFAULT_PROTOCOLS.length,
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
