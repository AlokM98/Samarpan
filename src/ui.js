import { smoothstep } from "./utils/math.js";

// Cross-fades the intro/outro text blocks as the chalni drifts away.
export function createUiController() {
  const intro = document.getElementById("intro-text");
  const outro = document.getElementById("outro-text");

  return {
    update(progress) {
      const introOpacity = 1 - smoothstep(0.0, 0.2, progress);
      const outroOpacity = smoothstep(0.75, 1.0, progress);
      intro.style.opacity = introOpacity.toFixed(3);
      outro.style.opacity = outroOpacity.toFixed(3);
    },
  };
}
