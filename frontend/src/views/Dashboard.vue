<script setup>
import { useAuth } from '../composables/useAuth'

const { user, canAny } = useAuth()
</script>

<template>
  <div class="content-wrapper p-4">
    <h1 class="h3 mb-3">Dashboard</h1>

    <div class="bg-white rounded shadow-sm p-4">
      <p class="mb-0">Bem-vindo{{ user ? `, ${user.name}` : '' }}.</p>
      <router-link
        v-if="canAny(['usuarios.listar', 'usuarios.criar', 'usuarios.editar', 'usuarios.excluir'])"
        :to="{ name: 'users' }"
        class="btn btn-link ps-0"
      >
        Usuários
      </router-link>
      <router-link
        v-if="canAny(['funcoes.listar', 'funcoes.criar', 'funcoes.editar', 'funcoes.excluir'])"
        :to="{ name: 'roles' }"
        class="btn btn-link ps-0"
      >
        Funções
      </router-link>
    </div>
  </div>
</template>
