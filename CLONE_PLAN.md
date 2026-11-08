# CLONE_PLAN — Arsenal Gaming Hub landing

> **Revisão 7 (navegação por cenas).** O single-scroll foi substituído por `SceneManager` (7 cenas, portal, trilho, mapa, hash/foco). A landing agora vive em `components/scenes/`, com conteúdo em `content/`. O CSS legacy do single-scroll foi removido. `s01`/`s03`/`s05` e footer foram implementados; ver `DELIVERY_REPORT.md` para âmbito, placeholders e testes.

> **Revisão 6 (ecrã de carregamento).** `LoadingScreen` cobre a página com um véu branco, fecha dois blocos pretos em cortina, sobe a logo com a mesma intro do hero e abre a cortina. Em reduced motion salta a encenação; `<noscript>` esconde o loader e deixa a página estática legível.

> **Revisão 5 (logo animável).** O `LogoStage`/`RingNav` descritos abaixo foram substituídos por `HubLogo` + `hub-logo.anim.ts`, com o SVG inline `arsenal-hub-animavel.svg`: intro Núcleo→Hastes→Nós→Relé, beat de 6 s, HUD contínuo, parallax, hover, clique com ripple/faíscas, pausa fora do viewport e estado final em reduced motion. A navegação por seis nós foi removida; o CTA do hero mantém o scroll. A estrutura de pastas e as etapas 3/7/8 são históricas.

> **Revisão 4.** A hero segue a secção **“Our Approach To Every Build”** (não a Identity): H2 topo-esquerdo, marquee bottom-left, parágrafo/CTA bottom-right, logo à direita. Ver `DIFF_REPORT.md` §18.

> **Revisão 2.** A Etapa 9 passou a ser implementada como **três secções split 50/50 (texto + imagem)** — ver a Revisão 2 em `CLONE_SPEC.md` e `PROGRESS.md` — e a paleta foi reduzida a preto/branco. As imagens são Pexels em grayscale. A navbar minimalista foi adicionada como requisito.

> **Fase 2 — Plano de criação.** Implementa a Parte B do `CLONE_SPEC.md`: hero no espírito da secção "Identity" do Forge, logo rotativa à direita com navegação por seis nós, 3 painéis full-bleed e fecho com o regresso da logo.
> Baseline do repositório: Next.js `16.4.0`, React `19.3.0`, Tailwind CSS `4`, TypeScript `5`, `node_modules` ainda não instalado.

## 1. Stack recomendada

| Escolha | Versão | Justificação |
|---|---|---|
| **Next.js (App Router)** | `16.4.0` (já instalado no `package.json`) | Mesma família do original; RSC para markup estático, `next/font` para Space Grotesk self-hosted, Turbopack para dev |
| **React** | `19.3.0` (já instalado) | Já no projeto |
| **TypeScript** | `5` (já instalado) | Contratos do mapa de secções e props do `LogoStage` |
| **Tailwind CSS 4** | já instalado (`@tailwindcss/turbopack`) | Layout utilitário; tokens em `@theme`/CSS vars. O original não usa Tailwind, mas os valores medidos são transportados para variáveis — não se tenta emular styled-components |
| **GSAP** | `^3.13` | Mesmo motor do original (ScrollTrigger + SplitText são gratuitos desde 3.13); usado apenas para revelações e parallax |
| **Lenis** | `^1.x` (`lenis`) | Mesmo smooth scroll do original (`window.lenis`) |
| **@gsap/react** | `^2` | `useGSAP` com cleanup correto em React 19/StrictMode |
| **Space Grotesk** | via `next/font/google` | Requisito do utilizador; zero pedido externo em runtime |
| **SVG próprio** | — | Logo e anel desenhados a partir de `public/assets/logo/arsenal-logo-A-cristal.svg`; sem bibliotecas de animação SVG |

Não usar: styled-components (o projeto usa Tailwind + CSS vars), Framer Motion (duplicaria GSAP), Three.js/Lottie (não há 3D nem assets Lottie na referência).

## 2. Estrutura de pastas

