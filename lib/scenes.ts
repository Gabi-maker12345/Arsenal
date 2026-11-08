export const SCENE_IDS = [
  "hero",
  "s01",
  "s02",
  "s03",
  "s04",
  "s05",
  "footer",
] as const;

export type SceneId = (typeof SCENE_IDS)[number];

export const SCENE_ORDER: readonly SceneId[] = SCENE_IDS;

export const SCENE_LABELS: Record<SceneId, string> = {
  hero: "Início",
  s01: "Comunidade",
  s02: "Pacotes",
  s03: "Grupos",
  s04: "Torneios",
  s05: "Voz",
  footer: "Final",
};

/** Nós da logo, em sentido horário a partir do topo. */
export const NODE_MAP = ["s01", "s02", "s03", "s04", "s05", "footer"] as const;

export const NODE_COUNTERS = ["01", "02", "03", "04", "05", "•"] as const;

export const SCENE_COUNTERS: Record<SceneId, string> = {
  hero: "",
  s01: "01",
  s02: "02",
  s03: "03",
  s04: "04",
  s05: "05",
  footer: "•",
};

/** Centros dos nós no viewBox 0 0 1000 1000. */
export const NODE_POINTS = [
  { x: 500, y: 234 },
  { x: 730.4, y: 367 },
  { x: 730.4, y: 633 },
  { x: 500, y: 766 },
  { x: 269.6, y: 633 },
  { x: 269.6, y: 367 },
] as const;

/** Legendas a 1,25 R, em percentagem do palco. */
export const NODE_LABEL_POINTS = NODE_POINTS.map((point) => ({
  x: 50 + 1.4 * (point.x / 10 - 50),
  y: 50 + 1.4 * (point.y / 10 - 50),
}));

export const SCENE_ENTER_EVENT = "arsenal:scene-enter";
export const SCENE_VISUAL_EVENT = "arsenal:scene-visual";

export function isSceneId(value: string): value is SceneId {
  return (SCENE_IDS as readonly string[]).includes(value);
}

export function sceneFromHash(hash: string): SceneId | null {
  const id = hash.replace(/^#/, "");
  return isSceneId(id) ? id : null;
}

export function sceneHref(id: SceneId) {
  return `#${id}`;
}

export function nextScene(id: SceneId): SceneId | null {
  const index = SCENE_IDS.indexOf(id);
  return index >= 0 && index < SCENE_IDS.length - 1 ? SCENE_IDS[index + 1] : null;
}

export function prevScene(id: SceneId): SceneId | null {
  const index = SCENE_IDS.indexOf(id);
  return index > 0 ? SCENE_IDS[index - 1] : null;
}

export function sceneToNode(id: SceneId): number {
  return (NODE_MAP as readonly string[]).indexOf(id);
}

export function nodeToScene(index: number): SceneId {
  return NODE_MAP[index] ?? "s01";
}
