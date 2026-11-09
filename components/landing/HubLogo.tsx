"use client";

import { useEffect, useId, useMemo, useRef, useState, type CSSProperties } from "react";
import { useGSAP } from "@gsap/react";
import { NODE_COUNTERS, NODE_LABEL_POINTS, NODE_POINTS } from "@/lib/scenes";
import { createHubLogoAnimation, type HubController } from "./hub-logo.anim";
import { HUB_LOGO_SVG, scopeHubLogoSvg } from "./hub-logo-markup";

type HubMode = "hero" | "closing" | "loader" | "map";
type NodeOrigin = { x: number; y: number };

interface HubLogoProps {
  mode?: HubMode;
  active?: boolean;
  onIntroComplete?: () => void;
  interactive?: boolean;
  variant?: "default" | "map";
  labels?: readonly string[];
  numerals?: readonly string[];
  activeNode?: number | null;
  onNodeActivate?: (index: number, origin: NodeOrigin) => void;
}

/**
 * Logo animável (Núcleo → Hastes → Nós → Relé) injetada como SVG inline
 * para permitir animação por parte. O controller é dono da timeline e
 * reverte tudo no unmount. Os nós são uma camada HTML acessível sobre o SVG.
 */
export function HubLogo({
  mode = "hero",
  active = true,
  onIntroComplete,
  interactive = false,
  variant = "default",
  labels = [],
  numerals = NODE_COUNTERS,
  activeNode = null,
  onNodeActivate,
}: HubLogoProps) {
  const stageRef = useRef<HTMLDivElement>(null);
  const svgHostRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<HubController | null>(null);
  const instanceId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const scopedSvg = useMemo(
    () => scopeHubLogoSvg(HUB_LOGO_SVG, `hub-${instanceId}-`),
    [instanceId],
  );
  const [nodesReady, setNodesReady] = useState(mode === "map");
  const [hoveredNode, setHoveredNode] = useState<number | null>(null);
  const nextNode =
    activeNode === null
      ? 0
      : activeNode < NODE_POINTS.length - 1
        ? activeNode + 1
        : null;

  useGSAP(
    () => {
      const svg = svgHostRef.current?.querySelector("svg");
      if (!(svg instanceof SVGSVGElement)) return;

      const handleReady = () => {
        setNodesReady(true);
        onIntroComplete?.();
      };

      const controller = createHubLogoAnimation(svg, {
        debugGlobal: mode === "hero",
        skipIntro: mode === "map",
        onIntroComplete: interactive || onIntroComplete ? handleReady : undefined,
      });
      controllerRef.current = controller;
      if (!active) controller.setActive(false);
      return () => {
        controller.destroy();
        controllerRef.current = null;
      };
    },
    { scope: stageRef, dependencies: [mode, onIntroComplete, interactive] },
  );

  useEffect(() => {
    controllerRef.current?.setActive(active);
  }, [active]);

  return (
    <div
      ref={stageRef}
      className={[
        "hub-stage",
        `hub-stage--${mode}`,
        interactive ? "is-interactive" : "",
        variant === "map" ? "is-map" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      data-hub-stage
    >
      <div
        ref={svgHostRef}
        className="hub-stage__svg"
        aria-hidden="true"
        dangerouslySetInnerHTML={{ __html: scopedSvg }}
      />

      {interactive ? (
        <div
          className={`hub-stage__nodes ${nodesReady ? "is-ready" : ""}`}
          data-variant={variant}
        >
          {NODE_POINTS.map((point, index) => {
            const label = labels[index] ?? "";
            const numeral = numerals[index] ?? String(index + 1).padStart(2, "0");
            const isActive = activeNode === index;
            const isBeacon = nextNode === index;
            const isHovered = hoveredNode === index;
            const hitStyle: CSSProperties = {
              left: `${point.x / 10}%`,
              top: `${point.y / 10}%`,
            };
            const labelPoint = NODE_LABEL_POINTS[index];
            const labelScale = variant === "map" ? 1.6 / 1.4 : 1;
            const labelStyle: CSSProperties = {
              left: `${50 + (labelPoint.x - 50) * labelScale}%`,
              top: `${50 + (labelPoint.y - 50) * labelScale}%`,
            };

            return (
              <div key={`${label}-${index}`} className="hub-node">
                <button
                  type="button"
                  className={[
                    "hub-node__hit",
                    isActive ? "is-active" : "",
                    isBeacon ? "is-beacon" : "",
                    isHovered ? "is-hover" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={hitStyle}
                  aria-label={label ? `Ir para ${label}` : `Ir para a cena ${index + 1}`}
                  aria-current={isActive ? "location" : undefined}
                  disabled={!nodesReady}
                  onPointerEnter={() => setHoveredNode(index)}
                  onPointerLeave={() => setHoveredNode(null)}
                  onFocus={() => setHoveredNode(index)}
                  onBlur={() => setHoveredNode(null)}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    onNodeActivate?.(index, {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    });
                  }}
                >
                  <span className="hub-node__ring" aria-hidden="true" />
                  <span className="sr-only">{numeral}</span>
                </button>

                <span
                  className={[
                    "hub-node__label",
                    isActive ? "is-active" : "",
                    isBeacon ? "is-beacon" : "",
                    isHovered ? "is-hover" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  style={labelStyle}
                  aria-hidden="true"
                  onPointerEnter={() => setHoveredNode(index)}
                  onPointerLeave={() => setHoveredNode(null)}
                  onClick={(event) => {
                    const rect = event.currentTarget.getBoundingClientRect();
                    onNodeActivate?.(index, {
                      x: rect.left + rect.width / 2,
                      y: rect.top + rect.height / 2,
                    });
                  }}
                >
                  <span className="hub-node__num">{numeral}</span>
                  <span className="hub-node__title">{label}</span>
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
