import type { GameStatus } from "@/lib/types";

export const GAME_STATUSES: {
  value: GameStatus;
  label: string;
  /** Classes de cor do selo — tons discretos derivados do tema */
  badge: string;
  dot: string;
}[] = [
  {
    value: "wishlist",
    label: "Quero jogar",
    badge: "border-base-600 bg-base-700/60 text-ink-muted",
    dot: "bg-ink-faint",
  },
  {
    value: "playing",
    label: "Jogando",
    badge: "border-moss-600 bg-moss-800/70 text-moss-200",
    dot: "bg-moss-400",
  },
  {
    value: "paused",
    label: "Pausado",
    badge: "border-amber-900/70 bg-amber-950/50 text-amber-200/80",
    dot: "bg-amber-400/80",
  },
  {
    value: "abandoned",
    label: "Abandonado",
    badge: "border-base-600 bg-base-800 text-ink-faint",
    dot: "bg-base-500",
  },
  {
    value: "completed",
    label: "Zerado",
    badge: "border-moss-500 bg-moss-700/60 text-moss-100",
    dot: "bg-moss-300",
  },
];

export const STATUS_LABELS = GAME_STATUSES.reduce(
  (acc, status) => ({ ...acc, [status.value]: status.label }),
  {} as Record<GameStatus, string>,
);

export function statusMeta(status: GameStatus) {
  return GAME_STATUSES.find((item) => item.value === status) ?? GAME_STATUSES[0];
}

/** Sugestões de plataforma. O campo é texto livre: o usuário pode digitar outra. */
export const PLATFORM_SUGGESTIONS = [
  "PC",
  "PlayStation 5",
  "PlayStation 4",
  "Xbox Series X|S",
  "Xbox One",
  "Nintendo Switch",
  "Nintendo 3DS",
  "Steam Deck",
  "Android",
  "iOS",
  "Retro",
];

export const SORT_OPTIONS = [
  { value: "recent", label: "Adicionados recentemente" },
  { value: "name", label: "Nome (A–Z)" },
  { value: "hours", label: "Mais horas jogadas" },
  { value: "rating", label: "Melhor avaliação" },
  { value: "completed", label: "Conclusão mais recente" },
] as const;

export type SortOption = (typeof SORT_OPTIONS)[number]["value"];
