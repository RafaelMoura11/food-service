<script setup>
defineProps({
  page: { type: Number, required: true },
  totalPages: { type: Number, required: true },
})

const emit = defineEmits(['update:page'])
</script>

<template>
  <nav aria-label="Paginação">
    <ul class="pagination pagination-sm mb-0">
      <li class="page-item" :class="{ disabled: page === 1 }">
        <button type="button" class="page-link" :disabled="page === 1" @click="emit('update:page', page - 1)">
          Anterior
        </button>
      </li>
      <li v-for="p in totalPages" :key="p" class="page-item" :class="{ active: p === page }">
        <button type="button" class="page-link" @click="emit('update:page', p)">{{ p }}</button>
      </li>
      <li class="page-item" :class="{ disabled: page === totalPages }">
        <button
          type="button"
          class="page-link"
          :disabled="page === totalPages"
          @click="emit('update:page', page + 1)"
        >
          Próximo
        </button>
      </li>
    </ul>
  </nav>
</template>
