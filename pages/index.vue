<template>
  <div class="relative w-full h-screen overflow-hidden">
    <TheHeader />
    <ClientOnly>
      <AnimationCanvas class="absolute top-0 left-0 w-full h-full z-0" />
    </ClientOnly>
    <!-- Content can be overlaid here if needed later -->
  </div>
</template>

<script setup lang="ts">
import AnimationCanvas from '~/components/AnimationCanvas.vue';
import TheHeader from '~/components/TheHeader.vue';
</script>

<style>
/* Global styles if necessary, e.g., for body or html */
body {
  margin: 0;
  overscroll-behavior: none; /* Optional: to prevent pull-to-refresh or overscroll bounce effects */
}
</style>
