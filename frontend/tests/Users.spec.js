import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import Users from '../src/views/Users.vue'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

describe('Users', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('lista os usuários cadastrados', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Ana', email: 'ana@foodservice.local' },
        { id: 2, name: 'Bruno', email: 'bruno@foodservice.local' },
      ],
    })

    const wrapper = mount(Users)
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/users')
    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain('Bruno')
  })

  it('permite cadastrar mesmo sem a permissão de listar, sem carregar a tabela', async () => {
    setPermissions(['usuarios.criar'])

    const wrapper = mount(Users)
    await flushPromises()

    expect(http.get).not.toHaveBeenCalled()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Novo Usuário')
    expect(wrapper.text()).toContain('Você não tem permissão para listar')
  })

  it('esconde o botão de novo usuário para quem não tem permissão de criar', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = mount(Users)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Novo Usuário')
  })

  it('cadastra um novo usuário quando o formulário é enviado', async () => {
    setPermissions(['usuarios.listar', 'usuarios.criar'])
    http.get.mockResolvedValueOnce({ data: [] })
    http.post.mockResolvedValueOnce({ data: { id: 3, name: 'Nova', email: 'nova@foodservice.local' } })
    http.get.mockResolvedValueOnce({ data: [{ id: 3, name: 'Nova', email: 'nova@foodservice.local' }] })

    const wrapper = mount(Users)
    await flushPromises()

    await wrapper.find('button.btn-primary.btn-sm').trigger('click')
    await wrapper.find('#user-name').setValue('Nova')
    await wrapper.find('#user-email').setValue('nova@foodservice.local')
    await wrapper.find('#user-password').setValue('senha-secreta')
    await wrapper.find('#user-password-confirmation').setValue('senha-secreta')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/api/users', {
      name: 'Nova',
      email: 'nova@foodservice.local',
      password: 'senha-secreta',
      password_confirmation: 'senha-secreta',
    })
    expect(wrapper.text()).toContain('Nova')
  })

  it('esconde as ações de editar e excluir para quem não tem permissão', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Ana', email: 'ana@foodservice.local' }] })

    const wrapper = mount(Users)
    await flushPromises()

    expect(wrapper.text()).not.toContain('Editar')
    expect(wrapper.text()).not.toContain('Excluir')
  })

  it('remove um usuário ao confirmar a exclusão', async () => {
    setPermissions(['usuarios.listar', 'usuarios.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Ana', email: 'ana@foodservice.local' }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = mount(Users)
    await flushPromises()

    await wrapper.find('button.btn-outline-danger').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/users/1')
    expect(wrapper.text()).not.toContain('Ana')
  })
})
