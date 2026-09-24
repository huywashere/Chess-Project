import * as THREE from "three";

// Cache geometries so we don't recreate them every render
const geometryCache: Record<string, THREE.BufferGeometry> = {};

/**
 * Creates standard Staunton piece geometries
 */
export function getPieceGeometry(type: string): THREE.BufferGeometry {
  if (geometryCache[type]) {
    return geometryCache[type];
  }

  let geom: THREE.BufferGeometry;

  switch (type.toLowerCase()) {
    case "p": // Pawn
      geom = createPawnGeometry();
      break;
    case "r": // Rook
      geom = createRookGeometry();
      break;
    case "n": // Knight
      geom = createKnightGeometry();
      break;
    case "b": // Bishop
      geom = createBishopGeometry();
      break;
    case "q": // Queen
      geom = createQueenGeometry();
      break;
    case "k": // King
      geom = createKingGeometry();
      break;
    default:
      geom = new THREE.CylinderGeometry(0.3, 0.35, 1, 32);
  }

  geometryCache[type] = geom;
  return geom;
}

/**
 * PAWN GEOMETRY
 */
function createPawnGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.32, 0),
    new THREE.Vector2(0.32, 0.06),
    new THREE.Vector2(0.28, 0.09),
    new THREE.Vector2(0.27, 0.14),
    new THREE.Vector2(0.22, 0.18),
    new THREE.Vector2(0.17, 0.24),
    new THREE.Vector2(0.14, 0.40),
    new THREE.Vector2(0.13, 0.52),
    new THREE.Vector2(0.19, 0.56),
    new THREE.Vector2(0.18, 0.61),
    new THREE.Vector2(0.14, 0.63),
    new THREE.Vector2(0.0, 0.64),
  ];

  const bodyGeom = new THREE.LatheGeometry(points, 32);
  const headGeom = new THREE.SphereGeometry(0.18, 32, 24);
  headGeom.translate(0, 0.78, 0);

  // Merge into single geometry
  return mergeGeometries([bodyGeom, headGeom]);
}

/**
 * ROOK GEOMETRY
 */
function createRookGeometry(): THREE.BufferGeometry {
  const basePoints: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.34, 0),
    new THREE.Vector2(0.34, 0.08),
    new THREE.Vector2(0.30, 0.12),
    new THREE.Vector2(0.28, 0.16),
    new THREE.Vector2(0.22, 0.22),
    new THREE.Vector2(0.19, 0.60),
    new THREE.Vector2(0.21, 0.85),
    new THREE.Vector2(0.26, 0.90),
    new THREE.Vector2(0.29, 0.95),
    new THREE.Vector2(0.29, 1.20),
    new THREE.Vector2(0.22, 1.20),
    new THREE.Vector2(0.22, 1.05),
    new THREE.Vector2(0, 1.05),
  ];

  const bodyGeom = new THREE.LatheGeometry(basePoints, 32);

  // 4 crenellations (cutouts / battlements) on top
  const crenellations: THREE.BufferGeometry[] = [];
  const crenCount = 4;
  for (let i = 0; i < crenCount; i++) {
    const angle = (i * Math.PI * 2) / crenCount;
    const box = new THREE.BoxGeometry(0.11, 0.14, 0.11);
    const r = 0.25;
    box.translate(Math.cos(angle) * r, 1.25, Math.sin(angle) * r);
    crenellations.push(box);
  }

  return mergeGeometries([bodyGeom, ...crenellations]);
}

/**
 * KNIGHT GEOMETRY (Turned pedestal + Sculpted horse head)
 */
function createKnightGeometry(): THREE.BufferGeometry {
  const basePoints: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.34, 0),
    new THREE.Vector2(0.34, 0.08),
    new THREE.Vector2(0.29, 0.12),
    new THREE.Vector2(0.27, 0.18),
    new THREE.Vector2(0.22, 0.26),
    new THREE.Vector2(0.20, 0.40),
    new THREE.Vector2(0.22, 0.44),
    new THREE.Vector2(0, 0.44),
  ];
  const baseGeom = new THREE.LatheGeometry(basePoints, 32);

  // Sculpted horse silhouette shape
  const horseShape = new THREE.Shape();
  horseShape.moveTo(-0.16, 0.42);
  horseShape.lineTo(0.18, 0.42);
  // Chest curve
  horseShape.quadraticCurveTo(0.26, 0.65, 0.24, 0.85);
  // Lower jaw
  horseShape.lineTo(0.32, 0.95);
  // Snout
  horseShape.lineTo(0.28, 1.12);
  // Nose bridge
  horseShape.lineTo(0.12, 1.24);
  // Forehead to ear
  horseShape.lineTo(0.06, 1.42);
  // Ear tip & back of ear
  horseShape.lineTo(-0.02, 1.46);
  horseShape.lineTo(-0.04, 1.34);
  // Arched mane
  horseShape.quadraticCurveTo(-0.18, 1.15, -0.22, 0.85);
  horseShape.quadraticCurveTo(-0.24, 0.60, -0.16, 0.42);

  const extrudeSettings = {
    steps: 1,
    depth: 0.22,
    bevelEnabled: true,
    bevelThickness: 0.04,
    bevelSize: 0.03,
    bevelSegments: 4,
  };

  const headGeom = new THREE.ExtrudeGeometry(horseShape, extrudeSettings);
  // Center the extrusion on Z axis
  headGeom.translate(0, 0, -0.11);

  return mergeGeometries([baseGeom, headGeom]);
}

