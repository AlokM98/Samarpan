// Small shared math helpers - keeps the animation code DRY.
export const clamp = (v, min = 0, max = 1) => Math.min(max, Math.max(min, v));

export const lerp = (a, b, t) => a + (b - a) * t;

// Remaps t from [edge0, edge1] into 0..1 and smooths it (classic smoothstep).
export function smoothstep(edge0, edge1, t) {
  const x = clamp((t - edge0) / (edge1 - edge0), 0, 1);
  return x * x * (3 - 2 * x);
}
