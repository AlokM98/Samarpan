import { useEffect, useRef, useState } from "react";

type AnimationController = {
  setProgress: (value: number) => void;
  destroy: () => void;
};

function getProgress(element: HTMLElement) {
  const bounds = element.getBoundingClientRect();
  return Math.max(0, Math.min(1, -bounds.top / Math.max(1, bounds.height - window.innerHeight)));
}

export function AnimationSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const section = sectionRef.current;
    const canvas = canvasRef.current;
    if (!section || !canvas) return;

    let animation: AnimationController | null = null;
    let disposed = false;
    let frameRequest = 0;

    const sync = () => {
      if (frameRequest) return;
      frameRequest = requestAnimationFrame(() => {
        frameRequest = 0;
        const nextProgress = getProgress(section);
        animation?.setProgress(nextProgress);
        setProgress(nextProgress);
      });
    };

    // Keep Three.js out of the initial page bundle. The website owns when the
    // animation is mounted; the renderer only receives the progress value.
    // @ts-ignore The shared renderer is JavaScript by design.
    import("../../../src/main.js").then(({ createAnimation }) => {
      if (disposed) return;
      animation = createAnimation(canvas);
      sync();
    }).catch((error) => {
      if (!disposed) console.warn("Animation could not be loaded:", error);
    });

    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    sync();

    return () => {
      if (frameRequest) cancelAnimationFrame(frameRequest);
      disposed = true;
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      animation?.destroy();
    };
  }, []);

  const introOpacity = 1 - Math.min(1, progress / 0.2);
  const outroOpacity = Math.max(0, (progress - 0.75) / 0.25);

  return <section className="animation-shell" id="karwa-chronicle" aria-label="A Karwa Chauth story" ref={sectionRef}>
    <canvas ref={canvasRef} id="scene-canvas" aria-hidden="true" />
    <div className="animation-overlay" aria-live="polite">
      <div className="animation-copy" style={{ opacity: introOpacity }}>
        <p className="eyebrow">Karwa Chauth</p>
        <p className="hint">Scroll to let the chalni drift away and reveal the moon ↓</p>
      </div>
      <div className="animation-copy animation-outro" style={{ opacity: outroOpacity }}>
        <p className="eyebrow">Chand Nikal Aaya</p>
        <h1>Happy Karwa Chauth</h1>
        <p className="hint">May your bond shine as bright as the moon tonight</p>
      </div>
    </div>
    <a className="animation-exit" href="#collection">Explore the collection <span aria-hidden="true">↓</span></a>
  </section>;
}
