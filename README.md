# LevelUp

Plataforma web para jogadores organizarem suas bibliotecas de jogos, registrarem
o progresso e acompanharem estatísticas pessoais.

> "Sua biblioteca é o registro da sua história como jogador."

Interface minimalista em **cinza-escuro com verde-musgo**, biblioteca pessoal
por conta, banco de dados persistente e permissões aplicadas no próprio banco
(Row Level Security).

---

## Sumário

1. [Stack](#1-stack)
2. [Rodar localmente](#2-rodar-localmente)
3. [Configurar o Supabase](#3-configurar-o-supabase) ← **depende de você**
4. [Levar o projeto para o Lovable](#4-levar-o-projeto-para-o-lovable) ← **depende de você**
5. [Publicar e configurar domínio](#5-publicar-e-configurar-domínio) ← **depende de você**
6. [Estrutura do projeto](#6-estrutura-do-projeto)
7. [Modelo de dados e segurança](#7-modelo-de-dados-e-segurança)
8. [Testes](#8-testes)
9. [Decisões técnicas](#9-decisões-técnicas)

---

## 1. Stack

| Camada | Escolha |
|--------|---------|
| Interface | React 18 + TypeScript |
| Build | Vite 5 (`@vitejs/plugin-react-swc`) |
| Estilos | Tailwind CSS 3 com tema próprio |
| Rotas | React Router 6 |
| Ícones | lucide-react |
| Backend | Supabase (Auth + Postgres + RLS) |
| Testes | Vitest (unitários), Playwright (E2E), psql (banco/RLS) |

Versões alinhadas ao stack padrão do Lovable para importar sem atrito.
Nenhuma dependência de servidor Python: o frontend fala direto com o Supabase.

---

## 2. Rodar localmente

```bash
npm install
```

```bash
cp .env.example .env.local
```

Preencha `.env.local` com os valores do seu projeto Supabase (seção 3) e rode:

```bash
npm run dev
```

A aplicação abre em `http://localhost:8080`.

Sem as variáveis de ambiente o site **carrega normalmente** e as telas de login
e cadastro avisam que o Supabase ainda não foi conectado — nada de tela branca.

Outros comandos:

```bash
npm run build      # build de produção em dist/
npm run preview    # serve o build localmente
npm run typecheck  # checagem de tipos
npm test           # testes unitários
```

---

## 3. Configurar o Supabase

> **Estas etapas dependem da sua conta. Eu não tenho acesso a ela e não preciso
> das suas senhas.** Nada aqui foi executado por mim: o banco foi validado em um
> Postgres local com a mesma migration (veja a seção 8).

### 3.1 Criar o projeto

1. Entre em [supabase.com](https://supabase.com) → **New project**.
2. Escolha nome, senha do banco e a região mais próxima (ex.: São Paulo).
3. Aguarde o provisionamento.

### 3.2 Aplicar o schema

Em **SQL Editor → New query**, cole e execute o conteúdo de:

```
supabase/migrations/20261029120000_levelup_init.sql
```

Isso cria:

- o tipo `game_status` com os cinco status;
- as tabelas `profiles` e `games`;
- o trigger que cria o perfil automaticamente no cadastro;
- o trigger de `updated_at`;
- **RLS ativo** com políticas por usuário em ambas as tabelas.

Se você usa o Supabase CLI, `supabase db push` aplica o mesmo arquivo.

### 3.3 Conferir que o RLS está ativo

Em **Table Editor**, as tabelas `games` e `profiles` devem aparecer com
`RLS enabled`. Em **Authentication → Policies** devem existir 4 políticas por
tabela (select/insert/update/delete, todas restritas ao próprio usuário).

Isso não é opcional: sem RLS, a chave pública do frontend daria acesso aos dados
de todas as contas.

### 3.4 Configurar a autenticação

Em **Authentication → Providers → Email**, deixe **Email** habilitado.

- **Confirm email ativado** (padrão): o usuário recebe um e-mail de confirmação
  antes do primeiro login. A tela de cadastro já trata esse caso e mostra a
  instrução correta.
- **Confirm email desativado**: o login é imediato após o cadastro. Mais
  prático para testar; menos seguro para produção.

Em **Authentication → URL Configuration**, defina:

- **Site URL**: o endereço publicado (ex.: `https://levelup.lovable.app`).
- **Redirect URLs**: adicione também `http://localhost:8080` para o
  desenvolvimento local.

Sem isso, o link de confirmação de e-mail e a redefinição de senha apontam para
o endereço errado.

### 3.5 Pegar as credenciais

Em **Project Settings → API**, copie:

| Valor | Variável |
|-------|----------|
| Project URL | `VITE_SUPABASE_URL` |
| `anon` / `public` key | `VITE_SUPABASE_ANON_KEY` |

A chave `anon` é **feita para ser pública** — ela só funciona dentro do que o
RLS permite.

⚠️ **Nunca** use a `service_role` key no frontend, em `.env.local` ou no
repositório: ela ignora o RLS e abre todas as contas.

---

## 4. Levar o projeto para o Lovable

Escolha **um** dos caminhos.

### Caminho A — via GitHub (recomendado)

Preserva o histórico e permite ir e voltar entre Lovable e editor local.

1. Crie um repositório vazio no GitHub (pode ser privado).
2. Na pasta do projeto:

```bash
git remote add origin https://github.com/SEU-USUARIO/levelup.git
```

```bash
git push -u origin main
```

3. No Lovable: **New Project → Import from GitHub** e selecione o repositório.

> O repositório já tem um commit inicial pronto. O `.gitignore` deixa fora
> `node_modules`, `dist` e **todos** os arquivos `.env*` locais — nenhuma
> credencial vai para o GitHub.

### Caminho B — recriar dentro do Lovable

Se preferir não usar GitHub, crie um projeto novo no Lovable e peça para ele
colar os arquivos desta pasta. A estrutura já é a que o Lovable espera
(`index.html`, `src/main.tsx`, `vite.config.ts`, Tailwind, alias `@/`).

### Conectar o Supabase no Lovable

1. No projeto do Lovable, abra a integração **Supabase** e conecte o projeto
   criado na seção 3.
2. Confirme as variáveis de ambiente do projeto:
   `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`.

O código aceita também os nomes `VITE_SUPABASE_PUBLISHABLE_KEY` e
`VITE_SUPABASE_PROJECT_ID`, usados por versões mais recentes dessa integração —
não é preciso mudar nada se o Lovable criar as variáveis com esses nomes.

---

## 5. Publicar e configurar domínio

1. No Lovable, clique em **Publish**. Ele hospeda o site e serve por HTTPS, com
   um endereço `*.lovable.app`.
2. Volte ao Supabase → **Authentication → URL Configuration** e coloque o
   endereço publicado em **Site URL**.
3. Para domínio próprio: no Lovable, **Settings → Domains → Connect domain**,
   informe o domínio e crie no seu provedor de DNS os registros que o Lovable
   indicar. A propagação costuma levar de minutos a algumas horas.
4. Com o domínio ativo, atualize a **Site URL** do Supabase novamente.

### Verifique depois de publicar

- [ ] Criar uma conta e confirmar o e-mail.
- [ ] Cadastrar, editar e excluir um jogo.
- [ ] Recarregar a página — os dados continuam lá.
- [ ] Sair e entrar novamente — a biblioteca continua lá.
- [ ] Criar uma **segunda conta** e confirmar que ela não vê os jogos da
      primeira. *(Este é o teste de segurança mais importante.)*
- [ ] Abrir no celular.
- [ ] Acessar `/dashboard` em uma janela anônima e cair no login.

> O site publicado roda na infraestrutura do Lovable com o banco no Supabase.
> Não depende do seu computador para continuar no ar.

**O estado da publicação não foi verificado por mim** — eu não tenho acesso às
suas contas. Nenhum serviço externo foi conectado nesta entrega.

---

## 6. Estrutura do projeto

```
levelup/
├─ docs/
│  ├─ DOCUMENTACAO.md          # documentação de referência do projeto
│  └─ ESTADO.md                # o que está pronto, o que falta
├─ e2e/
│  ├─ smoke.mjs                # E2E das áreas públicas
│  └─ app.mjs                  # E2E da área autenticada
├─ supabase/
│  ├─ migrations/
│  │  └─ 20261029120000_levelup_init.sql
│  └─ tests/
│     ├─ 00_supabase_harness.sql
│     ├─ 01_rls_test.sql       # testes de RLS e constraints
│     └─ README.md
├─ src/
│  ├─ components/
│  │  ├─ dashboard/            # StatCard, DistributionBar
│  │  ├─ games/                # GameCard, GameForm, GameFilters, GameCover,
│  │  │                        # StatusBadge, RatingStars
│  │  ├─ layout/               # AppLayout, Logo, ProtectedRoute
│  │  └─ ui/                   # Button, Input, Select, Textarea, Field,
│  │                           # Modal, ConfirmDialog, Toast, EmptyState,
│  │                           # Spinner, SectionHeader
│  ├─ contexts/
│  │  ├─ AuthContext.tsx       # sessão, login, cadastro, logout, senha
│  │  └─ GamesContext.tsx      # biblioteca compartilhada entre as páginas
│  ├─ hooks/
│  │  ├─ useGames.ts           # CRUD + estatísticas
│  │  └─ useProfile.ts
│  ├─ lib/
│  │  ├─ supabase.ts           # cliente (só a chave pública)
│  │  ├─ types.ts              # tipos do schema
│  │  ├─ validation.ts         # validação espelhando as constraints do banco
│  │  ├─ filters.ts            # busca, filtros e ordenação
│  │  ├─ stats.ts              # cálculo das estatísticas (função pura)
│  │  ├─ constants.ts          # status, plataformas, ordenações
│  │  ├─ utils.ts              # formatação
│  │  └─ __tests__/            # testes unitários
│  ├─ pages/                   # Landing, Login, Register, Dashboard,
│  │                           # Library, Stats, Profile, Settings, NotFound
│  ├─ App.tsx                  # rotas
│  ├─ main.tsx
│  └─ index.css
├─ .env.example
├─ tailwind.config.ts
└─ vite.config.ts
```

### Rotas

| Rota | Acesso | Conteúdo |
|------|--------|----------|
| `/` | público | apresentação do projeto |
| `/login` | público | entrar (+ redefinição de senha) |
| `/cadastro` | público | criar conta |
| `/dashboard` | privado | resumo da biblioteca |
| `/biblioteca` | privado | CRUD, busca, filtros, ordenação |
| `/estatisticas` | privado | números calculados da biblioteca |
| `/perfil` | privado | dados da conta |
| `/configuracoes` | privado | senha, exportação, sessão, limpeza |

`/library`, `/stats`, `/profile`, `/settings` e `/register` redirecionam para as
rotas em português. Qualquer outro endereço cai na página 404.

---

## 7. Modelo de dados e segurança

### `profiles`

Criada automaticamente no cadastro pelo trigger `on_auth_user_created`.

| Coluna | Tipo | Observação |
|--------|------|-----------|
| `id` | uuid PK | referencia `auth.users(id)`, `on delete cascade` |
| `display_name` | text | 1–60 caracteres |
| `favorite_platform` | text | até 60 caracteres |
| `bio` | text | até 280 caracteres |
| `created_at` / `updated_at` | timestamptz | `updated_at` por trigger |

### `games`

| Coluna | Tipo | Observação |
|--------|------|-----------|
| `id` | uuid PK | `gen_random_uuid()` |
| `user_id` | uuid | referencia `auth.users(id)`, `on delete cascade` |
| `name` | text | obrigatório, 1–120 caracteres |
| `platform` | text | opcional, até 60 |
| `status` | `game_status` | `wishlist`, `playing`, `paused`, `abandoned`, `completed` |
| `hours_played` | numeric(7,1) | 0–99999 |
| `rating` | smallint | 1–5 ou nulo |
| `completed_at` | date | preenchida só quando o status é `completed` |
| `cover_url` | text | só `https://` |
| `notes` | text | até 1000 caracteres |

Índices em `(user_id, created_at desc)` e `(user_id, status)`.

### Camadas de segurança

1. **Row Level Security** — `games` e `profiles` têm RLS ativo e quatro
   políticas cada, todas comparando `auth.uid()` com o dono do registro.
   Mesmo que alguém use a chave pública fora do site, só alcança os próprios
   dados. Nenhum acesso é concedido à role `anon`.
2. **Constraints no banco** — avaliação 1–5, horas não negativas, nome não
   vazio, capa obrigatoriamente `https`, limites de tamanho. O banco recusa
   dados inválidos mesmo se a interface for burlada.
3. **Validação no cliente** (`src/lib/validation.ts`) — espelha as constraints
   para o erro aparecer antes do request, nunca como substituto delas.
4. **Rotas protegidas** (`ProtectedRoute`) — conveniência de navegação, não
   mecanismo de segurança. A proteção real está nas camadas 1 e 2.
5. **Credenciais** — só a chave pública chega ao navegador, lida de variáveis
   de ambiente. `.gitignore` exclui todos os `.env*` locais.
6. **Operações com dono explícito** — todo `update` e `delete` filtra também por
   `user_id`, além do RLS.

---

## 8. Testes

Os resultados abaixo são de execuções reais neste ambiente.

### Banco de dados e RLS — 24/24 ✅

Postgres 16 local, com o schema `auth` emulado, a migration real aplicada e
`auth.uid()` trocando entre dois usuários.

```bash
psql "$DATABASE_URL" -f supabase/tests/00_supabase_harness.sql
psql "$DATABASE_URL" -f supabase/migrations/20261029120000_levelup_init.sql
psql "$DATABASE_URL" -f supabase/tests/01_rls_test.sql
```

Cobre criação automática do perfil, isolamento entre contas (leitura, escrita,
exclusão e tentativa de inserir no nome de outro usuário), bloqueio da role
`anon`, as sete constraints, o trigger de `updated_at` e a exclusão em cascata.

### Unitários — 44/44 ✅

```bash
npm test
```

`stats` (6), `filters` (16), `validation` (16) e `utils` (6).

### E2E áreas públicas — 32/32 ✅

```bash
npm run build && npx vite preview --port 4173 --host 127.0.0.1 &
node e2e/smoke.mjs
```

Landing, redirecionamento das cinco rotas privadas sem sessão, 404, validação de
login e cadastro, labels associados, navegação por teclado, links e ausência de
rolagem horizontal em 390 / 820 / 1440 px.

### E2E área autenticada — 54/54 ✅

```bash
node e2e/app.mjs
```

Sessão semeada no navegador e as chamadas ao Supabase interceptadas na camada de
rede por um backend simulado que imita o PostgREST. Cobre estados vazios,
cadastro com validação, persistência do payload, atualização do dashboard,
busca/filtros/ordenação, edição, exclusão com confirmação, estatísticas,
perfil, configurações, logout e responsividade em 390 px.

> **Para rodar os E2E:**
> `npm i -D playwright && npx playwright install chromium`. O Playwright não é
> dependência do projeto para não pesar a instalação no Lovable.
>
> Os dois scripts precisam de um `.env.local` preenchido — serve um valor de
> teste, como `VITE_SUPABASE_URL=https://placeholder.supabase.co` e
> `VITE_SUPABASE_ANON_KEY=placeholder`. As chamadas de rede são interceptadas
> pelos próprios testes, então nenhum Supabase real é acessado.

### O que **não** foi testado

- Cadastro, login e confirmação de e-mail contra um Supabase real — depende da
  sua conta. A lógica de autenticação é a do `@supabase/supabase-js`, e o schema
  e as políticas que ela usa foram testados contra um Postgres de verdade.
- O site publicado. Nada foi publicado nesta entrega.

---

## 9. Decisões técnicas

**Django foi substituído.** A documentação já previa a migração; manter um
servidor Python impediria a publicação pelo Lovable. O frontend fala direto com
o Supabase e não há backend próprio para manter.

**Sem `localStorage` como banco.** O único uso de armazenamento local é o token
de sessão, gerenciado pelo `supabase-js`. Jogos e perfis vivem no Postgres.

**Biblioteca carregada uma vez.** `GamesProvider` envolve a área autenticada, e
dashboard, biblioteca e estatísticas leem o mesmo estado — os números nunca
divergem entre telas, e não há requisição repetida por página.

**Estatísticas como função pura.** `computeStats` fica fora do React, o que a
torna testável e mantém a garantia de que todo número vem dos registros.

**Busca tolerante a acentos.** "pokemon" encontra "Pokémon Scarlet".

**Capa opcional com fallback real.** Sem capa — ou se a URL falhar no
carregamento — entra um substituto do tema. Nenhum catálogo externo é necessário,
e o campo exige `https` (validado no cliente e no banco) para evitar conteúdo
misto e URLs como `javascript:`.

**Data de conclusão vinculada ao status.** O campo só aparece para "Zerado", e o
cliente limpa a data ao sair desse status, para não guardar conclusão de jogo não
concluído.

**Sem biblioteca de gráficos.** As distribuições são barras em CSS — menos peso e
mais coerência com a identidade discreta pedida.

**Configurações só com o que funciona.** Alterar senha, exportar a biblioteca em
JSON, sair da conta e esvaziar a biblioteca. A exclusão definitiva da conta exige
privilégio de administrador (painel do Supabase ou Edge Function) e está
documentada na própria tela em vez de aparecer como botão decorativo.
