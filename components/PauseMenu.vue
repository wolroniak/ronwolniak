<template>
  <div 
    v-if="simulationState === 'paused'" 
    class="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50 p-4 sm:p-6 overflow-y-auto font-sans"
  >
    <div class="w-full max-w-lg text-white p-6 sm:p-8 rounded-md">
      <h2 class="text-4xl sm:text-5xl font-thin mb-6 sm:mb-8 tracking-wider text-center text-white">PAUSED</h2>
      
      <KeybindingSettings />

      <div class="mt-8 pt-6 border-t border-gray-700 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0 sm:space-x-4">
        <button 
          @click="saveAndResume"
          class="w-full sm:w-auto px-6 py-2.5 bg-transparent hover:bg-white hover:text-black text-white font-normal border border-white rounded-sm tracking-wide transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
        >
          Save & Resume
        </button>
        <button 
          @click="resetBindings"
          class="w-full sm:w-auto px-6 py-2.5 bg-transparent hover:bg-white hover:text-black text-white font-normal border border-white rounded-sm tracking-wide transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75"
        >
          Reset Controls
        </button>
        <button 
          @click="resumeGame"
          class="w-full sm:w-auto px-6 py-2.5 bg-transparent hover:bg-gray-700 hover:text-white text-gray-300 font-normal border border-gray-500 rounded-sm tracking-wide transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
        >
          Resume (No Save)
        </button>
      </div>

      <div v-if="showSaveConfirmation" class="mt-5 p-3 bg-gray-800 bg-opacity-50 text-gray-200 rounded-md text-sm text-center border border-gray-700">
        Controls saved successfully!
      </div>

      <p class="text-xs text-gray-400 mt-8 text-center">
        Press <span class="font-mono bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-sm">ENTER</span> or <span class="font-mono bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-sm">ESC</span> to resume without saving changes.
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import KeybindingSettings from './KeybindingSettings.vue';
import { useKeybindings } from '~/composables/useKeybindings';
import { useSimulationState } from '~/composables/useSimulationState'; // Assuming this composable exists or will be created

const { simulationState, setSimulationState } = useSimulationState();
const { saveKeyBindings, resetToDefaultKeyBindings, isListeningForKey } = useKeybindings();

const showSaveConfirmation = ref(false);

const resumeGame = () => {
  if (isListeningForKey.value) return; // Don't resume if rebinding
  setSimulationState('running');
};

const saveAndResume = () => {
  if (isListeningForKey.value) return; // Don't save/resume if rebinding
  saveKeyBindings();
  showSaveConfirmation.value = true;
  setTimeout(() => {
    showSaveConfirmation.value = false;
    resumeGame();
  }, 1500);
};

const resetBindings = () => {
  if (isListeningForKey.value) return; // Don't reset if rebinding
  resetToDefaultKeyBindings();
  // Optionally: Immediately save defaults or require user to press 'Save & Resume'
  // For now, it just resets the state in the composable. User needs to save.
  // Could add a confirmation like "Defaults loaded. Press 'Save & Resume' to apply."
};

// Global key listener for resuming (ESC/ENTER) will be handled in AnimationCanvas or a global setup
// to avoid conflicts and ensure it works even if this component isn't fully focused.
</script>

<style scoped>
/* Scoped styles for PauseMenu */
</style>
