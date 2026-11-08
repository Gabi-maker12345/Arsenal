"use client";

import { useCallback, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { HUB_CFG } from "./hub-logo.anim";
import { HubLogo } from "./HubLogo";

interface LoadingClassicProps {
  onComplete: () => void;
}

const WHITE_HOLD = 0.55;
const CURTAIN_CLOSE = 0.9;
const LOGO_RISE = 0.9;
const INTRO_HOLD = 0.45;
const IMPACT_HOLD = 0.22;
const curtainEnd = WHITE_HOLD + CURTAIN_CLOSE;
const logoStart = curtainEnd + IMPACT_HOLD;

/**
 * Intro original: ecrã branco → dois blocos pretos fecham → a logo sobe e
 * corre a intro completa → a cortina abre. É usada apenas na primeira visita
 * de cada browser; recargas seguintes usam a entrada curta.
 */
export function LoadingClassic({ onComplete }: LoadingClassicProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const whiteRef = useRef<HTMLDivElement>(null);
  const curtainRef = useRef<HTMLDivElement>(null);
  const leftRef = useRef<HTMLDivElement>(null);
  const rightRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const openRef = useRef<(() => void) | null>(null);
  const openedRef = useRef(false);
  const [showLogo, setShowLogo] = useState(false);

  const handleIntroComplete = useCallback(() => {
    openRef.current?.();
  }, []);

  useGSAP(
    () => {
      const root = rootRef.current;
      const white = whiteRef.current;
      const curtain = curtainRef.current;
      const left = leftRef.current;
      const right = rightRef.current;
      const seam = seamRef.current;
      const logo = logoRef.current;

      if (!root || !white || !curtain || !left || !right || !seam || !logo) {
        return;
      }

      const html = document.documentElement;
      const previousScrollRestoration = history.scrollRestoration;
      let fallbackTimer: number | null = null;
      let reducedTimer: number | null = null;
      let holdTimer: number | null = null;
      let openTimeline: gsap.core.Timeline | null = null;

      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      html.classList.add("is-loading");
      openedRef.current = false;

      const clearFallback = () => {
        if (fallbackTimer !== null) {
          window.clearTimeout(fallbackTimer);
          fallbackTimer = null;
        }
      };

      const open = () => {
        if (openedRef.current) return;
        openedRef.current = true;
        clearFallback();

        holdTimer = window.setTimeout(() => {
          openTimeline = gsap.timeline({
            onComplete: () => onComplete(),
          });

          openTimeline
            .to(logo, { opacity: 0, y: -48, scale: 1.04, duration: 0.6, ease: "power2.in" }, 0)
            .to(seam, { opacity: 0, duration: 0.2 }, 0)
            .to(left, { xPercent: -101, duration: 1.1, ease: "power4.inOut" }, 0.1)
            .to(right, { xPercent: 101, duration: 1.1, ease: "power4.inOut" }, 0.1)
            .to(root, { opacity: 0, duration: 0.28, ease: "power2.out" }, 0.92);
        }, INTRO_HOLD * 1000);
      };

      openRef.current = open;

      const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;

      if (reduce) {
        reducedTimer = window.setTimeout(() => onComplete(), 500);
        return () => {
          if (reducedTimer !== null) window.clearTimeout(reducedTimer);
          openRef.current = null;
          html.classList.remove("is-loading");
          history.scrollRestoration = previousScrollRestoration;
        };
      }

      gsap.set([left, right], { xPercent: (index) => (index === 0 ? -101 : 101) });
      gsap.set(curtain, { autoAlpha: 1 });
      gsap.set(white, { opacity: 1 });
      gsap.set(logo, { opacity: 0, y: 90, scale: 0.92 });
      gsap.set(seam, { opacity: 0 });

      const timeline = gsap.timeline({ defaults: { ease: "power4.inOut" } });

      timeline
        .to(left, { xPercent: 0, duration: CURTAIN_CLOSE, ease: "power4.in" }, WHITE_HOLD)
        .to(right, { xPercent: 0, duration: CURTAIN_CLOSE, ease: "power4.in" }, WHITE_HOLD)
        .to(left, { xPercent: 1, duration: 0.08, ease: "power2.out" }, curtainEnd)
        .to(right, { xPercent: -1, duration: 0.08, ease: "power2.out" }, curtainEnd)
        .to(left, { xPercent: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }, curtainEnd + 0.08)
        .to(right, { xPercent: 0, duration: 0.5, ease: "elastic.out(1, 0.4)" }, curtainEnd + 0.08)
        .fromTo(seam, { opacity: 0 }, { opacity: 1, duration: 0.08, ease: "power2.out" }, curtainEnd)
        .to(seam, { opacity: 0, duration: 0.5, ease: "power2.in" }, curtainEnd + 0.1)
        .to(white, { opacity: 0, duration: 0.3 }, curtainEnd)
        .to(logo, { opacity: 1, y: 0, scale: 1, duration: LOGO_RISE, ease: "expo.out" }, logoStart)
        .add(() => {
          setShowLogo(true);
          clearFallback();
          fallbackTimer = window.setTimeout(
            () => openRef.current?.(),
            HUB_CFG.introFallback * 1000,
          );
        }, logoStart);

      return () => {
        timeline.kill();
        openTimeline?.kill();
        clearFallback();
        if (holdTimer !== null) window.clearTimeout(holdTimer);
        if (reducedTimer !== null) window.clearTimeout(reducedTimer);
        openRef.current = null;
        html.classList.remove("is-loading");
        history.scrollRestoration = previousScrollRestoration;
      };
    },
    { scope: rootRef, dependencies: [onComplete] },
  );

  return (
    <div
      ref={rootRef}
      className="loading"
      role="status"
      aria-live="polite"
      aria-label="A carregar o Arsenal"
      style={{ position: "fixed", inset: 0, zIndex: 2000 }}
    >
      <div ref={whiteRef} className="loading__white" aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#fff" }} />
      <div ref={curtainRef} className="loading__curtain" aria-hidden="true">
        <div ref={leftRef} className="loading__panel loading__panel--left" />
        <div ref={rightRef} className="loading__panel loading__panel--right" />
      </div>
      <div ref={seamRef} className="loading__seam" aria-hidden="true" />
      <div ref={logoRef} className="loading__logo" aria-hidden="true">
        {showLogo ? <HubLogo mode="loader" onIntroComplete={handleIntroComplete} /> : null}
      </div>
      <span className="sr-only">A carregar o Arsenal…</span>
    </div>
  );
}