```
app/
  layout.tsx                 # Space Grotesk, metadata, lang="pt"
  page.tsx                   # Server Component: compõe as secções
  globals.css                # tokens @theme, base, keyframes, utilitários
components/
  landing/
    Hero.tsx                 # painel 1 (client: animações)
    LogoStage.tsx            # palco + anel + 6 nós (client)
    RingNav.tsx              # <nav> acessível dos nós (client)
    FullBleedPanel.tsx       # painéis 01–03 (server + client p/ parallax)
    ClosingPanel.tsx         # painel 5 (reutiliza LogoStage)
    ScrollProgress.tsx       # barra de 2px (client)
    GhostButton.tsx
    SplitHeading.tsx         # revelação por linhas/caracteres (client)
    AmbientBackdrop.tsx      # gradientes + grão (server/CSS)
  motion/
    SmoothScrollProvider.tsx # Lenis + contexto
    useSectionObserver.ts    # índice da secção activa
lib/
  sections.ts                # fonte única: ids, labels, copy, nós
  motion.ts                  # constantes de duração/easing
  gsap.ts                    # registo de plugins
public/
  assets/logo/
    arsenal-logo-A-cristal.svg  # original (não editar)
    arsenal-ring.svg            # moldura + 6 nós (rotativa)
    arsenal-a.svg               # letra A + faísca (estática)
  assets/textures/grain.png     # grão 128×128 (gerado)
  favicon.ico
```

## 3. Dependências — comandos exactos

```bash
npm install
npm install gsap@^3.13.0 lenis@^1.3.0 @gsap/react@^2.1.2
```

- `npm install` instala o `package-lock.json` existente.
- Não é necessário instalar fontes; `next/font/google` descarrega e self-hospeda Space Grotesk no build.
- **Antes de escrever código:** consultar `node_modules/next/dist/docs/` (App Router, `next/font`, metadata, client components), como exige o `AGENTS.md`; a API desta versão pode divergir do conhecimento prévio.

## 4. Ordem de implementação

Cada etapa termina num critério observável. Não avançar sem o verificar.

### Etapa 1 — Baseline e leitura da documentação
- **Objectivo:** projeto a correr e APIs da versão confirmadas.
- **Ficheiros:** nenhum.
- **Acção:** `npm install`; `npm run dev`; abrir `node_modules/next/dist/docs/` e ler os guias de App Router, fontes, metadata e client components.
- **Conclusão:** `npm run dev` serve `http://localhost:3000` sem erros; notas das APIs confirmadas.

### Etapa 2 — Tokens, fonte e metadata
- **Objectivo:** sistema de design base.
- **Ficheiros:** `app/globals.css`, `app/layout.tsx`.
- **Acção:**
  - `html { font-size: 16px }`; tokens da §11 do spec (`--ink-0`, `--paper`, `--ember`, `--gold`, `--glow`, `--line`, `--ease-out`, `--fs-*`).
  - `Space_Grotesk({ subsets:["latin"], weight:["300","400","500","700"], variable:"--font-space-grotesk" })`.
  - `metadata`: título "Arsenal Gaming Hub", description, OG; `lang="pt"`.
  - Remover a página boilerplate e o CSS default.
  - `body { background: var(--ink-0); color: var(--paper); }`, `scrollbar-width:none`.
- **Conclusão:** página preta com texto off-white em Space Grotesk; `next/font` sem pedidos a fonts.googleapis.com no browser.

### Etapa 3 — Preparação do SVG da logo
- **Objectivo:** separar moldura de letra.
- **Ficheiros:** `public/assets/logo/arsenal-logo-A-cristal.svg` (ler), `arsenal-ring.svg`, `arsenal-a.svg`.
- **Acção:** copiar o original; remover o `rect` branco (`st0` 1000×1000); converter cores `#1D1D1B` → `currentColor`; agrupar (a) moldura: hexágonos `st1`/`st3`, 6 círculos, linhas `st5`, arcos `st6`, raios; (b) letra A: paths `st4` + faísca diagonal. Validar visualmente sobre fundo escuro.
- **Conclusão:** com a moldura rodada 15° no DevTools, a letra A fica imóvel e a moldura roda em torno de `(500,500)`; sem fundo branco.

