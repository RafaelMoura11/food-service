import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import CadastravelItems from '../src/views/CadastravelItems.vue'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

function mountItems(module = 'produtos', label = 'Produtos') {
  return mount(CadastravelItems, { props: { module, label } })
}

describe('CadastravelItems', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('lista os registros do módulo informado via props', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }, { id: 2, name: 'Feijão' }] })

    const wrapper = mountItems()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/produtos')
    expect(wrapper.text()).toContain('Produtos')
    expect(wrapper.text()).toContain('Arroz')
    expect(wrapper.text()).toContain('Feijão')
  })

  it('busca no módulo recebido via props, não em um fixo', async () => {
    setPermissions(['filial.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    mountItems('filial', 'Filial')
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/cadastraveis/filial')
  })

  it('permite cadastrar mesmo sem a permissão de listar, sem carregar a tabela', async () => {
    setPermissions(['produtos.criar'])

    const wrapper = mountItems()
    await flushPromises()

    expect(http.get).not.toHaveBeenCalled()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Novo registro')
    expect(wrapper.text()).toContain('Você não tem permissão para listar')
  })

  it('esconde o botão de novo registro para quem não tem permissão de criar', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = mountItems()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Novo registro')
  })

  it('cadastra um novo registro no módulo correto', async () => {
    setPermissions(['produtos.listar', 'produtos.criar'])
    http.get.mockResolvedValueOnce({ data: [] })
    http.post.mockResolvedValueOnce({ data: { id: 3, name: 'Arroz' } })
    http.get.mockResolvedValueOnce({ data: [{ id: 3, name: 'Arroz' }] })

    const wrapper = mountItems()
    await flushPromises()

    await wrapper.find('button.btn-primary.btn-sm').trigger('click')
    await flushPromises()

    await wrapper.find('#item-name').setValue('Arroz')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/api/cadastraveis/produtos', { name: 'Arroz' })
    expect(wrapper.text()).toContain('Arroz')
  })

  it('esconde as ações de editar e excluir para quem não tem permissão', async () => {
    setPermissions(['produtos.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }] })

    const wrapper = mountItems()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Editar')
    expect(wrapper.text()).not.toContain('Excluir')
  })

  it('remove um registro ao confirmar a exclusão', async () => {
    setPermissions(['produtos.listar', 'produtos.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Arroz' }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mountItems()
    await flushPromises()

    await wrapper.find('button.btn-outline-danger').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/cadastraveis/produtos/1')
    expect(wrapper.text()).not.toContain('Arroz')
  })
})
