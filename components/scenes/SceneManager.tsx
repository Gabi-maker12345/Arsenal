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
  charge: number;
  chargeTarget: SceneId | null;
}

const SceneContext = createContext<SceneManagerValue | null>(null);
const SceneProgressContext = createContext<SceneProgressValue | null>(null);

const BASE_TITLE = "Arsenal Gaming Hub — A tua arena, as tuas regras";

function hexClip(cx: number, cy: number, r: number) {
  return `polygon(${[0, 1, 2, 3, 4, 5]
    .map((k) => {
      const angle = ((-90 + 60 * k) * Math.PI) / 180;
      return `${(cx + r * Math.cos(angle)).toFixed(1)}px ${(cy + r * Math.sin(angle)).toFixed(1)}px`;
    })
    .join(",")})`;
}

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
  const frontRef = useRef<SVGPolygonElement>(null);
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
        target.style.willChange = "auto";
      }
      if (frontRef.current) gsap.set(frontRef.current, { autoAlpha: 0 });
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
      if (frontRef.current) gsap.set(frontRef.current, { autoAlpha: 0 });

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
    const W = window.innerWidth;
    const H = window.innerHeight;
    const D = Math.max(
      Math.hypot(origin.x, origin.y),
      Math.hypot(W - origin.x, origin.y),
      Math.hypot(origin.x, H - origin.y),
      Math.hypot(W - origin.x, H - origin.y),
    );
    const rMax = D * 1.16;
    // Abrir já com uma área que inclua o visual-chave da cena de destino.
    // Sem isto, o portal crescia a partir do marcador e o ecrã ficava escuro
    // enquanto o centro da cena ainda estava fora do recorte (N8).
    const startR = Math.min(rMax * 0.42, 520);
    const state = { r: startR };
    const front = frontRef.current;

    if (targetContent) gsap.set(targetContent, { autoAlpha: 1 });
    target.dispatchEvent(new CustomEvent(SCENE_VISUAL_EVENT));
    if (currentContent) {
      gsap.to(currentContent, {
        yPercent: -6,
        autoAlpha: 0,
        duration: MOTION.ui,
        ease: MOTION.ease.exit,
        overwrite: true,
      });
    }
    if (front) gsap.set(front, { autoAlpha: 1 });
    target.style.clipPath = hexClip(origin.x, origin.y, startR);
    target.style.willChange = "clip-path";

    const timeline = gsap.timeline({
      onComplete: () => finish(id),
    });

    timeline.to(state, {
      r: rMax,
      duration: MOTION.portal,
      ease: MOTION.ease.io,
      onUpdate: () => {
        target.style.clipPath = hexClip(origin.x, origin.y, state.r);
        if (front) {
          front.setAttribute(
            "transform",
            `translate(${origin.x} ${origin.y}) scale(${state.r / 100})`,
          );
        }
      },
    });

    timeline.call(
      () => {
        target.dispatchEvent(new CustomEvent(SCENE_ENTER_EVENT));
        ScrollTrigger.refresh();
      },
      undefined,
      0.55,
    );

    timeline.to(
      front,
      { autoAlpha: 0, duration: 0.3, ease: "power1.out" },
      MOTION.portal * 0.72,
    );

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
    () => ({ progress, charge, chargeTarget }),
    [progress, charge, chargeTarget],
  );

  return (
    <SceneContext.Provider value={managerValue}>
      <SceneProgressContext.Provider value={progressValue}>
        {children}
        <div className="portal-front" aria-hidden="true">
          <svg width="100%" height="100%">
            <polygon
              ref={frontRef}
              points="0,-100 86.6,-50 86.6,50 0,100 -86.6,50 -86.6,-50"
            />
          </svg>
        </div>
        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>
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
