import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'
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
]

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })

  router.beforeEach(async (to) => {
    const { user, fetchUser, can } = useAuth()

    if (user.value === undefined) {
      await fetchUser()
    }

    if (to.meta.requiresAuth && !user.value) {
      return { name: 'login' }
    }

    if (to.meta.anyPermission && !to.meta.anyPermission.some(can)) {
      return { name: 'dashboard' }
    }

    if (to.meta.guestOnly && user.value) {
      return { name: 'dashboard' }
    }

    return true
  })

  return router
}
