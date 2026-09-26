"use client";

import React, { useMemo, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { Chess } from "chess.js";
import { ChessPiece3D, setPieceAccentColors } from "./ChessPiece3D";
import { usePolyHavenAssets, POLYHAVEN_SCALE } from "./polyHavenAssets";
import { useWoodMaterials } from "./openGameArtAssets";
import { getPieceGeometry } from "./stauntonGeometries";
import { useTheme } from "@/context/ThemeContext";

export interface ChessBoard3DSceneProps {
  fen: string;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
  boardTheme?: string;
  setTheme?: "polyhaven" | "opengameart";
  flipped?: boolean;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

// ============================================================================
// PERFORMANCE OPTIMIZATION: SHARED STATIC GEOMETRIES & MATERIALS
// Reused across all 64 squares & board elements to eliminate WebGL allocations
// ============================================================================
const SHARED_PLANE_GEOM = new THREE.PlaneGeometry(0.98, 0.98);
const SHARED_WOOD_TILE_GEOM = new THREE.BoxGeometry(0.985, 0.08, 0.985);
const SHARED_FRAME_GEOM = new THREE.BoxGeometry(9.4, 0.36, 9.4);
const SHARED_BRASS_TRIM_GEOM = new THREE.BoxGeometry(8.16, 0.02, 8.16);
const SHARED_MOVE_DOT_GEOM = new THREE.CircleGeometry(0.18, 24);
const SHARED_MOVE_RING_GEOM = new THREE.RingGeometry(0.28, 0.38, 24);
const CHECK_HALO_GEOM = new THREE.RingGeometry(0.34, 0.48, 32);

const SELECTED_OVERLAY_MAT = new THREE.MeshBasicMaterial({
  color: 0x34d399,
  transparent: true,
  opacity: 0.45,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const LASTMOVE_OVERLAY_MAT = new THREE.MeshBasicMaterial({
  color: 0xfde047,
  transparent: true,
  opacity: 0.32,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const INVISIBLE_OVERLAY_MAT = new THREE.MeshBasicMaterial({
  transparent: true,
  opacity: 0,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const MOVE_DOT_MAT = new THREE.MeshBasicMaterial({
  color: 0x10b981,
  transparent: true,
  opacity: 0.9,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const MOVE_RING_MAT = new THREE.MeshBasicMaterial({
  color: 0x34d399,
  transparent: true,
  opacity: 0.75,
  depthWrite: false,
  side: THREE.DoubleSide,
});

const CHECK_HALO_MAT = new THREE.MeshBasicMaterial({
  color: 0xef4444,
  transparent: true,
  opacity: 0.85,
  depthWrite: false,
  side: THREE.DoubleSide,
});

// ============================================================================
// ANIMATED MOVE INDICATOR (Subtle rhythmic breathing pulse)
// ============================================================================
function AnimatedMoveIndicator({ isCapture }: { isCapture: boolean }) {
  const groupRef = useRef<THREE.Group>(null);

  useFrame((state) => {
    if (!groupRef.current) return;
    const time = state.clock.elapsedTime;
    const pulse = 1.0 + Math.sin(time * 5.0) * 0.12;
    groupRef.current.scale.set(pulse, pulse, 1);
  });

  return (
    <group ref={groupRef} position={[0, 0.022, 0]}>
      {!isCapture && (
        <mesh
          geometry={SHARED_MOVE_DOT_GEOM}
          material={MOVE_DOT_MAT}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        />
      )}
      {isCapture && (
        <mesh
          geometry={SHARED_MOVE_RING_GEOM}
          material={MOVE_RING_MAT}
          rotation={[-Math.PI / 2, 0, 0]}
          raycast={() => null}
        />
      )}
    </group>
  );
}

// ============================================================================
// KING IN CHECK HALO (Urgent crimson heartbeat warning)
// ============================================================================
function KingCheckHalo({ position }: { position: [number, number, number] }) {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.elapsedTime;
    const pulse = 1.0 + Math.sin(time * 6.5) * 0.16;
    meshRef.current.scale.set(pulse, pulse, 1);
    (meshRef.current.material as THREE.MeshBasicMaterial).opacity =
      0.65 + Math.sin(time * 6.5) * 0.25;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={CHECK_HALO_GEOM}
      material={CHECK_HALO_MAT}
      position={[position[0], position[1] + 0.018, position[2]]}
      rotation={[-Math.PI / 2, 0, 0]}
      raycast={() => null}
    />
  );
}

// ============================================================================
// CAPTURED PIECE DISSOLVE GHOST (Cinematic tumble & fade on capture)
// ============================================================================
interface CapturedGhostProps {
  type: string;
  color: "w" | "b";
  position: [number, number, number];
  polyHavenGeometry?: THREE.BufferGeometry;
  onFinish?: () => void;
}

function CapturedPieceGhost({
  type,
  color,
  position,
  polyHavenGeometry,
  onFinish,
}: CapturedGhostProps) {
  const groupRef = useRef<THREE.Group>(null);
  const matRef = useRef<THREE.MeshStandardMaterial>(null);
  const timeRef = useRef(0);
  const [active, setActive] = useState(true);

  const geom = polyHavenGeometry || getPieceGeometry(type);
  const scaleVal = polyHavenGeometry ? POLYHAVEN_SCALE : 1.0;

  useFrame((_, delta) => {
    if (!groupRef.current || !active) return;
    timeRef.current += delta;
    const t = timeRef.current / 0.42;

    if (t >= 1) {
      setActive(false);
      if (onFinish) onFinish();
      return;
    }

    // Rise up and tumble backward
    const lift = Math.sin(t * Math.PI) * 0.4;
    groupRef.current.position.y = position[1] + lift;
    groupRef.current.rotation.x = -t * 1.5;
    groupRef.current.rotation.z = t * 0.8;

    // Shrink scale
    const s = scaleVal * Math.max(0, 1 - Math.pow(t, 2));
    groupRef.current.scale.set(s, s, s);

    if (matRef.current) {
      matRef.current.opacity = Math.max(0, 1 - Math.pow(t, 1.4));
    }
  });

  if (!active) return null;

  return (
    <group ref={groupRef} position={position}>
      <mesh geometry={geom} castShadow={false}>
        <meshStandardMaterial
          ref={matRef}
          color={color === "w" ? 0xf5eedc : 0x2b1e16}
          roughness={0.25}
          metalness={0.1}
          transparent
          opacity={0.9}
          emissive={0xef4444}
          emissiveIntensity={0.4}
        />
      </mesh>
    </group>
  );
}

export const ChessBoard3DScene = React.memo(function ChessBoard3DScene({
  fen,
  selectedSquare,
  possibleMoves,
  lastMove,
  onSquareClick,
  setTheme = "polyhaven",
  flipped = false,
}: ChessBoard3DSceneProps) {
  // Load Poly Haven CC0 Luxury Marble assets
  const polyHaven = usePolyHavenAssets();

  // Load OpenGameArt CC0 Handcrafted Wood assets
  const woodMats = useWoodMaterials();

  // Synchronize 3D highlights & piece glow with active accent color
  const { currentAccent } = useTheme();
  useEffect(() => {
    SELECTED_OVERLAY_MAT.color.set(currentAccent.lightColor);
    MOVE_DOT_MAT.color.set(currentAccent.color);
    MOVE_RING_MAT.color.set(currentAccent.lightColor);
    setPieceAccentColors(currentAccent.color, currentAccent.lightColor);
  }, [currentAccent]);

  // Board top surface height
  const boardSurfaceY = setTheme === "polyhaven" ? 0.3004 : 0.05;

  // Convert square (e.g. 'e4') to 3D coordinates [x, y, z]
  const squareToCoords = (square: string): [number, number, number] => {
    const file = square[0];
    const rank = parseInt(square[1], 10);
    const fileIdx = FILES.indexOf(file);
    const rankIdx = rank - 1;

    let x = fileIdx - 3.5;
    let z = 3.5 - rankIdx;

    if (flipped) {
      x = -x;
      z = -z;
    }

    return [x, boardSurfaceY, z];
  };

  // Parse FEN into pieces array
  const pieces = useMemo(() => {
    const list: Array<{
      type: string;
      color: "w" | "b";
      square: string;
      position: [number, number, number];
    }> = [];

    const rows = fen.split(" ")[0].split("/");
    for (let r = 0; r < 8; r++) {
      const rank = 8 - r;
      let col = 0;
      for (const char of rows[r]) {
        if (!isNaN(parseInt(char, 10))) {
          col += parseInt(char, 10);
        } else {
          const file = FILES[col];
          const square = `${file}${rank}`;
          const isWhite = char === char.toUpperCase();
          list.push({
            type: char.toLowerCase(),
            color: isWhite ? "w" : "b",
            square,
            position: squareToCoords(square),
          });
          col++;
        }
      }
    }
    return list;
  }, [fen, flipped, boardSurfaceY]);

  // Track previous pieces to trigger captured piece dissolve effect
  const prevPiecesRef = useRef(pieces);
  const [capturedGhost, setCapturedGhost] = useState<{
    type: string;
    color: "w" | "b";
    position: [number, number, number];
    id: string;
  } | null>(null);

  useEffect(() => {
    if (lastMove) {
      const captured = prevPiecesRef.current.find(
        (p) => p.square === lastMove.to
      );
      if (captured) {
        setCapturedGhost({
          type: captured.type,
          color: captured.color,
          position: captured.position,
          id: `${lastMove.from}-${lastMove.to}-${Date.now()}`,
        });
      }
    }
    prevPiecesRef.current = pieces;
  }, [fen, lastMove, pieces]);

  // King in check detection for alert halo
  const checkKingPos = useMemo(() => {
    try {
      const chess = new Chess(fen);
      if (chess.inCheck()) {
        const turn = chess.turn();
        const kingPiece = pieces.find((p) => p.type === "k" && p.color === turn);
        return kingPiece ? kingPiece.position : null;
      }
    } catch {
      return null;
    }
    return null;
  }, [fen, pieces]);

  // Calculate moveFromCoords for moved pieces (including castling rooks)
  const getMoveFromCoords = (sq: string): [number, number, number] | undefined => {
    if (!lastMove) return undefined;
    if (sq === lastMove.to) return squareToCoords(lastMove.from);

    // Castling rook glide detection
    if (lastMove.from === "e1" && lastMove.to === "g1" && sq === "f1") return squareToCoords("h1");
    if (lastMove.from === "e1" && lastMove.to === "c1" && sq === "d1") return squareToCoords("a1");
    if (lastMove.from === "e8" && lastMove.to === "g8" && sq === "f8") return squareToCoords("h8");
    if (lastMove.from === "e8" && lastMove.to === "c8" && sq === "d8") return squareToCoords("a8");

    return undefined;
  };

  const moveId = lastMove ? `${lastMove.from}-${lastMove.to}` : undefined;

  // Pre-generate the 64 squares
  const squares = useMemo(() => {
    const sqs: Array<{
      square: string;
      position: [number, number, number];
      isLight: boolean;
      file: string;
      rank: string;
    }> = [];

    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const file = FILES[f];
        const rank = RANKS[r];
        const square = `${file}${rank}`;
        const isLight = (f + r) % 2 !== 0;
        sqs.push({
          square,
          position: squareToCoords(square),
          isLight,
          file,
          rank,
        });
      }
    }
    return sqs;
  }, [flipped, boardSurfaceY]);

  // Quick lookup set for possible moves (O(1) lookup)
  const possibleMovesSet = useMemo(() => new Set(possibleMoves), [possibleMoves]);

  // Pieces occupying squares (for identifying capture targets)
  const occupiedSquaresSet = useMemo(
    () => new Set(pieces.map((p) => p.square)),
    [pieces]
  );

  // Convert point on board to square
  const handleBoardClick = (point: THREE.Vector3) => {
    let px = point.x;
    let pz = point.z;
    if (flipped) {
      px = -px;
      pz = -pz;
    }
    const fileIdx = Math.round(px + 3.5);
    const rankIdx = Math.round(3.5 - pz);
    if (fileIdx >= 0 && fileIdx < 8 && rankIdx >= 0 && rankIdx < 8) {
      const sq = `${FILES[fileIdx]}${RANKS[rankIdx]}`;
      onSquareClick(sq);
    }
  };

  return (
    <>
      {/* Studio Lighting Optimized for PBR Marble & Wood with 1024x1024 shadow map */}
      <ambientLight intensity={0.75} />
      <directionalLight
        position={[6, 14, 8]}
        intensity={1.75}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6.2}
        shadow-camera-right={6.2}
        shadow-camera-top={6.2}
        shadow-camera-bottom={-6.2}
        shadow-bias={-0.0004}
      />
      {/* Subtle cool fill light */}
      <directionalLight position={[-7, 10, -6]} intensity={0.6} color={0xdbeafe} />
      {/* Warm top highlight */}
      <pointLight position={[0, 6, 0]} intensity={0.35} distance={14} color={0xfffbf0} />

      {/* OrbitControls with Smooth Damping */}
      <OrbitControls
        makeDefault
        enablePan={false}
        enableDamping
        dampingFactor={0.06}
        rotateSpeed={0.7}
        minDistance={6}
        maxDistance={15}
        minPolarAngle={Math.PI / 12}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, boardSurfaceY * 0.5, 0]}
      />

      {/* ======================================================== */}
      {/* BOARD: THEME 1 - POLY HAVEN CC0 LUXURY SCULPTED MARBLE   */}
      {/* ======================================================== */}
      {setTheme === "polyhaven" && polyHaven.boardGeometry && polyHaven.boardMaterial && (
        <group position={[0, 0, 0]}>
          <mesh
            geometry={polyHaven.boardGeometry}
            material={polyHaven.boardMaterial}
            scale={[POLYHAVEN_SCALE, POLYHAVEN_SCALE, POLYHAVEN_SCALE]}
            castShadow
            receiveShadow
            onClick={(e) => {
              e.stopPropagation();
              handleBoardClick(e.point);
            }}
          />
        </group>
      )}

      {/* ======================================================== */}
      {/* BOARD: THEME 2 - OPENGAMEART CC0 HANDCRAFTED WOOD        */}
      {/* ======================================================== */}
      {setTheme === "opengameart" && (
        <group position={[0, 0, 0]}>
          {/* Solid Dark Walnut Outer Frame with Chamfered Rim (Shared Geometries) */}
          <group position={[0, -0.15, 0]}>
            <mesh
              geometry={SHARED_FRAME_GEOM}
              material={woodMats.frameMaterial}
              receiveShadow
              castShadow
              raycast={() => null}
            />
            {/* KillGorack's signature polished brass inlay border */}
            <mesh
              geometry={SHARED_BRASS_TRIM_GEOM}
              material={woodMats.brassMaterial}
              position={[0, 0.185, 0]}
              raycast={() => null}
            />
          </group>

          {/* 64 Wood Tiles (Reusing SHARED_WOOD_TILE_GEOM; raycast handled by interaction plane) */}
          {squares.map((sq) => (
            <mesh
              key={`wood-tile-${sq.square}`}
              geometry={SHARED_WOOD_TILE_GEOM}
              material={
                sq.isLight ? woodMats.lightSquareMaterial : woodMats.darkSquareMaterial
              }
              position={[sq.position[0], 0.01, sq.position[2]]}
              receiveShadow
              raycast={() => null}
            />
          ))}
        </group>
      )}

      {/* ======================================================== */}
      {/* 64 INTERACTIVE SQUARE OVERLAYS & MOVE INDICATORS         */}
      {/* ======================================================== */}
      <group position={[0, 0, 0]}>
        {squares.map((sq) => {
          const isSelected = selectedSquare === sq.square;
          const isPossibleMove = possibleMovesSet.has(sq.square);
          const isLastMove =
            lastMove && (lastMove.from === sq.square || lastMove.to === sq.square);

          const overlayMat = isSelected
            ? SELECTED_OVERLAY_MAT
            : isLastMove
              ? LASTMOVE_OVERLAY_MAT
              : INVISIBLE_OVERLAY_MAT;

          const isCapture = isPossibleMove && occupiedSquaresSet.has(sq.square);

          return (
            <group key={sq.square} position={sq.position}>
              {/* Raycasting interaction plane */}
              <mesh
                geometry={SHARED_PLANE_GEOM}
                material={overlayMat}
                position={[0, 0.015, 0]}
                rotation={[-Math.PI / 2, 0, 0]}
                onClick={(e) => {
                  e.stopPropagation();
                  onSquareClick(sq.square);
                }}
                onPointerOver={(e) => {
                  if (isPossibleMove || isSelected) {
                    e.stopPropagation();
                    if (e.nativeEvent?.target) {
                      (e.nativeEvent.target as HTMLElement).style.cursor = "pointer";
                    }
                  }
                }}
                onPointerOut={(e) => {
                  if (e.nativeEvent?.target) {
                    (e.nativeEvent.target as HTMLElement).style.cursor = "default";
                  }
                }}
              />

              {/* Animated Legal Move Indicator */}
              {isPossibleMove && <AnimatedMoveIndicator isCapture={isCapture} />}
            </group>
          );
        })}
      </group>

      {/* ======================================================== */}
      {/* KING IN CHECK ALERT HALO                                 */}
      {/* ======================================================== */}
      {checkKingPos && <KingCheckHalo position={checkKingPos} />}

      {/* ======================================================== */}
      {/* CAPTURED PIECE DISSOLVE EFFECT                           */}
      {/* ======================================================== */}
      {capturedGhost && (
        <CapturedPieceGhost
          key={capturedGhost.id}
          type={capturedGhost.type}
          color={capturedGhost.color}
          position={capturedGhost.position}
          polyHavenGeometry={
            setTheme === "polyhaven"
              ? polyHaven.getPieceGeometry(capturedGhost.type, capturedGhost.color)
              : undefined
          }
          onFinish={() => setCapturedGhost(null)}
        />
      )}

      {/* ======================================================== */}
      {/* 3D CHESS PIECES (Physics-based Glide, Lift & Landing)    */}
      {/* ======================================================== */}
      <group>
        {pieces.map((p) => {
          const polyGeom =
            setTheme === "polyhaven"
              ? polyHaven.getPieceGeometry(p.type, p.color)
              : undefined;

          const polyMat =
            setTheme === "polyhaven"
              ? p.color === "w"
                ? polyHaven.whiteMaterial
                : polyHaven.blackMaterial
              : undefined;

          const woodMat =
            setTheme === "opengameart"
              ? p.color === "w"
                ? woodMats.whitePieceMaterial
                : woodMats.blackPieceMaterial
              : undefined;

          const moveFrom = getMoveFromCoords(p.square);

          return (
            <ChessPiece3D
              key={`${p.square}-${p.type}-${p.color}`}
              type={p.type}
              color={p.color}
              square={p.square}
              position={p.position}
              isSelected={selectedSquare === p.square}
              isTarget={possibleMovesSet.has(p.square)}
              onClick={onSquareClick}
              setTheme={setTheme}
              polyHavenGeometry={polyGeom}
              polyHavenMaterial={polyMat}
              woodMaterial={woodMat}
              flipped={flipped}
              moveFromCoords={moveFrom}
              moveId={moveId}
            />
          );
        })}
      </group>
    </>
  );
});
