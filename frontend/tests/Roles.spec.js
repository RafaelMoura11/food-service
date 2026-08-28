import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import Roles from '../src/views/Roles.vue'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

describe('Roles', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('lista as funções cadastradas com suas permissões', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Inspetor', permissions: [{ id: 1, name: 'usuarios.listar' }] },
        { id: 2, name: 'Gestor', permissions: [] },
      ],
    })

    const wrapper = mount(Roles)
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/roles')
    expect(wrapper.text()).toContain('Inspetor')
    expect(wrapper.text()).toContain('usuarios.listar')
    expect(wrapper.text()).toContain('Gestor')
  })

  it('permite cadastrar mesmo sem a permissão de listar, sem carregar a tabela', async () => {
    setPermissions(['funcoes.criar'])

    const wrapper = mount(Roles)
    await flushPromises()

    expect(http.get).not.toHaveBeenCalled()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Nova Função')
    expect(wrapper.text()).toContain('Você não tem permissão para listar')
  })

  it('esconde o botão de nova função para quem não tem permissão de criar', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = mount(Roles)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Nova Função')
  })

  it('cadastra uma nova função com as permissões selecionadas', async () => {
    setPermissions(['funcoes.listar', 'funcoes.criar'])
    http.get.mockResolvedValueOnce({ data: [] })
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'usuarios.listar' },
        { id: 2, name: 'usuarios.criar' },
      ],
    })
    http.post.mockResolvedValueOnce({
      data: { id: 3, name: 'Inspetor', permissions: [{ id: 1, name: 'usuarios.listar' }] },
    })
    http.get.mockResolvedValueOnce({
      data: [{ id: 3, name: 'Inspetor', permissions: [{ id: 1, name: 'usuarios.listar' }] }],
    })

    const wrapper = mount(Roles)
    await flushPromises()

    await wrapper.find('button.btn-primary.btn-sm').trigger('click')
    await flushPromises()

    await wrapper.find('#role-name').setValue('Inspetor')
    await wrapper.find('#permission-1').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/api/roles', { name: 'Inspetor', permissions: [1] })
    expect(wrapper.text()).toContain('Inspetor')
  })

  it('esconde as ações de editar e excluir para quem não tem permissão', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Inspetor', permissions: [] }] })

    const wrapper = mount(Roles)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Editar')
    expect(wrapper.text()).not.toContain('Excluir')
  })

  it('remove uma função ao confirmar a exclusão', async () => {
    setPermissions(['funcoes.listar', 'funcoes.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Inspetor', permissions: [] }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mount(Roles)
    await flushPromises()

    await wrapper.find('button.btn-outline-danger').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/roles/1')
    expect(wrapper.text()).not.toContain('Inspetor')
  })
})
