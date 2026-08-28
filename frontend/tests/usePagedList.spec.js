import { nextTick, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { usePagedList } from '../src/composables/usePagedList'

function names(list) {
  return list.map((item) => item.name)
}

describe('usePagedList', () => {
  it('não filtra nem pagina quando cabe tudo em uma página e a busca está vazia', () => {
    const items = ref([{ name: 'Ana' }, { name: 'Bruno' }])
    const { filtered, paginated, totalPages } = usePagedList(items, { searchFields: ['name'], pageSize: 10 })

    expect(names(filtered.value)).toEqual(['Ana', 'Bruno'])
    expect(names(paginated.value)).toEqual(['Ana', 'Bruno'])
    expect(totalPages.value).toBe(1)
  })

  it('filtra por qualquer um dos campos de busca informados, sem diferenciar maiúsculas', () => {
    const items = ref([
      { name: 'Ana Costa', email: 'ana@foodservice.local' },
      { name: 'Bruno', email: 'bruno@foodservice.local' },
    ])
    const { search, filtered } = usePagedList(items, { searchFields: ['name', 'email'], pageSize: 10 })

    search.value = 'COSTA'
    expect(names(filtered.value)).toEqual(['Ana Costa'])

    search.value = 'bruno@foodservice'
    expect(names(filtered.value)).toEqual(['Bruno'])
  })

  it('pagina os itens filtrados em blocos de pageSize', () => {
    const items = ref(Array.from({ length: 12 }, (_, i) => ({ name: `Item ${i + 1}` })))
    const { page, paginated, totalPages, rangeStart, rangeEnd } = usePagedList(items, {
      searchFields: ['name'],
      pageSize: 10,
    })

    expect(totalPages.value).toBe(2)
    expect(paginated.value).toHaveLength(10)
    expect(rangeStart.value).toBe(1)
    expect(rangeEnd.value).toBe(10)

    page.value = 2
    expect(names(paginated.value)).toEqual(['Item 11', 'Item 12'])
    expect(rangeStart.value).toBe(11)
    expect(rangeEnd.value).toBe(12)
  })

  it('volta para a primeira página quando a busca muda', async () => {
    const items = ref(Array.from({ length: 12 }, (_, i) => ({ name: `Item ${i + 1}` })))
    const { search, page } = usePagedList(items, { searchFields: ['name'], pageSize: 10 })

    page.value = 2
    search.value = 'Item 1'
    await nextTick()

    expect(page.value).toBe(1)
  })

  it('recua a página atual quando a busca reduz o total de páginas abaixo dela', async () => {
    const items = ref(Array.from({ length: 12 }, (_, i) => ({ name: `Item ${i + 1}` })))
    const { search, page, totalPages } = usePagedList(items, { searchFields: ['name'], pageSize: 10 })

    page.value = 2
    // Um termo específico o bastante para não disparar o reset por busca
    // (mesmo texto de item único), só o clamp por totalPages ter caído.
    search.value = 'Item 3'
    await nextTick()

    expect(totalPages.value).toBe(1)
    expect(page.value).toBe(1)
  })

  it('mostra range e total zerados quando não há resultado', () => {
    const items = ref([{ name: 'Ana' }])
    const { search, filtered, rangeStart, rangeEnd, totalPages } = usePagedList(items, {
      searchFields: ['name'],
      pageSize: 10,
    })

    search.value = 'ninguém tem esse nome'

    expect(filtered.value).toHaveLength(0)
    expect(rangeStart.value).toBe(0)
    expect(rangeEnd.value).toBe(0)
    expect(totalPages.value).toBe(1)
  })
})
