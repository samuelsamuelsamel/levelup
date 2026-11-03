import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function Spinner({ className }: { className?: string }) {
  return (
    <Loader2
      className={cn("h-5 w-5 animate-spin text-moss-400", className)}
      aria-hidden
    />
  );
}

export function PageLoader({ label = "Carregando..." }: { label?: string }) {
  return (
    <div
      role="status"
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
    >
      <Spinner className="h-6 w-6" />
      <p className="text-sm text-ink-muted">{label}</p>
    </div>
  );
}
