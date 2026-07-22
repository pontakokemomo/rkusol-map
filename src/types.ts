export interface Protocol {
  id: string
  name: string
  category: 'Staking' | 'Lending' | 'Yield' | 'Infrastructure' | 'Validator'
  color: string
  hex: number
  role: string
  orbitRadius: number
  orbitSpeed: number
  orbitPhase: number
  planetSize: number
  tvl: number
  apy: number | null
  connectedLiquidity: number | null
  description: string
  streamParticles: number
  status?: 'live' | 'announced'
  kind?: 'validator-stake'
}

export interface RkuSOLData {
  supply: number
  tvl: number
  apy: number
  growthRate: number
  ecosystemCount: number
}

export interface EcosystemState {
  rkuSOL: RkuSOLData
  protocols: Protocol[]
  lastUpdated: Date | null
  isLoading: boolean
}
