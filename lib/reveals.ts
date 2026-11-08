import { gsap, ScrollTrigger, SplitText } from "@/lib/gsap";
import { MOTION, REDUCED_MOTION_QUERY } from "@/lib/motion";

/**
 * Utilitário único de reveals por atributos, para as cenas com scroller
 * interno. O cleanup reverte SplitText e os ScrollTriggers.
 */
export function initReveals(root: HTMLElement, scroller?: HTMLElement | null) {
  if (window.matchMedia(REDUCED_MOTION_QUERY).matches) return () => {};

  const splits: SplitText[] = [];
  const triggers: ScrollTrigger[] = [];
  const scrollerOption = scroller ?? undefined;

  root.querySelectorAll<HTMLElement>('[data-reveal="lines"]').forEach((el) => {
    const split = SplitText.create(el, {
      type: "lines",
      linesClass: "reveal-line",
      mask: "lines",
    });
    splits.push(split);
    const tween = gsap.from(split.lines, {
      yPercent: 110,
      opacity: 0,
      duration: MOTION.reveal,
      ease: MOTION.ease.out,
      stagger: MOTION.stagger.lines,
      scrollTrigger: {
        trigger: el,
        scroller: scrollerOption,
        start: "top 82%",
        once: true,
      },
    });
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  });

  const rises = root.querySelectorAll<HTMLElement>('[data-reveal="rise"]');
  if (rises.length) {
    const tween = gsap.from(rises, {
      y: 32,
      opacity: 0,
      duration: MOTION.rise,
      ease: MOTION.ease.enter,
      stagger: MOTION.stagger.cards,
      scrollTrigger: {
        trigger: rises[0].parentElement ?? rises[0],
        scroller: scrollerOption,
        start: "top 82%",
        once: true,
      },
    });
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }

  const draws = root.querySelectorAll<SVGElement>('[data-reveal="draw"]');
  if (draws.length) {
    const tween = gsap.from(draws, {
      drawSVG: "0% 0%",
      duration: 1.2,
      ease: "power2.inOut",
      stagger: MOTION.stagger.tiles,
      scrollTrigger: {
        trigger: draws[0].ownerSVGElement ?? draws[0],
        scroller: scrollerOption,
        start: "top 82%",
        once: true,
      },
    });
    if (tween.scrollTrigger) triggers.push(tween.scrollTrigger);
  }

  return () => {
    triggers.forEach((trigger) => trigger.kill());
    splits.forEach((split) => split.revert());
  };
}
