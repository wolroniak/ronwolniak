<template>
  <div class="relative w-full h-full">
    <canvas ref="canvasRef" class="w-full h-full"></canvas>

    <!-- Start Menu Overlay -->
    <div 
      v-if="simulationState === 'startMenu'" 
      class="absolute inset-0 bg-black bg-opacity-85 flex flex-col justify-center items-center text-white z-50"
    >
      <h1 class="text-5xl font-bold mb-6">Solar System Explorer</h1>
      <p class="text-xl mb-8">Navigate your ship through the cosmos.</p>
      <button 
        @click="startGame"
        class="px-8 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-2xl font-semibold transition-colors"
      >
        Start Simulation
      </button>
    </div>

    <!-- Pause Menu Overlay -->
    <div 
      v-if="simulationState === 'paused'" 
      class="absolute inset-0 bg-black bg-opacity-75 flex flex-col justify-center items-center text-gray-100 z-50 p-4 overflow-y-auto"
    >
      <h2 class="text-4xl font-bold mb-6 tracking-wider">PAUSED</h2>
      
      <div class="mb-8 text-center">
        <p class="text-lg text-gray-400">Press ENTER or ESC to Resume</p>
      </div>

      <div class="w-full max-w-md bg-black bg-opacity-80 p-8 rounded-lg shadow-2xl border border-gray-700">
        <h3 class="text-2xl font-semibold mb-8 text-center text-gray-100">Control Settings</h3>
        
        <div v-if="actionToRebind" class="mb-6 p-4 bg-gray-800 rounded-md text-center border border-gray-600">
          Press a key for: <span class="font-semibold text-white">{{ actionDisplayNames[actionToRebind] }}</span>
          <button @click="cancelRebind" class="ml-3 text-sm text-gray-400 hover:text-white underline">(Cancel)</button>
        </div>

        <div class="space-y-3 mb-6">
          <div v-for="action in orderedActions" :key="action" class="flex justify-between items-center p-3 bg-gray-800 hover:bg-gray-700 transition-colors duration-150 rounded-md border border-gray-700">
            <span class="text-gray-300">{{ actionDisplayNames[action] }}:</span>
            <div class="flex items-center space-x-3">
              <span class="font-mono bg-black px-3 py-1 rounded-md text-gray-200 min-w-[70px] text-center border border-gray-600">
                {{ getDisplayKey(currentKeyBindings[action]) }}
              </span>
              <button 
                @click="startRebind(action)" 
                :disabled="!!actionToRebind" 
                class="px-4 py-1 border border-gray-500 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md text-sm disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
              >
                Change
              </button>
            </div>
          </div>
        </div>

        <div v-if="showSaveConfirmation" class="my-4 p-3 bg-gray-700 border border-gray-500 text-gray-200 text-sm rounded-md text-center transition-all duration-300">
          Settings Saved!
        </div>

        <div class="flex justify-between mt-8">
          <button 
            @click="applyAndSaveKeyBindings" 
            :disabled="!!actionToRebind"
            class="px-8 py-2 bg-gray-200 hover:bg-white text-black rounded-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150 shadow-md hover:shadow-lg"
          >
            Save
          </button>
          <button 
            @click="resetToDefaultBindings" 
            :disabled="!!actionToRebind"
            class="px-8 py-2 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white rounded-md font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors duration-150"
          >
            Default
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { useMousePosition } from '~/composables/useMousePosition';
import { useSimulationState } from '~/composables/useSimulationState';

// Props removed as theme is now fixed dark

const canvasRef = ref<HTMLCanvasElement | null>(null);

let renderer: THREE.WebGLRenderer | null = null;
let scene: THREE.Scene | null = null;
let camera: THREE.PerspectiveCamera | null = null;
let animationFrameId: number | null = null;
let particles: THREE.Points | null = null;
let sunLight: THREE.PointLight | null = null;
let sunMesh: THREE.Mesh | null = null;
let spaceshipMesh: THREE.Group | null = null;

