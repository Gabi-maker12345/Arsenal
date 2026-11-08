"use client";

import { useSyncExternalStore } from "react";
import { INTRO_SEEN_KEY, INTRO_SEEN_VALUE } from "@/lib/intro";
import { LoadingClassic } from "./LoadingClassic";
import { LoadingMinimal } from "./LoadingMinimal";

interface LoadingScreenProps {
  onComplete: () => void;
}

type Mode = "classic" | "minimal";

const subscribe = () => () => {};

function getMode(): Mode {
  try {
    return window.localStorage.getItem(INTRO_SEEN_KEY) === INTRO_SEEN_VALUE
      ? "minimal"
      : "classic";
  } catch {
    return "classic";
  }
}

function getServerMode(): Mode | null {
  return null;
}

export function LoadingScreen({ onComplete }: LoadingScreenProps) {
  const mode = useSyncExternalStore(subscribe, getMode, getServerMode);

  if (mode === "classic") return <LoadingClassic onComplete={onComplete} />;
  if (mode === "minimal") return <LoadingMinimal onComplete={onComplete} />;

  return (
    <div className="loading loading--choice" role="status" aria-live="polite" aria-label="A carregar o Arsenal">
      <span className="sr-only">A carregar o Arsenal…</span>
    </div>
  );
}
