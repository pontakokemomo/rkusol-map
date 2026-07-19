import { Canvas } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import { StarField } from './StarField'
import { Nebula } from './Nebula'
import { CenterStar } from './CenterStar'
import { Planet } from './Planet'
import { useStore } from '../store'
import { useIsMobile } from '../hooks/useIsMobile'

export function Scene() {
  const { protocols, selectedId } = useStore()
  const isMobile = useIsMobile()
  const isInteracting = selectedId !== null

  return (
    <Canvas
      camera={{ fov: 52, position: [0, 13, 34], near: 0.1, far: 600 }}
      style={{ background: '#020208' }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
    >
      <fog attach="fog" args={['#020208', 60, 300]} />

      {/* Background */}
      <StarField count={isMobile ? 1500 : 4000} />
      <Nebula />

      {/* Planets */}
      <CenterStar />
      {protocols.map(p => (
        <Planet key={p.id} protocol={p} />
      ))}

      {/* Post-processing: Bloom (UnrealBloom相当) */}
      <EffectComposer>
        <Bloom
          intensity={1.5}
          luminanceThreshold={0.12}
          luminanceSmoothing={0.85}
          mipmapBlur
        />
      </EffectComposer>

      {/* Camera controls */}
      <OrbitControls
        autoRotate={!isInteracting}
        autoRotateSpeed={0.5}
        enableDamping
        dampingFactor={0.08}
        minDistance={10}
        maxDistance={80}
        enablePan={false}
      />
    </Canvas>
  )
}
