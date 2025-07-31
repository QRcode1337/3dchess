"use client"

import { useRef } from "react"
import { useFrame } from "@react-three/fiber"
import { SpotLight } from "@react-three/drei"

export default function RimLight() {
  const spotLightRef = useRef<any>(null)

  // Subtle animation for the rim light
  useFrame(({ clock }) => {
    if (spotLightRef.current) {
      // Subtle movement to create dynamic lighting
      const time = clock.getElapsedTime()
      spotLightRef.current.position.x = Math.sin(time * 0.2) * 5
      spotLightRef.current.position.z = Math.cos(time * 0.2) * 5
    }
  })

  return (
    <>
      {/* Rim light from the back-left */}
      <SpotLight
        ref={spotLightRef}
        position={[-5, 10, -5]}
        angle={0.6}
        penumbra={0.5}
        intensity={0.8}
        distance={20}
        color={0x6633ff}
        castShadow
      />

      {/* Additional subtle rim light from the right */}
      <spotLight
        position={[8, 8, 0]}
        angle={0.5}
        penumbra={0.5}
        intensity={0.4}
        distance={15}
        color={0x3366ff}
        castShadow={false}
      />
    </>
  )
}

