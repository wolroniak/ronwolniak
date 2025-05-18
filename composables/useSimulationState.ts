import { ref, readonly } from 'vue';

export type SimulationStatus = 'startMenu' | 'running' | 'paused';

const simulationState = ref<SimulationStatus>('startMenu');

export function useSimulationState() {
  const setSimulationState = (newState: SimulationStatus) => {
    simulationState.value = newState;
  };

  const startGame = () => {
    simulationState.value = 'running';
  };

  const togglePause = () => {
    if (simulationState.value === 'running') {
      simulationState.value = 'paused';
    } else if (simulationState.value === 'paused') {
      simulationState.value = 'running';
    }
    // If in startMenu, this function does nothing, which is fine.
  };

  return {
    simulationState: readonly(simulationState), // Expose as readonly to encourage using methods for changes
    setSimulationState, // Though exposing this is powerful, usually startGame/togglePause are preferred
    startGame,
    togglePause,
  };
}
