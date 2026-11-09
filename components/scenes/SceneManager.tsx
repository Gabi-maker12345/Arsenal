"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { MOTION, REDUCED_MOTION_QUERY } from "@/lib/motion";
import {
  NODE_MAP,
  SCENE_ENTER_EVENT,
  SCENE_VISUAL_EVENT,
  SCENE_IDS,
  SCENE_LABELS,
  sceneFromHash,
  nextScene,
  prevScene,
  type SceneId,
} from "@/lib/scenes";

type Origin = { x: number; y: number };

export interface SceneGoOptions {
  origin?: Origin;
  source?: "node" | "rail" | "nav" | "overscroll" | "keyboard" | "hash" | "pop" | "map";
  replace?: boolean;
}

interface SceneManagerValue {
  active: SceneId;
  incoming: SceneId | null;
  busy: boolean;
  mapOpen: boolean;
  go: (id: SceneId, options?: SceneGoOptions) => void;
  next: () => void;
  prev: () => void;
  openMap: () => void;
  closeMap: () => void;
  updateProgress: (id: SceneId, progress: number) => void;
  overscroll: (
    direction: "next" | "prev",
    amount: number,
    kind?: "wheel" | "touch",
  ) => void;
}

interface SceneProgressValue {
  progress: number;
}

interface SceneChargeValue {
  charge: number;
  chargeTarget: SceneId | null;
}

const SceneContext = createContext<SceneManagerValue | null>(null);
const SceneProgressContext = createContext<SceneProgressValue | null>(null);
const SceneChargeContext = createContext<SceneChargeValue | null>(null);

const BASE_TITLE = "Arsenal Gaming Hub — A tua arena, as tuas regras";

function getScroller(id: SceneId) {
  const scene = document.getElementById(id);
  return scene?.querySelector<HTMLElement>(".scene__scroller") ?? null;
}

function atEnd(element: HTMLElement | null) {
  return !element || element.scrollTop + element.clientHeight >= element.scrollHeight - 2;
}

function atStart(element: HTMLElement | null) {
  return !element || element.scrollTop <= 2;
}

