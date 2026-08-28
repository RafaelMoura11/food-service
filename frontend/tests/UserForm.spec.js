import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import { useAuth } from '../src/composables/useAuth'
import UserForm from '../src/views/UserForm.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

function setPermissions(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }
}

async function mountForm(props, path) {
  const router = createAppRouter(createMemoryHistory())
  router.push(path)
  await router.isReady()

  return { wrapper: mount(UserForm, { props, global: { plugins: [router] } }), router }
}

describe('UserForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('cadastra um novo usuário sem seção de Funções para quem não tem funcoes.editar', async () => {
    setPermissions(['usuarios.criar'])
    http.post.mockResolvedValueOnce({ data: { id: 3, name: 'Nova', email: 'nova@foodservice.local' } })

    const { wrapper, router } = await mountForm({}, '/usuarios/novo')
    await flushPromises()

    expect(wrapper.text()).not.toContain('Funções')

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
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('permite atribuir Funções já na criação para quem também tem funcoes.editar', async () => {
    setPermissions(['usuarios.criar', 'funcoes.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 6, name: 'Gestor' }] })
    http.post.mockResolvedValueOnce({ data: { id: 3, name: 'Nova', email: 'nova@foodservice.local' } })

    const { wrapper, router } = await mountForm({}, '/usuarios/novo')
    await flushPromises()

    expect(http.get).toHaveBeenCalledWith('/api/roles/options')
    expect(wrapper.text()).toContain('Funções')
    expect(wrapper.text()).toContain('Gestor')

    await wrapper.find('#user-name').setValue('Nova')
    await wrapper.find('#user-email').setValue('nova@foodservice.local')
    await wrapper.find('#user-password').setValue('senha-secreta')
    await wrapper.find('#user-password-confirmation').setValue('senha-secreta')
    await wrapper.find('#user-role-6').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/api/users', {
      name: 'Nova',
      email: 'nova@foodservice.local',
      password: 'senha-secreta',
      password_confirmation: 'senha-secreta',
      roles: [6],
    })
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('carrega os dados e as Funções do usuário ao editar, com usuarios.editar e funcoes.editar', async () => {
    setPermissions(['usuarios.editar', 'funcoes.editar'])
    http.get.mockResolvedValueOnce({
      data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local', roles: [{ id: 6, name: 'Gestor' }] }],
    })
    http.get.mockResolvedValueOnce({
      data: [
        { id: 5, name: 'Inspetor' },
        { id: 6, name: 'Gestor' },
      ],
    })

    const { wrapper } = await mountForm({ id: '5' }, '/usuarios/5/editar')
    await flushPromises()

    expect(wrapper.find('#user-name').element.value).toBe('Ana')
    expect(wrapper.find('#user-email').element.value).toBe('ana@foodservice.local')
    expect(wrapper.find('#user-role-6').element.checked).toBe(true)
    expect(wrapper.find('#user-role-5').element.checked).toBe(false)
  })

  it('salva os dados do usuário em edição, sem enviar Funções junto', async () => {
    setPermissions(['usuarios.editar'])
    http.get.mockResolvedValueOnce({
      data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local', roles: [] }],
    })
    http.put.mockResolvedValueOnce({ data: {} })

    const { wrapper, router } = await mountForm({ id: '5' }, '/usuarios/5/editar')
    await flushPromises()

    await wrapper.find('#user-name').setValue('Ana Paula')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.put).toHaveBeenCalledWith('/api/users/5', { name: 'Ana Paula', email: 'ana@foodservice.local' })
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('não mostra a seção de dados nem de Funções pra quem não tem nenhuma das duas Permissões', async () => {
    // Só chega nessa tela com usuarios.editar OU funcoes.editar (guarda de
    // rota); aqui simulamos o pior caso de ambas ausentes por segurança.
    setPermissions([])
    http.get.mockResolvedValueOnce({ data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local', roles: [] }] })

    const { wrapper } = await mountForm({ id: '5' }, '/usuarios/5/editar')
    await flushPromises()

    expect(wrapper.find('#user-name').exists()).toBe(false)
    expect(wrapper.text()).not.toContain('Funções')
  })

  it('mostra só a seção de Funções (sem os campos de dados) pra quem só tem funcoes.editar', async () => {
    setPermissions(['funcoes.editar'])
    http.get.mockResolvedValueOnce({ data: [{ id: 5, name: 'Ana', email: 'ana@foodservice.local', roles: [] }] })
    http.get.mockResolvedValueOnce({ data: [{ id: 6, name: 'Gestor' }] })
    http.put.mockResolvedValueOnce({ data: {} })

    const { wrapper, router } = await mountForm({ id: '5' }, '/usuarios/5/editar')
    await flushPromises()

    expect(wrapper.find('#user-name').exists()).toBe(false)
    expect(wrapper.text()).toContain('Funções')

    await wrapper.find('#user-role-6').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.put).toHaveBeenCalledWith('/api/users/5/roles', { roles: [6] })
    expect(router.currentRoute.value.name).toBe('users')
  })

  it('mostra "Usuário não encontrado" quando o id não existe', async () => {
    setPermissions(['usuarios.editar'])
    http.get.mockResolvedValueOnce({ data: [] })

    const { wrapper } = await mountForm({ id: '999' }, '/usuarios/999/editar')
    await flushPromises()

    expect(wrapper.text()).toContain('Usuário não encontrado')
    expect(wrapper.find('#user-name').exists()).toBe(false)
  })
})
