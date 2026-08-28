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

function userList(count, overrides = {}) {
  return Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    name: `Usuário ${i + 1}`,
    email: `usuario${i + 1}@foodservice.local`,
    roles: [],
    ...overrides,
  }))
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

    expect(wrapper.find('.icon-btn').exists()).toBe(false)
  })

  it('linka o botão de editar para a tela de edição, com o id certo', async () => {
    setPermissions(['usuarios.listar', 'usuarios.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local' }] })

    const wrapper = await mountUsersList()
    await flushPromises()

    const link = wrapper.find('a[title="Editar"]')
    expect(link.attributes('href')).toBe('/usuarios/5/editar')
  })

  it('mostra o botão "Funções" (em vez de "Editar") para quem só tem funcoes.editar, apontando pra mesma tela', async () => {
    setPermissions(['funcoes.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local', roles: [] }] })

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/users')
    const link = wrapper.find('a[title="Funções"]')
    expect(link.attributes('href')).toBe('/usuarios/5/editar')
    expect(wrapper.find('a[title="Editar"]').exists()).toBe(false)
  })

  it('remove um usuário ao confirmar a exclusão', async () => {
    setPermissions(['usuarios.listar', 'usuarios.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Ana', email: 'ana@foodservice.local' }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = await mountUsersList()
    await flushPromises()

    await wrapper.find('button[title="Excluir"]').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/users/1')
    expect(wrapper.text()).not.toContain('Ana')
  })

  it('filtra por nome ou e-mail ao buscar', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Ana Costa', email: 'ana@foodservice.local' },
        { id: 2, name: 'Bruno', email: 'bruno@foodservice.local' },
      ],
    })

    const wrapper = await mountUsersList()
    await flushPromises()

    await wrapper.find('input[type="search"]').setValue('bruno')

    expect(wrapper.text()).toContain('Bruno')
    expect(wrapper.text()).not.toContain('Ana Costa')

    await wrapper.find('input[type="search"]').setValue('foodservice.local')
    expect(wrapper.text()).toContain('Ana Costa')
    expect(wrapper.text()).toContain('Bruno')
  })

  it('pagina a lista em páginas de 10 e navega entre elas', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({ data: userList(12) })

    const wrapper = await mountUsersList()
    await flushPromises()

    expect(wrapper.text()).toContain('Usuário 1')
    expect(wrapper.text()).toContain('Usuário 10')
    expect(wrapper.text()).not.toContain('Usuário 11')
    expect(wrapper.text()).toContain('Exibindo 1-10 de 12 usuários')

    const pageTwo = wrapper.findAll('.pagination .page-link').find((el) => el.text() === '2')
    await pageTwo.trigger('click')

    expect(wrapper.text()).toContain('Usuário 11')
    expect(wrapper.text()).toContain('Usuário 12')
    expect(wrapper.text()).not.toContain('Usuário 1 ')
    expect(wrapper.text()).toContain('Exibindo 11-12 de 12 usuários')
  })

  it('volta para a primeira página ao buscar', async () => {
    setPermissions(['usuarios.listar'])
    http.get.mockResolvedValueOnce({ data: userList(12) })

    const wrapper = await mountUsersList()
    await flushPromises()

    const pageTwo = wrapper.findAll('.pagination .page-link').find((el) => el.text() === '2')
    await pageTwo.trigger('click')
    expect(wrapper.text()).toContain('Usuário 11')

    await wrapper.find('input[type="search"]').setValue('foodservice')

    const activePage = wrapper.find('.pagination .page-item.active .page-link')
    expect(activePage.text()).toBe('1')
    expect(wrapper.text()).toContain('Usuário 1')
    expect(wrapper.text()).not.toContain('Usuário 11')
  })
})
