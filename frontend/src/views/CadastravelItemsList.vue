<script setup>
import { onMounted, ref } from 'vue'
import http from '../api/http'
import Pagination from '../components/Pagination.vue'
import { usePagedList } from '../composables/usePagedList'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  module: { type: String, required: true },
  label: { type: String, required: true },
})

const { can } = useAuth()

const items = ref([])
const loading = ref(true)
const error = ref('')

const { search, page, totalPages, filtered, paginated, rangeStart, rangeEnd } = usePagedList(items, {
  searchFields: ['name'],
  pageSize: 10,
})

function canModule(action) {
  return can(`${props.module}.${action}`)
}

async function loadItems() {
  if (!canModule('listar')) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    const { data } = await http.get(`/api/cadastraveis/${props.module}`)
    items.value = data
  } catch {
    error.value = `Não foi possível carregar os registros de ${props.label}.`
  } finally {
    loading.value = false
  }
}

async function handleDelete(item) {
  if (!window.confirm(`Remover "${item.name}"?`)) {
    return
  }

  try {
    await http.delete(`/api/cadastraveis/${props.module}/${item.id}`)
    await loadItems()
  } catch {
    error.value = `Não foi possível remover o registro de ${props.label}.`
  }
}

onMounted(loadItems)
</script>

<template>
  <div class="content-wrapper p-4">
    <h1 class="h3 mb-3">{{ label }}</h1>

    <div class="d-flex justify-content-between align-items-center mb-3 gap-2">
      <router-link v-if="canModule('criar')" :to="{ name: `cadastraveis-${module}-novo` }" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo registro
      </router-link>
      <span v-else></span>
      <div style="max-width: 260px; width: 100%;">
        <input v-model="search" type="search" class="form-control" placeholder="Buscar por nome">
      </div>
    </div>

    <p v-if="!canModule('listar')" class="text-muted mb-0">
      Você não tem permissão para listar os registros de {{ label }}.
    </p>
    <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
    <p v-else-if="loading">Carregando…</p>
    <template v-else>
      <div class="table-responsive bg-white rounded shadow-sm">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Nome</th>
              <th v-if="canModule('editar') || canModule('excluir')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in paginated" :key="item.id">
              <td>{{ item.name }}</td>
              <td v-if="canModule('editar') || canModule('excluir')">
                <router-link
                  v-if="canModule('editar')"
                  :to="{ name: `cadastraveis-${module}-editar`, params: { id: item.id } }"
                  class="icon-btn icon-btn-secondary"
                  title="Editar"
                  aria-label="Editar"
                >
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                </router-link>
                <button
                  v-if="canModule('excluir')"
                  type="button"
                  class="icon-btn icon-btn-danger"
                  title="Excluir"
                  aria-label="Excluir"
                  @click="handleDelete(item)"
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filtered.length" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">
          Exibindo {{ rangeStart }}-{{ rangeEnd }} de {{ filtered.length }} registros
        </span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
      </div>
      <p v-else class="text-muted">Nenhum registro encontrado.</p>
    </template>
  </div>
</template>
