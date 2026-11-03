-- =====================================================================
-- LevelUp — schema inicial
-- Tabelas: profiles, games
-- Segurança: RLS ativo em ambas, cada usuário só vê e altera o que é seu
-- =====================================================================

-- ---------- Tipos ----------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'game_status') then
    create type public.game_status as enum (
      'wishlist',   -- Quero jogar
      'playing',    -- Jogando
      'paused',     -- Pausado
      'abandoned',  -- Abandonado
      'completed'   -- Zerado
    );
  end if;
end $$;

-- ---------- Função utilitária de updated_at ----------
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------- profiles ----------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  favorite_platform text,
  bio text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  -- 1 caractere e permitido: o trigger pode derivar o nome de um e-mail
  -- com prefixo curto (ex.: a@dominio.com). A interface pede 2 ou mais.
  constraint profiles_display_name_length check (
    display_name is null or char_length(display_name) between 1 and 60
  ),
  constraint profiles_bio_length check (bio is null or char_length(bio) <= 280)
);

drop trigger if exists profiles_set_updated_at on public.profiles;
create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- ---------- games ----------
create table if not exists public.games (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null,
  platform text,
  status public.game_status not null default 'wishlist',
  hours_played numeric(7, 1) not null default 0,
  rating smallint,
  completed_at date,
  cover_url text,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint games_name_length check (char_length(trim(name)) between 1 and 120),
  constraint games_platform_length check (
    platform is null or char_length(platform) <= 60
  ),
  constraint games_hours_range check (hours_played >= 0 and hours_played <= 99999),
  constraint games_rating_range check (rating is null or (rating >= 1 and rating <= 5)),
  constraint games_notes_length check (notes is null or char_length(notes) <= 1000),
  constraint games_cover_url_scheme check (
    cover_url is null or cover_url ~* '^https://'
  )
);

create index if not exists games_user_id_created_at_idx
  on public.games (user_id, created_at desc);
create index if not exists games_user_id_status_idx
  on public.games (user_id, status);

drop trigger if exists games_set_updated_at on public.games;
create trigger games_set_updated_at
  before update on public.games
  for each row execute function public.set_updated_at();

-- ---------- Criação automática do perfil no cadastro ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'display_name'), ''),
      nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
      'Jogador'
    )
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.games enable row level security;

-- profiles: o usuário só lê e grava o próprio perfil
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists "profiles_delete_own" on public.profiles;
create policy "profiles_delete_own" on public.profiles
  for delete using (auth.uid() = id);

-- games: biblioteca estritamente individual
drop policy if exists "games_select_own" on public.games;
create policy "games_select_own" on public.games
  for select using (auth.uid() = user_id);

drop policy if exists "games_insert_own" on public.games;
create policy "games_insert_own" on public.games
  for insert with check (auth.uid() = user_id);

drop policy if exists "games_update_own" on public.games;
create policy "games_update_own" on public.games
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "games_delete_own" on public.games;
create policy "games_delete_own" on public.games
  for delete using (auth.uid() = user_id);

-- Nenhum acesso anônimo às tabelas: só o papel autenticado passa pelas policies
revoke all on public.games from anon;
revoke all on public.profiles from anon;
grant select, insert, update, delete on public.games to authenticated;
grant select, insert, update, delete on public.profiles to authenticated;
