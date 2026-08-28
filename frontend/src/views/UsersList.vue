<script setup>
import { onMounted, ref } from 'vue'
import http from '../api/http'
import Pagination from '../components/Pagination.vue'
import { usePagedList } from '../composables/usePagedList'
import { useAuth } from '../composables/useAuth'

const { can } = useAuth()

const users = ref([])
const loading = ref(true)
const error = ref('')

const { search, page, totalPages, filtered, paginated, rangeStart, rangeEnd } = usePagedList(users, {
  searchFields: ['name', 'email'],
  pageSize: 10,
})

function initialOf(name) {
  return (name ?? '?').trim().charAt(0).toUpperCase()
}

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
    <h1 class="h3 mb-3">Gerenciamento de Usuários</h1>

    <div class="d-flex justify-content-between align-items-center mb-3 gap-2">
      <router-link v-if="can('usuarios.criar')" :to="{ name: 'users-novo' }" class="btn btn-primary">
        <i class="bi bi-plus-lg me-1" aria-hidden="true"></i>Novo Usuário
      </router-link>
      <span v-else></span>
      <div style="max-width: 260px; width: 100%;">
        <input v-model="search" type="search" class="form-control" placeholder="Buscar por nome ou e-mail">
      </div>
    </div>

    <p v-if="!can('usuarios.listar') && !can('funcoes.editar')" class="text-muted mb-0">
      Você não tem permissão para listar os usuários cadastrados.
    </p>
    <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
    <p v-else-if="loading">Carregando…</p>
    <template v-else>
      <div class="table-responsive bg-white rounded shadow-sm">
        <table class="table align-middle mb-0">
          <thead>
            <tr>
              <th style="width: 1%"></th>
              <th>Nome</th>
              <th>E-mail</th>
              <th>Funções</th>
              <th v-if="can('usuarios.editar') || can('usuarios.excluir') || can('funcoes.editar')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in paginated" :key="u.id">
              <td><span class="avatar-circle">{{ initialOf(u.name) }}</span></td>
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td>{{ (u.roles ?? []).map((role) => role.name).join(', ') }}</td>
              <td v-if="can('usuarios.editar') || can('usuarios.excluir') || can('funcoes.editar')">
                <router-link
                  v-if="can('usuarios.editar')"
                  :to="{ name: 'users-editar', params: { id: u.id } }"
                  class="icon-btn icon-btn-secondary"
                  title="Editar"
                  aria-label="Editar"
                >
                  <i class="bi bi-pencil" aria-hidden="true"></i>
                </router-link>
                <router-link
                  v-if="!can('usuarios.editar') && can('funcoes.editar')"
                  :to="{ name: 'users-editar', params: { id: u.id } }"
                  class="icon-btn icon-btn-secondary"
                  title="Funções"
                  aria-label="Funções"
                >
                  <i class="bi bi-shield-lock" aria-hidden="true"></i>
                </router-link>
                <button
                  v-if="can('usuarios.excluir')"
                  type="button"
                  class="icon-btn icon-btn-danger"
                  title="Excluir"
                  aria-label="Excluir"
                  @click="handleDelete(u)"
                >
                  <i class="bi bi-trash" aria-hidden="true"></i>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div v-if="filtered.length" class="d-flex justify-content-between align-items-center mt-3">
        <span class="text-muted small">Exibindo {{ rangeStart }}-{{ rangeEnd }} de {{ filtered.length }} usuários</span>
        <Pagination :page="page" :total-pages="totalPages" @update:page="page = $event" />
      </div>
      <p v-else class="text-muted">Nenhum usuário encontrado.</p>
    </template>
  </div>
</template>
