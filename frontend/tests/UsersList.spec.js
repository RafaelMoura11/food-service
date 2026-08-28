import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import UsersList from '../src/views/UsersList.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

async function mountUsersList() {
  const router = createAppRouter(createMemoryHistory())
  router.push('/usuarios')
  await router.isReady()

  return mount(UsersList, { global: { plugins: [router] } })
}

describe('UsersList', () => {
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

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/users')
    expect(wrapper.text()).toContain('Ana')
    expect(wrapper.text()).toContain('Bruno')
  })

  it('permite acessar mesmo sem a permissão de listar, sem carregar a tabela', async () => {
    setPermissions(['usuarios.criar'])

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(http.get).not.toHaveBeenCalled()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Você não tem permissão para listar')
  })

  it('linka o botão de novo usuário para a tela de criação dedicada', async () => {
    setPermissions(['usuarios.listar', 'usuarios.criar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = await mountUsersList()
    await flushPromises()

    const link = wrapper.find('a.btn-primary')
    expect(link.text()).toBe('Novo Usuário')
    expect(link.attributes('href')).toBe('/usuarios/novo')
  })

  it('esconde o link de novo usuário para quem não tem permissão de criar', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(wrapper.find('a.btn-primary').exists()).toBe(false)
  })

  it('esconde as ações de editar e excluir para quem não tem permissão', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Ana', email: 'ana@foodservice.local' }] })

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(wrapper.text()).not.toContain('Editar')
    expect(wrapper.text()).not.toContain('Excluir')
  })

  it('linka o botão de editar para a tela de edição, com o id certo', async () => {
    setPermissions(['usuarios.listar', 'usuarios.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local' }] })

    const wrapper = await mountUsersList()
    await flushPromises()

    const link = wrapper.find('a.btn-outline-secondary')
    expect(link.text()).toBe('Editar')
    expect(link.attributes('href')).toBe('/usuarios/5/editar')
  })

  it('mostra o link "Funções" (em vez de "Editar") para quem só tem funcoes.editar, apontando pra mesma tela', async () => {
    setPermissions(['funcoes.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local', roles: [] }] })

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/users')
    const link = wrapper.find('a.btn-outline-primary')
    expect(link.text()).toBe('Funções')
    expect(link.attributes('href')).toBe('/usuarios/5/editar')
    expect(wrapper.find('a.btn-outline-secondary').exists()).toBe(false)
  })

  it('remove um usuário ao confirmar a exclusão', async () => {
    setPermissions(['usuarios.listar', 'usuarios.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Ana', email: 'ana@foodservice.local' }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = await mountUsersList()
    await flushPromises()

    await wrapper.find('button.btn-outline-danger').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/users/1')
    expect(wrapper.text()).not.toContain('Ana')
  })
})
