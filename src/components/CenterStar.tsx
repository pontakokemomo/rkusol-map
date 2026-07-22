import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { useStore } from '../store'

const GLOW_LAYERS = [
  { scale: 1.0, opacity: 1.0, side: THREE.FrontSide },
  { scale: 1.35, opacity: 0.08, side: THREE.BackSide },
  { scale: 1.70, opacity: 0.05, side: THREE.BackSide },
  { scale: 2.20, opacity: 0.03, side: THREE.BackSide },
  { scale: 3.00, opacity: 0.015, side: THREE.BackSide },
]

export function CenterStar() {
  const groupRef = useRef<THREE.Group>(null)
  const ringRef = useRef<THREE.Mesh>(null)
  const { setSelected, selectedId, setHovered } = useStore()

  useFrame(({ clock }, delta) => {
    if (!groupRef.current) return
    const f = Math.min(delta, 0.1) * 60
    groupRef.current.rotation.y += 0.004 * f
    const pulse = 1 + Math.sin(clock.getElapsedTime() * 1.0) * 0.04
    groupRef.current.scale.setScalar(pulse)
    if (ringRef.current) ringRef.current.rotation.z += 0.003 * f
  })

  return (
    <group
      ref={groupRef}
      onClick={() => setSelected(selectedId === 'rkusol' ? null : 'rkusol')}
      onPointerOver={() => setHovered('rkusol')}
      onPointerOut={() => setHovered(null)}
    >
      {GLOW_LAYERS.map((l, i) => (
        <mesh key={i} {...(i > 0 ? { raycast: () => null } : {})}>
          <sphereGeometry args={[2.0 * l.scale, 32, 32]} />
          <meshBasicMaterial
            color={0xC0FF38}
            transparent={i > 0}
            opacity={l.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={l.side}
          />
        </mesh>
      ))}
      {/* Corona ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]} raycast={() => null}>
        <ringGeometry args={[2.4, 3.1, 64]} />
        <meshBasicMaterial
          color={0xC0FF38}
          transparent
          opacity={0.18}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>
    </group>
  )
}
