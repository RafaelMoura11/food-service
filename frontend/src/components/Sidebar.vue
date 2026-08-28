<script setup>
import { computed, ref } from 'vue'
import { CADASTRAVEL_MODULES, permissionsFor } from '../config/cadastraveis'
import { useAuth } from '../composables/useAuth'

const { canAny } = useAuth()

const cadastraveisOpen = ref(false)

const visibleCadastraveis = computed(() =>
  CADASTRAVEL_MODULES.filter((module) => canAny(permissionsFor(module.slug))),
)
</script>

<template>
  <aside class="app-sidebar shadow">
    <div class="sidebar-brand">
      <router-link :to="{ name: 'dashboard' }" class="brand-link">
        <span class="brand-text fw-light">Food Service</span>
      </router-link>
    </div>

    <div class="sidebar-wrapper">
      <nav class="mt-2">
        <ul class="nav sidebar-menu flex-column" role="menu">
          <li class="nav-item">
            <router-link :to="{ name: 'dashboard' }" class="nav-link">
              <p>Dashboard</p>
            </router-link>
          </li>
          <li v-if="canAny(['usuarios.listar', 'usuarios.criar', 'usuarios.editar', 'usuarios.excluir'])" class="nav-item">
            <router-link :to="{ name: 'users' }" class="nav-link">
              <p>Usuários</p>
            </router-link>
          </li>
          <li v-if="canAny(['funcoes.listar', 'funcoes.criar', 'funcoes.editar', 'funcoes.excluir'])" class="nav-item">
            <router-link :to="{ name: 'roles' }" class="nav-link">
              <p>Funções</p>
            </router-link>
          </li>
          <li v-if="visibleCadastraveis.length" class="nav-item" :class="{ 'menu-open': cadastraveisOpen }">
            <a href="#" class="nav-link" @click.prevent="cadastraveisOpen = !cadastraveisOpen">
              <p>
                Cadastráveis
                <span class="nav-arrow">{{ cadastraveisOpen ? '▾' : '▸' }}</span>
              </p>
            </a>
            <ul v-show="cadastraveisOpen" class="nav nav-treeview">
              <li v-for="module in visibleCadastraveis" :key="module.slug" class="nav-item">
                <router-link :to="{ name: `cadastraveis-${module.slug}` }" class="nav-link">
                  <p>{{ module.label }}</p>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </aside>
</template>
