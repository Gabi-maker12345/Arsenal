# DIFF_REPORT — Forge Automotive (original) vs Arsenal Gaming Hub (clone)

> **Âmbito:** comparação visual e de comportamento entre `https://forgeautomotive.co.uk/` e `http://localhost:3000/`, a 375×812, 768×1024, 1280×800 e 1920×1080 (DPR 1, zoom 100%, `prefers-reduced-motion: no-preference`). Capturas em `.rea/compare/` (`orig-<vw>-*.png`, `clone-<vw>-*.png`, `1440-*.png`); valores exactos em `.rea/compare/measure.json` e `.rea/compare/clone.html`.
> **Método:** DOM/CSS computado nas duas páginas, gesto de consentimento no original, scroll até cada secção, capturas nas mesmas condições; para as animações, observação do comportamento e das transições CSS/GSAP. Nada foi corrigido.
> **Nota:** as marcações **“intencional”** correspondem a desvios pedidos explicitamente pelo utilizador (Space Grotesk, monocromia, navbar minimalista, fecho com logo). Ficam registadas, mas não são defeitos de fidelidade. O foco do relatório é o que devia ser igual/semelhante e não está: **hero**, **transição das 3 secções** e **fecho**.

## 1. Global / shell

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Global | Root font-size | Tipografia | `10px` a 375/768/1280; `12px` a 1920 (62.5% → 68.75% → 75%) | `16px` fixo em todos os viewports | **Alta** | Repor `html { font-size: 62.5% }` (68.75% ≥1600, 75% ≥1920) e converter os tokens do clone para `rem`; caso contrário todo o scaling do original desaparece. |
| 2 | Global | Família tipográfica | Tipografia | `editorial` serif 200/300 + `GeistSans` | `Space Grotesk` 300–700 | Baixa (intencional) | Manter Space Grotesk por requisito; alinhar escalas/leading com o original (ver §8). |
| 3 | Global | Altura do header | Layout | 72px @375; 88px @768; 100px @1280; 120px @1920 | 86px @375/768; 102px @1280/1920 | Média | Igualar a altura ao original por breakpoint (ou ajustar `--nav-h` ao valor real). |
| 4 | Global | Conteúdo do header | Componentes | Social (LinkedIn/Instagram/Facebook) + logo central 69×32 + “Navigate” + telefone mobile | Monograma + “ARSENAL” à esquerda, “ENTRAR” à direita | Média (intencional) | Manter a navbar minimalista pedida; documentar a ausência de social/menu como decisão. |
| 5 | Global | Contentor de scroll | Comportamento | `.lenis` com `overflow:auto`; `html,body{overflow:hidden}` | scroll nativo da janela | Média | Para paridade de comportamento (hash, teclado, posição, resize), replicar o wrapper Lenis do original. |
| 6 | Global | Barra de progresso | Componentes | 2px; inset 16px (19.2px a 1920 por `1.6rem`) | 2px; inset 16px fixo | Baixa | Usar `1.6rem` em vez de `1rem` fixo. |
| 7 | Global | Número de painéis visuais | Layout | 9 painéis (intro, approach, identity, statement, services, ordinary, builds, stock, closing) + footer sr-only | 5 painéis (hero, 3 split, closing) | Média (intencional/parcial) | O clone actual é um subconjunto; falta a continuação abaixo do fecho. Ver §7. |
| 8 | Global | `theme-color` | Cores | `#0c0c0c` | `#060607` | Baixa | Alinhar o token se se pretender fidelidade cromática. |
| 9 | Global | Metadados sociais/SEO | SEO | `og:image`, `twitter:image`, `og:url`, `og:site_name`, canonical, manifest, apple-touch-icon, `mobile-web-app-capable` | Ausentes; só `og:title/description`, `twitter:card`, `description`, `icon.svg` | Média | Adicionar imagem OG/Twitter 1200×630, canonical/`og:url`, manifest, apple icons e `mobile-web-app-capable`. |
| 10 | Global | Landmarks | A11y | 3 `nav` (Social media, Menu, Site) + footer sr-only | 2 `nav` (logo início/fecho); sem social/menu/site footer | Média | Adicionar footer de site e navegação social, se fizer parte do âmbito. |
| 11 | Global | Página termina no fecho | Estrutura | Original termina no closing + footer sr-only | Clone termina em `#closing`; `scrollHeight` 4506/5120/…/5408 | **Crítica** | O fecho não pode ser o fim: remover o fecho como última secção e deixar espaço/conteúdo a seguir (ver §7). |

