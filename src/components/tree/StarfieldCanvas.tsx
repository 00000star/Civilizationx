import { useEffect, useRef } from "react";
import { useCodexMode } from "../../context/useCodexMode";

type Star = {
  x: number;
  y: number;
  r: number;
  base: number;
  tw: number;
  layer: number;
};

function makeStars(w: number, h: number, count: number): Star[] {
  const stars: Star[] = [];
  for (let i = 0; i < count; i++) {
    stars.push({
      x: Math.random() * w,
      y: Math.random() * h,
      r: Math.random() * 1.15 + 0.25,
      base: 0.15 + Math.random() * 0.55,
      tw: Math.random() * Math.PI * 2,
      layer: Math.random() < 0.62 ? 0 : 1,
    });
  }
  return stars;
}

/**
 * Subtle parallax starfield behind the tech tree — inspired by classic
 * “deep field” UIs (slow drift, low contrast) while staying readable over nodes.
 */
export function StarfieldCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const starsRef = useRef<Star[]>([]);
  const { isSpace } = useCodexMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;

    const draw = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const acc = isSpace ? { r: 0, g: 212, b: 255 } : { r: 201, g: 168, b: 76 };

      ctx.clearRect(0, 0, w, h);

      for (const s of starsRef.current) {
        ctx.beginPath();
        ctx.fillStyle = `rgba(${acc.r},${acc.g},${acc.b},${s.base})`;
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const resize = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
        const { clientWidth, clientHeight } = canvas;
        canvas.width = Math.floor(clientWidth * dpr);
        canvas.height = Math.floor(clientHeight * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        const density = Math.min(120, Math.floor((clientWidth * clientHeight) / 14000));
        starsRef.current = makeStars(clientWidth, clientHeight, Math.max(48, density));
        draw();
      });
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [isSpace]);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none absolute inset-0 z-0 h-full w-full print:hidden"
      aria-hidden
      role="presentation"
    />
  );
}
