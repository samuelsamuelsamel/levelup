-- =====================================================================
-- LevelUp — testes de segurança (RLS) e integridade
-- Como rodar localmente: ver supabase/tests/README.md
-- Cada verificação levanta exceção se o resultado não for o esperado.
-- =====================================================================
\set ON_ERROR_STOP on
\timing off

create or replace function public.assert(condition boolean, label text)
returns void language plpgsql as $$
begin
  if condition then
    raise notice 'PASS  %', label;
  else
    raise exception 'FAIL  %', label;
  end if;
end $$;

-- Usuários de teste
delete from auth.users where email in ('a@teste.com', 'b@teste.com');
insert into auth.users (id, email, raw_user_meta_data) values
  ('11111111-1111-1111-1111-111111111111', 'a@teste.com', '{"display_name":"Jogador A"}'),
  ('22222222-2222-2222-2222-222222222222', 'b@teste.com', '{}');

-- 1. Perfil criado automaticamente pelo trigger
select public.assert(
  (select display_name from public.profiles
    where id = '11111111-1111-1111-1111-111111111111') = 'Jogador A',
  '01 trigger cria perfil com display_name do metadata');

select public.assert(
  (select display_name from public.profiles
    where id = '22222222-2222-2222-2222-222222222222') = 'b',
  '02 trigger usa prefixo do e-mail quando nao ha metadata');

-- ---------------------------------------------------------------------
-- 2. Usuário A insere e lê seus jogos
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';

insert into public.games (user_id, name, platform, status, hours_played, rating)
values
  ('11111111-1111-1111-1111-111111111111', 'Hollow Knight', 'PC', 'completed', 42.5, 5),
  ('11111111-1111-1111-1111-111111111111', 'Elden Ring', 'PS5', 'playing', 90, 5),
  ('11111111-1111-1111-1111-111111111111', 'Celeste', 'Switch', 'wishlist', 0, null);

select public.assert((select count(*) from public.games) = 3,
  '03 usuario A ve os 3 jogos que cadastrou');
commit;

-- ---------------------------------------------------------------------
-- 3. Isolamento entre contas
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';

select public.assert((select count(*) from public.games) = 0,
  '04 usuario B nao ve nenhum jogo do usuario A');

select public.assert((select count(*) from public.profiles) = 1,
  '05 usuario B ve apenas o proprio perfil');

insert into public.games (user_id, name, status)
values ('22222222-2222-2222-2222-222222222222', 'Stardew Valley', 'playing');

select public.assert((select count(*) from public.games) = 1,
  '06 usuario B ve somente o proprio jogo apos inserir');

-- B tenta alterar e excluir jogo de A: as policies filtram, nada e afetado
with updated as (
  update public.games set name = 'INVADIDO' where name = 'Hollow Knight' returning 1
)
select public.assert((select count(*) from updated) = 0,
  '07 UPDATE no jogo de outra conta nao afeta nenhuma linha');

with deleted as (
  delete from public.games where name = 'Elden Ring' returning 1
)
select public.assert((select count(*) from deleted) = 0,
  '08 DELETE no jogo de outra conta nao afeta nenhuma linha');
commit;

-- B tenta inserir jogo no nome de A: deve ser bloqueado pela policy
do $$
declare
  blocked boolean := false;
begin
  begin
    set local role authenticated;
    perform set_config('request.jwt.claim.sub', '22222222-2222-2222-2222-222222222222', true);
    insert into public.games (user_id, name, status)
    values ('11111111-1111-1111-1111-111111111111', 'Fraude', 'playing');
  exception when insufficient_privilege then
    blocked := true;
  end;
  reset role;
  perform public.assert(blocked,
    '09 INSERT com user_id de outra conta e bloqueado pelo RLS');
end $$;

-- A continua com seus 3 jogos intactos
begin;
set local role authenticated;
set local request.jwt.claim.sub = '11111111-1111-1111-1111-111111111111';
select public.assert(
  (select count(*) from public.games where name = 'Hollow Knight') = 1
  and (select count(*) from public.games where name = 'Elden Ring') = 1
  and (select count(*) from public.games) = 3,
  '10 biblioteca do usuario A permanece intacta');
commit;

-- ---------------------------------------------------------------------
-- 4. Acesso anônimo
-- ---------------------------------------------------------------------
do $$
declare
  blocked boolean := false;
