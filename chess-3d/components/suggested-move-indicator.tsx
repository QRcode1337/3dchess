"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { THREE } from "@/lib/three-singleton"
import type { Position } from "@/types/chess"

interface SuggestedMoveIndicatorProps {
  position: Position
  type: "from" | "to"
}

export default function SuggestedMoveIndicator({ position, type }: SuggestedMoveIndicatorProps) {
  const { row, col } = position
  const groupRef = useRef<THREE.Group>(null)

  // Animation for the indicator
  useFrame(({ clock }) => {
    if (groupRef.current) {
      // Pulsing animation
      const pulse = Math.sin(clock.getElapsedTime() * 4) * 0.2 + 0.8
      groupRef.current.scale.set(pulse, pulse, pulse)

      // Floating animation
      groupRef.current.position.y = Math.sin(clock.getElapsedTime() * 2) * 0.1 + 0.2
    }
  })

  return (
    <group ref={groupRef} position={[col, 0.2, row]}>
      {type === "from" ? (
        // Source indicator (ring)
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.3, 0.4, 32]} />
          <meshBasicMaterial color={0xf5d76e} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      ) : (
        // Destination indicator (arrow)
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.4, 32]} />
          <meshBasicMaterial color={0xf5b041} transparent opacity={0.6} />
        </mesh>
      )}
    </group>
  )
}