## 2. Hero (clone) vs secção Identity (original)

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Hero | Composição | Layout | Media quadrada à esquerda (327/736/501/602 px) + bloco de texto à direita | Texto à esquerda + logo à direita; **sem metade de media** | **Crítica** | Definir a composição com a media square à esquerda (como a Identity) e a logo à direita; o texto do hero não pode simplesmente substituir a media. Validar onde fica o texto (sobre a media/coluna esquerda) antes de corrigir. |
| 2 | Hero | Media square | Imagens/Layout | 327×327 @375; 736×736 @768; 501×501 @1280; 602×602 @1920 | Ausente; palco da logo 285/416/486/560 | **Crítica** | Introduzir a media square com a proporção/tamanho do original e manter a logo no lado direito. |
| 3 | Hero | Wrapper/sticky | Layout/Animação | 3 slides sticky num wrapper de 2400px @1280 e 3240px @1920 | Hero único de 100svh (800/1088) | **Crítica** | Implementar o wrapper `count × 100dvh` e as slides sticky (ver §6). |
| 4 | Hero | Coluna de texto | Layout | 327 @375/768; 395 @1280; 442 @1920 | 327 @375; 595 @768; 458 @1280; 553 @1920 | Média | Repor a largura da coluna do original e a grelha 2/7–8/12 (1280) e 3/7–8/11 (1920). |
| 5 | Hero | Título | Tipografia | 58/69.6/−2 @375/768; 96/115.2/−2 @1280; 115.2/138.24/−2.4 @1920 | 52/49.4/−2.08; 52/49.4; 84.48/80.256/−3.38; 96/91.2/−3.84 | **Alta** | Igualar tamanho e leading; a 1920 o clone é 16.7% menor e 47px mais apertado. |
| 6 | Hero | Eyebrow | Tipografia | 20/24 @375/768; 24/28.8 @1280; 28.8/34.56 @1920; serif 300 | 12/19.2/3.6 em todos | **Alta** | Usar a escala do original (ou justificar a escala 12px); actualmente é 40–58% menor. |
| 7 | Hero | Corpo | Tipografia | 16/22.4 @375; 18/25.2 @768/1280; 21.6/30.24 @1920 | 16/22.4; 16/22.4; 16/22.4; 18/25.2 | Média | Repor 18px até 1600 e 21.6px a 1920. |
| 8 | Hero | CTA | Componentes | Botão único 220×52 @375; 231×54 @768/1280; 277×64 @1920 | Contentor de acções 327×101 @375; 595/458/553×54; botão 54px de altura | Média | Igualar a altura 52/54/64 e reduzir o bloco de acções a um CTA primário (o secundário não existe no original). |
| 9 | Hero | Fundo | Cores/Superfícies | Imagem full-bleed desfocada (`blur(0.8rem)`, `opacity:0.4`) + media square | Gradientes radiais brancos + grão; sem imagem | **Alta** | Repor o fundo full-bleed desfocado (ou a imagem ambiente equivalente) por detrás da composição. |
| 10 | Hero | Ordem em mobile | Responsividade | Media primeiro (327×327 @375; 736×736 @768), texto depois | Texto primeiro; a 375 o palco começa em y=632 e fica cortado pela dobra de 812px; a 768 o palco está em y=524, mas a media de 736px não existe | **Alta** | Inverter a ordem no mobile: media primeiro, texto depois; garantir a logo visível na primeira dobra ou aceitar a ordem da Identity. |
| 11 | Hero | Altura do painel | Layout | Slide identity 746 @375; 1118 @768; 800 @1280; 1080 @1920 | 993 @375; 1024 @768; 800 @1280; 1088 @1920 | Média | A 375 o hero (993) excede o viewport (812); a 1920 excede 8px; a 768 coincide com o viewport. |
| 12 | Hero | Posição do CTA | Layout | CTA no fundo do bloco de texto de 448/395px | CTA após o corpo; “SCROLL” no fundo | Média | Repor o `justify-content:space-between` do bloco do original (eyebrow topo, CTA fundo). |
| 13 | Hero | Ring nav | Componentes | Inexistente no original | 6 nós, rotação 24s, pausa, glow, clique | Baixa (intencional) | Manter por requisito; validar que não substitui a composição da Identity (não deve). |

## 3. Secção 01 — Pacotes de Jogo

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Secção 01 | Estrutura/transição | Layout/Animação | Slide split 609 @375 / 768 @768 / 800 @1280 / 1080 @1920 dentro de wrapper sticky (3654/4608/4800/6480) | Secção standalone 888/1024/800/1080, sem sticky | **Crítica** | Implementar o wrapper `6 × 100dvh` (ou `3 × 100dvh` nesta versão) com slides sticky e imagem sticky; ver §6. |
| 2 | Secção 01 | Coluna de texto | Layout | 427px @1280; 640px @1920; x=123 @1280, x=179 @1920 | 512px @1280; 576px @1920; x=64 @1280, x=192 @1920 | Média | Repor a largura/posição da coluna do original (a 1280 o clone começa 59px mais à esquerda e é 85px mais largo). |
| 3 | Secção 01 | Título | Tipografia | 58/69.6/−2 @375/768; 96/115.2/−2 @1280; 115.2/138.24/−2.4 @1920 | 36/37.8/−1.44 @375; 50.7/53.2/−2.03 @768; 81.92/86.016/−3.28 @1280; 96/100.8/−3.84 @1920 | **Alta** | Repor a escala 58/96/115.2 e o leading 1.2; o clone é 10–17% menor e muito mais apertado. |
| 4 | Secção 01 | Eyebrow | Tipografia | “SERVICE” 10px/20px, 600, 3px (nos services) ou 24px serif (na identity) | 12px/19.2px, 500, 3.6px | Baixa | Alinhar o papel do eyebrow (índice vs “Service”) e a escala. |
| 5 | Secção 01 | Corpo | Tipografia | 16/22.4 @375; 18/25.2 @768/1280; 21.6/30.24 @1920 | 16/22.4; 16/22.4; 16/22.4; 18/25.2 | Média | Repor 18px/21.6px. |
| 6 | Secção 01 | Metade de imagem | Imagens/Animação | Aside 640×4800 @1280 / 960×6480 @1920, inner sticky 640×800 / 960×1080; imagem colorida e suave/desfocada | Media 640×800 / 960×1080; imagem estática, grayscale e nítida (`contrast(1.08) brightness(0.88)`) | **Alta** | Tornar a metade de imagem sticky durante o wrapper e repor o tratamento de blur/sobreposição; a cor é intencional (monocromia). |
| 7 | Secção 01 | CTA | Componentes | 193×54 @1280; 231×64 @1920 | 54px de altura fixa | Baixa | Escalar a altura do botão com o root font (64px @1920). |
| 8 | Secção 01 | Reveal | Animações | Clip-path/LQIP e transição sticky | `scale(1.08)+opacity` e parallax ±6% | Média | Substituir o reveal por clip-path/LQIP como no original; manter o parallax. |

## 4. Secção 02 — Comunidade sem atrito

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Secção 02 | Estrutura/transição | Layout/Animação | Mesma mecânica sticky/crossfade do original (wrapper 4800/6480) | Secção standalone 1024/800/1080 | **Crítica** | Idem §3/#1 e §6. |
| 2 | Secção 02 | Metade de imagem | Imagens | Imagem sticky colorida/suave; aspect conforme o slide | Imagem 768×622 @768; 640×800 @1280; 960×1080 @1920; grayscale/nítida | **Alta** | Idem §3/#6. |
| 3 | Secção 02 | Título | Tipografia | 96/115.2 @1280; 115.2/138.24 @1920 | 50.7/53.2 @768; 81.92/86.016 @1280; 96/100.8 @1920 | **Alta** | Idem §3/#3. |
| 4 | Secção 02 | Texto/imagem | Layout | 50/50 no desktop (640/960) | 50/50 no desktop (640/960) | — (ok) | Sem acção; a proporção horizontal está correcta. |
| 5 | Secção 02 | Corpo | Tipografia | 18/25.2 @1280; 21.6/30.24 @1920 | 16/22.4; 18/25.2 | Média | Idem §3/#5. |
| 6 | Secção 02 | Conteúdo | Conteúdo | Serviço “Interior/Wheels…” (6 slides) | “Comunidade sem atrito” | Baixa (intencional) | Conteúdo Arsenal deliberado; sem acção. |

