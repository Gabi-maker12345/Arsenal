export type Cta = { label: string; href: string };
export type Img = { src: string; alt: string };

export interface SceneBase {
  title: string;
  lead: string;
  cta: Cta;
}

export interface HeroContent {
  titleLines: readonly [string, string];
  lead: string;
  cta: Cta;
  platforms: readonly string[];
  target: string;
}

export interface SimpleScene extends SceneBase {
  eyebrow: string;
  image: Img;
  href: string;
}

export interface S01 extends SceneBase {
  eyebrow: string;
  tiles: (Img & { label: string; sub: string })[];
  partBHeading: string;
  feed: { avatar: Img; who: string; what: string; when: string }[];
  stats: { value: number; suffix?: string; label: string; spark: number[] }[];
  cta2: Cta;
}

export interface S03 extends SceneBase {
  eyebrow: string;
  members: (Img & { name: string })[];
  chips: string[];
  steps: { title: string; text: string; media: Img }[];
  bento: { title: string; text: string; span: 4 | 5 | 7 }[];
}

export interface S05 extends SceneBase {
  eyebrow: string;
  manifesto: string[];
  map: { label: string }[];
  cta2: Cta;
}

export interface FooterContent {
  headline: [string, string];
  cta: Cta;
  columns: { title: string; links: Cta[] }[];
  legal: string;
  timezone: string;
}

/** Marcador visível enquanto o conteúdo real não chega. */
import { fixtureFor } from "./dev-fixtures";

export const ph = (path: string) => {
  if (process.env.NEXT_PUBLIC_FIXTURES === "1") return fixtureFor(path);
  return `{{${path}}}`;
};

export const images = {
  hero: {
    src: "/assets/sections/hero.jpg",
    alt: "Comando de videojogos sobre uma mesa escura",
  },
  packs: {
    src: "/assets/sections/packs.jpg",
    alt: "Comando e auscultadores de realidade virtual",
  },
  community: {
    src: "/assets/sections/community.jpg",
    alt: "Duas pessoas a jogar com comandos frente a um ecrã",
  },
  competitions: {
    src: "/assets/sections/competitions.jpg",
    alt: "Jogadores de esports em competição",
  },
  gallery1: { src: "/assets/sections/gallery-1.jpg", alt: "Jogadores em ambiente de jogo" },
  gallery2: { src: "/assets/sections/gallery-2.jpg", alt: "Detalhe de equipamento gaming" },
  gallery3: { src: "/assets/sections/gallery-3.jpg", alt: "Sessão de jogo em grupo" },
  gallery4: { src: "/assets/sections/gallery-4.jpg", alt: "Comunidade gaming" },
  gallery5: { src: "/assets/sections/gallery-5.jpg", alt: "Arena e competição" },
} satisfies Record<string, Img>;
