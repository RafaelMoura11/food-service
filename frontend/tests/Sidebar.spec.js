import { mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import { useAuth } from '../src/composables/useAuth'
import Sidebar from '../src/components/Sidebar.vue'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

function mountSidebar(permissions) {
  useAuth().user.value = { id: 1, name: 'Admin', permissions }

  const router = createAppRouter(createMemoryHistory())
  router.push('/')

  return mount(Sidebar, { global: { plugins: [router] } })
}

describe('Sidebar', () => {
  beforeEach(() => {
    useAuth().user.value = undefined
  })

  it('não mostra o grupo Cadastráveis para quem não tem nenhuma permissão de módulos Cadastráveis', () => {
    const wrapper = mountSidebar([])

    expect(wrapper.text()).not.toContain('Cadastráveis')
  })

  it('mostra o grupo Cadastráveis com apenas os módulos permitidos, agrupados sob o cabeçalho', async () => {
    const wrapper = mountSidebar(['produtos.listar'])

    await wrapper.find('a.nav-link').element // garante que o DOM já montou
    const toggle = wrapper.findAll('a.nav-link').find((el) => el.text().includes('Cadastráveis'))
    await toggle.trigger('click')

    expect(wrapper.text()).toContain('Cadastráveis')
    expect(wrapper.text()).toContain('Produtos')
    expect(wrapper.text()).not.toContain('Filial')
  })

  it('linka cada módulo Cadastrável para sua própria rota', async () => {
    const wrapper = mountSidebar(['produtos.listar', 'filial.criar'])

    const toggle = wrapper.findAll('a.nav-link').find((el) => el.text().includes('Cadastráveis'))
    await toggle.trigger('click')

    const produtosLink = wrapper.findAll('a').find((el) => el.text().includes('Produtos'))
    expect(produtosLink.attributes('href')).toBe('/cadastraveis/produtos')

    const filialLink = wrapper.findAll('a').find((el) => el.text().includes('Filial'))
    expect(filialLink.attributes('href')).toBe('/cadastraveis/filial')
  })
})
