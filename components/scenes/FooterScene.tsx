"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useGSAP } from "@gsap/react";
import { gsap } from "@/lib/gsap";
import { initReveals } from "@/lib/reveals";
import type { FooterContent } from "@/content/schema";
import { HUB_LOGO_SVG, scopeHubLogoSvg } from "@/components/landing/hub-logo-markup";
import { Scene, useSceneRuntime } from "./Scene";
import { ScrollHint } from "./ScrollHint";
import { useSceneManager } from "./SceneManager";

export function FooterScene({ content }: { content: FooterContent }) {
  return (
    <Scene id="footer">
      <FooterContentBlock content={content} />
    </Scene>
  );
}

function FooterContentBlock({ content }: { content: FooterContent }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const wordmarkRef = useRef<HTMLDivElement>(null);
  const wordmarkInnerRef = useRef<HTMLSpanElement>(null);
  const { enterCount, scroller } = useSceneRuntime();
  const { go } = useSceneManager();
  const wordmarkId = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const wordmarkLogo = useMemo(
    () => scopeHubLogoSvg(HUB_LOGO_SVG, `footer-${wordmarkId}-`),
    [wordmarkId],
  );

  useGSAP(
    () => {
      if (!enterCount || !rootRef.current) return;
      return initReveals(rootRef.current, scroller);
    },
    { scope: rootRef, dependencies: [enterCount, scroller] },
  );

  useEffect(() => {
    const root = wordmarkRef.current;
    const inner = wordmarkInnerRef.current;
    if (!root || !inner) return;
    let frame = 0;
    let lastWidth = 0;
    const fit = () => {
      const width = root.clientWidth;
      if (width === lastWidth) return;
      lastWidth = width;
      root.style.setProperty("--fit", "100px");
      const natural = inner.getBoundingClientRect().width;
      if (!natural) return;
      const base = root.parentElement?.querySelector<HTMLElement>(".footer-base");
      const gutter = base ? parseFloat(getComputedStyle(base).paddingLeft) : 0;
      root.style.setProperty(
        "--fit",
        `${((width - 2 * gutter) / natural) * 100}px`,
      );
    };
    const schedule = () => {
      if (frame) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(fit);
    };
    schedule();
    const observer = new ResizeObserver(schedule);
    observer.observe(root);
    return () => {
      observer.disconnect();
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);


  return (
    <div className="footer-scene" ref={rootRef}>
      <section className="footer-a part">
        <ScrollHint label="Scroll" />
        <div className="footer-a__dots" aria-hidden="true" />
        <div className="footer-a__inner">
          <h2
            id="footer-title"
            data-scene-title
            tabIndex={-1}
            className="footer-a__headline"
            data-reveal="lines"
          >
            <span>{content.headline[0]}</span>
            <span>{content.headline[1]}</span>
          </h2>

          <div className="footer-a__cta" data-reveal="rise">
            <MagneticCta label={content.cta.label} href={content.cta.href} />
          </div>

          <div className="footer-a__columns">
            {content.columns.map((column, columnIndex) => (
              <div
                className="footer-column"
                key={`${column.title}-${columnIndex}`}
                data-reveal="rise"
              >
                <p className="footer-column__title">{column.title}</p>
                <ul>
                  {column.links.map((link, linkIndex) => (
                    <li key={`${link.label}-${linkIndex}`}>
                      <Link href={link.href} className="footer-column__link">
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="footer-b part">
        <div
          ref={wordmarkRef}
          className="footer-wordmark"
          data-reveal="rise"
        >
          <span className="sr-only">Arsenal</span>
          <span ref={wordmarkInnerRef} className="footer-wordmark__inner">
            <span className="footer-wordmark__mark-wrap" aria-hidden="true">
              <span
                className="footer-wordmark__mark-full"
                dangerouslySetInnerHTML={{ __html: wordmarkLogo }}
              />
            </span>
            <span className="footer-wordmark__text-wrap" aria-hidden="true">
              <span className="footer-wordmark__text">RSENAL</span>
            </span>
          </span>
        </div>

        <div className="footer-base">
          <p className="footer-base__legal">{content.legal}</p>
          <FooterClock timezone={content.timezone} />
          <button
            type="button"
            className="footer-base__back"
            onClick={(event) => {
              const rect = event.currentTarget.getBoundingClientRect();
              go("hero", {
                origin: {
                  x: rect.left + rect.width / 2,
                  y: rect.top + rect.height / 2,
                },
                source: "nav",
              });
            }}
          >
            Voltar ao início
          </button>
        </div>
      </section>
    </div>
  );
}

function FooterClock({ timezone }: { timezone: string }) {
  const [clock, setClock] = useState("");

  useEffect(() => {
    const format = new Intl.DateTimeFormat("pt-PT", {
      timeZone: timezone,
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const update = () => setClock(format.format(new Date()));
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [timezone]);

  return (
    <p className="footer-base__clock" aria-live="off">
      {clock || "--:--:--"}
    </p>
  );
}

function MagneticCta({ label, href }: { label: string; href: string }) {
  const rootRef = useRef<HTMLAnchorElement>(null);
  const arrowRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    const arrow = arrowRef.current;
    if (!root || !arrow) return;
    if (
      window.matchMedia("(pointer: coarse)").matches ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return;
    }

    const moveX = gsap.quickTo(root, "x", { duration: 0.5, ease: "power3.out" });
    const moveY = gsap.quickTo(root, "y", { duration: 0.5, ease: "power3.out" });
    const arrowX = gsap.quickTo(arrow, "x", { duration: 0.5, ease: "power3.out" });
    const arrowY = gsap.quickTo(arrow, "y", { duration: 0.5, ease: "power3.out" });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = root.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const distance = Math.hypot(event.clientX - centerX, event.clientY - centerY);
      if (distance > 160) {
        moveX(0);
        moveY(0);
        arrowX(0);
        arrowY(0);
        return;
      }
      const x = Math.max(-28, Math.min(28, (event.clientX - centerX) * 0.22));
      const y = Math.max(-28, Math.min(28, (event.clientY - centerY) * 0.22));
      moveX(x);
      moveY(y);
      arrowX(x * 0.4);
      arrowY(y * 0.4);
    };

    const onLeave = () => {
      gsap.to(root, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" });
      gsap.to(arrow, { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.5)" });
    };

    root.addEventListener("pointermove", onMove);
    root.addEventListener("pointerleave", onLeave);
    return () => {
      root.removeEventListener("pointermove", onMove);
      root.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <div className="footer-magnetic-wrap">
      <Link
        ref={rootRef}
        href={href}
        className="footer-magnetic"
        aria-label={label}
      >
        <svg ref={arrowRef} viewBox="0 0 24 24" aria-hidden="true">
          <path d="M5 12h14M13 6l6 6-6 6" />
        </svg>
      </Link>
      <span className="footer-magnetic__label">{label}</span>
    </div>
  );
}
