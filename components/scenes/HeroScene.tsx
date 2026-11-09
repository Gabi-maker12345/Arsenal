"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { HubLogo } from "@/components/landing/HubLogo";
import { GhostButton } from "@/components/landing/GhostButton";
import { gsap } from "@/lib/gsap";
import {
  NODE_COUNTERS,
  NODE_MAP,
  SCENE_LABELS,
  type SceneId,
} from "@/lib/scenes";
import type { HeroContent } from "@/content/schema";
import { Scene, useSceneRuntime } from "./Scene";
import { useSceneManager } from "./SceneManager";

interface HeroSceneProps {
  content: HeroContent;
}

export function HeroScene({ content }: HeroSceneProps) {
  return (
    <Scene id="hero" isStatic>
      <HeroContentBlock content={content} />
    </Scene>
  );
}

function HeroContentBlock({ content }: HeroSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { active, enterCount } = useSceneRuntime();
  const { go } = useSceneManager();

  useGSAP(
    () => {
      if (!enterCount || !rootRef.current) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });

      timeline
        .from(".hero-scene__line-inner", {
          yPercent: 115,
          duration: 1,
          ease: "expo.out",
          stagger: 0.12,
        })
        .from(
          ".hero-scene__outro > *",
          { y: 24, opacity: 0, duration: 0.9, stagger: 0.09 },
          0.55,
        )
        .from(
          ".hero-scene__marquee",
          { x: 40, opacity: 0, duration: 0.9 },
          0.75,
        );

      return () => timeline.kill();
    },
    { scope: rootRef, dependencies: [enterCount] },
  );

  return (
    <div className="hero-scene part" ref={rootRef}>
      <div className="hero-scene__bg" aria-hidden="true">
        <svg className="hero-scene__grid" aria-hidden="true">
          <defs>
            <pattern
              id="hero-hex-grid"
              width="90"
              height="104"
              patternUnits="userSpaceOnUse"
            >
              <path
                d="M45 2 87 26 87 78 45 102 3 78 3 26Z"
                fill="none"
                stroke="rgba(255,255,255,.035)"
                strokeWidth="1"
              />
              <path
                d="M45 54 87 78 87 130 45 154 3 130 3 78Z"
                fill="none"
                stroke="rgba(255,255,255,.035)"
                strokeWidth="1"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#hero-hex-grid)" />
        </svg>
        <span className="hero-scene__vignette" />
      </div>

      <h1
        id="hero-title"
        data-scene-title
        tabIndex={-1}
        className="hero-scene__title"
        aria-label={content.titleLines.join(" ")}
      >
        {content.titleLines.map((line) => {
          const hasPeriod = line.endsWith(".");
          const text = hasPeriod ? line.slice(0, -1) : line;
          return (
            <span key={line} className="hero-scene__line">
              <span className="hero-scene__line-inner">
                {text}
                {hasPeriod ? <span className="hero-scene__dot">.</span> : null}
              </span>
            </span>
          );
        })}
      </h1>

      <div className="hero-scene__logo">
        <HubLogo
          active={active}
          mode="hero"
          interactive
          labels={NODE_MAP.map((id: SceneId) => SCENE_LABELS[id])}
          numerals={NODE_COUNTERS}
          activeNode={null}
          onNodeActivate={(index, origin) => {
            const id = NODE_MAP[index];
            go(id, { origin, source: "node" });
          }}
        />
      </div>

      <div className="hero-scene__marquee" aria-hidden="true">
        <div className="hero-scene__marquee-track">
          {[...content.platforms, ...content.platforms].map((platform, index) => (
            <span key={`${platform}-${index}`} className="hero-scene__platform">
              <span className="hero-scene__separator" aria-hidden="true" />
              {platform}
            </span>
          ))}
        </div>
      </div>
      <p className="sr-only">Plataformas: {content.platforms.join(", ")}.</p>

      <div className="hero-scene__outro">
        <p className="hero-scene__lead">{content.lead}</p>
        <div>
          <GhostButton
            label={content.cta.label}
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
  );
}
