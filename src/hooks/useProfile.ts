import { useCallback, useEffect, useState } from "react";
import type { Profile } from "@/lib/types";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!supabase || !user) {
      setProfile(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle();

    if (data) {
      setProfile(data);
    } else {
      // Rede de segurança: se o trigger de criação não rodou, cria agora.
      const fallbackName =
        (user.user_metadata?.display_name as string | undefined) ||
        user.email?.split("@")[0] ||
        "Jogador";
      const { data: created } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          display_name: fallbackName,
          favorite_platform: null,
          bio: null,
        })
        .select()
        .single();
      setProfile(created ?? null);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    void load();
  }, [load]);

  const updateProfile = useCallback(
    async (
      patch: Pick<Profile, "display_name" | "favorite_platform" | "bio">,
    ): Promise<{ error: string | null }> => {
      if (!supabase || !user) return { error: "Sessão expirada. Entre novamente." };
      const { data, error } = await supabase
        .from("profiles")
        .update({
          display_name: patch.display_name?.trim() || null,
          favorite_platform: patch.favorite_platform?.trim() || null,
          bio: patch.bio?.trim() || null,
        })
        .eq("id", user.id)
        .select()
        .single();

      if (error) return { error: error.message };
      setProfile(data);
      return { error: null };
    },
    [user],
  );

  return { profile, loading, updateProfile, reload: load };
}
