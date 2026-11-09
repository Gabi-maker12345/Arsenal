import { gsap } from "@/lib/gsap";
import { DrawSVGPlugin } from "gsap/DrawSVGPlugin";
import { REDUCED_MOTION_QUERY } from "@/lib/motion";

gsap.registerPlugin(DrawSVGPlugin);

/** Todos os valores afináveis da animação "Núcleo → Hastes → Nós → Relé". */
export const HUB_CFG = {
  beat: 6,
  clickDeg: 60,
  clickDur: 1.2,
  ease: "back.inOut(1.4)",
  hudTicksSec: 90,
  hudArcsSec: 55,
  parallaxAmp: 14,
  auraRest: 0.12,
  hudTicksOp: 0.3,
  hudArcOp: 0.4,
  relayStart: 2.1,
  relayStep: 0.45,
  introFallback: 10.5,
} as const;

const U = { x: 0.7995, y: -0.6007 };
const NODE_RADIUS = 266;
const CENTER = 500;
const COARSE_QUERY = "(pointer: coarse)";

export type HubController = {
  destroy(): void;
  setActive: (active: boolean) => void;
};

type HubDebug = {
  seekIntro: (seconds: number) => void;
  seekBeat: (seconds: number) => void;
  reset: () => void;
};

declare global {
  interface Window {
    __hub?: HubDebug;
  }
}

