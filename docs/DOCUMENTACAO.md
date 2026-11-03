# LevelUp — Documentação do Projeto

> Documento de referência fornecido pelo autor do projeto e usado como base
> para esta implementação. Mantido no repositório para que qualquer pessoa
> (ou o Lovable) possa consultar a intenção original das decisões.

**Projeto:** LevelUp
**Tipo:** Plataforma web para organização de bibliotecas de jogos

## 1. Sobre o projeto

O LevelUp é uma plataforma web criada com a proposta de ajudar jogadores a
organizar seus jogos, acompanhar seu progresso e registrar sua trajetória no
mundo dos games.

Conceito principal:

> "Sua biblioteca é o registro da sua história como jogador."

## 2. Objetivos

- Permitir que os usuários criem suas próprias contas.
- Criar uma biblioteca individual para cada jogador.
- Registrar jogos, plataformas, horas jogadas e avaliações.
- Acompanhar o status e a conclusão dos jogos.
- Exibir estatísticas baseadas nos registros de cada usuário.
- Interface responsiva para computadores e celulares.
- Manter os dados salvos mesmo depois que o usuário sair da conta.
- Publicar o site para acesso por navegador, sem instalação de aplicativo.

## 3. Identidade visual

- Fundo em tons de cinza-escuro.
- Textos em branco suave.
- Verde-musgo para botões, destaques e elementos selecionados.
- Bordas discretas.
- Capas dos jogos em evidência.
- Tipografia legível e organização consistente.
- Navegação simples e layout adaptável.

Aparência gamer moderna, mas discreta, sem excesso de efeitos.

## 4. Tecnologias previstas

React, TypeScript, Vite, Tailwind CSS, Supabase (autenticação e banco),
Git/GitHub para versionamento e Lovable como ambiente de continuidade e
publicação.

## 5. Estrutura do site

Dashboard, Minha biblioteca, Estatísticas, Meu perfil e Configurações.

## 6. Funcionalidades principais

### 6.1 Cadastro e login
Cadastro, login, logout, validação de formulários, mensagens de erro e
confirmação, proteção das páginas privadas e associação dos jogos à conta
correta. Cada usuário acessa somente os registros que lhe pertencem.

### 6.2 Dashboard
Total de jogos cadastrados, jogos zerados, jogos em andamento, total de horas
registradas e jogos adicionados recentemente — sempre com dados reais.

### 6.3 Minha biblioteca
Adicionar, visualizar, editar e excluir jogos. Cada registro pode conter nome,
plataforma, status, horas jogadas, avaliação pessoal, data de conclusão e capa.

Status previstos: Quero jogar, Jogando, Pausado, Abandonado, Zerado.

Busca por nome, filtros por status e plataforma, e opções de ordenação.
O cadastro manual é essencial e não pode depender de catálogos externos.

### 6.4 Estatísticas
Quantidade de jogos por status, total de horas registradas, quantidade de jogos
zerados e avaliações pessoais quando houver dados suficientes.

### 6.5 Perfil e configurações
Informações básicas da conta e opções que realmente funcionem. Recursos não
implementados não devem aparecer como concluídos.

## 7. Banco de dados e persistência

Banco persistente relacionando cada jogo ao usuário responsável, com os dados
separados entre contas e recuperáveis em um novo login. A aplicação não deve
depender do navegador ou de dados temporários.

## 8. Segurança e privacidade

Autenticação adequada, proteção das páginas privadas, validação dos dados,
verificação de permissões na camada de backend, políticas de segurança no banco
(Row Level Security), proteção de credenciais e variáveis de ambiente,
configuração adequada para produção e HTTPS na publicação.

Esconder informações na interface não é suficiente.

## 9. Capas e integrações externas

O cadastro precisa funcionar sem capa, com imagem substituta quando necessário.
Integração com catálogo externo é opcional e não pode comprometer o
funcionamento principal.

## 10. Responsividade e experiência de uso

Computadores, tablets e celulares; contraste adequado, rótulos claros,
navegação por teclado, textos alternativos, mensagens compreensíveis, estados
vazios organizados e botões com funções reais.

## 11. Processo com Claude e Lovable

1. Fornecer a documentação ao Claude.
2. Enviar o prompt principal de desenvolvimento.
3. Preparar ou gerar a estrutura do projeto.
4. Levar a implementação ao Lovable.
5. Configurar autenticação e banco de dados.
6. Testar as funcionalidades e corrigir problemas.
7. Preparar e realizar a publicação.
8. Verificar o funcionamento do site publicado.

## 12. Testes e validação

Cadastro/login/logout, CRUD de jogos, persistência, busca e filtros, cálculo das
estatísticas, separação entre usuários, proteção das páginas privadas, validação
de formulários, diferentes tamanhos de tela e funcionamento de links e botões.

Uma funcionalidade só deve ser registrada como testada quando houver
verificação real do seu funcionamento.

## 13. Publicação na internet

Configuração para produção, conexão com o banco, autenticação funcionando,
proteção dos dados, variáveis necessárias, disponibilidade, funcionamento em
computadores e celulares e configuração de domínio, caso desejado.

## 14. Organização e manutenção

Código organizado em componentes reutilizáveis, páginas, estilos, serviços e
configurações, com cópia do código e registro das mudanças relevantes.

## 15. Ideias para versões futuras

Conquistas e experiência, retrospectiva anual, estatísticas mais detalhadas,
personalização de perfis, integrações com plataformas de jogos, catálogo externo
e recursos sociais opcionais.

## 16. Histórico de prompts e colaboração com IA

Os prompts foram revisados para apresentar melhor os objetivos das solicitações
e não são transcrições literais.

| # | Objetivo | Decisão registrada |
|---|----------|--------------------|
| 1 | Escolha das tecnologias | Planejamento iniciado em Python/Django e depois adaptado para uma stack compatível com o Lovable. |
| 2 | Acesso público | Publicação pública como objetivo, com bibliotecas individuais privadas. |
| 3 | Identidade visual | Identidade escura, minimalista, com detalhes em verde-musgo. |
| 4 | Estrutura inicial | Primeira implementação local em Django, com a página inicial exibida no navegador. |
| 5 | Compatibilidade com o Lovable | Stack web compatível com o Lovable e Supabase para autenticação e persistência. |
| 6 | Documentação | Base documental de referência, separando decisões confirmadas de planejadas. |

### 16.1 Participação do desenvolvedor

A IA foi usada como apoio para esclarecer dúvidas, organizar requisitos, sugerir
soluções e auxiliar na elaboração do código. A direção do projeto — proposta,
identidade visual e funcionalidades — partiu das escolhas do autor, e a
implementação é acompanhada por revisão, testes e avaliação dos resultados.

## 17. Estado do desenvolvimento

A documentação descreve o objetivo final do LevelUp. A primeira versão foi
iniciada localmente com Django, e a estratégia foi depois modificada para usar o
Lovable como ambiente de desenvolvimento e publicação.

Próximas etapas registradas na documentação original:

1. Preparar a implementação compatível com o Lovable.
2. Configurar o banco de dados e a autenticação.
3. Implementar a biblioteca de jogos.
4. Desenvolver o Dashboard e as estatísticas.
5. Implementar perfil e configurações.
6. Testar segurança, persistência e responsividade.
7. Publicar e verificar o site.

> O andamento real desta implementação está em
> [`docs/ESTADO.md`](./ESTADO.md).

## 18. Considerações finais

O objetivo é entregar um site útil, responsivo, seguro e com identidade visual
própria, mantendo o foco na biblioteca pessoal de cada jogador.
