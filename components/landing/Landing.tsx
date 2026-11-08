"use client";

import { useCallback, useState, useSyncExternalStore } from "react";
import { hero, s01, s02, s03, s04, s05, footer } from "@/content";
import { LoadingScreen } from "@/components/landing/LoadingScreen";
import { INTRO_SEEN_KEY, INTRO_SEEN_VALUE } from "@/lib/intro";
import { FooterScene } from "@/components/scenes/FooterScene";
import { HeroScene } from "@/components/scenes/HeroScene";
import { HexFieldScene } from "@/components/scenes/HexFieldScene";
import { MiniHubScene } from "@/components/scenes/MiniHubScene";
import { SceneEffects } from "@/components/scenes/SceneEffects";
import { SceneManagerProvider, useSceneManager } from "@/components/scenes/SceneManager";
import { SceneMap } from "@/components/scenes/SceneMap";
import { SceneNavbar } from "@/components/scenes/SceneNavbar";
import { SceneRail } from "@/components/scenes/SceneRail";
import { SplitScene } from "@/components/scenes/SplitScene";
import { TunnelScene } from "@/components/scenes/TunnelScene";

const subscribeHydration = () => () => {};
const getHydrated = () => true;
const getServerHydrated = () => false;

function LandingExperience() {
  const { mapOpen } = useSceneManager();
  const [loading, setLoading] = useState(true);
  const hydrated = useSyncExternalStore(
    subscribeHydration,
    getHydrated,
    getServerHydrated,
  );
  const finishLoading = useCallback(() => {
    try {
      window.localStorage.setItem(INTRO_SEEN_KEY, INTRO_SEEN_VALUE);
    } catch {
      /* o modo privado pode bloquear o armazenamento; a intro antiga repete-se */
    }
    setLoading(false);
    window.requestAnimationFrame(() => {
      document
        .querySelector<HTMLElement>(
          ".scene[data-active='true'] [data-scene-title]",
        )
        ?.focus({ preventScroll: true });
    });
  }, []);

  return (
    <>
      <div className="page-shell" inert={(hydrated && loading) || mapOpen}>
        <a className="skip-link" href="#page">
          Saltar para o conteúdo
        </a>

        <SceneNavbar />
        <main className="scenes" id="page" tabIndex={-1}>
          <HeroScene content={hero} />
          <HexFieldScene content={s01} />
          <SplitScene id="s02" content={s02} />
          <MiniHubScene content={s03} />
          <SplitScene id="s04" content={s04} />
          <TunnelScene content={s05} />
          <FooterScene content={footer} />
        </main>
        <SceneRail />
      </div>

      <SceneMap />
      <SceneEffects />

      {loading ? <LoadingScreen onComplete={finishLoading} /> : null}

      <noscript>
        <style>{`.loading { display: none !important; }`}</style>
      </noscript>
    </>
  );
}

export function Landing() {
  return (
    <SceneManagerProvider>
      <LandingExperience />
    </SceneManagerProvider>
  );
}
