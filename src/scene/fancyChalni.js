import * as THREE from "three";

// Generates ultra-fine wire mesh texture matching the actual chalni photo
function buildFineWireMeshTexture(size = 1024) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Clear background
  ctx.clearRect(0, 0, size, size);

  // Subtle steel sheen base across the circular area
  const center = size / 2;
  const radius = size * 0.485;

  ctx.save();
  ctx.beginPath();
  ctx.arc(center, center, radius, 0, Math.PI * 2);
  ctx.clip();

  // Steel wire color
  ctx.strokeStyle = "rgba(180, 185, 195, 0.75)";
  ctx.lineWidth = 1.2;

  // Ultra dense orthogonal wire grid (woven wire cloth)
  const step = 6;
  ctx.beginPath();
  for (let x = 0; x <= size; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, size);
  }
  for (let y = 0; y <= size; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(size, y);
  }
  ctx.stroke();

  // Add subtle diagonal weave highlights
  ctx.strokeStyle = "rgba(230, 235, 245, 0.25)";
  ctx.lineWidth = 0.8;
  const diagStep = 18;
  ctx.beginPath();
  for (let d = -size; d < size * 2; d += diagStep) {
    ctx.moveTo(d, 0);
    ctx.lineTo(d + size, size);
  }
  ctx.stroke();

  // Scattered tiny dried jasmine flower petals inside the chalni (as in photo!)
  const jasminePetals = [
    { x: size * 0.32, y: size * 0.38, rot: 0.4 },
    { x: size * 0.48, y: size * 0.35, rot: -0.2 },
    { x: size * 0.65, y: size * 0.36, rot: 0.8 },
    { x: size * 0.26, y: size * 0.45, rot: -0.5 },
  ];

  ctx.fillStyle = "rgba(255, 252, 240, 0.88)";
  for (const p of jasminePetals) {
    ctx.save();
    ctx.translate(p.x, p.y);
    ctx.rotate(p.rot);
    for (let i = 0; i < 4; i++) {
      ctx.rotate(Math.PI / 2);
      ctx.beginPath();
      ctx.ellipse(0, 18, 5, 16, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    // Petal center
    ctx.fillStyle = "rgba(240, 210, 120, 0.9)";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "rgba(255, 252, 240, 0.88)";
    ctx.restore();
  }

  ctx.restore();

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  return texture;
}

// Fabric pink rope texture with spiral twist appearance
function buildPinkRopeTexture(size = 256) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext("2d");

  // Pastel baby pink silk base
  ctx.fillStyle = "#f6c3ce";
  ctx.fillRect(0, 0, size, size);

  // Twisted diagonal silk ribbing stripes
  ctx.strokeStyle = "#e89fb2";
  ctx.lineWidth = 14;
  for (let d = -size; d < size * 2; d += 24) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + size, size);
    ctx.stroke();
  }

  // Silk highlight lines
  ctx.strokeStyle = "#ffffff";
  ctx.lineWidth = 4;
  for (let d = -size + 4; d < size * 2; d += 24) {
    ctx.beginPath();
    ctx.moveTo(d, 0);
    ctx.lineTo(d + size, size);
    ctx.stroke();
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(24, 1);
  return texture;
}

// Creates the layered multi-petal pink satin fabric flower
function createFabricFlower({ radius = 0.42 } = {}) {
  const flowerGroup = new THREE.Group();

  const petalMat = new THREE.MeshStandardMaterial({
    color: 0xf8b4c4,
    roughness: 0.5,
    metalness: 0.1,
    side: THREE.DoubleSide,
    emissive: 0x42121e,
    emissiveIntensity: 0.25,
  });

  const centerMat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    roughness: 0.25,
    metalness: 0.3,
  });

  // 3 concentric layers of petals
  const layers = [
    { count: 14, scale: 1.0, z: 0.0, width: 0.11, length: radius },
    { count: 12, scale: 0.78, z: 0.04, width: 0.095, length: radius * 0.78 },
    { count: 10, scale: 0.55, z: 0.08, width: 0.08, length: radius * 0.55 },
  ];

  layers.forEach((layer) => {
    for (let i = 0; i < layer.count; i++) {
      const angle = (i / layer.count) * Math.PI * 2;
      // Diamond/pointed oval petal geometry
      const shape = new THREE.Shape();
      const w = layer.width;
      const l = layer.length;
      shape.moveTo(0, 0);
      shape.quadraticCurveTo(w, l * 0.5, 0, l);
      shape.quadraticCurveTo(-w, l * 0.5, 0, 0);

      const petalGeo = new THREE.ShapeGeometry(shape);
      const petalMesh = new THREE.Mesh(petalGeo, petalMat);
      petalMesh.rotation.z = angle - Math.PI / 2;
      petalMesh.rotation.x = 0.15; // cupped petal
      petalMesh.position.z = layer.z;
      flowerGroup.add(petalMesh);
    }
  });

  // Flower center - pearl dome surrounded by tiny seed beads
  const centerSphere = new THREE.Mesh(new THREE.SphereGeometry(0.09, 16, 16), centerMat);
  centerSphere.position.z = 0.12;
  centerSphere.scale.set(1, 1, 0.6);
  flowerGroup.add(centerSphere);

  const ringBeadCount = 8;
  for (let i = 0; i < ringBeadCount; i++) {
    const a = (i / ringBeadCount) * Math.PI * 2;
    const ringBead = new THREE.Mesh(new THREE.SphereGeometry(0.03, 8, 8), centerMat);
    ringBead.position.set(Math.cos(a) * 0.1, Math.sin(a) * 0.1, 0.12);
    flowerGroup.add(ringBead);
  }

  return { flowerGroup, petalMat };
}

