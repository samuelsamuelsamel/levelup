import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

/** Somente leitura. Para edição use RatingInput. */
export function RatingStars({
  value,
  className,
}: {
  value: number | null;
  className?: string;
}) {
  if (!value) return null;
  return (
    <span
      className={cn("inline-flex items-center gap-0.5", className)}
      aria-label={`Avaliação ${value} de 5`}
    >
      {[1, 2, 3, 4, 5].map((index) => (
        <Star
          key={index}
          aria-hidden
          className={cn(
            "h-3.5 w-3.5",
            index <= value
              ? "fill-moss-400 text-moss-400"
              : "fill-none text-base-600",
          )}
        />
      ))}
    </span>
  );
}

export function RatingInput({
  value,
  onChange,
  id,
}: {
  value: number | null;
  onChange: (next: number | null) => void;
  id?: string;
}) {
  return (
    <div id={id} className="flex items-center gap-1.5">
      <div className="flex items-center gap-0.5" role="group" aria-label="Avaliação">
        {[1, 2, 3, 4, 5].map((index) => (
          <button
            key={index}
            type="button"
            aria-label={`${index} ${index === 1 ? "estrela" : "estrelas"}`}
            aria-pressed={value === index}
            onClick={() => onChange(value === index ? null : index)}
            className="rounded p-1 transition-colors hover:bg-base-800"
          >
            <Star
              aria-hidden
              className={cn(
                "h-5 w-5 transition-colors",
                value && index <= value
                  ? "fill-moss-400 text-moss-400"
                  : "fill-none text-base-500",
              )}
            />
          </button>
        ))}
      </div>
      {value ? (
        <button
          type="button"
          onClick={() => onChange(null)}
          className="ml-1 text-xs text-ink-faint underline-offset-2 hover:text-ink-muted hover:underline"
        >
          limpar
        </button>
      ) : (
        <span className="ml-1 text-xs text-ink-faint">sem avaliação</span>
      )}
    </div>
  );
}
