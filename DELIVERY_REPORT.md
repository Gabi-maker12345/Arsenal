# Arsenal — relatório de entrega · navegação por cenas

## 1. Estado

Implementada a passagem do landing single-scroll para **7 cenas fixas** (`hero`, `s01`…`s05`, `footer`) com cena manager, portal hexagonal, trilho, mapa, navbar em cápsula de vidro, hero corrigida, cenas 01/03/05 completas (Mural/Pulso/Ledger, Palco/Pilha/Bento, Túnel/Manifesto/Mapa) e footer A/B com wordmark ajustado por medição.

A intro tem dois modos definidos pela Navigation Timing API: **navegações** (`navigate`/`back_forward`, incluindo fechar e reabrir) vêem a cortina/logo antiga (≈13 s); apenas **reloads** vêem a entrada curta marca+progresso (≈2 s). Sem `localStorage`.

`npm run lint`, `npx tsc --noEmit` e `npm run build` estão verdes. O preview de produção estava em `http://localhost:3001`; o servidor de validação final usou `http://localhost:3000`. Ver `PROGRESS.md` §0.0 para N1–N12, testes e desvios.

## 2. F0 · auditoria e desvios de arquitetura

| Prompt | Projeto real | Decisão |
|---|---|---|
| `src/config/motion.ts`, `src/styles/tokens.css`, `src/content/*.ts` | O projeto usa `lib/`, `app/globals.css` e não tem `src/` | Mantidos `lib/motion.ts` e `app/globals.css`; conteúdo novo em `content/`. |
| Hero, 02 e 04 com 3 partes internas | Existia scroll de janela (Lenis) com hero, 3 painéis sticky e fecho | O scroll de janela foi removido; os painéis Pacotes/Grupos/Torneios passaram a `s02`/`s03`/`s04`. |
| `s03` é nova (Sala) | Existia copy "Grupos" | `s03` reutiliza o título/lead/CTA existentes e o novo layout de mini-hub. |
| `s01` comunidade, `s05` voz, footer | Sem conteúdo gerado; apenas `/comunidade` tinha um lead curto | `s01` usa esse lead existente; s05/footer e campos em falta mostram `{{slot}}`, como pedido. |
| Navbar 125 px | Navbar antiga com `--nav-h` em rem (até 100 px) | Nova navbar de 56 px, 48 px em mobile. |
| SVG da marca | `arsenal-marca-mini.svg` já existia | Inline, sem `<metadata>`, com clique de 60°. |

## 3. O que foi implementado

### Navegação
- `SceneManagerProvider`: `go/next/prev`, estado `busy`, fila do último pedido, cooldown de 900 ms, hash/`pushState`/`popstate`, `document.title`, foco no título e live region.
- Portal hexagonal (`clip-path`) com frente SVG em `--accent`, 1,15 s `power4.inOut`, `origin` no nó/marcador/botão/centro; em `prefers-reduced-motion`, fade 120/130 ms.
- Cena de saída com `[data-out]` escondido antes de a entrada começar; entrada só visível a partir de 0,55 s (T1).
- Scrollers internos com overscroll acumulado (120 px rato / 80 px toque), carga no marcador seguinte, teclas `1…6`, `M`, `→`/`←`, `PageUp/Down`.
- Trilho com 7 marcadores hexagonais, preenchimento por cena, carga de overscroll e tooltips.
- Mapa em diálogo com a logo em estado `idle`, seis legendas radiais clicáveis, foco preso, `Esc`/clique fora; o shell fica `inert` enquanto o mapa está aberto.
- Navbar: marca mini + “RSENAL”, indicador central com anel de progresso, esconder ao descer, `ENTRAR`, botão hub.

### Hero
- Fundo em 3 camadas (base, grelha hexagonal, vinheta + grão/spotlight); foto desfocada removida.
- Título com períodos em `--accent`, duas linhas no desktop; grid com logo à direita, marquee e CTA na base, zona segura de 26 px acima do trilho.
- Nós da logo clicáveis (hit areas de 48 px e legendas também clicáveis), farol no nó seguinte, números, lista de cenas.
- Entrada sequenciada (título, lead/CTA, marquee), desativada em reduced motion.

