// Mantém em sincronia com backend/config/cadastraveis.php — cada módulo aqui
// vira uma rota /cadastraveis/:slug, um item do menu lateral sob "Cadastráveis"
// e um conjunto de Permissões independentes (slug.listar/criar/editar/excluir).
export const CADASTRAVEL_MODULES = [
  { slug: 'produtos', label: 'Produtos' },
  { slug: 'centro-de-custo', label: 'Centro de custo' },
  { slug: 'filial', label: 'Filial' },
  { slug: 'checklist', label: 'Checklist' },
  { slug: 'nao-conformidades', label: 'Não conformidades' },
  { slug: 'transportaveis', label: 'Transportáveis' },
  { slug: 'rdo', label: 'R.D.O.' },
  { slug: 'agenda-de-higienizacao', label: 'Agenda de higienização' },
  { slug: 'relatorios', label: 'Relatórios' },
  { slug: 'ativo', label: 'Ativo' },
  { slug: 'ambientes', label: 'Ambientes' },
  { slug: 'categorias-rdo', label: 'Categorias RDO' },
  { slug: 'equipamentos', label: 'Equipamentos' },
  { slug: 'fornecedores', label: 'Fornecedores' },
  { slug: 'pragas', label: 'Pragas' },
  { slug: 'pratos-preparacao', label: 'Pratos/Preparação' },
  { slug: 'projetos', label: 'Projetos' },
  { slug: 'rotas', label: 'Rotas' },
  { slug: 'reservatorios', label: 'Reservatórios' },
  { slug: 'unidades', label: 'Unidades' },
  { slug: 'veiculos', label: 'Veículos' },
  { slug: 'cadastro-de-categorias', label: 'Cadastro de categorias' },
  { slug: 'checklist-customizavel', label: 'Checklist Customizável' },
  { slug: 'setores', label: 'Setores' },
  { slug: 'dispositivos', label: 'Dispositivos' },
]

export function permissionsFor(slug) {
  return [`${slug}.listar`, `${slug}.criar`, `${slug}.editar`, `${slug}.excluir`]
}

// Os dois módulos que não são Cadastráveis (Usuários e Funções) têm rótulo
// próprio; os demais vêm de CADASTRAVEL_MODULES. Usado sempre que exibimos o
// nome de um módulo pra humanos (ex.: tela de Funções e atribuição de Permissão).
const CORE_MODULE_LABELS = { usuarios: 'Usuários', funcoes: 'Funções' }
const CADASTRAVEL_MODULE_LABELS = Object.fromEntries(CADASTRAVEL_MODULES.map((m) => [m.slug, m.label]))

export function moduleLabel(module) {
  return CORE_MODULE_LABELS[module] ?? CADASTRAVEL_MODULE_LABELS[module] ?? module
}

// As quatro ações de Permissão (backend/database/seeders/PermissionSeeder.php)
// são as mesmas em todo módulo, então o rótulo e a descrição vivem aqui uma
// única vez em vez de repetidos por módulo.
export const PERMISSION_ACTIONS = {
  listar: { label: 'Listar', description: 'Permite visualizar a lista de registros deste módulo.' },
  criar: { label: 'Criar', description: 'Permite cadastrar novos registros neste módulo.' },
  editar: { label: 'Editar', description: 'Permite editar registros já existentes neste módulo.' },
  excluir: { label: 'Excluir', description: 'Permite remover registros deste módulo.' },
}

const ACTION_ORDER = Object.keys(PERMISSION_ACTIONS)

export function comparePermissionsByAction(a, b) {
  return ACTION_ORDER.indexOf(a.name.split('.')[1]) - ACTION_ORDER.indexOf(b.name.split('.')[1])
}
