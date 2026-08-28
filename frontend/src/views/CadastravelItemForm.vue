<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import http from '../api/http'

const props = defineProps({
  module: { type: String, required: true },
  label: { type: String, required: true },
  id: { type: String, default: null },
})

const router = useRouter()
const isEditing = computed(() => !!props.id)

const form = ref({ name: '' })
const formErrors = ref({})
const submitting = ref(false)
const loading = ref(isEditing.value)
const notFound = ref(false)
const loadError = ref('')

async function loadItem() {
  try {
    const { data } = await http.get(`/api/cadastraveis/${props.module}`)
    const existing = data.find((item) => String(item.id) === props.id)

    if (!existing) {
      notFound.value = true
      return
    }

    form.value.name = existing.name
  } catch {
    loadError.value = `Não foi possível carregar o registro de ${props.label}.`
  } finally {
    loading.value = false
  }
}

async function handleSubmit() {
  submitting.value = true
  formErrors.value = {}

  const payload = { name: form.value.name }

  try {
    if (isEditing.value) {
      await http.put(`/api/cadastraveis/${props.module}/${props.id}`, payload)
    } else {
      await http.post(`/api/cadastraveis/${props.module}`, payload)
    }
    router.push({ name: `cadastraveis-${props.module}` })
  } catch (err) {
    formErrors.value = err.response?.data?.errors ?? {}
  } finally {
    submitting.value = false
  }
}

onMounted(() => {
  if (isEditing.value) {
    loadItem()
  }
})
</script>

<template>
  <div class="content-wrapper p-4">
    <h1 class="h3 mb-3">{{ isEditing ? `Editar registro de ${label}` : `Novo registro de ${label}` }}</h1>

    <div class="bg-white rounded shadow-sm p-4">
      <p v-if="loading">Carregando…</p>
      <p v-else-if="notFound" class="text-danger" role="alert">Registro não encontrado.</p>
      <template v-else>
        <p v-if="loadError" class="text-danger" role="alert">{{ loadError }}</p>
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="item-name" class="form-label">Nome</label>
            <input id="item-name" v-model="form.name" type="text" class="form-control" required>
            <p v-if="formErrors.name" class="text-danger">{{ formErrors.name[0] }}</p>
          </div>
          <button type="submit" class="btn btn-primary" :disabled="submitting">Salvar</button>
          <router-link :to="{ name: `cadastraveis-${module}` }" class="btn btn-outline-secondary ms-2">
            Cancelar
          </router-link>
        </form>
      </template>
    </div>
  </div>
</template>
