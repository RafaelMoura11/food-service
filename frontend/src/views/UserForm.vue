<script setup>
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/http'
import { useAuth } from '../composables/useAuth'

const props = defineProps({
  id: { type: String, default: null },
})

const { can } = useAuth()
const router = useRouter()

const isEditing = computed(() => !!props.id)
// Em edição, ver os campos de dados exige usuarios.editar (quem só tem
// funcoes.editar vê só a seção de Funções). Em criação, chegar nessa tela já
// exigiu usuarios.criar via guarda de rota.
const showDataForm = computed(() => !isEditing.value || can('usuarios.editar'))
const showRoles = computed(() => can('funcoes.editar'))

const form = reactive({ name: '', email: '', password: '', password_confirmation: '' })
const formErrors = ref({})
const submitting = ref(false)

const availableRoles = ref([])
const selectedRoleIds = ref([])
const rolesError = ref('')
const rolesSubmitting = ref(false)

const loading = ref(isEditing.value)
const notFound = ref(false)
const loadError = ref('')

async function loadRoles() {
  try {
    const { data } = await http.get('/api/roles/options')
    availableRoles.value = data
  } catch {
    rolesError.value = 'Não foi possível carregar as funções.'
  }
}

async function loadUser() {
  try {
    const { data } = await http.get('/api/users')
    const existing = data.find((user) => String(user.id) === props.id)

    if (!existing) {
      notFound.value = true
      return
    }

    form.name = existing.name
    form.email = existing.email
    selectedRoleIds.value = (existing.roles ?? []).map((role) => role.id)
  } catch {
    loadError.value = 'Não foi possível carregar o usuário.'
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  formErrors.value = {}

  const payload = { name: form.name, email: form.email }
  if (form.password) {
    payload.password = form.password
    payload.password_confirmation = form.password_confirmation
  }
  if (!isEditing.value && showRoles.value) {
    payload.roles = selectedRoleIds.value
  }

  try {
    if (isEditing.value) {
      await http.put(`/api/users/${props.id}`, payload)
    } else {
      await http.post('/api/users', payload)
    }
    router.push({ name: 'users' })
  } catch (err) {
    formErrors.value = err.response?.data?.errors ?? {}
  } finally {
    submitting.value = false
  }
}

async function handleRolesSubmit() {
  rolesSubmitting.value = true
  rolesError.value = ''

  try {
    await http.put(`/api/users/${props.id}/roles`, { roles: selectedRoleIds.value })
    router.push({ name: 'users' })
  } catch {
    rolesError.value = 'Não foi possível atualizar as funções do usuário.'
  } finally {
    rolesSubmitting.value = false
  }
}

onMounted(async () => {
  if (isEditing.value) {
    await loadUser()
  }
  if (showRoles.value) {
    await loadRoles()
  }
})
</script>

<template>
  <div class="content-wrapper p-4">
    <h1 class="h3 mb-3">{{ isEditing ? 'Editar Usuário' : 'Novo Usuário' }}</h1>

    <div class="bg-white rounded shadow-sm p-4">
      <p v-if="loading">Carregando…</p>
      <p v-else-if="notFound" class="text-danger" role="alert">Usuário não encontrado.</p>
      <template v-else>
        <p v-if="loadError" class="text-danger" role="alert">{{ loadError }}</p>

        <form v-if="showDataForm" @submit.prevent="handleSubmit">
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
              {{ isEditing ? 'Nova senha (opcional)' : 'Senha' }}
            </label>
            <input
              id="user-password"
              v-model="form.password"
              type="password"
              class="form-control"
              :required="!isEditing"
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
              :required="!isEditing || !!form.password"
            >
          </div>

          <div v-if="!isEditing && showRoles" class="mb-3">
            <label class="form-label d-block">Funções</label>
            <div v-for="role in availableRoles" :key="role.id" class="form-check">
              <input
                :id="`user-role-${role.id}`"
                v-model="selectedRoleIds"
                type="checkbox"
                class="form-check-input"
                :value="role.id"
              >
              <label :for="`user-role-${role.id}`" class="form-check-label">{{ role.name }}</label>
            </div>
          </div>

          <button type="submit" class="btn btn-primary" :disabled="submitting">Salvar</button>
          <router-link :to="{ name: 'users' }" class="btn btn-outline-secondary ms-2">Cancelar</router-link>
        </form>

        <div v-if="isEditing && showRoles" class="mt-4">
          <h5>Funções</h5>
          <p v-if="rolesError" class="text-danger" role="alert">{{ rolesError }}</p>
          <form @submit.prevent="handleRolesSubmit">
            <div v-for="role in availableRoles" :key="role.id" class="form-check">
              <input
                :id="`user-role-${role.id}`"
                v-model="selectedRoleIds"
                type="checkbox"
                class="form-check-input"
                :value="role.id"
              >
              <label :for="`user-role-${role.id}`" class="form-check-label">{{ role.name }}</label>
            </div>
            <button type="submit" class="btn btn-primary btn-sm mt-2" :disabled="rolesSubmitting">
              Salvar Funções
            </button>
            <router-link :to="{ name: 'users' }" class="btn btn-outline-secondary btn-sm mt-2 ms-2">
              Cancelar
            </router-link>
          </form>
        </div>
      </template>
    </div>
  </div>
</template>
