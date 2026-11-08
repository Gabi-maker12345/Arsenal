"use client";

import { useEffect } from "react";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

const LOW_FX_QUERY = "(pointer: coarse)";

/**
 * Um só listener de ponteiro para grain/spotlight. As camadas visuais vivem
 * dentro de cada Scene (`.scene__fx`), para não tingir o conteúdo.
 */
export function SceneEffects() {
  useEffect(() => {
    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    const coarse = window.matchMedia(LOW_FX_QUERY).matches;
    const low = reduced || coarse || navigator.hardwareConcurrency <= 4;
    document.documentElement.classList.toggle("lowfx", low);
    if (low) return () => document.documentElement.classList.remove("lowfx");

    let frame = 0;
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    const apply = () => {
      frame = 0;
      document.documentElement.style.setProperty("--mx", `${x}px`);
      document.documentElement.style.setProperty("--my", `${y}px`);
    };

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      x = event.clientX;
      y = event.clientY;
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      window.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("lowfx");
    };
  }, []);

  return null;
}
