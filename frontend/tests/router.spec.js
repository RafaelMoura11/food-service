import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

describe('guarda de rotas', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('redireciona para o login ao acessar uma rota protegida sem sessão válida', async () => {
    http.get.mockRejectedValueOnce({ response: { status: 401 } })

    const router = createAppRouter(createMemoryHistory())
    router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('login')
  })

  it('permite o acesso ao dashboard quando há uma sessão válida', async () => {
    http.get.mockResolvedValueOnce({ data: { id: 1, name: 'Admin' } })

    const router = createAppRouter(createMemoryHistory())
    router.push('/')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })

  it('redireciona um usuário já autenticado que acessa /login de volta ao dashboard', async () => {
    http.get.mockResolvedValueOnce({ data: { id: 1, name: 'Admin' } })

    const router = createAppRouter(createMemoryHistory())
    router.push('/login')
    await router.isReady()

    expect(router.currentRoute.value.name).toBe('dashboard')
  })
})
