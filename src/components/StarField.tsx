import { useMemo } from 'react'
import * as THREE from 'three'

export function StarField({ count = 4000 }: { count?: number }) {
  const [positions, colors] = useMemo(() => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (Math.random() - 0.5) * 400
      pos[i * 3 + 1] = (Math.random() - 0.5) * 200
      pos[i * 3 + 2] = (Math.random() - 0.5) * 300 - 30
      const warm = Math.random() > 0.88
      col[i * 3]     = warm ? 1.0 : 0.65 + Math.random() * 0.35
      col[i * 3 + 1] = warm ? 0.88 : 0.72 + Math.random() * 0.28
      col[i * 3 + 2] = warm ? 0.55 : 0.9 + Math.random() * 0.1
    }
    return [pos, col]
  }, [count])

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.10}
        vertexColors
        blending={THREE.AdditiveBlending}
        transparent
        opacity={0.75}
        depthWrite={false}
      />
    </points>
  )
}
