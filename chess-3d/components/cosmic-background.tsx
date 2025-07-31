"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { Stars } from "@react-three/drei"
import type { THREE } from "@/lib/three-singleton"

export default function CosmicBackground() {
  const starsRef = useRef<any>(null)
  const nebulaRef = useRef<THREE.Group>(null)

  // Slow rotation for the stars
  useFrame(({ clock }) => {
    if (starsRef.current) {
      starsRef.current.rotation.y = clock.getElapsedTime() * 0.02
      starsRef.current.rotation.x = Math.sin(clock.getElapsedTime() * 0.01) * 0.1
    }

    if (nebulaRef.current) {
      nebulaRef.current.rotation.y = clock.getElapsedTime() * 0.01
    }
  })

  return (
    <>
      {/* Distant stars */}
      <Stars ref={starsRef} radius={100} depth={50} count={5000} factor={4} saturation={0.5} fade speed={0.5} />

      {/* Nebula effect */}
      <group ref={nebulaRef} position={[0, 0, 0]}>
        {/* Create a subtle nebula effect with colored point lights */}
        <pointLight position={[-30, 10, -20]} intensity={0.5} color={0x3311bb} distance={100} />
        <pointLight position={[30, -5, 20]} intensity={0.3} color={0x113366} distance={80} />
        <pointLight position={[-10, -10, -30]} intensity={0.2} color={0x661133} distance={60} />
      </group>

      {/* Ambient light to ensure pieces are visible */}
      <ambientLight intensity={0.6} />

      {/* Directional light for shadows and definition */}
      <directionalLight
        position={[5, 10, 5]}
        intensity={0.8}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />

      {/* Subtle fog for depth */}
      <fog attach="fog" args={[0x000020, 30, 100]} />

      {/* Background color */}
      <color attach="background" args={[0x000814]} />
    </>
  )
}
