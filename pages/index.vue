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
import { useHead } from '#app'; // Or 'nuxt/app' depending on Nuxt version specifics for auto-import visibility
import AnimationCanvas from '~/components/AnimationCanvas.vue';
import TheHeader from '~/components/TheHeader.vue';

useHead({
  title: 'Ron Wolniak - Interactive 3D Solar System',
  meta: [
    { name: 'description', content: 'Explore an interactive 3D solar system simulation created by Ron Wolniak. A Nuxt.js and Three.js project showcasing web development and 3D graphics skills.' },
    { name: 'keywords', content: 'Ron Wolniak, Portfolio, Nuxt, Vue, Three.js, 3D Simulation, Solar System, Web Developer, JavaScript, TypeScript' },
    { name: 'author', content: 'Ron Wolniak' },
    // Open Graph / Facebook
    { property: 'og:type', content: 'website' },
    { property: 'og:title', content: 'Ron Wolniak - Interactive 3D Solar System' },
    { property: 'og:description', content: 'Explore an interactive 3D solar system simulation created by Ron Wolniak.' },
    // { property: 'og:image', content: 'URL_TO_YOUR_PREVIEW_IMAGE.jpg' }, // Add a preview image URL later
    { property: 'og:url', content: 'https://ronwolniak.com' }, // Replace with actual domain later
    // Twitter Card
    { name: 'twitter:card', content: 'summary_large_image' }, // Or 'summary' if no large image
    { name: 'twitter:title', content: 'Ron Wolniak - Interactive 3D Solar System' },
    { name: 'twitter:description', content: 'Explore an interactive 3D solar system simulation created by Ron Wolniak.' },
    // { name: 'twitter:image', content: 'URL_TO_YOUR_PREVIEW_IMAGE.jpg' }, // Add a preview image URL later
  ],
  htmlAttrs: {
    lang: 'en' // Assuming English, change if German is primary
  }
});
</script>

<style>
/* Global styles if necessary, e.g., for body or html */
body {
  margin: 0;
  overscroll-behavior: none; /* Optional: to prevent pull-to-refresh or overscroll bounce effects */
}
</style>
