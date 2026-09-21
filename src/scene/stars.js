import * as THREE from "three";

const VERTEX_SHADER = `
  attribute float aSize;
  attribute float aPhase;
  uniform float uTime;
  varying float vTwinkle;

  void main() {
    // Each star twinkles on its own phase offset so they don't blink in sync.
    vTwinkle = 0.55 + 0.45 * sin(uTime * 1.5 + aPhase);
    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = aSize * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

const FRAGMENT_SHADER = `
  varying float vTwinkle;

  void main() {
    // Soft round point sprite via distance-from-center falloff.
    float d = length(gl_PointCoord - vec2(0.5));
    float alpha = smoothstep(0.5, 0.0, d) * vTwinkle;
    gl_FragColor = vec4(1.0, 0.97, 0.9, alpha);
  }
`;

// Scatters `count` twinkling points across a large sphere shell around the scene.
export function createStarfield({ count = 2200, radius = 140 } = {}) {
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    // Uniform-ish distribution on a sphere shell (biased slightly outward).
    const r = radius * (0.6 + Math.random() * 0.4);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.sin(phi) * Math.sin(theta)) * 0.6 + 2; // keep mostly above horizon
    positions[i * 3 + 2] = r * Math.cos(phi);

    sizes[i] = Math.random() * 2 + 0.5;
    phases[i] = Math.random() * Math.PI * 2;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));

  const material = new THREE.ShaderMaterial({
    uniforms: { uTime: { value: 0 } },
    vertexShader: VERTEX_SHADER,
    fragmentShader: FRAGMENT_SHADER,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);

  return {
    points,
    // Call each frame with elapsed clock time to drive the twinkle.
    update(time) {
      material.uniforms.uTime.value = time;
    },
  };
}
