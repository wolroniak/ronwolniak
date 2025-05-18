import { ref, reactive, shallowRef, readonly } from 'vue';
import type { Ref } from 'vue';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { KeyBindings, KeyStates } from './useKeybindings'; // Assuming KeyBindings interface and KeyStates type are here
import type { CelestialBodyCollisionData } from './useSolarSystem'; // For collision detection

export function useSpaceship(
  scene: THREE.Scene, 
  camera: THREE.PerspectiveCamera, 
  keyStates: KeyStates, // Consumed from useKeybindings
  celestialBodiesForCollision: Readonly<Ref<CelestialBodyCollisionData[]>>,
  handleCrashCallback: () => void
) {
  const spaceship = shallowRef<THREE.Group | null>(null);
  const spaceshipMixer = shallowRef<THREE.AnimationMixer | null>(null);
  const spaceshipAnimations = ref<THREE.AnimationClip[]>([]);
    const spaceshipInitialPosition = new THREE.Vector3(0, 0, 200); // Start further away from the sun
  const spaceshipInitialRotation = new THREE.Euler(0, Math.PI, 0); // Rotate 180 degrees to face the sun (origin)

  // Spaceship Control Parameters (from old AnimationCanvas.vue)
  const shipRotateSpeed = 1.5; // Radians per second
  const autoForwardSpeedBase = 3.0; // Base speed for automatic forward movement
  const boostMultiplier = 3.0; // Factor by which speed increases with boost
  const maxBankAngle = Math.PI / 6; // Max bank angle (30 degrees) for yaw-induced roll (if implemented)
  const bankInterpolationFactor = 0.07; // Smoothing factor for banking (if implemented)
  const PLAY_AREA_HALF_SIZE = 1000; // Boundary limit
  const SPACESHIP_COLLISION_RADIUS = 1.5; // Approximate radius for collision

  // Camera Parameters
  const defaultCameraOffset = new THREE.Vector3(0, 1.0, -2.5); // Camera closer and slightly lower, behind ship's +Z
  // orbitalCameraDistance and mouseLookSensitivity removed as orbital camera is being removed.

  // State Refs for Spaceship and Camera
  const currentBankAngle = ref(0); // For smooth banking (if implemented with lerp)
  // cameraPhi and cameraTheta removed as orbital camera is being removed.
  // Internal keyStates removed; useSpaceship will now consume keyStates from useKeybindings

  // Reusable THREE.js objects for camera calculations to avoid allocations in loop
  const targetPosition = new THREE.Vector3();
  const shipUpVector = new THREE.Vector3(0, 1, 0);
  const lookAtTarget = new THREE.Vector3();
  const tempMatrix = new THREE.Matrix4();
  const targetQuaternion = new THREE.Quaternion();

  const loadSpaceshipModel = async () => {
    const loader = new GLTFLoader();
    try {
      const gltf = await loader.loadAsync('/models/spaceship-executioner/glTF/Executioner.gltf');
      spaceship.value = gltf.scene;
      spaceship.value.position.copy(spaceshipInitialPosition);
      spaceship.value.rotation.copy(spaceshipInitialRotation); // Initial rotation (faces sun if model's +Z is forward)
      spaceship.value.scale.set(0.05, 0.05, 0.05); // Starship made smaller as per old code
      
      // Adjust material properties for better visibility and lighting response (from old code)
      spaceship.value.traverse((child) => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Optional material adjustments from old code can be re-added here if needed
          // e.g., child.material.metalness, child.material.roughness, etc.
        }
      });

      scene.add(spaceship.value);

      if (gltf.animations && gltf.animations.length) {
        spaceshipAnimations.value = gltf.animations;
        spaceshipMixer.value = new THREE.AnimationMixer(spaceship.value);
        // Example: Play the first animation
        // const action = spaceshipMixer.value.clipAction(spaceshipAnimations.value[0]);
        // action.play();
      }
      console.log('Spaceship model loaded successfully.');
    } catch (error) {
      console.error('Error loading spaceship model:', error);
    }
  };

  const updateSpaceship = (delta: number) => {
    if (!spaceship.value) return;

    // --- Spaceship Movement Logic (from old AnimationCanvas.vue) ---
    let currentForwardSpeed = autoForwardSpeedBase;
    if (keyStates.BOOST) {
      currentForwardSpeed *= boostMultiplier;
    }
    // Automatic forward movement (model's +Z is forward due to initial rotation.y = PI)
    spaceship.value.translateZ(currentForwardSpeed * delta);

    const actualRotateSpeed = shipRotateSpeed * delta;
    // let targetBankAngle = 0; // This was in old code but not used to directly apply banking via lerp there

    // Pitch (W/S)
    if (keyStates.PITCH_UP) spaceship.value.rotateX(actualRotateSpeed); // Nose Up
    if (keyStates.PITCH_DOWN) spaceship.value.rotateX(-actualRotateSpeed); // Nose Down

    // Yaw (Q/E)
    if (keyStates.YAW_LEFT) {
      spaceship.value.rotateY(actualRotateSpeed); // Nose Left
      // targetBankAngle = maxBankAngle; // For yaw-induced banking if implemented
    }
    if (keyStates.YAW_RIGHT) {
      spaceship.value.rotateY(-actualRotateSpeed); // Nose Right
      // targetBankAngle = -maxBankAngle; // For yaw-induced banking if implemented
    }

    // Roll (A/D) - Direct roll
    if (keyStates.ROLL_LEFT) spaceship.value.rotateZ(actualRotateSpeed); // Roll Left
    if (keyStates.ROLL_RIGHT) spaceship.value.rotateZ(-actualRotateSpeed); // Roll Right
    
    // Apply Boundaries
    spaceship.value.position.x = Math.max(-PLAY_AREA_HALF_SIZE, Math.min(PLAY_AREA_HALF_SIZE, spaceship.value.position.x));
    spaceship.value.position.y = Math.max(-PLAY_AREA_HALF_SIZE, Math.min(PLAY_AREA_HALF_SIZE, spaceship.value.position.y));
    spaceship.value.position.z = Math.max(-PLAY_AREA_HALF_SIZE, Math.min(PLAY_AREA_HALF_SIZE, spaceship.value.position.z));

    // --- Camera Logic (Default third-person follow camera) ---
    // Orbital camera logic (if (isRightMouseDownVal) { ... }) has been removed.
    
    const targetPosition = new THREE.Vector3();
    targetPosition.copy(defaultCameraOffset).applyQuaternion(spaceship.value.quaternion).add(spaceship.value.position);

    camera.position.lerp(targetPosition, 0.05); // Smoothly move camera to target position

    const shipUpVector = new THREE.Vector3(0, 1, 0);
    shipUpVector.applyQuaternion(spaceship.value.quaternion);

    const lookAtTarget = new THREE.Vector3();
    lookAtTarget.copy(spaceship.value.position);

    const tempMatrix = new THREE.Matrix4();
    tempMatrix.lookAt(camera.position, lookAtTarget, shipUpVector);
    const targetQuaternion = new THREE.Quaternion().setFromRotationMatrix(tempMatrix);

    camera.quaternion.slerp(targetQuaternion, 0.05); // Smoothly orient camera

    // Update spaceship animation mixer
    // --- Collision Detection ---
    if (celestialBodiesForCollision.value && celestialBodiesForCollision.value.length > 0) {
      const spaceshipPosition = spaceship.value.position;
      for (const body of celestialBodiesForCollision.value) {
        if (body.mesh) { // Ensure mesh exists
          const bodyPosition = body.mesh.position;
          const distance = spaceshipPosition.distanceTo(bodyPosition);
          const combinedRadii = SPACESHIP_COLLISION_RADIUS + body.radius;

          if (distance < combinedRadii) {
            console.log(`Collision detected with ${body.name}! Distance: ${distance}, Combined Radii: ${combinedRadii}`);
            handleCrashCallback(body.name); // Pass the name of the collided object
            return; // Stop further processing for this frame
          }
        }
      }
    }

    // --- Camera Logic (Default third-person follow camera) ---
    // (Camera logic continues as before)
    targetPosition.copy(defaultCameraOffset).applyQuaternion(spaceship.value.quaternion).add(spaceship.value.position);
    camera.position.lerp(targetPosition, 0.05); // Smoothly move camera to target position

    shipUpVector.set(0, 1, 0).applyQuaternion(spaceship.value.quaternion);
    lookAtTarget.copy(spaceship.value.position);
    tempMatrix.lookAt(camera.position, lookAtTarget, shipUpVector);
    targetQuaternion.setFromRotationMatrix(tempMatrix);

    camera.quaternion.slerp(targetQuaternion, 0.05); // Smoothly orient camera

    // Update spaceship animation mixer
    if (spaceshipMixer.value) {
      spaceshipMixer.value.update(delta);
    }
  };

  return {
    spaceship,
    spaceshipMixer,
    spaceshipAnimations,
    spaceshipInitialPosition, // For potential reset or reference
    spaceshipInitialRotation, // For potential reset or reference
    // Old speed refs removed as they are now constants or calculated dynamically
    // keyStates is no longer returned as it's passed in
    loadSpaceshipModel,
    updateSpaceship,
    resetSpaceship // Added for restarting the game
  };

  function resetSpaceship() {
    if (spaceship.value) {
      spaceship.value.position.copy(spaceshipInitialPosition);
      spaceship.value.quaternion.setFromEuler(spaceshipInitialRotation);
      // Reset all passed-in key states to stop movement
      for (const action in keyStates) {
        if (Object.prototype.hasOwnProperty.call(keyStates, action)) {
          keyStates[action as keyof KeyBindings] = false;
        }
      }
      currentBankAngle.value = 0; // Reset any residual bank angle
      console.log('Spaceship reset to initial state. Key states cleared.');
    }
  };
}
