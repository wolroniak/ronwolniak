<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>

    <!-- Start Menu Overlay -->
    <div 
      v-if="simulationState === 'startMenu'" 
      class="fixed inset-0 bg-black bg-opacity-90 flex flex-col justify-center items-center z-50 p-4 font-sans"
    >
      <div class="text-white p-8 rounded-md text-center max-w-xl w-full">
        <h1 class="text-5xl font-thin mb-4 tracking-wider uppercase text-white">Solar System Explorer</h1>
        <p class="mb-8 text-lg font-light text-gray-200">Navigate your ship through the cosmos.</p>
        <button 
          @click="startGame"
          class="bg-transparent hover:bg-white hover:text-black text-white font-normal py-3 px-8 border border-white rounded-sm text-lg tracking-wide transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-75 uppercase"
        >
          Start Simulation
        </button>

        <!-- Control Hints for Start Menu -->
        <div class="mt-10 pt-6 border-t border-gray-700 text-left text-sm max-w-md mx-auto w-full">
          <h4 class="text-lg font-normal mb-4 text-center text-white uppercase">Default Controls</h4>
          <ul class="space-y-1.5">
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.PITCH_UP }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.PITCH_UP) }}</span>
            </li>
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.PITCH_DOWN }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.PITCH_DOWN) }}</span>
            </li>
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.YAW_LEFT }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.YAW_LEFT) }}</span>
            </li>
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.YAW_RIGHT }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.YAW_RIGHT) }}</span>
            </li>
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.ROLL_LEFT }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.ROLL_LEFT) }}</span>
            </li>
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.ROLL_RIGHT }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.ROLL_RIGHT) }}</span>
            </li>
            <li class="flex justify-between items-center py-1">
              <span class="font-normal text-gray-200">{{ actionDisplayNames.BOOST }}</span>
              <span class="font-mono bg-gray-800 border border-gray-600 px-3 py-1 rounded-sm text-gray-100 min-w-[70px] text-center">{{ getDisplayKey(currentKeyBindings.BOOST) }}</span>
            </li>
          </ul>
          <p class="text-xs text-gray-400 mt-4 text-center">Controls can be customized in the Pause Menu (<span class="font-mono bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-sm">ENTER</span>/<span class="font-mono bg-gray-700 text-gray-300 px-1.5 py-0.5 rounded-sm">ESC</span>).</p>
        </div>
      </div>
    </div>

    <!-- Pause Menu Overlay -->
    <PauseMenu v-if="simulationState === 'paused'" />

    <!-- Crash Screen Overlay -->
    <CrashScreen v-if="simulationState === 'crashed'" />
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, reactive } from 'vue';
import PauseMenu from './PauseMenu.vue';
import CrashScreen from './CrashScreen.vue';
import { useMousePosition } from '~/composables/useMousePosition';
import { useSimulationState, type SimulationStatus } from '~/composables/useSimulationState';
import { useKeybindings, type KeyStates, type KeyBindings } from '~/composables/useKeybindings';
import { useSpaceship } from '~/composables/useSpaceship';
import { useThreeScene } from '~/composables/useThreeScene';
import type { CelestialBodyCollisionData } from '~/composables/useSolarSystem';
import { useSolarSystem } from '~/composables/useSolarSystem';
import * as THREE from 'three';

// Canvas reference for the renderer
const canvasRef = ref<HTMLCanvasElement | null>(null);

// Mouse position for user interactions (keeping for potential future use)
const { x: mouseX, y: mouseY } = useMousePosition();

// Simulation state management
const { simulationState, startGame, togglePause, handleCrash, restartGame } = useSimulationState();
// isRightMouseDown ref removed as orbital camera is being removed.

// Key bindings and controls
const { 
  currentKeyBindings, 
  actionToRebind, 
  isListeningForKey, 
  cancelRebind, 
  setBinding, 
  getDisplayKey, 
  actionDisplayNames 
} = useKeybindings();

// Local reactive key states, to be passed to useSpaceship
const keyStates = reactive<KeyStates>({});

