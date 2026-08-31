import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import RolesList from '../src/views/RolesList.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

async function mountRolesList() {
  const router = createAppRouter(createMemoryHistory())
  router.push('/funcoes')
  await router.isReady()

  return mount(RolesList, { global: { plugins: [router] } })
}

describe('RolesList', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('lista as funções cadastradas com um resumo das permissões por módulo', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({
      data: [
        {
          id: 1,
          name: 'Inspetor',
          permissions: [
            { id: 1, name: 'usuarios.listar' },
            { id: 2, name: 'usuarios.editar' },
          ],
        },
        { id: 2, name: 'Gestor', permissions: [] },
      ],
    })

    const wrapper = await mountRolesList()
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/roles')
    expect(wrapper.text()).toContain('Inspetor')
    expect(wrapper.text()).toContain('Usuários: 2')
    expect(wrapper.text()).toContain('2 permissões ativas em 1 módulos')
    expect(wrapper.text()).toContain('Gestor')
    expect(wrapper.text()).toContain('Nenhuma permissão')
  })

  it('mostra um selo de Acesso Total para a Função Administrador, sem listar permissões', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({
      data: [{ id: 1, name: 'Administrador', permissions: [] }],
    })

    const wrapper = await mountRolesList()
    await flushPromises()

    expect(wrapper.text()).toContain('Acesso Total')
  })

  it('linka o botão de nova função para a tela de criação dedicada', async () => {
    setPermissions(['funcoes.listar', 'funcoes.criar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = await mountRolesList()
    await flushPromises()

    const link = wrapper.find('a.btn-primary')
    expect(link.text()).toBe('Nova Função')
    expect(link.attributes('href')).toBe('/funcoes/novo')
  })

  it('esconde o link de nova função para quem não tem permissão de criar', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const wrapper = await mountRolesList()
    await flushPromises()

    expect(wrapper.find('a.btn-primary').exists()).toBe(false)
  })

  it('permite acessar mesmo sem a permissão de listar, sem carregar a tabela', async () => {
    setPermissions(['funcoes.criar'])

    const wrapper = await mountRolesList()
    await flushPromises()

    expect(http.get).not.toHaveBeenCalled()
    expect(wrapper.find('table').exists()).toBe(false)
    expect(wrapper.text()).toContain('Você não tem permissão para listar')
  })

  it('linka o botão de editar para a tela de edição da função, com o id certo', async () => {
    setPermissions(['funcoes.listar', 'funcoes.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 7, name: 'Inspetor', permissions: [] }] })

    const wrapper = await mountRolesList()
    await flushPromises()

    const link = wrapper.find('a[title="Editar"]')
    expect(link.attributes('href')).toBe('/funcoes/7/editar')
  })

  it('esconde as ações de editar e excluir para quem não tem permissão', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Inspetor', permissions: [] }] })

    const wrapper = await mountRolesList()
    await flushPromises()

    expect(wrapper.find('.icon-btn').exists()).toBe(false)
  })

  it('remove uma função ao confirmar a exclusão', async () => {
    setPermissions(['funcoes.listar', 'funcoes.excluir'])
    http.get.mockResolvedValueOnce({ data: [{ id: 1, name: 'Inspetor', permissions: [] }] })
    http.delete.mockResolvedValueOnce({})
    http.get.mockResolvedValueOnce({ data: [] })
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    const wrapper = await mountRolesList()
    await flushPromises()

    await wrapper.find('button[title="Excluir"]').trigger('click')
    await flushPromises()

    expect(http.delete).toHaveBeenCalledWith('/api/roles/1')
    expect(wrapper.text()).not.toContain('Inspetor')
  })

  it('filtra funções pelo nome', async () => {
    setPermissions(['funcoes.listar'])
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'Inspetor', permissions: [] },
        { id: 2, name: 'Gestor', permissions: [] },
      ],
    })

    const wrapper = await mountRolesList()
    await flushPromises()

    await wrapper.find('input[type="search"]').setValue('gestor')

    expect(wrapper.text()).toContain('Gestor')
    expect(wrapper.text()).not.toContain('Inspetor')
  })
})
