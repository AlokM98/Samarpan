import * as THREE from "three";

// High-resolution realistic lunar diffuse and bump maps
function loadMoonTextures() {
  const texLoader = new THREE.TextureLoader();
  const diffuseMap = texLoader.load("assets/moon/moon_diffuse.jpg");
  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  diffuseMap.wrapS = THREE.RepeatWrapping;
  diffuseMap.wrapT = THREE.ClampToEdgeWrapping;

  const bumpMap = texLoader.load("assets/moon/moon_bump.jpg");
  bumpMap.wrapS = THREE.RepeatWrapping;
  bumpMap.wrapT = THREE.ClampToEdgeWrapping;

  return { diffuseMap, bumpMap };
}

// Builds multi-layered soft ethereal lunar glow halos
function buildAtmosphericGlow(radius) {
  const glowGroup = new THREE.Group();

  // 1. Inner radiant core halo
  const coreCanvas = document.createElement("canvas");
  coreCanvas.width = 512;
  coreCanvas.height = 512;
  const coreCtx = coreCanvas.getContext("2d");
  const coreGrad = coreCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
  coreGrad.addColorStop(0, "rgba(255, 250, 235, 0.95)");
  coreGrad.addColorStop(0.25, "rgba(255, 240, 205, 0.55)");
  coreGrad.addColorStop(0.55, "rgba(255, 225, 175, 0.16)");
  coreGrad.addColorStop(1.0, "rgba(255, 215, 150, 0)");
  coreCtx.fillStyle = coreGrad;
  coreCtx.fillRect(0, 0, 512, 512);

  const coreTex = new THREE.CanvasTexture(coreCanvas);
  const coreMat = new THREE.SpriteMaterial({
    map: coreTex,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const coreSprite = new THREE.Sprite(coreMat);
  coreSprite.scale.set(radius * 2.8, radius * 2.8, 1);
  coreSprite.position.z = -0.05;
  glowGroup.add(coreSprite);

  // 2. Wide atmospheric moonlight corona (hazy night sky dispersion)
  const outerCanvas = document.createElement("canvas");
  outerCanvas.width = 512;
  outerCanvas.height = 512;
  const outerCtx = outerCanvas.getContext("2d");
  const outerGrad = outerCtx.createRadialGradient(256, 256, 0, 256, 256, 256);
  outerGrad.addColorStop(0, "rgba(240, 245, 255, 0.40)");
  outerGrad.addColorStop(0.35, "rgba(220, 230, 250, 0.18)");
  outerGrad.addColorStop(0.70, "rgba(180, 205, 245, 0.05)");
  outerGrad.addColorStop(1.0, "rgba(180, 205, 245, 0)");
  outerCtx.fillStyle = outerGrad;
  outerCtx.fillRect(0, 0, 512, 512);

  const outerTex = new THREE.CanvasTexture(outerCanvas);
  const outerMat = new THREE.SpriteMaterial({
    map: outerTex,
    blending: THREE.AdditiveBlending,
    transparent: true,
    depthWrite: false,
  });
  const outerSprite = new THREE.Sprite(outerMat);
  outerSprite.scale.set(radius * 6.5, radius * 6.5, 1);
  outerSprite.position.z = -0.15;
  glowGroup.add(outerSprite);

  return glowGroup;
}

// Returns { group, mesh, glow, light } - group holds the photorealistic moon mesh + its glow halos,
// light is a warm point light for illuminating the chalni's metal.
// Moon is positioned FAR away (z = -65) with true Karwa Chauth distant scale
export function createMoon({ radius = 2.4, position = new THREE.Vector3(0, 1.2, -65) } = {}) {
  const group = new THREE.Group();
  group.position.copy(position);

  const { diffuseMap, bumpMap } = loadMoonTextures();

  const geometry = new THREE.SphereGeometry(radius, 96, 96);

  // MeshStandardMaterial with high emissive texture map so it looks luminous yet displays
  // real surface relief, crater rims, dark basaltic maria, and ejecta rays
  const material = new THREE.MeshStandardMaterial({
    map: diffuseMap,
    bumpMap: bumpMap,
    bumpScale: 0.045,
    roughness: 0.88,
    metalness: 0.0,
    emissiveMap: diffuseMap,
    emissive: new THREE.Color(0xfcf6e8),
    emissiveIntensity: 0.78,
  });

  const mesh = new THREE.Mesh(geometry, material);
  // Orient moon so the iconic nearside (Mare Imbrium, Oceanus Procellarum, Tycho) faces directly to earth/camera
  mesh.rotation.y = Math.PI * 0.55;
  mesh.rotation.x = 0.12;
  group.add(mesh);

  const glow = buildAtmosphericGlow(radius);
  group.add(glow);

  // Offset forward from moon so it illuminates the chalni & hand from far away
  const light = new THREE.PointLight(0xffe9b8, 2.5, 120, 1.2);
  light.position.set(0, 0, radius * 3);
  group.add(light);

  return { group, mesh, glow, light };
}