interface PlanetRenderData {
  name: string;
  mesh: THREE.Mesh;
  orbitalRadius: number;
  orbitalSpeed: number;
  rotationSpeed: number;
  currentOrbitalAngle: number;
}
let solarSystemObjects = ref<PlanetRenderData[]>([]);

const { x: mouseX, y: mouseY } = useMousePosition();
let cameraTarget = new THREE.Vector3(); // For mouse look
let cameraPhi = Math.PI / 2; // polar angle for camera (around y-axis from positive z-axis)
let cameraTheta = Math.PI / 2; // azimuthal angle for camera (up/down from xz-plane)
let currentBankAngle = 0;     // Persists across frames for smooth banking
const defaultCameraOffset = new THREE.Vector3(0, 1.0, -2.5); // Camera closer and slightly lower

const { simulationState, startGame, togglePause, setSimulationState } = useSimulationState();
const isRightMouseDown = ref(false);

// --- Keybinding Configuration ---
interface KeyBindings {
  PITCH_UP: string;
  PITCH_DOWN: string;
  YAW_LEFT: string;
  YAW_RIGHT: string;
  ROLL_LEFT: string;
  ROLL_RIGHT: string;
  BOOST: string;
  // Add other actions here if needed
}

const DEFAULT_KEY_BINDINGS: KeyBindings = {
  PITCH_UP: 'w',
  PITCH_DOWN: 's',
  YAW_LEFT: 'q',
  YAW_RIGHT: 'e',
  ROLL_LEFT: 'a',
  ROLL_RIGHT: 'd',
  BOOST: ' ',
};

const KEYBINDINGS_STORAGE_KEY = 'solarSystemKeyBindings_v1';

const currentKeyBindings = ref<KeyBindings>({ ...DEFAULT_KEY_BINDINGS });

const loadKeyBindings = () => {
  const storedBindings = localStorage.getItem(KEYBINDINGS_STORAGE_KEY);
  if (storedBindings) {
    try {
      const parsedBindings = JSON.parse(storedBindings) as KeyBindings;
      // Merge with defaults to ensure all actions are covered, even if new ones were added to DEFAULT_KEY_BINDINGS
      currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS, ...parsedBindings };
    } catch (error) {
      console.error('Failed to parse key bindings from localStorage:', error);
      currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS }; // Fallback to defaults
    }
  } else {
    // No stored bindings, use defaults
    currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
  }
};

const saveKeyBindings = () => {
  try {
    localStorage.setItem(KEYBINDINGS_STORAGE_KEY, JSON.stringify(currentKeyBindings.value));
  } catch (error) {
    console.error('Failed to save key bindings to localStorage:', error);
  }
};
// --- End Keybinding Configuration ---

// --- UI Logic for Keybinding Menu ---
const actionDisplayNames: Record<keyof KeyBindings, string> = {
  PITCH_UP: 'Pitch Up',
  PITCH_DOWN: 'Pitch Down',
  YAW_LEFT: 'Yaw Left',
  YAW_RIGHT: 'Yaw Right',
  ROLL_LEFT: 'Roll Left',
  ROLL_RIGHT: 'Roll Right',
  BOOST: 'Boost',
};

const orderedActions = Object.keys(DEFAULT_KEY_BINDINGS) as Array<keyof KeyBindings>;
const actionToRebind = ref<keyof KeyBindings | null>(null);
const isListeningForKey = computed(() => actionToRebind.value !== null);
const showSaveConfirmation = ref(false);
let saveConfirmationTimeout: number | null = null;

const getDisplayKey = (key: string): string => {
  if (key === ' ') return 'SPACE';
  if (key.length === 1) return key.toUpperCase();
  return key; // For keys like 'arrowup', 'shift'
};

const startRebind = (action: keyof KeyBindings) => {
  actionToRebind.value = action;
  // Note: Actual key capture will happen in a modified handleKeyDown or a dedicated listener
};

const cancelRebind = () => {
  actionToRebind.value = null;
};