### Etapa 4 — Infraestrutura de movimento
- **Objectivo:** Lenis + GSAP prontos, sem duplicação em StrictMode.
- **Ficheiros:** `components/motion/SmoothScrollProvider.tsx`, `lib/gsap.ts`, `lib/motion.ts`.
- **Acção:** provider client com `new Lenis({ lerp: 0.1 })` + RAF; `ScrollTrigger.scrollerProxy`/`update`; `gsap.registerPlugin(ScrollTrigger, SplitText)`; `useGSAP` nos consumidores; cleanup `lenis.destroy()` e `gsap.context().revert()`.
- **Conclusão:** scroll suave; duplo mount em dev não cria dois RAF/listeners; `window.lenis` definido.

### Etapa 5 — Shell de página, dados e progresso
- **Objectivo:** 5 painéis vazios + barra de progresso.
- **Ficheiros:** `app/page.tsx`, `lib/sections.ts`, `components/landing/ScrollProgress.tsx`.
- **Acção:** `sections.ts` com ids/labels/targets e o mapa dos 6 nós; render de `Hero`, três `FullBleedPanel`, `ClosingPanel`; barra fixa 2 px com `scaleX` ligada ao progresso de scroll.
- **Conclusão:** 5 secções de 100svh; barra de 0→1; ids `#hero`, `#section-01..03`, `#closing` navegáveis por hash.

### Etapa 6 — Hero estático
- **Objectivo:** composição fiel à "Identity" com logo à direita.
- **Ficheiros:** `components/landing/Hero.tsx`, `AmbientBackdrop.tsx`, `GhostButton.tsx` (estático por agora).
- **Acção:** grelha 12 col (margem 24–48 px, gutter 32); texto cols 2/7 com hairline esquerda; palco da logo cols 8/12; eyebrow/H1/body/CTA nas posições do spec; fundo ambiente em 3 camadas; `100svh` com `min-height: 720px`.
- **Conclusão:** a 1440×900 o H1 mede 96 px/0.95 e o palco 560 px; captura lado a lado com `.rea/site/sec-2-0-y3360.png` mostra o mesmo ritmo (eyebrow topo, bloco central, CTA fundo).

### Etapa 7 — Palco da logo e anel
- **Objectivo:** anel a rodar em torno do A.
- **Ficheiros:** `LogoStage.tsx`.
- **Acção:** camada SVG estática + camada rotativa; halo por baixo; keyframes `arsenal-spin 24s linear infinite`; pausa em `:hover`/`:focus-within`; `prefers-reduced-motion` desliga.
- **Conclusão:** anel roda a 24 s; ao entrar no palco, para no mesmo frame; letra A imóvel; sem layout shift.

### Etapa 8 — Nós, brilho e navegação
- **Objectivo:** R5–R7 e R11.
- **Ficheiros:** `RingNav.tsx`, `useSectionObserver.ts`, `LogoStage.tsx`.
- **Acção:** 6 `<button>` a 48 px dentro do wrapper rotativo; `pointer-events: none` enquanto roda, `auto` ao pausar; estados `is-current`/`is-next`/`is-hover`; `next = current + 1` com wrap; clique → `lenis.scrollTo(target, { duration:1.6, easing })`; `history.replaceState`; `aria-current`, `aria-label`, `aria-live`; label sob o palco.
- **Conclusão:** hover acende exactamente um nó (o próximo); clique leva à secção e actualiza o hash; `Tab` pausa e percorre os 6; tocar num nó em mobile navega.

### Etapa 9 — Painéis 01–03
- **Objectivo:** estilo dos painéis 8.º–10.º do Forge.
- **Ficheiros:** `FullBleedPanel.tsx`, `lib/sections.ts`.
- **Acção:** `100svh`, `padding-top:50svh`, fundo absoluto + `::after` gradiente `to top` (opacidade .55), conteúdo centrado (eyebrow, H2, body 448 px, CTA); parallax ±6%; copy dos três pilares.
- **Conclusão:** a 1440 cada painel tem 900 px; título 96 px centrado; body 448 px; o gradiente escurece a base; parallax visível ao scroll.

