import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import CadastravelItemsList from '../src/views/CadastravelItemsList.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

async function mountList(module = 'produtos', label = 'Produtos') {
  const router = createAppRouter(createMemoryHistory())
  router.push(`/cadastraveis/${module}`)
  await router.isReady()

  return mount(CadastravelItemsList, { props: { module, label }, global: { plugins: [router] } })
}

describe('CadastravelItemsList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('lista os registros do módulo informado via props', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }, { id: 2, name: 'Feijão' }] })

    const wrapper = await mountList()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/produtos')
    expect(wrapper.text()).toContain('Produtos')
    expect(wrapper.text()).toContain('Arroz')
    expect(wrapper.text()).toContain('Feijão')
  })

  it('busca no módulo recebido via props, não em um fixo', async () => {
    setPermissions(['filial.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    await mountList('filial', 'Filial')
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/filial')
  })

  it('linka o botão de novo registro para a tela de criação dedicada do módulo', async () => {
    setPermissions(['produtos.listar', 'produtos.criar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = await mountList()
    await flushPromises()

    const link = wrapper.find('a.btn-primary')
    expect(link.text()).toBe('Novo registro')
    expect(link.attributes('href')).toBe('/cadastraveis/produtos/novo')
  })

  it('esconde o link de novo registro para quem não tem permissão de criar', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = await mountList()
    await flushPromises()

    expect(wrapper.find('a.btn-primary').exists()).toBe(false)
  })

  it('permite acessar mesmo sem a permissão de listar, sem carregar a tabela', async () => {
    setPermissions(['produtos.criar'])

    const wrapper = await mountList()
    await flushPromises()

    expect(http.get).not.toHaveBeenCalled()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Você não tem permissão para listar')
  })

  it('linka o botão de editar para a tela de edição do registro, com o id certo', async () => {
    setPermissions(['produtos.listar', 'produtos.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 9, name: 'Arroz' }] })

    const wrapper = await mountList()
    await flushPromises()

    const link = wrapper.find('a[title="Editar"]')
    expect(link.attributes('href')).toBe('/cadastraveis/produtos/9/editar')
  })

  it('esconde as ações de editar e excluir para quem não tem permissão', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }] })

    const wrapper = await mountList()
    await flushPromises()

    expect(wrapper.find('.icon-btn').exists()).toBe(false)
  })

  it('remove um registro ao confirmar a exclusão', async () => {
    setPermissions(['produtos.listar', 'produtos.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = await mountList()
    await flushPromises()

    await wrapper.find('button[title="Excluir"]').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/cadastraveis/produtos/1')
    expect(wrapper.text()).not.toContain('Arroz')
  })

  it('filtra os registros pelo nome', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }, { id: 2, name: 'Feijão' }] })

    const wrapper = await mountList()
    await flushPromises()

    await wrapper.find('input[type="search"]').setValue('feij')

    expect(wrapper.text()).toContain('Feijão')
    expect(wrapper.text()).not.toContain('Arroz')
  })
})
