import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = { title: "Pacotes de Jogo — Arsenal Gaming Hub" };

export default function PacotesPage() {
  return (
    <Placeholder
      eyebrow="02 / 05"
      title="Pacotes de Jogo"
      body="Figurinhas, memes de áudio, roletas e placares criados pela comunidade. A área de pacotes abre com a primeira temporada."
    />
  );
}
