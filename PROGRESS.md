# PROGRESS — Execução de `CLONE_PLAN.md`

> Estado: **implementação concluída e verificada** (build de produção, lint, tipos, smoke tests a 375/768/1280/1920, interacção de rato/teclado/toque e `prefers-reduced-motion`).
> Fonte de verdade: `CLONE_SPEC.md`, com as **revisões do utilizador** registadas abaixo (a revisão prevalece sobre a Parte B original).

## 0.0.1 Revisão 9 — fluidez de animações e transições

- **Túnel da 05 em canvas 2D:** o SVG de 14 anéis deixou de escrever `scale/rotation/opacity` em 14 elementos por frame. O canvas desenha anéis, raios e sinal num único RAF, com DPR máximo 1,5, alvo de scroll suavizado (`1 − e^−18dt`) e paragem quando a diferença estabiliza. Só desenha com a cena ativa e antes de o túnel sair (p < 0,94). Resultado: 213 frames em 3,2 s, **16,74 ms médios, p95 16,8, 1 drop**, sem long tasks.
- **Transições sem `clip-path` full-screen:** o portal que recalculava a máscara da cena inteira foi substituído por uma cobertura hexagonal composta (escala/clip só na entrada; depois retângulo sólido). A cena de destino é ativada e pré-pintada debaixo da cobertura opaca; o fade final é uma camada inteira com opacidade. Fade visível: 60 fps em s02→s03, s03→s04, s04→s05, s05→footer e footer→hero; hero→s01 e s01→s02 ficam em ~17–20 ms (o primeiro paint do destino acontece durante o hold opaco).
- **Loops pausados fora da cena:** HubLogo (hero/mapa) ganhou `setActive`, parando intro/beat/HUD; marquee, avatares da 01, dots do footer, beacon dos nós e hint de scroll pausam em `.scene[data-active="false"]`; grão passou a estático; spotlight é uma camada de 900 px deslocada por `translate3d` em vez de recalcular o gradiente full-screen.
- **01:** lente do ponteiro em RAF + `quickTo` só nas 9 fotos; etiqueta de tile já não faz `setState` por movimento; centros/limites dos cartões do Pulso ficam em cache (sem `getBoundingClientRect` por frame); entrada do campo simplificada para não re-rasterizar imagens filtradas.
- **03:** imagens dos membros com `grayscale` mas o hub promovido a camada (`will-change: transform`) — 128 frames/2 s, **16,67 ms, 0 drops**; 72 barras agrupadas em 8 grupos para o orador; entrada do hub simplificada; bento sem `rotateX` na entrada (tilt mantém-se no hover).
- **Frame:** relógio isolado (`FooterClock`), progresso/charge separados no contexto, anel da navbar isolado num subcomponente e `useSceneCharge` no trilho (sem re-render por frame), decode das imagens split.
- **Layout:** inalterado nesta revisão (apenas animações/transições e o filtro de cor das imagens da 03). `tsc`, `lint` e build de produção verdes.

### Ajustes finais (segunda passagem de fluidez)

- O preenchimento animado dos títulos 01/03 e o `mix-blend-mode: difference` do título 01 foram removidos: eram repinturas de texto full-screen a cada scroll. Os títulos ficam em contorno, com entrada única de opacidade/posição. O campo da 01, o hub da 03 e o túnel da 05 são desmontados (`display:none`) nas cenas inativas.
- O hub da 03 passou a girar/escalar por **animação CSS composta** (28 s, pausada fora da cena), sem `gsap.set` do SVG grande por scroll nem contra-rotação dos seis membros. O campo da 01 deixou de ter máscara radial e parallax de grupos SVG.
- Métricas finais em headless: 01 A/B/C **16,7 ms / 0 drops**; 03 B/C **16,7 ms / 0 drops**, 03 A ~18–32 ms conforme a sequência de navegação (o hub é a única peça pesada restante); 05 e footer **16,7 ms / 0 drops**; fade visível das transições **16,7 ms** (o primeiro paint do destino acontece sob o hold opaco). O canvas do túnel mantém 213 frames/3,2 s, 16,74 ms, 1 drop.
- Layout não alterado; o que mudou é a camada visual/animação (títulos em contorno, hub em drift CSS, campo sem parallax/máscara). `tsc`, `lint` e build verdes.

## 0.0 Revisão 8 — correções v2 (`corrigir.md`)

