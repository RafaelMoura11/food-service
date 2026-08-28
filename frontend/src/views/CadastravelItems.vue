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

const showForm = ref(false)
const editingId = ref(null)
const form = ref({ name: '' })
const formErrors = ref({})
const submitting = ref(false)

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

function resetForm() {
  form.value.name = ''
  formErrors.value = {}
}

function openCreateForm() {
  editingId.value = null
  resetForm()
  showForm.value = true
}

function openEditForm(item) {
  editingId.value = item.id
  resetForm()
  form.value.name = item.name
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

  const payload = { name: form.value.name }

  try {
    if (editingId.value) {
      await http.put(`/api/cadastraveis/${props.module}/${editingId.value}`, payload)
    } else {
      await http.post(`/api/cadastraveis/${props.module}`, payload)
    }
    closeForm()
    await loadItems()
  } catch (err) {
    formErrors.value = err.response?.data?.errors ?? {}
  } finally {
    submitting.value = false
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
        <button
          v-if="canModule('criar')"
          type="button"
          class="btn btn-primary btn-sm"
          @click="openCreateForm"
        >
          Novo registro
        </button>
      </div>

      <div v-if="showForm" class="card-body border-bottom">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="item-name" class="form-label">Nome</label>
            <input id="item-name" v-model="form.name" type="text" class="form-control" required>
            <p v-if="formErrors.name" class="text-danger">{{ formErrors.name[0] }}</p>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">Salvar</button>
          <button type="button" class="btn btn-outline-secondary ms-2" @click="closeForm">Cancelar</button>
        </form>
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
                <button
                  v-if="canModule('editar')"
                  type="button"
                  class="btn btn-outline-secondary btn-sm me-2"
                  @click="openEditForm(item)"
                >
                  Editar
                </button>
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
