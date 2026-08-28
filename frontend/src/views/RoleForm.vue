<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/http'

const props = defineProps({
  id: { type: String, default: null },
})

const router = useRouter()
const isEditing = computed(() => !!props.id)

const availablePermissions = ref([])
const loading = ref(isEditing.value)
const notFound = ref(false)
const loadError = ref('')

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
    loadError.value = 'Não foi possível carregar as permissões.'
  }
}

async function loadRole() {
  try {
    const { data } = await http.get('/api/roles')
    const existing = data.find((role) => String(role.id) === props.id)

    if (!existing) {
      notFound.value = true
      return
    }

    form.name = existing.name
    form.permissionIds = existing.permissions.map((permission) => permission.id)
  } catch {
    loadError.value = 'Não foi possível carregar a função.'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  formErrors.value = {}

  const payload = { name: form.name, permissions: form.permissionIds }

  try {
    if (isEditing.value) {
      await http.put(`/api/roles/${props.id}`, payload)
    } else {
      await http.post('/api/roles', payload)
    }
    router.push({ name: 'roles' })
  } catch (err) {
    formErrors.value = err.response?.data?.errors ?? {}
  } finally {
    submitting.value = false
  }
}

onMounted(async () => {
  await loadPermissions()

  if (isEditing.value) {
    await loadRole()
  }
})
</script>

<template>
  <div class="content-wrapper p-4">
    <div class="card card-primary">
      <div class="card-header">
        <h3 class="card-title">{{ isEditing ? 'Editar Função' : 'Nova Função' }}</h3>
      </div>

      <div class="card-body">
        <p v-if="loading">Carregando…</p>
        <p v-else-if="notFound" class="text-danger" role="alert">Função não encontrada.</p>
        <template v-else>
          <p v-if="loadError" class="text-danger" role="alert">{{ loadError }}</p>
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
            <router-link :to="{ name: 'roles' }" class="btn btn-outline-secondary ms-2">Cancelar</router-link>
          </form>
        </template>
      </div>
    </div>
  </div>
</template>
