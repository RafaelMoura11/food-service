import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import CadastravelItemForm from '../src/views/CadastravelItemForm.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

async function mountForm(props, path) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions: ['produtos.criar', 'produtos.editar'] }

  const router = createAppRouter(createMemoryHistory())
  router.push(path)
  await router.isReady()

  return { wrapper: mount(CadastravelItemForm, { props, global: { plugins: [router] } }), router }
}

describe('CadastravelItemForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('cadastra um novo registro no módulo correto e volta para a listagem', async () => {
    http.post.mockResolvedValueOnce({ data: { id: 3, name: 'Arroz' } })

    const { wrapper, router } = await mountForm(
      { module: 'produtos', label: 'Produtos' },
      '/cadastraveis/produtos/novo',
    )
    await flushPromises()

    await wrapper.find('#item-name').setValue('Arroz')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/api/cadastraveis/produtos', { name: 'Arroz' })
    expect(router.currentRoute.value.name).toBe('cadastraveis-produtos')
  })

  it('carrega o nome atual ao editar e permite salvar', async () => {
    http.get.mockResolvedValueOnce({ data: [{ id: 9, name: 'Arroz' }] })
    http.put.mockResolvedValueOnce({ data: { id: 9, name: 'Arroz Integral' } })

    const { wrapper, router } = await mountForm(
      { module: 'produtos', label: 'Produtos', id: '9' },
      '/cadastraveis/produtos/9/editar',
    )
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/produtos')
    expect(wrapper.find('#item-name').element.value).toBe('Arroz')

    await wrapper.find('#item-name').setValue('Arroz Integral')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.put).toHaveBeenCalledWith('/api/cadastraveis/produtos/9', { name: 'Arroz Integral' })
    expect(router.currentRoute.value.name).toBe('cadastraveis-produtos')
  })

  it('mostra "Registro não encontrado" quando o id não existe na lista', async () => {
    http.get.mockResolvedValueOnce({ data: [] })

    const { wrapper } = await mountForm(
      { module: 'produtos', label: 'Produtos', id: '999' },
      '/cadastraveis/produtos/999/editar',
    )
    await flushPromises()

    expect(wrapper.text()).toContain('Registro não encontrado')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('o botão cancelar leva de volta para a listagem do módulo', async () => {
    const { wrapper, router } = await mountForm(
      { module: 'produtos', label: 'Produtos' },
      '/cadastraveis/produtos/novo',
    )
    await flushPromises()

    await wrapper.find('a.btn-outline-secondary').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('cadastraveis-produtos')
  })
})
