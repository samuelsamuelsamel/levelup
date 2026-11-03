import { cn } from "@/lib/utils";

export function StatCard({
  label,
  value,
  hint,
  icon,
  accent = false,
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border bg-base-850 p-4",
        accent ? "border-moss-700/70" : "border-base-700",
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium uppercase tracking-wide text-ink-muted">
          {label}
        </span>
        <span className={cn(accent ? "text-moss-400" : "text-ink-faint")}>
          {icon}
        </span>
      </div>
      <p className="mt-2.5 text-2xl font-semibold tabular-nums text-ink">{value}</p>
      {hint && <p className="mt-1 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}
