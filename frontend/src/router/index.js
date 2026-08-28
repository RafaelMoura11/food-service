import { createRouter, createWebHistory } from 'vue-router'
import { CADASTRAVEL_MODULES, permissionsFor } from '../config/cadastraveis'
import { useAuth } from '../composables/useAuth'
import CadastravelItemForm from '../views/CadastravelItemForm.vue'
import CadastravelItemsList from '../views/CadastravelItemsList.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import RoleForm from '../views/RoleForm.vue'
import RolesList from '../views/RolesList.vue'
import UserForm from '../views/UserForm.vue'
import UsersList from '../views/UsersList.vue'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  {
    path: '/usuarios',
    name: 'users',
    component: UsersList,
    meta: {
      requiresAuth: true,
      // Qualquer uma das Permissões do módulo já dá acesso à tela; cada ação
      // (criar/listar/editar/excluir) segue bloqueada por si só dentro do
      // componente. funcoes.editar entra aqui porque UserController::index
      // também abre a lista pra quem só tem essa Permissão, pra poder
      // escolher a quem atribuir Funções.
      anyPermission: ['usuarios.listar', 'usuarios.criar', 'usuarios.editar', 'usuarios.excluir', 'funcoes.editar'],
    },
  },
  {
    path: '/usuarios/novo',
    name: 'users-novo',
    component: UserForm,
    meta: { requiresAuth: true, anyPermission: ['usuarios.criar'] },
  },
  {
    path: '/usuarios/:id/editar',
    name: 'users-editar',
    component: UserForm,
    props: (route) => ({ id: route.params.id }),
    meta: { requiresAuth: true, anyPermission: ['usuarios.editar', 'funcoes.editar'] },
  },
  {
    path: '/funcoes',
    name: 'roles',
    component: RolesList,
    meta: {
      requiresAuth: true,
      anyPermission: ['funcoes.listar', 'funcoes.criar', 'funcoes.editar', 'funcoes.excluir'],
    },
  },
  {
    path: '/funcoes/novo',
    name: 'roles-novo',
    component: RoleForm,
    meta: { requiresAuth: true, anyPermission: ['funcoes.criar'] },
  },
  {
    path: '/funcoes/:id/editar',
    name: 'roles-editar',
    component: RoleForm,
    props: (route) => ({ id: route.params.id }),
    meta: { requiresAuth: true, anyPermission: ['funcoes.editar'] },
  },
  // Três rotas por módulo Cadastrável (src/config/cadastraveis.js) — lista,
  // criação e edição —, todas apontando para os mesmos dois componentes
  // genéricos. Novo módulo Cadastrável = nova entrada nesse config, sem
  // tocar em rota/componente.
  ...CADASTRAVEL_MODULES.flatMap(({ slug, label }) => [
    {
      path: `/cadastraveis/${slug}`,
      name: `cadastraveis-${slug}`,
      component: CadastravelItemsList,
      props: { module: slug, label },
      meta: { requiresAuth: true, anyPermission: permissionsFor(slug) },
    },
    {
      path: `/cadastraveis/${slug}/novo`,
      name: `cadastraveis-${slug}-novo`,
      component: CadastravelItemForm,
      props: { module: slug, label },
      meta: { requiresAuth: true, anyPermission: [`${slug}.criar`] },
    },
    {
      path: `/cadastraveis/${slug}/:id/editar`,
      name: `cadastraveis-${slug}-editar`,
      component: CadastravelItemForm,
      props: (route) => ({ module: slug, label, id: route.params.id }),
      meta: { requiresAuth: true, anyPermission: [`${slug}.editar`] },
    },
  ]),
]

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })

  router.beforeEach(async (to) => {
    const { user, fetchUser, canAny } = useAuth()

    if (user.value === undefined) {
      await fetchUser()
    }

    if (to.meta.requiresAuth && !user.value) {
      return { name: 'login' }
    }

    if (to.meta.anyPermission && !canAny(to.meta.anyPermission)) {
      return { name: 'dashboard' }
    }

    if (to.meta.guestOnly && user.value) {
      return { name: 'dashboard' }
    }

    return true
  })

  return router
}