/**
 * BISHOP GEOMETRY
 */
function createBishopGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.34, 0),
    new THREE.Vector2(0.34, 0.08),
    new THREE.Vector2(0.29, 0.12),
    new THREE.Vector2(0.27, 0.17),
    new THREE.Vector2(0.21, 0.24),
    new THREE.Vector2(0.16, 0.45),
    new THREE.Vector2(0.15, 0.72),
    new THREE.Vector2(0.22, 0.77),
    new THREE.Vector2(0.21, 0.83),
    new THREE.Vector2(0.16, 0.86),
    // Mitre body (egg-shaped profile)
    new THREE.Vector2(0.23, 0.98),
    new THREE.Vector2(0.24, 1.18),
    new THREE.Vector2(0.16, 1.38),
    new THREE.Vector2(0.06, 1.48),
    new THREE.Vector2(0, 1.50),
  ];

  const bodyGeom = new THREE.LatheGeometry(points, 32);

  // Finial small ball on top
  const ballGeom = new THREE.SphereGeometry(0.06, 16, 16);
  ballGeom.translate(0, 1.54, 0);

  return mergeGeometries([bodyGeom, ballGeom]);
}

/**
 * QUEEN GEOMETRY
 */
function createQueenGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.37, 0),
    new THREE.Vector2(0.37, 0.08),
    new THREE.Vector2(0.32, 0.13),
    new THREE.Vector2(0.29, 0.18),
    new THREE.Vector2(0.22, 0.28),
    new THREE.Vector2(0.17, 0.65),
    new THREE.Vector2(0.16, 0.95),
    new THREE.Vector2(0.24, 1.02),
    new THREE.Vector2(0.23, 1.09),
    new THREE.Vector2(0.18, 1.12),
    // Flared coronet
    new THREE.Vector2(0.28, 1.36),
    new THREE.Vector2(0.31, 1.52),
    new THREE.Vector2(0.26, 1.55),
    new THREE.Vector2(0.12, 1.50),
    new THREE.Vector2(0, 1.48),
  ];

  const bodyGeom = new THREE.LatheGeometry(points, 32);

  // Queen coronet sphere
  const crownBall = new THREE.SphereGeometry(0.09, 20, 20);
  crownBall.translate(0, 1.60, 0);

  // Subtle coronet pearls (mini spheres around rim)
  const pearls: THREE.BufferGeometry[] = [];
  const pearlCount = 8;
  for (let i = 0; i < pearlCount; i++) {
    const angle = (i * Math.PI * 2) / pearlCount;
    const pearl = new THREE.SphereGeometry(0.032, 12, 12);
    const r = 0.29;
    pearl.translate(Math.cos(angle) * r, 1.54, Math.sin(angle) * r);
    pearls.push(pearl);
  }

  return mergeGeometries([bodyGeom, crownBall, ...pearls]);
}

/**
 * KING GEOMETRY
 */
function createKingGeometry(): THREE.BufferGeometry {
  const points: THREE.Vector2[] = [
    new THREE.Vector2(0, 0),
    new THREE.Vector2(0.39, 0),
    new THREE.Vector2(0.39, 0.09),
    new THREE.Vector2(0.34, 0.14),
    new THREE.Vector2(0.31, 0.19),
    new THREE.Vector2(0.24, 0.30),
    new THREE.Vector2(0.18, 0.70),
    new THREE.Vector2(0.17, 1.05),
    new THREE.Vector2(0.26, 1.13),
    new THREE.Vector2(0.25, 1.21),
    new THREE.Vector2(0.19, 1.25),
    // Majestic crown dome
    new THREE.Vector2(0.29, 1.48),
    new THREE.Vector2(0.27, 1.68),
    new THREE.Vector2(0.14, 1.74),
    new THREE.Vector2(0, 1.75),
  ];

  const bodyGeom = new THREE.LatheGeometry(points, 32);

  // King's Cross Finial on top
  const crossVertical = new THREE.BoxGeometry(0.06, 0.25, 0.05);
  crossVertical.translate(0, 1.88, 0);

  const crossHorizontal = new THREE.BoxGeometry(0.18, 0.06, 0.05);
  crossHorizontal.translate(0, 1.93, 0);

  return mergeGeometries([bodyGeom, crossVertical, crossHorizontal]);
}

/**
 * Utility to merge multiple BufferGeometries into one
 */
function mergeGeometries(geometries: THREE.BufferGeometry[]): THREE.BufferGeometry {
  const merged = new THREE.BufferGeometry();
  const positions: number[] = [];
  const normals: number[] = [];
  const uvs: number[] = [];

  for (const geom of geometries) {
    const nonIndexed = geom.toNonIndexed();
    const pos = nonIndexed.getAttribute("position");
    const norm = nonIndexed.getAttribute("normal");
    const uv = nonIndexed.getAttribute("uv");

    if (pos) {
      for (let i = 0; i < pos.count * 3; i++) {
        positions.push(pos.array[i]);
      }
    }

    if (norm) {
      for (let i = 0; i < norm.count * 3; i++) {
        normals.push(norm.array[i]);
      }
    }

    if (uv) {
      for (let i = 0; i < uv.count * 2; i++) {
        uvs.push(uv.array[i]);
      }
    }
  }

  merged.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  if (normals.length === positions.length) {
    merged.setAttribute("normal", new THREE.Float32BufferAttribute(normals, 3));
  } else {
    merged.computeVertexNormals();
  }

  if (uvs.length > 0) {
    merged.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  }

  return merged;
}