// Three.js scene, camera, renderer, etc.
const {
  scene,
  camera,
  renderer,
  particles,
  animationFrameId,
  initScene,
  createStarfield,
  handleResize,
  setupResizeListener,
  renderScene,
  dispose: disposeScene,
  updateThemeColors
} = useThreeScene(canvasRef);

// Clock for animation timing
const clock = new THREE.Clock();

// References to solar system and spaceship components
let solarSystemObjects = ref([]);
let sunMesh = ref(null);
let sunLight = ref(null);
let celestialBodiesForCollision = ref<CelestialBodyCollisionData[]>([]); // Added for collision
let createDefaultSolarSystem = () => {};
let updatePlanetPositions = (delta: number) => {};
let disposeSolarSystem = () => {};

let spaceship = ref<THREE.Group | null>(null);
// keyStates is now defined above, locally in AnimationCanvas
let loadSpaceshipModel = async () => {};
let updateSpaceshipFromComposable = (delta: number) => {};
let resetSpaceship = () => {}; // For resetting the spaceship

onMounted(() => {
  if (!canvasRef.value) return;
  
  // Initialize Three.js scene, camera, renderer
  initScene();
  
  // Apply theme colors
  updateThemeColors(true); // true = dark theme
  
  // Create starfield particles
  createStarfield(20000, 4000); // 20,000 stars, 4000 units spread
  
  // Now that scene is initialized, we can initialize the solar system
  if (scene.value) {
    const solarSystem = useSolarSystem(scene.value);
    solarSystemObjects = solarSystem.solarSystemObjects;
    sunMesh = solarSystem.sunMesh;
    sunLight = solarSystem.sunLight;
    createDefaultSolarSystem = solarSystem.createDefaultSolarSystem;
    updatePlanetPositions = solarSystem.updatePlanetPositions;
    disposeSolarSystem = solarSystem.disposeSolarSystem;
    
    celestialBodiesForCollision = solarSystem.celestialBodiesForCollision; // Get collision data
    
    // Create solar system (sun and planets)
    createDefaultSolarSystem();

    // Initialize spaceship (ensure camera and scene are ready)
    if (scene.value && camera.value) {
      const spaceshipControls = useSpaceship(
        scene.value, 
        camera.value, 
        keyStates, // Pass local keyStates
        celestialBodiesForCollision, // Pass collision data
        handleCrash // Pass crash handler
      );
      spaceship = spaceshipControls.spaceship;
      loadSpaceshipModel = spaceshipControls.loadSpaceshipModel;
      updateSpaceshipFromComposable = spaceshipControls.updateSpaceship;
      resetSpaceship = spaceshipControls.resetSpaceship; // Get reset function
      
      // Load the spaceship model
      loadSpaceshipModel();
    }
  }
  
  // Set up resize handling
  const removeResizeListener = setupResizeListener();
  
  // Animation loop
  const animate = () => {
    if (!renderer.value || !scene.value || !camera.value) return;
    animationFrameId.value = requestAnimationFrame(animate);
    
    if (simulationState.value === 'startMenu') {
      // Just render the current scene to show the overlay
      renderScene();
      return;
    }
    
    if (simulationState.value === 'paused') {
      // Render the current scene to show the pause menu overlay
      renderScene();
      return;
    }
    
    // --- Game Logic (only runs if simulationState.value === 'running') ---
    const delta = clock.getDelta(); // Use THREE.Clock for accurate delta time
    
    // Update planet and spaceship positions
    if (typeof updatePlanetPositions === 'function') {
      updatePlanetPositions(delta);
    }
    
    if (typeof updateSpaceshipFromComposable === 'function') {
      // mouseX, mouseY, and isRightMouseDown are no longer passed as orbital camera is removed.
      updateSpaceshipFromComposable(delta);
    }
    
    // Camera logic is now fully handled within useSpaceship.ts
    
    // Render the updated scene
    renderScene();
  };
  
  // Start the animation loop
  animate();

  // Watch for simulation state changes to reset spaceship if needed
  watch(simulationState, (newState, oldState) => {
    console.log(`Simulation state changed from ${oldState} to ${newState}`);
    if (newState === 'startMenu' && (oldState === 'running' || oldState === 'paused' || oldState === 'crashed')) {
      if (spaceship.value && typeof resetSpaceship === 'function') {
        console.log('Attempting to reset spaceship due to state change to startMenu...');
        resetSpaceship();
      }
    }
  });

  // Keyboard event listeners for spaceship controls
  const handleKeyDown = (event: KeyboardEvent) => {
    const pressedKey = event.key.toLowerCase();

    // Handle key rebinding if active
  if (isListeningForKey.value && actionToRebind.value) {
      event.preventDefault(); // Prevent default browser action for the key
      event.stopPropagation(); // Stop event from bubbling further
      // setBinding now handles validation for reserved keys like 'enter' or 'escape'
      setBinding(actionToRebind.value, pressedKey);
      return;
    }

    // Handle pause toggle (Enter or Escape)
    if (pressedKey === 'enter' && !isListeningForKey.value) { // Ensure not to toggle pause if waiting for 'enter' as a binding
      togglePause();
      event.preventDefault(); // Prevent default for enter if it's not for rebind
      return;
    }
    if (pressedKey === 'escape') {
      if (isListeningForKey.value) {
        cancelRebind(); // If listening, Escape cancels rebind mode
      } else {
        togglePause(); // Otherwise, toggle pause
      }
      event.preventDefault(); // Prevent default for escape
      return;
    }

    // Normal game input processing only if simulation is running
    if (simulationState.value !== 'running') return;

    // Check against configurable keybindings
    for (const action in currentKeyBindings.value) {
      if (currentKeyBindings.value[action as keyof KeyBindings].toLowerCase() === pressedKey) {
        // Update the local keyStates object
        keyStates[action as keyof KeyBindings] = true;
        break; // Action found and set
      }
    }
  };

  const handleKeyUp = (event: KeyboardEvent) => {
    const releasedKey = event.key.toLowerCase();

    if (releasedKey === 'enter' || releasedKey === 'escape') return; // These are toggles, not held keys for actions
    // Allow key up to register even if paused to clear states, but not if in startMenu
    if (simulationState.value === 'startMenu') return;

    // Check against configurable keybindings
    for (const action in currentKeyBindings.value) {
      if (currentKeyBindings.value[action as keyof KeyBindings].toLowerCase() === releasedKey) {
        // Update the local keyStates object
        keyStates[action as keyof KeyBindings] = false;
        break; // Action found and cleared
      }
    }
  };
  // handleMouseDown and handleMouseUp functions removed as orbital camera is being removed.
  window.addEventListener('keydown', handleKeyDown);
  window.addEventListener('keyup', handleKeyUp);
  // mousedown and mouseup event listeners removed.

  // Prevent context menu on right-click (keeping this for better UX)
  const contextMenuHandler = (event: MouseEvent) => event.preventDefault();
  canvasRef.value?.addEventListener('contextmenu', contextMenuHandler);

  // Clean up everything on unmount
  onUnmounted(() => {
  // Cleanup event listeners
    window.removeEventListener('keydown', handleKeyDown);
    window.removeEventListener('keyup', handleKeyUp);
  
  // Remove contextmenu event listener
  canvasRef.value?.removeEventListener('contextmenu', contextMenuHandler);
  
  // Dispose Three.js resources
  if (typeof disposeSolarSystem === 'function') {
    disposeSolarSystem();
  }
  disposeScene();
  });
}); // End of onMounted

// Note: Theme color management is now handled by the useThreeScene composable

</script>

<style scoped>
canvas {
  display: block;
  width: 100%;
  height: 100%;
  position: fixed; /* Ensure it covers the screen if that's the goal */
  top: 0;
  left: 0;
  z-index: -1; /* Place it behind other content if necessary */
}
</style>
