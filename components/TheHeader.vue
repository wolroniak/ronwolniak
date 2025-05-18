<template>
  <header class="fixed top-0 left-0 right-0 z-50 p-4 flex justify-between items-center h-16 bg-transparent text-gray-100">
    <span class="font-space-grotesk text-lg">Ron Wolniak</span>
    <button 
      @click="handlePauseToggle"
      :disabled="isPauseButtonDisabled"
      class="px-4 py-2 rounded font-semibold transition-colors"
      :class="{
        'bg-yellow-500 hover:bg-yellow-600 text-gray-900': simulationState === 'running',
        'bg-green-500 hover:bg-green-600 text-gray-900': simulationState === 'paused',
        'bg-gray-400 text-gray-700 cursor-not-allowed': isPauseButtonDisabled
      }"
    >
      {{ pauseButtonText }}
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useSimulationState } from '~/composables/useSimulationState';

const { simulationState, togglePause } = useSimulationState();

const pauseButtonText = computed(() => {
  if (simulationState.value === 'running') return 'Pause';
  if (simulationState.value === 'paused') return 'Resume';
  return 'Pause'; // Default or for startMenu (though it will be disabled)
});

const isPauseButtonDisabled = computed(() => {
  return simulationState.value === 'startMenu';
});

const handlePauseToggle = () => {
  if (!isPauseButtonDisabled.value) {
    togglePause();
  }
};
</script>

<style scoped>
/* Scoped styles if needed, though Tailwind is preferred */
</style>
