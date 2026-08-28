import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import App from '../src/App.vue'

describe('App', () => {
  it('renderiza a tela inicial', () => {
    const wrapper = mount(App)

    expect(wrapper.text()).toContain('Ambiente de desenvolvimento pronto.')
  })
})
