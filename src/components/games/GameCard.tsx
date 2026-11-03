import { Clock, Pencil, Trash2, Calendar } from "lucide-react";
import type { Game } from "@/lib/types";
import { GameCover } from "@/components/games/GameCover";
import { StatusBadge } from "@/components/games/StatusBadge";
import { RatingStars } from "@/components/games/RatingStars";
import { formatDate, formatHours } from "@/lib/utils";

export function GameCard({
  game,
  onEdit,
  onDelete,
}: {
  game: Game;
  onEdit: (game: Game) => void;
  onDelete: (game: Game) => void;
}) {
  return (
    <article className="group flex gap-3.5 rounded-xl border border-base-700 bg-base-850 p-3 transition-colors hover:border-base-600 sm:flex-col sm:gap-0 sm:p-0">
      <GameCover
        url={game.cover_url}
        name={game.name}
        className="h-[104px] w-[76px] shrink-0 sm:h-auto sm:w-full sm:rounded-b-none sm:border-0 sm:border-b sm:aspect-[3/4]"
      />

      <div className="flex min-w-0 flex-1 flex-col sm:p-3.5">
        <div className="flex items-start justify-between gap-2">
          <h3
            className="min-w-0 flex-1 truncate text-sm font-semibold text-ink"
            title={game.name}
          >
            {game.name}
          </h3>
          <div className="flex shrink-0 items-center gap-0.5 sm:opacity-0 sm:transition-opacity sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
            <button
              type="button"
              onClick={() => onEdit(game)}
              aria-label={`Editar ${game.name}`}
              className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-base-800 hover:text-ink"
            >
              <Pencil className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(game)}
              aria-label={`Excluir ${game.name}`}
              className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-base-800 hover:text-red-300"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>

        <p className="mt-0.5 truncate text-xs text-ink-faint">
          {game.platform || "Plataforma não informada"}
        </p>

        <div className="mt-2.5 flex flex-wrap items-center gap-2">
          <StatusBadge status={game.status} />
          <RatingStars value={game.rating} />
        </div>

        <div className="mt-auto flex flex-wrap items-center gap-x-3 gap-y-1 pt-3 text-xs text-ink-faint">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3 w-3" aria-hidden />
            {formatHours(game.hours_played)}
          </span>
          {game.completed_at && (
            <span className="inline-flex items-center gap-1">
              <Calendar className="h-3 w-3" aria-hidden />
              {formatDate(game.completed_at)}
            </span>
          )}
        </div>
      </div>
    </article>
  );
}
