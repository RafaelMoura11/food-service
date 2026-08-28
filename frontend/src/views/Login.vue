<script setup>
import { reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { login } = useAuth()
const router = useRouter()

const form = reactive({ email: '', password: '' })
const error = ref('')
const submitting = ref(false)

async function handleSubmit() {
  error.value = ''
  submitting.value = true

  try {
    await login({ email: form.email, password: form.password })
    await router.push({ name: 'dashboard' })
  } catch {
    error.value = 'Credenciais inválidas.'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="login-page d-flex align-items-center justify-content-center" style="min-height: 100vh">
    <div class="card card-primary" style="width: 100%; max-width: 360px">
      <div class="card-header">
        <h3 class="card-title">Entrar</h3>
      </div>
      <div class="card-body">
        <form @submit.prevent="handleSubmit">
          <div class="mb-3">
            <label for="email" class="form-label">E-mail</label>
            <input
              id="email"
              v-model="form.email"
              type="email"
              class="form-control"
              autocomplete="username"
              required
            >
          </div>
          <div class="mb-3">
            <label for="password" class="form-label">Senha</label>
            <input
              id="password"
              v-model="form.password"
              type="password"
              class="form-control"
              autocomplete="current-password"
              required
            >
          </div>
          <p v-if="error" class="text-danger" role="alert">{{ error }}</p>
          <button type="submit" class="btn btn-primary" :disabled="submitting">Entrar</button>
        </form>
      </div>
    </div>
  </div>
</template>