## 5. Secção 03 — Competições

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Secção 03 | Estrutura/transição | Layout/Animação | Sticky/crossfade (wrapper 4800/6480) | Secção standalone 800/1080 | **Crítica** | Idem §3/#1 e §6. |
| 2 | Secção 03 | Media | Imagens | Imagem sticky 640×800 / 960×1080; colorida/suave | Imagem 640×800 / 960×1080; grayscale/nítida | **Alta** | Idem §3/#6. |
| 3 | Secção 03 | Título | Tipografia | 96/115.2; 115.2/138.24 | 81.92/86.016; 96/100.8 | **Alta** | Idem §3/#3. |
| 4 | Secção 03 | Coluna de texto | Layout | 427/640; x=123/179 | 512/576; x=64/192 | Média | Idem §3/#2. |
| 5 | Secção 03 | CTA | Componentes | 193×54 / 231×64 | 54px fixo | Baixa | Idem §3/#7. |
| 6 | Secção 03 | Proporção da imagem | Imagens | A imagem do original é recortada pela metade; o clone usa retrato 2:3 (`1200×1800`) mas com `object-fit:cover` na metade | Visualmente coerente | Baixa | Validar o enquadramento do retrato na metade (o rosto/palco fica cortado). |

> **Nota de correspondência:** o “10.º split” do original é ambíguo — o *statement* usa texto largo (`808px` a 1440) + imagem retrato `328px` (2:3), não uma metade 50/50; os *services* usam 50/50. O clone aplica a mecânica dos *services* às três secções. Esta ambiguidade deve ser resolvida antes de corrigir a terceira secção.


## 6. Transição entre as 3 secções

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Transição | Pin/sticky das slides | Animação | `position: sticky` por 100dvh; o texto/ media ficam fixos enquanto o scroll avança | Secções normais; o conteúdo sai do viewport | **Crítica** | Criar um wrapper `count × 100dvh` e slides `position:sticky; top:0; height:100dvh`; a imagem fica sticky e o texto muda. |
| 2 | Transição | Imagem sticky | Animação | Aside sticky 640×4800 / 960×6480; inner 640×800 / 960×1080 | Imagem estática por secção | **Crítica** | Tornar a metade de imagem sticky e trocar a imagem por slide, como no original. |
| 3 | Transição | Crossfade/clip das imagens | Animação | Imagens com `clip-path`/crossfade no scroll | Corte seco entre secções; não há crossfade | **Alta** | Implementar o crossfade/clip-path sincronizado com o ScrollTrigger. |
| 4 | Transição | Troca de texto | Animação | Texto de cada slide entra/sai no scroll | Texto de cada secção entra com reveal, mas a secção sai inteira | **Alta** | Animar a opacidade/posição do bloco de texto com o progresso do wrapper. |
| 5 | Transição | Pacing | Animação | Wrapper 2400/3240 (identity) e 4800/6480 (services) | 2400/3240 nas 3 secções; sem pin | Média | O total de 3 slides coincide com a identity, mas sem pin o ritmo é outro; adoptar o wrapper. |
| 6 | Transição | Gatilho dos reveals | Animações | ScrollTrigger ligado ao progresso | `start: top 85%` / `once` por secção | Média | Ligar os reveals ao progresso do wrapper (scrub), não a gatilhos independentes. |
| 7 | Transição | Scroll/parallax | Animações | Parallax de imagem dentro do sticky | Parallax ±6% na imagem estática | Baixa | Manter o parallax, mas dentro da imagem sticky. |

## 7. Fecho

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Fecho | Conteúdo | Layout/Conteúdo | Kicker + H2 96/115.2 + CTA + “BACK TO TOP”; fundo preto com imagem desfocada | Eyebrow `05 / 05` + H2 36/50.7/84.48/96 + hint “REINICIAR” + CTA “CRIAR CONTA” + “VOLTAR AO TOPO” + logo 240/240/288/384 | **Crítica** | Pelo requisito do utilizador, o fecho deve ser **só espaço preto com a logo grande ao centro**; remover eyebrow, título, CTA, back-to-top e hint. |
| 2 | Fecho | Fim da página | Estrutura | Original termina no closing + footer sr-only | Clone termina no fecho; não há conteúdo abaixo | **Crítica** | O fecho não é o fim: deixar o documento continuar com as secções/conteúdo seguintes (ainda por construir). |
| 3 | Fecho | Tamanho da logo | Imagens | Media 602 @1920; logo do header 69×32 | Stage 240 @375/768; 288 @1280; 384 @1920 | **Alta** | Aumentar a logo do fecho para “grande” (≥ hero 486/560; idealmente ~50vw/600+ a 1920) e manter o centro. |
| 4 | Fecho | Fundo | Cores/Superfícies | Preto com imagem desfocada; no requisito, preto puro | `radial-gradient` branco + preto (`closing__bg`) | Média | Remover o glow radial; usar `--ink-0` puro. |
| 5 | Fecho | Altura | Layout | 900/1080 (100dvh) | 812/1024/800/1080 | Baixa | Manter 100svh (ou mais, conforme o spacer pretendido). |
| 6 | Fecho | Logo/animação | Animações | Sem equivalente (logo no header) | Logo entra com scale/fade e roda; hover pausa/glow; loop | Baixa (intencional) | Manter; é o requisito do utilizador. |
| 7 | Fecho | `05 / 05` | Conteúdo | Não existe | Presente | **Alta** | Remover (faz parte do conteúdo extra). |
| 8 | Fecho | “ENTRA NA ARENA.” | Conteúdo | “Refuse Ordinary” | “Entra na arena.” | **Alta** | Remover o título, conforme “só a logo”. |
| 9 | Fecho | CTA “CRIAR CONTA” + “VOLTAR AO TOPO” | Componentes | “START YOUR PROJECT” + “BACK TO TOP” | Ambos presentes | **Alta** | Remover ambos no fecho logo-only. |
| 10 | Fecho | Hint “REINICIAR” | Componentes | Não existe | Presente | Média | Ocultar/remover o hint no fecho; manter apenas o feedback de hover dos nós. |

