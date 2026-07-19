import { useRef, useCallback } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { Protocol } from '../types'
import { useStore } from '../store'
import { FlowStream } from './FlowStream'

interface Props {
  protocol: Protocol
}

const ORBIT_TILT = [0, 0.06, -0.05, 0.04, -0.03]

export function Planet({ protocol }: Props) {
  const groupRef = useRef<THREE.Group>(null)   // 惑星全体（位置を更新）
  const meshRef  = useRef<THREE.Group>(null)   // 惑星メッシュ（自転）
  const angleRef = useRef(protocol.orbitPhase)
  const posRef   = useRef(new THREE.Vector3()) // FlowStream 用

  const { selectedId, hoveredId, setSelected, setHovered } = useStore()

  const isSelected = selectedId === protocol.id
  const isHovered  = hoveredId === protocol.id
  const isDimmed   = (selectedId !== null || hoveredId !== null) && !isSelected && !isHovered

  const idx  = ['sanctum', 'jupiter', 'kamino', 'loopscale', 'exponent'].indexOf(protocol.id)
  const tilt = ORBIT_TILT[idx] ?? 0

  useFrame(({ clock }) => {
    angleRef.current += protocol.orbitSpeed
    const a = angleRef.current
    const r = protocol.orbitRadius
    const t = clock.getElapsedTime()
    const x = Math.cos(a) * r
    const z = Math.sin(a) * r
    const y = Math.sin(a * 1.7 + t * 0.08) * 0.6 + Math.sin(a) * r * Math.sin(tilt)

    posRef.current.set(x, y, z)

    // groupRef を動かすと、子の Html も一緒についてくる
    if (groupRef.current) groupRef.current.position.set(x, y, z)
    if (meshRef.current)  meshRef.current.rotation.y += 0.006
  })

  const handleClick = useCallback(() => {
    setSelected(isSelected ? null : protocol.id)
  }, [isSelected, protocol.id, setSelected])

  const isAnnounced = protocol.status === 'announced'
  const scaleFactor = isSelected ? 1.25 : isHovered ? 1.12 : 1.0
  const coreOpacity = isDimmed ? 0.3 : isAnnounced ? 0.55 : 1.0

  return (
    <>
      {/* 軌道リング（原点固定、惑星グループの外） */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <ringGeometry args={[protocol.orbitRadius - 0.03, protocol.orbitRadius + 0.03, 128]} />
        <meshBasicMaterial
          color={protocol.hex}
          transparent
          opacity={0.08}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* 惑星グループ（useFrame で位置更新） */}
      <group ref={groupRef}>

        {/* 惑星メッシュ */}
        <group
          ref={meshRef}
          scale={scaleFactor}
          onClick={handleClick}
          onPointerOver={() => setHovered(protocol.id)}
          onPointerOut={() => setHovered(null)}
        >
          {/* コア */}
          <mesh>
            <sphereGeometry args={[protocol.planetSize, 32, 32]} />
            <meshBasicMaterial
              color={protocol.hex}
              blending={THREE.AdditiveBlending}
              depthWrite={false}
              transparent
              opacity={coreOpacity}
            />
          </mesh>

          {/* グローシェル */}
          {[1.35, 1.75, 2.3, 3.2].map((s, i) => (
            <mesh key={i}>
              <sphereGeometry args={[protocol.planetSize * s, 16, 16]} />
              <meshBasicMaterial
                color={protocol.hex}
                transparent
                opacity={(0.10 / (i + 1)) * coreOpacity}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.BackSide}
              />
            </mesh>
          ))}

          {/* ホバー／選択リング */}
          {(isHovered || isSelected) && (
            <mesh rotation={[Math.PI / 2, 0, 0]}>
              <ringGeometry args={[protocol.planetSize * 1.5, protocol.planetSize * 1.65, 64]} />
              <meshBasicMaterial
                color={protocol.hex}
                transparent
                opacity={0.5}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>

        {/* ラベル — groupRef の子なので惑星と一緒に動く */}
        <Html
          position={[0, protocol.planetSize + 1.0, 0]}
          center
          style={{
            pointerEvents: 'none',
            whiteSpace: 'nowrap',
            userSelect: 'none',
            opacity: isDimmed ? 0.2 : 1,
            transition: 'opacity 0.3s',
            transform: 'translateY(-100%)',
          }}
        >
          <div style={{
            textAlign: 'center',
            background: 'rgba(1,2,14,0.70)',
            padding: '5px 12px 5px',
            borderRadius: '4px',
            border: isSelected
              ? `1px solid ${protocol.color}66`
              : '1px solid rgba(255,255,255,0.07)',
            backdropFilter: 'blur(6px)',
          }}>
            <div style={{
              fontFamily: "'Geist Mono', 'Courier New', monospace",
              fontSize: isSelected ? '15px' : '13px',
              fontWeight: 'bold',
              letterSpacing: '2px',
              color: protocol.color,
              textShadow: `0 0 12px ${protocol.color}aa`,
              transition: 'font-size 0.2s',
            }}>
              {protocol.name}
            </div>
            <div style={{
              fontFamily: "'Geist Mono', 'Courier New', monospace",
              fontSize: '12px',
              color: '#99a',
              marginTop: '3px',
              letterSpacing: '1px',
            }}>
              {protocol.category}
            </div>
            {isAnnounced && (
              <div style={{
                fontFamily: "'Geist Mono', 'Courier New', monospace",
                fontSize: '9px',
                color: '#B06EFF',
                letterSpacing: '1px',
                marginTop: '5px',
                border: '1px solid rgba(176,110,255,0.35)',
                borderRadius: '2px',
                padding: '1px 6px',
                textAlign: 'center',
              }}>
                COMING SOON
              </div>
            )}
          </div>
        </Html>
      </group>

      {/* フローストリーム */}
      <FlowStream protocol={protocol} targetPos={posRef.current} />
    </>
  )
}

