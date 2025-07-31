"use client"

import type { Position } from "@/types/chess"
import { useState, useRef } from "react"
import { useFrame } from "@react-three/fiber"
import * as THREE from "three"

interface ChessSquareProps {
  position: Position
  isLight: boolean
  isSelected: boolean
  isValidMove: boolean
  isSuggestedFrom?: boolean
  isSuggestedTo?: boolean
  isCheckingPiece?: boolean
  onClick: () => void
}

export default function ChessSquare({
  position,
  isLight,
  isSelected,
  isValidMove,
  isSuggestedFrom = false,
  isSuggestedTo = false,
  isCheckingPiece = false,
  onClick,
}: ChessSquareProps) {
  const { row, col } = position
  const [hovered, setHovered] = useState(false)
  const meshRef = useRef<THREE.Mesh>(null)

  // Animation for hover and selection
  useFrame(() => {
    if (meshRef.current) {
      if (isCheckingPiece) {
        meshRef.current.material.color.lerp(new THREE.Color(0xff3333), 0.1) // Red for checking piece
      } else if (isSuggestedFrom) {
        meshRef.current.material.color.lerp(new THREE.Color(0xf5d76e), 0.1) // Gold for suggested from
      } else if (isSuggestedTo) {
        meshRef.current.material.color.lerp(new THREE.Color(0xf5b041), 0.1) // Darker gold for suggested to
      } else if (isSelected) {
        meshRef.current.material.color.lerp(new THREE.Color(0x3d85c6), 0.1) // Blue for selected
      } else if (isValidMove) {
        meshRef.current.material.color.lerp(new THREE.Color(0x6aa84f), 0.1) // Green for valid moves
      } else if (hovered) {
        meshRef.current.material.color.lerp(new THREE.Color(isLight ? 0xf0f0f0 : 0x606060), 0.1) // Lighter on hover
      } else {
        meshRef.current.material.color.lerp(new THREE.Color(isLight ? 0xe6e6e6 : 0x4d4d4d), 0.1) // Normal colors
      }
    }
  })

  return (
    <mesh
      ref={meshRef}
      position={[col, -0.1, row]}
      rotation={[-Math.PI / 2, 0, 0]}
      receiveShadow
      onClick={onClick}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    >
      <planeGeometry args={[1, 1]} />
      <meshStandardMaterial color={isLight ? 0xe6e6e6 : 0x4d4d4d} />

      {/* Highlight for valid moves */}
      {isValidMove && (
        <mesh position={[0, 0.01, 0]}>
          <circleGeometry args={[0.2, 32]} />
          <meshBasicMaterial color={0x6aa84f} transparent opacity={0.5} />
        </mesh>
      )}
    </mesh>
  )
}
