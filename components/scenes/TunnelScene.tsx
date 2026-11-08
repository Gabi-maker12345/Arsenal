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

const RAYS = Array.from({ length: 6 }, (_, index) => {
  const angle = ((-90 + 60 * index) * Math.PI) / 180;
  return {
    x: (CENTER + RING_RADIUS * Math.cos(angle)).toFixed(2),
    y: (CENTER + RING_RADIUS * Math.sin(angle)).toFixed(2),
  };
});

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
  const manifestoRef = useRef<HTMLElement>(null);
  const textRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const renderRef = useRef<((progress: number) => void) | null>(null);
  const { enterCount, visualCount, scroller } = useSceneRuntime();
  const { go } = useSceneManager();

  useGSAP(
    () => {
      if (!scroller || !rootRef.current || !tunnelRef.current) return;
      let trigger: ScrollTrigger | null = null;
      const rings = gsap.utils.toArray<SVGPolygonElement>(".s05-ring");
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const N = window.innerWidth < 900 ? 9 : RING_COUNT;

      const render = (progress: number) => {
        rings.forEach((ring, index) => {
          if (index >= N) {
            gsap.set(ring, { opacity: 0 });
            return;
          }
          const d = (index / N + progress * 1.6) % 1;
          const scale = 0.045 * Math.pow(60, d);
          const opacity =
            smoothstep(0, 0.12, d) * (1 - smoothstep(0.78, 1, d)) * 0.6;
          gsap.set(ring, {
            scale,
            rotation: d * 26,
            opacity,
            svgOrigin: "500 500",
          });
        });

        const textOpacity =
          progress < 0.08
            ? 0
            : progress <= 0.55
              ? 1
              : Math.max(0, 1 - (progress - 0.55) / 0.15);
        if (textRef.current) {
          gsap.set(textRef.current, {
            opacity: textOpacity,
            y: (1 - Math.min(1, progress / 0.55)) * 18,
          });
        }
        if (indicatorRef.current) {
          indicatorRef.current.style.transform = `scaleY(${progress})`;
        }
        if (tunnelRef.current) {
          gsap.set(tunnelRef.current, {
            autoAlpha: progress >= 0.88 ? 0 : 1,
          });
        }
      };

      renderRef.current = render;

      if (reduced) {
        render(0.32);
        if (textRef.current) gsap.set(textRef.current, { autoAlpha: 1, y: 0 });
        if (tunnelRef.current) gsap.set(tunnelRef.current, { autoAlpha: 1 });
        return () => {
          renderRef.current = null;
        };
      }

      render(0);
      trigger = ScrollTrigger.create({
        trigger: tunnelRef.current,
        scroller: scroller ?? undefined,
        start: "top top",
        end: "+=350%",
        pin: true,
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
    const signal = rootRef.current?.querySelector<SVGPolygonElement>(".s05-signal");
    const signalTween = signal
      ? gsap.fromTo(
          signal,
          { scale: 0.55, opacity: 0.7, transformOrigin: "50% 50%" },
          {
            scale: 1.18,
            opacity: 0,
            duration: 1.35,
            ease: "power2.out",
            repeat: -1,
            repeatDelay: 1.05,
          },
        )
      : null;
    const frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      intro.kill();
      signalTween?.kill();
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
      <div className="s05-tunnel" ref={tunnelRef}>
        <svg
          className="s05-tunnel__svg"
          viewBox="0 0 1000 1000"
          preserveAspectRatio="xMidYMid slice"
          aria-hidden="true"
        >
          {RAYS.map((ray, index) => (
            <line
              key={`ray-${index}`}
              className="s05-tunnel__ray"
              x1={CENTER}
              y1={CENTER}
              x2={ray.x}
              y2={ray.y}
            />
          ))}
          {Array.from({ length: RING_COUNT }, (_, index) => (
            <polygon
              key={`ring-${index}`}
              className="s05-ring"
              points={RING_POINTS}
            />
          ))}
          <polygon className="s05-signal" points={RING_POINTS} />
        </svg>
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
