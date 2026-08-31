import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import http from '../src/api/http'
import RoleForm from '../src/views/RoleForm.vue'
import { createAppRouter } from '../src/router'
import { useAuth } from '../src/composables/useAuth'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn(), put: vi.fn(), delete: vi.fn() },
}))

// wrapper.find(...).isVisible() é inconsistente em jsdom pra v-show (usa
// checkVisibility, que o jsdom não implementa de forma confiável), então
// checamos o style aplicado pelo v-show diretamente.
function isRowHidden(wrapper) {
  return (wrapper.find('.row.g-3').attributes('style') ?? '').includes('display: none')
}

async function mountForm(props, path = '/funcoes/novo') {
  useAuth().user.value = { id: 1, name: 'Admin', permissions: ['funcoes.criar', 'funcoes.editar'] }

  const router = createAppRouter(createMemoryHistory())
  router.push(path)
  await router.isReady()

  return { wrapper: mount(RoleForm, { props, global: { plugins: [router] } }), router }
}

describe('RoleForm', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuth().user.value = undefined
  })

  it('cadastra uma nova função com as permissões selecionadas e volta para a listagem', async () => {
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'usuarios.listar' },
        { id: 2, name: 'usuarios.criar' },
      ],
    })
    http.post.mockResolvedValueOnce({
      data: { id: 3, name: 'Inspetor', permissions: [{ id: 1, name: 'usuarios.listar' }] },
    })

    const { wrapper, router } = await mountForm()
    await flushPromises()

    await wrapper.find('#role-name').setValue('Inspetor')
    await wrapper.find('#permission-1').setValue(true)
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/api/roles', { name: 'Inspetor', permissions: [1] })
    expect(router.currentRoute.value.name).toBe('roles')
  })

  it('carrega os dados da função ao editar e permite salvar', async () => {
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'usuarios.listar' },
        { id: 2, name: 'usuarios.criar' },
      ],
    })
    http.get.mockResolvedValueOnce({
      data: [{ id: 7, name: 'Inspetor', permissions: [{ id: 1, name: 'usuarios.listar' }] }],
    })
    http.put.mockResolvedValueOnce({
      data: { id: 7, name: 'Inspetor Sênior', permissions: [{ id: 1, name: 'usuarios.listar' }] },
    })

    const { wrapper, router } = await mountForm({ id: '7' }, '/funcoes/7/editar')
    await flushPromises()

    expect(wrapper.find('#role-name').element.value).toBe('Inspetor')
    expect(wrapper.find('#permission-1').element.checked).toBe(true)

    await wrapper.find('#role-name').setValue('Inspetor Sênior')
    await wrapper.find('form').trigger('submit.prevent')
    await flushPromises()

    expect(http.put).toHaveBeenCalledWith('/api/roles/7', { name: 'Inspetor Sênior', permissions: [1] })
    expect(router.currentRoute.value.name).toBe('roles')
  })

  it('mostra "Função não encontrada" quando o id não existe', async () => {
    http.get.mockResolvedValueOnce({ data: [] })
    http.get.mockResolvedValueOnce({ data: [] })

    const { wrapper } = await mountForm({ id: '999' }, '/funcoes/999/editar')
    await flushPromises()

    expect(wrapper.text()).toContain('Função não encontrada')
    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('começa com os módulos recolhidos ao criar uma função nova', async () => {
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'usuarios.listar' },
        { id: 2, name: 'usuarios.criar' },
      ],
    })

    const { wrapper } = await mountForm()
    await flushPromises()

    const toggle = wrapper.find('button[aria-expanded]')
    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(toggle.text()).toContain('Permissões de "Usuários"')
    expect(isRowHidden(wrapper)).toBe(true)
  })

  it('expande e recolhe o módulo ao clicar no cabeçalho', async () => {
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'usuarios.listar' },
        { id: 2, name: 'usuarios.criar' },
      ],
    })

    const { wrapper } = await mountForm()
    await flushPromises()

    const toggle = wrapper.find('button[aria-expanded]')
    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(toggle.text()).toBe('Usuários')
    expect(isRowHidden(wrapper)).toBe(false)

    await toggle.trigger('click')

    expect(toggle.attributes('aria-expanded')).toBe('false')
    expect(isRowHidden(wrapper)).toBe(true)
  })

  it('começa com o módulo expandido ao editar uma função que já tem permissão marcada nele', async () => {
    http.get.mockResolvedValueOnce({
      data: [
        { id: 1, name: 'usuarios.listar' },
        { id: 2, name: 'usuarios.criar' },
      ],
    })
    http.get.mockResolvedValueOnce({
      data: [{ id: 7, name: 'Inspetor', permissions: [{ id: 1, name: 'usuarios.listar' }] }],
    })

    const { wrapper } = await mountForm({ id: '7' }, '/funcoes/7/editar')
    await flushPromises()

    const toggle = wrapper.find('button[aria-expanded]')
    expect(toggle.attributes('aria-expanded')).toBe('true')
    expect(isRowHidden(wrapper)).toBe(false)
  })

  it('o botão cancelar leva de volta para a listagem', async () => {
    http.get.mockResolvedValueOnce({ data: [] })

    const { wrapper, router } = await mountForm()
    await flushPromises()

    await wrapper.find('a.btn-outline-secondary').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.name).toBe('roles')
  })
})
