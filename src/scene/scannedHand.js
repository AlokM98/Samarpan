import * as THREE from "three";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";

function createBridalChooda({ count = 16 } = {}) {
  const group = new THREE.Group();

  const redMat = new THREE.MeshPhysicalMaterial({
    color: 0xba0824,
    roughness: 0.15,
    metalness: 0.12,
    clearcoat: 1.0,
  });

  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xffd35a,
    metalness: 0.95,
    roughness: 0.20,
  });

  const pearlMat = new THREE.MeshPhysicalMaterial({
    color: 0xfffbf5,
    roughness: 0.2,
    metalness: 0.05,
    clearcoat: 1.0,
  });

  const spacing = 0.022;
  const baseR = 0.275;

  for (let i = 0; i < count; i++) {
    const isGold = (i === 0 || i === 1 || i === count - 1 || i === count - 2 || i === 7 || i === 8);
    const mat = isGold ? goldMat : redMat;
    // const tubeR = isGold ? 0.016 : 0.012;
    const tubeR = 0.016;
    const r = baseR + (i * 0.001);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(r, tubeR, 16, 44),
      mat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.y = (i - count / 2) * spacing;
    group.add(ring);

    if (i === 0 || i === count - 1) {
      const bCount = 16;
      for (let b = 0; b < bCount; b++) {
        const a = (b / bCount) * Math.PI * 2;
        const bead = new THREE.Mesh(
          new THREE.SphereGeometry(0.009, 8, 8),
          b % 2 === 0 ? pearlMat : goldMat
        );
        bead.position.set(
          Math.cos(a) * (r + tubeR * 0.85),
          (i - count / 2) * spacing,
          Math.sin(a) * (r + tubeR * 0.85)
        );
        group.add(bead);
      }
    }
  }

  return group;
}



export async function loadScannedBridalHand() {
  const texLoader = new THREE.TextureLoader();

  const diffuseMap = await texLoader.loadAsync("assets/female_hand/skin_diffuse.png");
  diffuseMap.colorSpace = THREE.SRGBColorSpace;
  diffuseMap.flipY = true;

  const normalMap = await texLoader.loadAsync("assets/female_hand/0/default_normal.jpg");
  normalMap.flipY = true;

  const aoMap = await texLoader.loadAsync("assets/female_hand/0/default_occlusion_occl_scale1.jpg");
  aoMap.flipY = true;

  const skinMaterial = new THREE.MeshStandardMaterial({
    map: diffuseMap,
    normalMap: normalMap,
    normalScale: new THREE.Vector2(1.0, 1.0),
    aoMap: aoMap,
    aoMapIntensity: 1.0,
    roughness: 0.60,
    metalness: 0.02,
  });

  const objLoader = new OBJLoader();
  const obj = await objLoader.loadAsync("assets/female_hand/female_hand.obj");

  let handMesh = null;
  obj.traverse((child) => {
    if (child.isMesh) {
      child.geometry.computeVertexNormals();
      child.material = skinMaterial;
      child.castShadow = true;
      child.receiveShadow = true;
      handMesh = child;
    }
  });

  const handGroup = new THREE.Group();
  let nailMaterial = null;

  if (handMesh) {
    // 1. Center wrist origin
    handMesh.geometry.translate(1.05, 0.14, -0.89);

    // 2. Scale
    const scale = 0.088;
    handMesh.scale.set(scale, scale, scale);

    const meshWrapper = new THREE.Group();
    meshWrapper.add(handMesh);

    // Rotation from karwa_exact_reference_match.png
    handMesh.rotation.z = -Math.PI * 0.5;

    const m = new THREE.Matrix4();
    m.set(
      0.99454208, -0.04625827, -0.09352122, 0,
      0.08565094, -0.14988915,  0.98498587, 0,
     -0.05958156, -0.98762008, -0.14510901, 0,
      0,           0,           0,          1
    );
    meshWrapper.applyMatrix4(m);

    // Position hand so thumb rests directly on the outer rim
    meshWrapper.position.set(-0.06, -0.74, 0.12);

    handGroup.add(meshWrapper);

    // Position chooda up on the actual wrist base (raised from -0.74 to -0.62)
    const chooda = createBridalChooda({ count: 16 });
    chooda.position.set(-0.21, -0.2, 0.18);
    chooda.rotation.set(-0.1, 0.1, 0.3);
    handGroup.add(chooda);

  }

  return { handGroup, skinMaterial, nailMaterial };
}
