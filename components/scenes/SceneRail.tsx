"use client";

import { SCENE_IDS, SCENE_LABELS, sceneToNode } from "@/lib/scenes";
import { useSceneManager, useSceneProgress } from "./SceneManager";

const RAIL_COUNTERS = ["00", "01", "02", "03", "04", "05", "•"] as const;

export function SceneRail() {
  const { active, go } = useSceneManager();
  const { charge, chargeTarget } = useSceneProgress();
  const activeIndex = SCENE_IDS.indexOf(active);
  const fill = activeIndex / (SCENE_IDS.length - 1);

  return (
    <nav className="rail" aria-label="Navegação por cenas">
      <div className="rail__track">
        <span className="rail__line" aria-hidden="true" />
        <span
          className="rail__line-fill"
          aria-hidden="true"
          style={{ transform: `scaleX(${fill})` }}
        />
        <div className="rail__markers">
          {SCENE_IDS.map((id, index) => {
            const current = id === active;
            const past = index < activeIndex;
            const nodeIndex = sceneToNode(id);
            return (
              <button
                key={id}
                type="button"
                className={[
                  "rail__marker",
                  current ? "is-current" : "",
                  past ? "is-past" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                aria-label={`Ir para ${SCENE_LABELS[id]}`}
                aria-current={current ? "location" : undefined}
                onClick={(event) => {
                  const rect = event.currentTarget.getBoundingClientRect();
                  go(id, {
                    origin: {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    },
                    source: nodeIndex >= 0 ? "node" : "rail",
                  });
                }}
              >
                <span className="rail__hex" aria-hidden="true" />
                {chargeTarget === id ? (
                  <svg className="rail__charge" viewBox="0 0 24 24" aria-hidden="true">
                    <polygon
                      points="12,1 21.5,6.5 21.5,17.5 12,23 2.5,17.5 2.5,6.5"
                      pathLength="100"
                      style={{ strokeDashoffset: 100 - charge * 100 }}
                    />
                  </svg>
                ) : null}
                <span className="rail__label">
                  <span>{RAIL_COUNTERS[index]}</span>
                  <span>{SCENE_LABELS[id]}</span>
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
