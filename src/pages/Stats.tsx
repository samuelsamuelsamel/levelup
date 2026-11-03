import { BarChart3, Clock, Star, Trophy } from "lucide-react";
import { useLibrary } from "@/contexts/GamesContext";
import { useLibraryStats } from "@/hooks/useGames";
import { GAME_STATUSES } from "@/lib/constants";
import { formatHours } from "@/lib/utils";
import { StatCard } from "@/components/dashboard/StatCard";
import { DistributionBar } from "@/components/dashboard/DistributionBar";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { RatingStars } from "@/components/games/RatingStars";

const STATUS_BAR_CLASS: Record<string, string> = {
  wishlist: "bg-base-500",
  playing: "bg-moss-400",
  paused: "bg-amber-500/70",
  abandoned: "bg-base-600",
  completed: "bg-moss-300",
};

export default function Stats() {
  const { games, loading } = useLibrary();
  const stats = useLibraryStats(games);

  if (loading) return <PageLoader label="Calculando suas estatísticas..." />;

  if (games.length === 0) {
    return (
      <>
        <SectionHeader
          title="Estatísticas"
          description="Os números são calculados a partir da sua biblioteca."
        />
        <EmptyState
          icon={<BarChart3 className="h-5 w-5" />}
          title="Sem dados para calcular"
          description="As estatísticas aparecem automaticamente conforme você cadastra jogos, horas e avaliações."
        />
      </>
    );
  }

  const ratingBuckets = [5, 4, 3, 2, 1].map((value) => ({
    value,
    count: games.filter((game) => game.rating === value).length,
  }));

  const mostPlayed = [...games]
    .filter((game) => (Number(game.hours_played) || 0) > 0)
    .sort((a, b) => Number(b.hours_played) - Number(a.hours_played))
    .slice(0, 5);

  return (
    <>
      <SectionHeader
        title="Estatísticas"
        description="Tudo calculado a partir dos seus registros, em tempo real."
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Total de jogos"
          value={stats.total}
          icon={<BarChart3 className="h-4 w-4" />}
        />
        <StatCard
          label="Zerados"
          value={stats.completed}
          icon={<Trophy className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Horas registradas"
          value={formatHours(stats.totalHours)}
          hint={
            stats.total > 0
              ? `média de ${formatHours(stats.totalHours / stats.total)} por jogo`
              : undefined
          }
          icon={<Clock className="h-4 w-4" />}
        />
        <StatCard
          label="Nota média"
          value={stats.averageRating !== null ? stats.averageRating.toFixed(1) : "—"}
          hint={
            stats.ratedCount > 0
              ? `${stats.ratedCount} jogo(s) avaliado(s)`
              : "nenhuma avaliação ainda"
          }
          icon={<Star className="h-4 w-4" />}
        />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-base-700 bg-base-850 p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">Jogos por status</h2>
          <div className="space-y-3.5">
            {GAME_STATUSES.map((status) => (
              <DistributionBar
                key={status.value}
                label={status.label}
                count={stats[status.value]}
                total={stats.total}
                barClass={STATUS_BAR_CLASS[status.value]}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-base-700 bg-base-850 p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Jogos por plataforma
          </h2>
          <div className="space-y-3.5">
            {stats.platforms.slice(0, 7).map((item) => (
              <DistributionBar
                key={item.platform}
                label={item.platform}
                count={item.count}
                total={stats.total}
              />
            ))}
          </div>
        </section>

        <section className="rounded-xl border border-base-700 bg-base-850 p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Distribuição das suas notas
          </h2>
          {stats.ratedCount === 0 ? (
            <p className="text-sm text-ink-muted">
              Você ainda não avaliou nenhum jogo. As notas aparecem aqui quando
              houver dados suficientes.
            </p>
          ) : (
            <div className="space-y-3.5">
              {ratingBuckets.map((bucket) => (
                <div key={bucket.value}>
                  <div className="mb-1.5 flex items-center justify-between gap-3">
                    <RatingStars value={bucket.value} />
                    <span className="text-sm tabular-nums text-ink">
                      {bucket.count}
                    </span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-base-800">
                    <div
                      className="h-full rounded-full bg-moss-500"
                      style={{
                        width: `${
                          stats.ratedCount > 0
                            ? (bucket.count / stats.ratedCount) * 100
                            : 0
                        }%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl border border-base-700 bg-base-850 p-5">
          <h2 className="mb-4 text-sm font-semibold text-ink">
            Mais horas registradas
          </h2>
          {mostPlayed.length === 0 ? (
            <p className="text-sm text-ink-muted">
              Nenhum jogo com horas registradas ainda. Edite um jogo para
              informar quanto tempo você jogou.
            </p>
          ) : (
            <ol className="space-y-2.5">
              {mostPlayed.map((game, index) => (
                <li
                  key={game.id}
                  className="flex items-center gap-3 text-sm"
                >
                  <span className="w-4 shrink-0 text-xs tabular-nums text-ink-faint">
                    {index + 1}
                  </span>
                  <span className="min-w-0 flex-1 truncate text-ink">
                    {game.name}
                  </span>
                  <span className="shrink-0 tabular-nums text-ink-muted">
                    {formatHours(game.hours_played)}
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </>
  );
}
