import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import App from '../src/App.vue'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('redireciona para a tela de login quando não há sessão válida', async () => {
    http.get.mockRejectedValueOnce({ response: { status: 401 } })

    const router = createAppRouter(createMemoryHistory())
    const wrapper = mount(App, { global: { plugins: [router] } })

    router.push('/')
    await router.isReady()
    await flushPromises()

    expect(wrapper.find('#email').exists()).toBe(true)
  })

  it('renderiza o dashboard quando há uma sessão válida', async () => {
    http.get.mockResolvedValueOnce({ data: { id: 1, name: 'Admin' } })

    const router = createAppRouter(createMemoryHistory())
    const wrapper = mount(App, { global: { plugins: [router] } })

    router.push('/')
    await router.isReady()
    await flushPromises()

    expect(wrapper.text()).toContain('Dashboard')
  })

  it('remonta a tela ao navegar entre dois módulos Cadastráveis, buscando o novo módulo', async () => {
    // As ~25 rotas Cadastráveis reutilizam o mesmo componente (router/index.js);
    // sem a `key` em <router-view> (App.vue), o Vue Router manteria a mesma
    // instância viva entre elas e o segundo módulo nunca seria buscado.
    http.get.mockResolvedValueOnce({
      data: { id: 1, name: 'Admin', permissions: ['produtos.listar', 'filial.listar'] },
    })
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }] })

    const router = createAppRouter(createMemoryHistory())
    const wrapper = mount(App, { global: { plugins: [router] } })

    router.push('/cadastraveis/produtos')
    await router.isReady()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/produtos')
    expect(wrapper.text()).toContain('Arroz')

    http.get.mockResolvedValueOnce({ data: [{ id: 2, name: 'Matriz' }] })
    await router.push('/cadastraveis/filial')
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/filial')
    expect(wrapper.text()).toContain('Matriz')
    expect(wrapper.text()).not.toContain('Arroz')
  })
})
