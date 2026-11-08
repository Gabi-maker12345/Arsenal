# Prompt de correção: Arsenal v2

*Navbar glass flutuante · secções 01, 03 e 05 redesenhadas · correções vistas no vídeo*

**Anexos:** o vídeo da implementação atual (se o teu modelo não aceitar vídeo, usa a secção 1: foi medido frame a frame) e os SVGs da v1 (`arsenal-hub-animavel.svg`, `arsenal-marca-mini.svg`).

## 0. Papel e regras

Atua como engenheiro front-end sénior com olho de designer de motion. Este prompt **corrige e substitui** partes do prompt v1. O que não é mencionado aqui mantém-se como na v1 (tokens, `SceneManager`, portal, trilho, mapa, hash/foco/aria, hero H1 a H9).

1. Lê o código atual antes de escrever. Não reescrevas o que funciona (SceneManager, hero, painéis 02 e 04, logo animada): estende.
2. Em caso de conflito, este prompt prevalece sobre a v1.
3. Todos os números são **valores iniciais**, centralizados em `src/config/motion.ts` e `src/styles/tokens.css`.
4. **Cada fase termina com verificação visual:** grava vídeo a 60 fps (Playwright `recordVideo` ou CDP screencast), extrai frames e compara com os critérios. Compilar sem erros não prova nada.
5. Perante uma ambiguidade, escolhe a opção mais simples que cumpra os critérios e regista a decisão no relatório.

## 1. Diagnóstico do vídeo

Capturas a 1914×1030, navegação por cenas. Os tempos são aproximados (o vídeo tem frame rate variável).

### 1.1 O que está conforme (não mexer)

- D1 resolvido: o botão da hero fica ≈ 42 px acima do trilho.
- Título da hero com o ponto final em `--accent`; marquee com máscara nas pontas; legenda do trilho ao pairar (`01 COMUNIDADE`).
- A ideia do túnel da 05 funciona (anéis em perspetiva a avançar com o scroll) e o footer tem a estrutura certa. Os problemas abaixo são de execução, não de conceito.

### 1.2 O que falha

