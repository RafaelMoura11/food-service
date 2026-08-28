import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '../composables/useAuth'
import Dashboard from '../views/Dashboard.vue'
import Login from '../views/Login.vue'

const routes = [
  { path: '/login', name: 'login', component: Login, meta: { guestOnly: true } },
  { path: '/', name: 'dashboard', component: Dashboard, meta: { requiresAuth: true } },
]

export function createAppRouter(history = createWebHistory()) {
  const router = createRouter({ history, routes })

  router.beforeEach(async (to) => {
    const { user, fetchUser } = useAuth()

    if (user.value === undefined) {
      await fetchUser()
    }

    if (to.meta.requiresAuth && !user.value) {
      return { name: 'login' }
    }

    if (to.meta.guestOnly && user.value) {
      return { name: 'dashboard' }
    }

    return true
  })

  return router
}
