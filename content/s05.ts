import { ph, type S05 } from "./schema";

export const s05: S05 = {
  eyebrow: "05 / 05",
  title: "Voz",
  lead: ph("s05.lead"),
  cta: { label: ph("s05.cta.label"), href: "#footer" },
  manifesto: [
    ph("s05.manifesto.0"),
    ph("s05.manifesto.1"),
    ph("s05.manifesto.2"),
  ],
  map: [
    { label: "Comunidade" },
    { label: "Pacotes" },
    { label: "Grupos" },
    { label: "Torneios" },
    { label: "Voz" },
    { label: "Final" },
  ],
  cta2: { label: ph("s05.cta2.label"), href: "#footer" },
};
