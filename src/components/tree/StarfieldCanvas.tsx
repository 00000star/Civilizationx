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
  const mouseRef = useRef({ x: 0, y: 0 });
  const { isSpace } = useCodexMode();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const reducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let t0 = performance.now();

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { clientWidth, clientHeight } = canvas;
      canvas.width = Math.floor(clientWidth * dpr);
      canvas.height = Math.floor(clientHeight * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const density = Math.min(200, Math.floor((clientWidth * clientHeight) / 9000));
      starsRef.current = makeStars(clientWidth, clientHeight, Math.max(70, density));
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const onMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      if (rect.width < 1 || rect.height < 1) return;
      mouseRef.current = {
        x: (e.clientX - rect.left) / rect.width - 0.5,
        y: (e.clientY - rect.top) / rect.height - 0.5,
      };
    };

    window.addEventListener("mousemove", onMove);

    const gold = { r: 201, g: 168, b: 76 };
    const cyan = { r: 0, g: 212, b: 255 };
    const accent = () => (isSpace ? cyan : gold);

    const draw = (now: number) => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      const t = (now - t0) / 1000;
      const acc = accent();
      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      ctx.clearRect(0, 0, w, h);

      for (const s of starsRef.current) {
        const parallax = s.layer === 0 ? 10 : 22;
        const dx = mx * parallax;
        const dy = my * parallax;
        let x = s.x + dx;
        let y = s.y + dy;
        x = ((x % w) + w) % w;
        y = ((y % h) + h) % h;

        const twinkle = reducedMotion
          ? 1
          : 0.88 + 0.12 * Math.sin(t * (s.layer ? 0.55 : 0.9) + s.tw);
        const a = s.base * twinkle;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${acc.r},${acc.g},${acc.b},${a})`;
        ctx.arc(x, y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reducedMotion) {
        raf = requestAnimationFrame(draw);
      }
    };

    if (reducedMotion) {
      raf = requestAnimationFrame((now) => {
        t0 = now;
        draw(now);
      });
    } else {
      raf = requestAnimationFrame(draw);
    }

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("mousemove", onMove);
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