// Builds the hanging pearl tassel strands cascading down from the flower
function createPearlTassel({ strandCount = 7, pearlMaterial } = {}) {
  const tasselGroup = new THREE.Group();

  // Pearl drop strands of varying lengths (pyramid tassel bundle)
  // Strand offsets from center
  const strandConfigs = [
    { x: 0.0, maxLen: 18, radius: 0.038 },
    { x: -0.06, maxLen: 16, radius: 0.034 },
    { x: 0.06, maxLen: 16, radius: 0.034 },
    { x: -0.12, maxLen: 13, radius: 0.032 },
    { x: 0.12, maxLen: 13, radius: 0.032 },
    { x: -0.18, maxLen: 10, radius: 0.03 },
    { x: 0.18, maxLen: 10, radius: 0.03 },
  ];

  strandConfigs.forEach((cfg) => {
    let yPos = 0;
    for (let j = 0; j < cfg.maxLen; j++) {
      // Pearls get slightly smaller toward bottom
      const pRadius = cfg.radius * (1 - (j / cfg.maxLen) * 0.25);
      const pearlGeo = new THREE.SphereGeometry(pRadius, 10, 10);
      const pearlMesh = new THREE.Mesh(pearlGeo, pearlMaterial);

      // Subtle natural drape wave
      const wave = Math.sin(j * 0.45 + cfg.x * 10) * 0.015;
      pearlMesh.position.set(cfg.x + wave, -yPos, (Math.random() - 0.5) * 0.03);
      tasselGroup.add(pearlMesh);

      yPos += pRadius * 2.05;
    }
  });

  return tasselGroup;
}

