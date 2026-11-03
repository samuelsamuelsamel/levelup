import { useState } from "react";
import { Gamepad2 } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * Capa do jogo com substituto coerente com o tema.
 * Se a URL falhar (API externa fora do ar, link quebrado), cai no substituto
 * sem quebrar a biblioteca.
 */
export function GameCover({
  url,
  name,
  className,
}: {
  url: string | null;
  name: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const showImage = Boolean(url) && !failed;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg border border-base-700 bg-base-800",
        className,
      )}
    >
      {showImage ? (
        <img
          src={url as string}
          alt={`Capa de ${name}`}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-base-800 p-3 text-center">
          <Gamepad2 className="h-6 w-6 text-moss-600" aria-hidden />
          <span className="line-clamp-2 text-[11px] font-medium leading-tight text-ink-faint">
            {name}
          </span>
        </div>
      )}
    </div>
  );
}
