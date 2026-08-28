import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import Pagination from '../src/components/Pagination.vue'

describe('Pagination', () => {
  it('renderiza um botão por página e destaca a página atual', () => {
    const wrapper = mount(Pagination, { props: { page: 2, totalPages: 3 } })

    const pageButtons = wrapper.findAll('.page-item:not(:first-child):not(:last-child)')
    expect(pageButtons).toHaveLength(3)
    expect(pageButtons[1].classes()).toContain('active')
  })

  it('emite update:page com o número da página clicada', async () => {
    const wrapper = mount(Pagination, { props: { page: 1, totalPages: 3 } })

    await wrapper.findAll('.page-link')[2].trigger('click')

    expect(wrapper.emitted('update:page')[0]).toEqual([2])
  })

  it('desabilita "Anterior" na primeira página e "Próximo" na última', () => {
    const first = mount(Pagination, { props: { page: 1, totalPages: 3 } })
    expect(first.find('button:disabled').text()).toBe('Anterior')

    const last = mount(Pagination, { props: { page: 3, totalPages: 3 } })
    const disabledButtons = last.findAll('button:disabled')
    expect(disabledButtons).toHaveLength(1)
    expect(disabledButtons[0].text()).toBe('Próximo')
  })

  it('não emite update:page ao clicar em "Anterior"/"Próximo" desabilitados', async () => {
    const wrapper = mount(Pagination, { props: { page: 1, totalPages: 1 } })

    await wrapper.find('button:disabled').trigger('click')

    expect(wrapper.emitted('update:page')).toBeUndefined()
  })
})
