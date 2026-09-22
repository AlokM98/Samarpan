import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { createMoon } from "./scene/moon.js";
import { createFancyChalni } from "./scene/fancyChalni.js";
import { loadScannedBridalHand } from "./scene/scannedHand.js";
import { createDiya } from "./scene/diya.js";
import { createStarfield } from "./scene/stars.js";
import { lerp, smoothstep } from "./utils/math.js";

const isCompactViewport = () => window.innerWidth < 700;

export function createAnimation(canvas) {
  let progress = 0;
  let destroyed = false;
  let animationFrame = 0;

// --- Core scene setup ---------------------------------------------------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070f, 0.006);

const camera = new THREE.PerspectiveCamera(
  window.innerWidth < 700 ? 56 : 48,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.set(0, 0.2, 4.5);
const viewport = { compact: window.innerWidth < 700 };

const renderer = new THREE.WebGLRenderer({
  canvas,
  // MSAA plus bloom is unnecessarily expensive on small touch devices.
  // The lower pixel count is a much better trade-off than dropped frames.
  antialias: !isCompactViewport(),
  alpha: false,
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactViewport() ? 1 : 1.75));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;

// Ambient moonlight fill
scene.add(new THREE.AmbientLight(0x2a3552, 0.8));

// Key rim light from the side/front to illuminate the mehndi and red bangles
const rimLight = new THREE.DirectionalLight(0xffecd0, 1.2);
rimLight.position.set(2.5, 2, 3);
scene.add(rimLight);

// Soft warm fill light positioned farther away to prevent blown-out hotspots on forearm
const softWarmLight = new THREE.PointLight(0xffb890, 0.45, 12, 1.8);
softWarmLight.position.set(2.2, -0.8, 3.2);
scene.add(softWarmLight);

// --- Scene contents -------------------------------------------------------
// 1. Distant moon far in the night sky
const moon = createMoon();
scene.add(moon.group);

// 2. Foreground rig: girl's right hand holding the fancy decorated chalni
const foregroundRig = new THREE.Group();

// Fancy chalni with pearls, twisted pink rope, fine wire mesh, pink fabric flower, pearl tassel
const chalni = createFancyChalni({ radius: 1.5 });
foregroundRig.add(chalni.group);

// Traditional earthen Karwa Chauth Diya resting gracefully on bottom center of rim
const diya = createDiya();
diya.group.position.set(0, -1.41, 0.16);
diya.group.scale.set(0.48, 0.48, 0.48);
foregroundRig.add(diya.group);

// 3D Scanned Photorealistic Female Hand (from Sketchfab USDZ package)
let skinMaterial = null;
let nailMaterial = null;

// The hand is the heaviest asset group (~3 MB). Let the moon, chalni, and UI
// render first so slow connections get a usable first frame immediately.
function loadHandAfterFirstPaint() {
  const connection = navigator.connection;
  const delay = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType)
    ? 3500
    : 1200;

  const start = () => {
    loadScannedBridalHand()
      .then(({ handGroup, skinMaterial: sMat, nailMaterial: nMat }) => {
        skinMaterial = sMat;
        nailMaterial = nMat;
        // Center palm right on chalni rim, with chalni rim nesting between thumb (front) and fingers (back)
        handGroup.position.set(1.9, -0.8, -0.06);
        handGroup.rotation.set(0, 0, -0.04);
        foregroundRig.add(handGroup);
      })
      .catch((error) => console.warn("Bridal hand could not be loaded:", error));
  };

  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(start, { timeout: delay });
  } else {
    window.setTimeout(start, delay);
  }
}

loadHandAfterFirstPaint();

// Position entire foreground rig directly in front of camera
// Centered over distant moon so user looks THROUGH the fine mesh to see moon!
// Lowered slightly (y = -0.2) so the bottom flower and pearl tassel are in view!
foregroundRig.position.set(0, -0.18, 1.35);
scene.add(foregroundRig);

function updateViewportProfile() {
  viewport.compact = window.innerWidth < 700;
  camera.fov = viewport.compact ? 56 : 48;
  camera.updateProjectionMatrix();
  // Portrait screens have much less horizontal room. Scale the complete
  // foreground composition so chalni, diya, and hand keep their relationship.
  foregroundRig.scale.setScalar(viewport.compact ? 0.62 : 1);


}
updateViewportProfile();

// 3. Twinkling starfield
const starfield = createStarfield();
scene.add(starfield.points);