export function createHubLogoAnimation(
  svg: SVGSVGElement,
  options: {
    debugGlobal?: boolean;
    onIntroComplete?: () => void;
    skipIntro?: boolean;
  } = {},
): HubController {
  const stage = svg.closest<HTMLElement>("[data-hub-stage]");
  if (!stage) return { destroy() {}, setActive() {} };

  const q = <T extends Element = SVGElement>(selector: string) =>
    svg.querySelector<T>(selector);
  const qa = <T extends Element = SVGElement>(selector: string) =>
    gsap.utils.toArray<T>(selector, svg);

  const ring = q<SVGGElement>(".hub-ring");
  const inner = q<SVGPolygonElement>(".hub-inner");
  const letter = q<SVGGElement>(".hub-A");
  const aura = q<SVGCircleElement>(".hub-aura");
  const aTop = q<SVGPathElement>(".hub-a-top");
  const aBody = q<SVGPathElement>(".hub-a-body");
  const shardBL = q<SVGPathElement>(".hub-a-shard-bl");
  const shardTR = q<SVGPathElement>(".hub-a-shard-tr");
  const seam = q<SVGLineElement>(".hub-seam-light");
  const hudTicks = q<SVGCircleElement>(".hub-hud-ticks");
  const hudArcs = q<SVGGElement>(".hub-hud-arcs");
  const hudArcPaths = qa<SVGPathElement>(".hub-hud-arc");
  const edges = qa<SVGLineElement>(".hub-edge");
  const spokes = qa<SVGRectElement>(".hub-spoke");
  const spokeLights = qa<SVGRectElement>(".hub-spoke-light");
  const nodeRots = qa<SVGGElement>(".hub-node-rot");
  const nodePops = qa<SVGGElement>(".hub-node-pop");
  const nodeArcs = qa<SVGPathElement>(".hub-node-arc");
  const grooves = qa<SVGLineElement>(".hub-groove-light");
  const stris = qa<SVGPathElement>(".hub-stri");
  const ripples = qa<SVGPolygonElement>(".hub-ripple");
  const sparks = qa<SVGCircleElement>(".hub-spark");
  const depths = qa<SVGGElement>(".hub-depth");

  if (
    !ring ||
    !inner ||
    !letter ||
    !aura ||
    !aTop ||
    !aBody ||
    !shardBL ||
    !shardTR ||
    !seam ||
    !hudTicks ||
    !hudArcs
  ) {
    return { destroy() {}, setActive() {} };
  }

  const hero = stage.closest<HTMLElement>("section") ?? stage.parentElement ?? stage;
  const mm = gsap.matchMedia();

  let intro: gsap.core.Timeline | null = null;
  let idle: gsap.core.Timeline | null = null;
  let phase: "intro" | "idle" = "intro";
  let setActiveImpl: (active: boolean) => void = () => {};
  let visible = true;
  let coarseMode = false;
  let sparkCursor = 0;
  let lastBurst = 0;
  let destroyed = false;
  let debug: HubDebug | null = null;
  let hudTweens: gsap.core.Tween[] = [];

  const emit = (node: number, amount: number) => {
    const count = coarseMode ? Math.max(1, Math.ceil(amount / 2)) : amount;
    const angle = ((-90 + 60 * node) * Math.PI) / 180;
    const x = CENTER + NODE_RADIUS * Math.cos(angle);
    const y = CENTER + NODE_RADIUS * Math.sin(angle);

    for (let i = 0; i < count; i += 1) {
      const spark = sparks[sparkCursor % sparks.length];
      sparkCursor += 1;
      const scatter = angle + gsap.utils.random(-0.45, 0.45);
      const distance = gsap.utils.random(48, 110);

      gsap.killTweensOf(spark);
      gsap.fromTo(
        spark,
        {
          attr: { cx: x, cy: y, r: gsap.utils.random(1.4, 2.8) },
          opacity: 0.95,
        },
        {
          attr: {
            cx: x + Math.cos(scatter) * distance,
            cy: y + Math.sin(scatter) * distance,
            r: 0,
          },
          opacity: 0,
          duration: gsap.utils.random(0.7, 1.1),
          ease: "power2.out",
        },
      );
    }
  };

  const burst = (amount: number) => {
    const count = coarseMode ? Math.max(1, Math.ceil(amount / 2)) : amount;
    for (let i = 0; i < count; i += 1) {
      const spark = sparks[sparkCursor % sparks.length];
      sparkCursor += 1;
      const angle = gsap.utils.random(0, Math.PI * 2);
      const distance = gsap.utils.random(60, 160);

      gsap.killTweensOf(spark);
      gsap.fromTo(
        spark,
        { attr: { cx: CENTER, cy: CENTER, r: 2.4 }, opacity: 0.9 },
        {
          attr: {
            cx: CENTER + Math.cos(angle) * distance,
            cy: CENTER + Math.sin(angle) * distance,
            r: 0,
          },
          opacity: 0,
          duration: gsap.utils.random(0.7, 1.1),
          ease: "power2.out",
        },
      );
    }
  };

  const setup = (context: gsap.Context) => {
    const conditions = context.conditions ?? {};
    const reduce = conditions.reduce === true;
    const coarse = conditions.coarse === true;

    const setOrigins = () => {
      gsap.set([ring, inner, letter, hudTicks, hudArcs], {
        svgOrigin: "500 500",
      });
      gsap.set(ripples, { svgOrigin: "500 500", opacity: 0 });
      gsap.set([...spokes, ...spokeLights], {
        transformOrigin: "0% 50%",
      });
      gsap.set([...nodePops, ...nodeRots], {
        transformOrigin: "50% 50%",
      });
    };

    const setFinal = () => {
      gsap.set(stris, { opacity: 1 });
      gsap.set(inner, {
        drawSVG: "0% 100%",
        rotation: 0,
        scale: 1,
      });
      gsap.set(spokes, { scaleX: 1 });
      gsap.set(nodePops, { scale: 1 });
      gsap.set(edges, { drawSVG: "0% 100%" });
      gsap.set([aTop, aBody, shardBL, shardTR], {
        x: 0,
        y: 0,
        opacity: 1,
      });
      gsap.set(letter, { scale: 1, rotation: 0 });
      gsap.set(ring, { rotation: 0 });
      gsap.set(nodeRots, { rotation: 0 });
      gsap.set(aura, { opacity: HUB_CFG.auraRest });
      gsap.set(hudTicks, { opacity: HUB_CFG.hudTicksOp, rotation: 0 });
      gsap.set(hudArcs, { rotation: 0 });
      gsap.set(hudArcPaths, { opacity: HUB_CFG.hudArcOp });
      gsap.set(ripples, { opacity: 0, scale: 0.45 });
      gsap.set(grooves, { opacity: 0 });
      gsap.set(spokeLights, { opacity: 0, scaleX: 0 });
      gsap.set(nodeArcs, { opacity: 0 });
      gsap.set(seam, { opacity: 0 });
      gsap.set(sparks, { opacity: 0 });
    };

    setOrigins();

    if (reduce) {
      coarseMode = coarse;
      setFinal();
      stage.dataset.ready = "true";
      options.onIntroComplete?.();
      return;
    }

    coarseMode = coarse;
    if (coarse) svg.classList.add("hub-lowfx");

    gsap.set(stris, { opacity: 0 });
    gsap.set(inner, { drawSVG: "0% 0%", rotation: -90, scale: 1 });
    gsap.set(spokes, { scaleX: 0 });
    gsap.set(nodePops, { scale: 0 });
    gsap.set(edges, { drawSVG: "0% 0%" });
    gsap.set([aTop, aBody, shardBL, shardTR], { opacity: 0 });
    gsap.set(aTop, { x: -U.x * 60, y: -U.y * 60 });
    gsap.set(aBody, { x: U.x * 40, y: U.y * 40 });
    gsap.set(shardBL, { x: -U.x * 110, y: -U.y * 110 });
    gsap.set(shardTR, { x: U.x * 110, y: U.y * 110 });
    gsap.set(aura, { opacity: 0 });
    gsap.set(hudTicks, { opacity: 0 });
    gsap.set(hudArcPaths, { opacity: 0 });
    gsap.set(ripples, { opacity: 0, scale: 0.45 });
    gsap.set(grooves, { opacity: 0 });
    gsap.set(spokeLights, { opacity: 0, scaleX: 0 });
    gsap.set(nodeArcs, { opacity: 0 });
    gsap.set(seam, { opacity: 0 });
    gsap.set(sparks, { opacity: 0 });
    gsap.set(letter, { scale: 1 });

    stage.dataset.ready = "true";

    hudTweens = [
      gsap.to(hudTicks, {
        rotation: -360,
        duration: HUB_CFG.hudTicksSec,
        ease: "none",
        repeat: -1,
        svgOrigin: "500 500",
      }),
      gsap.to(hudArcs, {
        rotation: 360,
        duration: HUB_CFG.hudArcsSec,
        ease: "none",
        repeat: -1,
        svgOrigin: "500 500",
      }),
    ];

    const beat = (k = 1) => {
      const tl = gsap.timeline({ defaults: { immediateRender: false } });
      const bk = Math.max(1, Math.round(2 * k));

      tl.to(
        letter,
        { scale: 1 + 0.035 * k, duration: 0.16, ease: "power2.out" },
        0,
      )
        .to(
          letter,
          { scale: 1, duration: 0.7, ease: "elastic.out(1, 0.45)" },
          0.16,
        )
        .fromTo(seam, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.02)
        .to(seam, { opacity: 0, duration: 0.9, ease: "power2.in" }, 0.12)
        .to(
          aTop,
          {
            x: -U.x * 5 * k,
            y: -U.y * 5 * k,
            duration: 0.14,
            ease: "power3.out",
          },
          0,
        )
        .to(
          aBody,
          {
            x: U.x * 3 * k,
            y: U.y * 3 * k,
            duration: 0.14,
            ease: "power3.out",
          },
          0,
        )
        .to(
          shardBL,
          {
            x: -U.x * 12 * k,
            y: -U.y * 12 * k,
            duration: 0.16,
            ease: "power3.out",
          },
          0,
        )
        .to(
          shardTR,
          {
            x: U.x * 12 * k,
            y: U.y * 12 * k,
            duration: 0.16,
            ease: "power3.out",
          },
          0,
        )
        .to(
          [aTop, aBody],
          { x: 0, y: 0, duration: 0.9, ease: "elastic.out(1, 0.4)" },
          0.14,
        )
        .to(
          [shardBL, shardTR],
          { x: 0, y: 0, duration: 0.8, ease: "back.out(2.2)" },
          0.16,
        )
        .to(
          aura,
          { opacity: 0.3 * k, duration: 0.25, ease: "power2.out" },
          0,
        )
        .to(
          aura,
          { opacity: HUB_CFG.auraRest, duration: 2.2, ease: "power2.out" },
          0.25,
        );

      tl.fromTo(
        ripples[0],
        { scale: 0.45, opacity: 0.55 * k },
        { scale: 1.5, opacity: 0, duration: 1.5, ease: "power2.out" },
        0.06,
      ).fromTo(
        ripples[1],
        { scale: 0.45, opacity: 0.28 * k },
        { scale: 1.5, opacity: 0, duration: 1.5, ease: "power2.out" },
        0.3,
      );
      if (k > 1) {
        tl.fromTo(
          ripples[2],
          { scale: 0.45, opacity: 0.18 },
          { scale: 1.5, opacity: 0, duration: 1.5, ease: "power2.out" },
          0.55,
        );
      }

      spokeLights.forEach((element, index) => {
        const time = 0.12 + 0.05 * index;
        tl.fromTo(
          element,
          { opacity: 1, scaleX: 0 },
          { scaleX: 1, duration: 0.38, ease: "power3.out" },
          time,
        ).to(
          element,
          { opacity: 0, duration: 0.45, ease: "power1.in" },
          time + 0.3,
        );
      });

      nodePops.forEach((element, index) => {
        const time = 0.4 + 0.05 * index;
        tl.to(
          element,
          { scale: 1 + 0.14 * k, duration: 0.14, ease: "power2.out" },
          time,
        )
          .to(
            element,
            { scale: 1, duration: 0.55, ease: "elastic.out(1, 0.5)" },
            time + 0.14,
          )
          .fromTo(
            nodeArcs[index],
            { opacity: 0 },
            { opacity: 1, duration: 0.12 },
            time,
          )
          .to(
            nodeArcs[index],
            { opacity: 0, duration: 0.8, ease: "power2.in" },
            time + 0.22,
          )
          .call(emit, [index, bk], time);
      });

      tl.fromTo(
        stris,
        { opacity: 1 },
        { opacity: 0, duration: 0.25, stagger: 0.03 },
        0.72,
      ).fromTo(
        stris,
        { opacity: 0 },
        {
          opacity: 1,
          duration: 0.5,
          ease: "power2.out",
          stagger: 0.06,
        },
        1.78,
      );

      tl.fromTo(
        ring,
        { rotation: 0 },
        {
          rotation: HUB_CFG.clickDeg,
          duration: HUB_CFG.clickDur,
          ease: HUB_CFG.ease,
        },
        0.8,
      )
        .fromTo(
          nodeRots,
          { rotation: 0 },
          {
            rotation: -HUB_CFG.clickDeg,
            duration: HUB_CFG.clickDur,
            ease: HUB_CFG.ease,
          },
          0.8,
        )
        .fromTo(
          inner,
          { rotation: 0 },
          {
            rotation: -HUB_CFG.clickDeg,
            duration: HUB_CFG.clickDur - 0.05,
            ease: "power3.inOut",
          },
          0.86,
        );

      const relay = (edge: number, time: number, opacity: number) => {
        const groove = grooves[edge];
        const nextNode = (edge + 1) % 6;

        tl.fromTo(
          groove,
          { opacity, drawSVG: "0% 0%" },
          { drawSVG: "0% 100%", duration: 0.3, ease: "power2.in" },
          time,
        )
          .to(
            groove,
            { drawSVG: "100% 100%", duration: 0.3, ease: "power2.out" },
            time + 0.3,
          )
          .set(groove, { opacity: 0 }, time + 0.62)
          .to(
            nodePops[nextNode],
            { scale: 1 + 0.1 * k, duration: 0.1, ease: "power2.out" },
            time + 0.3,
          )
          .to(
            nodePops[nextNode],
            {
              scale: 1,
              duration: 0.45,
              ease: "elastic.out(1, 0.5)",
            },
            time + 0.4,
          )
          .fromTo(
            nodeArcs[nextNode],
            { opacity: 0 },
            { opacity, duration: 0.08 },
            time + 0.3,
          )
          .to(
            nodeArcs[nextNode],
            { opacity: 0, duration: 0.5, ease: "power2.in" },
            time + 0.38,
          )
          .call(emit, [nextNode, 1], time + 0.3);
      };

      for (let i = 0; i < 6; i += 1) {
        const time = HUB_CFG.relayStart + HUB_CFG.relayStep * i;
        relay(i, time, 1);
        relay((i + 3) % 6, time, 0.55);
      }

      tl.set({}, {}, HUB_CFG.beat);
      return tl;
    };

    if (options.skipIntro) {
      // O mapa é navegação: fica completo e estável. O beat escondia as
      // estrias e os nós em metade do ciclo, deixando a logo "partida".
      setFinal();
      phase = "idle";
      options.onIntroComplete?.();
    } else {
    const introTl = gsap.timeline({
      defaults: { immediateRender: false },
      onComplete: () => {
        phase = "idle";
        if (visible) idle?.play(0);
        options.onIntroComplete?.();
      },
    });

    introTl
      .to(
        [shardBL, shardTR],
        { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "expo.out" },
        0,
      )
      .to(
        [aTop, aBody],
        { x: 0, y: 0, opacity: 1, duration: 0.6, ease: "power4.out" },
        0.05,
      )
      .fromTo(seam, { opacity: 0 }, { opacity: 1, duration: 0.08 }, 0.3)
      .to(seam, { opacity: 0.3, duration: 0.5 }, 0.38)
      .to(aura, { opacity: 0.25, duration: 0.9 }, 0.3)
      .fromTo(
        inner,
        { drawSVG: "0% 0%", rotation: -90 },
        {
          drawSVG: "0% 100%",
          rotation: 0,
          duration: 0.9,
          ease: "power3.inOut",
        },
        0.45,
      )
      .fromTo(
        inner,
        { scale: 1.04 },
        { scale: 1, duration: 0.4, ease: "back.out(3)" },
        1.3,
      )
      .to(
        spokes,
        { scaleX: 1, duration: 0.55, ease: "power4.out", stagger: 0.07 },
        1.15,
      )
      .set(spokeLights, { opacity: 1 }, 1.55)
      .to(
        spokeLights,
        { scaleX: 1, duration: 0.4, ease: "power3.out", stagger: 0.03 },
        1.55,
      )
      .to(
        spokeLights,
        { opacity: 0, duration: 0.4, ease: "power1.in" },
        1.75,
      );

    nodePops.forEach((element, index) => {
      const time = 1.55 + 0.07 * index;
      introTl
        .to(
          element,
          { scale: 1, duration: 0.5, ease: "back.out(2.2)" },
          time,
        )
        .call(emit, [index, 2], time);
    });

    introTl
      .to(
        edges,
        {
          drawSVG: "0% 100%",
          duration: 0.5,
          ease: "power2.inOut",
          stagger: 0.12,
        },
        1.95,
      )
      .to(
        stris,
        { opacity: 1, duration: 0.5, ease: "power2.out", stagger: 0.08 },
        2.55,
      )
      .to(hudTicks, { opacity: HUB_CFG.hudTicksOp, duration: 1.2 }, 3)
      .to(hudArcPaths, { opacity: HUB_CFG.hudArcOp, duration: 1.2 }, 3)
      .add(beat(1.5), 3.1);

    intro = introTl;
    idle = gsap.timeline({ repeat: -1, paused: true }).add(beat(1));
    phase = "intro";
    intro.play(0);
    }

    const canDebug =
      options.debugGlobal !== false &&
      (process.env.NODE_ENV !== "production" ||
        (typeof window !== "undefined" &&
          window.location.search.includes("hubdebug")));

    if (canDebug) {
      debug = {
        seekIntro: (seconds) => {
          intro?.pause(seconds);
          idle?.pause();
          phase = "intro";
        },
        seekBeat: (seconds) => {
          intro?.pause();
          idle?.pause(seconds);
          phase = "idle";
        },
        reset: () => {
          intro?.pause();
          idle?.pause();
          hudTweens.forEach((tween) => tween.pause());
          setFinal();
          phase = "idle";
        },
      };
      window.__hub = debug;
    }

    const quickX = new Map<SVGGElement, (value: number) => void>();
    const quickY = new Map<SVGGElement, (value: number) => void>();
    depths.forEach((element) => {
      quickX.set(
        element,
        gsap.quickTo(element, "x", { duration: 0.9, ease: "power3.out" }),
      );
      quickY.set(
        element,
        gsap.quickTo(element, "y", { duration: 0.9, ease: "power3.out" }),
      );
    });

    const onPointerMove = (event: PointerEvent) => {
      if (event.pointerType !== "mouse") return;
      const rect = hero.getBoundingClientRect();
      const nx = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((event.clientY - rect.top) / rect.height) * 2 - 1;

      depths.forEach((element) => {
        const depth = Number(element.dataset.depth ?? 0);
        quickX.get(element)?.(nx * HUB_CFG.parallaxAmp * depth);
        quickY.get(element)?.(ny * HUB_CFG.parallaxAmp * depth);
      });
    };

    const onEnter = () => {
      if (idle) gsap.to(idle, { timeScale: 1.35, duration: 0.5 });
    };

    const onLeave = () => {
      if (idle) gsap.to(idle, { timeScale: 1, duration: 0.5 });
    };

    const onPointerUp = () => {
      const now = performance.now();
      if (now - lastBurst < 1200) return;
      lastBurst = now;
      burst(8);
      gsap.fromTo(
        ripples[2],
        { scale: 0.45, opacity: 0.4 },
        { scale: 1.5, opacity: 0, duration: 1.2, ease: "power2.out" },
      );
    };

    hero.addEventListener("pointermove", onPointerMove);
    stage.addEventListener("pointerenter", onEnter);
    stage.addEventListener("pointerleave", onLeave);
    stage.addEventListener("pointerup", onPointerUp);

    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        if (visible) {
          if (phase === "intro") intro?.resume();
          else idle?.resume();
          hudTweens.forEach((tween) => tween.resume());
        } else {
          intro?.pause();
          idle?.pause();
          hudTweens.forEach((tween) => tween.pause());
        }
      },
      { threshold: 0.01 },
    );
    observer.observe(stage);

    return () => {
      hero.removeEventListener("pointermove", onPointerMove);
      stage.removeEventListener("pointerenter", onEnter);
      stage.removeEventListener("pointerleave", onLeave);
      stage.removeEventListener("pointerup", onPointerUp);
      observer.disconnect();
      intro?.kill();
      idle?.kill();
      hudTweens.forEach((tween) => tween.kill());
      hudTweens = [];
      depths.forEach((element) => gsap.killTweensOf(element));
      if (coarse) svg.classList.remove("hub-lowfx");
      if (debug && window.__hub === debug) {
        delete window.__hub;
      }
      intro = null;
      idle = null;
      debug = null;
    };
  };

  mm.add(
    { all: "all", reduce: REDUCED_MOTION_QUERY, coarse: COARSE_QUERY },
    setup,
  );

  return {
    destroy() {
      if (destroyed) return;
      destroyed = true;
      setActiveImpl = () => {};
      mm.revert();
      gsap.killTweensOf(sparks);
    },
    setActive(active: boolean) {
      setActiveImpl(active);
    },
  };
}