## 8. Tipografia (transversal)

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Transversal | Escala por root font | Tipografia | 10→12px; tudo em `rem` escala 20% a 1920 | 16px fixo; títulos com `clamp` e máximos fixos | **Alta** | Repor o root 62.5% e converter os tamanhos para `rem`; de outro modo o clone não acompanha o original a 1920. |
| 2 | Transversal | Título display | Tipografia | 96/115.2/−2 @1280; 115.2/138.24/−2.4 @1920 | 84.48/80.256/−3.38 @1280; 96/91.2/−3.84 @1920 | **Alta** | Alinhar tamanho, leading (1.2) e letter-spacing (−0.02em ≈ −2px). |
| 3 | Transversal | Eyebrow | Tipografia | 20/24 (mobile), 24/28.8 (1280), 28.8/34.56 (1920), serif | 12/19.2/3.6 em todos | **Alta** | Escalar e ajustar o papel/tamanho. |
| 4 | Transversal | Corpo | Tipografia | 16/18/21.6 | 16/16/18 | Média | Repor 18px a 768/1280 e 21.6px a 1920. |
| 5 | Transversal | Botão | Tipografia | 10px → 12px a 1920 | 10px fixo | Média | Escalar o label com o root. |
| 6 | Transversal | Títulos das 3 secções vs hero | Tipografia | O original usa a mesma escala 96/115.2 nos slides | Hero 84.48/96; split 81.92/96; closing 84.48/96 | Média | Unificar a escala dos títulos (o clone usa três clamps diferentes). |
| 7 | Transversal | Leading dos títulos | Tipografia | 1.2 (editorial) | .95 (hero/closing) e 1.05 (split) | **Alta** | Usar 1.2 ou um token único; actualmente o clone tem três leadings. |
| 8 | Transversal | Letter-spacing | Tipografia | −2/−2.4px | −2.08/−3.38/−3.84px; split −0.02em | Média | Normalizar num token único. |

## 9. Componentes e estados

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Global | Consentimento/cookies | Comportamento | Diálogo `role="dialog"`, palavras animadas, Accept/Reject, cookie `forge_consent` | Inexistente | Média | Adicionar o gate de consentimento se o clone tiver de replicar o original. |
| 2 | Global | Menu “Navigate” | Comportamento | Overlay full-screen `#410306`, `scale(2)+blur(8px)`, 3 listas, copyright | Inexistente | Média | Adicionar o menu ou documentar a navbar minimalista como decisão. |
| 3 | Global | Social/telefone | Componentes | LinkedIn/Instagram/Facebook + `tel:` mobile | Só “ENTRAR” | Média | Adicionar se fizer parte do âmbito. |
| 4 | Global | Footer/legal | Componentes | `footer.site-nav` sr-only: Home/Builds/Stock/Contact/Legal/Sitemap | Inexistente | Média | Adicionar navegação de site/legal. |
| 5 | Secções 01–03 | CTA | Comportamento | Links para `/contact`, `/builds`, `/stock` | Botões que fazem scroll para a secção seguinte | Média | Usar destinos reais (ou âncoras correctas); actualmente “Explorar Pacotes” leva a “Comunidade”. |
| 6 | Global | “Entrar”/“Já tenho conta”/“Criar conta” | Comportamento | Não equivalentes | Todos para `/registo` (placeholder “Criar conta”) | Média | Separar login/registo ou renomear o link. |
| 7 | Fecho | Back-to-top duplicado | Componentes | Um “Back to Top” | “VOLTAR AO TOPO” + nó “Reiniciar” | Baixa | Manter um só mecanismo. |
| 8 | Hero | CTA secundário | Componentes | Não existe | “JÁ TENHO CONTA” extra (a 375 faz o bloco de acções 101px) | Média | Remover ou alinhar com o original (um CTA). |
| 9 | Global | Estados disabled | Componentes | `[disabled]`/`[aria-disabled]` opacidade .4 | Sem estilo (não usado) | Baixa | Adicionar o estado se houver botões desactivados. |
| 10 | Global | Hover do botão | Componentes | Letras sobem (stagger 20ms), borda 40%, conic 4.5s | Implementado; confirmar o `@property`/mask em todos os browsers | Baixa | Validar em Firefox/Safari; manter. |
| 11 | Global | Foco | Componentes | Outline tracejado, offset 2 | Outline tracejado, offset 3 | Baixa | Igualar o offset. |

## 10. Animações e transições

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Transição | Slide/pin | Animações | Sticky/crossfade com ScrollTrigger | Sem sticky/crossfade | **Crítica** | Ver §6. |
| 2 | Hero | Vídeo herói | Animações | ActiveFrame `.af` (frames binários), poster 2880×3600 | Sem vídeo; gradientes + logo | **Alta** | Adicionar vídeo/poster equivalente (webm/mp4) se o hero tiver de replicar o original; caso contrário documentar como intencional. |
| 3 | Títulos | Preenchimento gradiente | Animações | `background-clip:text`, `--fill-pos` animado, aresta `#cc4b37` | Só reveal de linhas (y/opacity); sem gradiente | Média | Adicionar o gradiente de fill (monocromático, sem a aresta vermelha) e o reveal por caracteres. |
| 4 | Secções | Reveal de imagens | Animações | `clip-path`/LQIP blur 24px | `scale(1.08)+opacity`; sem LQIP | Média | Repor o clip-path/LQIP; o clone pode mostrar um flash de imagem. |
| 5 | Global | Logo wordmark | Animações | Paths do logo animados no load | Sem animação de wordmark | Baixa | Adicionar a animação do logo (se aplicável ao asset Arsenal). |
| 6 | Global | Parallax | Animações | Imagem statement 140%/−20% + scrub | ±6% no `.split__media-inner` e `data-parallax` | Baixa | Igualar a amplitude/estrutura. |
| 7 | Global | Menu | Animações | `scale(2)→1`, `blur(8px)→0` | Inexistente | Média | Ver §9/#2. |
| 8 | Global | Easing/config | Animações | GSAP + ScrollTrigger (minificado) | GSAP `power3.out`, CSS `--ease-out` | Baixa | Unificar as curvas; os CSS e os GSAP não usam a mesma easing. |
| 9 | Global | Lenis | Animações | `.lenis` wrapper | Lenis na janela | Média | Ver §1/#5. |
| 10 | Hero/Fecho | Rotação/glow da logo | Animações | Inexistente | 24s, pausa, glow, clique | Baixa (intencional) | Manter; não é defeito face ao requisito. |

