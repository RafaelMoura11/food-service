<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import http from '../api/http'
import { useAuth } from '../composables/useAuth'

const { can } = useAuth()

const roles = ref([])
const availablePermissions = ref([])
const loading = ref(true)
const error = ref('')

const showForm = ref(false)
const editingId = ref(null)
const form = reactive({ name: '', permissionIds: [] })
const formErrors = ref({})
const submitting = ref(false)

const permissionsByModule = computed(() => {
  const groups = {}

  for (const permission of availablePermissions.value) {
    const [module] = permission.name.split('.')
    groups[module] ??= []
    groups[module].push(permission)
  }

  return groups
})

async function loadPermissions() {
  try {
    const { data } = await http.get('/api/permissions')
    availablePermissions.value = data
  } catch {
    error.value = 'Não foi possível carregar as permissões.'
  }
}

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

function resetForm() {
  form.name = ''
  form.permissionIds = []
  formErrors.value = {}
}

function openCreateForm() {
  editingId.value = null
  resetForm()
  showForm.value = true
  loadPermissions()
}

function openEditForm(role) {
  editingId.value = role.id
  resetForm()
  form.name = role.name
  form.permissionIds = role.permissions.map((permission) => permission.id)
  showForm.value = true
  loadPermissions()
}

function closeForm() {
  showForm.value = false
  editingId.value = null
  resetForm()
}

async function handleSubmit() {
  submitting.value = true
  formErrors.value = {}

  const payload = { name: form.name, permissions: form.permissionIds }

  try {
    if (editingId.value) {
      await http.put(`/api/roles/${editingId.value}`, payload)
    } else {
      await http.post('/api/roles', payload)
    }
    closeForm()
    await loadRoles()
  } catch (err) {
    formErrors.value = err.response?.data?.errors ?? {}
  } finally {
    submitting.value = false
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
        <button
          v-if="can('funcoes.criar')"
          type="button"
          class="btn btn-primary btn-sm"
          @click="openCreateForm"
        >
          Nova Função
        </button>
      </div>

      <div v-if="showForm" class="card-body border-bottom">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="role-name" class="form-label">Nome</label>
            <input id="role-name" v-model="form.name" type="text" class="form-control" required>
            <p v-if="formErrors.name" class="text-danger">{{ formErrors.name[0] }}</p>
          </div>
          <div class="mb-3">
            <label class="form-label d-block">Permissões</label>
            <div v-for="(permissions, module) in permissionsByModule" :key="module" class="mb-2">
              <strong class="d-block text-capitalize">{{ module }}</strong>
              <div v-for="permission in permissions" :key="permission.id" class="form-check form-check-inline">
                <input
                  :id="`permission-${permission.id}`"
                  v-model="form.permissionIds"
                  type="checkbox"
                  class="form-check-input"
                  :value="permission.id"
                >
                <label :for="`permission-${permission.id}`" class="form-check-label">{{ permission.name }}</label>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">Salvar</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="closeForm">Cancelar</button>
        </form>
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
                <button
                  v-if="can('funcoes.editar')"
                  type="button"
                  class="btn btn-outline-secondary btn-sm me-2"
                  @click="openEditForm(role)"
                >
                  Editar
                </button>
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
