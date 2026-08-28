<script setup>
import { useRoute } from 'vue-router'
import Sidebar from './components/Sidebar.vue'
import { useAuth } from './composables/useAuth'

const { user } = useAuth()
const route = useRoute()
</script>

<template>
  <div class="app-wrapper">
    <Sidebar v-if="user" />
    <main class="app-main">
      <!-- As ~25 rotas Cadastráveis reutilizam o mesmo componente
      (router/index.js); sem a key, o Vue Router mantém a instância viva ao
      navegar entre elas e onMounted() não dispara de novo com o novo módulo. -->
      <router-view :key="route.fullPath" />
    </main>
  </div>
</template>
