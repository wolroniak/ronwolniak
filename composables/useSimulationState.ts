import { ref, readonly } from 'vue';

export type SimulationStatus = 'startMenu' | 'running' | 'paused' | 'crashed';

// Reactive state for the simulation's current status
const simulationState = ref<SimulationStatus>('startMenu');
// Reactive state for the name of the object the spaceship crashed into
const crashedObjectName = ref<string | null>(null);

export function useSimulationState() {
  const setSimulationState = (newState: SimulationStatus) => {
    simulationState.value = newState;
  };

  const startGame = () => {
    simulationState.value = 'running';
  };

  const resumeGame = () => {
    if (simulationState.value === 'paused') {
      setSimulationState('running');
    }
  };

  const pauseGame = () => {
    if (simulationState.value === 'running') {
      setSimulationState('paused');
    }
  };

  const togglePause = () => {
    if (simulationState.value === 'running') {
      simulationState.value = 'paused';
    } else if (simulationState.value === 'paused') {
      simulationState.value = 'running';
    }
  };

  const handleCrash = (objectName?: string) => {
    simulationState.value = 'crashed';
    crashedObjectName.value = objectName || null;
    console.log(`Game crashed. Object: ${objectName}`);
  };

  const restartGame = () => {
    // This function will reset the simulation to the initial start menu state.
    // Further logic to reset spaceship position, etc., will be handled by components reacting to this state change.
    simulationState.value = 'startMenu';
    crashedObjectName.value = null;
  };

  return {
    simulationState: readonly(simulationState),
    crashedObjectName: readonly(crashedObjectName),
    setSimulationState, 
    startGame,
    resumeGame,
    pauseGame,
    togglePause,
    restartGame,
    handleCrash
  };
}