- **N1/N3 navbar:** cápsula hexagonal de vidro, 48 px (>899) / 44 px (≤899), topo 14 px, largura alinhada ao conteúdo da hero: `margin-inline: var(--inset) var(--gutter)` — 1440: x 138,2→1393,9; 390: x 37,4→370. Indicador central, `ENTRAR` legível, foco e esconder-ao-scroll; nunca escondida com o mapa aberto; oculta no footer.
- **N2/N4/N5:** 01 Mural (22 tiles, 3 escalas/4 profundidades, 9 fotos únicas, parallax, zoom-through, Pulso horizontal e Ledger), 03 Palco (hub full-bleed, título vertical legível, orador, pilha sticky e bento com tilt) e 05 Túnel/manifesto/mapa. O mapa usa a logo completa a `min(64vh,640px)`, seis nós visíveis, legendas a 1,6 R sem colisões, CTAs primário magnético + fantasma e anéis de fundo a 6 %.
- **N6/N7 footer:** CTA com rótulo em bloco sob o círculo; sem `SplitText` duplicado (T10); colunas ancoradas; wordmark medido por `ResizeObserver` com margem de `--gutter` (1440 inner 46→1394; 390 inner 20→370), marca em outline e preenchimento por proximidade no texto e na marca.
- **N8:** portal abre já com raio `min(0.42·rMax, 520px)`, suficiente para mostrar o visual-chave da cena de destino desde os primeiros frames; texto continua a esperar pela entrada.
- **N9:** `.photo` com `grayscale/contrast/brightness(.58)` + multiply `#a9a8a3`; p99 da metade fotográfica da 02 = 0,412.
- **N10:** marcadores hexagonais de 14 px, contorno `rgba(255,255,255,.38)`, passados `.7`, ativo `#f2f1ed`; o indicador de dev do Next está desligado (`devIndicators: false`).
- **N11:** `content/dev-fixtures.ts` carregado por `NEXT_PUBLIC_FIXTURES=1`; o build local não mostra `{{slot}}` (`slots: []` nos testes). `?slots=1` não foi implementado.
- **N12:** hint de scroll em 01/03/footer; desaparece ao primeiro scroll.
- **Intro:** primeira visita de cada browser usa a cortina/logo antiga (≈13 s) e grava `arsenal-intro-seen` em `localStorage`; recargas seguintes usam a entrada curta marca+progresso (≈2 s).
- **Mapa/IDs SVG:** cada `HubLogo` recebe IDs de `defs/masks/gradientes` prefixados por instância; resolve a logo partida no mapa por colisão de IDs com o hero.
- **Desvios assumidos:** título da 03 sem `rotate(180)` (fica legível de cima para baixo, rodado 90°); legendas do mapa a 1,6 R em vez de 1,4 R para sair do HUD; logo do mapa sem beat (fica completa); bento ocupa a altura disponível; a intro antiga mantém os ≈13 s pedidos.
- **Verificação:** build de produção, `tsc` e `lint` verdes; T4 48/44 px a 14 px com `backdrop-filter` ativo; T10 sem duplicados após 3 voltas; T11 sem scroll horizontal (1440/390); T12 wordmark dentro das margens; T1b luminância mínima 0,041 vs 60 % da cena inferior 0,034; N9 p99 0,412; capturas em `.rea/final`, `.rea/targeted` e `.rea/transitions`.
- **Segurança:** Next.js 16.4.0 tem advisory conhecido; o build pede `next upgrade --agent=security`. Não foi executado.

## 0. Revisão 5 — logo animável (prevalece sobre a Revisão 3)

- O palco de máscaras CSS (`arsenal-ring.svg` + `arsenal-a.svg`) e a navegação por seis nós (`LogoStage`/`RingNav`/`RING_NODES`) foram substituídos.
- `arsenal-hub-animavel.svg` é injetado inline por `hub-logo-markup.ts` em **duas instâncias**: hero e fecho. `HubLogo` + `hub-logo.anim.ts` executam **Núcleo → Hastes → Nós → Relé**, com beat de 6 s, HUD contínuo, intro, parallax de rato, aceleração em hover, clique com ripple/faíscas, pausa fora do viewport e estado final em `prefers-reduced-motion`.
- A animação expõe `window.__hub` (`seekIntro`, `seekBeat`, `reset`) em desenvolvimento ou com `?hubdebug`; `data-ready` liberta a logo após o estado inicial.
- O fecho reutiliza a mesma animação; arranca quando entra no viewport. Não há hint nem navegação pelos nós; o CTA do hero continua a navegar para `#section-01`.
- Ficheiros: `components/landing/{HubLogo.tsx,hub-logo.anim.ts,hub-logo-markup.ts}`, `Hero.tsx`, `ClosingPanel.tsx`, `MotionEffects.tsx`, `app/globals.css`. Removidos: `LogoStage.tsx`, `RingNav.tsx`.

