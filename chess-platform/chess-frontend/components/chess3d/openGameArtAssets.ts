import * as THREE from "three";

// ============================================================================
// PERFORMANCE OPTIMIZATION: MODULE SINGLETON WOOD TEXTURES & MATERIALS
// Created once across the application lifecycle to avoid memory & VRAM leaks
// ============================================================================
let woodMaterialsCache: {
  lightSquareMaterial: THREE.MeshStandardMaterial;
  darkSquareMaterial: THREE.MeshStandardMaterial;
  frameMaterial: THREE.MeshStandardMaterial;
  brassMaterial: THREE.MeshStandardMaterial;
  whitePieceMaterial: THREE.MeshStandardMaterial;
  blackPieceMaterial: THREE.MeshStandardMaterial;
} | null = null;

function initWoodMaterials() {
  if (woodMaterialsCache) return woodMaterialsCache;

  const loader = new THREE.TextureLoader();

  const lightWood = loader.load("/textures/3d/wood_diffuse_light.jpg");
  const darkWood = loader.load("/textures/3d/wood_diffuse_dark.jpg");

  lightWood.wrapS = THREE.RepeatWrapping;
  lightWood.wrapT = THREE.RepeatWrapping;
  lightWood.colorSpace = THREE.SRGBColorSpace;
  lightWood.minFilter = THREE.LinearMipmapLinearFilter;
  lightWood.generateMipmaps = true;

  darkWood.wrapS = THREE.RepeatWrapping;
  darkWood.wrapT = THREE.RepeatWrapping;
  darkWood.colorSpace = THREE.SRGBColorSpace;
  darkWood.minFilter = THREE.LinearMipmapLinearFilter;
  darkWood.generateMipmaps = true;

  // OpenGameArt Light Square Material (Natural Maple Wood)
  const lightSquareMaterial = new THREE.MeshStandardMaterial({
    map: lightWood,
    color: 0xfaf4e8,
    roughness: 0.32,
    metalness: 0.03,
  });

  // OpenGameArt Dark Square Material (Rich Roasted Walnut)
  const darkSquareMaterial = new THREE.MeshStandardMaterial({
    map: darkWood,
    color: 0x5a3d28,
    roughness: 0.28,
    metalness: 0.04,
  });

  // OpenGameArt Board Frame Material (Deep Walnut with Chamfer)
  const frameMaterial = new THREE.MeshStandardMaterial({
    map: darkWood,
    color: 0x362214,
    roughness: 0.38,
    metalness: 0.05,
  });

  // Decorative Golden Brass Trim Inlay (KillGorack's signature detail)
  const brassMaterial = new THREE.MeshStandardMaterial({
    color: 0xd4af37,
    roughness: 0.22,
    metalness: 0.85,
  });

  // OpenGameArt White Piece Material (Natural Lathe-Turned Maple)
  const whitePieceMaterial = new THREE.MeshStandardMaterial({
    map: lightWood,
    color: 0xf5ead6,
    roughness: 0.34,
    metalness: 0.03,
  });

  // OpenGameArt Black Piece Material (Dark Walnut Satin Sheen)
  const blackPieceMaterial = new THREE.MeshStandardMaterial({
    map: darkWood,
    color: 0x3a2417,
    roughness: 0.30,
    metalness: 0.05,
  });

  woodMaterialsCache = {
    lightSquareMaterial,
    darkSquareMaterial,
    frameMaterial,
    brassMaterial,
    whitePieceMaterial,
    blackPieceMaterial,
  };

  return woodMaterialsCache;
}

export function useWoodMaterials() {
  return initWoodMaterials();
}
