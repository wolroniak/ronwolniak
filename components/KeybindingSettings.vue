<template>
  <div class="w-full">
    <h3 class="text-xl font-normal mb-6 text-center text-white uppercase">Controls</h3>
    <ul class="space-y-3">
      <li 
        v-for="action in orderedActions" 
        :key="action" 
        class="flex justify-between items-center p-3 rounded-sm border border-gray-700"
      >
        <span class="font-normal text-gray-200 w-1/3">{{ actionDisplayNames[action] }}</span>
        <span 
          class="font-mono bg-gray-800 border border-gray-600 px-4 py-1.5 rounded-sm text-gray-100 min-w-[90px] text-center text-base tabular-nums"
        >
          {{ getDisplayKey(currentKeyBindings[action]) }}
        </span>
        <button 
          @click="() => startRebind(action)"
          :disabled="isListeningForKey"
          class="px-5 py-1 bg-transparent hover:bg-white hover:text-black text-white rounded-sm border border-white transition-colors text-sm font-normal disabled:opacity-50 disabled:border-gray-600 disabled:text-gray-500 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 focus:ring-offset-2 focus:ring-offset-black"
        >
          {{ actionToRebind === action ? 'Press key...' : 'Change' }}
        </button>
      </li>
    </ul>
    <div v-if="isListeningForKey" class="mt-4 text-center">
      <p class="text-gray-400 text-sm">Press any key for <span class="font-semibold text-white">{{ actionDisplayNames[actionToRebind!] }}</span>. <span class="font-mono bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-sm">ESC</span> to cancel.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useKeybindings } from '~/composables/useKeybindings';

const {
  currentKeyBindings,
  actionDisplayNames,
  orderedActions,
  getDisplayKey,
  startRebind,
  actionToRebind,
  isListeningForKey,
} = useKeybindings();

// Die globale handleKeyDown-Logik für das Rebinding selbst 
// (inkl. setBinding und cancelRebind bei ESC) 
// wird weiterhin in AnimationCanvas.vue oder einer globalen Event-Listener-Logik bleiben,
// da sie systemweit auf Tastatureingaben reagieren muss, nicht nur innerhalb dieser Komponente.
</script>

<style scoped>
/* Stile für die KeybindingSettings-Komponente könnten hier spezifisch definiert werden, falls nötig */
.tabular-nums {
  font-feature-settings: "tnum";
}
</style>
