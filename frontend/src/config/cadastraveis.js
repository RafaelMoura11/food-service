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