### Cenas
- `s01` Colmeia: campo SVG de hexágonos, fotos P&B, contornos, lente de ponteiro, etiqueta de tile, leitura com scrim; copy existente de comunidade.
- `s02`/`s04`: split 50/50 preservado, imagem com tratamento `#d6d6d2` + `multiply` + brilho 0.7.
- `s03` Sala: mini-hub com 6 membros, hastes, anel de 72 barras, fala automática a cada 2,2 s, chips; split espelhado.
- `s05` Voz: túnel de 14 anéis (9 em mobile), pin de 350%, texto em janela de scroll, indicador vertical; mapa final com a logo, legendas, farol no footer e CTAs.
- Footer A/B: headline, CTA magnético, 4 colunas, campo de pontos CSS, wordmark com a marca no lugar do A, relógio `Africa/Luanda`, “voltar ao início”.
- Loading screen mantida (véu branco → cortina → logo → cortina).

### Conteúdo e tokens
- `content/schema.ts` com os contratos; `content/{hero,s01..s05,footer}.ts`; dados existentes reutilizados, restantes `{{slot}}`.
- `lib/motion.ts` com `MOTION`; `app/globals.css` com os tokens da §3.1 e os novos blocos.
- CSS do single-scroll antigo removido; componentes antigos removidos.

## 4. Fora desta passagem / limitações assumidas

- **Partes B/C** de `s01`, **B/C** de `s03` e **Parte B** de `s05` não foram implementadas; a prioridade do prompt foi F0–F4 + Parte A das novas + footer.
- `s02`/`s04` têm 1 parte (o conteúdo existente), não 3.
- Não implementados: cursor personalizado (H7), feedback de roda na hero (H6), idle/depth da lente da 01, pausa do auto-speaker da 03 no hover, sinal luminoso do túnel, canvas de pontos do footer, preenchimento do wordmark por proximidade, máscara animada do indicador da navbar, encolhimento do mapa até à marca.
- Conteúdo novo em falta (s01 tiles/feed/stats, s03 chips/steps/bento, s05 lead/manifesto/CTAs, footer headline/colunas/legal/CTA) está como placeholder visível `{{…}}`; o layout suporta a substituição.
- Sem Playwright/axe-core instalados; os testes foram executados no Chromium controlado disponível. T6 (CPU 4×) e T8 (axe-core) não foram executados.

## 5. Campos de `lib/motion.ts` para afinar

`micro`, `ui`, `reveal`, `rise`, `portal`, `stagger.lines`, `stagger.tiles`, `stagger.cards`, `ease.out`, `ease.io`, `ease.enter`, `ease.exit`, `pop`, `pulse`, `overscrollWheel`, `overscrollTouch`, `overscrollDecay`, `cooldown`.

## 6. Verificação

| Teste | Resultado | Evidência |
|---|---|---|
| T1 sem texto fantasma | **PASSA** | A 301 ms a cena de saída estava a 0,786 e a entrada escondida; a 605 ms a saída estava `visibility:hidden`/0 e a entrada visível; entrada escondida até 0,55 s. |
| T2 navegação completa | **PASSA** | 7 cenas pelo trilho; nó do hero → `s01`; nó do mapa → `s01`; overscroll `s02→s03`; teclas `3`, `→`, `←`; hash `#s01`; `history.back()` `s04→s02`; foco no título; sem salto de scroll. |
| T3 hero/trilho | **PASSA** | 1440: 26 px; 1920: 26 px; 390: 32 px. |
| T4 navbar | **PASSA** | 56 px a 1440/1920, 48 px a 390; esconde ao descer, regressa ao subir/topo; indicador central "•Final" após chegar ao footer. |
| T5 sem fugas | **PARCIAL** | 3 ciclos: 1295 nós DOM, 7 cenas, **1** `.pin-spacer`, altura da s05 5940 px — tudo estável. O pin da 05 foi corrigido com `kill(true)` e um reset de render na entrada. Contagem de ScrollTrigger/timelines não está exposta. |
| T6 CPU 4× | **NÃO EXECUTADO** | Sem harness de throttling nesta sessão. |
| T7 reduced/light | **PASSA (manual)** | Loader 450 ms; `lowfx`; marquee/grain/spotlight/beacon desligados; sem pin; s05 estática com copy visível; sem erros. |
| T8 acessibilidade | **PARCIAL** | Teclado, foco, `inert`, diálogo e live region exercitados; axe-core indisponível. |
| T9 CLS | **PASSA** | CLS 0; LCP 124 ms local a 1440×900. |

Capturas (CSS viewport 1920×1080 e 390×844; DPR 1,25): `.rea/scenes/1920-{hero,s01,s02,s03,s04,s05,footer}.png` e `.rea/scenes/390-{…}.png`.

## 7. Segurança

O `next build` continua a avisar que o **Next.js 16.4.0** está afetado por uma vulnerabilidade conhecida. O upgrade deve ser decidido pelo utilizador; pergunta no fim da resposta.
