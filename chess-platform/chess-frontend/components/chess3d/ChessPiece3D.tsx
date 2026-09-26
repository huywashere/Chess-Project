"use client";

import React, { useMemo, useRef, useEffect } from "react";
import * as THREE from "three";
import { useFrame } from "@react-three/fiber";
import { getPieceGeometry } from "./stauntonGeometries";
import { POLYHAVEN_SCALE } from "./polyHavenAssets";

export interface ChessPiece3DProps {
  type: string; // 'p', 'r', 'n', 'b', 'q', 'k'
  color: "w" | "b";
  square: string;
  position: [number, number, number];
  isSelected?: boolean;
  isTarget?: boolean;
  onClick?: (square: string) => void;
  setTheme?: "polyhaven" | "opengameart";
  polyHavenGeometry?: THREE.BufferGeometry;
  polyHavenMaterial?: THREE.Material;
  woodMaterial?: THREE.Material;
  flipped?: boolean;
  moveFromCoords?: [number, number, number];
  moveId?: string;
}

// ============================================================================
// PERFORMANCE OPTIMIZATION: MODULE-LEVEL SHARED STATIC MATERIALS & GEOMETRIES
// Reusing these instances avoids thousands of WebGL buffer allocations & GC churn
// ============================================================================
const SELECTED_PIECE_MAT = new THREE.MeshStandardMaterial({
  color: 0x34d399,
  roughness: 0.22,
  metalness: 0.12,
  emissive: 0x065f46,
  emissiveIntensity: 0.65,
});

const TARGET_PIECE_MAT = new THREE.MeshStandardMaterial({
  color: 0x10b981,
  roughness: 0.22,
  metalness: 0.12,
  emissive: 0x047857,
  emissiveIntensity: 0.55,
});

const FALLBACK_WHITE_MAT = new THREE.MeshStandardMaterial({
  color: 0xf5eedc,
  roughness: 0.32,
  metalness: 0.04,
});

const FALLBACK_BLACK_MAT = new THREE.MeshStandardMaterial({
  color: 0x2b1e16,
  roughness: 0.28,
  metalness: 0.04,
});

const PEDESTAL_RING_GEOM = new THREE.RingGeometry(0.32, 0.44, 32);
const PEDESTAL_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0x10b981,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
});

const LANDING_RING_GEOM = new THREE.RingGeometry(0.2, 0.52, 32);
const LANDING_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0x34d399,
  side: THREE.DoubleSide,
  transparent: true,
  opacity: 0.7,
  depthWrite: false,
});

export function setPieceAccentColors(primaryColor: string, lightColor: string) {
  PEDESTAL_RING_MAT.color.set(primaryColor);
  LANDING_RING_MAT.color.set(lightColor);
  SELECTED_PIECE_MAT.color.set(lightColor);
  TARGET_PIECE_MAT.color.set(primaryColor);
}

