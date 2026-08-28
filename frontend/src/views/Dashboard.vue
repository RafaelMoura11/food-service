<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

async function handleLogout() {
  await logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <div class="content-wrapper p-4">
    <div class="card card-primary">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h3 class="card-title">Dashboard</h3>
        <button type="button" class="btn btn-outline-secondary btn-sm" @click="handleLogout">Sair</button>
      </div>
      <div class="card-body">
        <p class="mb-0">Bem-vindo{{ user ? `, ${user.name}` : '' }}.</p>
      </div>
    </div>
  </div>
</template>
