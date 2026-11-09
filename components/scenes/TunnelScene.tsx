"use client";

import { useEffect, useRef } from "react";
import { useGSAP } from "@gsap/react";
import { HubLogo } from "@/components/landing/HubLogo";
import { BrandMark } from "./BrandMark";
import { GhostButton } from "@/components/landing/GhostButton";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import {
  NODE_COUNTERS,
  NODE_MAP,
  SCENE_LABELS,
} from "@/lib/scenes";
import type { S05 } from "@/content/schema";
import { Scene, useSceneRuntime } from "./Scene";
import { useSceneManager } from "./SceneManager";

const CENTER = 500;
const RING_RADIUS = 330;
const RING_COUNT = 14;

const RING_POINTS = Array.from({ length: 6 }, (_, index) => {
  const angle = ((-90 + 60 * index) * Math.PI) / 180;
  return `${(CENTER + RING_RADIUS * Math.cos(angle)).toFixed(2)},${(CENTER + RING_RADIUS * Math.sin(angle)).toFixed(2)}`;
}).join(" ");

function smoothstep(min: number, max: number, value: number) {
  const x = Math.min(1, Math.max(0, (value - min) / (max - min)));
  return x * x * (3 - 2 * x);
}

export function TunnelScene({ content }: { content: S05 }) {
  return (
    <Scene id="s05">
      <TunnelContent content={content} />
    </Scene>
  );
}