export const ChessPiece3D = React.memo(function ChessPiece3D({
  type,
  color,
  square,
  position,
  isSelected = false,
  isTarget = false,
  onClick,
  setTheme = "polyhaven",
  polyHavenGeometry,
  polyHavenMaterial,
  woodMaterial,
  flipped = false,
  moveFromCoords,
  moveId,
}: ChessPiece3DProps) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const landingRingRef = useRef<THREE.Mesh>(null);

  // Preferred geometry: Poly Haven sculpted mesh if available, fallback to Staunton lathe
  const geometry = useMemo(() => {
    if (polyHavenGeometry) return polyHavenGeometry;
    return getPieceGeometry(type);
  }, [polyHavenGeometry, type]);

  const isPolyHavenGeom = Boolean(polyHavenGeometry);

  // Material selection based on theme: Poly Haven Marble vs OpenGameArt Wood
  const normalMaterial = useMemo(() => {
    if (setTheme === "polyhaven" && polyHavenMaterial && isPolyHavenGeom) {
      return polyHavenMaterial;
    }
    if (setTheme === "opengameart" && woodMaterial) {
      return woodMaterial;
    }
    return color === "w" ? FALLBACK_WHITE_MAT : FALLBACK_BLACK_MAT;
  }, [setTheme, polyHavenMaterial, isPolyHavenGeom, woodMaterial, color]);

  // Active material: Selected/Target gets shared glow material, otherwise normal
  const activeMaterial = isSelected
    ? SELECTED_PIECE_MAT
    : isTarget
      ? TARGET_PIECE_MAT
      : normalMaterial;

  // Knights orientation: White faces -Z (towards Black), Black faces +Z (towards White)
  const rotationY = useMemo(() => {
    if (type.toLowerCase() === "n") {
      let baseRot = color === "w" ? Math.PI : 0;
      if (flipped) baseRot += Math.PI;
      return baseRot;
    }
    return 0;
  }, [type, color, flipped]);

  // Scaling factor: Poly Haven models use POLYHAVEN_SCALE; fallback uses 1
  const scaleVal = isPolyHavenGeom ? POLYHAVEN_SCALE : 1.0;

  // Animation state tracking (stored in ref for zero-react-render 60+ FPS physics)
  const anim = useRef({
    from: moveFromCoords ? [...moveFromCoords] : [...position],
    to: [...position],
    progress: moveFromCoords ? 0 : 1, // 0 = just moved, 1 = landed
    lastMoveId: moveId,
    currentLift: 0,
    settleTime: 1.0, // > 0.2 means settle is complete
    landingRingProgress: 1.0,
  });

  // Re-trigger flight arc whenever a new move is executed to this piece
  useEffect(() => {
    if (moveFromCoords && moveId && moveId !== anim.current.lastMoveId) {
      anim.current.from = [...moveFromCoords];
      anim.current.to = [...position];
      anim.current.progress = 0;
      anim.current.settleTime = 1.0;
      anim.current.lastMoveId = moveId;
      anim.current.landingRingProgress = 1.0;
    } else {
      anim.current.to = [...position];
    }
  }, [position, moveFromCoords, moveId]);

  // Per-frame physics & motion loop (Direct GPU transforms)
  useFrame((state, delta) => {
    if (!groupRef.current) return;
    const a = anim.current;
    const dt = Math.min(delta, 0.05); // Clamp dt to prevent jumps on background tab

    let curX = a.to[0];
    let curY = a.to[1];
    let curZ = a.to[2];
    let tiltX = 0;
    let tiltZ = 0;

    // 1. Move flight arc (320ms smooth parabolic glide)
    if (a.progress < 1) {
      a.progress = Math.min(1, a.progress + dt / 0.32);
      // Cubic ease-out curve
      const t = a.progress;
      const ease = 1 - Math.pow(1 - t, 3);

      curX = THREE.MathUtils.lerp(a.from[0], a.to[0], ease);
      curZ = THREE.MathUtils.lerp(a.from[2], a.to[2], ease);

      // Arc height: Knights jump high over pieces (0.82), other pieces glide elegantly (0.46)
      const arcPeak = type.toLowerCase() === "n" ? 0.82 : 0.46;
      const arcY = Math.sin(t * Math.PI) * arcPeak;
      curY = THREE.MathUtils.lerp(a.from[1], a.to[1], ease) + arcY;

      // Aerodynamic flight tilt in movement direction
      const dx = a.to[0] - a.from[0];
      const dz = a.to[2] - a.from[2];
      const tiltMag = Math.sin(t * Math.PI) * 0.12;
      tiltZ = -Math.sign(dx) * tiltMag;
      tiltX = Math.sign(dz) * tiltMag;

      // Touchdown moment!
      if (a.progress >= 1) {
        a.settleTime = 0; // Trigger micro settle bounce
        a.landingRingProgress = 0; // Trigger landing ripple
      }
    } else if (a.settleTime < 0.22) {
      // 2. Landing micro-bounce settle (adds tactile physical weight)
      a.settleTime += dt;
      const decay = Math.exp(-a.settleTime * 20);
      const bounce = Math.sin(a.settleTime * 32) * decay * 0.045;
      curY = a.to[1] + bounce;
    }

    // 3. Selection lift & levitation
    const targetLift = isSelected ? 0.38 : 0;
    a.currentLift = THREE.MathUtils.lerp(a.currentLift, targetLift, dt * 12);

    if (isSelected) {
      // Gentle mystical hover breathing
      const hoverFloat = Math.sin(state.clock.elapsedTime * 3.6) * 0.024;
      const hoverTilt = Math.sin(state.clock.elapsedTime * 2.2) * 0.016;
      curY += a.currentLift + hoverFloat;
      tiltZ += hoverTilt;
    } else if (a.currentLift > 0.001) {
      curY += a.currentLift;
    }

    // Update main piece group transform
    groupRef.current.position.set(curX, curY, curZ);
    groupRef.current.rotation.x = tiltX;
    groupRef.current.rotation.z = tiltZ;

    // 4. Animate glowing pedestal ring on the board beneath selected piece
    if (ringRef.current && isSelected) {
      // Pin ring to board surface regardless of piece hover height
      ringRef.current.position.y = -a.currentLift + 0.02;
      ringRef.current.rotation.z += dt * 0.7; // Slow mystical rotation
      const pulseScale = 1.0 + Math.sin(state.clock.elapsedTime * 4.2) * 0.08;
      ringRef.current.scale.set(pulseScale, pulseScale, pulseScale);
    }

    // 5. Animate landing impact ripple ring
    if (landingRingRef.current) {
      if (a.landingRingProgress < 1) {
        a.landingRingProgress = Math.min(1, a.landingRingProgress + dt / 0.28);
        const rp = a.landingRingProgress;
        const ringScale = 0.6 + rp * 1.4;
        landingRingRef.current.scale.set(ringScale, ringScale, ringScale);
        landingRingRef.current.visible = true;
        (LANDING_RING_MAT as THREE.MeshBasicMaterial).opacity = (1 - rp) * 0.7;
      } else {
        landingRingRef.current.visible = false;
      }
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick(square);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (e.nativeEvent?.target) {
          (e.nativeEvent.target as HTMLElement).style.cursor = "pointer";
        }
      }}
      onPointerOut={(e) => {
        if (e.nativeEvent?.target) {
          (e.nativeEvent.target as HTMLElement).style.cursor = "default";
        }
      }}
    >
      {/* Piece Mesh with orientation */}
      <group rotation={[0, rotationY, 0]}>
        <mesh
          geometry={geometry}
          material={activeMaterial}
          scale={[scaleVal, scaleVal, scaleVal]}
          castShadow
        />
      </group>

      {/* Floating Emerald pedestal ring on board surface when piece is lifted */}
      {isSelected && (
        <mesh
          ref={ringRef}
          geometry={PEDESTAL_RING_GEOM}
          material={PEDESTAL_RING_MAT}
          position={[0, 0.02, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
        />
      )}

      {/* Touchdown Landing Shockwave Ripple Ring */}
      <mesh
        ref={landingRingRef}
        geometry={LANDING_RING_GEOM}
        material={LANDING_RING_MAT}
        position={[0, 0.015, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        visible={false}
      />
    </group>
  );
});
