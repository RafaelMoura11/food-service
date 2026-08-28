import { computed, ref, watch } from 'vue'

// Busca (client-side, sobre os itens já buscados da API) + paginação
// compartilhadas por toda tela de listagem (Usuários, Funções, cada módulo
// Cadastrável). Nenhum desses recursos pagina ou filtra no backend hoje.
export function usePagedList(itemsRef, { searchFields, pageSize = 10 }) {
  const search = ref('')
  const page = ref(1)

  const filtered = computed(() => {
    const term = search.value.trim().toLowerCase()

    if (!term) {
      return itemsRef.value
    }

    return itemsRef.value.filter((item) =>
      searchFields.some((field) => String(item[field] ?? '').toLowerCase().includes(term)),
    )
  })

  const totalPages = computed(() => Math.max(1, Math.ceil(filtered.value.length / pageSize)))

  const paginated = computed(() => {
    const start = (page.value - 1) * pageSize
    return filtered.value.slice(start, start + pageSize)
  })

  const rangeStart = computed(() => (filtered.value.length === 0 ? 0 : (page.value - 1) * pageSize + 1))
  const rangeEnd = computed(() => Math.min(page.value * pageSize, filtered.value.length))

  watch(search, () => {
    page.value = 1
  })

  watch(totalPages, (total) => {
    if (page.value > total) {
      page.value = total
    }
  })

  return { search, page, totalPages, filtered, paginated, rangeStart, rangeEnd }
}
