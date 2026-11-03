import { cn } from "@/lib/utils";

/** Barra horizontal simples — sem biblioteca de gráficos, sem brilho. */
export function DistributionBar({
  label,
  count,
  total,
  barClass = "bg-moss-500",
}: {
  label: string;
  count: number;
  total: number;
  barClass?: string;
}) {
  const percent = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
        <span className="truncate text-ink-muted">{label}</span>
        <span className="shrink-0 tabular-nums text-ink">
          {count}
          <span className="ml-1.5 text-xs text-ink-faint">{percent}%</span>
        </span>
      </div>
      <div
        className="h-1.5 w-full overflow-hidden rounded-full bg-base-800"
        role="img"
        aria-label={`${label}: ${count} de ${total} (${percent}%)`}
      >
        <div
          className={cn("h-full rounded-full transition-all", barClass)}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
