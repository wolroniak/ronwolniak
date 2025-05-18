import { ref, shallowRef } from 'vue';
import type { Ref } from 'vue';
import * as THREE from 'three';

export function useThreeScene(
  canvasRef: Ref<HTMLCanvasElement | null>,
) {
  // Core Three.js components
  const scene = shallowRef<THREE.Scene | null>(null);
  const camera = shallowRef<THREE.PerspectiveCamera | null>(null);
  const renderer = shallowRef<THREE.WebGLRenderer | null>(null);
  const animationFrameId = ref<number | null>(null);
  
  // Starfield particles
  const particles = shallowRef<THREE.Points | null>(null);
  
  // Initialize Three.js scene
  const initScene = () => {
    if (!canvasRef.value) return;
    
    // Create scene
    scene.value = new THREE.Scene();
    scene.value.background = new THREE.Color(0x000000);
    
    // Create camera
    camera.value = new THREE.PerspectiveCamera(
      75,                                   // Field of view
      window.innerWidth / window.innerHeight, // Aspect ratio
      0.1,                                  // Near clipping plane
      5000                                  // Far clipping plane (increased for space scale)
    );
    camera.value.position.set(0, 50, 350); // Initial camera position
    
    // Create renderer
    renderer.value = new THREE.WebGLRenderer({ 
      canvas: canvasRef.value, 
      antialias: true 
    });
    renderer.value.setSize(window.innerWidth, window.innerHeight);
    
    return {
      scene: scene.value,
      camera: camera.value,
      renderer: renderer.value,
    };
  };
  
  // Create starfield particle system
  const createStarfield = (particleCount = 20000, particleSpread = 4000) => {
    if (!scene.value) return null;
    
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const i3 = i * 3;
      particlePositions[i3] = (Math.random() - 0.5) * particleSpread;
      particlePositions[i3 + 1] = (Math.random() - 0.5) * particleSpread;
      particlePositions[i3 + 2] = (Math.random() - 0.5) * particleSpread;
    }
    
    const particlesGeometry = new THREE.BufferGeometry();
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particlesMaterial = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.01, // Smaller stars
    });
    
    const particleSystem = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.value.add(particleSystem);
    particles.value = particleSystem;
    
    return particleSystem;
  };
  
  // Handle window resize
  const handleResize = () => {
    if (!camera.value || !renderer.value) return;
    
    camera.value.aspect = window.innerWidth / window.innerHeight;
    camera.value.updateProjectionMatrix();
    renderer.value.setSize(window.innerWidth, window.innerHeight);
  };
  
  // Set up window resize listener
  const setupResizeListener = () => {
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  };
  
  // Render scene
  const renderScene = () => {
    if (!renderer.value || !scene.value || !camera.value) return;
    renderer.value.render(scene.value, camera.value);
  };
  
  // Clean up resources
  const dispose = () => {
    // Cancel animation frame if active
    if (animationFrameId.value) {
      cancelAnimationFrame(animationFrameId.value);
      animationFrameId.value = null;
    }
    
    // Dispose particles
    if (particles.value) {
      if (particles.value.geometry) particles.value.geometry.dispose();
      if (particles.value.material) {
        if (Array.isArray(particles.value.material)) {
          particles.value.material.forEach(mat => mat.dispose());
        } else {
          (particles.value.material as THREE.Material).dispose();
        }
      }
      if (scene.value) scene.value.remove(particles.value);
      particles.value = null;
    }
    
    // Dispose renderer
    if (renderer.value) {
      renderer.value.dispose();
      renderer.value = null;
    }
    
    // Clear scene
    if (scene.value) {
      while (scene.value.children.length > 0) {
        scene.value.remove(scene.value.children[0]);
      }
      scene.value = null;
    }
    
    // Clear camera
    camera.value = null;
  };
  
  // Update theme colors for particles and background
  const updateThemeColors = (isDarkTheme = true) => {
    if (!scene.value || !particles.value) return;
    
    // Set appropriate colors based on theme
    if (isDarkTheme) {
      scene.value.background = new THREE.Color(0x000000); // Black background for dark theme
      if (particles.value.material instanceof THREE.PointsMaterial) {
        particles.value.material.color.set(0xffffff); // White particles for dark theme
      }
    } else {
      scene.value.background = new THREE.Color(0xf0f0f0); // Light gray background for light theme
      if (particles.value.material instanceof THREE.PointsMaterial) {
        particles.value.material.color.set(0x555555); // Darker particles for light theme
      }
    }
    
    // Ensure renderer is updated
    renderScene();
  };
  
  return {
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
    dispose,
    updateThemeColors,
  };
}
