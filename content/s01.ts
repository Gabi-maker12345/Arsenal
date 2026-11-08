import { images, ph, type S01 } from "./schema";

const tileSources = [
  images.community,
  images.hero,
  images.packs,
  images.competitions,
  images.gallery1,
  images.gallery2,
  images.gallery3,
  images.gallery4,
  images.gallery5,
];

export const s01: S01 = {
  eyebrow: "01 / 05",
  title: "Comunidade",
  lead: "Grupos, canais, voz e partilha de ecrã. A criação de comunidades abre com a primeira temporada.",
  cta: { label: "Entrar na Comunidade", href: "/comunidade" },
  tiles: Array.from({ length: 24 }, (_, index) => ({
    ...tileSources[index % tileSources.length],
    label: ph(`s01.tiles.${index}.label`),
    sub: ph(`s01.tiles.${index}.sub`),
  })),
  partBHeading: ph("s01.partBHeading"),
  feed: Array.from({ length: 10 }, (_, index) => ({
    avatar: tileSources[index % tileSources.length],
    who: ph(`s01.feed.${index}.who`),
    what: ph(`s01.feed.${index}.what`),
    when: ph(`s01.feed.${index}.when`),
  })),
  stats: [
    {
      value: 10,
      suffix: "k",
      label: ph("s01.stats.0.label"),
      spark: [3, 4, 4, 5, 5, 6, 7, 7, 8, 9, 10, 10],
    },
    {
      value: 1,
      suffix: "k",
      label: ph("s01.stats.1.label"),
      spark: [2, 3, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9],
    },
    {
      value: 99.5,
      suffix: "%",
      label: ph("s01.stats.2.label"),
      spark: [8, 9, 9, 9, 10, 10, 10, 9, 10, 10, 10, 10],
    },
    {
      value: 48,
      suffix: "h",
      label: ph("s01.stats.3.label"),
      spark: [4, 5, 6, 5, 7, 8, 7, 9, 8, 10, 9, 10],
    },
  ],
  cta2: { label: ph("s01.cta2.label"), href: "#s02" },
};
