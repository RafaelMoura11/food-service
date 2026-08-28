# Módulos Cadastráveis: mecanismo único, tabela e rotas parametrizadas por config, em vez de model/migration/tela por módulo

O spec (#1) pede ~25 módulos "Cadastráveis" (Produtos, Filial, Fornecedores, Setores etc.), todos com o mesmo formato — um registro é só um `nome` — e cada um com Permissões (`listar/criar/editar/excluir`) próprias e independentes. O primeiro ticket (#6) exige explicitamente que o mecanismo usado para Produtos seja "genérico o suficiente para ser replicado a qualquer novo módulo Cadastrável apenas trocando o nome".

Decidimos implementar um único mecanismo genérico — uma tabela (`cadastravel_items`, colunas `module` + `name`), um `Model`, um `Controller` e uma tela Vue — em vez de gerar um model/migration/controller/tela por módulo (o padrão Laravel "idiomático" para 25 recursos distintos). O identificador de cada módulo (`slug`) e seu rótulo vivem em `backend/config/cadastraveis.php`, espelhado em `frontend/src/config/cadastraveis.js`.

A partir desse config, tudo mais é gerado automaticamente:

- `routes/api.php` registra um grupo de rotas `/api/cadastraveis/{slug}` por entrada do config, cada rota já com a Permissão certa (`can:{slug}.listar`, etc.) resolvida em tempo de boot — nenhuma rota é escrita à mão por módulo.
- `PermissionSeeder` cria as quatro Permissões de cada módulo do config, além de `usuarios`/`funcoes`.
- O router do frontend gera uma rota `/cadastraveis/{slug}` por entrada do config, todas apontando para o mesmo componente `CadastravelItems.vue` (recebe `module`/`label` via props).
- O `Sidebar.vue` lista, sob "Cadastráveis", só os módulos em que o Usuário tem alguma das quatro Permissões.

Adicionar um novo módulo Cadastrável (tickets #7–#10) é uma linha em cada um dos dois arquivos de config — sem tocar em rota, controller, model, Permissão ou tela.

## Considered Options

- **Um model + migration + controller + rota + tela Vue por módulo** (o caminho "Laravel padrão" para 25 recursos): rejeitada porque geraria ~25× o código para um CRUD idêntico em todos os módulos, e não atenderia ao pedido explícito do ticket #6 de um mecanismo "genérico o suficiente... apenas trocando o nome" — adicionar um módulo exigiria escrever código novo em vários arquivos, não uma alteração de config.
- **Uma tabela por módulo, mas Model/Controller genéricos parametrizados pelo nome da tabela**: rejeitada por não trazer benefício sobre a tabela única (todas as tabelas teriam o schema idêntico `id, name, timestamps`) e complicar a geração dinâmica de migrations sem ganho real de isolamento — o isolamento que importa (Permissões independentes por módulo) já é garantido pela coluna `module` + Permissões próprias, não pela tabela física.

## Consequences

- Uma FormRequest (`Store`/`UpdateCadastravelItemRequest`) valida `name` único **dentro do `module`** (`Rule::unique(...)->where('module', ...)`), não globalmente — o mesmo nome pode existir em módulos Cadastráveis diferentes.
- `CadastravelItemController::update`/`destroy` recebem `(FormRequest, CadastravelItem $item, string $module)` — nessa ordem. O dispatcher de rotas do Laravel injeta os parâmetros do controller posicionalmente a partir de `route->parametersWithoutNulls()` (primeiro os segmentos da URI como `{item}`, só depois os valores de `Route::defaults()` como `module`); inverter a ordem no controller faz o Laravel injetar os valores trocados sem erro de tipo aparente até o teste de integração falhar.
- Um novo módulo Cadastrável nunca aparece sozinho num PR — a checklist é sempre: entrada em `backend/config/cadastraveis.php` + entrada equivalente em `frontend/src/config/cadastraveis.js` (mantidos manualmente em sincronia; não há build step compartilhado entre os dois runtimes).
