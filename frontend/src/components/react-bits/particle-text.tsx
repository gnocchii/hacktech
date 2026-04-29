"use client";

import React, { useEffect, useRef, useCallback } from "react";

interface Particle {
  x: number;
  y: number;
  originX: number;
  originY: number;
  vx: number;
  vy: number;
  color: string;
  size: number;
  char?: string;
  /** Per-particle entry delay in ms (used by typed mode). */
  delay?: number;
  /** Render alpha — animates 0→1 in typed mode. */
  alpha?: number;
}

export interface ParticleTextProps {
  text?: string;
  className?: string;
  colors?: string[];
  particleSize?: number;
  particleGap?: number;
  mouseControls?: {
    enabled?: boolean;
    radius?: number;
    strength?: number;
  };
  backgroundColor?: string;
  fontFamily?: string;
  fontSize?: number;
  fontWeight?: string | number;
  friction?: number;
  ease?: number;
  autoFit?: boolean;
  /**
   * If set, particles render as random characters drawn from this string
   * instead of filled squares. Use to make particles read as ASCII.
   */
  asciiChars?: string;
  /** Font for the per-particle ASCII glyphs. Defaults to monospace. */
  asciiFontFamily?: string;
  /** Glyph size in px (CSS pixels). Defaults to 2.8 × particleSize. */
  asciiGlyphSize?: number;
  /**
   * Where particles start before sweeping into place.
   * "random" = scatter (default), "left"/"right"/"top"/"bottom" = sweep in
   * from that edge for a directional entrance.
   */
  entryFrom?: "random" | "left" | "right" | "top" | "bottom";
  /** Hold the entry this many ms after mount. Particles render but don't move. */
  entryDelay?: number;
  /**
   * Typewriter mode — particles materialize letter-by-letter at their target
   * positions instead of sweeping/scattering in. Inferred letter buckets are
   * computed by partitioning particles along the x axis into `text.length`
   * groups, so it works regardless of font.
   */
  typed?: boolean;
  /** Time between letter reveals in typed mode (ms). */
  typedStaggerMs?: number;
  /** Per-letter fade-in duration in typed mode (ms). */
  typedFadeMs?: number;
}