## 0.1 Revisão 6 — ecrã de carregamento

- `LoadingScreen` (cliente) cobre a página com um véu branco; dois blocos pretos entram pelas laterais, encontram-se ao centro (impacto + linha branca), a logo sobe e corre a **mesma** intro do `HubLogo`; a cortina abre e revela a página.
- O logo do loader é montado só depois do fecho, para a intro começar no momento certo; `onIntroComplete` do `HubLogo` dispara a abertura (com fallback de segurança). O shell da página fica `inert` e o scroll bloqueado durante a sequência.
- `prefers-reduced-motion`: sem cortina/logo; véu branco curto e remoção. `<noscript>` esconde o loader e o shell não fica inerte no SSR; a página estática permanece legível.

## 0.2 Revisão 7 — navegação por cenas

- Single-scroll substituído por `SceneManager` com 7 cenas, portal hexagonal, trilho de 7 marcadores, mapa-dialogo, hash/`popstate`, foco e live region.
- Navbar compacta de 56/48 px com marca mini, indicador central, hide-on-scroll e mapa. Hero refeita (H1–H5/H8/H9).
- `s01` Colmeia, `s03` Sala, `s05` Voz, footer A/B e o mapa final da 05 implementados; `s02`/`s04` reaproveitam o split existente. Conteúdo novo em `content/` com placeholders `{{slot}}`.
- CSS legacy do single-scroll removido; `LogoStage`/`RingNav`/`Navbar`/`SplitTrack`/`ClosingPanel`/`ScrollProgress`/`MotionEffects`/`SmoothScroll` removidos.
- Limitações e testes em `DELIVERY_REPORT.md`.

## 0. Revisão 3 — refinamento após `DIFF_REPORT.md`

| Área | Estado final |
|---|---|
| Root/tipografia | `html` 62,5% → 68,75% ≥1600 → 75% ≥1920; títulos 5,8rem/9,6rem (58/96/115,2), leading 1,2, ls −0,2rem; eyebrow 2/2,4rem; corpo 1,6/1,8rem; botões 0,9/1rem; nav 7,2/8,8/10rem. |
| Hero (Revisão 4) | Referência corrigida para **“Our Approach To Every Build”** (secção após os dois primeiros textos), não a Identity: H2 “A tua arena. / As tuas regras.” no topo-esquerdo (96/115,2; 2 linhas), marquee de plataformas em baixo-esquerda (32s), parágrafo/CTA em baixo-direita, logo à direita (288/504), fundo full-bleed desfocado; sem media square. Secção 813/1103 vs 800/1080 do Approach. |
| Secções | Track **3×100svh** com slides sticky sobrepostas e crossfade `autoAlpha` scrubbed; texto 33,3vw a x=8,5vw+margem; imagem 50vw; títulos 58/96/115,2; CTAs para `/pacotes`, `/comunidade`, `/competicoes`. |
| Fecho | Preto puro, **só a logo** (50vw, máx. 768px), hint oculto; `.post-closing` de 100svh a seguir (o fecho já não termina a página). |
| Metadados | OG/Twitter `/og.jpg` 1200×630, canonical/`og:url` com `NEXT_PUBLIC_SITE_URL`, manifest, apple icon, `mobile-web-app-capable` único. |
| Imagens | LQIP `placeholder="blur"`; assets Pexels grayscale; hero.jpg; sem CLS. |
| Motion | Lenis 1,6s bezzy2; track scrub 200vh; reveals 0,9s power3.out stagger 0,09; clip 1,1s; stage 1,2s; anel 24s; reduced motion respeitado. |
| Verificação | `npm run lint` 0; `tsc` 0; `npm run build` OK; LCP **124ms** local; **CLS 0**; sem erros de consola; 375/768/1280/1920; teclado/toque. |

A tabela de etapas (secção 1) mantém-se como registo da execução; a Revisão 3 substitui as decisões de layout/closing aí descritas. Detalhe completo em `DIFF_REPORT.md` §17.

## 1. Tabela de etapas

