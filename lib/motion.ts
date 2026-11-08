export const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

/** Valores únicos para a navegação por cenas. O dono afina aqui. */
export const MOTION = {
  micro: 0.25,
  ui: 0.5,
  reveal: 1,
  rise: 0.9,
  portal: 1.15,
  stagger: {
    lines: 0.09,
    tiles: 0.02,
    cards: 0.08,
  },
  ease: {
    out: "expo.out",
    io: "power4.inOut",
    enter: "power3.out",
    exit: "power3.in",
  },
  pop: "back.out(2.2)",
  pulse: "elastic.out(1, 0.5)",
  overscrollWheel: 120,
  overscrollTouch: 80,
  overscrollDecay: 400,
  cooldown: 900,
} as const;

