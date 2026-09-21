import * as THREE from "three";

/**
 * Creates an ornate brass/terracotta Karwa Chauth Diya (oil lamp)
 * with a dynamic flickering flame, teardrop core, outer glow, and flickering point light.
 */
export function createDiya() {
  const diyaGroup = new THREE.Group();

  // 1. Terracotta / Ornate Brass Clay Body
  // Lathe geometry for traditional earthen diya cup shape with rim and pinched spout
  const points = [];
  points.push(new THREE.Vector2(0, 0));
  points.push(new THREE.Vector2(0.18, 0.02));
  points.push(new THREE.Vector2(0.26, 0.08));
  points.push(new THREE.Vector2(0.32, 0.18));
  points.push(new THREE.Vector2(0.35, 0.28));
  points.push(new THREE.Vector2(0.36, 0.32));
  // Lip rim
  points.push(new THREE.Vector2(0.38, 0.34));
  points.push(new THREE.Vector2(0.35, 0.35));
  // Inner hollow
  points.push(new THREE.Vector2(0.30, 0.30));
  points.push(new THREE.Vector2(0.22, 0.18));
  points.push(new THREE.Vector2(0.08, 0.10));
  points.push(new THREE.Vector2(0, 0.09));

  const latheGeo = new THREE.LatheGeometry(points, 32);
  const diyaMat = new THREE.MeshStandardMaterial({
    color: 0xc87d46, // terracotta clay base
    roughness: 0.65,
    metalness: 0.25,
  });

  const bowl = new THREE.Mesh(latheGeo, diyaMat);
  bowl.castShadow = true;
  diyaGroup.add(bowl);

  // Ornate decorative rim bead band (gold/brass dots around edge)
  const beadCount = 18;
  const beadRadius = 0.36;
  const beadGeo = new THREE.SphereGeometry(0.022, 10, 10);
  const beadMat = new THREE.MeshStandardMaterial({
    color: 0xefc45c,
    metalness: 0.9,
    roughness: 0.2,
  });

  const beadsGroup = new THREE.Group();
  for (let i = 0; i < beadCount; i++) {
    const angle = (i / beadCount) * Math.PI * 2;
    const bead = new THREE.Mesh(beadGeo, beadMat);
    bead.position.set(
      Math.cos(angle) * beadRadius,
      0.34,
      Math.sin(angle) * beadRadius
    );
    beadsGroup.add(bead);
  }
  diyaGroup.add(beadsGroup);

  // 2. Cotton Wick (Batti)
  const wickCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(0, 0.12, 0),
    new THREE.Vector3(0.06, 0.26, 0.08),
    new THREE.Vector3(0.08, 0.36, 0.12),
  ]);
  const wickGeo = new THREE.TubeGeometry(wickCurve, 12, 0.016, 8, false);
  const wickMat = new THREE.MeshStandardMaterial({
    color: 0x22110a,
    roughness: 0.9,
  });
  const wickMesh = new THREE.Mesh(wickGeo, wickMat);
  diyaGroup.add(wickMesh);

  // 3. Flame Group (Wick tip tip at approx x=0.08, y=0.36, z=0.12)
  const flameGroup = new THREE.Group();
  flameGroup.position.set(0.08, 0.37, 0.12);

  // Inner bright yellow-white teardrop flame core
  const innerFlameGeo = new THREE.ConeGeometry(0.045, 0.18, 16);
  innerFlameGeo.translate(0, 0.09, 0); // pivot at base
  const innerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xfff9d6,
  });
  const innerFlame = new THREE.Mesh(innerFlameGeo, innerFlameMat);
  flameGroup.add(innerFlame);

  // Outer warm orange-red flame glow shell
  const outerFlameGeo = new THREE.ConeGeometry(0.08, 0.25, 16);
  outerFlameGeo.translate(0, 0.11, 0);
  const outerFlameMat = new THREE.MeshBasicMaterial({
    color: 0xff6a00,
    transparent: true,
    opacity: 0.75,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const outerFlame = new THREE.Mesh(outerFlameGeo, outerFlameMat);
  flameGroup.add(outerFlame);

  // Soft spherical bloom glow halo surrounding the flame (subtle warmth without harsh glare)
  const glowGeo = new THREE.SphereGeometry(0.12, 16, 16);
  const glowMat = new THREE.MeshBasicMaterial({
    color: 0xff8811,
    transparent: true,
    opacity: 0.15,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const glowMesh = new THREE.Mesh(glowGeo, glowMat);
  glowMesh.position.y = 0.10;
  flameGroup.add(glowMesh);

  diyaGroup.add(flameGroup);

  // 4. Dynamic warm point light from flame illuminating hand, chalni, and surroundings
  // Scaled down intensity so it doesn't cause excessive glare
  const flameLight = new THREE.PointLight(0xff9838, 0.6, 2.5, 2.0);
  flameLight.position.set(0.08, 0.35, 0.12);
  diyaGroup.add(flameLight);

  // 5. Update loop for realistic organic flicker
  function update(time) {
    // Multi-frequency noise for natural flame shimmer & dance
    const flicker1 = Math.sin(time * 16.0) * 0.08;
    const flicker2 = Math.cos(time * 27.5) * 0.05;
    const flicker3 = Math.sin(time * 43.1) * 0.03;
    const totalFlicker = flicker1 + flicker2 + flicker3;

    // Flutter flame height and width
    innerFlame.scale.set(
      1.0 + totalFlicker * 0.6,
      1.0 + totalFlicker * 1.8,
      1.0 + totalFlicker * 0.6
    );
    outerFlame.scale.set(
      1.0 + totalFlicker * 0.8,
      1.0 + totalFlicker * 1.5,
      1.0 + totalFlicker * 0.8
    );

    // Subtle gentle flame tilt (as if moved by soft evening terrace breeze)
    const swayX = Math.sin(time * 4.2) * 0.08 + Math.cos(time * 11.3) * 0.04;
    const swayZ = Math.cos(time * 3.8) * 0.08 + Math.sin(time * 9.7) * 0.04;
    flameGroup.rotation.x = swayX;
    flameGroup.rotation.z = swayZ;

    // Modulate light intensity and color temperature
    flameLight.intensity = 0.6 + totalFlicker * 0.3;
    glowMat.opacity = THREE.MathUtils.clamp(0.12 + totalFlicker * 0.1, 0.05, 0.22);
  }

  return {
    group: diyaGroup,
    flameLight,
    diyaMat,
    beadMat,
    innerFlameMat,
    outerFlameMat,
    glowMat,
    update,
  };
}
