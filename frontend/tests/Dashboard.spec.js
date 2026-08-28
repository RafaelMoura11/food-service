import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

async function mountDashboard(permissions) {
  http.get.mockResolvedValueOnce({ data: { id: 1, name: 'Admin', permissions } })

  const router = createAppRouter(createMemoryHistory())
  const wrapper = mount({ template: '<router-view />' }, { global: { plugins: [router] } })

  router.push('/')
  await router.isReady()
  await flushPromises()

  return wrapper
}

describe('Dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('não mostra links de módulos para quem não tem nenhuma permissão', async () => {
    const wrapper = await mountDashboard([])

    expect(wrapper.text()).not.toContain('Usuários')
    expect(wrapper.text()).not.toContain('Funções')
  })

  it('mostra o link de Usuários para quem tem qualquer permissão do módulo usuarios', async () => {
    const wrapper = await mountDashboard(['usuarios.criar'])

    expect(wrapper.text()).toContain('Usuários')
    expect(wrapper.text()).not.toContain('Funções')
  })

  it('mostra o link de Funções para quem tem qualquer permissão do módulo funcoes', async () => {
    const wrapper = await mountDashboard(['funcoes.excluir'])

    expect(wrapper.text()).toContain('Funções')
    expect(wrapper.text()).not.toContain('Usuários')
  })
})
