import { Search, X } from "lucide-react";
import { GAME_STATUSES, SORT_OPTIONS, type SortOption } from "@/lib/constants";
import type { GameStatus } from "@/lib/types";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

export interface FiltersState {
  search: string;
  status: GameStatus | "all";
  platform: string;
  sort: SortOption;
}

export function GameFilters({
  value,
  onChange,
  platforms,
  counts,
}: {
  value: FiltersState;
  onChange: (next: FiltersState) => void;
  platforms: string[];
  counts: Record<GameStatus | "all", number>;
}) {
  const set = <K extends keyof FiltersState>(key: K, next: FiltersState[K]) =>
    onChange({ ...value, [key]: next });

  const chips: { key: GameStatus | "all"; label: string }[] = [
    { key: "all", label: "Todos" },
    ...GAME_STATUSES.map((status) => ({ key: status.value, label: status.label })),
  ];

  return (
    <div className="space-y-3">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint"
            aria-hidden
          />
          <Input
            type="search"
            value={value.search}
            onChange={(event) => set("search", event.target.value)}
            placeholder="Buscar por nome..."
            aria-label="Buscar jogo por nome"
            className="pl-9 pr-9"
          />
          {value.search && (
            <button
              type="button"
              onClick={() => set("search", "")}
              aria-label="Limpar busca"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        <div className="flex gap-3">
          <Select
            value={value.platform}
            onChange={(event) => set("platform", event.target.value)}
            aria-label="Filtrar por plataforma"
            className="sm:w-44"
          >
            <option value="all">Todas as plataformas</option>
            {platforms.map((platform) => (
              <option key={platform} value={platform}>
                {platform}
              </option>
            ))}
          </Select>

          <Select
            value={value.sort}
            onChange={(event) => set("sort", event.target.value as SortOption)}
            aria-label="Ordenar biblioteca"
            className="sm:w-52"
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        </div>
      </div>

      <div className="-mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
        {chips.map((chip) => {
          const active = value.status === chip.key;
          return (
            <button
              key={chip.key}
              type="button"
              onClick={() => set("status", chip.key)}
              aria-pressed={active}
              className={cn(
                "inline-flex shrink-0 items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-moss-500 bg-moss-700/60 text-ink"
                  : "border-base-600 bg-base-850 text-ink-muted hover:border-base-500 hover:text-ink",
              )}
            >
              {chip.label}
              <span
                className={cn(
                  "rounded px-1 text-[10px] tabular-nums",
                  active ? "bg-moss-800/70 text-moss-100" : "bg-base-800 text-ink-faint",
                )}
              >
                {counts[chip.key] ?? 0}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
