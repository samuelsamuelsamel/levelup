import { useCallback, useEffect, useMemo, useState } from "react";
import type { Game, GameInput, LibraryStats } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { computeStats } from "@/lib/stats";

/** Normaliza o payload do formulário antes de enviar ao banco. */
function toPayload(input: GameInput) {
  const platform = input.platform?.trim() || null;
  const coverUrl = input.cover_url?.trim() || null;
  const notes = input.notes?.trim() || null;
  return {
    name: input.name.trim(),
    platform,
    status: input.status,
    hours_played: Number(input.hours_played) || 0,
    rating: input.rating ?? null,
    // Data de conclusão só faz sentido para jogos zerados.
    completed_at: input.status === "completed" ? input.completed_at : null,
    cover_url: coverUrl,
    notes,
  };
}

export function useGames() {
  const { user } = useAuth();
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!supabase || !user) {
      setGames([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    // O filtro por user_id é redundante com o RLS, mas deixa a intenção explícita.
    const { data, error: queryError } = await supabase
      .from("games")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (queryError) {
      setError("Não foi possível carregar sua biblioteca.");
      setGames([]);
    } else {
      setError(null);
      setGames(data ?? []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const createGame = useCallback(
    async (input: GameInput): Promise<{ error: string | null }> => {
      if (!supabase || !user) return { error: "Sessão expirada. Entre novamente." };
      const { data, error: insertError } = await supabase
        .from("games")
        .insert({ ...toPayload(input), user_id: user.id })
        .select()
        .single();

      if (insertError) return { error: insertError.message };
      if (data) setGames((current) => [data, ...current]);
      return { error: null };
    },
    [user],
  );

  const updateGame = useCallback(
    async (id: string, input: GameInput): Promise<{ error: string | null }> => {
      if (!supabase || !user) return { error: "Sessão expirada. Entre novamente." };
      const { data, error: updateError } = await supabase
        .from("games")
        .update(toPayload(input))
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (updateError) return { error: updateError.message };
      if (data)
        setGames((current) =>
          current.map((game) => (game.id === id ? data : game)),
        );
      return { error: null };
    },
    [user],
  );

  const deleteGame = useCallback(
    async (id: string): Promise<{ error: string | null }> => {
      if (!supabase || !user) return { error: "Sessão expirada. Entre novamente." };
      const { error: deleteError } = await supabase
        .from("games")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) return { error: deleteError.message };
      setGames((current) => current.filter((game) => game.id !== id));
      return { error: null };
    },
    [user],
  );

  return {
    games,
    loading,
    error,
    reload: load,
    createGame,
    updateGame,
    deleteGame,
  };
}

/** Estatísticas derivadas da biblioteca — nenhum valor fixo. */
export function useLibraryStats(games: Game[]): LibraryStats {
  return useMemo(() => computeStats(games), [games]);
}
