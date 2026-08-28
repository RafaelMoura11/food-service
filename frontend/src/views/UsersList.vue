<script setup>
import { onMounted, ref } from 'vue'
import http from '../api/http'
import { useAuth } from '../composables/useAuth'

const { can } = useAuth()

const users = ref([])
const loading = ref(true)
const error = ref('')

async function loadUsers() {
  // Ver a lista também é necessário para quem só tem funcoes.editar, para
  // escolher a qual Usuário atribuir Funções.
  if (!can('usuarios.listar') && !can('funcoes.editar')) {
    loading.value = false
    return
  }

  loading.value = true

  try {
    const { data } = await http.get('/api/users')
    users.value = data
  } catch {
    error.value = 'Não foi possível carregar os usuários.'
  } finally {
    loading.value = false
  }
}

async function handleDelete(user) {
  if (!window.confirm(`Remover o usuário "${user.name}"?`)) {
    return
  }

  try {
    await http.delete(`/api/users/${user.id}`)
    await loadUsers()
  } catch {
    error.value = 'Não foi possível remover o usuário.'
  }
}

onMounted(loadUsers)
</script>

<template>
  <div class="content-wrapper p-4">
    <div class="card card-primary">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">Usuários</h3>
        <router-link
          v-if="can('usuarios.criar')"
          :to="{ name: 'users-novo' }"
          class="btn btn-primary btn-sm"
        >
          Novo Usuário
        </router-link>
      </div>

      <div class="card-body">
        <p v-if="!can('usuarios.listar') && !can('funcoes.editar')" class="text-muted mb-0">
          Você não tem permissão para listar os usuários cadastrados.
        </p>
        <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
        <p v-else-if="loading">Carregando…</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Funções</th>
              <th v-if="can('usuarios.editar') || can('usuarios.excluir') || can('funcoes.editar')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ (u.roles ?? []).map((role) => role.name).join(', ') }}</td>
              <td v-if="can('usuarios.editar') || can('usuarios.excluir') || can('funcoes.editar')">
                <router-link
                  v-if="can('usuarios.editar')"
                  :to="{ name: 'users-editar', params: { id: u.id } }"
                  class="btn btn-outline-secondary btn-sm me-2"
                >
                  Editar
                </router-link>
                <router-link
                  v-if="!can('usuarios.editar') && can('funcoes.editar')"
                  :to="{ name: 'users-editar', params: { id: u.id } }"
                  class="btn btn-outline-primary btn-sm me-2"
                >
                  Funções
                </router-link>
                <button
                  v-if="can('usuarios.excluir')"
                  type="button"
                  class="btn btn-outline-danger btn-sm"
                  @click="handleDelete(u)"
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
