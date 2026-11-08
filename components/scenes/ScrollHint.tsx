"use client";

import { useEffect, useState } from "react";
import { useSceneRuntime } from "./Scene";

export function ScrollHint({ label }: { label: string }) {
  const { scroller } = useSceneRuntime();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (!scroller) return;
    const hide = () => setHidden(true);
    const onScroll = () => {
      if (scroller.scrollTop > 8) hide();
    };
    const onWheel = (event: WheelEvent) => {
      if (event.deltaY > 0) hide();
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    scroller.addEventListener("wheel", onWheel, { passive: true });
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      scroller.removeEventListener("wheel", onWheel);
    };
  }, [scroller]);

  if (hidden) return null;

  return (
    <div className="scroll-hint" aria-hidden="true">
      <span className="scroll-hint__line" />
      <span className="scroll-hint__hex" />
      <span className="scroll-hint__label">{label}</span>
    </div>
  );
}
