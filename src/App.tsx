import { Scene } from './components/Scene'
import { DetailPanel } from './components/DetailPanel'
import { HUD } from './components/HUD'
import { MobileGuard } from './components/MobileGuard'
import { useEcosystemData } from './hooks/useEcosystemData'

export default function App() {
  useEcosystemData()

  return (
    <MobileGuard>
      <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#020208' }}>
        {/* Vignette */}
        <div style={{
          position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 4,
          background: 'radial-gradient(ellipse at 50% 50%, transparent 35%, rgba(0,0,5,0.55) 100%)',
        }} />

        {/* 3D Canvas */}
        <div style={{ width: '100%', height: '100%' }}>
          <Scene />
        </div>

        {/* UI layers */}
        <HUD />
        <DetailPanel />
      </div>
    </MobileGuard>
  )
}
