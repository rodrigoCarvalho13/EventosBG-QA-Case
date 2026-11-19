# EBG | Testes Automatizados com Cypress

Projeto de automação de testes E2E desenvolvido para o **EBG**, com foco em qualidade, confiabilidade dos fluxos críticos e proteção de funcionalidades relacionadas a eventos, espaços, lojas, grupos e permissões de acesso.

Este repositório reúne cenários de teste rastreáveis aos casos de teste (TCs) definidos na matriz de testes do projeto. A implementação prioriza os comportamentos observáveis da aplicação, reutiliza seletores existentes e diferencia claramente testes automatizados, validações estáticas e cenários que ainda dependem de ambiente ou definição de negócio.

> **Status da entrega:** os specs TC-10 a TC-13 estão incluídos no pacote de implementação atual. Isso não significa que todos os cenários tenham sido executados ou aprovados em runtime. Consulte a seção [Status e limitações](#status-e-limitações).

---

## Objetivos

- Automatizar fluxos funcionais relevantes para o EBG usando Cypress.
- Manter rastreabilidade entre os testes automatizados e os IDs originais da matriz (TC-10, TC-11 etc.).
- Verificar validações de formulário, criação e edição de registros, visibilidade pública e controle de acesso.
- Reduzir regressões em fluxos críticos.
- Documentar pré-condições, dados de teste e limitações de execução.
- Evitar credenciais reais, alterações não autorizadas e afirmações de sucesso sem evidência de execução.

## Tecnologias e abordagem

- **Base44** — projeto backend para teste e armazenagem de dados.
- **Cypress** — automação de testes end-to-end.
- **JavaScript** — implementação dos specs.
- **EBG** — aplicação sob teste.
- **Notion (exportação CSV)** — matriz de casos de teste e fluxos como referência de rastreabilidade.

Os testes seguem a estrutura e as convenções já presentes no projeto Cypress. Os seletores utilizados foram escolhidos a partir dos elementos identificados na aplicação, em vez de pressupor atributos ou comportamentos não confirmados.

## Escopo automatizado nesta entrega

| Caso | Cobertura | O que é verificado |
|---|---|---|
| **TC-10 — Create and edit an event** | Criação e edição de evento | Validação de campos obrigatórios, criação controlada, presença na listagem pública e edição pelo proprietário. |
| **TC-11 — Create spaces, shops, and groups** | Cadastro de espaços, lojas e grupos | Direcionamento para formulários correspondentes, campos específicos, criação controlada e presença nos diretórios apropriados. |
| **TC-12 — Ownership and access boundaries** | Propriedade e controle de acesso | Acesso do proprietário aos próprios registros, bloqueio de edição cruzada entre duas contas e redirecionamento de visitantes não autenticados. |
| **TC-13 — Anonymous event suggestion** | Sugestão anônima de evento | Acesso sem login, validação de nome/e-mail do remetente, estados de sucesso/erro da interface e contrato da chamada da função. |

### Rastreabilidade

Os nomes dos arquivos mantêm os IDs dos casos de teste:

```text
cypress/
└── e2e/
    ├── TC-10-create-and-edit-event.cy.js
    ├── TC-11-create-spaces-shops-and-groups.cy.js
    ├── TC-12-ownership-and-access-boundaries.cy.js
    └── TC-13-anonymous-event-suggestion.cy.js
```

A numeração dos cenários internos também preserva a identificação do TC correspondente, facilitando a comparação com a matriz de testes original.

## Pré-requisitos

Para executar os testes, é necessário:

- Node.js e npm instalados.
- Dependências do projeto instaladas.
- Cypress disponível nas dependências do projeto.
- Aplicação EBG executando em ambiente local ou de testes autorizado.
- Para cenários autenticados, contas e registros de teste previamente preparados.
- Para cenários que criam registros, autorização explícita para escrita e procedimento de limpeza conhecido.

A URL padrão utilizada pelos specs é `http://localhost:5173`. Ela pode ser substituída pelas variáveis de ambiente indicadas abaixo.

## Instalação

Na raiz do projeto:

```bash
npm install
```

Se o repositório possuir um `package-lock.json` atualizado, prefira instalação reproduzível:

```bash
npm ci
```

Confirme que a aplicação EBG está em execução antes de iniciar os testes. Os comandos para iniciar o frontend/backend dependem da configuração do projeto e devem ser consultados no `package.json` e na documentação da aplicação.

## Execução dos testes

Executar todos os specs Cypress:

```bash
npx cypress run
```

Abrir a interface interativa do Cypress:

```bash
npx cypress open
```

Executar um caso específico:

```bash
npx cypress run --spec "cypress/e2e/TC-10-create-and-edit-event.cy.js"
npx cypress run --spec "cypress/e2e/TC-11-create-spaces-shops-and-groups.cy.js"
npx cypress run --spec "cypress/e2e/TC-12-ownership-and-access-boundaries.cy.js"
npx cypress run --spec "cypress/e2e/TC-13-anonymous-event-suggestion.cy.js"
```

Os comandos devem ser executados a partir da raiz do projeto, onde está a configuração do Cypress.

## Configuração de dados de teste

Os specs usam variáveis de ambiente do Cypress para evitar armazenar credenciais e IDs de registros diretamente no código.

### TC-10 — Criação e edição de evento

| Variável | Finalidade |
|---|---|
| `TC10_BASE_URL` | URL base da aplicação. Padrão: `http://localhost:5173`. |
| `TC10_OWNER_EMAIL` | E-mail da conta proprietária de teste. |
| `TC10_OWNER_PASSWORD` | Senha da conta proprietária de teste. |
| `TC10_ALLOW_WRITES` | Deve ser `true` para habilitar o cenário que grava dados. |
| `TC10_CLEANUP` | Deve ser `true` para habilitar a limpeza prevista pelo spec. |

### TC-11 — Cadastro de espaços, lojas e grupos

| Variável | Finalidade |
|---|---|
| `TC11_BASE_URL` | URL base da aplicação. Padrão: `http://localhost:5173`. |
| `TC11_OWNER_EMAIL` | E-mail da conta proprietária de teste. |
| `TC11_OWNER_PASSWORD` | Senha da conta proprietária de teste. |
| `TC11_ALLOW_WRITES` | Deve ser `true` para habilitar os cenários que gravam dados. |
| `TC11_CLEANUP` | Deve ser `true` para habilitar a limpeza prevista pelo spec. |

### TC-12 — Propriedade e limites de acesso

| Variável | Finalidade |
|---|---|
| `TC12_BASE_URL` | URL base da aplicação. Padrão: `http://localhost:5173`. |
| `TC12_OWNER_A_EMAIL` / `TC12_OWNER_A_PASSWORD` | Credenciais da conta de teste A. |
| `TC12_OWNER_A_EVENT_ID` | ID do evento pertencente à conta A. |
| `TC12_OWNER_A_SHOP_ID` | ID da loja/espaço pertencente à conta A. |
| `TC12_OWNER_B_EMAIL` / `TC12_OWNER_B_PASSWORD` | Credenciais da conta de teste B. |
| `TC12_OWNER_B_EVENT_ID` | ID do evento pertencente à conta B. |
| `TC12_OWNER_B_SHOP_ID` | ID da loja/espaço pertencente à conta B. |

O TC-12 requer duas contas regulares distintas e quatro registros existentes, mantidos disponíveis durante a execução. O spec pula os cenários quando os dados obrigatórios não estão configurados.

### TC-13 — Sugestão anônima de evento

| Variável | Finalidade |
|---|---|
| `TC13_BASE_URL` | URL base da aplicação. Padrão: `http://localhost:5173`. |

O TC-13 utiliza interceptação da chamada da função nos cenários de sucesso e erro. Esses testes verificam o contrato da interface e não criam sugestões persistentes no backend.

### Como fornecer variáveis

Configure os valores por meio do mecanismo local/seguro adotado pela equipe ou pela configuração de ambiente do Cypress. Não versione senhas, tokens, cookies, dados pessoais ou arquivos locais de segredo.

**Não use contas de produção.** Os testes que escrevem dados devem ser executados somente em ambiente autorizado e com dados sintéticos.

## Boas práticas adotadas

- IDs dos TCs preservados nos nomes dos arquivos e descrições dos testes.
- Seletores alinhados aos elementos existentes na aplicação.
- Credenciais recebidas por variáveis de ambiente, sem hardcode.
- Testes de escrita protegidos por flags explícitas.
- Cenários de sugestão anônima com respostas interceptadas quando a persistência real não está autorizada ou preparada.
- Verificação de acesso tanto pela navegação pública quanto pela tentativa de acesso direto à rota protegida.
- Revisão de `it.only()` para evitar que testes isolados sejam executados inadvertidamente em lugar da suíte completa.
- Documentação de pré-condições e bloqueios, sem transformar ausência de execução em resultado aprovado.

## Status e limitações

| Item | Situação conhecida |
|---|---|
| Specs TC-10 a TC-13 | Implementados no pacote cumulativo atual. |
| Verificação sintática JavaScript | Reportada como aprovada nas entregas de implementação. |
| Revisão de `it.only()` | Patch preparado para remover quatro ocorrências identificadas no projeto original. |
| Execução Cypress end-to-end | Não confirmada nas entregas atuais. |
| Integração real de TC-13 com persistência e visibilidade pública | Pendente de ambiente de staging e procedimento de limpeza aprovado. |
| TC-14 — Moderator suggestion review | Bloqueado por definições de negócio e pré-condições pendentes. |
| TC-15 a TC-22 | Ainda não documentados como implementados nesta entrega. |

### Limites importantes de interpretação

- **Implementado** significa que o spec foi escrito; não significa que passou em execução.
- **Validação sintática** verifica a sintaxe do código JavaScript, não o comportamento da aplicação.
- Os cenários de TC-13 com interceptação verificam respostas simuladas e o comportamento da interface. Não comprovam que uma sugestão foi gravada com status `pending` no backend.
- TC-14 não foi implementado porque a política de moderação e alguns comportamentos solicitados na matriz ainda precisam de confirmação. Não foram inventados testes para funcionalidades não confirmadas.
- Uma execução que pule testes por falta de variáveis ou dados não deve ser reportada como aprovação.

## Segurança e publicação no GitHub

Antes de publicar este repositório:

1. Remova ou substitua credenciais, tokens, cookies, IDs privados e dados pessoais.
2. Confira se arquivos `.env`, relatórios com dados sensíveis e configurações locais estão no `.gitignore`.
3. Utilize somente dados sintéticos e ambientes de teste autorizados.
4. Revise os arquivos de configuração para garantir que nenhuma URL interna ou segredo foi incluído.
5. Confirme que a publicação do código e dos artefatos está autorizada.

Este README descreve a automação e a cobertura documentada; não declara que a aplicação, seus serviços ou todos os cenários foram validados em produção.

## Próximos passos

- Desbloquear TC-14 com a definição da política de moderação e dados de teste autorizados.
- Implementar os próximos casos aplicáveis da matriz, mantendo a ordem e a rastreabilidade.
- Executar os specs em ambiente controlado com dependências e serviços disponíveis.
- Registrar evidências de execução (logs, screenshots ou vídeos) sem expor dados sensíveis.
- Atualizar esta documentação conforme a cobertura realmente implementada e executada.

---

**Projeto de portfólio — QA / Test Automation**  
Automação E2E com Cypress | JavaScript | Testes funcionais | Rastreabilidade de requisitos
