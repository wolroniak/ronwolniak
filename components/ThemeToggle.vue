<template>
  <button
    @click="toggleTheme"
    class="p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200"
    :aria-label="`Switch to ${colorMode.preference === 'dark' ? 'light' : 'dark'} mode`"
  >
    <span v-if="colorMode.preference === 'dark'">
      ☀️ <span class="sr-only">Switch to light mode</span>
    </span>
    <span v-else>
      🌙 <span class="sr-only">Switch to dark mode</span>
    </span>
  </button>
</template>

<script setup lang="ts">
import { useColorMode } from '#imports'; // Nuxt 3 auto-imports or use '@nuxtjs/color-mode'

const colorMode = useColorMode();

const toggleTheme = () => {
  if (colorMode.preference === 'dark') {
    colorMode.preference = 'light';
  } else {
    colorMode.preference = 'dark';
  }
};
</script>

<style scoped>
/* Scoped styles if needed */
</style>