### Etapa 10 — Fecho com a logo
- **Objectivo:** R10–R11.
- **Ficheiros:** `ClosingPanel.tsx`.
- **Acção:** reutilizar `LogoStage` com `mode="closing"`; entrada por `IntersectionObserver` (35%) com `scale(.92)→1`/fade 1.2 s; anel arranca 600 ms depois; nó 5 `is-current`, nó 6 `is-next`; clique → `#hero`; kicker/H2/CTA/"Voltar ao topo".
- **Conclusão:** ao chegar ao fecho a logo anima e o 6.º nó brilha no hover; clique volta ao topo sem salto brusco.

### Etapa 11 — Polimento de movimento
- **Objectivo:** aproximar a sensação do original.
- **Ficheiros:** `SplitHeading.tsx`, `GhostButton.tsx`, `Hero.tsx`, `globals.css`.
- **Acção:** revelações por linha (`translateY(24px)` + fade, stagger 90 ms); botões com letras a subir (stagger 20 ms) e borda cónica a 4.5 s; opcional preenchimento de título com gradiente `background-clip:text` e aresta `--ember`; respeitar reduced motion.
- **Conclusão:** hover do CTA anima letras; reveals só disparam uma vez; com `prefers-reduced-motion` nada anima além de fades.

### Etapa 12 — Responsividade e touch
- **Objectivo:** 390/768/1024/1440 sem quebras.
- **Ficheiros:** todos os componentes.
- **Acção:** coluna única abaixo de 1024; H1 52 px e H2 36–58 px; palco `76vw`; painéis `padding-top:42svh`; `@media (hover:none)` anel estático/40 s, nós sempre tocáveis, legenda fixa; `100svh`/`dvh`.
- **Conclusão:** capturas a 390×844, 768×1024, 1024×768 e 1440×900 sem overflow horizontal; logo dentro do viewport; nós com alvo ≥44 px.

### Etapa 13 — Acessibilidade
- **Objectivo:** navegação utilizável sem rato.
- **Ficheiros:** `RingNav.tsx`, `Hero.tsx`, `ClosingPanel.tsx`, `app/layout.tsx`.
- **Acção:** skip link para `#hero`; headings correctos (H1 único na hero); `nav aria-label`; `aria-current`; foco visível; `aria-hidden` no SVG decorativo; `aria-live` para mudança de secção; contraste ≥4.5:1; alvos ≥44 px.
- **Conclusão:** percurso completo por teclado (texto → 6 nós → CTA); Lighthouse/axe sem violações críticas; anúncio de secção.

### Etapa 14 — Verificação final e performance
- **Objectivo:** provar fidelidade e saúde.
- **Ficheiros:** nenhum (ou script temporário removido no fim).
- **Acção:** capturar 4 viewports + estados (default, hover num nó, a meio dos painéis, fecho); comparar com `.rea/site/`; medir LCP/CLS; testar Safari/iOS se disponível.
- **Conclusão:** LCP < 2.5 s em 4G simulada; CLS < 0.1; 60 fps durante a rotação; checklist da §6 toda verificada; `npm run lint` e `npm run build` limpos.

## 5. Riscos e partes difíceis

| # | Risco | Gravidade | Mitigação |
|---|---|---|---|
| 1 | Separar a moldura da letra A no SVG original (paths partilhados) | **Alta** | Trabalhar numa cópia; agrupar por classe no editor vetorial; validar rodando 90°/180° e comparando com o original; manter o ficheiro original intacto |
| 2 | Nós rotativos difíceis de clicar | **Alta** | Pausa imediata no hover/focus; `pointer-events` desligados em rotação; hit areas HTML de 48 px; testar com o anel em 6 ângulos diferentes |
| 3 | Navegação dependente de hover (mobile/teclado) | Média | Nós reais em `<button>`, foco pausa, legenda fixa em touch, `aria-live` |
| 4 | Lenis + GSAP + React 19 (StrictMode, HMR) a duplicar loops | Média | Provider único, `gsap.context`, `lenis.destroy()` no cleanup, sem `window` listeners duplicados |
| 5 | Fidelidade ao Forge vs. identidade Arsenal | Média | Tokens mapeados 1:1 (§11 do spec); comparar screenshots por secção; a fonte é Space Grotesk por requisito, logo a tipografia serif não é copiada |
| 6 | Direitos de imagem (assets do Forge/gaming) | **Alta (legal)** | Não copiar imagens do Forge; fundos CSS (gradientes + grão) ou arte licenciada/própria; o clone é de *estilo*, não de assets |
| 7 | Vídeo herói `.af` do original | Baixa | Ignorar o formato; se houver vídeo, usar `webm`+`mp4` com poster, `preload="none"`, autoplay muted loop |
| 8 | API do Next 16 diverge do conhecimento do modelo | Média | Ler `node_modules/next/dist/docs/` após instalar; validar `next/font`, metadata e client boundaries na Etapa 1 |
| 9 | `100svh`/browser chrome mobile | Média | `svh` com fallback `vh`; `min-height` em px; testar Android Chrome e iOS Safari |
| 10 | Secção activa dessincronizada do scroll | Baixa | Cálculo por `IntersectionObserver` + offsets, throttled por RAF; testar scroll rápido e âncoras |
| 11 | Fontes a carregar tarde (FOUT) | Baixa | `next/font` com `display:"swap"` e fallback métrico; preload automático |

