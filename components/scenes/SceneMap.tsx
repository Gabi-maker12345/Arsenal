"use client";

import { useEffect, useRef } from "react";
import { HubLogo } from "@/components/landing/HubLogo";
import {
  NODE_COUNTERS,
  NODE_MAP,
  SCENE_LABELS,
  sceneToNode,
} from "@/lib/scenes";
import { useSceneManager } from "./SceneManager";

export function SceneMap() {
  const { mapOpen, active, go, closeMap } = useSceneManager();
  const rootRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!mapOpen) return;
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeMap();
        return;
      }
      if (event.key !== "Tab") return;

      const root = rootRef.current;
      if (!root) return;
      const focusable = Array.from(
        root.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], [tabindex]:not([tabindex="-1"])',
        ),
      ).filter((element) => element.offsetParent !== null);
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [closeMap, mapOpen]);

  if (!mapOpen) return null;

  const labels = NODE_MAP.map((id) => SCENE_LABELS[id]);
  const activeNodeIndex = sceneToNode(active);

  return (
    <div
      ref={rootRef}
      className="scene-map"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scene-map-title"
      onPointerDown={(event) => {
        if (event.target === event.currentTarget) closeMap();
      }}
    >
      <div className="scene-map__panel">
        <div className="scene-map__head">
          <p id="scene-map-title" className="scene-map__title">
            Mapa de cenas
          </p>
          <button
            ref={closeRef}
            type="button"
            className="scene-map__close"
            onClick={closeMap}
          >
            Fechar
          </button>
        </div>

        <div className="scene-map__logo">
          <HubLogo
            mode="map"
            interactive
            variant="map"
            labels={labels}
            numerals={NODE_COUNTERS}
            activeNode={activeNodeIndex >= 0 ? activeNodeIndex : null}
            onNodeActivate={(index, origin) => {
              const id = NODE_MAP[index];
              go(id, { origin, source: "map" });
            }}
          />
        </div>

        <p className="scene-map__hint">
          Escolhe um nó para viajar. Esc fecha.
        </p>
      </div>
    </div>
  );
}
