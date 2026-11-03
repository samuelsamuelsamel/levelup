export type GameStatus =
  | "wishlist"
  | "playing"
  | "paused"
  | "abandoned"
  | "completed";

export type Game = {
  id: string;
  user_id: string;
  name: string;
  platform: string | null;
  status: GameStatus;
  hours_played: number;
  rating: number | null;
  completed_at: string | null;
  cover_url: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

/** Campos que o formulário envia. O user_id é preenchido no servidor/cliente autenticado. */
export type GameInput = {
  name: string;
  platform: string | null;
  status: GameStatus;
  hours_played: number;
  rating: number | null;
  completed_at: string | null;
  cover_url: string | null;
  notes: string | null;
}

export type Profile = {
  id: string;
  display_name: string | null;
  favorite_platform: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export type LibraryStats = {
  total: number;
  completed: number;
  playing: number;
  paused: number;
  abandoned: number;
  wishlist: number;
  totalHours: number;
  ratedCount: number;
  averageRating: number | null;
  platforms: { platform: string; count: number }[];
}

/**
 * Tipagem do schema no formato que o supabase-js espera (equivalente ao que
 * `supabase gen types typescript` produz). Mantenha em sincronia com a
 * migration em supabase/migrations.
 */
export type Database = {
  public: {
    Tables: {
      games: {
        Row: Game;
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          platform?: string | null;
          status?: GameStatus;
          hours_played?: number;
          rating?: number | null;
          completed_at?: string | null;
          cover_url?: string | null;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          name?: string;
          platform?: string | null;
          status?: GameStatus;
          hours_played?: number;
          rating?: number | null;
          completed_at?: string | null;
          cover_url?: string | null;
          notes?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: Profile;
        Insert: {
          id: string;
          display_name?: string | null;
          favorite_platform?: string | null;
          bio?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          display_name?: string | null;
          favorite_platform?: string | null;
          bio?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<never, never>;
    Functions: Record<never, never>;
    Enums: {
      game_status: GameStatus;
    };
    CompositeTypes: Record<never, never>;
  };
}
