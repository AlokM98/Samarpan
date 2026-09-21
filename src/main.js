import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";

import { createMoon } from "./scene/moon.js?v=2";
import { createFancyChalni } from "./scene/fancyChalni.js?v=2";
import { loadScannedBridalHand } from "./scene/scannedHand.js";
import { createDiya } from "./scene/diya.js?v=2";
import { createStarfield } from "./scene/stars.js";
import { ScrollController } from "./utils/scroll.js";
import { lerp, smoothstep } from "./utils/math.js";
import { createUiController } from "./ui.js";

const canvas = document.getElementById("scene-canvas");

// --- Core scene setup ---------------------------------------------------
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x05070f, 0.006);

const camera = new THREE.PerspectiveCamera(
  48,
  window.innerWidth / window.innerHeight,
  0.1,
  300
);
camera.position.set(0, 0.2, 4.5);

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

// --- Scroll-driven animation timeline --------------------------------------
const scrollController = new ScrollController();
const uiController = createUiController();

const clock = new THREE.Clock();

// Gentle mouse parallax
const pointer = { x: 0, y: 0 };
window.addEventListener("pointermove", (event) => {
  pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
  pointer.y = (event.clientY / window.innerHeight) * 2 - 1;
});

function animateForeground(progress) {
  // Hand lowers and swings chalni down and away to the right,
  // revealing the magnificent distant full moon
  const moveProg = smoothstep(0.0, 0.85, progress);

  foregroundRig.position.x = lerp(0, 5.2, moveProg);
  foregroundRig.position.y = lerp(0.1, -4.2, moveProg);
  foregroundRig.position.z = lerp(1.2, -0.6, moveProg);

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
  camera.position.z = lerp(4.5, 2.8, reveal);
  camera.position.y = lerp(0.2, 0.5, reveal);
  bloomPass.strength = lerp(0.9, 1.6, reveal);
  moon.light.intensity = lerp(2.2, 3.4, reveal);
  moon.mesh.rotation.y += 0.0004;
}

function onResize() {
  const width = window.innerWidth;
  const height = window.innerHeight;
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
  renderer.setSize(width, height);
  composer.setSize(width, height);
  bloomPass.setSize(width, height);
}
window.addEventListener("resize", onResize);

function tick() {
  const elapsed = clock.getElapsedTime();
  const progress = scrollController.update();

  starfield.update(elapsed);
  diya.update(elapsed);
  animateForeground(progress);
  animateMoon(progress);
  uiController.update(progress);

  // Subtle natural camera sway / parallax
  camera.position.x += (pointer.x * 0.25 - camera.position.x * 0.02) * 0.05;
  camera.lookAt(0, 0.3, -30);

  composer.render();
  requestAnimationFrame(tick);
}

tick();
