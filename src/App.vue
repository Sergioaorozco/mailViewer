<script setup>
import { FileUpload } from 'primevue';
</script>

<template>
  <div class="p-4 md:p-8">
    <header class="mb-6">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white">Local Mbox Email Viewer</h1>
      <p class="text-gray-600 mt-1 dark:text-neutral-200">
        Upload and view emails from `.mbox` files directly in your browser. All processing is done locally.
      </p>
    </header>

    <FileUpload auto customUpload></FileUpload>
    <img v-if="role" src="/src/assets/mailIcon.svg" alt="Image" class="shadow-md rounded-xl w-full sm:w-64"/>

    <!-- Upload -->
    <!-- Search bar -->
    <!-- Iframe -->
  </div>
</template>

<style scoped>


</style>