import Link from "next/link";

interface PlaceholderProps {
  eyebrow: string;
  title: string;
  body: string;
}

export function Placeholder({ eyebrow, title, body }: PlaceholderProps) {
  return (
    <main className="placeholder">
      <p className="eyebrow">{eyebrow}</p>
      <h1 className="section-title">{title}</h1>
      <p>{body}</p>
      <Link href="/" className="text-link">
        Voltar à arena
      </Link>
    </main>
  );
}
