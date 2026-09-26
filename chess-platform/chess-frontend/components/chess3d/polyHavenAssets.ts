"use client";

import { useMemo } from "react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { mergeGeometries } from "three/examples/jsm/utils/BufferGeometryUtils.js";

// Scale factor so that 0.057888 units = 1.0 Three.js coordinate unit
export const POLYHAVEN_SCALE = 17.274737;

// Preload the model asset so it loads smoothly in the background
if (typeof window !== "undefined") {
  useGLTF.preload("/models/polyhaven/chess_set_1k.gltf");
}

export function usePolyHavenAssets() {
  const gltf = useGLTF("/models/polyhaven/chess_set_1k.gltf") as any;

  return useMemo(() => {
    const nodes: Record<string, THREE.Mesh> = {};
    const materials: Record<string, THREE.Material> = {};

    // 1. First assign standard nodes and materials from loader output
    if (gltf?.nodes) {
      Object.assign(nodes, gltf.nodes);
    }
    if (gltf?.materials) {
      Object.assign(materials, gltf.materials);
    }

    // 2. Extract and merge multi-primitive piece groups (like Bishops with mitre cleft cut)
    if (gltf?.scene) {
      gltf.scene.traverse((obj: any) => {
        // Collect materials from scene hierarchy
        if (obj.material) {
          if (Array.isArray(obj.material)) {
            obj.material.forEach((m: any) => {
              if (m?.name) materials[m.name] = m;
            });
          } else if (obj.material.name) {
            materials[obj.material.name] = obj.material;
          }
        }

        // Only process chess piece objects and the board (avoid root Scene container)
        if (obj.name && (obj.name.startsWith("piece_") || obj.name === "board")) {
          if (obj.geometry) {
            nodes[obj.name] = obj;
          } else if (obj.children && obj.children.length > 0) {
            // Collect geometries from direct mesh children
            const childGeoms: THREE.BufferGeometry[] = [];
            let childMat: THREE.Material | undefined;

            for (const child of obj.children) {
              if (child.isMesh && child.geometry) {
                // Ensure matching attributes for clean merge
                const g = child.geometry.clone();
                // If secondary lightmap UVs exist, remove to ensure clean merge
                if (g.attributes.uv1) {
                  g.deleteAttribute("uv1");
                }
                childGeoms.push(g);
                if (!childMat && child.material) childMat = child.material;
              }
            }

            if (childGeoms.length === 1) {
              nodes[obj.name] = { geometry: childGeoms[0], material: childMat || obj.material } as any;
            } else if (childGeoms.length > 1) {
              const merged = mergeGeometries(childGeoms, false);
              if (merged) {
                nodes[obj.name] = { geometry: merged, material: childMat || obj.material } as any;
              }
            }
          }
        }
      });
    }

    const boardGeometry = nodes.board?.geometry as THREE.BufferGeometry | undefined;
    const boardMaterial = (materials.chess_set_board || nodes.board?.material) as THREE.Material | undefined;
    const whiteMaterial = (materials.chess_set_pieces_white || nodes.piece_pawn_white_01?.material) as THREE.Material | undefined;
    const blackMaterial = (materials.chess_set_pieces_black || nodes.piece_pawn_black_01?.material) as THREE.Material | undefined;

    // Cache geometries in dictionary for O(1) retrieval
    const geometryMap: Record<string, THREE.BufferGeometry | undefined> = {
      pw: nodes.piece_pawn_white_01?.geometry,
      pb: nodes.piece_pawn_black_01?.geometry,
      rw: nodes.piece_rook_white_01?.geometry,
      rb: nodes.piece_rook_black_01?.geometry,
      nw: nodes.piece_knight_white_01?.geometry,
      nb: nodes.piece_knight_black_01?.geometry,
      bw: nodes.piece_bishop_white_01?.geometry || nodes.piece_bishop_white_02?.geometry,
      bb: nodes.piece_bishop_black_01?.geometry || nodes.piece_bishop_black_02?.geometry,
      qw: nodes.piece_queen_white?.geometry,
      qb: nodes.piece_queen_black?.geometry,
      kw: nodes.piece_king_white?.geometry,
      kb: nodes.piece_king_black?.geometry,
    };

    const getPieceGeometry = (type: string, color: "w" | "b"): THREE.BufferGeometry | undefined => {
      const key = `${type.toLowerCase()}${color}`;
      return geometryMap[key];
    };

    return {
      nodes,
      materials,
      boardGeometry,
      boardMaterial,
      whiteMaterial,
      blackMaterial,
      getPieceGeometry,
    };
  }, [gltf]);
}
