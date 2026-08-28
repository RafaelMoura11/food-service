<script setup>
import { onMounted, ref } from 'vue'
import http from '../api/http'
import { useAuth } from '../composables/useAuth'

const { can } = useAuth()

const roles = ref([])
const loading = ref(true)
const error = ref('')

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
    <div class="card card-primary">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">Funções</h3>
        <router-link
          v-if="can('funcoes.criar')"
          :to="{ name: 'roles-novo' }"
          class="btn btn-primary btn-sm"
        >
          Nova Função
        </router-link>
      </div>

      <div class="card-body">
        <p v-if="!can('funcoes.listar')" class="text-muted mb-0">
          Você não tem permissão para listar as funções cadastradas.
        </p>
        <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
        <p v-else-if="loading">Carregando…</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>Permissões</th>
              <th v-if="can('funcoes.editar') || can('funcoes.excluir')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="role in roles" :key="role.id">
              <td>{{ role.name }}</td>
              <td>{{ role.permissions.map((permission) => permission.name).join(', ') }}</td>
              <td v-if="can('funcoes.editar') || can('funcoes.excluir')">
                <router-link
                  v-if="can('funcoes.editar')"
                  :to="{ name: 'roles-editar', params: { id: role.id } }"
                  class="btn btn-outline-secondary btn-sm me-2"
                >
                  Editar
                </router-link>
                <button
                  v-if="can('funcoes.excluir')"
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  @click="handleDelete(role)"
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
