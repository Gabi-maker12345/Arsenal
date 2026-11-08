"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";
import { BrandMark } from "@/components/scenes/BrandMark";

interface LoadingMinimalProps {
  onComplete: () => void;
}

/** Arranque curto para visitas repetidas: marca + linha de progresso. */
export function LoadingMinimal({ onComplete }: LoadingMinimalProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const markRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLSpanElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const bar = barRef.current;
      const mark = markRef.current;
      if (!root || !bar || !mark) return;

      const html = document.documentElement;
      history.scrollRestoration = "manual";
      window.scrollTo(0, 0);
      html.classList.add("is-loading");

      const reduce = window.matchMedia(REDUCED_MOTION_QUERY).matches;
      const timeline = gsap.timeline({
        onComplete: () => {
          html.classList.remove("is-loading");
          onComplete();
        },
      });

      if (reduce) {
        timeline
          .set(bar, { scaleX: 1 })
          .to(root, { opacity: 0, duration: 0.18, ease: "power1.out" }, 0.28);
      } else {
        gsap.set(bar, { scaleX: 0 });
        timeline
          .fromTo(mark, { opacity: 0, scale: 0.9 }, { opacity: 1, scale: 1, duration: 0.5, ease: "expo.out" }, 0)
          .to(bar, { scaleX: 1, duration: 1.05, ease: "power2.inOut" }, 0.1)
          .to(mark, { opacity: 0, y: -12, duration: 0.35, ease: "power2.in" }, 1.2)
          .to(root, { opacity: 0, duration: 0.45, ease: "power2.out" }, 1.25);
      }

      return () => {
        timeline.kill();
        html.classList.remove("is-loading");
      };
    },
    { scope: rootRef, dependencies: [onComplete] },
  );

  return (
    <div ref={rootRef} className="loading loading--minimal" role="status" aria-live="polite" aria-label="A carregar o Arsenal">
      <div ref={markRef} className="loading__mark" aria-hidden="true">
        <BrandMark />
      </div>
      <p className="loading__word" aria-hidden="true">ARSENAL</p>
      <span className="loading__progress" aria-hidden="true">
        <span ref={barRef} className="loading__progress-bar" />
      </span>
      <span className="sr-only">A carregar o Arsenal…</span>
    </div>
  );
}
