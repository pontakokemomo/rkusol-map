import { useMemo } from 'react'
import * as THREE from 'three'

// 固定の種から 0〜1 の一様な乱数を順に返す（mulberry32）。
// Math.random と同じ分布のまま、描画し直しても星の配置が変わらない
function seededRandom(seed: number) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6D2B79F5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

const STAR_SEED = 20260612

export function StarField({ count = 4000 }: { count?: number }) {
  const [positions, colors] = useMemo(() => {
    const random = seededRandom(STAR_SEED)
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      pos[i * 3]     = (random() - 0.5) * 400
      pos[i * 3 + 1] = (random() - 0.5) * 200
      pos[i * 3 + 2] = (random() - 0.5) * 300 - 30
      const warm = random() > 0.88
      col[i * 3]     = warm ? 1.0 : 0.65 + random() * 0.35
      col[i * 3 + 1] = warm ? 0.88 : 0.72 + random() * 0.28
      col[i * 3 + 2] = warm ? 0.55 : 0.9 + random() * 0.1
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
