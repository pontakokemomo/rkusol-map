import { useEffect, useRef } from 'react'
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
  const { protocols, selectedId, setSelected, setHovered } = useStore()
  const isMobile = useIsMobile()
  const isInteracting = selectedId !== null

  const downPos = useRef<{ x: number; y: number } | null>(null)
  useEffect(() => {
    const onDown = (e: PointerEvent) => { downPos.current = { x: e.clientX, y: e.clientY } }
    window.addEventListener('pointerdown', onDown)
    return () => window.removeEventListener('pointerdown', onDown)
  }, [])

  return (
    <Canvas
      camera={{ fov: 52, position: [0, 13, 34], near: 0.1, far: 600 }}
      style={{ background: '#020208' }}
      gl={{ antialias: true, toneMapping: THREE.NoToneMapping }}
      onPointerMissed={(e) => {
        const d = downPos.current
        if (d && Math.hypot(e.clientX - d.x, e.clientY - d.y) < 8) {
          setSelected(null)
          setHovered(null)
        }
      }}
    >
      <fog attach="fog" args={['#020208', 60, 300]} />

      {/* Background */}
      <StarField count={isMobile ? 1500 : 4000} />
      <Nebula />

      {/* Planets */}
      <CenterStar />

      {/* インナー軌道リング（Shinobi Stake Poolなどの外部バリデーター委任レイヤーの境界表示） */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[5.48, 5.52, 128]} />
        <meshBasicMaterial
          color={0x8B93A7}
          transparent
          opacity={0.13}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

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