## 6. Checklist de fidelidade

### 6.1 Tokens e tipografia (vs. original)

| Item | Referência | Arsenal | Verificação |
|---|---|---|---|
| Fundo base | `#0C0C0C` / `#161616` | `--ink-0/#060607`, `--ink-1/#0C0C0C` | amostra de pixel |
| Off-white | `#F2F1ED` | `--paper` igual | amostra |
| Vermelho profundo | `#410306` | `--ember` igual | amostra |
| Dourado | `#C5A064` | `--gold` igual | amostra |
| Hairline | branco 10% | `--line` igual | computed |
| Serif | editorial 200/300 | **substituído** por Space Grotesk (requisito) | — |
| Corpo | Geist 18/25.2, −0.5 px | Space Grotesk 16–18/1.4 | computed |
| Título display | 96/115.2, −2 px | 96/0.95, −0.04em | computed |
| Botão | 10/20, 600, 3 px, uppercase | igual | computed |
| Grelha | 12 col, gutter 32, margem 16 | 12 col, gutter 32, margem 24–48 | screenshot |

### 6.2 Estrutura e interacção (Arsenal)

| # | Critério | Como verificar |
|---|---|---|
| 1 | Hero com a mesma cadência da secção Identity (eyebrow topo, bloco central, CTA fundo) | comparação visual com `.rea/site/sec-2-0-y3360.png` |
| 2 | Logo à direita, 320–560 px, sem fundo branco | screenshot + inspecção |
| 3 | Moldura roda 24 s em torno do A; A imóvel | gravar 5 s; o centro do A não se desloca |
| 4 | Hover pausa a rotação | DevTools: `animation-play-state: paused` |
| 5 | Exactamente um nó brilha | hover no palco; contar `.is-next` |
| 6 | Clique no nó aceso navega para a secção seguinte | scroll suave + hash |
| 7 | 3 painéis full-bleed com gradiente, título 96 px, body 448 px, ghost CTA | 1440×900 por painel |
| 8 | Fecho (4.º scroll) mostra a logo com entrada animada | `IntersectionObserver` + gravação |
| 9 | No fecho, o 6.º nó ("Reiniciar") brilha e volta ao topo | clique + estado |
| 10 | Teclado: 6 nós focáveis, foco pausa, Enter navega | percurso só com `Tab`/`Enter` |
| 11 | Touch: nós tocáveis sem hover | emulação mobile |
| 12 | Reduced motion: sem rotação/parallax/reveals | emulação |
| 13 | 390/768/1024/1440 sem overflow | screenshots |
| 14 | Sem assets do Forge | grep no repositório |

## 7. Definition of done

- `CLONE_SPEC.md` e `CLONE_PLAN.md` na raiz, sem valores inventados para o original.
- Landing com 5 painéis, logo interactiva em `#hero` e `#closing`, 3 painéis no estilo dos 8.º–10.º do Forge.
- Navegação dos 6 nós funcional por rato, teclado e toque; brilho do próximo nó; loop no fecho.
- `npm run lint` e `npm run build` sem erros; smoke test nos 4 viewports; checklist §6 verificada.
