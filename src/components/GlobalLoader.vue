<script setup>

const props = defineProps(['isLoading']);

</script>

<template>
  <!-- Loader -->
  <div v-if="isLoading" class="flex justify-center items-center py-6">
    <div class="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
    <span class="ml-3 text-blue-600 dark:text-blue-300">Parsing emails...</span>
  </div>
</template>