| Etapa | Estado | Evidência / nota |
|---|---|---|
| 1. Baseline e docs Next | ✅ | `npm install`; `node_modules/next/dist/docs/` lido (App Router, fontes, metadata, client components, viewport); `next dev` 16.4.0 |
| 2. Tokens, fonte e metadata | ✅ | `app/globals.css`, `app/layout.tsx`; Space Grotesk via `next/font`; metadata/OG/theme-color; `lang="pt"` |
| 3. SVG da logo | ✅ | **Substituído pela Revisão 5:** SVG inline animável (`arsenal-hub-animavel.svg`). O registo de máscaras CSS (`arsenal-ring.svg`/`arsenal-a.svg`) fica apenas como histórico. |
| 4. Lenis/GSAP | ✅ | `SmoothScrollProvider` (Lenis + `ScrollTrigger.update`), `useGSAP`, SplitText; cleanup em StrictMode; sem erros de consola |
| 5. Shell, secções, progresso | ✅ | 5 secções de 100svh; barra de progresso de 2 px via `subscribeProgress` (sem re-render por frame); live region |
| 6. Hero + navbar | ✅ | Split texto/logo; navbar fixa, transparente→blur a >24 px; marca monocromática |
| 7. Palco e anel | ✅ | **Substituído pela Revisão 5:** intro Núcleo→Hastes→Nós→Relé; HUD contínuo; beat de 6 s. O anel de máscaras a 24 s fica apenas como histórico. |
| 8. Nós, brilho e navegação | ✅ | **Substituído pela Revisão 5:** nós decorativos/animados; clique gera ripple + 8 faíscas; sem navegação por nós. O CTA mantém o scroll para `#section-01`. |
| 9. Painéis 01–03 | ✅ | **Revisão 2:** split 50/50 texto+imagem (estilo services), não full-bleed; imagens Pexels em grayscale |
| 10. Fecho com logo | ✅ | **Revisão 5:** mesma logo animável no fecho; intro arranca quando a secção entra no viewport; sem hint. |
| 11. Movimento | ✅ | Reveals por linhas, parallax ±6%, clip/scale das imagens, hover de botão com stagger, reduced motion |
| 12. Responsividade | ✅ | 390/768/1024/1440 sem overflow horizontal; imagem primeiro em mobile; alturas verificadas |
| 13. Acessibilidade | ✅ | H1 único, H2 por secção, `nav` distintos, `aria-current`, `aria-live`, skip link, foco visível, alvos ≥44 px |
| 14. Verificação final | ✅ | `npm run lint`, `npx tsc --noEmit`, `npm run build`; LCP ≈ 484 ms, CLS 0; sem erros/avisos de runtime |

## 2. Revisões do utilizador (prevalecem sobre a Parte B do spec)

1. **Secções**: substituídos os painéis full-bleed centrados por **secções divididas em duas metades** — texto à esquerda, imagem à direita, 50/50, a 100svh, no estilo das secções split da página original. Mantidos eyebrow, título display, corpo, CTA, parallax e reveals. Não foram simplificados.
2. **Imagens reais**: `packs.jpg`, `community.jpg`, `competitions.jpg` obtidas do Pexels e convertidas para **grayscale** (modo `L`) antes do build. Fontes:
   - `https://www.pexels.com/photo/3945683/` — comandos/VR
   - `https://www.pexels.com/photo/442576/` — duas pessoas a jogar
   - `https://www.pexels.com/photo/9072214/` — jogadores de esports
   - Licença Pexels (uso gratuito; atribuição não obrigatória).
