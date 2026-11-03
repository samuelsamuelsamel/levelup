import { createContext, useContext } from "react";
import { useGames } from "@/hooks/useGames";

type GamesValue = ReturnType<typeof useGames>;

const GamesContext = createContext<GamesValue | null>(null);

/**
 * Carrega a biblioteca uma única vez para toda a área autenticada.
 * Dashboard, biblioteca e estatísticas leem o mesmo estado, então os
 * números nunca divergem entre as telas.
 */
export function GamesProvider({ children }: { children: React.ReactNode }) {
  const value = useGames();
  return <GamesContext.Provider value={value}>{children}</GamesContext.Provider>;
}

export function useLibrary() {
  const context = useContext(GamesContext);
  if (!context)
    throw new Error("useLibrary precisa estar dentro de GamesProvider");
  return context;
}