function TunnelContent({ content }: { content: S05 }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const tunnelRef = useRef<HTMLDivElement>(null);
  const tunnelPartRef = useRef<HTMLDivElement>(null);
  const manifestoRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderRef = useRef<((progress: number) => void) | null>(null);
  const fieldRef = useRef<{
    set: (progress: number) => void;
    draw: (progress: number) => void;
  } | null>(null);
  const { active, enterCount, visualCount, scroller } = useSceneRuntime();
  const { go } = useSceneManager();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext("2d", {
      alpha: true,
      desynchronized: true,
    });
    if (!context) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const state = { active, current: 0, target: 0 };
    let width = 0;
    let height = 0;
    let dpr = 1;
    let raf = 0;
    let last = 0;
    let ink = "#f2f1ed";
    let accent = "#dff4ff";

    const readColors = () => {
      const styles = getComputedStyle(canvas);
      ink = styles.getPropertyValue("--ink").trim() || ink;
      accent = styles.getPropertyValue("--accent").trim() || accent;
    };

    const paint = (progress: number) => {
      if (!width || !height) return;
      const count = width < 900 ? 9 : RING_COUNT;
      const cx = width / 2;
      const cy = height / 2;
      const base = Math.max(width, height) * 0.33;
      const now = performance.now() / 1000;

      context.clearRect(0, 0, width, height);
      context.lineJoin = "round";
      context.lineWidth = 1.1;

      // Raios estáticos. Uma única passagem de traço.
      context.globalAlpha = 0.22;
      context.strokeStyle = accent;
      context.beginPath();
      for (let index = 0; index < 6; index += 1) {
        const angle = -Math.PI / 2 + (index * Math.PI) / 3;
        context.moveTo(cx, cy);
        context.lineTo(cx + Math.cos(angle) * base, cy + Math.sin(angle) * base);
      }
      context.stroke();

      // Anéis em perspetiva. O canvas evita 14 atualizações de estilo SVG
      // por frame; o progresso é suavizado no RAF.
      context.strokeStyle = ink;
      for (let index = 0; index < count; index += 1) {
        const depth = (index / count + progress * 1.6) % 1;
        const alpha =
          smoothstep(0, 0.12, depth) * (1 - smoothstep(0.78, 1, depth)) * 0.6;
        if (alpha <= 0.002) continue;
        const radius = base * 0.045 * Math.pow(60, depth);
        context.save();
        context.translate(cx, cy);
        context.rotate(depth * 26);
        context.globalAlpha = alpha;
        context.beginPath();
        for (let point = 0; point < 6; point += 1) {
          const angle = -Math.PI / 2 + (point * Math.PI) / 3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (point === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.stroke();
        context.restore();
      }

      // Anel de sinal accent, curto, a cada 2.4 s.
      const cycle = (now % 2.4) / 2.4;
      const signal = Math.min(1, cycle / 0.58);
      if (signal < 1) {
        const radius = base * (0.55 + 0.63 * signal);
        context.save();
        context.translate(cx, cy);
        context.globalAlpha = (1 - signal) * 0.6;
        context.strokeStyle = accent;
        context.beginPath();
        for (let point = 0; point < 6; point += 1) {
          const angle = -Math.PI / 2 + (point * Math.PI) / 3;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          if (point === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        }
        context.closePath();
        context.stroke();
        context.restore();
      }
      context.globalAlpha = 1;
      context.strokeStyle = ink;
    };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      width = canvas.clientWidth;
      height = canvas.clientHeight;
      if (!width || !height) return;
      const nextWidth = Math.round(width * dpr);
      const nextHeight = Math.round(height * dpr);
      if (canvas.width !== nextWidth || canvas.height !== nextHeight) {
        canvas.width = nextWidth;
        canvas.height = nextHeight;
      }
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      paint(state.current);
    };

    const loop = (now: number) => {
      raf = 0;
      if (!state.active) return;
      if (!last) last = now;
      const dt = Math.min(64, now - last) / 1000;
      last = now;
      const difference = state.target - state.current;
      state.current += difference * (1 - Math.exp(-dt * 18));
      if (Math.abs(difference) < 0.00035) {
        state.current = state.target;
        paint(state.current);
        return;
      }
      paint(state.current);
      raf = window.requestAnimationFrame(loop);
    };

    const set = (progress: number) => {
      state.target = progress;
      if (reduced) {
        state.current = progress;
        paint(progress);
        return;
      }
      if (!state.active) return;
      if (!raf) {
        last = 0;
        raf = window.requestAnimationFrame(loop);
      }
    };

    const draw = (progress: number) => {
      state.target = progress;
      state.current = progress;
      paint(progress);
    };

    fieldRef.current = { set, draw };
    readColors();
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(canvas);

    return () => {
      observer.disconnect();
      if (raf) window.cancelAnimationFrame(raf);
      fieldRef.current = null;
    };
  }, [active]);

  useGSAP(
    () => {
      if (!scroller || !rootRef.current || !tunnelRef.current || !tunnelPartRef.current) {
        return;
      }
      let trigger: ScrollTrigger | null = null;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      const render = (progress: number) => {
        if (progress < 0.94) fieldRef.current?.set(progress);

        const textOpacity =
          smoothstep(0.015, 0.18, progress) *
          (1 - smoothstep(0.55, 0.72, progress));
        if (textRef.current) {
          textRef.current.style.opacity = String(textOpacity);
          textRef.current.style.transform = `translate3d(0, ${(1 - Math.min(1, progress / 0.55)) * 18}px, 0)`;
        }
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = `scaleY(${progress})`;
        }
        if (tunnelRef.current) {
          const hidden = progress >= 0.88;
          tunnelRef.current.style.opacity = hidden ? "0" : "1";
          // Não fixar `visible` inline: isso escapa ao `visibility:hidden` da
          // cena inativa e deixava o túnel por cima das outras secções.
          tunnelRef.current.style.visibility = hidden ? "hidden" : "";
        }
      };

      renderRef.current = render;

      if (reduced) {
        fieldRef.current?.draw(0.32);
        render(0.32);
        if (textRef.current) {
          textRef.current.style.opacity = "1";
          textRef.current.style.transform = "translate3d(0, 0, 0)";
        }
        if (tunnelRef.current) {
          tunnelRef.current.style.opacity = "1";
          tunnelRef.current.style.visibility = "";
        }
        return () => {
          renderRef.current = null;
        };
      }

      render(0);
      trigger = ScrollTrigger.create({
        trigger: tunnelPartRef.current,
        scroller: scroller ?? undefined,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.5,
        onUpdate: (self) => render(self.progress),
      });

      return () => {
        trigger?.kill(true);
        renderRef.current = null;
      };
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useEffect(() => {
    if (!visualCount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    renderRef.current?.(0);
    const intro = gsap.timeline();
    intro
      .from(".s05-tunnel__svg", {
        scale: 0.6,
        opacity: 0,
        duration: 1.2,
        ease: "expo.out",
        transformOrigin: "50% 50%",
      })
      .from(
        ".s05-tunnel__mark",
        { opacity: 0, scale: 0.6, duration: 0.9, ease: "expo.out" },
        0.3,
      );
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      intro.kill();
      window.cancelAnimationFrame(frame);
    };
  }, [visualCount]);

  useGSAP(
    () => {
      if (!scroller || !manifestoRef.current) return;
      const lines = gsap.utils.toArray<HTMLElement>(".s05-manifesto__line");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) {
        lines.forEach((line) => {
          const fill = line.querySelector<HTMLElement>(".s05-manifesto__fill");
          if (fill) fill.style.clipPath = "inset(0 0 0 0)";
        });
        return;
      }
      const trigger = ScrollTrigger.create({
        trigger: manifestoRef.current,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          lines.forEach((line, index) => {
            const direction = index % 2 === 0 ? 1 : -1;
            gsap.set(line, {
              x: direction * (p - 0.5) * window.innerWidth * 0.1,
            });
            const fill = line.querySelector<HTMLElement>(".s05-manifesto__fill");
            if (fill) {
              const fillProgress = Math.min(
                1,
                Math.max(0, (p - 0.12) / 0.45),
              );
              fill.style.clipPath = `inset(0 ${(1 - fillProgress) * 100}% 0 0)`;
            }
          });
        },
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useEffect(() => {
    if (!enterCount) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    renderRef.current?.(0);
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => window.cancelAnimationFrame(frame);
  }, [enterCount]);

  const labels = NODE_MAP.map((id) => SCENE_LABELS[id]);

  return (
    <div className="s05-scene" ref={rootRef}>
      <div className="s05-tunnel-part" ref={tunnelPartRef}>
        <div className="s05-tunnel" ref={tunnelRef}>
        <div className="s05-tunnel__svg" aria-hidden="true">
          <canvas ref={canvasRef} className="s05-tunnel__canvas" />
        </div>
        <div className="s05-tunnel__mark" aria-hidden="true">
          <BrandMark className="s05-tunnel__mark-svg" />
        </div>

        <div className="s05-copy" ref={textRef}>
          <p className="scene-counter">{content.eyebrow}</p>
          <h2
            id="s05-title"
            data-scene-title
            tabIndex={-1}
            className="scene-title"
          >
            {content.title}
          </h2>
          <p className="s05-legend">{content.lead}</p>
        </div>

        <span className="s05-tunnel__indicator" aria-hidden="true">
          <span ref={indicatorRef} className="s05-tunnel__indicator-fill" />
        </span>
      </div>
      </div>

      <section className="s05-manifesto" ref={manifestoRef}>
        <div className="s05-manifesto__stage">
          {content.manifesto.map((line, index) => (
            <p className="s05-manifesto__line" key={`${line}-${index}`}>
              <span className="s05-manifesto__base" aria-hidden="true">
                {line}
              </span>
              <span className="s05-manifesto__fill" aria-hidden="true">
                {line}
              </span>
            </p>
          ))}
        </div>
      </section>

      <div className="s05-map part">
        <div className="s05-map__inner">
          <p className="scene-counter">05 / 05</p>
          <div className="s05-map__logo">
            <HubLogo
              active={active}
              mode="map"
              interactive
              variant="map"
              labels={labels}
              numerals={NODE_COUNTERS}
              activeNode={4}
              onNodeActivate={(index, origin) => {
                const id = NODE_MAP[index];
                go(id, { origin, source: "node" });
              }}
            />
          </div>
          <svg
            className="s05-map__rings"
            viewBox="0 0 1000 1000"
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <polygon points={RING_POINTS} transform="translate(500 500) scale(1.45) translate(-500 -500)" />
            <polygon points={RING_POINTS} transform="translate(500 500) scale(2) translate(-500 -500)" />
            <polygon points={RING_POINTS} transform="translate(500 500) scale(2.7) translate(-500 -500)" />
          </svg>
          <div className="s05-map__actions">
            <MapMagnetic
              label={content.cta.label}
              onClick={() =>
                go("footer", {
                  origin: {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                  },
                  source: "nav",
                })
              }
            />
            <GhostButton
              label={content.cta2.label}
              onClick={() =>
                go("s01", {
                  origin: {
                    x: window.innerWidth / 2,
                    y: window.innerHeight / 2,
                  },
                  source: "nav",
                })
              }
            />
          </div>
        </div>
      </div>
    </div>
  );
}


function MapMagnetic({
  label,
  onClick,
}: {
  label: string;
  onClick: () => void;
}) {
  const ref = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }
    const moveX = gsap.quickTo(root, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(root, "y", { duration: 0.5, ease: "power3.out" });
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      const x = Math.max(
        -16,
        Math.min(16, (event.clientX - (rect.left + rect.width / 2)) * 0.18),
      );
      const y = Math.max(
        -16,
        Math.min(16, (event.clientY - (rect.top + rect.height / 2)) * 0.18),
      );
      moveX(x);
      moveY(y);
    };
    const onLeave = () => {
      gsap.to(root, { x: 0, y: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
    };
    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
      gsap.killTweensOf(root);
    };
  }, []);

  return (
    <button ref={ref} type="button" className="s05-map__primary" onClick={onClick}>
      {label}
      <span aria-hidden="true">↗</span>
    </button>
  );
}
