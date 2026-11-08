import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = { title: "Competições — Arsenal Gaming Hub" };

export default function CompeticoesPage() {
  return (
    <Placeholder
      eyebrow="04 / 05"
      title="Competições"
      body="Torneios com eliminatórias, ligas ou fase de grupos. O calendário competitivo abre com a primeira temporada."
    />
  );
}
