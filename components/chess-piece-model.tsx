"use client"

import { useRef, useMemo } from "react"
import { useFrame } from "@react-three/fiber"
import type { ChessPiece, Position } from "@/types/chess"
// Import THREE from our singleton to avoid multiple instances
import { THREE } from "@/lib/three-singleton"

interface ChessPieceModelProps {
  piece: ChessPiece
  position: Position
}

export default function ChessPieceModel({ piece, position }: ChessPieceModelProps) {
  const { row, col } = position
  const groupRef = useRef<THREE.Group>(null)

  // Animation for piece movement
  const targetPosition = new THREE.Vector3(col, 0, row)

  useFrame(() => {
    if (groupRef.current) {
      groupRef.current.position.lerp(targetPosition, 0.2)
    }
  })

  // Create materials with improved visibility
  const materials = useMemo(() => {
    if (piece.color === "white") {
      // Bright ivory color for white pieces with slight metallic sheen
      return new THREE.MeshStandardMaterial({
        color: 0xf5f5f0,
        metalness: 0.2,
        roughness: 0.5,
        emissive: 0x222222,
        emissiveIntensity: 0.05,
      })
    } else {
      // Enhanced black pieces with blue-purple rim effect
      return new THREE.MeshPhysicalMaterial({
        color: 0x111111,
        metalness: 0.7,
        roughness: 0.2,
        clearcoat: 0.8,
        clearcoatRoughness: 0.2,
        emissive: 0x3311bb,
        emissiveIntensity: 0.3,
        reflectivity: 0.5,
      })
    }
  }, [piece.color])

  // Create outline material for black pieces
  const outlineMaterial = useMemo(() => {
    return new THREE.MeshBasicMaterial({
      color: 0x6633ff,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.6,
    })
  }, [])

  return (
    <group ref={groupRef} position={[col, 0, row]} castShadow receiveShadow>
      {/* Render the piece */}
      {renderPieceGeometry(piece.type, materials)}

      {/* Add outline for black pieces */}
      {piece.color === "black" && renderPieceOutline(piece.type, outlineMaterial)}
    </group>
  )
}

// Helper function to render the appropriate geometry based on piece type
function renderPieceGeometry(pieceType: string, material: THREE.Material) {
  switch (pieceType) {
    case "pawn":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh material={material} castShadow receiveShadow>
            <cylinderGeometry args={[0.2, 0.3, 0.2, 16]} />
          </mesh>
          <mesh position={[0, 0.2, 0]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.2, 16, 16]} />
          </mesh>
        </group>
      )

    case "rook":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh material={material} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.35, 0.6, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.2, 0.6]} />
          </mesh>
        </group>
      )

    case "knight":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh material={material} castShadow receiveShadow>
            <cylinderGeometry args={[0.25, 0.35, 0.3, 16]} />
          </mesh>
          <mesh position={[0, 0.3, 0.1]} rotation={[Math.PI / 4, 0, 0]} material={material} castShadow receiveShadow>
            <boxGeometry args={[0.3, 0.6, 0.2]} />
          </mesh>
          <mesh position={[0, 0.5, -0.1]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.15, 16, 16]} />
          </mesh>
        </group>
      )

    case "bishop":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh material={material} castShadow receiveShadow>
            <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material} castShadow receiveShadow>
            <coneGeometry args={[0.2, 0.6, 16]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
        </group>
      )

    case "queen":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh material={material} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={material} castShadow receiveShadow>
            <coneGeometry args={[0.15, 0.3, 16]} />
          </mesh>
          <mesh position={[0, 0.85, 0]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
        </group>
      )

    case "king":
      return (
        <group position={[0, 0.3, 0]}>
          <mesh material={material} castShadow receiveShadow>
            <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material} castShadow receiveShadow>
            <sphereGeometry args={[0.3, 16, 16]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={material} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} material={material} castShadow receiveShadow>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
          </mesh>
        </group>
      )

    default:
      return (
        <mesh material={material} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
      )
  }
}

// Helper function to render outlines for black pieces
function renderPieceOutline(pieceType: string, material: THREE.Material) {
  // Scale factor for the outline
  const scale = 1.1

  switch (pieceType) {
    case "pawn":
      return (
        <group position={[0, 0.3, 0]} scale={[scale, scale, scale]}>
          <mesh material={material}>
            <cylinderGeometry args={[0.2, 0.3, 0.2, 16]} />
          </mesh>
          <mesh position={[0, 0.2, 0]} material={material}>
            <sphereGeometry args={[0.2, 16, 16]} />
          </mesh>
        </group>
      )

    case "rook":
      return (
        <group position={[0, 0.3, 0]} scale={[scale, scale, scale]}>
          <mesh material={material}>
            <cylinderGeometry args={[0.3, 0.35, 0.6, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material}>
            <boxGeometry args={[0.6, 0.2, 0.6]} />
          </mesh>
        </group>
      )

    case "knight":
      return (
        <group position={[0, 0.3, 0]} scale={[scale, scale, scale]}>
          <mesh material={material}>
            <cylinderGeometry args={[0.25, 0.35, 0.3, 16]} />
          </mesh>
          <mesh position={[0, 0.3, 0.1]} rotation={[Math.PI / 4, 0, 0]} material={material}>
            <boxGeometry args={[0.3, 0.6, 0.2]} />
          </mesh>
          <mesh position={[0, 0.5, -0.1]} material={material}>
            <sphereGeometry args={[0.15, 16, 16]} />
          </mesh>
        </group>
      )

    case "bishop":
      return (
        <group position={[0, 0.3, 0]} scale={[scale, scale, scale]}>
          <mesh material={material}>
            <cylinderGeometry args={[0.25, 0.35, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material}>
            <coneGeometry args={[0.2, 0.6, 16]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={material}>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
        </group>
      )

    case "queen":
      return (
        <group position={[0, 0.3, 0]} scale={[scale, scale, scale]}>
          <mesh material={material}>
            <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material}>
            <sphereGeometry args={[0.3, 16, 16]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={material}>
            <coneGeometry args={[0.15, 0.3, 16]} />
          </mesh>
          <mesh position={[0, 0.85, 0]} material={material}>
            <sphereGeometry args={[0.1, 16, 16]} />
          </mesh>
        </group>
      )

    case "king":
      return (
        <group position={[0, 0.3, 0]} scale={[scale, scale, scale]}>
          <mesh material={material}>
            <cylinderGeometry args={[0.3, 0.4, 0.4, 16]} />
          </mesh>
          <mesh position={[0, 0.4, 0]} material={material}>
            <sphereGeometry args={[0.3, 16, 16]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} material={material}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
          </mesh>
          <mesh position={[0, 0.7, 0]} rotation={[0, 0, Math.PI / 2]} material={material}>
            <boxGeometry args={[0.15, 0.4, 0.15]} />
          </mesh>
        </group>
      )

    default:
      return (
        <mesh material={material} scale={[scale, scale, scale]}>
          <boxGeometry args={[0.5, 0.5, 0.5]} />
        </mesh>
      )
  }
}

