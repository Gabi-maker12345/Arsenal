/**
 * Texto de exemplo para avaliar o layout enquanto o conteúdo real não chega.
 * Só é usado quando NEXT_PUBLIC_FIXTURES=1. Os placeholders `{{slot}}`
 * permanecem a fonte de verdade no schema.
 */
const tileLabels = [
  "SQUAD NIGHT",
  "CLIP DO DIA",
  "RANKED",
  "VOZ ABERTA",
  "MEME PACK",
  "TORNEIO",
  "LOBBY",
  "PLAY OF THE DAY",
  "COMBO",
  "REPLAY",
  "FOTO DE GRUPO",
  "ARENA",
  "GLHF",
  "CLUTCH",
  "PARTY",
  "GAMING",
  "HEADSET",
  "SCRIMM",
  "NO SCOPE",
  "AFK?",
  "RUSH B",
  "FINAL",
  "LOADOUT",
  "MVP",
];

const tileSubs = [
  "COMUNIDADE",
  "DESTAQUE",
  "AGORA",
  "CANAL 01",
  "NOVO",
  "LIVE",
  "03/05",
  "SEMANAL",
  "HOJE",
  "ARQUIVO",
  "GRUPO",
  "VÍDEO",
];

const feedWho = [
  "KERNEL",
  "NOVA",
  "ZERO",
  "GHOST",
  "RUNE",
  "ACE",
  "VEX",
  "ORBIT",
  "MIRA",
  "LUME",
];

const feedWhat = [
  "entrou no canal de voz",
  "partilhou um clip",
  "abriu um lobby",
  "subiu de divisão",
  "criou um pacote",
  "marcou um scrim",
  "chamou a equipa",
  "publicou um meme",
  "acendeu o farol",
  "voltou à arena",
];

const feedWhen = [
  "agora",
  "1 min",
  "3 min",
  "5 min",
  "8 min",
  "12 min",
  "15 min",
  "22 min",
  "30 min",
  "1 h",
];

const statLabels = [
  "Membros ativos",
  "Sessões por dia",
  "Tempo em voz",
  "Revisão média",
];

const memberNames = ["KERNEL", "NOVA", "ZERO", "GHOST", "RUNE", "ACE"];

const chips = ["VOZ ABERTA", "CANAL 01", "CONVITE ATIVO"];

const steps = [
  {
    title: "CRIA O GRUPO",
    text: "Dá um nome, escolhe a visibilidade e abre o primeiro canal. O convite nasce com validade e um limite claro.",
  },
  {
    title: "ABRE OS CANAIS",
    text: "Texto, voz e partilha de ecrã no mesmo lugar. Cada pessoa entra com o papel que o dono definir.",
  },
  {
    title: "ENTRA EM JOGO",
    text: "Encontra a equipa, marca o scrim e leva o pacote de jogo aprovado para a partida. A arena fica aberta.",
  },
];

const bento = [
  { title: "PAPÉIS CLAROS", text: "Dono, admin e membro. Permissões visíveis antes de entrar." },
  { title: "CONVITES", text: "Código, validade e limite de pessoas por convite." },
  { title: "VOZ", text: "Canais de voz com soundboard aprovada." },
  { title: "PARTILHA", text: "Ecrã e clipes no mesmo canal, sem sair." },
  { title: "PROCURA", text: "Um quadro para encontrar equipa em minutos." },
];

const footerColumns = [
  {
    title: "PLATAFORMA",
    links: ["Pacotes de jogo", "Comunidades", "Torneios", "Registo"],
  },
  {
    title: "COMUNIDADE",
    links: ["Como funciona", "Diretrizes", "Suporte", "Estado"],
  },
  {
    title: "JOGOS",
    links: ["PC", "PlayStation", "Xbox", "Switch"],
  },
  {
    title: "LEGAL",
    links: ["Privacidade", "Termos", "Cookies", "Contacto"],
  },
];

const linkPaths = ["/pacotes", "/comunidade", "/competicoes", "/registo"];

export function fixtureFor(path: string): string {
  const tile = path.match(/^s01\.tiles\.(\d+)\.(label|sub)$/);
  if (tile) {
    const index = Number(tile[1]);
    return tile[2] === "label"
      ? tileLabels[index % tileLabels.length]
      : tileSubs[index % tileSubs.length];
  }

  const feed = path.match(/^s01\.feed\.(\d+)\.(who|what|when)$/);
  if (feed) {
    const index = Number(feed[1]);
    if (feed[2] === "who") return feedWho[index % feedWho.length];
    if (feed[2] === "what") return feedWhat[index % feedWhat.length];
    return feedWhen[index % feedWhen.length];
  }

  const stat = path.match(/^s01\.stats\.(\d+)\.label$/);
  if (stat) return statLabels[Number(stat[1]) % statLabels.length];

  if (path === "s01.partBHeading") return "PULSO AO VIVO";
  if (path === "s01.cta2.label") return "Abrir Comunidade";

  const member = path.match(/^s03\.members\.(\d+)\.name$/);
  if (member) return memberNames[Number(member[1]) % memberNames.length];

  const chip = path.match(/^s03\.chips\.(\d+)$/);
  if (chip) return chips[Number(chip[1]) % chips.length];

  const step = path.match(/^s03\.steps\.(\d+)\.(title|text)$/);
  if (step) {
    const item = steps[Number(step[1]) % steps.length];
    return step[2] === "title" ? item.title : item.text;
  }

  const tileBento = path.match(/^s03\.bento\.(\d+)\.(title|text)$/);
  if (tileBento) {
    const item = bento[Number(tileBento[1]) % bento.length];
    return tileBento[2] === "title" ? item.title : item.text;
  }

  if (path === "s05.lead") {
    return "Uma voz que atravessa o grupo, o canal e a partida. Sem atrito, sem ruído, sempre contigo.";
  }
  if (path === "s05.cta.label") return "Entrar na voz";
  if (path === "s05.cta2.label") return "Ver comunidades";

  const manifesto = path.match(/^s05\.manifesto\.(\d+)$/);
  if (manifesto) {
    return ["A TUA VOZ", "SEM LATÊNCIA", "SEMPRE LIGADA"][
      Number(manifesto[1]) % 3
    ];
  }

  if (path === "footer.headline.0") return "NÃO JOGUES SOZINHO.";
  if (path === "footer.headline.1") return "TRAZ A TUA EQUIPA.";
  if (path === "footer.cta.label") return "Entrar no Arsenal";
  if (path === "footer.cta.href") return "/registo";

  const column = path.match(/^footer\.columns\.(\d+)\.title$/);
  if (column) return footerColumns[Number(column[1]) % 4].title;

  const columnLink = path.match(
    /^footer\.columns\.(\d+)\.links\.(\d+)\.(label|href)$/,
  );
  if (columnLink) {
    const columnIndex = Number(columnLink[1]) % 4;
    const linkIndex = Number(columnLink[2]) % 4;
    return columnLink[3] === "label"
      ? footerColumns[columnIndex].links[linkIndex]
      : linkPaths[linkIndex];
  }

  if (path === "footer.legal") return "© 2026 Arsenal Gaming Hub · Grupo 6 KERNEL";
  if (path === "footer.timezone") return "Africa/Luanda";

  return path;
}
