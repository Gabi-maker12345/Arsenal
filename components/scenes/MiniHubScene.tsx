"use client";

import { useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import type { S03 } from "@/content/schema";
import { Scene, useSceneRuntime } from "./Scene";
import { ScrollHint } from "./ScrollHint";

const CENTER = 500;
const MEMBER_RADIUS = 266;
const MEMBER_HEX = [
  [0, -64],
  [55.4, -32],
  [55.4, 32],
  [0, 64],
  [-55.4, 32],
  [-55.4, -32],
]
  .map(([x, y]) => `${x},${y}`)
  .join(" ");

function memberPoint(index: number) {
  const angle = ((-90 + 60 * index) * Math.PI) / 180;
  return {
    x: Number((CENTER + MEMBER_RADIUS * Math.cos(angle)).toFixed(2)),
    y: Number((CENTER + MEMBER_RADIUS * Math.sin(angle)).toFixed(2)),
  };
}

const BARS = Array.from({ length: 72 }, (_, index) => {
  const angle = (index / 72) * Math.PI * 2 - Math.PI / 2;
  const inner = 120;
  const outer = 142 + ((index * 37) % 58);
  return {
    index,
    x1: (CENTER + Math.cos(angle) * inner).toFixed(2),
    y1: (CENTER + Math.sin(angle) * inner).toFixed(2),
    x2: (CENTER + Math.cos(angle) * outer).toFixed(2),
    y2: (CENTER + Math.sin(angle) * outer).toFixed(2),
  };
});

const BAR_GROUPS = Array.from({ length: 8 }, (_, group) =>
  BARS.filter((bar) => bar.index % 8 === group),
);

export function MiniHubScene({ content }: { content: S03 }) {
  return (
    <Scene id="s03">
      <MiniHubContent content={content} />
    </Scene>
  );
}

function MiniHubContent({ content }: { content: S03 }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const partARef = useRef<HTMLDivElement>(null);
  const hubRef = useRef<HTMLDivElement>(null);
  const partBRef = useRef<HTMLElement>(null);
  const partCRef = useRef<HTMLElement>(null);
  const memberRefs = useRef<(SVGGElement | null)[]>([]);
  const [speaker, setSpeaker] = useState<number | null>(null);
  const pausedUntilRef = useRef(0);
  const { active, visualCount, scroller } = useSceneRuntime();

  useGSAP(
    () => {
      if (!visualCount || !active || !rootRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const members = memberRefs.current.filter(
        (member): member is SVGGElement => Boolean(member),
      );
      if (reduced) return;

      let previous = -1;
      let timer = 0;
      let interval = 0;

      const speak = (forced?: number) => {
        if (performance.now() < pausedUntilRef.current) return;
        if (!members.length) return;
        let next =
          forced ??
          (previous < 0 ? Math.floor(Math.random() * members.length) : previous + 1 + Math.floor(Math.random() * (members.length - 1)));
        next %= members.length;
        previous = next;
        setSpeaker(next);
        const member = members[next];
        if (!member) return;
        const ring = member.querySelector<SVGCircleElement>(".s03-member-ring");
        const spoke = rootRef.current?.querySelector<SVGLineElement>(
          `.s03-spoke[data-member="${next}"]`,
        );

        const timeline = gsap
          .timeline()
          .to(member, {
            scale: 1.14,
            duration: 0.45,
            ease: "elastic.out(1, 0.5)",
            transformOrigin: "50% 50%",
          })
          .to(member, { scale: 1, duration: 0.7, ease: "power2.out" })
          .fromTo(
            ring,
            { scale: 1, opacity: 0.55 },
            { scale: 1.85, opacity: 0, duration: 0.8, ease: "power2.out" },
            0,
          );
        if (spoke) {
          timeline
            .fromTo(
              spoke,
              { opacity: 0.15 },
              { opacity: 1, duration: 0.35, ease: "power2.out" },
              0,
            )
            .to(spoke, { opacity: 0.15, duration: 1.2, ease: "power2.in" });
        }

        gsap.to(".s03-wave-group", {
          opacity: () => 0.3 + Math.random() * 0.7,
          duration: 1.1,
          ease: "power2.out",
          stagger: { each: 0.035, from: "random" },
        });
      };

      timer = window.setTimeout(() => {
        speak();
        interval = window.setInterval(speak, 2400);
      }, 900);

      return () => {
        window.clearTimeout(timer);
        window.clearInterval(interval);
      };
    },
    { scope: rootRef, dependencies: [visualCount, active] },
  );

  useGSAP(
    () => {
      if (!visualCount || !rootRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const title = rootRef.current.querySelector<HTMLElement>(".s03-title");
      const copy = rootRef.current.querySelector<HTMLElement>(".s03-copy");
      const cta = rootRef.current.querySelector<HTMLElement>(".s03-cta-wrap");
      if (!title) return;
      if (reduced) return;
      const timeline = gsap.timeline({ delay: 0.35 });
      timeline
        .from(title, { opacity: 0, y: 24, duration: 1.3, ease: "expo.out" })
        .from(
          copy,
          {
            clipPath: "inset(0 0 100% 0)",
            duration: 1,
            ease: "power3.out",
          },
          0.35,
        )
        .from(cta, { opacity: 0, y: 20, duration: 1, ease: "power3.out" }, 0.45);
      return () => timeline.kill();
    },
    { scope: rootRef, dependencies: [visualCount] },
  );

  useGSAP(
    () => {
      if (!scroller || !partARef.current || !hubRef.current || !rootRef.current) {
        return;
      }
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const base = rootRef.current.querySelector<HTMLElement>(".s03-title__base");
      const members = memberRefs.current.filter(
        (member): member is SVGGElement => Boolean(member),
      );
      if (reduced) {
        if (base) base.style.color = "var(--ink)";
        return;
      }
      const trigger = ScrollTrigger.create({
        trigger: partARef.current,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          gsap.set(hubRef.current, {
            rotation: p * 120,
            scale: 1 + p * 0.5,
            transformOrigin: "50% 50%",
          });
          members.forEach((member) =>
            gsap.set(member, {
              rotation: -p * 120,
              transformOrigin: "50% 50%",
            }),
          );
          if (base) {
            const fillProgress = Math.min(1, Math.max(0, (p - 0.08) / 0.72));
            base.style.color = `rgba(242, 241, 237, ${fillProgress})`;
          }
        },
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useGSAP(
    () => {
      if (!scroller || !partBRef.current || !rootRef.current) return;
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      const cards = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>(".s03-stack-card"),
      );
      const dots = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>(".s03-stack-rail__hex"),
      );
      const trigger = ScrollTrigger.create({
        trigger: partBRef.current,
        scroller,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
        onUpdate: (self) => {
          const p = self.progress;
          cards.forEach((card, index) => {
            const enter =
              index === 0
                ? 1
                : Math.min(1, Math.max(0, (p - index / 3) * 3));
            const settle = Math.min(
              1,
              Math.max(0, (p - (index + 1) / 3) * 3),
            );
            gsap.set(card, {
              xPercent: -50,
              yPercent: -50,
              y:
                (index === 0 ? 0 : (1 - enter) * window.innerHeight) -
                settle * window.innerHeight * 0.04,
              rotation: (index === 0 ? 0 : (1 - enter) * 3) - settle * 1.5,
              scale: 1 - settle * 0.08,
              opacity: index === 0 ? 1 : enter > 0 ? 1 : 0,
              zIndex: index + 1,
            });
          });
          const current = Math.min(2, Math.floor(p * 3 + 0.15));
          dots.forEach((dot, index) => {
            dot.classList.toggle("is-current", index === current);
            dot.classList.toggle("is-past", index < current);
          });
        },
      });
      return () => trigger.kill();
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useGSAP(
    () => {
      if (!partCRef.current || !rootRef.current || !scroller) return;
      const tiles = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>(".s03-bento__tile"),
      );
      const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduced) return;
      const timeline = gsap.timeline({ paused: true });
      tiles.forEach((tile, index) => {
        const edge = index === 0 || index === 2 || index === 4;
        timeline.from(
          tile,
          {
            y: edge ? 60 : 42,
            opacity: 0,
            scale: edge ? 0.985 : 1,
            duration: 0.8,
            ease: "power3.out",
          },
          index * 0.07,
        );
      });
      const partC = partCRef.current;
      let played = false;
      const check = () => {
        if (played) return;
        const partRect = partC.getBoundingClientRect();
        const rootRect = scroller.getBoundingClientRect();
        if (partRect.top < rootRect.bottom - 40) {
          played = true;
          timeline.play(0);
          scroller.removeEventListener("scroll", check);
        }
      };
      scroller.addEventListener("scroll", check, { passive: true });
      check();
      return () => {
        scroller.removeEventListener("scroll", check);
        timeline.kill();
      };
    },
    { scope: rootRef, dependencies: [scroller] },
  );

  useGSAP(
    () => {
      if (!rootRef.current) return;
      if (window.matchMedia("(pointer: coarse)").matches) return;
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
      const tiles = Array.from(
        rootRef.current.querySelectorAll<HTMLElement>(".s03-bento__tile"),
      );
      const cleanups = tiles.map((tile) => {
        const rotateX = gsap.quickTo(tile, "rotateX", {
          duration: 0.5,
          ease: "power3.out",
        });
        const rotateY = gsap.quickTo(tile, "rotateY", {
          duration: 0.5,
          ease: "power3.out",
        });
        const onMove = (event: PointerEvent) => {
          const rect = tile.getBoundingClientRect();
          rotateY(((event.clientX - rect.left) / rect.width - 0.5) * 8);
          rotateX(-((event.clientY - rect.top) / rect.height - 0.5) * 8);
          tile.style.setProperty("--mx", `${event.clientX - rect.left}px`);
          tile.style.setProperty("--my", `${event.clientY - rect.top}px`);
        };
        const onLeave = () => {
          rotateX(0);
          rotateY(0);
        };
        tile.addEventListener("pointermove", onMove);
        tile.addEventListener("pointerleave", onLeave);
        return () => {
          tile.removeEventListener("pointermove", onMove);
          tile.removeEventListener("pointerleave", onLeave);
          gsap.killTweensOf(tile);
        };
      });
      return () => cleanups.forEach((cleanup) => cleanup());
    },
    { scope: rootRef, dependencies: [] },
  );

  const speakerName =
    speaker !== null ? content.members[speaker]?.name : null;

  return (
    <div className="s03-scene" ref={rootRef}>
      <div className="s03-part-a" ref={partARef}>
        <div className="s03-stage">
          <div className="s03-visual">
            <div className="s03-hub-wrap" ref={hubRef}>
            <svg
              className="s03-hub"
              viewBox="0 0 1000 1000"
              aria-hidden="true"
            >
              <defs>
                <clipPath id="s03-member-clip">
                  <polygon points={MEMBER_HEX} />
                </clipPath>
              </defs>

              <polygon
                className="s03-room"
                points="500,234 730.4,367 730.4,633 500,766 269.6,633 269.6,367"
              />

              {content.members.map((member, index) => {
                const point = memberPoint(index);
                return (
                  <line
                    key={`spoke-${index}`}
                    className="s03-spoke"
                    data-member={index}
                    x1={CENTER}
                    y1={CENTER}
                    x2={point.x.toFixed(2)}
                    y2={point.y.toFixed(2)}
                  />
                );
              })}

              <circle className="s03-wave-ring" cx={CENTER} cy={CENTER} r="120" />
              {BAR_GROUPS.map((group, groupIndex) => (
                <g className="s03-wave-group" key={`wave-${groupIndex}`}>
                  {group.map((bar) => (
                    <line
                      key={bar.index}
                      className="s03-wave-bar"
                      x1={bar.x1}
                      y1={bar.y1}
                      x2={bar.x2}
                      y2={bar.y2}
                    />
                  ))}
                </g>
              ))}

              {content.members.map((member, index) => {
                const point = memberPoint(index);
                return (
                  <g
                    key={`member-${index}`}
                    transform={`translate(${point.x.toFixed(2)} ${point.y.toFixed(2)})`}
                  >
                    <g
                      ref={(node) => {
                        memberRefs.current[index] = node;
                      }}
                      className={`s03-member ${speaker === index ? "is-speaking" : ""}`}
                      onPointerEnter={() => {
                        pausedUntilRef.current = performance.now() + 3000;
                        setSpeaker(index);
                      }}
                    >
                      <circle className="s03-member-ring" r="70" />
                      <polygon className="s03-member-hex" points={MEMBER_HEX} />
                      <image
                        href={member.src}
                        x="-55.4"
                        y="-64"
                        width="110.8"
                        height="128"
                        preserveAspectRatio="xMidYMid slice"
                        clipPath="url(#s03-member-clip)"
                      />
                      <title>{member.name}</title>
                    </g>
                  </g>
                );
              })}
            </svg>
            </div>
          </div>

          <p className="s03-micro">(03)</p>

          <div className="s03-title-wrap">
            <h2
              id="s03-title"
              data-scene-title
              tabIndex={-1}
              className="s03-title"
              aria-label={content.title}
            >
              <span className="s03-title__base" aria-hidden="true">
                {content.title}
              </span>
            </h2>
          </div>

          <div className="s03-copy">
            <p className="s03-lead">{content.lead}</p>
            <ul className="s03-chips">
              {content.chips.map((chip, index) => (
                <li key={`${chip}-${index}`}>
                  <span className="s03-chip-mark" aria-hidden="true" />
                  {chip}
                </li>
              ))}
            </ul>
          </div>

          <div className="s03-cta-wrap">
            <a className="s03-hex-cta" href={content.cta.href}>
              <span>{content.cta.label}</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>

          <p className="s03-speaker" aria-live="polite">
            {speakerName ? `A falar: ${speakerName}` : ""}
          </p>

          <ScrollHint label="Scroll" />
        </div>
      </div>

      <section className="s03-part-b" ref={partBRef}>
        <div className="s03-stack">
          <div className="s03-stack-rail" aria-hidden="true">
            {content.steps.map((step, index) => (
              <span className="s03-stack-rail__item" key={`${step.title}-${index}`}>
                <span className="s03-stack-rail__hex" />
              </span>
            ))}
          </div>
          {content.steps.map((step, index) => (
            <article
              className="s03-stack-card"
              key={`${step.title}-${index}`}
              ref={(node) => {
                if (node) {
                  const media = node.querySelector<HTMLElement>(
                    ".s03-stack-card__media",
                  );
                  if (media) {
                    media.style.backgroundImage = `url(${step.media.src})`;
                  }
                }
              }}
            >
              <span className="s03-stack-card__num" aria-hidden="true">
                0{index + 1}
              </span>
              <div className="s03-stack-card__copy">
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </div>
              <div
                className="s03-stack-card__media"
                role="img"
                aria-label={step.media.alt}
              />
            </article>
          ))}
        </div>
      </section>

      <section className="s03-part-c" ref={partCRef}>
        <p className="s03-bento__micro">(03.3)</p>
        <div className="s03-bento">
          {content.bento.map((tile, index) => (
            <article
              className={`s03-bento__tile s03-bento__tile--${tile.span}`}
              key={`${tile.title}-${index}`}
            >
              <span className="s03-bento__icon" aria-hidden="true" />
              <h3>{tile.title}</h3>
              <p>{tile.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
