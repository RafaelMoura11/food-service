import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory, createRouter } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import Dashboard from '../src/views/Dashboard.vue'
import Login from '../src/views/Login.vue'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

function makeRouter() {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/login', name: 'login', component: Login },
      { path: '/', name: 'dashboard', component: Dashboard },
    ],
  })
}

async function mountLogin() {
  const router = makeRouter()
  router.push('/login')
  await router.isReady()

  return { router, wrapper: mount(Login, { global: { plugins: [router] } }) }
}

describe('Login', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('autentica com credenciais válidas e navega para o dashboard', async () => {
    http.get.mockResolvedValueOnce({}) // csrf-cookie
    http.post.mockResolvedValueOnce({}) // login
    http.get.mockResolvedValueOnce({ data: { id: 1, name: 'Admin' } }) // /api/user

    const { router, wrapper } = await mountLogin()

    await wrapper.find('#email').setValue('admin@foodservice.local')
    await wrapper.find('#password').setValue('password')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/login', {
      email: 'admin@foodservice.local',
      password: 'password',
    })
    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('exibe uma mensagem de erro quando as credenciais são inválidas', async () => {
    http.get.mockResolvedValueOnce({}) // csrf-cookie
    http.post.mockRejectedValueOnce({ response: { status: 422 } }) // login

    const { router, wrapper } = await mountLogin()

    await wrapper.find('#email').setValue('admin@foodservice.local')
    await wrapper.find('#password').setValue('senha-errada')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(wrapper.text()).toContain('Credenciais inválidas')
    expect(router.currentRoute.value.name).toBe('login')
  })
})