// Builds the full Karwa Chauth fancy chalni from the user reference photo
export function createFancyChalni({ radius = 1.7 } = {}) {
  const group = new THREE.Group();
  const materials = [];
  const textureLoader = new THREE.TextureLoader();

  // 1. Lustrous ivory pearl material
  const pearlMaterial = new THREE.MeshPhysicalMaterial({
    color: 0xfffaf2,
    emissive: 0x4a4538,
    emissiveIntensity: 0.15,
    roughness: 0.2,
    metalness: 0.1,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
  });
  materials.push(pearlMaterial);

  // 2. Stainless steel rim & mesh frame
  const steelMaterial = new THREE.MeshStandardMaterial({
    color: 0xd8dce4,
    metalness: 0.95,
    roughness: 0.2,
  });
  materials.push(steelMaterial);

  // 3. Fine wire cloth mesh disc (with dried jasmine petals)
  const meshTexture = buildFineWireMeshTexture();
  const discMaterial = new THREE.MeshStandardMaterial({
    map: meshTexture,
    transparent: true,
    metalness: 0.65,
    roughness: 0.35,
    side: THREE.DoubleSide,
    alphaTest: 0.01,
  });
  const disc = new THREE.Mesh(new THREE.CircleGeometry(radius, 64), discMaterial);
  group.add(disc);
  materials.push(discMaterial);

  // 4. Inner steel ring bevel holding the mesh
  const innerSteelRim = new THREE.Mesh(
    new THREE.TorusGeometry(radius, 0.035, 16, 64),
    steelMaterial
  );
  innerSteelRim.position.z = 0.02;
  group.add(innerSteelRim);

  // 5. Pink twisted satin rope border (coiled lace around rim)
  const ropeTexture = buildPinkRopeTexture();
  const ropeMaterial = new THREE.MeshStandardMaterial({
    map: ropeTexture,
    roughness: 0.5,
    metalness: 0.05,
    color: 0xffd4de,
  });
  const ropeTorus = new THREE.Mesh(
    new THREE.TorusGeometry(radius + 0.05, 0.045, 16, 64),
    ropeMaterial
  );
  ropeTorus.position.z = 0.03;
  group.add(ropeTorus);
  materials.push(ropeMaterial);

  // 6. Half-circle / outer border of large round ivory pearls
  // (Notice in photo: pearls line the outer perimeter, especially visible around rim.
  // We omit pearls where the bridal hand grasps the rim so pearls do not poke through the palm/hand!)
  const pearlCount = 128;
  const pearlOrbitRadius = radius + 0.10;
  const outerPearlGeo = new THREE.SphereGeometry(0.032, 16, 16);
  const outerPearls = new THREE.InstancedMesh(outerPearlGeo, pearlMaterial, pearlCount);
  const dummy = new THREE.Object3D();

  let activeIndex = 0;
  for (let i = 0; i < pearlCount; i++) {
    const angle = (i / pearlCount) * Math.PI * 2;
    const normAngle = angle > Math.PI ? angle - Math.PI * 2 : angle;

    // Hand grips the right edge around angle 0 (-15° to +15°)
    const isHandGripArea = Math.abs(normAngle) < 0.28;
    if (isHandGripArea) {
      // Hide pearl at hand grip position by scaling it to 0
      dummy.position.set(0, 0, -100);
      dummy.scale.set(0, 0, 0);
    } else {
      dummy.position.set(
        Math.cos(angle) * pearlOrbitRadius,
        Math.sin(angle) * pearlOrbitRadius,
        0.01
      );
      dummy.scale.set(1, 1, 1);
    }
    dummy.updateMatrix();
    outerPearls.setMatrixAt(i, dummy.matrix);
  }
  outerPearls.instanceMatrix.needsUpdate = true;
  group.add(outerPearls);

  // 7. Transparent lotus/mehndi crest mounted on the upper side of the chalni.
  // A plane keeps the supplied PNG's alpha channel intact and makes the emblem
  // read like a lightweight decorative applique rather than a second object.
  let emblem;
  const emblemHeight = 0.68;
  const emblemTexture = textureLoader.load("./assets/favicon.png", (texture) => {
    // Read the real asset dimensions instead of assuming an aspect ratio.
    // This stays correct if the transparent PNG is replaced later.
    const aspectRatio = texture.image.width / texture.image.height;
    if (emblem) {
      emblem.scale.set(emblemHeight * aspectRatio, emblemHeight, 1);
    }
  });
  emblemTexture.colorSpace = THREE.SRGBColorSpace;
  const emblemMaterial = new THREE.MeshBasicMaterial({
    map: emblemTexture,
    // Muted tint softens the PNG's baked jewelry highlights so the crest
    // belongs with the chalni's fabric flowers instead of looking chrome-plated.
    color: 0xccb49b,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
    side: THREE.DoubleSide,
  });
  emblem = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    emblemMaterial
  );
  // Use the same fixed height before the image finishes loading. The loader
  // callback above applies the exact width as soon as the dimensions exist.
  emblem.scale.set(emblemHeight, emblemHeight, 1);
  emblem.position.set(0, radius - 0.34, 0);
  group.add(emblem);
  materials.push(emblemMaterial);

  // 8. Pink satin flower accent at 6 o'clock (bottom of chalni)
  const { flowerGroup, petalMat } = createFabricFlower({ radius: 0.36 });
  flowerGroup.position.set(0, -radius - 0.22, 0.08);
  group.add(flowerGroup);
  materials.push(petalMat);

  // Small pearl bridge between chalni rim and flower
  for (let y = -radius - 0.03; y >= -radius - 0.2; y -= 0.055) {
    const bridgePearl = new THREE.Mesh(new THREE.SphereGeometry(0.03, 10, 10), pearlMaterial);
    bridgePearl.position.set(0, y, 0.05);
    group.add(bridgePearl);
  }

  // 9. Pearl tassel cascading down below the flower
  const tassel = createPearlTassel({ strandCount: 7, pearlMaterial });
  tassel.position.set(0, -radius - 0.44, 0.06);
  group.add(tassel);

  return {
    group,
    materials,
    discMaterial,
    ropeMaterial,
    pearlMaterial,
    petalMat,
    emblemMaterial,
  };
}