begin
  begin
    set local role anon;
    perform count(*) from public.games;
  exception when insufficient_privilege then
    blocked := true;
  end;
  reset role;
  perform public.assert(blocked, '11 role anon nao tem acesso a tabela games');
end $$;

do $$
declare
  blocked boolean := false;
begin
  begin
    set local role anon;
    perform count(*) from public.profiles;
  exception when insufficient_privilege then
    blocked := true;
  end;
  reset role;
  perform public.assert(blocked, '12 role anon nao tem acesso a tabela profiles');
end $$;

-- ---------------------------------------------------------------------
-- 5. Perfil de outra conta
-- ---------------------------------------------------------------------
begin;
set local role authenticated;
set local request.jwt.claim.sub = '22222222-2222-2222-2222-222222222222';
with updated as (
  update public.profiles set display_name = 'Hackeado'
  where id = '11111111-1111-1111-1111-111111111111' returning 1
)
select public.assert((select count(*) from updated) = 0,
  '13 UPDATE no perfil de outra conta nao afeta nenhuma linha');
commit;

-- ---------------------------------------------------------------------
-- 6. Constraints de integridade
-- ---------------------------------------------------------------------
do $$
declare
  blocked boolean;
  cases text[][] := array[
    array['rating = 7', 'insert into public.games (user_id, name, rating) values (''11111111-1111-1111-1111-111111111111'', ''X'', 7)'],
    array['rating = 0', 'insert into public.games (user_id, name, rating) values (''11111111-1111-1111-1111-111111111111'', ''X'', 0)'],
    array['horas negativas', 'insert into public.games (user_id, name, hours_played) values (''11111111-1111-1111-1111-111111111111'', ''X'', -5)'],
    array['nome vazio', 'insert into public.games (user_id, name) values (''11111111-1111-1111-1111-111111111111'', ''   '')'],
    array['capa sem https', 'insert into public.games (user_id, name, cover_url) values (''11111111-1111-1111-1111-111111111111'', ''X'', ''http://inseguro/capa.png'')'],
    array['status invalido', 'insert into public.games (user_id, name, status) values (''11111111-1111-1111-1111-111111111111'', ''X'', ''zerado'')'],
    array['bio longa', 'update public.profiles set bio = repeat(''a'', 281) where id = ''11111111-1111-1111-1111-111111111111''']
  ];
begin
  for i in 1 .. array_length(cases, 1) loop
    blocked := false;
    begin
      execute cases[i][2];
    exception when others then
      blocked := true;
    end;
    perform public.assert(blocked,
      format('14.%s constraint rejeita %s', i, cases[i][1]));
  end loop;
end $$;

-- Valores válidos nos limites são aceitos
insert into public.games (user_id, name, rating, hours_played, cover_url)
values ('11111111-1111-1111-1111-111111111111', 'Limite', 1, 0,
        'https://exemplo.com/capa.png');
select public.assert(
  (select count(*) from public.games
    where user_id = '11111111-1111-1111-1111-111111111111') = 4,
  '15 valores validos nos limites sao aceitos');

-- ---------------------------------------------------------------------
-- 7. Trigger de updated_at
-- ---------------------------------------------------------------------
do $$
declare
  before_ts timestamptz;
  after_ts timestamptz;
begin
  select updated_at into before_ts from public.games where name = 'Limite';
  perform pg_sleep(0.05);
  update public.games set hours_played = 10 where name = 'Limite';
  select updated_at into after_ts from public.games where name = 'Limite';
  perform public.assert(after_ts > before_ts,
    '16 trigger atualiza updated_at em cada UPDATE');
end $$;

-- ---------------------------------------------------------------------
-- 8. Cascata ao excluir o usuário
-- ---------------------------------------------------------------------
delete from auth.users where id = '11111111-1111-1111-1111-111111111111';
select public.assert(
  (select count(*) from public.games
    where user_id = '11111111-1111-1111-1111-111111111111') = 0
  and (select count(*) from public.profiles
    where id = '11111111-1111-1111-1111-111111111111') = 0,
  '17 excluir o usuario remove perfil e jogos em cascata');

select public.assert((select count(*) from public.games) = 1,
  '18 jogo do usuario B sobrevive a exclusao do usuario A');

\echo ''
\echo '>>> Todos os testes de RLS e integridade passaram.'
