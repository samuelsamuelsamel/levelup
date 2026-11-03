# Estado do desenvolvimento

Atualizado em 29/10/2026. Um item só aparece como concluído quando foi
implementado **e** verificado. Os testes citados estão na seção 8 do README.

## Concluído e verificado

### Interface e navegação
- [x] Identidade visual em cinza-escuro com verde-musgo, aplicada por tema do Tailwind
- [x] Layout responsivo (celular, tablet, desktop) — sem rolagem horizontal em 390/820/1440 px
- [x] Sidebar no desktop e menu lateral no celular, ambos funcionais
- [x] Página de apresentação pública
- [x] Página 404 e redirecionamento de rotas em inglês
- [x] Componentes reutilizáveis de UI (botão, campos, modal, confirmação, aviso, estado vazio)
- [x] Estados vazios desenhados em biblioteca, dashboard e estatísticas
- [x] Avisos de sucesso e erro em todas as operações
- [x] Labels associados a todos os campos e navegação por teclado

### Autenticação
- [x] Cadastro com validação (nome, e-mail, senha de 8+ com letras e números, confirmação)
- [x] Tratamento do fluxo de confirmação de e-mail
- [x] Login com validação e mensagens de erro traduzidas
- [x] Logout
- [x] Redefinição de senha por e-mail
- [x] Alteração de senha na área autenticada
- [x] Proteção das cinco rotas privadas (verificado no navegador)
- [x] Quem já está logado não vê login/cadastro

### Biblioteca
- [x] Cadastro, consulta, edição e exclusão de jogos
- [x] Campos: nome, plataforma, status, horas, avaliação, data de conclusão, capa, anotações
- [x] Os cinco status da documentação
- [x] Data de conclusão vinculada ao status "Zerado"
- [x] Busca por nome tolerante a acentos
- [x] Filtros por status (com contagem) e por plataforma
- [x] Cinco ordenações (recentes, nome, horas, avaliação, conclusão)
- [x] Confirmação antes de excluir
- [x] Cadastro manual funcional, sem depender de catálogo externo
- [x] Capa opcional com substituto do tema e tratamento de URL quebrada

### Dashboard e estatísticas
- [x] Total de jogos, zerados, em andamento e horas registradas
- [x] Jogos adicionados recentemente
- [x] Jogos por status e por plataforma
- [x] Nota média e distribuição das avaliações
- [x] Ranking de mais horas registradas
- [x] Todos os números calculados dos registros (verificado por testes unitários e E2E)

### Perfil e configurações
- [x] Perfil com nome de exibição, plataforma favorita e bio, com validação
- [x] Resumo real da biblioteca no perfil
- [x] E-mail da conta em modo leitura
- [x] Exportação da biblioteca em JSON
- [x] Esvaziar a biblioteca, com confirmação
- [x] Sair da conta

### Banco de dados e segurança
- [x] Migration com tabelas, tipo enum, índices e triggers
- [x] Criação automática do perfil no cadastro
- [x] RLS ativo com 4 políticas por tabela, restritas ao próprio usuário
- [x] Role `anon` sem acesso às tabelas
- [x] Constraints de integridade (avaliação, horas, nome, capa https, limites)
- [x] Exclusão em cascata ao remover o usuário
- [x] Isolamento entre contas verificado em Postgres real (24 verificações)
- [x] Apenas a chave pública no frontend, lida de variáveis de ambiente
- [x] `.gitignore` excluindo todos os `.env*` locais

### Testes
- [x] 24 verificações de banco e RLS (psql, Postgres 16)
- [x] 44 testes unitários (Vitest)
- [x] 32 verificações E2E das áreas públicas (Playwright)
- [x] 54 verificações E2E da área autenticada (Playwright)
- [x] Typecheck e build de produção sem erros

## Depende de você (contas externas)

- [ ] Criar o projeto no Supabase
- [ ] Rodar a migration no SQL Editor
- [ ] Configurar Site URL e Redirect URLs na autenticação
- [ ] Conectar o Supabase ao Lovable
- [ ] Importar o projeto no Lovable
- [ ] Publicar
- [ ] Configurar domínio próprio (opcional)
- [ ] Verificar o site publicado, inclusive com duas contas diferentes

Passo a passo na seção 3, 4 e 5 do [README](../README.md).

## Não implementado nesta versão

Itens que a documentação lista como ideias futuras ou que exigem privilégio de
administrador. Nenhum deles aparece na interface como funcionalidade pronta.

- Exclusão definitiva da conta pelo próprio site (exige Edge Function com
  `service_role`; a tela de configurações explica o caminho atual pelo painel do
  Supabase)
- Upload de arquivo de capa para o Supabase Storage (hoje a capa é informada por
  URL `https`)
- Integração com catálogo externo de jogos (opcional pela documentação)
- Conquistas e sistema de experiência
- Retrospectiva anual
- Recursos sociais
