<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/http'
import { comparePermissionsByAction, moduleLabel, PERMISSION_ACTIONS } from '../config/cadastraveis'

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

  for (const permissions of Object.values(groups)) {
    permissions.sort(comparePermissionsByAction)
  }

  return groups
})

const expandedModules = ref({})

function isExpanded(module) {
  return !!expandedModules.value[module]
}

function toggleModule(module) {
  expandedModules.value[module] = !isExpanded(module)
}

// Ao editar, começa expandido só quem já tem alguma Permissão marcada, pra não
// obrigar a abrir os ~27 módulos um a um pra ver o que a Função já tem.
function initExpandedModules() {
  const expanded = {}

  for (const [module, permissions] of Object.entries(permissionsByModule.value)) {
    expanded[module] = permissions.some((permission) => form.permissionIds.includes(permission.id))
  }

  expandedModules.value = expanded
}

function actionOf(permission) {
  return permission.name.split('.')[1]
}

function actionLabel(permission) {
  return PERMISSION_ACTIONS[actionOf(permission)]?.label ?? actionOf(permission)
}

function actionDescription(permission) {
  return PERMISSION_ACTIONS[actionOf(permission)]?.description ?? ''
}

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

  initExpandedModules()
})
</script>

<template>
  <div class="content-wrapper p-4">
    <h1 class="h3 mb-3">{{ isEditing ? 'Editar Função' : 'Nova Função' }}</h1>

    <div class="bg-white rounded shadow-sm p-4">
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
            <div v-for="(permissions, module) in permissionsByModule" :key="module" class="border rounded p-3 mb-3">
              <button
                type="button"
                class="btn btn-link p-0 text-body text-decoration-none d-flex align-items-center justify-content-between w-100"
                :aria-expanded="isExpanded(module)"
                @click="toggleModule(module)"
              >
                <strong>
                  {{ isExpanded(module) ? moduleLabel(module) : `Permissões de "${moduleLabel(module)}"` }}
                </strong>
                <i
                  class="bi"
                  :class="isExpanded(module) ? 'bi-chevron-down' : 'bi-chevron-right'"
                  aria-hidden="true"
                ></i>
              </button>
              <div v-show="isExpanded(module)" class="row g-3 mt-1">
                <div v-for="permission in permissions" :key="permission.id" class="col-12 col-md-6">
                  <div class="form-check">
                    <input
                      :id="`permission-${permission.id}`"
                      v-model="form.permissionIds"
                      type="checkbox"
                      class="form-check-input"
                      :value="permission.id"
                    >
                    <label :for="`permission-${permission.id}`" class="form-check-label">
                      {{ actionLabel(permission) }}
                    </label>
                    <p class="text-muted small mb-0">{{ actionDescription(permission) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">Salvar</button>
          <router-link :to="{ name: 'roles' }" class="btn btn-outline-secondary ms-2">Cancelar</router-link>
        </form>
      </template>
    </div>
  </div>
</template>