const setBinding = (action: keyof KeyBindings, newKey: string) => {
  // Optional: Check for conflicts or disallowed keys
  const lowerNewKey = newKey.toLowerCase();
  if (lowerNewKey === 'enter' || lowerNewKey === 'escape') {
    console.warn(`Cannot bind action to '${lowerNewKey}'. It's a reserved key.`);
    actionToRebind.value = null; // Cancel rebind if disallowed key is pressed
    return;
  }
  // Optional: Prevent binding a key already used by another action (or allow swapping)
  // For simplicity, we currently allow duplicates. User must manage.
  currentKeyBindings.value[action] = lowerNewKey;
  actionToRebind.value = null; // Finish rebind process
};

const applyAndSaveKeyBindings = () => {
  saveKeyBindings();
  console.log('Key bindings saved.');
  showSaveConfirmation.value = true;
  if (saveConfirmationTimeout) clearTimeout(saveConfirmationTimeout);
  saveConfirmationTimeout = window.setTimeout(() => { // Use window.setTimeout for clarity in browser environment
    showSaveConfirmation.value = false;
  }, 3000); // Display for 3 seconds
};

const resetToDefaultBindings = () => {
  currentKeyBindings.value = { ...DEFAULT_KEY_BINDINGS };
  saveKeyBindings(); // Also save defaults immediately
  console.log('Key bindings reset to default and saved.');
  showSaveConfirmation.value = true;
  if (saveConfirmationTimeout) clearTimeout(saveConfirmationTimeout);
  saveConfirmationTimeout = window.setTimeout(() => { // Use window.setTimeout
    showSaveConfirmation.value = false;
  }, 3000);
};
// --- End UI Logic for Keybinding Menu ---

// Defines which actions are currently active based on key presses
const keyStates = ref<Record<keyof KeyBindings | string, boolean>>({
  PITCH_UP: false,
  PITCH_DOWN: false,
  YAW_LEFT: false,
  YAW_RIGHT: false,
  ROLL_LEFT: false,
  ROLL_RIGHT: false,
  BOOST: false,
  // 'enter' and 'escape' are handled directly, not part of configurable actions affecting keyStates for movement
});

// startGame function is now imported from useSimulationState

// Particle System Parameters for Star Field
const PARTICLE_COUNT = 20000; // More stars
const PARTICLE_SPREAD = 4000;  // Spread them much further out, beyond PLAY_AREA_HALF_SIZE

