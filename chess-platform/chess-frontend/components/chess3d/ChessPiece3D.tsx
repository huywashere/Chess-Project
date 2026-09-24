"use client";

import React, { useMemo, useState } from "react";
import * as THREE from "three";
import { getPieceGeometry } from "./stauntonGeometries";

export interface ChessPiece3DProps {
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: "w" | "b";
  square: string;
  position: [number, number, number];
  isSelected?: boolean;
  isTarget?: boolean;
  onClick?: (square: string) => void;
  materialTheme?: "classic_wood" | "tournament" | "marble";
}

export const ChessPiece3D = React.memo(function ChessPiece3D({
  type,
  color,
  square,
  position,
  isSelected = false,
  isTarget = false,
  onClick,
  materialTheme = "classic_wood",
}: ChessPiece3DProps) {
  const [hovered, setHovered] = useState(false);

  // Retrieve cached Staunton geometry
  const geometry = useMemo(() => getPieceGeometry(type), [type]);

  // Luxury materials matching Chess.com 3D Staunton / Wood sets
  const material = useMemo(() => {
    const isWhite = color === "w";

    if (materialTheme === "tournament") {
      return new THREE.MeshStandardMaterial({
        color: isWhite ? 0xf4f1ea : 0x222222,
        roughness: isWhite ? 0.28 : 0.32,
        metalness: 0.05,
      });
    }

    if (materialTheme === "marble") {
      return new THREE.MeshStandardMaterial({
        color: isWhite ? 0xeae6df : 0x1f2326,
        roughness: 0.15,
        metalness: 0.1,
      });
    }

    // Default: "classic_wood" (Natural Maple White vs Ebonized Dark Walnut Black)
    return new THREE.MeshStandardMaterial({
      color: isWhite ? 0xede2c8 : 0x2b1e16,
      roughness: isWhite ? 0.32 : 0.28,
      metalness: 0.04,
    });
  }, [color, materialTheme]);

  // Selected or target highlight material
  const highlightMaterial = useMemo(() => {
    return new THREE.MeshStandardMaterial({
      color: isSelected ? 0x84cc16 : 0x38bdf8,
      roughness: 0.2,
      metalness: 0.1,
      emissive: isSelected ? 0x3f6212 : 0x0369a1,
      emissiveIntensity: 0.4,
    });
  }, [isSelected]);

  // Target Y height: elevate slightly if selected or hovered
  const currentY = isSelected ? position[1] + 0.35 : hovered ? position[1] + 0.1 : position[1];

  // Knights face towards opponent (White faces -Z, Black faces +Z)
  const rotationY = useMemo(() => {
    if (type.toLowerCase() === "n") {
      return color === "w" ? Math.PI : 0;
    }
    return 0;
  }, [type, color]);

  return (
    <group
      position={[position[0], currentY, position[2]]}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(square);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = "default";
      }}
    >
      <mesh
        geometry={geometry}
        material={isSelected || isTarget ? highlightMaterial : material}
        castShadow
        receiveShadow
      />

      {/* Floating pedestal ring indicator when selected */}
      {isSelected && (
        <mesh position={[0, -0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 0.44, 32]} />
          <meshBasicMaterial color={0x84cc16} side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
});
