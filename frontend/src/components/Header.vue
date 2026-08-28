<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <nav class="app-header navbar navbar-expand bg-body border-bottom">
    <div class="container-fluid justify-content-end">
      <button type="button" class="btn btn-outline-secondary btn-sm" @click="handleLogout">Sair</button>
    </div>
  </nav>
</template>
