import { cn } from "@/lib/utils";

export function Logo({
  className,
  showWordmark = true,
}: {
  className?: string;
  showWordmark?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span
        aria-hidden
        className="flex h-8 w-8 items-center justify-center rounded-lg border border-moss-600/70 bg-moss-800/60"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none">
          <path
            d="M5 4v12.2h7.3"
            stroke="#9aae8f"
            strokeWidth="2.4"
            strokeLinecap="square"
          />
          <path
            d="M16 4h2.6v7.6c0 2.9-1.9 4.6-4.6 4.6"
            stroke="#657c59"
            strokeWidth="2.4"
            strokeLinecap="square"
          />
          <path d="M5 20h14" stroke="#7d9471" strokeWidth="2.4" strokeLinecap="square" />
        </svg>
      </span>
      {showWordmark && (
        <span className="text-[15px] font-semibold tracking-tight text-ink">
          Level<span className="text-moss-400">Up</span>
        </span>
      )}
    </span>
  );
}
