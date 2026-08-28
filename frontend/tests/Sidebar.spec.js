import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { useAuth } from '../src/composables/useAuth'
import Sidebar from '../src/components/Sidebar.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

async function mountSidebar(permissions, path = '/') {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }

  const router = createAppRouter(createMemoryHistory())
  router.push(path)
  await router.isReady()

  const wrapper = mount(Sidebar, { global: { plugins: [router] } })
  await flushPromises()

  return wrapper
}

describe('Sidebar', () => {
  beforeEach(() => {
    useAuth().user.value = undefined
  })

  it('não mostra o grupo Cadastráveis para quem não tem nenhuma permissão de módulos Cadastráveis', async () => {
    const wrapper = await mountSidebar([])

    expect(wrapper.text()).not.toContain('Cadastráveis')
  })

  it('mostra o grupo Cadastráveis com apenas os módulos permitidos, agrupados sob o cabeçalho', async () => {
    const wrapper = await mountSidebar(['produtos.listar'])

    const toggle = wrapper.findAll('a.nav-link').find((el) => el.text().includes('Cadastráveis'))
    await toggle.trigger('click')

    expect(wrapper.text()).toContain('Cadastráveis')
    expect(wrapper.text()).toContain('Produtos')
    expect(wrapper.text()).not.toContain('Filial')
  })

  it('linka cada módulo Cadastrável para sua própria rota', async () => {
    const wrapper = await mountSidebar(['produtos.listar', 'filial.criar'])

    const toggle = wrapper.findAll('a.nav-link').find((el) => el.text().includes('Cadastráveis'))
    await toggle.trigger('click')

    const produtosLink = wrapper.findAll('a').find((el) => el.text().includes('Produtos'))
    expect(produtosLink.attributes('href')).toBe('/cadastraveis/produtos')

    const filialLink = wrapper.findAll('a').find((el) => el.text().includes('Filial'))
    expect(filialLink.attributes('href')).toBe('/cadastraveis/filial')
  })

  it('marca o item ativo do menu com a classe "active", para ficar visualmente distinguível dos demais', async () => {
    const wrapper = await mountSidebar(['produtos.listar'], '/')

    const dashboardLink = wrapper.findAll('a').find((el) => el.text() === 'Dashboard')
    expect(dashboardLink.classes()).toContain('active')
  })
})
