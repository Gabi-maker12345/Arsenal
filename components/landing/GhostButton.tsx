import Link from "next/link";

interface GhostButtonProps {
  label: string;
  onClick?: () => void;
  href?: string;
  className?: string;
}

export function GhostButton({ label, onClick, href, className }: GhostButtonProps) {
  const classes = ["ghost-btn", className].filter(Boolean).join(" ");
  const content = (
    <>
      <span className="sr-only">{label}</span>
      <span className="ghost-btn__inner" aria-hidden="true">
        {label.split("").map((character, index) => (
          <span
            key={index}
            className="ghost-btn__char"
            style={{ transitionDelay: `${Math.min(index, 24) * 0.02}s` }}
          >
            {character === " " ? "\u00a0" : character}
          </span>
        ))}
      </span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {content}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onClick} className={classes}>
      {content}
    </button>
  );
}
