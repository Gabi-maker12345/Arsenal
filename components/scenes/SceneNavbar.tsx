"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { gsap } from "@/lib/gsap";
import { SCENE_COUNTERS, SCENE_LABELS } from "@/lib/scenes";
import { BrandMark } from "./BrandMark";
import { useSceneManager, useSceneProgress } from "./SceneManager";

function brandOrigin(element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
}

export function SceneNavbar() {
  const { active, mapOpen, go, openMap } = useSceneManager();
  const { progress } = useSceneProgress();
  const [scrolled, setScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const capsuleRef = useRef<HTMLElement>(null);
  const markRef = useRef<SVGSVGElement>(null);
  const isHero = active === "hero";

  useEffect(() => {
    const scene = document.getElementById(active);
    const scroller = scene?.querySelector<HTMLElement>(".scene__scroller");
    if (!scroller) {
      const frame = window.requestAnimationFrame(() => {
        setHidden(false);
        setScrolled(false);
      });
      return () => window.cancelAnimationFrame(frame);
    }

    let last = scroller.scrollTop;
    const onScroll = () => {
      const y = scroller.scrollTop;
      setScrolled(y > 16);
      if (y <= 0) setHidden(false);
      else if (y > last + 2 && y > 120) {
        if (!headerRef.current?.contains(document.activeElement)) setHidden(true);
      } else if (y < last - 2) {
        setHidden(false);
      }
      last = y;
    };

    const frame = window.requestAnimationFrame(onScroll);
    scroller.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.cancelAnimationFrame(frame);
      scroller.removeEventListener("scroll", onScroll);
    };
  }, [active]);

  useEffect(() => {
    const capsule = capsuleRef.current;
    if (!capsule) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    let frame = 0;
    let x = 50;
    const apply = () => {
      frame = 0;
      capsule.style.setProperty("--nx", `${x}%`);
    };
    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = capsule.getBoundingClientRect();
      x = Math.min(100, Math.max(0, ((event.clientX - rect.left) / rect.width) * 100));
      if (!frame) frame = window.requestAnimationFrame(apply);
    };

    capsule.addEventListener("pointermove", onMove, { passive: true });
    return () => {
      capsule.removeEventListener("pointermove", onMove);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const clickMark = () => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const svg = markRef.current;
    if (!svg) return;
    const ring = svg.querySelector<SVGElement>(".mm-ring");
    const inner = svg.querySelector<SVGElement>(".mm-inner");
    if (!ring || !inner) return;

    gsap.killTweensOf([ring, inner]);
    gsap
      .timeline()
      .to(ring, {
        rotation: 60,
        svgOrigin: "500 500",
        duration: 1,
        ease: "back.inOut(1.4)",
      })
      .to(
        inner,
        {
          rotation: -60,
          svgOrigin: "500 500",
          duration: 1,
          ease: "power3.inOut",
        },
        0,
      )
      .set([ring, inner], { rotation: 0, svgOrigin: "500 500" });
  };

  const navigateHome = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    go("hero", { origin: brandOrigin(event.currentTarget), source: "nav" });
  };

  return (
    <header
      ref={headerRef}
      className="nav"
      data-state={isHero ? "hero" : "scene"}
      data-scrolled={scrolled}
      data-hidden={active === "footer" || (hidden && !mapOpen)}
      data-map-open={mapOpen}
      inert={active === "footer"}
      onFocusCapture={() => {
        if (active !== "footer") setHidden(false);
      }}
    >
      <nav ref={capsuleRef} className="nav__capsule" aria-label="Principal">
        <i className="nav__edge" aria-hidden="true" />
        <i className="nav__glass" aria-hidden="true" />

        <a
          href="#hero"
          className="brand"
          aria-label="Arsenal — início"
          onClick={navigateHome}
          onPointerEnter={clickMark}
        >
          <BrandMark ref={markRef} className="brand__mark" />
          <span className="brand__word" aria-hidden="true">
            RSENAL
          </span>
        </a>

        <button
          type="button"
          className="nav__now"
          aria-haspopup="dialog"
          aria-expanded={mapOpen}
          onClick={openMap}
        >
          <svg className="nav__ring" viewBox="0 0 16 16" aria-hidden="true">
            <circle cx="8" cy="8" r="6.5" pathLength="100" />
            <circle
              cx="8"
              cy="8"
              r="6.5"
              pathLength="100"
              className="nav__ring-fill"
              style={{ strokeDashoffset: 100 - progress * 100 }}
            />
          </svg>
          <span className="nav__now-i">{SCENE_COUNTERS[active]}</span>
          <span className="nav__now-label">
            <span key={active} className="nav__now-t">
              {SCENE_LABELS[active]}
            </span>
          </span>
        </button>

        <div className="nav__right">
          <Link className="nav__link" href="/registo">
            ENTRAR
          </Link>
          <button
            type="button"
            className="nav__hub"
            aria-label="Abrir mapa das cenas"
            aria-expanded={mapOpen}
            onClick={openMap}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              {[
                [12, 5.6],
                [17.54, 8.8],
                [17.54, 15.2],
                [12, 18.4],
                [6.46, 15.2],
                [6.46, 8.8],
              ].map(([cx, cy], index) => (
                <circle key={index} cx={cx} cy={cy} r="1.5" />
              ))}
            </svg>
          </button>
        </div>
      </nav>
    </header>
  );
}
