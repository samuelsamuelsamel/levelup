# Testes do banco de dados

Estes testes verificam a migration real do projeto: as tabelas, as constraints,
os triggers e — principalmente — as políticas de **Row Level Security**.

## O que é verificado

- O trigger `on_auth_user_created` cria o perfil no cadastro.
- Um usuário lê, cria, edita e exclui **apenas** os próprios jogos.
- `UPDATE` e `DELETE` em registros de outra conta não afetam nenhuma linha.
- `INSERT` com `user_id` de outra conta é bloqueado pela policy.
- A role `anon` (visitante não autenticado) não acessa `games` nem `profiles`.
- As constraints rejeitam avaliação fora de 1–5, horas negativas, nome vazio,
  capa sem `https://`, status inválido e bio acima de 280 caracteres.
- O trigger de `updated_at` dispara em cada alteração.
- Excluir o usuário remove perfil e jogos em cascata, sem afetar outras contas.

## Como rodar

### Opção 1 — Supabase CLI (recomendado)

```bash
supabase start
supabase db reset        # aplica supabase/migrations
psql "$(supabase status -o env | grep DB_URL | cut -d= -f2-)" -f supabase/tests/01_rls_test.sql
```

Com o Supabase CLI, o schema `auth` já existe — **não** rode o arquivo
`00_supabase_harness.sql`, que serve apenas para emular esse ambiente em um
Postgres comum.

### Opção 2 — Postgres local comum

```bash
psql "$DATABASE_URL" -f supabase/tests/00_supabase_harness.sql
psql "$DATABASE_URL" -f supabase/migrations/20261029120000_levelup_init.sql
psql "$DATABASE_URL" -f supabase/tests/01_rls_test.sql
```

Cada verificação imprime `PASS` ou interrompe a execução com `FAIL`.
Os testes criam e apagam os usuários `a@teste.com` e `b@teste.com`.
