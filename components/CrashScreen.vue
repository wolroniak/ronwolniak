<template>
  <div class="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4 font-sans">
    <div class="p-8 rounded-md text-center max-w-lg w-full">
      <h1 class="text-5xl font-thin mb-4 tracking-wider text-white">YOU CRASHED</h1>
      <p v-if="crashedObjectName" class="mb-2 text-xl font-light text-gray-200">
        Your journey ended abruptly against <span class="font-semibold text-white">{{ crashedObjectName }}</span>.
      </p>
      <p v-else class="mb-2 text-xl font-light text-gray-200">
        Your spaceship has met an untimely end.
      </p>
      <p class="mb-8 text-base text-gray-400">
        Don't worry, even the best pilots have bad days.
      </p>
      <button 
        @click="restartGame"
        class="bg-transparent hover:bg-white hover:text-black text-white font-normal py-3 px-8 border border-white rounded-sm text-lg tracking-wide transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 w-full sm:w-auto"
      >
        RESTART
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useSimulationState } from '~/composables/useSimulationState';

const { restartGame, crashedObjectName } = useSimulationState();
</script>

<style scoped>
/* Add any specific styles if needed, though Tailwind covers most */
</style>
