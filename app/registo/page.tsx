import type { Metadata } from "next";
import { Placeholder } from "@/components/Placeholder";

export const metadata: Metadata = {
  title: "Entrar ou criar conta — Arsenal Gaming Hub",
};

export default function RegistoPage() {
  return (
    <Placeholder
      eyebrow="Arsenal Gaming Hub"
      title="Entrar ou criar conta"
      body="O acesso abre com a primeira temporada. Entretanto, explora a arena e os pacotes de jogo."
    />
  );
}
