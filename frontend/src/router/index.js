import { createRouter, createWebHistory } from 'vue-router'
import { CADASTRAVEL_MODULES, permissionsFor } from '../config/cadastraveis'
import { useAuth } from '../composables/useAuth'
import CadastravelItems from '../views/CadastravelItems.vue'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
import Roles from '../views/Roles.vue'
import Users from '../views/Users.vue'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
  {
    path: '/usuarios',
    name: 'users',
    component: Users,
    meta: {
      requiresAuth: true,
      // Qualquer uma das quatro Permissões do módulo já dá acesso à tela;
      // cada ação (criar/listar/editar/excluir) segue bloqueada por si só
      // dentro do componente.
      anyPermission: ['usuarios.listar', 'usuarios.criar', 'usuarios.editar', 'usuarios.excluir'],
    },
  },
  {
    path: '/funcoes',
    name: 'roles',
    component: Roles,
    meta: {
      requiresAuth: true,
      anyPermission: ['funcoes.listar', 'funcoes.criar', 'funcoes.editar', 'funcoes.excluir'],
    },
  },
  // Uma rota por módulo Cadastrável (src/config/cadastraveis.js), todas
  // apontando para o mesmo componente genérico. Novo módulo Cadastrável =
  // nova entrada nesse config, sem tocar em rota/componente.
  ...CADASTRAVEL_MODULES.map(({ slug, label }) => ({
    path: `/cadastraveis/${slug}`,
    name: `cadastraveis-${slug}`,
    component: CadastravelItems,
    props: { module: slug, label },
    meta: {
      requiresAuth: true,
      anyPermission: permissionsFor(slug),
    },
  })),
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