onMounted(() => {
  if (canvasRef.value) {
    // Scene
    scene = new THREE.Scene();
    updateThemeColors(); // Set initial theme colors (now fixed)
    loadKeyBindings(); // Load keybindings from localStorage or use defaults

    // Camera
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 5000); // Increased far plane
    camera.position.set(0, 50, 350); // Pulled back initial camera position

    // Renderer
    renderer = new THREE.WebGLRenderer({ canvas: canvasRef.value, antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    // Append to a div or body if not using a canvas element directly passed to renderer
    // document.body.appendChild(renderer.domElement); // Or a specific container

    // Particles
    const particlePositions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * PARTICLE_SPREAD;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * PARTICLE_SPREAD;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * PARTICLE_SPREAD;
    }

    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particlesMaterial = new THREE.PointsMaterial({
      // Color will be set by updateThemeColors
      size: 0.01, // Smaller stars
      // sizeAttenuation: true, // Optional: makes particles smaller further away
    });

    particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Sun Light
    sunLight = new THREE.PointLight(0xffddaa, 15, 2000); // color, intensity (increased from 7), distance
    sunLight.position.set(0, 0, 0);
    scene.add(sunLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft white ambient light
    scene.add(ambientLight);

    // Single TextureLoader for all textures
    const textureLoader = new THREE.TextureLoader();

    // Sun Mesh (remains largely the same but with new size)
    const sunTexture = textureLoader.load('https://upload.wikimedia.org/wikipedia/commons/c/cb/Solarsystemscope_texture_2k_sun.jpg');
    const sunGeometry = new THREE.SphereGeometry(50, 64, 64); // Increased Sun Radius
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTexture,
      emissiveMap: sunTexture,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      color: 0xffffff
    });
    sunMesh = new THREE.Mesh(sunGeometry, sunMaterial);
    sunMesh.position.set(0, 0, 0);
    scene.add(sunMesh);

    // Planets Data
    const planetsData = [
      { name: 'Mercury', radius: 2, orbitalRadius: 60, orbitalSpeed: 0.0008, rotationSpeed: 0.005, color: 0x888888, textureUrl: '/textures/mercury_texture.jpg' },
      { name: 'Venus', radius: 3.5, orbitalRadius: 110, orbitalSpeed: 0.0005, rotationSpeed: 0.002, color: 0xFFFFEE, textureUrl: '/textures/venus_texture.jpg' },
      { name: 'Earth', radius: 4, orbitalRadius: 150, orbitalSpeed: 0.0004, rotationSpeed: 0.003, textureUrl: '/textures/earth_texture.jpg' }, 
      { name: 'Mars', radius: 2.5, orbitalRadius: 225, orbitalSpeed: 0.0003, rotationSpeed: 0.0025, textureUrl: '/textures/mars_texture.jpg', color: 0xff4500 },
      { name: 'Jupiter', radius: 10, orbitalRadius: 400, orbitalSpeed: 0.0001, rotationSpeed: 0.0003, textureUrl: '/textures/jupiter_texture.jpg', color: 0xffA500 },
    ];

    planetsData.forEach(planetDef => {
      const geometry = new THREE.SphereGeometry(planetDef.radius, 32, 32);
      let material;
      if (planetDef.textureUrl) {
        const texture = textureLoader.load(planetDef.textureUrl);
        material = new THREE.MeshStandardMaterial({ map: texture, roughness: 0.3, metalness: 0.1 }); // Further reduced roughness
      } else {
        material = new THREE.MeshStandardMaterial({ color: planetDef.color, roughness: 0.3, metalness: 0.1 }); // Further reduced roughness
      }
      const mesh = new THREE.Mesh(geometry, material);
      // Initial position based on orbital radius (simple X offset for now, angle will apply in animate)
      mesh.position.set(planetDef.orbitalRadius, 0, 0);
      scene.add(mesh);
      solarSystemObjects.value.push({
        name: planetDef.name,
        mesh: mesh,
        orbitalRadius: planetDef.orbitalRadius,
        orbitalSpeed: planetDef.orbitalSpeed,
        rotationSpeed: planetDef.rotationSpeed,
        currentOrbitalAngle: Math.random() * Math.PI * 2 // Start at random orbital positions
      });
    });

    // Spaceship Model
    // Spaceship Controls Parameters (moved here for correct scope for animate function)
    const shipRotateSpeed = 1.5; // Radians per second
    const baseMoveSpeed = 7.0; // Base units per second for W/S, adjusted by delta (manual movement)
    const autoForwardSpeedBase = 3.0; // Base speed for automatic forward movement
    const boostMultiplier = 3.0; // Factor by which speed increases with boost
    const bankInterpolationFactor = 0.07; // Smoothing factor for banking
    const maxBankAngle = Math.PI / 6; // Max bank angle (30 degrees)
    // Mouse look sensitivity
    const mouseLookSensitivity = 0.002;
    // Clock for delta time (should be defined before animate)
    const clock = new THREE.Clock();

    const gltfLoader = new GLTFLoader();
    gltfLoader.load(
      '/models/spaceship-executioner/glTF/Executioner.gltf',
      (gltf) => {
        spaceshipMesh = gltf.scene;
        spaceshipMesh.scale.set(0.05, 0.05, 0.05); // Starship made smaller
        spaceshipMesh.position.set(0, 0, 200); // Start further away from the sun 
        spaceshipMesh.rotation.y = Math.PI; // Rotate 180 degrees to face the sun (origin)

        // Adjust material properties for better visibility and lighting response
        spaceshipMesh.traverse((child) => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material) {
              // Ensure the material is MeshStandardMaterial or similar that reacts to light
              // If it's an array of materials, iterate through them
              const materials = Array.isArray(child.material) ? child.material : [child.material];
              materials.forEach(material => {
                if (material.isMeshStandardMaterial || material.isMeshPhongMaterial) {
                  // material.metalness = 0.8; // Example: Make it more metallic
                  // material.roughness = 0.4; // Example: Make it a bit shiny
                  // material.emissive = new THREE.Color(0x111111); // Slight self-illumination
                  // material.emissiveIntensity = 0.5; 
                } else {
                  // If not a standard material, consider replacing or adapting
                  // For now, we assume the GLTF provides suitable materials
                }
              });
            }
          }
        });
        
        if (scene) scene.add(spaceshipMesh);
        console.log('Spaceship loaded successfully');

        // Initial camera setup for third-person view will be handled in animate loop
      },
      undefined, // onProgress callback (optional)
      (error) => {
        console.error('An error happened while loading the spaceship:', error);
      }
    );

    // Animation loop
    const animate = () => {
      if (!renderer || !scene || !camera) return;
      animationFrameId = requestAnimationFrame(animate);

      if (simulationState.value === 'startMenu') {
        // For start menu, we might want a static scene or just stars slowly moving
        // For now, just render the current scene and return to show the overlay
        if (renderer && scene && camera) renderer.render(scene, camera);
        return;
      }

      if (simulationState.value === 'paused') {
        // For pause menu, render the current scene so the overlay is on top
        if (renderer && scene && camera) renderer.render(scene, camera);
        return; // Skip all game logic if paused
      }
      
      // --- Game Logic (only runs if simulationState.value === 'running') ---
      const delta = clock.getDelta(); // Use THREE.Clock for accurate delta time

      if (!spaceshipMesh) return; // Ensure spaceshipMesh is loaded
      
      // Update camera target based on mouse position if right mouse button is down
      const PLAY_AREA_HALF_SIZE = 1000; // Significantly increased play area

      if (spaceshipMesh) {
        // Determine current forward speed (with boost)
        let currentForwardSpeed = autoForwardSpeedBase;
        if (keyStates.value.BOOST) { // Use BOOST action from keyStates
          currentForwardSpeed *= boostMultiplier; // Use the globally defined boostMultiplier
        }
        // Automatic forward movement (model's +Z is now considered forward)
        spaceshipMesh.translateZ(currentForwardSpeed * delta);

        // Local Rotation Logic
        // Rotations are now applied directly to the spaceship's local axes.

        // Apply ship movement and rotation
        const actualRotateSpeed = shipRotateSpeed * delta;
        let targetBankAngle = 0;

        // Pitch
        if (keyStates.value.PITCH_UP) spaceshipMesh.rotateX(actualRotateSpeed); // Nose Up
        if (keyStates.value.PITCH_DOWN) spaceshipMesh.rotateX(-actualRotateSpeed); // Nose Down

        // Yaw
        if (keyStates.value.YAW_LEFT) {
          spaceshipMesh.rotateY(actualRotateSpeed); // Nose Left
          targetBankAngle = maxBankAngle; // Bank right when yawing left
        }
        if (keyStates.value.YAW_RIGHT) {
          spaceshipMesh.rotateY(-actualRotateSpeed); // Nose Right
          targetBankAngle = -maxBankAngle; // Bank left when yawing right
        }

        // Roll
        if (keyStates.value.ROLL_LEFT) spaceshipMesh.rotateZ(actualRotateSpeed); // Roll Left
        if (keyStates.value.ROLL_RIGHT) spaceshipMesh.rotateZ(-actualRotateSpeed); // Roll Right

        // Apply Boundaries
        spaceshipMesh.position.x = Math.max(-PLAY_AREA_HALF_SIZE, Math.min(PLAY_AREA_HALF_SIZE, spaceshipMesh.position.x));
        spaceshipMesh.position.y = Math.max(-PLAY_AREA_HALF_SIZE, Math.min(PLAY_AREA_HALF_SIZE, spaceshipMesh.position.y));
        spaceshipMesh.position.z = Math.max(-PLAY_AREA_HALF_SIZE, Math.min(PLAY_AREA_HALF_SIZE, spaceshipMesh.position.z));

        // Mouse Look Camera (Orbit controls style around the spaceship)
        // Get mouse movement delta (this is a simplified approach, better with dedicated mouse move listener)
        // For this example, we'll use current mouse position relative to center to drive the orbit angles continuously.
        // This means the camera will try to orbit to the mouse position.
        // A true 'look around' often uses mouse movement delta, not absolute position.
        
        const normalizedMouseX = (mouseX.value / window.innerWidth) - 0.5;
        const normalizedMouseY = (mouseY.value / window.innerHeight) - 0.5;

        // Update camera orbital angles based on mouse position from center IF RIGHT MOUSE BUTTON IS HELD
        // DEBUG: Camera logic block was here
        if (isRightMouseDown.value && camera && spaceshipMesh) {
          cameraPhi -= normalizedMouseX * Math.PI * 2 * mouseLookSensitivity * 100; // Yaw around spaceship
          cameraTheta -= normalizedMouseY * Math.PI * mouseLookSensitivity * 100;   // Pitch around spaceship
          cameraTheta = Math.max(0.1, Math.min(Math.PI - 0.1, cameraTheta)); // Clamp pitch
          
          cameraTarget.copy(spaceshipMesh.position); // Camera always looks at the spaceship
          const cameraDistance = 5.0; // Distance for orbital camera (Reduced)

          const orbitalOffset = new THREE.Vector3();

          orbitalOffset.x = cameraDistance * Math.sin(cameraTheta) * Math.cos(cameraPhi);
          orbitalOffset.y = cameraDistance * Math.cos(cameraTheta);
          orbitalOffset.z = cameraDistance * Math.sin(cameraTheta) * Math.sin(cameraPhi);

          camera.position.copy(cameraTarget).add(orbitalOffset);
          camera.lookAt(cameraTarget);

        } else if (spaceshipMesh && camera) { // When not right-dragging, smoothly return to ship's default view
          const targetPosition = new THREE.Vector3();
          // Calculate world position of the default offset
          targetPosition.copy(defaultCameraOffset).applyQuaternion(spaceshipMesh.quaternion).add(spaceshipMesh.position);

          camera.position.lerp(targetPosition, 0.05); // Smoothly move camera to target position

          // Determine the ship's current world-space 'up' vector
          const shipUpVector = new THREE.Vector3(0, 1, 0);
          shipUpVector.applyQuaternion(spaceshipMesh.quaternion);

          // Create a target quaternion for the camera
          const targetLookAt = new THREE.Vector3();
          // Option 1: Look directly at the ship's center
          targetLookAt.copy(spaceshipMesh.position);
          // Option 2: Look slightly ahead of the ship (more dynamic feel)
          // const lookAheadDistance = 10;
          // targetLookAt.set(0, 0, lookAheadDistance).applyQuaternion(spaceshipMesh.quaternion).add(spaceshipMesh.position);

          // Use a temporary matrix to configure the target camera orientation
          const tempMatrix = new THREE.Matrix4();
          tempMatrix.lookAt(camera.position, targetLookAt, shipUpVector);
          const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(tempMatrix);

          // Slerp the actual camera's quaternion towards the target orientation
          camera.quaternion.slerp(targetQuaternion, 0.05);
        }

      } else {
        // Fallback camera behavior if spaceship not loaded (e.g., initial view)
        // Normalize mouse position (e.g., to -0.5 to 0.5 range)
        // const normalizedMouseX = (mouseX.value / window.innerWidth) - 0.5;
        // const normalizedMouseY = (mouseY.value / window.innerHeight) - 0.5;
        // camera.position.x += (normalizedMouseX * 0.05 - camera.position.x) * 0.01; 
        // camera.position.y += (-normalizedMouseY * 0.05 - camera.position.y) * 0.01; 
        if (scene) camera.lookAt(scene.position); 
      }

      // Update all solar system objects (planets, moons, etc.)
      if (solarSystemObjects.value && solarSystemObjects.value.length > 0) {
        solarSystemObjects.value.forEach(planet => {
          if (planet.mesh && typeof planet.orbitalSpeed === 'number' && typeof planet.orbitalRadius === 'number' && typeof planet.currentOrbitalAngle === 'number') {
            // Optional: Add axial rotation here if needed for each planet
            // if (typeof planet.axialSpeed === 'number') { 
            //   planet.mesh.rotation.y += planet.axialSpeed * delta; 
            // }

            // Orbital movement
            // REVIEW: The '* 60' factor needs clarification based on intended units for orbitalSpeed and delta.
            // If delta is time in seconds, and orbitalSpeed is radians per second, then '* 60' is not needed.
            // If orbitalSpeed is radians per minute, and delta is in seconds, then it should be 'planet.orbitalSpeed * (delta / 60)' or 'planet.orbitalSpeed / 60 * delta'.
            // Keeping original 'planet.orbitalSpeed * delta * 60' for now to preserve existing behavior pending review.
            planet.currentOrbitalAngle += planet.orbitalSpeed * delta * 60;
            
            const sunPositionX = sunMesh ? sunMesh.position.x : 0;
            const sunPositionZ = sunMesh ? sunMesh.position.z : 0; 
            // Assuming orbits are primarily in the XZ plane relative to the sun.
            // If planets have their own Y positions or inclined orbits, that logic would go here.
            const sunPositionY = sunMesh ? sunMesh.position.y : 0; // Base Y for planets unless they have their own defined Y.

            planet.mesh.position.x = sunPositionX + planet.orbitalRadius * Math.cos(planet.currentOrbitalAngle);
            planet.mesh.position.z = sunPositionZ + planet.orbitalRadius * Math.sin(planet.currentOrbitalAngle);
            // If planets are not meant to share the sun's Y, adjust planet.mesh.position.y accordingly
            // For now, let's assume they stay in the sun's XZ plane or have their Y set during creation. If sunMesh is null, Y is 0.
            planet.mesh.position.y = planet.mesh.position.y !== undefined ? planet.mesh.position.y : sunPositionY;
          }
        });
      }

      // Sun's self-rotation (optional, subtle)
      if (sunMesh) {
        sunMesh.rotation.y += 0.0005 * delta * 60;
      }

      renderer.render(scene, camera);
    };

    animate();

    // Log mouse position (for testing)
    watch([mouseX, mouseY], ([newX, newY]) => {
      console.log(`Mouse position: X=${newX}, Y=${newY}`);
    });

    // Handle window resize
    const handleResize = () => {
      if (camera && renderer) {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
      }
    };
    window.addEventListener('resize', handleResize);

    // Keyboard event listeners for spaceship controls
    const handleKeyDown = (event: KeyboardEvent) => {
      const pressedKey = event.key.toLowerCase();

      // Handle key rebinding if active
      if (isListeningForKey.value && actionToRebind.value) {
        event.preventDefault(); // Prevent default browser action for the key
        event.stopPropagation(); // Stop event from bubbling further
        setBinding(actionToRebind.value, pressedKey);
        return;
      }

      // Handle pause toggle (Enter or Escape)
      if (pressedKey === 'enter' && !isListeningForKey.value) { // Ensure not to toggle pause if waiting for 'enter' as a binding
        togglePause();
        return;
      }
      if (pressedKey === 'escape') {
        if (isListeningForKey.value) {
          cancelRebind(); // If listening, Escape cancels rebind mode
        } else {
          togglePause(); // Otherwise, toggle pause
        }
        return;
      }

      // Normal game input processing only if simulation is running
      if (simulationState.value !== 'running') return;

      // Set key state for game actions
      for (const action in currentKeyBindings.value) {
        if (currentKeyBindings.value[action as keyof KeyBindings].toLowerCase() === pressedKey) {
          keyStates.value[action] = true;
          break; 
        }
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      const releasedKey = event.key.toLowerCase();

      if (releasedKey === 'enter' || releasedKey === 'escape') return; // These are toggles, not held keys for actions
      if (simulationState.value !== 'running' && simulationState.value !== 'paused') return; // Allow key up to register even if paused to clear states

      // Check against configurable keybindings
      for (const action in currentKeyBindings.value) {
        if (currentKeyBindings.value[action as keyof KeyBindings].toLowerCase() === releasedKey) {
          keyStates.value[action] = false;
          break; // Action found and cleared
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    // Event listeners for mouse state (right-click for camera look)
    const handleMouseDown = (event: MouseEvent) => {
      if (simulationState.value !== 'running') return; // Guard: Only allow if simulation is running
      if (event.button === 2) { // Right mouse button
        isRightMouseDown.value = true;
        event.preventDefault(); // Prevent context menu
      }
    };
    const handleMouseUp = (event: MouseEvent) => {
      if (event.button === 2) { // Right mouse button
        isRightMouseDown.value = false;
      }
    };
    window.addEventListener('mousedown', handleMouseDown); // Now uses the correctly guarded handleMouseDown
    window.addEventListener('mouseup', handleMouseUp);
    // Prevent context menu on canvas right-click as well
    canvasRef.value?.addEventListener('contextmenu', (event) => event.preventDefault());

    // Cleanup on unmount will remove this listener
    onUnmounted(() => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousedown', handleMouseDown); // Added
      window.removeEventListener('mouseup', handleMouseUp);     // Added
      canvasRef.value?.removeEventListener('contextmenu', (event) => event.preventDefault()); // Added
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (renderer) {
        renderer.dispose();
      }
      // Particle specific disposal will go here
      if (particles) {
        if (particles.geometry) particles.geometry.dispose();
        if (particles.material) {
          if (Array.isArray(particles.material)) {
            particles.material.forEach(mat => mat.dispose());
          } else {
            (particles.material as THREE.Material).dispose();
          }
        }
      }
      if (sunMesh) {
        if (sunMesh.geometry) sunMesh.geometry.dispose();
        if (sunMesh.material) {
            if (Array.isArray(sunMesh.material)) {
                sunMesh.material.forEach(mat => mat.dispose());
            } else {
                (sunMesh.material as THREE.Material).dispose();
            }
        }
      }
      if (earthMesh) {
        if (earthMesh.geometry) earthMesh.geometry.dispose();
        if (earthMesh.material) {
          if (Array.isArray(earthMesh.material)) {
            earthMesh.material.forEach(mat => mat.dispose());
          } else {
            (earthMesh.material as THREE.Material).dispose();
          }
        }
      }
      if (spaceshipMesh) {
        if (scene) scene.remove(spaceshipMesh); // Remove from scene first
        spaceshipMesh.traverse((object) => {
          const mesh = object as THREE.Mesh;
          if (mesh.isMesh) {
            if (mesh.geometry) {
              mesh.geometry.dispose();
            }
            if (mesh.material) {
              if (Array.isArray(mesh.material)) {
                mesh.material.forEach(mat => mat.dispose());
              } else {
                (mesh.material as THREE.Material).dispose();
              }
            }
          }
        });
        // spaceshipMesh = null; // Optional: clear the reference if desired after disposal
      }
      // sunLight does not need explicit disposal unless it has map properties from shadows etc.
      if(scene) {
        // scene.dispose(); // Scene does not have a dispose method directly, clear children
        while(scene.children.length > 0){ 
            scene.remove(scene.children[0]); 
        }
      }
    });
  }
});

// Theme update function
const updateThemeColors = () => {
  if (!scene || !particles) return;

  scene.background = new THREE.Color(0x000000); // Black background for dark theme
  if (particles.material instanceof THREE.PointsMaterial) {
    particles.material.color.set(0xffffff); // White particles for dark theme
  }
  // Ensure renderer is updated if it exists
  if (renderer && scene && camera) {
    renderer.render(scene, camera);
  }
};

// Note: onUnmounted for renderer.dispose() is already defined above from previous template, combining them.

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
