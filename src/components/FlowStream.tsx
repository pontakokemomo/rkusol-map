import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import type { Protocol } from '../types'

interface Props {
  protocol: Protocol
  targetPos: THREE.Vector3
}

export function FlowStream({ protocol, targetPos }: Props) {
  const isAnnounced = protocol.status === 'announced'
  const N = protocol.streamParticles
  const AN = Math.floor(N * 0.3)

  const streamRef = useRef<THREE.Points>(null)
  const accentRef = useRef<THREE.Points>(null)

  const [sBuf, aBuf, sOff, aOff] = useMemo(() => {
    const sOff = Array.from({ length: N },  (_, k) => k / N)
    const aOff = Array.from({ length: AN }, (_, k) => k / AN)
    return [
      new Float32Array(N * 3),
      new Float32Array(AN * 3),
      sOff, aOff,
    ]
  }, [N, AN])

  const ctrl = useMemo(() => new THREE.Vector3(), [])

  useFrame(({ clock }) => {
    const t = clock.getElapsedTime()
    const tgt = targetPos
    const len = tgt.length() || 1

    ctrl.set(
      tgt.x * 0.5 + (-tgt.z / len) * protocol.orbitRadius * 0.28,
      tgt.y * 0.5,
      tgt.z * 0.5 + (tgt.x / len) * protocol.orbitRadius * 0.28,
    )

    const update = (
      buf: Float32Array,
      offsets: number[],
      speed: number,
      waveAmp: number,
      waveFreq: number,
      ref: React.RefObject<THREE.Points | null>,
    ) => {
      for (let k = 0; k < offsets.length; k++) {
        offsets[k] = (offsets[k] + speed) % 1.0
        const o = offsets[k]
        const mt = 1 - o
        const wave = Math.sin(o * waveFreq + t * 1.5 + k * 0.9) * waveAmp
        const px = (-tgt.z / len)
        const pz = (tgt.x / len)
        buf[k * 3]     = 2 * mt * o * ctrl.x + o * o * tgt.x + px * wave
        buf[k * 3 + 1] = 2 * mt * o * ctrl.y + o * o * tgt.y + wave * 0.4
        buf[k * 3 + 2] = 2 * mt * o * ctrl.z + o * o * tgt.z + pz * wave
      }
      if (ref.current) {
        ref.current.geometry.attributes.position.needsUpdate = true
      }
    }

    const spd = isAnnounced ? 0.5 : 1.0
    update(sBuf, sOff, 0.006 * spd, 0.32, Math.PI * 4,   streamRef)
    update(aBuf, aOff, 0.003 * spd, 0.70, Math.PI * 2.5, accentRef)
  })

  return (
    <>
      <points ref={streamRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[sBuf, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={protocol.hex}
          size={0.17}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={isAnnounced ? 0.25 : 0.9}
          depthWrite={false}
        />
      </points>
      <points ref={accentRef}>
        <bufferGeometry>
          <bufferAttribute attach="attributes-position" args={[aBuf, 3]} />
        </bufferGeometry>
        <pointsMaterial
          color={0xFFB830}
          size={0.12}
          blending={THREE.AdditiveBlending}
          transparent
          opacity={isAnnounced ? 0.1 : 0.5}
          depthWrite={false}
        />
      </points>
    </>
  )
}