const ParticleText: React.FC<ParticleTextProps> = ({
  text = "brilliant.",
  className = "",
  colors = ["#40ffaa", "#40aaff", "#ff40aa", "#aa40ff"],
  particleSize = 2,
  particleGap = 2,
  mouseControls = {
    enabled: true,
    radius: 150,
    strength: 5,
  },
  backgroundColor = "transparent",
  fontFamily = "sans-serif",
  fontSize = 200,
  fontWeight = "bold",
  friction = 0.75,
  ease = 0.05,
  autoFit = true,
  asciiChars,
  asciiFontFamily = "ui-monospace, 'Geist Mono', 'JetBrains Mono', Menlo, monospace",
  asciiGlyphSize,
  entryFrom = "random",
  entryDelay = 0,
  typed = false,
  typedStaggerMs = 110,
  typedFadeMs = 90,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const mouseRef = useRef({ x: -1000, y: -1000, isActive: false });
  const animationFrameRef = useRef<number>(0);
  const resizeObserverRef = useRef<ResizeObserver | null>(null);
  const dprRef = useRef<number>(1);
  const computedFontSizeRef = useRef<number>(fontSize);

  const calculateFitFontSize = useCallback(
    (
      ctx: CanvasRenderingContext2D,
      content: string,
      canvasWidth: number,
      canvasHeight: number,
    ): number => {
      const dpr = dprRef.current;
      const padding = 40 * dpr;
      const availableWidth = canvasWidth - padding * 2;
      const availableHeight = canvasHeight - padding * 2;

      let minSize = 10 * dpr;
      let maxSize = fontSize * dpr;
      let optimalSize = minSize;

      while (minSize <= maxSize) {
        const testSize = Math.floor((minSize + maxSize) / 2);
        ctx.font = `${fontWeight} ${testSize}px ${fontFamily}`;

        const textMetrics = ctx.measureText(content);
        const textWidth = textMetrics.width;
        const textHeight = testSize;

        if (textWidth <= availableWidth && textHeight <= availableHeight) {
          optimalSize = testSize;
          minSize = testSize + 1;
        } else {
          maxSize = testSize - 1;
        }
      }

      return optimalSize / dpr;
    },
    [fontSize, fontWeight, fontFamily],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const initParticles = () => {
      const dpr = window.devicePixelRatio || 1;
      dprRef.current = dpr;

      canvas.width = container.clientWidth * dpr;
      canvas.height = container.clientHeight * dpr;

      let effectiveFontSize = fontSize;
      if (autoFit) {
        effectiveFontSize = calculateFitFontSize(
          ctx,
          text,
          canvas.width,
          canvas.height,
        );
      }
      computedFontSizeRef.current = effectiveFontSize;

      const scaledFontSize = effectiveFontSize * dpr;

      const offscreen = document.createElement("canvas");
      offscreen.width = canvas.width;
      offscreen.height = canvas.height;
      const offCtx = offscreen.getContext("2d");
      if (!offCtx) return;

      offCtx.font = `${fontWeight} ${scaledFontSize}px ${fontFamily}`;
      offCtx.textAlign = "center";
      offCtx.textBaseline = "middle";
      offCtx.fillStyle = "#ffffff";
      offCtx.fillText(text, canvas.width / 2, canvas.height / 2);

      const imageData = offCtx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      const newParticles: Particle[] = [];
      const step = Math.max(1, Math.floor((particleSize + particleGap) * dpr));

      for (let y = 0; y < canvas.height; y += step) {
        for (let x = 0; x < canvas.width; x += step) {
          const index = (y * canvas.width + x) * 4;
          if (data[index + 3] > 128) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const char = asciiChars
              ? asciiChars[Math.floor(Math.random() * asciiChars.length)]
              : undefined;
            // Typed mode pins particles to their target and fades them in
            // letter-by-letter; otherwise particles enter from off-screen
            // (sweep) or random positions (scatter). Per-letter delay is
            // assigned in a second pass after collection so we know the x
            // bounds of the rendered text.
            let startX: number;
            let startY: number;
            if (typed) {
              startX = x;
              startY = y;
            } else {
              const overshoot = 1.4;
              const jitter = 0.06;
              switch (entryFrom) {
                case "left":
                  startX = -canvas.width * (overshoot - 1) - canvas.width * Math.random() * 0.4;
                  startY = y + (Math.random() - 0.5) * canvas.height * jitter;
                  break;
                case "right":
                  startX = canvas.width * overshoot + canvas.width * Math.random() * 0.4;
                  startY = y + (Math.random() - 0.5) * canvas.height * jitter;
                  break;
                case "top":
                  startX = x + (Math.random() - 0.5) * canvas.width * jitter;
                  startY = -canvas.height * (overshoot - 1) - canvas.height * Math.random() * 0.4;
                  break;
                case "bottom":
                  startX = x + (Math.random() - 0.5) * canvas.width * jitter;
                  startY = canvas.height * overshoot + canvas.height * Math.random() * 0.4;
                  break;
                default:
                  startX = Math.random() * canvas.width;
                  startY = Math.random() * canvas.height;
              }
            }
            newParticles.push({
              x: startX,
              y: startY,
              originX: x,
              originY: y,
              vx: 0,
              vy: 0,
              color: color,
              size: particleSize * dpr,
              char,
              alpha: typed ? 0 : 1,
              delay: 0,
            });
          }
        }
      }
      // Typed mode: bucket particles by originX into N letter columns and
      // assign each particle a delay based on its bucket. This works even
      // for proportional fonts where letter widths differ — we just split
      // the rendered glyph row into equal x bins.
      if (typed && newParticles.length > 0) {
        const letterCount = Math.max(1, text.length);
        let minX = Infinity;
        let maxX = -Infinity;
        for (const p of newParticles) {
          if (p.originX < minX) minX = p.originX;
          if (p.originX > maxX) maxX = p.originX;
        }
        const span = Math.max(1, maxX - minX);
        for (const p of newParticles) {
          const ratio = (p.originX - minX) / span;
          const letterIdx = Math.min(letterCount - 1, Math.floor(ratio * letterCount));
          p.delay = letterIdx * typedStaggerMs;
        }
      }

      particlesRef.current = newParticles;
    };

    initParticles();

    const startAt = performance.now() + entryDelay;
    const animate = () => {
      const now = performance.now();
      const swept = now >= startAt;
      const elapsed = now - startAt;
      const dpr = dprRef.current;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (backgroundColor !== "transparent") {
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
      }

      const particles = particlesRef.current;
      const mouse = mouseRef.current;
      const { radius = 150, strength = 5 } = mouseControls;
      const scaledRadius = radius * dpr;

      // Set up text rendering once per frame when in ASCII mode.
      const useAscii = !!asciiChars;
      if (useAscii) {
        const glyphPx = (asciiGlyphSize ?? particleSize * 2.8) * dpr;
        ctx.font = `${glyphPx}px ${asciiFontFamily}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        const dx = p.originX - p.x;
        const dy = p.originY - p.y;

        let forceX = 0;
        let forceY = 0;

        if (mouse.isActive) {
          const mdx = mouse.x * dpr - p.x;
          const mdy = mouse.y * dpr - p.y;
          const mDist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mDist < scaledRadius) {
            const force = (scaledRadius - mDist) / scaledRadius;
            const angle = Math.atan2(mdy, mdx);
            forceX = -Math.cos(angle) * force * strength * 5;
            forceY = -Math.sin(angle) * force * strength * 5;
          }
        }

        if (typed) {
          // Pinned at origin; fade in once this particle's delay elapses.
          const since = elapsed - (p.delay ?? 0);
          if (since <= 0) {
            // Not yet visible — skip draw entirely.
            continue;
          }
          p.alpha = Math.min(1, since / Math.max(1, typedFadeMs));
          // Allow easing only as a recovery from mouse displacement.
          p.vx += dx * ease + forceX;
          p.vy += dy * ease + forceY;
          p.vx *= friction;
          p.vy *= friction;
          p.x += p.vx;
          p.y += p.vy;
        } else if (swept) {
          p.vx += dx * ease + forceX;
          p.vy += dy * ease + forceY;

          p.vx *= friction;
          p.vy *= friction;

          p.x += p.vx;
          p.y += p.vy;
        }

        const prevAlpha = ctx.globalAlpha;
        if (typed) ctx.globalAlpha = p.alpha ?? 1;
        ctx.fillStyle = p.color;
        if (useAscii && p.char) {
          ctx.fillText(p.char, p.x, p.y);
        } else {
          ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
        }
        if (typed) ctx.globalAlpha = prevAlpha;
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    resizeObserverRef.current = new ResizeObserver(() => {
      initParticles();
    });
    resizeObserverRef.current.observe(container);

    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.clientX - rect.left;
      mouseRef.current.y = e.clientY - rect.top;
      mouseRef.current.isActive = true;
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      mouseRef.current.x = e.touches[0].clientX - rect.left;
      mouseRef.current.y = e.touches[0].clientY - rect.top;
      mouseRef.current.isActive = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.isActive = false;
    };

    const handleTouchEnd = () => {
      mouseRef.current.isActive = false;
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);
    container.addEventListener("touchmove", handleTouchMove, {
      passive: false,
    });
    container.addEventListener("touchend", handleTouchEnd);

    return () => {
      if (animationFrameRef.current)
        cancelAnimationFrame(animationFrameRef.current);
      if (resizeObserverRef.current) resizeObserverRef.current.disconnect();
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      container.removeEventListener("touchmove", handleTouchMove);
      container.removeEventListener("touchend", handleTouchEnd);
    };
  }, [
    text,
    colors,
    particleSize,
    particleGap,
    mouseControls,
    backgroundColor,
    fontFamily,
    fontSize,
    fontWeight,
    friction,
    ease,
    autoFit,
    asciiChars,
    asciiFontFamily,
    asciiGlyphSize,
    entryFrom,
    entryDelay,
    typed,
    typedStaggerMs,
    typedFadeMs,
    calculateFitFontSize,
  ]);

  return (
    <div
      ref={containerRef}
      className={`w-full h-full min-h-[300px] ${className}`}
    >
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
};

ParticleText.displayName = "ParticleText";

export default ParticleText;
