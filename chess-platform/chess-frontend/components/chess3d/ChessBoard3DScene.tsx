"use client";

import React, { useMemo } from "react";
import * as THREE from "three";
import { OrbitControls } from "@react-three/drei";
import { ChessPiece3D } from "./ChessPiece3D";

export interface ChessBoard3DSceneProps {
  fen: string;
  selectedSquare: string | null;
  possibleMoves: string[];
  lastMove: { from: string; to: string } | null;
  onSquareClick: (square: string) => void;
  boardTheme?: string;
  materialTheme?: "classic_wood" | "tournament" | "marble";
  flipped?: boolean;
}

const FILES = ["a", "b", "c", "d", "e", "f", "g", "h"];
const RANKS = ["1", "2", "3", "4", "5", "6", "7", "8"];

export function ChessBoard3DScene({
  fen,
  selectedSquare,
  possibleMoves,
  lastMove,
  onSquareClick,
  boardTheme = "listudy",
  materialTheme = "classic_wood",
  flipped = false,
}: ChessBoard3DSceneProps) {
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

    return [x, 0.05, z];
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
  }, [fen, flipped]);

  // Board square colors based on theme
  const { lightColor, darkColor, frameColor } = useMemo(() => {
    switch (boardTheme) {
      case "listudy":
        return {
          lightColor: 0xdee3e6,
          darkColor: 0x8ca2ad,
          frameColor: 0x485860,
        };
      case "wood":
        return {
          lightColor: 0xf0d9b5,
          darkColor: 0xb58863,
          frameColor: 0x3d2716,
        };
      case "blue":
        return {
          lightColor: 0xd0e0ed,
          darkColor: 0x4d7399,
          frameColor: 0x1b2836,
        };
      case "dark":
        return {
          lightColor: 0xb8b5b0,
          darkColor: 0x4a4845,
          frameColor: 0x1a1918,
        };
      case "green":
      default:
        // Tournament green (Lichess/Chess.com standard)
        return {
          lightColor: 0xeeeed2,
          darkColor: 0x769656,
          frameColor: 0x24201b,
        };
    }
  }, [boardTheme]);

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
  }, [flipped]);

  return (
    <>
      {/* Cinematic Studio Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight
        position={[6, 14, 8]}
        intensity={1.6}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={30}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      {/* Soft blue-ish backlight for rim contours */}
      <directionalLight position={[-6, 10, -7]} intensity={0.5} color={0xdbeafe} />
      <pointLight position={[0, 4, 0]} intensity={0.3} distance={10} />

      {/* OrbitControls */}
      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={6}
        maxDistance={15}
        minPolarAngle={Math.PI / 12}
        maxPolarAngle={Math.PI / 2.15}
        target={[0, 0.1, 0]}
      />

      {/* Outer Wooden Board Frame */}
      <group position={[0, -0.15, 0]}>
        <mesh receiveShadow castShadow>
          <boxGeometry args={[9.4, 0.35, 9.4]} />
          <meshStandardMaterial color={frameColor} roughness={0.4} metalness={0.08} />
        </mesh>
        {/* Subtle decorative inner brass inlay border */}
        <mesh position={[0, 0.18, 0]}>
          <boxGeometry args={[8.16, 0.02, 8.16]} />
          <meshStandardMaterial color={0x52402b} roughness={0.6} metalness={0.2} />
        </mesh>
      </group>

      {/* 64 Chess Squares */}
      <group position={[0, 0, 0]}>
        {squares.map((sq) => {
          const isSelected = selectedSquare === sq.square;
          const isPossibleMove = possibleMoves.includes(sq.square);
          const isLastMove =
            lastMove && (lastMove.from === sq.square || lastMove.to === sq.square);

          let squareColor = sq.isLight ? lightColor : darkColor;

          if (isSelected) {
            squareColor = 0xbbf7d0; // Soft bright emerald
          } else if (isLastMove) {
            squareColor = 0xfde047; // Soft warm yellow
          }

          return (
            <group key={sq.square} position={sq.position}>
              {/* Board Square Tile */}
              <mesh
                receiveShadow
                onClick={(e) => {
                  e.stopPropagation();
                  onSquareClick(sq.square);
                }}
                onPointerOver={(e) => {
                  e.stopPropagation();
                  if (isPossibleMove || isSelected) {
                    document.body.style.cursor = "pointer";
                  }
                }}
                onPointerOut={() => {
                  document.body.style.cursor = "default";
                }}
              >
                <boxGeometry args={[0.98, 0.08, 0.98]} />
                <meshStandardMaterial
                  color={squareColor}
                  roughness={sq.isLight ? 0.35 : 0.3}
                  metalness={0.02}
                />
              </mesh>

              {/* Legal Move Target Indicator (Dot or Ring) */}
              {isPossibleMove && (
                <mesh
                  position={[0, 0.06, 0]}
                  rotation={[-Math.PI / 2, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSquareClick(sq.square);
                  }}
                >
                  <circleGeometry args={[0.16, 32]} />
                  <meshBasicMaterial
                    color={0x15803d}
                    transparent
                    opacity={0.7}
                    side={THREE.DoubleSide}
                  />
                </mesh>
              )}
            </group>
          );
        })}
      </group>

      {/* 3D Staunton Chess Pieces */}
      <group>
        {pieces.map((p) => (
          <ChessPiece3D
            key={`${p.square}-${p.type}-${p.color}`}
            type={p.type}
            color={p.color}
            square={p.square}
            position={p.position}
            isSelected={selectedSquare === p.square}
            isTarget={possibleMoves.includes(p.square)}
            onClick={onSquareClick}
            materialTheme={materialTheme}
          />
        ))}
      </group>
    </>
  );
}