// --- Postprocessing (bloom for moonlight and pearls) ---------------------
const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloomPass = new UnrealBloomPass(
  new THREE.Vector2(window.innerWidth, window.innerHeight),
  1.0,  // strength
  0.5,  // radius
  0.42  // threshold - keep crater texture visible while halo glows
);
composer.addPass(bloomPass);
const usePostProcessing = !isCompactViewport();

// --- Scroll-driven animation timeline --------------------------------------

const clock = new THREE.Clock();

// Gentle mouse parallax
const pointer = { x: 0, y: 0 };
function onPointerMove(event) {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
}

window.addEventListener("pointermove", onPointerMove);

function animateForeground(progress) {
  // Hand lowers and swings chalni down and away to the right,
  // revealing the magnificent distant full moon
  const moveProg = smoothstep(0.0, 0.85, progress);

  foregroundRig.position.x = lerp(0, 5.2, moveProg);
  foregroundRig.position.y = lerp(0.1, viewport.compact ? -3.7 : -4.2, moveProg);
  foregroundRig.position.z = lerp(1.2, viewport.compact ? -0.25 : -0.6, moveProg);

  // Natural hand wrist rotation as she lowers the chalni
  foregroundRig.rotation.z = lerp(0, -0.6, moveProg);
  foregroundRig.rotation.y = lerp(0, 0.45, moveProg);
  foregroundRig.rotation.x = lerp(0, 0.25, moveProg);

  // Smooth fade-out in final stretch so background is 100% unobstructed
  const fade = 1 - smoothstep(0.65, 0.98, progress);
  chalni.discMaterial.opacity = fade;
  chalni.ropeMaterial.opacity = fade;
  chalni.ropeMaterial.transparent = true;
  chalni.pearlMaterial.opacity = fade;
  chalni.pearlMaterial.transparent = true;
  chalni.petalMat.opacity = fade;
  chalni.petalMat.transparent = true;
  chalni.emblemMaterial.opacity = fade;
  if (skinMaterial) {
    skinMaterial.opacity = fade;
    skinMaterial.transparent = true;
  }
  if (nailMaterial) {
    nailMaterial.opacity = fade;
    nailMaterial.transparent = true;
  }
  // Diya fading with scroll
  diya.diyaMat.opacity = fade;
  diya.diyaMat.transparent = true;
  diya.beadMat.opacity = fade;
  diya.beadMat.transparent = true;
  diya.innerFlameMat.opacity = fade;
  diya.innerFlameMat.transparent = true;
  diya.outerFlameMat.opacity = fade * 0.75;
  diya.glowMat.opacity = fade * 0.15;
  diya.flameLight.intensity = lerp(0, 0.8, fade);

  foregroundRig.visible = fade > 0.01;
}

function animateMoon(progress) {
  // As chalni lowers, camera gently pushes toward the moon & bloom deepens
  const reveal = smoothstep(0.3, 1.0, progress);
  camera.position.z = lerp(viewport.compact ? 5.4 : 4.5, viewport.compact ? 3.5 : 2.8, reveal);
  camera.position.y = lerp(0.2, 0.5, reveal);
  bloomPass.strength = lerp(0.9, 1.6, reveal);
  moon.light.intensity = lerp(2.2, 3.4, reveal);
  moon.mesh.rotation.y += 0.0004;
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  updateViewportProfile();
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, isCompactViewport() ? 1 : 1.75));
  composer.setSize(width, height);
  bloomPass.setSize(width, height);
}
window.addEventListener("resize", onResize);

function tick() {
  const elapsed = clock.getElapsedTime();

  starfield.update(elapsed);
  diya.update(elapsed);
  animateForeground(progress);
  animateMoon(progress);

  // Subtle natural camera sway / parallax
  camera.position.x += (pointer.x * 0.25 - camera.position.x * 0.02) * 0.05;
  camera.lookAt(0, 0.3, -30);

  // Avoid the extra render pass used by bloom on mobile. The scene remains
  // fully animated, but scrolling no longer competes with post-processing.
  if (usePostProcessing) composer.render();
  else renderer.render(scene, camera);
  if (!destroyed) animationFrame = requestAnimationFrame(tick);
}

tick();

  return {
    setProgress(value) {
      if (typeof value === "number" && Number.isFinite(value)) {
        progress = Math.min(1, Math.max(0, value));
      }
    },
    destroy() {
      destroyed = true;
      cancelAnimationFrame(animationFrame);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", onPointerMove);
      renderer.dispose();
      composer.dispose();
    },
  };
}
