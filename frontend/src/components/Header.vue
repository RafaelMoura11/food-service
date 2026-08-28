<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth'

const { user, logout } = useAuth()
const router = useRouter()

const initial = computed(() => (user.value?.name ?? '?').trim().charAt(0).toUpperCase())

async function handleLogout() {
  await logout()
  await router.push({ name: 'login' })
}
</script>

<template>
  <nav class="app-header navbar navbar-expand bg-body">
    <div class="container-fluid justify-content-end">
      <ul class="navbar-nav align-items-center">
        <li class="nav-item">
          <span class="avatar-circle" aria-hidden="true">{{ initial }}</span>
        </li>
        <li class="nav-item">
          <button type="button" class="nav-link btn btn-link" @click="handleLogout">Sair</button>
        </li>
      </ul>
    </div>
  </nav>
</template>