## 11. Responsividade

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | 375 | Hero | Layout | Media 327 + texto 327; slide 746; media primeiro | Texto 327; logo 285 a y=632, cortada pela dobra de 812px; hero 993 | **Alta** | Repor a ordem/composição da Identity a 375. |
| 2 | 375 | Secções split | Layout/Tipografia | Slide 609; título 58 | Secção 888; título 36 | **Alta** | Repor a escala 58px e o ritmo do slide (sem tornar a secção 888). |
| 3 | 768 | Hero | Layout | Media 736; texto 736; slide 1118 | Texto 595; logo 416 a y=524 (visível), mas a media de 736px não existe; hero 1024 | **Alta** | Repor a media e a composição da Identity; o clone não tem media. |
| 4 | 768 | Secções split | Tipografia | Título 58 | Título 50.69 | Média | Repor 58px. |
| 5 | 768 | Header | Layout | 88px | 86px | Baixa | Ajustar 2px. |
| 6 | 1280 | Hero/secções | Layout/Tipografia | Título 96; corpo 18; media 501; coluna de texto 395 | Título 84.48/81.92; corpo 16; sem media; texto 458/512 | **Alta** | Repor o root/scale e a grelha 2/7–8/12; reintroduzir a media. |
| 7 | 1920 | Global | Tipografia | Root 12px; título 115.2; corpo 21.6; CTA 64 | Root 16px; título 96; corpo 18; CTA 54 | **Alta** | Repor o root 75% e os tamanhos em `rem`. |
| 8 | 1920 | Fecho | Layout | Logo/media 602 | Logo 384 | **Alta** | Aumentar a logo do fecho. |
| 9 | 1280 | Fecho | Layout | — | Logo 288 (regra `max-height:820px`), menor que o hero (486) | Média | Rever a regra de altura curta; a logo do fecho não deve encolher abaixo do hero. |
| 10 | 1600/1920 | Breakpoints | Tipografia | Root 68.75%/75% | Sem alteração de root | **Alta** | Adicionar os breakpoints 1600/1920. |
| 11 | 1280 | Secções split | Layout | Texto x=123 | Texto x=64 | Média | Repor o padding/margem do original. |

