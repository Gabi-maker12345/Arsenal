"use client";

import { useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { S01 } from "@/content/schema";
import { Scene, useSceneRuntime } from "./Scene";
import { ScrollHint } from "./ScrollHint";
import { useSceneManager } from "./SceneManager";

const VIEW_W = 1440;
const VIEW_H = 900;
const PULSE_DEPTHS = [-0.15, -0.45, -0.9, -1.3];

interface Tile {
  id: number;
  x: number;
  y: number;
  r: number;
  depth: number;
  photo: boolean;
  src: string;
  alt: string;
  label: string;
  sub: string;
}

function mulberry32(seed: number) {
  let value = seed;
  return () => {
    value |= 0;
    value = (value + 0x6d2b79f5) | 0;
    let next = Math.imul(value ^ (value >>> 15), 1 | value);
    next = (next + Math.imul(next ^ (next >>> 7), 61 | next)) ^ next;
    return ((next ^ (next >>> 14)) >>> 0) / 4294967296;
  };
}

function hexPoints(r: number) {
  const w = (Math.sqrt(3) * r) / 2;
  return [
    [0, -r],
    [w, -r / 2],
    [w, r / 2],
    [0, r],
    [-w, r / 2],
    [-w, -r / 2],
  ]
    .map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`)
    .join(" ");
}

function buildTiles(content: S01): Tile[] {
  const rng = mulberry32(0x51a2);
  const sizes = [58, 96, 142];
  const uniqueSources = Array.from(
    new Map(content.tiles.map((tile) => [tile.src, tile])).values(),
  );
  const placed: Omit<Tile, "id" | "photo" | "src" | "alt" | "label" | "sub">[] = [];
  let attempts = 0;

  while (placed.length < 22 && attempts < 900) {
    attempts += 1;
    const r = sizes[Math.floor(rng() * sizes.length)];
    const x = -40 + rng() * (VIEW_W + 80);
    const y = -30 + rng() * (VIEW_H + 60);
    const depth = Math.floor(rng() * 4);
    const fits = placed.every((tile) => {
      const distance = Math.hypot(tile.x - x, tile.y - y);
      return distance > (tile.r + r) * 0.7;
    });
    if (fits) placed.push({ x, y, r, depth });
  }

  return placed.map((tile, index) => {
    const slot = content.tiles[index % content.tiles.length];
    const source = index < uniqueSources.length ? uniqueSources[index] : null;
    return {
      ...tile,
      id: index,
      photo: source !== null,
      src: source?.src ?? slot.src,
      alt: source?.alt ?? slot.alt,
      label: slot.label,
      sub: slot.sub,
    };
  });
}

function formatValue(value: number, suffix?: string) {
  const number = Number.isInteger(value) ? String(value) : value.toFixed(1);
  return `${number}${suffix ?? ""}`;
}

function sparkPoints(values: number[]) {
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 22 - ((value - min) / span) * 18;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(" ");
}

export function HexFieldScene({ content }: { content: S01 }) {
  return (
    <Scene id="s01">
      <HexFieldContent content={content} />
    </Scene>
  );
}

function HexFieldContent({ content }: { content: S01 }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const partARef = useRef<HTMLDivElement>(null);
  const partBRef = useRef<HTMLElement>(null);
  const partCRef = useRef<HTMLElement>(null);
  const fieldRef = useRef<SVGSVGElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [hovered, setHovered] = useState<{
    tile: Tile;
    x: number;
    y: number;
  } | null>(null);
  const { visualCount, scroller } = useSceneRuntime();
  const { go } = useSceneManager();
  const tiles = useMemo(() => buildTiles(content), [content]);
  const zoomSrc = tiles.find((tile) => tile.photo)?.src ?? content.tiles[0]?.src;

  useGSAP(
    () => {
      if (!visualCount || !rootRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const field = fieldRef.current;
      const title = rootRef.current.querySelector<HTMLElement>(".s01-title");
      const legend = rootRef.current.querySelector<HTMLElement>(".s01-legend");
      const cta = rootRef.current.querySelector<HTMLElement>(".s01-cta");

      if (reduced) {
        if (field) gsap.set(field, { opacity: 0.72 });
        return;
      }

      const timeline = gsap.timeline();
      timeline
        .from(".s01-field__outline", {
          drawSVG: "0% 0%",
          duration: 0.7,
          ease: "power2.out",
          stagger: { each: 0.01, from: "center" },
        })
        .from(
          ".s01-field__photo-group",
          {
            scale: 0.4,
            rotation: 30,
            opacity: 0,
            duration: 0.9,
            ease: "expo.out",
            transformOrigin: "50% 50%",
            stagger: { each: 0.025, from: "center" },
          },
          0,
        )
        .from(
          title,
          { yPercent: 12, opacity: 0, duration: 1, ease: "expo.out" },
          0.4,
        )
        .from(legend, { y: 18, opacity: 0, duration: 0.65, ease: "power3.out" }, 0.9)
        .from(cta, { y: 18, opacity: 0, duration: 0.65, ease: "power3.out" }, 1);

      const photoGroups = field
        ? Array.from(field.querySelectorAll<SVGGElement>(".s01-field__tile"))
        : [];
      const onMove = (event: PointerEvent) => {
        if (!field || event.pointerType !== "mouse") return;
        const point = field.createSVGPoint();
        point.x = event.clientX;
        point.y = event.clientY;
        const ctm = field.getScreenCTM();
        if (!ctm) return;
        const local = point.matrixTransform(ctm.inverse());
        photoGroups.forEach((group) => {
          const x = Number(group.dataset.x ?? 0);
          const y = Number(group.dataset.y ?? 0);
          const distance = Math.hypot(local.x - x, local.y - y);
          const scale =
            distance < 260 ? 1 + 0.16 * Math.pow(1 - distance / 260, 2) : 1;
          gsap.to(group, {
            scale,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true,
          });
        });
      };
      const onLeave = () => {
        photoGroups.forEach((group) =>
          gsap.to(group, { scale: 1, duration: 0.3, overwrite: true }),
        );
      };
      field?.addEventListener("pointermove", onMove);
      field?.addEventListener("pointerleave", onLeave);

      return () => {
        field?.removeEventListener("pointermove", onMove);
        field?.removeEventListener("pointerleave", onLeave);
        timeline.kill();
      };
    },
    { scope: rootRef, dependencies: [visualCount] },
  );

  useGSAP(
    () => {
      if (!scroller || !partARef.current || !rootRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const fill = rootRef.current.querySelector<HTMLElement>(".s01-title__fill");
      const title = rootRef.current.querySelector<HTMLElement>(".s01-title");
      const zoom = rootRef.current.querySelector<HTMLElement>(".s01-zoom");
      const field = rootRef.current.querySelector<SVGSVGElement>(".s01-field");
      if (!fill) return;

      if (reduced) {
        fill.style.clipPath = "inset(0 0 0 0)";
        return;
      }

      const layers = PULSE_DEPTHS.map((speed, depth) => ({
        speed,
        nodes: gsap.utils.toArray<SVGGElement>(
          `.s01-field__tile[data-depth="${depth}"]`,
          rootRef.current,
        ),
      }));

      const trigger = ScrollTrigger.create({
        trigger: partARef.current,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          const fillProgress = Math.min(1, Math.max(0, (p - 0.15) / 0.45));
          fill.style.clipPath = `inset(0 ${(1 - fillProgress) * 100}% 0 0)`;

          layers.forEach((layer) => {
            layer.nodes.forEach((node) => {
              gsap.set(node, {
                y: (p - 0.5) * window.innerHeight * layer.speed,
              });
            });
          });

          if (title) {
            gsap.set(title, {
              opacity: 1 - Math.max(0, Math.min(1, (p - 0.72) / 0.2)),
            });
          }
          if (zoom) {
            zoom.style.opacity = String(
              Math.max(0, Math.min(1, (p - 0.58) / 0.22)),
            );
          }
          if (field) {
            field.style.opacity = String(
              0.72 - Math.max(0, Math.min(0.42, (p - 0.7) / 0.3)),
            );
          }
        },
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useGSAP(
    () => {
      if (!scroller || !partBRef.current || !trackRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      const track = trackRef.current;
      const heading = rootRef.current?.querySelector<HTMLElement>(
        ".s01-pulse__heading",
      );
      const max = () => Math.max(0, track.scrollWidth - window.innerWidth + 2 * 48);
      const cards = Array.from(track.querySelectorAll<HTMLElement>(".s01-pulse-card"));
      const trigger = ScrollTrigger.create({
        trigger: partBRef.current,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: true,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(track, { x: -max() * p });
          if (heading) {
            gsap.set(heading, { x: (0.1 - p * 0.7) * window.innerWidth });
          }
          cards.forEach((card) => {
            const rect = card.getBoundingClientRect();
            const centered =
              Math.abs(rect.left + rect.width / 2 - window.innerWidth / 2) <
              window.innerWidth * 0.12;
            card.classList.toggle("is-lit", centered);
          });
        },
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useGSAP(
    () => {
      if (!scroller || !partCRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      const values = Array.from(
        partCRef.current.querySelectorAll<HTMLElement>("[data-stat]"),
      );
      const trigger = ScrollTrigger.create({
        trigger: partCRef.current,
        scroller,
        start: "top 82%",
        once: true,
        onEnter: () => {
          values.forEach((element) => {
            const value = Number(element.dataset.stat ?? 0);
            const suffix = element.dataset.suffix ?? "";
            const state = { value: 0 };
            gsap.to(state, {
              value,
              duration: 1.4,
              ease: "power2.out",
              onUpdate: () => {
                element.textContent = formatValue(state.value, suffix);
              },
            });
          });
        },
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  return (
    <div className="s01-scene" ref={rootRef}>
      <div className="s01-part-a" ref={partARef}>
        <div className="s01-stage">
          <svg
            ref={fieldRef}
            className="s01-field"
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            preserveAspectRatio="xMidYMid slice"
            aria-hidden="true"
          >
            <defs>
              {tiles.map((tile) => (
                <clipPath id={`s01-clip-${tile.id}`} key={`clip-${tile.id}`}>
                  <polygon points={hexPoints(tile.r)} />
                </clipPath>
              ))}
            </defs>
            {tiles.map((tile) => (
              <g
                key={tile.id}
                className="s01-field__tile"
                data-depth={tile.depth}
                data-x={tile.x}
                data-y={tile.y}
                transform={`translate(${tile.x.toFixed(2)} ${tile.y.toFixed(2)})`}
                onPointerEnter={(event) => {
                  if (tile.photo) {
                    setHovered({ tile, x: event.clientX, y: event.clientY });
                  }
                }}
                onPointerMove={(event) => {
                  if (tile.photo && hovered) {
                    setHovered({ tile, x: event.clientX, y: event.clientY });
                  }
                }}
                onPointerLeave={() => setHovered(null)}
              >
                <g className="s01-field__photo-group">
                  <polygon
                    className="s01-field__outline"
                    points={hexPoints(tile.r)}
                  />
                  {tile.photo ? (
                    <image
                      href={tile.src}
                      x={Number((-(Math.sqrt(3) * tile.r) / 2).toFixed(2))}
                      y={-tile.r}
                      width={Number((Math.sqrt(3) * tile.r).toFixed(2))}
                      height={tile.r * 2}
                      preserveAspectRatio="xMidYMid slice"
                      clipPath={`url(#s01-clip-${tile.id})`}
                      className="s01-field__photo"
                    />
                  ) : null}
                </g>
              </g>
            ))}
          </svg>

          <div
            className="s01-zoom"
            style={{ backgroundImage: `url(${zoomSrc})` }}
            aria-hidden="true"
          />
          <div className="s01-scene__scrim" aria-hidden="true" />
          <p className="s01-micro">(01)</p>

          <h2
            id="s01-title"
            data-scene-title
            tabIndex={-1}
            className="s01-title"
            aria-label={content.title}
          >
            <span className="s01-title__base" aria-hidden="true">
              {content.title}
            </span>
            <span className="s01-title__fill" aria-hidden="true">
              {content.title}
            </span>
          </h2>

          <div className="s01-legend">
            <p>{content.lead}</p>
          </div>

          <a className="s01-cta" href={content.cta.href}>
            {content.cta.label}
            <span aria-hidden="true">↗</span>
          </a>

          <ScrollHint label="Scroll" />

          {hovered ? (
            <div
              className="s01-tile-label"
              style={{ left: hovered.x, top: hovered.y }}
            >
              <span>{hovered.tile.label}</span>
              <small>{hovered.tile.sub}</small>
            </div>
          ) : null}
        </div>
      </div>

      <section className="s01-part-b" ref={partBRef}>
        <div className="s01-pulse__stage">
          <div
            className="s01-pulse__bg"
            style={{ backgroundImage: `url(${zoomSrc})` }}
            aria-hidden="true"
          />
          <h3 className="s01-pulse__heading" aria-hidden="true">
            {content.partBHeading}
          </h3>
          <div className="s01-pulse__wrap">
            <div className="s01-pulse__track" ref={trackRef}>
              {content.feed.map((item, index) => (
                <article
                  className={`s01-pulse-card s01-pulse-card--${index % 2 === 0 ? "a" : "b"} s01-pulse-card--y${index % 4}`}
                  key={`${item.who}-${index}`}
                >
                  <span
                    className="s01-pulse-card__avatar"
                    style={{ backgroundImage: `url(${item.avatar.src})` }}
                    aria-hidden="true"
                  />
                  <div className="s01-pulse-card__copy">
                    <p className="s01-pulse-card__who">{item.who}</p>
                    <p className="s01-pulse-card__what">{item.what}</p>
                  </div>
                  <span className="s01-pulse-card__when">{item.when}</span>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="s01-part-c" ref={partCRef}>
        <div className="s01-ledger">
          {content.stats.map((stat, index) => (
            <div className="s01-ledger__row" key={`${stat.label}-${index}`}>
              <span className="s01-ledger__label">{stat.label}</span>
              <span
                className="s01-ledger__value"
                data-stat={stat.value}
                data-suffix={stat.suffix ?? ""}
              >
                {formatValue(stat.value, stat.suffix)}
              </span>
              <svg
                className="s01-ledger__spark"
                viewBox="0 0 100 24"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <polyline
                  points={sparkPoints(stat.spark)}
                  pathLength="100"
                />
              </svg>
            </div>
          ))}
        </div>

        <div className="s01-part-c__foot">
          <a className="s01-ledger-cta" href={content.cta.href}>
            {content.cta.label}
            <span aria-hidden="true">↗</span>
          </a>
          <button
            type="button"
            className="s01-ledger-cta"
            onClick={() =>
              go("s02", {
                origin: {
                  x: window.innerWidth / 2,
                  y: window.innerHeight / 2,
                },
                source: "nav",
              })
            }
          >
            {content.cta2.label}
            <span aria-hidden="true">↗</span>
          </button>
          <div className="s01-avatars" aria-hidden="true">
            {[...content.feed, ...content.feed].map((item, index) => (
              <span
                key={`${item.avatar.src}-${index}`}
                className="s01-avatars__item"
                style={{ backgroundImage: `url(${item.avatar.src})` }}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
