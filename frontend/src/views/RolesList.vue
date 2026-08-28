<script setup>
import { onMounted, ref } from 'vue'
import http from '../api/http'
import Pagination from '../components/Pagination.vue'
import { usePagedList } from '../composables/usePagedList'
import { useAuth } from '../composables/useAuth'

const { can } = useAuth()

const roles = ref([])
const loading = ref(true)
const error = ref('')

const { search, page, totalPages, filtered, paginated, rangeStart, rangeEnd } = usePagedList(roles, {
  searchFields: ['name'],
  pageSize: 10,
})

async function loadRoles() {
  if (!can('funcoes.listar')) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    const { data } = await http.get('/api/roles')
    roles.value = data
  } catch {
    error.value = 'Não foi possível carregar as funções.'
  } finally {
    loading.value = false
  }
}

async function handleDelete(role) {
  if (!window.confirm(`Remover a função "${role.name}"?`)) {
    return
  }

  try {
    await http.delete(`/api/roles/${role.id}`)
    await loadRoles()
  } catch {
    error.value = 'Não foi possível remover a função.'
  }
}

onMounted(loadRoles)
</script>

<template>
  <div class="content-wrapper p-4">
    <h1 class="h3 mb-3">Gerenciamento de Funções</h1>

    <div class="d-flex justify-content-between align-items-center mb-3 gap-2">
      <router-link v-if="can('funcoes.criar')" :to="{ name: 'roles-novo' }" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Nova Função
      </router-link>
      <span v-else></span>
      <div style="max-width: 260px; width: 100%;">
        <input v-model="search" type="search" class="form-control" placeholder="Buscar por nome">
      </div>
    </div>

    <p v-if="!can('funcoes.listar')" class="text-muted mb-0">
      Você não tem permissão para listar as funções cadastradas.
    </p>
    <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
    <p v-else-if="loading">Carregando…</p>
    <template v-else>
      <div class="table-responsive bg-white rounded shadow-sm">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Permissões</th>
              <th v-if="can('funcoes.editar') || can('funcoes.excluir')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in paginated" :key="role.id">
              <td>{{ role.name }}</td>
              <td>{{ role.permissions.map((permission) => permission.name).join(', ') }}</td>
              <td v-if="can('funcoes.editar') || can('funcoes.excluir')">
                <router-link
                  v-if="can('funcoes.editar')"
                  :to="{ name: 'roles-editar', params: { id: role.id } }"
                  class="icon-btn icon-btn-secondary"
                  title="Editar"
                  aria-label="Editar"
                >
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                </router-link>
                <button
                  v-if="can('funcoes.excluir')"
                  type="button"
                  class="icon-btn icon-btn-danger"
                  title="Excluir"
                  aria-label="Excluir"
                  @click="handleDelete(role)"
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filtered.length" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">Exibindo {{ rangeStart }}-{{ rangeEnd }} de {{ filtered.length }} funções</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
      </div>
      <p v-else class="text-muted">Nenhuma função encontrada.</p>
    </template>
  </div>
</template>
