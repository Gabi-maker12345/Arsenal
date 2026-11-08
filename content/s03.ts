import { images, ph, type S03 } from "./schema";

const memberImages = [
  images.community,
  images.packs,
  images.competitions,
  images.hero,
  images.gallery1,
  images.gallery2,
];

export const s03: S03 = {
  eyebrow: "03 / 05",
  title: "Grupos",
  lead: "Grupos, canais, voz e partilha de ecrã. Convites com validade, papéis claros e um quadro de procura de equipa para nunca jogares sozinho.",
  cta: { label: "Entrar na Comunidade", href: "/comunidade" },
  members: memberImages.map((image, index) => ({
    ...image,
    name: ph(`s03.members.${index}.name`),
  })),
  chips: [
    ph("s03.chips.0"),
    ph("s03.chips.1"),
    ph("s03.chips.2"),
  ],
  steps: Array.from({ length: 3 }, (_, index) => ({
    title: ph(`s03.steps.${index}.title`),
    text: ph(`s03.steps.${index}.text`),
    media: memberImages[index % memberImages.length],
  })),
  bento: [
    { title: ph("s03.bento.0.title"), text: ph("s03.bento.0.text"), span: 7 },
    { title: ph("s03.bento.1.title"), text: ph("s03.bento.1.text"), span: 5 },
    { title: ph("s03.bento.2.title"), text: ph("s03.bento.2.text"), span: 4 },
    { title: ph("s03.bento.3.title"), text: ph("s03.bento.3.text"), span: 4 },
    { title: ph("s03.bento.4.title"), text: ph("s03.bento.4.text"), span: 4 },
  ],
};