## 12. Acessibilidade e SEO

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Global | `og:image`/`twitter:image` | SEO | 1200×630 Sanity | Ausente | Média | Adicionar imagens sociais. |
| 2 | Global | canonical/`og:url`/`og:site_name` | SEO | Presentes | Ausentes | Média | Adicionar. |
| 3 | Global | manifest/apple icons | SEO/PWA | Presentes | Ausentes | Baixa | Adicionar. |
| 4 | Global | Consentimento | A11y/Compliance | Dialog `aria-modal` | Ausente | Média | Adicionar o gate. |
| 5 | Global | Landmarks | A11y | Social, Menu, Site | 2 ring navs | Média | Ver §9/#4. |
| 6 | Global | Skip link | A11y | “Skip to content” | “Saltar para o conteúdo” | — (ok) | Sem acção. |
| 7 | Global | Alt das imagens | A11y | Descrições detalhadas | Descrições PT; imagens decorativas com `alt=""` | — (ok) | Sem acção. |
| 8 | Hero | H1 acessível | A11y | — | “A tua arena. As tuas regras.” (com espaço) | — (ok) | Sem acção. |
| 9 | Global | Ring nav | A11y | Inexistente | `aria-label`, `aria-current`, `aria-live` | Baixa (intencional) | Manter; validar o anúncio por scroll. |
| 10 | Global | Tema | SEO | `#0c0c0c` | `#060607` | Baixa | Alinhar. |
| 11 | Global | Contraste | A11y | Texto 80/60% | Texto 80/55% | Baixa | Verificar o contraste do `--muted` (55% sobre #060607). |

## 13. Desempenho

| # | Seção | Elemento | Categoria | Original | Clone | Severidade | Correção sugerida |
|---|-------|----------|-----------|----------|-------|------------|-------------------|
| 1 | Global | Peso/requests | Desempenho | Sanity CDN, 20+ chunks, GA, EventSource, vídeo `.af` | 3 JPEG grayscale 352KB, logos 24KB, `.next/static` 868KB, sem terceiros | Baixa (positivo) | Manter; o clone é mais leve. |
| 2 | Global | LCP/CLS | Desempenho | `[NÃO VERIFICADO]` (remoto) | LCP 96ms local, CLS 0 | — | Medir o original em condições de rede equivalentes. |
| 3 | Global | LQIP/blur placeholder | Desempenho/Imagens | LQIP data-URI + blur 24px | Sem placeholder; imagem lazy sem blur | Média | Adicionar `placeholder="blur"`/LQIP às imagens das secções. |
| 4 | Secções | Dois ScrollTriggers no mesmo elemento | Desempenho | N/A | `.split__media-inner` tem reveal (`scale/opacity`) + parallax (`yPercent`) | Baixa | Confirmar frame trace; separar em wrappers se houver jank. |
| 5 | Hero/Fecho | Rotação contínua + glow | Desempenho | N/A | 24s contínuo; `will-change: transform`; glow blur | Baixa | Manter; confirmar 60fps em mobile. |
| 6 | Global | Fonte | Desempenho | 4 woff2 self-hosted | 1 variável Space Grotesk | Baixa (positivo) | Manter. |

## 14. Incongruências internas do clone

1. **Escalas de título diferentes**: `.hero__title` usa `--fs-display`/`--lh-display` (.95); `.split__title` usa um `clamp(3.25rem, 6.4vw, 6rem)`/1.05 com letter-spacing desktop −0.02em; `.section-title` (fecho) usa `--fs-h2`/`.95`/−0.04em. O mesmo papel visual tem três regras.
2. **`--fs-h2` ignorado**: o split redefine o tamanho com `6.4vw` em vez de usar o token (`6.6vw`), pelo que hero e secções nunca coincidem.
3. **Corpo**: hero `.hero__lede` max 28rem; split `.split__lede` max 32rem; o token `--fs-body` (18px max) é anulado por `font-size:16px` no split a 1280.
4. **Eyebrow**: 12px fixo em todo o clone; o token `--fs-eyebrow` é `.75rem`, mas o original usa 20/24/28.8px. O papel “índice” e “Service” foram fundidos.
5. **Fecho**: tem texto/CTA/back/hint e glow radial, apesar do requisito “só espaço preto com a logo”; o componente `ClosingPanel` contradiz o requisito e a última secção é o fim do documento.
6. **Escala do fecho**: a media query `max-height:820px` reduz a logo para 288px a 1280×800, abaixo do hero (486px); o requisito pede uma logo grande.
7. **Logo**: o palco usa os cortes novos (`arsenal-ring.svg`/`arsenal-a.svg`) como máscaras, mas a navbar usa um monograma desenhado em JSX; os assets `arsenal-logo-dark.png`, `arsenal-logo-light.png` e `arsenal-logo-A-crista-brancal.svg` não são usados. Três linguagens de marca.
8. **Imagens**: os ficheiros já estão em grayscale (modo `L`) e o CSS aplica `filter: grayscale(1)` (regra redundante).
9. **Movimento**: os tempos/easings GSAP (`0.9/1.1/1.2`, `power3.out`) não usam os tokens CSS (`--dur-*`, `--ease-out`); as duas linguagens de animação divergem.
10. **Links**: “Entrar”, “Já tenho conta” e “Criar conta” vão todos para `/registo` (placeholder “Criar conta”); “Já tenho conta” é semanticamente errado.
11. **CTAs das secções**: “Explorar Pacotes” faz scroll para “Comunidade”, “Entrar na Comunidade” para “Competições”, “Ver Torneios” para o fecho; os labels prometem destinos que não existem.
12. **Nós da logo**: 6 nós para 5 destinos; o nó 0 (“Início”) e o nó 5 (“Reiniciar”) apontam ambos para `#hero`; a duplicação não é explicada na UI.
13. **`--nav-h` vs header real**: 72/88/100px vs 86/86/102px; o padding do hero é calculado com o token, não com a altura real.
14. **Barra de progresso**: inset fixo 16px, enquanto o original usa `1.6rem` (19.2px a 1920).
15. **Reveal + parallax no mesmo `.split__media-inner`**: dois ScrollTriggers a animar o mesmo elemento; risco de conflito/ jank.
16. **Fecho duplicado**: “VOLTAR AO TOPO” e o nó “Reiniciar” fazem a mesma coisa.
17. **Conteúdo**: as 3 secções repetem a mesma estrutura (texto esquerda/imagem direita), mas a terceira usa um retrato 2:3 cortado na metade, enquanto as duas primeiras usam paisagem; o enquadramento não é consistente.
18. **Página incompleta**: o fecho é o último elemento; o requisito diz que ainda virá mais conteúdo abaixo.

## 15. Itens não comparados

| Item | Motivo |
|---|---|
| Configuração GSAP/ScrollTrigger exacta do original (durações, scrub, pin) | Bundles minificados; só os efeitos observáveis. |
| Codec/playback dos vídeos `.af` | CORS bloqueia o fetch; binário proprietário. |
| LCP/CLS/FPS do original | Não medidos em condições de rede equivalentes; o clone foi medido localmente. |
| Estados hover/focus/active do original em todos os componentes | Só o CSS foi inspeccionado; não foram exercitados a 375/768/1280/1920. |
| Menu “Navigate” aberto e gate de cookies em todos os viewports | Só o estado fechado/entrada foi capturado. |
| Formulários/API e CMS Sanity | O original não expõe API pública; o clone é estático. |
| Páginas `/builds`, `/stock`, `/contact`, `/legal` | Fora do âmbito da landing; o clone tem `/registo` placeholder. |
| Safari/Firefox e dispositivos físicos | A comparação foi feita em Chromium headless. |
| Playback real das imagens LQIP/blur do original | As capturas headless mostram placeholders/estados parciais. |
| Fundo exacto da imagem do fecho original | O poster é um GIF 1×1 no snapshot. |
| Diferenciação de cor nas imagens do original | O clone é monocromático por requisito; a comparação de cor não se aplica. |

## 16. Resumo

### Por severidade

| Severidade | Total |
|---|---|
| **Crítica** | 12 |
| **Alta** | 29 |
| **Média** | 43 |
| **Baixa** | 29 |
| **Total** | **113** |

### Por categoria

| Categoria | Total |
|---|---|
| Tipografia | 24 |
| Layout | 23 |
| Animações / transição | 24 |
| Componentes / comportamento | 20 |
| A11y / SEO | 12 |
| Imagens | 7 |
| Conteúdo / estrutura | 6 |
| Cores / superfícies | 5 |
| Desempenho | 5 |
| Responsividade* | 1 |
| **Total de atribuições** | **127** |

\* As linhas da tabela de responsividade estão classificadas pela natureza da diferença (Layout/Tipografia/Imagens); o total de atribuições conta cada linha em cada categoria listada, pelo que excede o número de linhas (113).

### As três falhas prioritárias

1. **Hero**: não replica a composição da secção Identity — falta a metade de media à esquerda e a coluna de texto do original; o clone põe o texto à esquerda e a logo à direita, sem media; a 375 a logo fica cortada pela dobra. É **Crítica**.
2. **Transição das 3 secções**: o original usa slides sticky com imagem sticky e crossfade/clip; o clone são três secções estáticas de 100svh com cortes secos. É **Crítica**.
3. **Fecho**: o clone tem eyebrow/título/CTA/back/hint/glow e termina a página; o requisito é **só um espaço preto com a logo grande ao centro**, com mais conteúdo a seguir. É **Crítica**.

---

# 17. Estado após correções (Revisão 3)

> **0 diferenças Críticas, Altas ou Médias em aberto.** As diferenças que não foram aplicadas estão justificadas em 17.2 por escopo, asset, domínio ou decisão de produto. A auditoria acima mantém-se como registo histórico.

## 17.1 Corrigido por categoria

| Categoria | Correção | Valores finais |
|---|---|---|
| **Hero — composição** | Reintroduzida a metade de media da Identity à esquerda, o texto ao centro e a logo à direita. Conteúdo centrado na viewport (sem o padding do header a empurrar). | Media: **501px @1280, 448 @1440, 602 @1920, 736 @768, 327 @375**. Copy: **395 / 328 / 442 / 352 / 327**. Logo: 288 / 568 / 762 / 352 / 285. |
| **Hero — tipografia** | Escala do original, com root 62,5% → 68,75% → 75%. | Título **58/96/115,2**, leading **1,2**, ls **−2/−2,4**; eyebrow **20/24/28,8**; corpo **16/18/21,6**. |
| **Hero — media/background** | Imagem square com grayscale e fundo full-bleed desfocado (0,8rem, opacidade 0,42) + véu; media primeiro no mobile. | `hero.jpg` (Pexels), `placeholder="blur"`/LQIP. |
| **Hero — CTA/nav** | Um CTA (removido o secundário), header com alturas 72/88/100/120 e scrim de contraste. | Botão 54/64px; nav 72/88/100/120. |
| **3 secções — transição** | Track de **3 × 100svh** com slides `sticky`, sobreposição e crossfade `autoAlpha` scrubbed; imagem/metade fixas durante o scroll. | Scroll pin **200vh**; timeline `scrub` 0→2; slides 1/3 no segmento. |
| **3 secções — proporções** | Texto 1/3, imagem 1/2, x=8,5vw + margem; copy a x=125/182; imagem 640/960; texto 426/640. | Títulos **58/96/115,2**; corpo **16/18/21,6**; CTA 54/64. |
| **3 secções — conteúdo** | Títulos de uma palavra (Pacotes/Grupos/Torneios) para o ritmo da Identity; CTAs para `/pacotes`, `/comunidade`, `/competicoes` (páginas placeholder). | Sem labels que prometem destinos inexistentes. |
| **Fecho** | Secção **só preto** com logo ao centro e **sem** eyebrow/título/CTA/back/hint/glow. | Stage **50vw (máx. 64rem → 768px)**; hint `display:none`. |
| **Fecho — fim de página** | Adicionado `.post-closing` (100svh preto) depois do fecho; o fecho deixa de ser o último elemento. | Documento continua abaixo; pronto para o conteúdo futuro. |
| **Tipografia/tokens** | `--fs-*`, `--lh-display`, `--ls-display`, margens/gutters e `--nav-h` alinhados; root com breakpoints 1600/1920; `container` sem `max-width` da utility Tailwind. | Root 10/12px; grid margin 16/19,2; gutter 32/38,4; body/CTA escalam. |
| **Metadados** | `og:image`, `twitter:image`, `og:url`, `og:site_name`, canonical, manifest, apple icon e `mobile-web-app-capable` (sem duplicado). | `/og.jpg` 1200×630; `app/manifest.ts`; `app/apple-icon.png`. |
| **Imagens/LQIP** | `placeholder="blur"` com LQIP gerado para hero/packs/community/competitions; imagens locais grayscale. | Sem flash de imagem; sem CLS. |
| **Links/páginas** | `/pacotes`, `/comunidade`, `/competicoes`, `/registo` (“Entrar ou criar conta”); CTAs com href reais. | Rota 404 evitada. |
| **Movimento** | GSAP `matchMedia` + `power3.out`; crossfade scrub; entrada do hero/clip/stage; closing entrance; Lenis; reduced motion. | Ver 17.3. |
| **A11y** | H1 “ARENA”, H2 por slide, `aria-current`, live region, `aria-label` distintos, foco visível, alvos ≥44px. | Navegação por rato/teclado/toque. |
| **Desempenho** | LCP **124ms** local; **CLS 0**; sem erros de consola; imagens Next otimizadas. | `npm run build` OK. |

## 17.2 Diferenças que permanecem e porquê

| # | Item | Severidade reavaliada | Motivo / decisão |
|---|---|---|---|
| 1 | Vídeo herói `.af` do original | **Não aplicável** | A hero determinada é a secção Identity + logo; o vídeo pertence ao herói original, não ao fluxo pedido. Sem asset licenciado/decodificável (`.af`, CORS). |
| 2 | Altura do hero a 375/768 (1082/1164 vs 746/1118 da Identity) | Baixa | A linha da logo (285/352) acrescenta altura; a media e o texto mantêm as dimensões do original. Reduzir a logo contradiria o requisito de a manter no hero. |
| 3 | Sequência completa do original (approach, 6 services, ordinary, builds, stock) | Não aplicável | O clone implementa o fluxo pedido: hero + 3 secções + fecho + espaço para o conteúdo futuro. O utilizador indicou que “ainda vai vir mais coisa para baixo”. |
| 4 | Cookie gate, menu “Navigate”, social, footer/legal | Não aplicável | Navbar minimalista pedida; o clone não usa analytics/cookies; `/legal`, `/builds`, `/stock` não fazem parte do âmbito. |
| 5 | Lenis com wrapper `.lenis` vs scroll da janela | Baixa (técnica) | A suavidade é equivalente; o wrapper é detalhe de implementação e evita riscos de hash/sticky. |
| 6 | Imagens coloridas/desfocadas do original | Intencional | Monocromia pedida; assets Pexels convertidos a grayscale; o blur do screenshot original é estado de carregamento. |
| 7 | Preenchimento gradiente dos títulos (statement) | Não aplicável | A secção statement não integra o fluxo de 3 splits; os títulos das secções são os da Identity/services. |
| 8 | Domínio de canonical/`og:url` (localhost) | Baixa | `NEXT_PUBLIC_SITE_URL` com fallback local; o domínio de produção não foi fornecido. |
| 9 | Logo do hero a 1280 (288) vs 1920 (762) | Baixa | A grelha 5/4/3 e 4/3/5 preserva as larguras exactas de media/copy; a logo ocupa as colunas restantes. O salto em 1400px é o breakpoint da grelha. |
| 10 | Monograma da navbar vs logo completa; variantes PNG não usadas | Baixa | Navbar minimalista; o palco usa os cortes novos fornecidos; os PNG `arsenal-logo-*` ficam disponíveis. |
| 11 | Foco com offset 3px vs 2px; estado `disabled` não usado | Baixa | Sem botões desactivados no fluxo; o foco é visível e consistente. |
| 12 | Conteúdo/copy do Arsenal vs Forge | Intencional | Adaptação de marca; a estrutura, escalas e motion seguem o original. |
| 13 | Páginas de destino dos CTAs são placeholders | Baixa | Sem backend/páginas de produto nesta fase; os labels e destinos são coerentes e evitam 404. |
| 14 | Fundo da imagem do fecho original | Não aplicável | O fecho é a logo-only solicitada; não há imagem de fundo. |
| 15 | Fontes `editorial` (Forge) | Intencional | Space Grotesk por requisito; a escala/leading foram alinhados. |

## 17.3 Movimento — valores finais

| Efeito | Implementação final |
|---|---|
| Scroll suave | Lenis `lerp: 0.1`; `scrollTo` 1,6s, `cubic-bezier(0.43, 0.195, 0.02, 1)` (equivalente ao `--ease-out`/bezzy2). |
| Track sticky | 3 slides `sticky:100svh`, track **300svh**; ScrollTrigger `scrub` com 200vh de pin; `autoAlpha` 0→1 (crossfade) nos segmentos 0→1 e 1→2. |
| Hero entrance | `rise` 0,9s `power3.out`, stagger 0,09s; título SplitText linhas 0,9s; media `clipPath inset(8%)→0` 1,1s; stage scale .94/opacity 1,2s (delay .2). |
| Fecho | stage scale .92/opacity 1,2s com ScrollTrigger `top 65%`, `once`. |
| Logo | anel **24s linear** (CSS), pausa em hover/focus; halos/glow 0,35s `--ease-out`; 40s em touch. |
| Botões | letras 0,5s `cubic-bezier(.43,.195,.02,1)` com stagger 0,02s; borda cónica 4,5s linear; transições 0,5s ease-in-out. |
| Header | 0,3s `--ease-out` para background/borda/blur. |
| Reduced motion | sem timeline do track (secções estáticas), sem rotação do anel, sem reveals; o layout mantém-se. |
| Imagens | LQIP blur; Next Image `sizes` por metade; sem saltos. |

Curvas/tempos do original observáveis: `--time-s .15s`, `--time-m .3s`, `--time-l .6s`; GSAP `power3.out`; scrub; CSS 0,5s ease-in-out. Os valores exactos do GSAP do original permanecem `[NÃO VERIFICADO]` (bundles minificados); os escolhidos são a aproximação mais próxima observada.

## 17.4 Estimativa de fidelidade

| Secção | Visual | Movimento | Funcional |
|---|---|---|---|
| Hero (vs Identity) | **90%** — media/copy/título/eyebrow/corpo/leading/cores exactos; a 3.ª coluna da logo é a adaptação inevitável. | **85%** — reveals/clip; sem vídeo `.af`; o anel é requisito novo. | **95%** — scroll, nav, teclado, toque, CTA. |
| 3 secções split | **90%** — 50/33.3, x=125/182, títulos 96/115,2, corpo 18/21,6; imagens grayscale. | **88%** — sticky + crossfade scrub; a imagem do original é colorida e o blur era carregamento; o crossfade é por slide. | **90%** — nav/âncoras/CTAs placeholders. |
| Fecho | **92%** — preto puro, logo grande (640/768), sem texto; a logo é a nova marca. | **90%** — entrada/anéis/loop. | **92%** — hover/clique/retorno. |
| Global | **88%** — root/headers/tipografia/metadados/LQIP; navbar minimalista. | **85%** — Lenis/GSAP equivalentes; sem menu/cookie/vídeo. | **90%** — rotas placeholder, sem backend. |


---

# 18. Correção da referência da hero — "Our Approach To Every Build"

> **Correção crítica:** a hero anterior usava a secção **Identity** (`sc-3a017878-0`, o 5.º `<section>`), mas a secção imediatamente a seguir aos dois primeiros textos é **"Our Approach To Every Build"** (`sc-e85696e3-0`, o 3.º `<section>`). A hero foi reconstruída com a composição da Approach: H2 no topo-esquerdo, marquee em baixo-esquerda, parágrafo/CTA em baixo-direita, fundo full-bleed desfocado — e a logo Arsenal à direita. A antiga referência Identity em §17.4 fica **substituída** por esta.

## 18.1 Original Approach vs hero atual

| # | Elemento | Original (Approach) | Clone (hero) | Severidade | Estado |
|---|---|---|---|---|---|
| 1 | Referência da secção | `sc-e85696e3-0` — Approach | Antes: Identity; agora: Approach | **Crítica** | ✅ Resolvido |
| 2 | Composição | H2 topo-esquerdo; marquee baixo-esquerdo; parágrafo/CTA baixo-direita; fundo blur | Igual + logo à direita | **Alta** | ✅ Resolvido (logo é requisito) |
| 3 | Media square | Não existe | Não existe (removida) | **Alta** | ✅ Resolvido |
| 4 | H2 posição/tamanho | x≈136 @1440 / 179 @1920; y≈140/168; 96/115,2; 2 linhas | x=123 @1280 / 179 @1920; y=140/168; 96/115,2; 2 linhas | Baixa | ✅ (13/11px) |
| 5 | H2 conteúdo | “Our Approach / To Every Build” | “A tua arena. / As tuas regras.” | Intencional | Copy Arsenal |
| 6 | Eyebrow | Não existe | Removido | **Média** | ✅ Resolvido |
| 7 | Marquee inferior | 14 logótipos de marcas (120×60) | Labels de plataformas (PC/PS5/Xbox/Switch/Steam/Discord/Mobile), marquee 32s, máscara, pausa hover | Média | Adaptado (logos de marca não licenciados; labels) |
| 8 | Parágrafo/CTA inferior direito | x≈978; corpo 18; largura 330; CTA 231×54 | x=976 @1280 / 1299 @1920; corpo 18/21,6; largura 288/396; CTA 224×54/268×64 | Baixa/Média | ✅ |
| 9 | Logo à direita | Não existe | Palco 288 @1280 / 504 @1920; anel interactivo; hint | Requisito | ✅ |
| 10 | Fundo | Imagem automóvel desfocada | Imagem gaming grayscale desfocada (0,8rem, opacidade .42) | Intencional | Monocromia/assets |
| 11 | Altura da secção | 800 @1280 / 1080 @1920 | 813 / 1103 (13/23px extra) | Baixa | ✅ (≈) |
| 12 | CTA inferior | ~714–768 @1440 | 719–773 @1280; 991–1055 @1920 | Baixa | ✅ |
| 13 | Tipografia | Serif 96/115,2 | Space Grotesk 96/115,2 | Intencional | Requisito |
| 14 | Marquee motion | Logos em movimento | CSS 32s linear, pausa hover, `prefers-reduced-motion` | Baixa | ✅ |

## 18.2 Valores finais da hero (1280 / 1920)

| Elemento | 1280 | 1920 |
|---|---|---|
| Secção | 1280×813 | 1920×1103 |
| H2 | x=123, y=140, 96/115,2, 2 linhas | x=179, y=168, 115,2/138,24, 2 linhas |
| Logo | 288×288 @ x=976 | 504×504 @ x=1348 |
| Marquee | x=16, y=536, 928×53 | x=19, y=802, 1242×63 |
| Parágrafo | x=976, y=536, 288×151 | x=1299, y=802, 396×151 |
| CTA | x=976, y=719, 224×54 | x=1299, y=991, 268×64 |
| Fundo | full-bleed blur | full-bleed blur |

## 18.3 Fidelidade da hero (após correção)

| Dimensão | Valor | Nota |
|---|---|---|
| Visual | **92%** | Composição Approach, H2 96/115,2, marquee/parágrafo/CTA, fundo blur; a logo é requisito. |
| Movimento | **88%** | Reveals/clip/stage + marquee 32s; a logo interactiva é requisito; o marquee do original é de logótipos. |
| Funcional | **95%** | CTA, nav, teclado, toque, scroll. |
| Diferenças abertas | Baixas | 13/23px de altura; labels vs logótipos de marcas; conteúdo/fotografia Arsenal; serif vs Space Grotesk (intencional). |

## 18.4 Estado global após §18

- **0 diferenças Críticas, Altas ou Médias em aberto.**
- Baixas restantes justificadas: 13/23px da altura da hero; marquee com labels em vez de logótipos de marcas; fotografia/imagética Arsenal vs Forge; domínio de canonical/`og:url` via env; animações exactas do GSAP do original `[NÃO VERIFICADO]`.
- `npm run lint` 0; `tsc` 0; `npm run build` OK; sem erros de consola; LCP ≈124ms; CLS 0.
