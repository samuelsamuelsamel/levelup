import type { Game, LibraryStats } from "@/lib/types";

/**
 * Função pura: recebe a biblioteca e devolve os números do dashboard e da
 * página de estatísticas. Nada aqui é estimado — tudo vem dos registros.
 */
export function computeStats(games: Game[]): LibraryStats {
  const byStatus = {
    wishlist: 0,
    playing: 0,
    paused: 0,
    abandoned: 0,
    completed: 0,
  };
  let totalHours = 0;
  let ratingSum = 0;
  let ratedCount = 0;
  const platformMap = new Map<string, number>();

  for (const game of games) {
    byStatus[game.status] += 1;
    totalHours += Number(game.hours_played) || 0;
    if (game.rating) {
      ratingSum += game.rating;
      ratedCount += 1;
    }
    const platform = game.platform?.trim() || "Sem plataforma";
    platformMap.set(platform, (platformMap.get(platform) ?? 0) + 1);
  }

  return {
    total: games.length,
    ...byStatus,
    totalHours: Math.round(totalHours * 10) / 10,
    ratedCount,
    averageRating:
      ratedCount > 0 ? Math.round((ratingSum / ratedCount) * 10) / 10 : null,
    platforms: [...platformMap.entries()]
      .map(([platform, count]) => ({ platform, count }))
      .sort((a, b) => b.count - a.count || a.platform.localeCompare(b.platform)),
  };
}
