import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = { title: "Comunidade — Arsenal Gaming Hub" };

export default function ComunidadePage() {
  return (
    <Placeholder
      eyebrow="03 / 05"
      title="Comunidade sem atrito"
      body="Grupos, canais, voz e partilha de ecrã. A criação de comunidades abre com a primeira temporada."
    />
  );
}