export function SceneManagerProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState<SceneId>("hero");
  const [incoming, setIncoming] = useState<SceneId | null>(null);
  const [busy, setBusy] = useState(false);
  const [mapOpen, setMapOpen] = useState(false);
  const [announcement, setAnnouncement] = useState(SCENE_LABELS.hero);
  const [progress, setProgress] = useState(0);
  const [charge, setCharge] = useState(0);
  const [chargeTarget, setChargeTarget] = useState<SceneId | null>(null);

  const activeRef = useRef<SceneId>("hero");
  const busyRef = useRef(false);
  const mapOpenRef = useRef(false);
  const incomingRef = useRef<SceneId | null>(null);
  const pendingRef = useRef<{ id: SceneId; options: SceneGoOptions } | null>(null);
  const originRef = useRef<Origin | null>(null);
  const optionsRef = useRef<SceneGoOptions>({});
  const transitionModeRef = useRef<"portal" | "fade">("portal");
  const transitionRef = useRef<gsap.core.Timeline | null>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const coverSolidRef = useRef<HTMLDivElement>(null);
  const lastArrivalRef = useRef(0);
  const returnFocusRef = useRef<HTMLElement | null>(null);
  const chargeRef = useRef({ value: 0, direction: null as "next" | "prev" | null, timer: 0 });
  const goRef = useRef<(id: SceneId, options?: SceneGoOptions) => void>(() => {});
  const instantRef = useRef<(id: SceneId, replace?: boolean) => void>(() => {});

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    incomingRef.current = incoming;
  }, [incoming]);

  useEffect(() => {
    busyRef.current = busy;
  }, [busy]);

  useEffect(() => {
    mapOpenRef.current = mapOpen;
  }, [mapOpen]);

  const setSceneUrl = useCallback((id: SceneId, replace = false) => {
    const url = `#${id}`;
    if (replace) {
      window.history.replaceState(null, "", url);
    } else if (window.location.hash !== url) {
      window.history.pushState(null, "", url);
    }
    document.title = id === "hero" ? BASE_TITLE : `${SCENE_LABELS[id]} — Arsenal Gaming Hub`;
  }, []);

  const focusScene = useCallback((id: SceneId) => {
    if (document.querySelector(".loading")) return;
    const scene = document.getElementById(id);
    const title = scene?.querySelector<HTMLElement>("[data-scene-title]");
    title?.focus({ preventScroll: true });
  }, []);

  const finish = useCallback(
    (id: SceneId) => {
      const target = document.getElementById(id);
      const previous = document.getElementById(activeRef.current);
      const previousContent = previous?.querySelector<HTMLElement>(".scene__content");
      const options = optionsRef.current;

      if (target) {
        target.style.clipPath = "none";
        target.style.removeProperty("will-change");
        gsap.set(target, {
          clearProps: "opacity,visibility,transform",
        });
      }
      if (previousContent) {
        gsap.set(previousContent, { clearProps: "transform,opacity,visibility" });
      }

      setActive(id);
      activeRef.current = id;
      setIncoming(null);
      incomingRef.current = null;
      busyRef.current = false;
      setBusy(false);
      setProgress(0);
      transitionRef.current = null;

      setSceneUrl(id, options.replace);
      setAnnouncement(SCENE_LABELS[id]);
      lastArrivalRef.current = performance.now();
      window.setTimeout(() => focusScene(id), 60);

      const pending = pendingRef.current;
      pendingRef.current = null;
      if (pending) {
        queueMicrotask(() => goRef.current(pending.id, pending.options));
      }
    },
    [focusScene, setSceneUrl],
  );

  const instant = useCallback(
    (id: SceneId, replace = false) => {
      if (incomingRef.current) return;
      const target = document.getElementById(id);
      if (!target) return;

      transitionRef.current?.kill();
      transitionRef.current = null;
      pendingRef.current = null;
      busyRef.current = false;
      setBusy(false);
      setIncoming(null);
      incomingRef.current = null;
      setActive(id);
      activeRef.current = id;
      setMapOpen(false);
      mapOpenRef.current = false;
      setProgress(0);
      setCharge(0);
      setChargeTarget(null);

      const scroller = target.querySelector<HTMLElement>(".scene__scroller");
      if (scroller) scroller.scrollTop = 0;
      target.style.clipPath = "none";
      target.style.willChange = "auto";

      setSceneUrl(id, replace);
      setAnnouncement(SCENE_LABELS[id]);
      requestAnimationFrame(() => focusScene(id));
    },
    [focusScene, setSceneUrl],
  );

  useEffect(() => {
    instantRef.current = instant;
  }, [instant]);

  useEffect(() => {
    const id = sceneFromHash(window.location.hash);
    if (id && id !== activeRef.current) {
      instantRef.current(id, true);
    }

    const frame = window.requestAnimationFrame(() => {
      const element = document.getElementById(activeRef.current);
      element?.dispatchEvent(new CustomEvent(SCENE_ENTER_EVENT));
    });

    const onPopState = () => {
      const next = sceneFromHash(window.location.hash) ?? "hero";
      if (next !== activeRef.current) {
        goRef.current(next, {
          origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          source: "pop",
          replace: true,
        });
      }
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.cancelAnimationFrame(frame);
      window.removeEventListener("popstate", onPopState);
    };
  }, []);

  const go = useCallback((id: SceneId, options: SceneGoOptions = {}) => {
    if (!(SCENE_IDS as readonly string[]).includes(id)) return;
    if (id === activeRef.current) {
      setMapOpen(false);
      mapOpenRef.current = false;
      return;
    }
    if (busyRef.current || incomingRef.current) {
      pendingRef.current = { id, options };
      return;
    }

    const reduced = window.matchMedia(REDUCED_MOTION_QUERY).matches;
    optionsRef.current = options;
    originRef.current =
      options.origin ?? { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    transitionModeRef.current = reduced ? "fade" : "portal";
    busyRef.current = true;
    setBusy(true);
    setMapOpen(false);
    mapOpenRef.current = false;
    setCharge(0);
    setChargeTarget(null);
    chargeRef.current.value = 0;
    chargeRef.current.direction = null;
    setIncoming(id);
    incomingRef.current = id;
  }, []);

  useEffect(() => {
    goRef.current = go;
  }, [go]);

  const next = useCallback(() => {
    const target = nextScene(activeRef.current);
    if (target) {
      goRef.current(target, {
        origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        source: "nav",
      });
    }
  }, []);

  const prev = useCallback(() => {
    const target = prevScene(activeRef.current);
    if (target) {
      goRef.current(target, {
        origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
        source: "nav",
      });
    }
  }, []);

  const openMap = useCallback(() => {
    if (busyRef.current || incomingRef.current) return;
    returnFocusRef.current = document.activeElement as HTMLElement | null;
    setMapOpen(true);
    mapOpenRef.current = true;
  }, []);

  const closeMap = useCallback(() => {
    setMapOpen(false);
    mapOpenRef.current = false;
    requestAnimationFrame(() => returnFocusRef.current?.focus());
  }, []);

  const updateProgress = useCallback((id: SceneId, value: number) => {
    if (id === activeRef.current) {
      setProgress(Math.min(1, Math.max(0, value)));
    }
  }, []);

  const overscroll = useCallback(
    (
      direction: "next" | "prev",
      amount: number,
      kind: "wheel" | "touch" = "wheel",
    ) => {
      if (busyRef.current || mapOpenRef.current) return;
      if (performance.now() - lastArrivalRef.current < MOTION.cooldown) return;

      const target = direction === "next" ? nextScene(activeRef.current) : prevScene(activeRef.current);
      if (!target) return;

      const threshold = kind === "touch" ? MOTION.overscrollTouch : MOTION.overscrollWheel;
      const state = chargeRef.current;
      if (state.direction !== direction) {
        state.value = 0;
        state.direction = direction;
      }
      state.value += Math.abs(amount);
      const ratio = Math.min(1, state.value / threshold);
      setCharge(ratio);
      setChargeTarget(target);

      if (state.timer) window.clearTimeout(state.timer);
      state.timer = window.setTimeout(() => {
        state.value = 0;
        state.direction = null;
        setCharge(0);
        setChargeTarget(null);
      }, MOTION.overscrollDecay);

      if (ratio >= 1) {
        state.value = 0;
        state.direction = null;
        if (state.timer) window.clearTimeout(state.timer);
        setCharge(0);
        setChargeTarget(null);
        goRef.current(target, {
          origin: {
            x: window.innerWidth / 2,
            y: direction === "next" ? window.innerHeight : 0,
          },
          source: "overscroll",
        });
      }
    },
    [],
  );

  useEffect(() => {
    if (!incoming) return;
    const id = incoming;
    const target = document.getElementById(id);
    const currentId = activeRef.current;
    const current = document.getElementById(currentId);
    if (!target) {
      busyRef.current = false;
      incomingRef.current = null;
      queueMicrotask(() => {
        setBusy(false);
        setIncoming(null);
      });
      return;
    }

    const targetScroller = target.querySelector<HTMLElement>(".scene__scroller");
    if (targetScroller) targetScroller.scrollTop = 0;
    const targetContent = target.querySelector<HTMLElement>(".scene__content");
    const currentContent = current?.querySelector<HTMLElement>(".scene__content");
    const mode = transitionModeRef.current;

    if (mode === "fade") {
      if (targetContent) gsap.set(targetContent, { autoAlpha: 1 });
      target.dispatchEvent(new CustomEvent(SCENE_VISUAL_EVENT));
      let swapped = false;
      const timeline = gsap.timeline({
        onComplete: () => finish(id),
      });

      if (currentContent) {
        timeline.to(currentContent, {
          autoAlpha: 0,
          duration: 0.12,
          ease: "power2.out",
        });
      }

      timeline.add(() => {
        if (swapped) return;
        swapped = true;
        setActive(id);
        activeRef.current = id;
        gsap.set(target, { autoAlpha: 0 });
        gsap.set(targetContent, { autoAlpha: 1 });
        target.dispatchEvent(new CustomEvent(SCENE_ENTER_EVENT));
      });
      timeline.to(target, {
        autoAlpha: 1,
        duration: 0.13,
        ease: "power2.out",
      });

      transitionRef.current = timeline;
      return () => {
        timeline.kill();
      };
    }

    const origin = originRef.current ?? {
      x: window.innerWidth / 2,
      y: window.innerHeight / 2,
    };
    const cover = coverRef.current;
    const solid = coverSolidRef.current;

    if (targetContent) gsap.set(targetContent, { autoAlpha: 1 });
    target.dispatchEvent(new CustomEvent(SCENE_VISUAL_EVENT));

    // A cena de destino fica pronta por baixo do hexágono; não se anima a
    // opacidade/transform de uma cena full-screen (isso forçava rasterização
    // pesada em cada frame). O único elemento animado é a cobertura.
    gsap.set(target, { autoAlpha: 0 });

    if (!cover) {
      gsap.set(target, { autoAlpha: 1 });
      target.dispatchEvent(new CustomEvent(SCENE_ENTER_EVENT));
      const fallback = gsap.timeline({ onComplete: () => finish(id) });
      transitionRef.current = fallback;
      return () => fallback.kill();
    }

    cover.style.clipPath = "";
    gsap.set(cover, {
      autoAlpha: 1,
      scale: 0.16,
      transformOrigin: `${origin.x}px ${origin.y}px`,
      willChange: "transform, opacity",
    });
    target.style.clipPath = "none";
    if (solid) gsap.set(solid, { autoAlpha: 0 });

    const timeline = gsap.timeline({
      onComplete: () => finish(id),
    });

    timeline
      .to(cover, {
        scale: 2.8,
        duration: 0.38,
        ease: "power2.inOut",
      }, 0)
      .call(
        () => {
          setActive(id);
          activeRef.current = id;
          gsap.set(target, { autoAlpha: 1 });
          target.dispatchEvent(new CustomEvent(SCENE_ENTER_EVENT));
          ScrollTrigger.refresh();
        },
        undefined,
        0.38,
      )
      // O hexágono não se transforma em quadrado por clip-path. Uma segunda
      // camada full-screen entra em opacidade por cima dele: a passagem de
      // hexágono para cobertura total é um fade contínuo.
      .to(solid, {
        autoAlpha: 1,
        duration: 0.28,
        ease: "power2.inOut",
      }, 0.38)
      .set(cover, {
        autoAlpha: 0,
        scale: 1,
        willChange: "auto",
      }, 0.66)
      .to(solid, {
        autoAlpha: 0,
        duration: 0.55,
        ease: "power2.inOut",
      }, 0.78)
      .set(solid, { autoAlpha: 0, willChange: "auto" }, 1.33);

    transitionRef.current = timeline;

    return () => {
      timeline.kill();
    };
  }, [incoming, finish]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.matches("input, textarea, select") ||
          target.isContentEditable)
      ) {
        return;
      }

      if (mapOpenRef.current) {
        if (event.key === "Escape") {
          event.preventDefault();
          closeMap();
        }
        if (event.key.toLowerCase() === "m") {
          event.preventDefault();
          closeMap();
        }
        return;
      }

      if (event.key.toLowerCase() === "m") {
        event.preventDefault();
        openMap();
        return;
      }

      if (event.key === "Escape") return;

      if (/^[1-6]$/.test(event.key)) {
        event.preventDefault();
        goRef.current(NODE_MAP[Number(event.key) - 1], {
          origin: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
          source: "keyboard",
        });
        return;
      }

      const scroller = getScroller(activeRef.current);
      if (event.key === "ArrowRight" || event.key === "PageDown") {
        if (atEnd(scroller)) {
          event.preventDefault();
          next();
        }
      } else if (event.key === "ArrowLeft" || event.key === "PageUp") {
        if (atStart(scroller)) {
          event.preventDefault();
          prev();
        }
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [closeMap, next, openMap, prev]);

  const managerValue = useMemo<SceneManagerValue>(
    () => ({
      active,
      incoming,
      busy,
      mapOpen,
      go,
      next,
      prev,
      openMap,
      closeMap,
      updateProgress,
      overscroll,
    }),
    [
      active,
      incoming,
      busy,
      mapOpen,
      go,
      next,
      prev,
      openMap,
      closeMap,
      updateProgress,
      overscroll,
    ],
  );

  const progressValue = useMemo<SceneProgressValue>(
    () => ({ progress }),
    [progress],
  );
  const chargeValue = useMemo<SceneChargeValue>(
    () => ({ charge, chargeTarget }),
    [charge, chargeTarget],
  );

  return (
    <SceneContext.Provider value={managerValue}>
      <SceneProgressContext.Provider value={progressValue}>
        <SceneChargeContext.Provider value={chargeValue}>
        {children}
        <div ref={coverRef} className="scene-cover" aria-hidden="true">
          <span className="scene-cover__fill" />
        </div>
        <div ref={coverSolidRef} className="scene-cover__solid" aria-hidden="true" />
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
        </SceneChargeContext.Provider>
      </SceneProgressContext.Provider>
    </SceneContext.Provider>
  );
}

export function useSceneManager() {
  const context = useContext(SceneContext);
  if (!context) {
    throw new Error("useSceneManager deve ser usado dentro de SceneManagerProvider.");
  }
  return context;
}

export function useSceneProgress() {
  const context = useContext(SceneProgressContext);
  if (!context) {
    throw new Error("useSceneProgress deve ser usado dentro de SceneManagerProvider.");
  }
  return context;
}


export function useSceneCharge() {
  const context = useContext(SceneChargeContext);
  if (!context) {
    throw new Error("useSceneCharge deve ser usado dentro de SceneManagerProvider.");
  }
  return context;
}
