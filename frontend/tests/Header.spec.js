import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMemoryHistory } from 'vue-router'
import Header from '../src/components/Header.vue'
import http from '../src/api/http'
import { createAppRouter } from '../src/router'

vi.mock('../src/api/http', () => ({
  default: { get: vi.fn(), post: vi.fn() },
}))

describe('Header', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('desloga e redireciona para o login ao clicar em "Sair"', async () => {
    http.post.mockResolvedValueOnce({})

    const router = createAppRouter(createMemoryHistory())
    router.push('/')
    await router.isReady()

    const wrapper = mount(Header, { global: { plugins: [router] } })

    await wrapper.find('button').trigger('click')
    await flushPromises()

    expect(http.post).toHaveBeenCalledWith('/logout')
    expect(router.currentRoute.value.name).toBe('login')
  })
})
