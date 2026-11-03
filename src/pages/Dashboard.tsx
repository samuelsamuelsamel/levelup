import { Link } from "react-router-dom";
import {
  CheckCircle2,
  Clock,
  Gamepad2,
  Library,
  PlayCircle,
  Plus,
} from "lucide-react";
import { useLibrary } from "@/contexts/GamesContext";
import { useLibraryStats } from "@/hooks/useGames";
import { useProfile } from "@/hooks/useProfile";
import { StatCard } from "@/components/dashboard/StatCard";
import { GameCover } from "@/components/games/GameCover";
import { StatusBadge } from "@/components/games/StatusBadge";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { PageLoader } from "@/components/ui/Spinner";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { formatHours } from "@/lib/utils";

export default function Dashboard() {
  const { games, loading } = useLibrary();
  const { profile } = useProfile();
  const stats = useLibraryStats(games);

  if (loading) return <PageLoader label="Carregando seu resumo..." />;

  const recent = games.slice(0, 5);
  const firstName = (profile?.display_name ?? "").split(" ")[0];

  return (
    <>
      <SectionHeader
        title={firstName ? `Olá, ${firstName}` : "Dashboard"}
        description="Sua biblioteca é o registro da sua história como jogador."
        action={
          <Link to="/biblioteca">
            <Button>
              <Plus className="h-4 w-4" aria-hidden />
              Adicionar jogo
            </Button>
          </Link>
        }
      />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          label="Jogos cadastrados"
          value={stats.total}
          icon={<Library className="h-4 w-4" />}
        />
        <StatCard
          label="Zerados"
          value={stats.completed}
          hint={
            stats.total > 0
              ? `${Math.round((stats.completed / stats.total) * 100)}% da biblioteca`
              : undefined
          }
          icon={<CheckCircle2 className="h-4 w-4" />}
          accent
        />
        <StatCard
          label="Em andamento"
          value={stats.playing}
          hint={stats.paused > 0 ? `${stats.paused} pausado(s)` : undefined}
          icon={<PlayCircle className="h-4 w-4" />}
        />
        <StatCard
          label="Horas registradas"
          value={formatHours(stats.totalHours)}
          icon={<Clock className="h-4 w-4" />}
        />
      </div>

      <section className="mt-8">
        <div className="mb-3.5 flex items-end justify-between gap-3">
          <h2 className="text-base font-semibold text-ink">
            Adicionados recentemente
          </h2>
          {games.length > recent.length && (
            <Link
              to="/biblioteca"
              className="text-xs font-medium text-moss-300 hover:text-moss-200"
            >
              Ver biblioteca
            </Link>
          )}
        </div>

        {recent.length === 0 ? (
          <EmptyState
            icon={<Gamepad2 className="h-5 w-5" />}
            title="Nada por aqui ainda"
            description="Assim que você cadastrar um jogo, ele aparece neste resumo com status, horas e avaliação."
            action={
              <Link to="/biblioteca">
                <Button>
                  <Plus className="h-4 w-4" aria-hidden />
                  Adicionar jogo
                </Button>
              </Link>
            }
          />
        ) : (
          <ul className="divide-y divide-base-700 overflow-hidden rounded-xl border border-base-700 bg-base-850">
            {recent.map((game) => (
              <li key={game.id} className="flex items-center gap-3.5 p-3">
                <GameCover
                  url={game.cover_url}
                  name={game.name}
                  className="h-14 w-10 shrink-0"
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-ink">{game.name}</p>
                  <p className="truncate text-xs text-ink-faint">
                    {game.platform || "Plataforma não informada"}
                  </p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  <StatusBadge status={game.status} />
                  <span className="text-xs tabular-nums text-ink-faint">
                    {formatHours(game.hours_played)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </>
  );
}
