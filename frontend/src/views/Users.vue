<script setup>
import { onMounted, reactive, ref } from 'vue'
import http from '../api/http'
import { useAuth } from '../composables/useAuth'

const { can } = useAuth()

const users = ref([])
const loading = ref(true)
const error = ref('')

const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const formErrors = ref({})
const submitting = ref(false)

async function loadUsers() {
  if (!can('usuarios.listar')) {
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

function resetForm() {
  form.name = ''
  form.email = ''
  form.password = ''
  form.password_confirmation = ''
  formErrors.value = {}
}

function openCreateForm() {
  editingId.value = null
  resetForm()
  showForm.value = true
}

function openEditForm(user) {
  editingId.value = user.id
  resetForm()
  form.name = user.name
  form.email = user.email
  showForm.value = true
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  resetForm()
}

async function handleSubmit() {
  submitting.value = true
  formErrors.value = {}

  const payload = { name: form.name, email: form.email }
  if (form.password) {
    payload.password = form.password
    payload.password_confirmation = form.password_confirmation
  }

  try {
    if (editingId.value) {
      await http.put(`/api/users/${editingId.value}`, payload)
    } else {
      await http.post('/api/users', payload)
    }
    closeForm()
    await loadUsers()
  } catch (err) {
    formErrors.value = err.response?.data?.errors ?? {}
  } finally {
    submitting.value = false
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
        <button
          v-if="can('usuarios.criar')"
          type="button"
          class="btn btn-primary btn-sm"
          @click="openCreateForm"
        >
          Novo Usuário
        </button>
      </div>

      <div v-if="showForm" class="card-body border-bottom">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="user-name" class="form-label">Nome</label>
            <input id="user-name" v-model="form.name" type="text" class="form-control" required>
            <p v-if="formErrors.name" class="text-danger">{{ formErrors.name[0] }}</p>
          </div>
          <div class="mb-3">
            <label for="user-email" class="form-label">E-mail</label>
            <input id="user-email" v-model="form.email" type="email" class="form-control" required>
            <p v-if="formErrors.email" class="text-danger">{{ formErrors.email[0] }}</p>
          </div>
          <div class="mb-3">
            <label for="user-password" class="form-label">
              {{ editingId ? 'Nova senha (opcional)' : 'Senha' }}
            </label>
            <input
              id="user-password"
              v-model="form.password"
              type="password"
              class="form-control"
              :required="!editingId"
            >
            <p v-if="formErrors.password" class="text-danger">{{ formErrors.password[0] }}</p>
          </div>
          <div class="mb-3">
            <label for="user-password-confirmation" class="form-label">Confirmar senha</label>
            <input
              id="user-password-confirmation"
              v-model="form.password_confirmation"
              type="password"
              class="form-control"
              :required="!editingId || !!form.password"
            >
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">Salvar</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="closeForm">Cancelar</button>
        </form>
      </div>

      <div class="card-body">
        <p v-if="!can('usuarios.listar')" class="text-muted mb-0">
          Você não tem permissão para listar os usuários cadastrados.
        </p>
        <p v-else-if="error" class="text-danger" role="alert">{{ error }}</p>
        <p v-else-if="loading">Carregando…</p>
        <table v-else class="table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>E-mail</th>
              <th v-if="can('usuarios.editar') || can('usuarios.excluir')">Ações</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.name }}</td>
              <td>{{ u.email }}</td>
              <td v-if="can('usuarios.editar') || can('usuarios.excluir')">
                <button
                  v-if="can('usuarios.editar')"
                  type="button"
                  class="btn btn-outline-secondary btn-sm me-2"
                  @click="openEditForm(u)"
                >
                  Editar
                </button>
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
