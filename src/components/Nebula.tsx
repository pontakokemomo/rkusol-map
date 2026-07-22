import { useMemo, useEffect } from 'react'
import * as THREE from 'three'

function makeNebulaTexture(blobs: [number, number, number, string][]): THREE.CanvasTexture {
  const canvas = document.createElement('canvas')
  canvas.width = canvas.height = 512
  const ctx = canvas.getContext('2d')!
  blobs.forEach(([bx, by, br, col]) => {
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br)
    g.addColorStop(0, col + 'cc')
    g.addColorStop(0.45, col + '33')
    g.addColorStop(1, col + '00')
    ctx.globalCompositeOperation = 'lighter'
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 512, 512)
  })
  return new THREE.CanvasTexture(canvas)
}

export function Nebula() {
  const planes = useMemo(() => [
    { blobs: [[280, 180, 220, '#2211aa'], [350, 300, 140, '#330077'], [160, 380, 180, '#441199']] as [number,number,number,string][], pos: [-15, 8, -55] as [number,number,number], rot: [0.15, 0.25, 0] as [number,number,number], size: 110, opacity: 0.38 },
    { blobs: [[200, 200, 200, '#1a0055'], [320, 280, 160, '#0d0033']] as [number,number,number,string][], pos: [28, -4, -65] as [number,number,number], rot: [-0.1, -0.2, 0] as [number,number,number], size: 130, opacity: 0.25 },
    { blobs: [[256, 200, 180, '#220055'], [180, 320, 140, '#1a0044']] as [number,number,number,string][], pos: [5, -18, -42] as [number,number,number], rot: [0.4, 0.05, 0.2] as [number,number,number], size: 72, opacity: 0.2 },
    { blobs: [[256, 256, 200, '#002233']] as [number,number,number,string][], pos: [0, 4, -28] as [number,number,number], rot: [0, 0, 0] as [number,number,number], size: 55, opacity: 0.1 },
  ].map(p => ({ ...p, texture: makeNebulaTexture(p.blobs) })), [])

  useEffect(() => () => { planes.forEach(p => p.texture.dispose()) }, [planes])

  return (
    <>
      {planes.map((p, i) => (
        <mesh key={i} position={p.pos} rotation={p.rot}>
          <planeGeometry args={[p.size, p.size]} />
          <meshBasicMaterial
            map={p.texture}
            transparent
            opacity={p.opacity}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
      ))}
    </>
  )
}
