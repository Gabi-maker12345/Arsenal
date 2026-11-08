"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type TouchEvent,
  type WheelEvent,
} from "react";
import { ScrollTrigger } from "@/lib/gsap";
import {
  SCENE_ENTER_EVENT,
  SCENE_VISUAL_EVENT,
  type SceneId,
} from "@/lib/scenes";
import { useSceneManager } from "./SceneManager";

interface SceneRuntimeValue {
  id: SceneId;
  active: boolean;
  incoming: boolean;
  enterCount: number;
  visualCount: number;
  scroller: HTMLElement | null;
}

const SceneRuntimeContext = createContext<SceneRuntimeValue | null>(null);

export function useSceneRuntime() {
  const context = useContext(SceneRuntimeContext);
  if (!context) {
    throw new Error("useSceneRuntime deve ser usado dentro de Scene.");
  }
  return context;
}

interface SceneProps {
  id: SceneId;
  children: ReactNode;
  isStatic?: boolean;
}

/**
 * Cena fixa com scroller interno. O SceneManager anima o conteúdo `[data-out]`
 * e o portal; aqui só se gere visibilidade, scroll e o sinal de entrada.
 */
export function Scene({ id, children, isStatic = false }: SceneProps) {
  const { active, incoming, updateProgress, overscroll } = useSceneManager();
  const isActive = active === id;
  const isIncoming = incoming === id;
  const visible = isActive || isIncoming;
  const [enterCount, setEnterCount] = useState(0);
  const [visualCount, setVisualCount] = useState(0);
  const [scrollerNode, setScrollerNode] = useState<HTMLDivElement | null>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const assignScroller = useCallback((node: HTMLDivElement | null) => {
    scrollerRef.current = node;
    if (node) setScrollerNode(node);
  }, []);
  const touchRef = useRef<{ lastY: number } | null>(null);

  useEffect(() => {
    const element = sectionRef.current;
    if (!element) return;

    const handleEnter = () => {
      setEnterCount((count) => count + 1);
      const scroller = scrollerRef.current;
      if (scroller) scroller.scrollTop = 0;
      ScrollTrigger.refresh();
    };
    const handleVisual = () => setVisualCount((count) => count + 1);

    element.addEventListener(SCENE_ENTER_EVENT, handleEnter);
    element.addEventListener(SCENE_VISUAL_EVENT, handleVisual);
    return () => {
      element.removeEventListener(SCENE_ENTER_EVENT, handleEnter);
      element.removeEventListener(SCENE_VISUAL_EVENT, handleVisual);
    };
  }, []);

  useEffect(() => {
    if (!isActive) return;
    const scroller = scrollerNode;
    if (!scroller) return;

    const onScroll = () => {
      const max = scroller.scrollHeight - scroller.clientHeight;
      updateProgress(id, max > 0 ? scroller.scrollTop / max : 0);
    };

    scroller.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => scroller.removeEventListener("scroll", onScroll);
  }, [id, isActive, scrollerNode, updateProgress]);

  const handleWheel = (event: WheelEvent<HTMLDivElement>) => {
    if (!isActive || isStatic) return;
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const atEnd =
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
    const atStart = scroller.scrollTop <= 2;

    if (atEnd && event.deltaY > 0) {
      overscroll("next", event.deltaY, "wheel");
    } else if (atStart && event.deltaY < 0) {
      overscroll("prev", -event.deltaY, "wheel");
    }
  };

  const handleTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    if (!isActive || isStatic) return;
    touchRef.current = { lastY: event.touches[0]?.clientY ?? 0 };
  };

  const handleTouchMove = (event: TouchEvent<HTMLDivElement>) => {
    if (!isActive || isStatic) return;
    const scroller = scrollerRef.current;
    const touch = touchRef.current;
    const currentY = event.touches[0]?.clientY;
    if (!scroller || !touch || currentY === undefined) return;

    const atEnd =
      scroller.scrollTop + scroller.clientHeight >= scroller.scrollHeight - 2;
    const atStart = scroller.scrollTop <= 2;
    const delta = touch.lastY - currentY;
    touch.lastY = currentY;

    if (atEnd && delta > 0) {
      overscroll("next", delta, "touch");
    } else if (atStart && delta < 0) {
      overscroll("prev", -delta, "touch");
    }
  };

  const handleTouchEnd = () => {
    touchRef.current = null;
  };

  return (
    <SceneRuntimeContext.Provider
      value={{
        id,
        active: isActive,
        incoming: isIncoming,
        enterCount,
        visualCount,
        scroller: scrollerNode,
      }}
    >
      <section
        ref={sectionRef}
        id={id}
        data-scene={id}
        data-active={isActive}
        data-incoming={isIncoming}
        data-visible={visible}
        data-entered={enterCount > 0}
        className="scene"
        aria-labelledby={`${id}-title`}
        aria-hidden={!visible}
        inert={!visible}
      >
        <div className="scene__fx" aria-hidden="true" />
        <div
          ref={assignScroller}
          className={`scene__scroller ${isStatic ? "scene__scroller--static" : ""}`}
          tabIndex={isStatic ? -1 : 0}
          onWheel={handleWheel}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="scene__content" data-out>
            {children}
          </div>
        </div>
      </section>
    </SceneRuntimeContext.Provider>
  );
}
