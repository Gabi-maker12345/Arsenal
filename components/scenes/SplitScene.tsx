"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import { GhostButton } from "@/components/landing/GhostButton";
import { IMAGE_BLUR } from "@/lib/image-placeholders";
import { initReveals } from "@/lib/reveals";
import type { SimpleScene } from "@/content/schema";
import type { SceneId } from "@/lib/scenes";
import { Scene, useSceneRuntime } from "./Scene";

interface SplitSceneProps {
  id: Extract<SceneId, "s02" | "s04">;
  content: SimpleScene;
}

const BLUR = {
  s02: IMAGE_BLUR.packs,
  s04: IMAGE_BLUR.competitions,
} as const;

export function SplitScene({ id, content }: SplitSceneProps) {
  return (
    <Scene id={id}>
      <SplitSceneContent id={id} content={content} />
    </Scene>
  );
}

function SplitSceneContent({ id, content }: SplitSceneProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const { enterCount, scroller } = useSceneRuntime();

  useGSAP(
    () => {
      if (!enterCount || !rootRef.current) return;
      return initReveals(rootRef.current, scroller);
    },
    { scope: rootRef, dependencies: [enterCount, scroller] },
  );

  return (
    <div className="split-scene part" ref={rootRef}>
      <div className="split-scene__copy">
        <p className="scene-counter">{content.eyebrow}</p>
        <h2
          id={`${id}-title`}
          data-scene-title
          tabIndex={-1}
          className="scene-title"
          data-reveal="lines"
        >
          {content.title}
        </h2>
        <div className="split-scene__body">
          <p className="scene-lead" data-reveal="rise">
            {content.lead}
          </p>
          <div data-reveal="rise">
            <GhostButton label={content.cta.label} href={content.cta.href} />
          </div>
        </div>
      </div>

      <figure className="split-scene__media photo">
        <Image
          src={content.image.src}
          alt={content.image.alt}
          fill
          sizes="(min-width: 900px) 50vw, 100vw"
          placeholder="blur"
          blurDataURL={BLUR[id]}
          className="split-scene__img"
        />
        <span className="split-scene__veil" aria-hidden="true" />
      </figure>
    </div>
  );
}
