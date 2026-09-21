// Maps window scroll position to a smoothed 0..1 progress value.
// Kept dependency-free (no GSAP) - just a simple lerp-towards-target each frame.
export class ScrollController {
  constructor({ smoothing = 0.08 } = {}) {
    this.rawProgress = 0;
    this.progress = 0;
    this.smoothing = smoothing;

    window.addEventListener("scroll", () => this._onScroll(), { passive: true });
    this._onScroll();
  }

  _onScroll() {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    this.rawProgress = scrollable > 0 ? window.scrollY / scrollable : 0;
    this.rawProgress = Math.min(1, Math.max(0, this.rawProgress));
  }

  // Call once per animation frame; returns the smoothed progress.
  update() {
    this.progress += (this.rawProgress - this.progress) * this.smoothing;
    return this.progress;
  }
}