| # | Onde | O que se vê | Correção |
| --- | --- | --- | --- |
| N1 | Navbar (todo o vídeo) | Barra de largura total, colada ao topo, **≈ 75 px de altura** (medido: hairline a y = 74; a spec dizia 56), fundo sólido sem vidro. «ENTRAR» quase ilegível (≈ #666). Marca encostada ao «R» | §2, redesenho completo |
| N2 | 01 (t ≈ 8–12 s) | Mesma estrutura dos painéis 02/04: texto à esquerda, imagens à direita com degradê. O botão **toca** na última linha do lead. Só ≈ 4 imagens distintas, repetidas; as claras (fundo branco) quebram o clima escuro; a máscara deixa uma mancha cinzenta à esquerda do campo | §3 e §4.1 |
| N3 | 03 (t ≈ 16–20 s) | Split espelhado com linha vertical a 50 %, igual aos painéis. Mini-hub minúsculo (≈ 20 % da largura) num ecrã vazio. Chips `{{S03.CHIPS.x}}` colados ao botão, sem espaçamento | §3 e §4.2 |
| N4 | 05 Parte A (t ≈ 26–30 s) | Túnel com **corte seco ≈ 80 px acima do fundo** (o SVG não cobre o viewport). Hexágonos achatados (aspeto não preservado). «A» do ponto de fuga com o glifo partido. Texto `{{s05.lead}}` por cima do «VOZ» | §4.3 |
| N5 | 05 Parte C (t ≈ 32–36 s) | Logo pequena (≈ 25 % da altura). Legendas a ≈ 30 % de opacidade que **se sobrepõem aos nós**. Botões só com placeholders | §4.3 |
| N6 | Footer Parte A (t ≈ 36–46 s) | Rótulo do CTA circular **sai do ecrã pela direita**. Título **duplicado/fantasma** durante o scroll (t ≈ 44 s). Metade inferior vazia | §4.4 |
| N7 | Footer Parte B (t ≈ 38–42 s) | «RSENAL» **cortado à direita** (o «L» não cabe). A marca é maciça e cinzenta, as letras só contorno, e a marca é mais alta que as maiúsculas | §4.4 |
| N8 | Transições (01→02, 02→03) | **Vale vazio** de ≈ 1,5 s com o ecrã quase todo preto. Em 03 o texto aparece antes do visual | §4.5 |
| N9 | 02 (t ≈ 14 s) | A foto continua high-key (branca): o tratamento `.photo` (multiply `#d6d6d2`) não está a atuar | §4.5 |
| N10 | Trilho | Marcadores inativos quase invisíveis (parecem «⊢⊣»). O círculo «N» no canto inferior esquerdo tapa o primeiro marcador: parece o indicador de dev do Next.js; se for, desliga com `devIndicators: false` | §4.5 |
| N11 | Todas as cenas novas | O ecrã mostra `{{…}}` em vez de texto, o que impede de avaliar o layout | §5 |
| N12 | Scroll interno | No vídeo não se vê scroll dentro de 01 e 03 e não há nenhuma pista visual de que as cenas continuam | §4.1 e §4.2 (indicador de scroll) |

## 2. Navbar glass, compacta e flutuante (substitui o §5 da v1)

**Intenção:** uma «ilha» de vidro suspensa sobre o conteúdo, não uma barra colada ao topo. A forma é um **hexágono alongado** (pontas à esquerda e à direita), coerente com a logo e com a regra de esquina viva (sem cantos arredondados).

### 2.1 Medidas

| Item | Valor |
| --- | --- |
| Altura | 48 px (44 px abaixo de 900 px) |
| Largura | `min(860px, 100vw - 2 * var(--gutter))`, centrada. Igual na hero e nas secções (não animar a largura) |
| Distância ao topo | `calc(14px + env(safe-area-inset-top))`. Nada de a colar à borda |
| Pontas | `--cut: 24px` (vértices a meia altura). `padding-inline: 40px` para o conteúdo não tocar nas pontas |
| Posição no DOM | **filho direto do `body`, fora de `.scenes`**, `z-index: 50`. Um ancestral com `clip-path`, `filter`, `mask` ou `opacity < 1` (como a cena durante o portal) quebra o `backdrop-filter` e o vidro fica chapado |

### 2.2 Estrutura e CSS

```html
<header class='nav' data-state='hero'>
  <nav class='nav__capsule' aria-label='Principal'>
    <i class='nav__edge' aria-hidden='true'></i>
    <i class='nav__glass' aria-hidden='true'></i>
    <a class='brand' href='#hero' aria-label='Arsenal, início'><!-- marca mini inline, sem metadata --><span class='brand__word' aria-hidden='true'>RSENAL</span></a>
    <button class='nav__now' aria-haspopup='dialog' aria-expanded='false'>…anel + {{02}} + {{titulo}}…</button>
    <div class='nav__right'><a class='nav__link' href='{{entrar}}'>ENTRAR</a><button class='nav__hub' aria-label='Abrir mapa'>…6 pontos…</button></div>
  </nav>
</header>
```

```css
.nav{position:fixed;inset:calc(14px + env(safe-area-inset-top)) 0 auto 0;z-index:50;pointer-events:none;display:grid;place-items:center}
.nav__capsule{--cut:24px;
  --hex:polygon(var(--cut) 0,calc(100% - var(--cut)) 0,100% 50%,calc(100% - var(--cut)) 100%,var(--cut) 100%,0 50%);
  position:relative;pointer-events:auto;height:48px;padding-inline:40px;
  width:min(860px,calc(100vw - 2*var(--gutter)));
  display:grid;grid-template-columns:1fr auto 1fr;align-items:center}
.nav__edge,.nav__glass{position:absolute;pointer-events:none;clip-path:var(--hex)}   /* o clip-path só nas camadas, nunca no contentor: os anéis de foco não ficam cortados */
.nav__edge{inset:0;background:linear-gradient(180deg,rgba(255,255,255,.34),rgba(255,255,255,.08) 45%,rgba(255,255,255,.16))}
.nav__glass{inset:1px;
  background:
    radial-gradient(160px 48px at var(--nx,50%) 0,rgba(255,255,255,.14),transparent 70%),   /* brilho que segue o ponteiro */
    linear-gradient(180deg,rgba(255,255,255,.10),rgba(255,255,255,.03) 55%,rgba(255,255,255,.06)),
    rgba(8,8,8,.42);                                                                          /* base escura: garante contraste sobre fotos claras */
  -webkit-backdrop-filter:blur(18px) saturate(1.5) brightness(1.1);
  backdrop-filter:blur(18px) saturate(1.5) brightness(1.1)}
@supports not (backdrop-filter:blur(1px)){.nav__glass{background:rgba(14,14,14,.92)}}
.nav__capsule>:not(i){position:relative;z-index:1}
.brand{grid-column:1;justify-self:start;display:flex;align-items:center;gap:.28em}
.nav__now{grid-column:2}
.nav__right{grid-column:3;justify-self:end;display:flex;align-items:center;gap:20px}
.nav[data-state=hero] .nav__now{visibility:hidden}   /* visibility, não hidden: mantém a grelha estável */
```

### 2.3 Conteúdo e comportamento

- **Marca:** 28 px + «RSENAL» (12 px, peso 500, tracking .32em), espaçamento marca→texto `.28em` (hoje está apertado). Um só estilo em todos os estados. Hover: o «clique» de 60° da v1.
- **Indicador central** (secções e footer): anel de progresso de 14 px + número + título em estilo *label*, cor `--ink-2` (não `--ink-3`). Na hero fica invisível. Ao mudar de cena o texto sobe com máscara (.5 s `power3.out`). Clique abre o mapa.
- **Direita:** `ENTRAR` em *label* com cor `--ink-2`→`--ink` e sublinhado que varre da esquerda; botão «hub» de 32 px com os 6 pontos (relé de luz no hover).
- **Vidro vivo:** `--nx` atualizado com `gsap.quickSetter` no `pointermove` sobre a cápsula (só ponteiro fino). Sem `box-shadow`.
- **Hero:** mesma cápsula, base escura a `.28` (em vez de `.42`) para o vidro deixar passar mais fundo. Uma cena pode declarar `data-nav='light-bg'` para subir a base a `.6`.
- **Esconder ao scroll:** scroll para baixo > 120 px numa secção → `y: calc(-100% - 24px)` em .4 s `--ease-io`; volta ao scroll para cima ou ao topo. Nunca esconder com o mapa aberto ou com foco dentro da navbar.
- **Entrada:** `y -16→0` + `opacity 0→1`, .9 s `expo.out`, a t = .2 s. A navbar não se move durante os portais.
- **Mobile (< 900 px):** largura `calc(100vw - 24px)`, altura 44 px, `--cut: 20px`, sem indicador central (fica no mapa), marca + `ENTRAR` + hub.
- **A11y:** ordem de tabulação marca → indicador → ENTRAR → hub; anel de foco `1px solid var(--accent)` com `outline-offset: 3px` nos controlos. `prefers-reduced-motion`: sem brilho que segue o ponteiro e sem animação de entrada.

**Verificação (T4 atualizado):** altura 48 ± 1 px; distância ao topo 14 ± 1 px; `getComputedStyle(.nav__glass).backdropFilter !== 'none'`; ao fazer scroll sobre a foto da 02, a luminância média dentro da cápsula varia (prova de que não está chapada); contraste de `ENTRAR` e do indicador ≥ 4,5:1 medido sobre a zona mais clara da 02.

## 3. Secções 01, 03 e 05: contrato de rutura

### 3.1 O problema

Os painéis 02 e 04 são **uma secção à parte** (contador `0X / 05`, título XL, lead, botão fantasma, foto de meio ecrã). As secções 01, 03 e 05 **não podem parecer continuação desses painéis**. Hoje a 01 e a 03 são o mesmo painel com hexágonos no lugar da foto. Têm de ser **mundos novos**: outra composição, outra mecânica de scroll, outra linguagem de animação. A identidade (monocromia, grotesca leve, hairlines, esquina viva, P&B, luz só como energia) mantém-se; o *layout* não.

### 3.2 Anti-referência (proibido nas secções novas)

| Traço dos painéis 02/04 | Nas secções novas |
| --- | --- |
| Contador grande `0X / 05` + título XL + lead + botão fantasma empilhados em `--inset` | **Proibido.** O número aparece, no máximo, como micro-rótulo em coordenadas `(01)` num canto. O lead é uma **legenda** (≤ 36ch) encostada a um bordo. O CTA é link tipográfico com seta, botão hexagonal ou magnético |
| Split 50/50 (texto de um lado, visual do outro), mesmo espelhado | **Proibido.** Composição full-bleed, sem colunas fixas |
| Foto com degradê lateral a dissolver no fundo | **Proibido.** Imagens em recortes hexagonais, máscaras ou camadas com parallax |
| Entrada genérica `lines` + `rise` | **Proibida** como entrada principal. Cada secção tem a sua (§4) |
| Scroll só para «descobrir» mais do mesmo | Cada secção tem uma **mecânica de scroll própria** |

### 3.3 Obrigatório em cada secção nova

1. Uma **mecânica de scroll própria** (quadro 3.4).
2. **Parallax em ≥ 3 camadas de profundidade** (utilitário 3.5).
3. O título **integrado na composição** (blend, contorno→preenchido, vertical, a atravessar o visual), nunca num bloco de texto.
4. Pelo menos um momento de **escala dramática**: tipografia ≥ 14vw ou imagem full-bleed.
5. Uma **assinatura de interação** própria (cursor, tilt, lente, magnetismo).
6. Indicador de scroll próprio (não um texto): linha com marcador ou seta hexagonal que desaparece ao primeiro scroll, para a pessoa saber que a cena continua.

### 3.4 Quadro das três

|  | 01 Comunidade, «Mural» | 03 Grupos, «Palco» | 05 Voz, «Túnel» |
| --- | --- | --- | --- |
| Gesto-assinatura | Parallax vertical em profundidade, título em blend `difference` | Palco giratório com pin: o hub gigante roda e faz zoom com o scroll | Atravessar o hexágono em perspetiva |
| Título | Horizontal gigante a atravessar a composição | Vertical, rodado 90°, a encher com o scroll | Centrado no ponto de fuga, a esvair-se |
| Parte B | Trilho horizontal com pin («Pulso») | Pilha de cartões *sticky* («Como funciona») | Manifesto cinético |
| Parte C | «Ledger» de números em linhas | Bento com tilt 3D | Mapa grande + CTA magnético |
| Interação | Lente + spotlight no ponteiro | Hover num membro: orador manual | Anéis reagem ao ponteiro |

### 3.5 Utilitário de parallax (reaproveitar em todas as cenas)

Um **único** `ScrollTrigger` por cena e N camadas, sem criar triggers por elemento (desempenho e T5).

```ts
// src/lib/parallax.ts
type Layer = { el: HTMLElement; y?: number; x?: number; rot?: number; scale?: number };
export function createParallax(scroller: HTMLElement, trigger: HTMLElement, layers: Layer[]) {
  const fx = layers.map(l => ({
    l, y: gsap.quickSetter(l.el, 'y', 'px'), x: gsap.quickSetter(l.el, 'x', 'px'),
    r: gsap.quickSetter(l.el, 'rotation', 'deg'), s: gsap.quickSetter(l.el, 'scale')
  }));
  return ScrollTrigger.create({
    scroller, trigger, start: 'top bottom', end: 'bottom top', scrub: true,
    onUpdate: self => {
      const d = (self.progress - .5) * trigger.offsetHeight;        // distância ao centro da cena
      fx.forEach(({ l, y, x, r, s }) => {
        if (l.y) y(d * l.y); if (l.x) x(d * l.x);
        if (l.rot) r(self.progress * l.rot); if (l.scale) s(1 + (self.progress - .5) * l.scale);
      });
    }
  });
}
```

Velocidades (`y`) por profundidade: fundo `-.15`, médio `-.45`, perto `-.9`, primeiro plano `-1.3`. Em `lowfx` e `prefers-reduced-motion`: sem parallax (camadas estáticas). Sem `filter: blur` nas imagens (caro); a profundidade lê-se por escala, opacidade e velocidade.

## 4. Especificação por cena

Valores iniciais, todos para `motion.ts` e `tokens.css`. Cada cena tem uma **entrada própria** (não o `lines` + `rise` genérico) e a ordem é sempre **visual → título → legenda/CTA**.

### 4.1 Secção 01, «Mural» (substitui o §7 da v1)

**Assinatura:** um céu de hexágonos em profundidade que o scroll atravessa, com o título gigante em blend. Sem grelha, sem split, sem contador grande.

#### Parte A (pin, 280svh): «Céu»

- **Tiles flutuantes:** 22 hexágonos *pointy-top* de 3 escalas (circunraio 70 / 120 / 190 px, escalados com `clamp` e vw) e 4 profundidades, posicionados por semente fixa (poisson disc) para não se sobreporem. Nada de grelha regular.
- **Imagens sem repetição:** usa as 24 a 28 imagens do contrato, cada uma no máximo uma vez. Se não houver 18 imagens distintas, os tiles restantes ficam só em contorno; nunca duplicar.
- **Título** `{{title}}`: `clamp(120px, 17vw, 340px)`, peso 200, centrado, camada por cima das imagens com `mix-blend-mode: difference` em `--ink` e `isolation: isolate` no contentor (a navbar está no root e não é afetada). Começa em contorno (`-webkit-text-stroke: 1px`) e **enche** da esquerda para a direita com o scroll (`clip-path inset(0 100% 0 0)→inset(0)`, p .15 a .6).
- **Legenda e CTA:** o lead (≤ 30ch, `--ink-2`) no canto inferior esquerdo (`left: var(--gutter); bottom: calc(var(--rail-gap) + 56px)`); o CTA como link tipográfico com seta e hairline, no canto inferior direito, na mesma linha de base. Micro-rótulo `(01)` em cima à esquerda (*label*, 45 %).
- **Indicador de scroll:** ver §4.5 (N12).

**Entrada (≈ 1,8 s, dentro do portal):**

1. t 0: tiles com `scale .5` e `opacity 0` → `scale 1`, `rotation 30→0`, .9 s `expo.out`, `stagger {each:.035, from:'center'}`.
2. t .4: letras do título (SplitText `chars`, com máscara) `yPercent 110→0`, 1,0 s `expo.out`, `stagger .035`.
3. t 1,0: legenda e CTA com `clip-path inset(0 0 100% 0)→inset(0)`, .7 s `power3.out`.

**Scroll (`scrub: .8`):**

- `createParallax` com: tiles pequenos `y -1.3`, médios `-.9`, grandes `-.45`, grelha hexagonal de fundo `-.15`. O título fica fixo.
- **Zoom-through** (p ≈ .65): o tile mais perto do centro cresce (`scale → 14`, `clip-path` de hexágono para `inset(0)`) e a sua imagem torna-se o fundo da Parte B a 12 % de luminosidade. No modo leve, fallback: fade para `--bg`.
- **Lente do ponteiro** (da v1) nos tiles flutuantes: `scale 1 + .18·(1 − d/260)²`, ≤ 40 tiles por frame, `quickSetter`; no modo leve, 12 tiles.
- **Idle:** a cada 900 ms um tile aleatório respira (`opacity .55→1`, `scale 1.04→1`, .8 s).

#### Parte B (pin, 240svh): «Pulso», trilho horizontal

- Fundo: a imagem do zoom-through a 12 %. O `{{partBHeading}}` em **contorno gigante** (`clamp(140px, 20vw, 380px)`, stroke `.35`) atravessa a cena a `x: 10vw → -60vw` (0,4× a velocidade do trilho).
- **Um** trilho horizontal com 10 a 12 cartões do `feed`, em dois tamanhos alternados (360×112 e 420×148) e desfasados em `y` (`-60 / 0 / +60 / +120 px`) para dar ritmo de mural; gap 28 px. `x: 0 → -(largura do trilho - 100vw)`, `pin`, `end: '+=240%'`, `scrub: .6`, `ease: 'none'`.
- `skewX` por velocidade (±4°, `quickTo` .4) e `rotation` alternada ±1,2° por cartão.
- Cartão aceso (`.is-lit`) ao cruzar a banda central (±12 %): borda `--accent` a 40 % e linha de luz de 1 px a varrer o topo (.9 s, uma vez). Avatar hexagonal de 44 px.

#### Parte C (100svh+): «Ledger»

- **Quatro linhas** de largura total separadas por hairlines (não quatro colunas). Cada linha com altura `clamp(120px, 22svh, 220px)`: rótulo (*label*) à esquerda, valor em numeral XL `clamp(100px, 13vw, 260px)` ao centro-direita, e o sparkline a ocupar a largura toda por trás, a 25 % de opacidade (DrawSVG, 1,4 s `power2.inOut`).
- Odómetro por dígito (da v1), a 40 % visível, **uma vez**; `tabular-nums`.
- Hover/foco numa linha: **inverte** (fundo `--ink`, texto `--bg`) com `clip-path` a varrer da esquerda (.5 s `--ease-out`).
- Em baixo, os dois CTAs como **links tipográficos grandes** (`clamp(28px, 3.4vw, 64px)`, seta que desliza 12 px no hover) e a fila de avatares hexagonais (24 px) em marquee de 30 s.

### 4.2 Secção 03, «Palco» (substitui o §8 da v1)

**Assinatura:** o hub da logo reinventado como um **palco giratório** que ocupa o ecrã inteiro. Não é um split: o visual é o fundo.

#### Parte A (pin, 300svh)

- **Hub gigante:** SVG `viewBox 1000`, diâmetro `max(120vh, 90vw)`, centrado e ligeiramente abaixo do eixo (`y: 8vh`), a sangrar pelos bordos. Hexágono com 6 membros nos vértices (avatares hexagonais de 120 px, foto P&B low-key), 6 hastes e, no centro, o anel de onda de 72 barras. Reutiliza a geometria da logo.
- **Título vertical:** `{{title}}` com `writing-mode: vertical-rl` rodado 180°, `clamp(96px, 16vh, 200px)`, junto ao bordo direito (`right: var(--gutter)`). Contorno que **enche de baixo para cima** com o scroll.
- **Legenda e chips:** canto inferior esquerdo. O lead (≤ 28ch) e, **24 px por baixo**, a fila de 3 chips com gap de 12 px. O **CTA** é um botão hexagonal magnético (circunraio 60, seta) à esquerda do título vertical, a 50 % da altura. Distância chips→CTA ≥ 32 px (corrige N3).
- **Micro-rótulo** `(03)` e indicador de scroll (§4.5).

**Entrada (≈ 1,6 s):** hastes crescem do centro (`scaleX`, .55 s `power4.out`, stagger .07); avatares com `back.out(2.2)`; contorno do hexágono em DrawSVG (.9 s); o anel de onda cresce de 0 ao raio (.9 s `expo.out`); o título vertical sobe com máscara (`yPercent 105→0`, 1,1 s `expo.out`); legenda e chips por último, com `clip-path`.

**Scroll (`scrub: 1`):**

- O hub **roda** `0→120°` e faz `scale 1→1.5` (o zoom aproxima o anel de onda do centro). Os avatares fazem contra-rotação para ficarem direitos.
- **Orador:** o membro que passa pela posição «3 horas» fala (`scale 1.12`, `elastic.out(1,.5)`, onda hexagonal à volta, haste acesa com cometa de luz, amplitude do anel a 1 com decaimento a .15 em 1,2 s). Sem scroll durante 2 s volta o orador automático (a cada 2,2 s, nunca o anterior).
- **Parallax:** hub `-.2`, membros `-.5`, título vertical `-.9`, grelha hexagonal de fundo `-.1`.
- **Interação:** hover num membro torna-o orador manual (pausa o automático 3 s) e mostra a legenda com o nome; cursor em anel de 56 px. O clique só faz ondulação.

#### Parte B (pin, 320svh): «Pilha» de cartões *sticky*

- Três cartões de `min(1100px, 82vw) × 68svh`. Cada um tem o **numeral XL** do passo (`clamp(140px, 16vw, 300px)`, peso 200, contorno) a sangrar do canto superior esquerdo, título, texto (≤ 120 car.) e o `media` em 16:10 com parallax interno de ±6 %.
- Mecânica de baralho: o cartão `n+1` sobe de `y: 100vh` com `rotation 3°→0`; o cartão `n` faz `scale 1→.92`, `y -4vh`, `opacity 1→.35`, `rotation -1.5°`. `scrub: 1` com `snap` por labels (`p1`, `p2`, `p3`; `duration {min:.2, max:.6}`).
- Trilho lateral à esquerda (`var(--gutter)`): 3 hexágonos ligados por uma linha que se desenha (DrawSVG) com o scrub; o hexágono do passo atual enche e acende.

#### Parte C (100svh+): bento com tilt 3D

- Grelha de 12 colunas × 2 linhas (spans 7 e 5; 4, 4 e 4), gap 16 px, marcas de canto em L de 6 px, ícone hexagonal de 40 px.
- **Tilt:** `perspective: 1000px` no contentor; cada tile roda `rotateX/rotateY ≤ 6°` a seguir o ponteiro (`quickTo`, .5 s `power3.out`); ícone e título a `translateZ(30px)`. Spotlight no hover e borda iluminada (da v1). Em toque: sem tilt.
- **Entrada:** `from: 'edges'` (os tiles dos cantos primeiro), `y 60→0`, `rotateX 12°→0`, `opacity 0→1`, .9 s `power3.out`, `stagger .08`.

### 4.3 Secção 05, «Túnel» (corrige N4 e N5)

A direção está certa. Corrige a execução e dá-lhe o mesmo nível de composição das outras duas.

#### Parte A: bugs a corrigir

1. **Cobertura (N4).** O `<svg>` é `position: fixed; inset: 0; width: 100%; height: 100%` **do pin** (não da `.part` com `padding-top: var(--nav-h)`) e usa `preserveAspectRatio='xMidYMid slice'`. Nesta cena a `.part` não tem `padding-top`: a navbar flutua por cima, não empurra o conteúdo. Critério: 0 px de corte; nos 4 cantos do viewport há traço de anel em ≥ 80 % dos frames de uma volta de scroll.
2. **Aspeto.** Os polígonos vivem num `<g>` com `scale(s)` **uniforme**. Proíbe `preserveAspectRatio='none'` e qualquer `scale(x, y)` com valores diferentes. Critério: razão largura/altura de cada hexágono = 1,1547 ± 1 %.
3. **Marca no ponto de fuga.** Usa a marca mini completa a 64 px, sem `clip-path` nem `mask`, com `shape-rendering: geometricPrecision`. O «A» partido vem de clipping de sub-pixel ao aplicar scale: aplica `transform` ao `<g>` que contém a marca, não à marca.
4. **Texto.** O `{{title}}` (VOZ) no ponto de fuga com `clamp(96px, 14vw, 260px)`; o lead vira **legenda** (≤ 32ch) no canto inferior direito. Nunca por cima do título. Visível em p ∈ \[.08, .55\], a esvair-se até .7.
5. Reativa os 6 raios e o anel de sinal em `--accent` a cada 2,4 s (da v1).
6. **Entrada própria:** o túnel **abre** (`scale .6→1` do grupo, `opacity 0→1`, 1,2 s `expo.out`) e a marca acende no fim.

#### Parte B: manifesto cinético

Como na v1. Verifica que as camadas de contorno e preenchida alinham a 1 px e que cada linha cabe no viewport (usa o ajuste por JS de §4.4).

#### Parte C: mapa e chamada final (corrige N5)

- Logo `min(64vh, 640px)` (hoje ≈ 25 % da altura).
- Legendas radiais a **1,4 R**, `opacity .8` (100 % no hover), cor `--ink`, número em *label* + título na mesma linha (≤ 16). **Anti-colisão:** se duas legendas se sobrepõem, empurra-as radialmente de 6 em 6 px até libertar; nenhuma legenda fica a menos de 14 px de um nó. Clique → portal.
- CTA primário **magnético** e CTA fantasma por baixo, ≥ 40 px acima do trilho. Anéis do túnel a 6 %, parados, no fundo.
- Entrada: a logo faz a intro; no fim do batimento de ignição as legendas surgem em `rise` (`y 12→0`, stagger .08).

### 4.4 Footer (corrige N6 e N7)

#### Parte A

- **CTA circular:** círculo de 148 px com `right: var(--gutter)`. O rótulo vai num bloco `max-width: 20ch; text-align: center` **por baixo** do círculo, nunca em `position: absolute` para fora. Nenhum elemento do footer pode gerar scroll horizontal (`overflow-x: clip` na cena; teste `scrollWidth === clientWidth`).
- **Título duplicado (t ≈ 44 s).** Causa provável: `SplitText` criado duas vezes (re-entrada na cena sem `revert()`). Guarda a instância no `gsap.context`, faz `split.revert()` em `onLeave` e `onEnterBack` antes de recriar, e `ctx.revert()` no cleanup. Critério: T10.
- **Preencher o vazio:** o campo de pontos hexagonal (canvas, da v1) tem de ser visível desde o início (energia base `e = .12` com respiração suave); título a `clamp(64px, 8vw, 150px)`; colunas de links ancoradas à base da Parte A com 56 px de margem ao trilho.
- Links: hover com sublinhado hairline que varre da esquerda (.4 s).

#### Parte B: wordmark

- **Encaixe garantido (N7):** nada de `font-size` fixo em vw. Mede com JS (`ResizeObserver`) a largura natural de «RSENAL» + marca a 100 px e define `--fit = (innerWidth - 2 * gutter) / larguraNatural * 100px`. Aplica `font-size: var(--fit)` **uma vez por resize** (não se anima). Critério: `getBoundingClientRect().right <= innerWidth - gutter` em 1920, 1440, 1280 e 390.
- **Marca no lugar do «A»:** altura = altura das maiúsculas (≈ .72em), largura = a de um «A», assente na linha de base. Mesmo estilo das letras: em todas as formas da marca `fill: none; stroke: rgba(234,233,229,.28); stroke-width: 1px; vector-effect: non-scaling-stroke`. Acabou o preenchimento cinzento maciço.
- **Preenchimento por proximidade:** `background-clip: text` com `radial-gradient(circle 280px at var(--mx) var(--my), var(--ink), transparent)` nas letras; na marca, o mesmo gradiente como `mask` de uma cópia preenchida.
- Barra de base (© slot, relógio, «voltar ao início» com portal para a hero) como na v1. A navbar fica escondida nesta parte (regra do §2.3).

### 4.5 Correções transversais

- **N8, vale vazio.** O **visual-chave** da cena que entra (`[data-key]`: fundo, hub, tiles, túnel) tem de estar visível dentro do portal em t ≤ 0,35 s; só o texto espera pelos 0,55 s. Ordem obrigatória em todas as cenas: **visual → título → legenda/CTA**. Critério (T1b): em nenhum frame da transição a luminância média do ecrã desce abaixo de 60 % da menor das duas cenas durante mais de 250 ms. Se persistir, pré-aquece a cena de destino em `requestIdleCallback` ao pairar o nó ou marcador e garante `img.decode()` das imagens-chave antes do clique.
- **N9, imagens high-key.** Aplica `.photo` a **todas** as `<img>` (inclusive 02 e 04): `filter: grayscale(1) contrast(1.05) brightness(.85)` mais a camada `::after` multiply `#d6d6d2`. Verifica no browser que `getComputedStyle(img).filter !== 'none'`. Critério: percentil 99 da luminância de qualquer foto renderizada ≤ 0,80.
- **N10, trilho.** Marcadores hexagonais de 14 px, contorno 1 px a `rgba(255,255,255,.38)` (futuros) e `.7` (passados); o ativo preenchido a `#f2f1ed`. A legenda ao pairar mantém-se (está boa). Garante que nada fixo se sobrepõe ao primeiro marcador.
- **N12, indicador de scroll** (cenas 01, 03 e footer): linha vertical de 48 px com um hexágono de 8 px a descer em loop de 1,6 s, ao centro e a 24 px acima do trilho; `opacity → 0` ao primeiro scroll > 8 px e não volta.
- **Espaçamento (N2, N3):** lead → CTA ≥ 32 px; chips → CTA ≥ 32 px; nenhum elemento a menos de 24 px do trilho. Testado por geometria.

## 5. Conteúdo: placeholders e texto de exemplo

- Em produção continua a regra da v1: o texto vem de `content/*.ts`.
- Cria `src/content/dev-fixtures.ts` com texto **de exemplo no comprimento certo** (respeita os limites do schema), carregado só com `NEXT_PUBLIC_FIXTURES=1` e marcado com `__fixture: true`. Serve para avaliar o layout com texto real.
- Os placeholders `{{slot}}` só aparecem com `?slots=1` na URL.
- Os temas estão confirmados pelo vídeo: 01 Comunidade, 02 Pacotes, 03 Grupos, 04 Torneios, 05 Voz. Mantém `NODE_MAP` e as legendas do mapa alinhados com estes nomes.

## 6. Fases e testes

| Fase | Trabalho | Verifica |
| --- | --- | --- |
| F0 | Reproduz N1 a N12 em captura/vídeo e regista o estado inicial | Lista curta no relatório |
| F1 | Navbar glass flutuante (§2) | T4 |
| F2 | Correções transversais (§4.5) e espaçamentos | T1, T1b, T11 |
| F3 | Secção 05 e footer (§4.3, §4.4) | T10, T12 |
| F4 | Secção 01 «Mural» (§4.1) | T5, T6, T13 |
| F5 | Secção 03 «Palco» (§4.2) | T5, T6, T13 |
| F6 | Modo leve, reduced motion, limpeza, relatório | T7, T8, T9 |

Testes (Playwright em 1920×1080, 1440×900, 1280×720 e 390×844). Mantêm-se T1 a T3 e T5 a T9 da v1; mudam ou entram:

| # | Teste | Passa quando |
| --- | --- | --- |
| T4 | Navbar | Altura 48 ± 1 px, 14 ± 1 px do topo, `backdrop-filter` ativo, luminância interna varia com o scroll, contraste ≥ 4,5:1 |
| T1b | Vale vazio | Nunca menos de 60 % da luminância durante > 250 ms numa transição |
| T10 | Sem duplicados | Nº de linhas/clones de `SplitText` por cena constante após 3 voltas completas |
| T11 | Geometria | Sem scroll horizontal; nenhum texto cruza o trilho; lead→CTA e chips→CTA ≥ 32 px |
| T12 | Túnel e wordmark | O túnel cobre os 4 cantos; hexágonos regulares; o wordmark cabe no viewport nas 4 resoluções |
| T13 | Diferença visual | Nenhuma cena nova tem contador `0X / 05` grande, imagem a ocupar 50 % da largura ou degradê lateral; cada cena nova tem ≥ 3 camadas com velocidades de parallax distintas |

## 7. Proibições (somam-se às da v1)

- Nada da estrutura dos painéis 02 e 04 nas cenas 01, 03 e 05.
- Sem `box-shadow` nem `drop-shadow` decorativos. O vidro da navbar usa gradientes e `backdrop-filter`, não sombras.
- Sem `filter: blur` em imagens; `backdrop-filter` só na navbar e no mapa.
- Sem animar `width`, `top`, `margin` ou `font-size`. O `--fit` do wordmark define-se no resize, não se anima.
- Sem nós DOM criados durante animações (usar pools).
- `mix-blend-mode` só no título da 01 e no grão, sempre com `isolation: isolate` no contentor.

## 8. Entrega

1. Código integrado, com um commit por fase.
2. Resultado dos testes T1 a T13 (passou/falhou, com números).
3. **Vídeo a 60 fps** da navegação completa (hero → 01 → … → footer → volta à hero) em 1920×1080 e 390×844, mais frames-chave das 7 cenas.
4. Relatório curto: o que mudou em cada ponto N1 a N12, desvios e porquê, e os campos de `motion.ts` e `tokens.css` a afinar.