3. **Paleta**: removidos `--ember` (#410306) e `--gold` (#c5a064) e todos os gradientes/glows avermelhados. A página usa apenas `#060607`, `#0C0C0C`, `#161616`, `#F2F1ED`, branco e cinzas. As imagens são entregues já em grayscale; o CSS reforça `filter: grayscale(1)`.
4. **Cortes da logo (histórico)**: substituído pela Revisão 5. Usava `arsenal-ring.svg` e `arsenal-a.svg` como `mask-image` com `background-color: var(--paper)`.
5. **Navbar**: adicionada navbar minimalista fixa (marca + “Entrar”), transparente no topo e com blur + hairline após 24 px.
6. **Logo animável (Revisão 5)**: substituir o palco de máscaras e a navegação por nós pela logo fornecida (`arsenal-hub-animavel.svg`) com intro Núcleo→Hastes→Nós→Relé, beat de 6 s e HUD; hover acelera o beat, clique gera ripple + 8 faíscas, reduced motion mostra o estado final, e o fecho repete a animação quando entra no viewport.
7. **Ecrã de carregamento (Revisão 6)**: véu branco inicial, dois blocos pretos que fecham como cortina e batem ao centro, logo sobe e executa a mesma intro, cortina abre e revela a página; reduced motion salta a encenação.

## 3. Dependências instaladas

```bash
npm install
npm install gsap@^3.13.0 lenis@^1.3.0 @gsap/react@^2.1.2
```

Instaladas: `gsap 3.15.1`, `lenis 1.3.x`, `@gsap/react 2.1.2`. Nenhuma outra dependência de runtime foi adicionada.

## 4. Desvios conhecidos em relação ao original

| Item | Original | Implementação | Motivo |
|---|---|---|---|
| Tipografia | `editorial` serif 200/300 + Geist | **Space Grotesk** 300–700 | Requisito explícito |
| Secções 8.º–10.º | Sequência de slides split com scroll sticky | 3 secções split de 100svh, texto esquerda/imagem direita | Revisão do utilizador: “2 metades, imagem e texto”; mantém o estilo visual |
| Imagens | Fotografia automóvel da Sanity | Fotografia gaming do Pexels, grayscale | Direitos de autor; pedido para usar bancos reais |
| Vídeo herói `.af` | Sequência de frames binária | Sem vídeo; composição tipográfica + logo | Formato proprietário/CORS; não há asset licenciado |
| CMS | Sanity (RSC + live) | Conteúdo estático em `lib/sections.ts` | Sem backend no âmbito |
| Navbar | Social + logo central + “Navigate” | Marca + “Entrar” | Pedido de navbar minimalista |
| CTA “Entrar”/“Criar conta” | `/contact` | `/registo` (placeholder) | Não há autenticação no âmbito |
| Fecho | “Refuse Ordinary” + CTA | “Entra na arena.” + logo interactiva | Requisito do utilizador (logo regressa) |
| Paleta | bc3 vermelho/bc4 dourado | Apenas preto/branco/cinzas | Revisão do utilizador |

## 5. Placeholders e assets

- `/registo`: página placeholder mínima (evita 404 dos CTAs e do link “Entrar”), com link de regresso.
- Imagens de secção: Pexels, convertidas para grayscale; créditos acima.
- Logo: assets do utilizador; a variante branca completa não é usada na página (a marca da navbar é um monograma simplificado), mas fica disponível.
- Grão: SVG `feTurbulence` inline (sem binário).

## 6. Itens `[NÃO DETERMINADO]` do original

| Item | Estado |
|---|---|
| Codec/formato `.af` e resolução dos vídeos | `[NÃO DETERMINADO]` — CORS bloqueia o fetch; binário proprietário |
| Configuração GSAP/ScrollTrigger exacta | `[NÃO DETERMINADO]` — bundles minificados; replicados os efeitos observáveis |
| Schemas Sanity | `[NÃO DETERMINADO]` — conteúdo servido por RSC |
| URL da imagem de fundo do fecho Forge | `[NÃO DETERMINADO]` — poster 1×1 no snapshot |
| Licença/nome comercial da fonte `editorial` | `[NÃO DETERMINADO]` — não usada |

## 7. Verificação executada

- `npm run lint`: 0 erros, 0 avisos.
- `npx tsc --noEmit`: 0 erros.
- `npm run build`: build estático OK (`/`, `/registo`, `/icon.svg`, `/_not-found`).
- Runtime: sem erros de consola; sem `pageerror`.
- Métricas: LCP local ≈ 124 ms; CLS 0 (build final).
- Interacção (Revisão 5): `window.__hub` disponível com `?hubdebug`; `seekIntro` mostra a construção (A→hastes→nós→relé) e `seekBeat` o loop de 6 s; clique no palco produz 8 faíscas; hover acelera o beat; o fecho arranca quando entra no viewport e o hero pausa fora dele.
- Reduced motion (Revisão 5): estado final estático (A, moldura, HUD a 0,3, aura a 0,12), sem tweens activas; `debug` não exposto.
- Loading (Revisão 6): a 1440×900 o ecrã arranca branco, os painéis fecham, a logo monta com `data-ready`, a cortina abre e o loader desaparece; `page-shell` fica `inert` durante a sequência e o scroll bloqueado; zero erros de consola. Em `prefers-reduced-motion`, o véu branco dura ~0,5 s e a página aparece sem cortina/logo. O SSR entrega o shell sem `inert` e um `<noscript>` que esconde o loader.
- Paleta: grep sem `ember/gold/#410306/#c5a064`; imagens em mode `L`. Os únicos pixels com croma nas capturas são fringing de subpixel do texto (não é cor de design).

## 8. Nota de segurança

O `next dev`/`next build` avisa que a versão **Next.js 16.4.0** está afetada por uma vulnerabilidade conhecida e recomenda `next upgrade --agent=security`. O build e a aplicação funcionam após retry, mas a atualização deve ser decidida pelo utilizador (ver pergunta final).
