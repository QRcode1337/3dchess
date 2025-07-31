"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { THREE } from "@/lib/three-singleton"
import type { Position } from "@/types/chess"

interface CheckIndicatorProps {
  position: Position
}

export default function CheckIndicator({ position }: CheckIndicatorProps) {
  const { row, col } = position
  const groupRef = useRef<THREE.Group>(null)

  // Animation
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Pulsing animation
      const pulse = Math.sin(clock.getElapsedTime() * 5) * 0.2 + 0.8
      groupRef.current.scale.set(pulse, pulse, pulse)

      // Floating animation
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 3) * 0.1 + 0.2
    }
  })

  return (
    <group ref={groupRef} position={[col, 0.2, row]}>
      {/* Red warning indicator for the checking piece */}
      <mesh rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[0.4, 0.5, 32]} />
        <meshBasicMaterial color={0xff3333} side={THREE.DoubleSide} transparent opacity={0.8} />
      </mesh>

      {/* Inner glow */}
      <pointLight position={[0, 0.1, 0]} intensity={0.5} color={0xff0000} distance={1} />
    </group>
  )
}
