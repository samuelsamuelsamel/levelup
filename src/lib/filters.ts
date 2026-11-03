import type { Game, GameStatus } from "@/lib/types";
import type { SortOption } from "@/lib/constants";

export interface LibraryQuery {
  search: string;
  status: GameStatus | "all";
  platform: string;
  sort: SortOption;
}

/** Remove acentos e caixa para a busca ser tolerante. */
export function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim();
}

export function platformLabel(game: Game): string {
  return game.platform?.trim() || "Sem plataforma";
}

export function listPlatforms(games: Game[]): string[] {
  return [...new Set(games.map(platformLabel))].sort((a, b) =>
    a.localeCompare(b, "pt-BR"),
  );
}

export function countByStatus(
  games: Game[],
): Record<GameStatus | "all", number> {
  const counts: Record<GameStatus | "all", number> = {
    all: games.length,
    wishlist: 0,
    playing: 0,
    paused: 0,
    abandoned: 0,
    completed: 0,
  };
  for (const game of games) counts[game.status] += 1;
  return counts;
}

export function applyQuery(games: Game[], query: LibraryQuery): Game[] {
  const term = normalize(query.search);

  const filtered = games.filter((game) => {
    if (query.status !== "all" && game.status !== query.status) return false;
    if (query.platform !== "all" && platformLabel(game) !== query.platform)
      return false;
    if (term && !normalize(game.name).includes(term)) return false;
    return true;
  });

  const sorted = [...filtered];
  switch (query.sort) {
    case "name":
      sorted.sort((a, b) => a.name.localeCompare(b.name, "pt-BR"));
      break;
    case "hours":
      sorted.sort(
        (a, b) => (Number(b.hours_played) || 0) - (Number(a.hours_played) || 0),
      );
      break;
    case "rating":
      sorted.sort((a, b) => (b.rating ?? -1) - (a.rating ?? -1));
      break;
    case "completed":
      sorted.sort((a, b) => (b.completed_at ?? "").localeCompare(a.completed_at ?? ""));
      break;
    case "recent":
    default:
      sorted.sort((a, b) => b.created_at.localeCompare(a.created_at));
      break;
  }
  return sorted;
}
