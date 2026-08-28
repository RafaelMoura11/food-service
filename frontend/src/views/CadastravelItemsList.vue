<script setup>
import { onMounted, ref } from 'vue'
import http from '../api/http'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  module: { type: String, required: true },
  label: { type: String, required: true },
})

const { can } = useAuth()

const items = ref([])
const loading = ref(true)
const error = ref('')

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
    <div class="card card-primary">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">{{ label }}</h3>
        <router-link
          v-if="canModule('criar')"
          :to="{ name: `cadastraveis-${module}-novo` }"
          class="btn btn-primary btn-sm"
        >
          Novo registro
        </router-link>
      </div>

      <div class="card-body">
        <p v-if="!canModule('listar')" class="text-muted mb-0">
          Você não tem permissão para listar os registros de {{ label }}.
        </p>
        <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
        <p v-else-if="loading">Carregando…</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th v-if="canModule('editar') || canModule('excluir')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.id">
              <td>{{ item.name }}</td>
              <td v-if="canModule('editar') || canModule('excluir')">
                <router-link
                  v-if="canModule('editar')"
                  :to="{ name: `cadastraveis-${module}-editar`, params: { id: item.id } }"
                  class="btn btn-outline-secondary btn-sm me-2"
                >
                  Editar
                </router-link>
                <button
                  v-if="canModule('excluir')"
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  @click="handleDelete(item)"
                >
                  Excluir
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
