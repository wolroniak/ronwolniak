import { ref, shallowRef } from 'vue';
import type { Ref } from 'vue';
import * as THREE from 'three';

export interface PlanetData {
  name: string;
  radius: number;
  orbitalRadius: number;
  orbitalSpeed: number;
  rotationSpeed: number;
  color?: number;
  textureUrl?: string;
}

export interface CelestialBodyCollisionData {
  name: string;
  mesh: THREE.Mesh;
  radius: number; // Actual collision radius, typically geometry radius
}

export interface PlanetRenderData {
  name: string;
  mesh: THREE.Mesh;
  orbitalRadius: number;
  orbitalSpeed: number;
  rotationSpeed: number;
  currentOrbitalAngle: number;
}

export function useSolarSystem(
  scene: THREE.Scene | null,
) {
  // Solar system objects for animation
  const solarSystemObjects = ref<PlanetRenderData[]>([]);
  // Celestial bodies for collision detection
  const celestialBodiesForCollision = ref<CelestialBodyCollisionData[]>([]);
  
  // References to key solar system elements
  const sunMesh = shallowRef<THREE.Mesh | null>(null);
  const sunLight = shallowRef<THREE.PointLight | null>(null);

  // Create the sun with light source
  const createSun = (textureUrl: string = 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Solarsystemscope_texture_2k_sun.jpg') => {
    if (!scene) return;

    // Sun Light
    const pointLight = new THREE.PointLight(0xffddaa, 15, 2000); // color, intensity, distance
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);
    sunLight.value = pointLight;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Soft white ambient light
    scene.add(ambientLight);

    // Sun Mesh
    const textureLoader = new THREE.TextureLoader();
    const sunTexture = textureLoader.load(textureUrl);
    const sunGeometry = new THREE.SphereGeometry(50, 64, 64); // Sun radius
    const sunMaterial = new THREE.MeshStandardMaterial({
      map: sunTexture,
      emissiveMap: sunTexture,
      emissive: 0xffffff,
      emissiveIntensity: 1.0,
      color: 0xffffff
    });
    const mesh = new THREE.Mesh(sunGeometry, sunMaterial);
    mesh.position.set(0, 0, 0);
    scene.add(mesh);
    sunMesh.value = mesh;

    celestialBodiesForCollision.value.push({
      name: 'Sun',
      mesh: mesh,
      radius: 50 // Matches sunGeometry radius
    });

    return mesh;
  };

  // Create planets based on provided data
  const createPlanets = (planetsData: PlanetData[]) => {
    if (!scene) return;

    const textureLoader = new THREE.TextureLoader();

    planetsData.forEach(planetDef => {
      const geometry = new THREE.SphereGeometry(planetDef.radius, 32, 32);
      let material;
      
      if (planetDef.textureUrl) {
        const texture = textureLoader.load(planetDef.textureUrl);
        material = new THREE.MeshStandardMaterial({ 
          map: texture, 
          roughness: 0.3, 
          metalness: 0.1 
        });
      } else {
        material = new THREE.MeshStandardMaterial({ 
          color: planetDef.color || 0xffffff, 
          roughness: 0.3, 
          metalness: 0.1 
        });
      }
      
      const mesh = new THREE.Mesh(geometry, material);
      // Initial position based on orbital radius (angle will be applied in update)
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

      celestialBodiesForCollision.value.push({
        name: planetDef.name,
        mesh: mesh,
        radius: planetDef.radius // Geometry radius
      });
    });
  };

  // Create the default solar system
  const createDefaultSolarSystem = () => {
    if (!scene) return;

    createSun();

    const planetsData: PlanetData[] = [
      { 
        name: 'Mercury', 
        radius: 2, 
        orbitalRadius: 60, 
        orbitalSpeed: 0.0008, 
        rotationSpeed: 0.005, 
        color: 0x888888, 
        textureUrl: '/textures/mercury_texture.jpg' 
      },
      { 
        name: 'Venus', 
        radius: 3.5, 
        orbitalRadius: 110, 
        orbitalSpeed: 0.0005, 
        rotationSpeed: 0.002, 
        color: 0xFFFFEE, 
        textureUrl: '/textures/venus_texture.jpg' 
      },
      { 
        name: 'Earth', 
        radius: 4, 
        orbitalRadius: 150, 
        orbitalSpeed: 0.0004, 
        rotationSpeed: 0.003, 
        textureUrl: '/textures/earth_texture.jpg' 
      }, 
      { 
        name: 'Mars', 
        radius: 2.5, 
        orbitalRadius: 225, 
        orbitalSpeed: 0.0003, 
        rotationSpeed: 0.0025, 
        textureUrl: '/textures/mars_texture.jpg', 
        color: 0xff4500 
      },
      { 
        name: 'Jupiter', 
        radius: 10, 
        orbitalRadius: 400, 
        orbitalSpeed: 0.0001, 
        rotationSpeed: 0.0003, 
        textureUrl: '/textures/jupiter_texture.jpg', 
        color: 0xffA500 
      },
    ];

    createPlanets(planetsData);
  };

  // Update planet positions
  const updatePlanetPositions = (delta: number) => {
    if (solarSystemObjects.value && solarSystemObjects.value.length > 0) {
      solarSystemObjects.value.forEach(planet => {
        if (planet.mesh && typeof planet.orbitalSpeed === 'number' && typeof planet.orbitalRadius === 'number' && typeof planet.currentOrbitalAngle === 'number') {
          // Optional: Add axial rotation if needed for each planet
          // if (typeof planet.axialSpeed === 'number') { 
          //   planet.mesh.rotation.y += planet.axialSpeed * delta; 
          // }

          // Orbital movement
          // Factor of 60 is kept for consistent behavior with previous implementation
          planet.currentOrbitalAngle += planet.orbitalSpeed * delta * 60;
          
          const sunPositionX = sunMesh.value ? sunMesh.value.position.x : 0;
          const sunPositionZ = sunMesh.value ? sunMesh.value.position.z : 0; 
          const sunPositionY = sunMesh.value ? sunMesh.value.position.y : 0;

          planet.mesh.position.x = sunPositionX + planet.orbitalRadius * Math.cos(planet.currentOrbitalAngle);
          planet.mesh.position.z = sunPositionZ + planet.orbitalRadius * Math.sin(planet.currentOrbitalAngle);
          planet.mesh.position.y = planet.mesh.position.y !== undefined ? planet.mesh.position.y : sunPositionY;
        }
      });
    }

    // Sun's self-rotation
    if (sunMesh.value) {
      sunMesh.value.rotation.y += 0.0005 * delta * 60;
    }
  };

  // Clean up resources
  const disposeSolarSystem = () => {
    // Dispose sun
    if (sunMesh.value) {
      if (sunMesh.value.geometry) sunMesh.value.geometry.dispose();
      if (sunMesh.value.material) {
        if (Array.isArray(sunMesh.value.material)) {
          sunMesh.value.material.forEach(mat => mat.dispose());
        } else {
          (sunMesh.value.material as THREE.Material).dispose();
        }
      }
      if (scene) scene.remove(sunMesh.value);
      sunMesh.value = null;
    }

    // Dispose planets
    if (solarSystemObjects.value && solarSystemObjects.value.length > 0) {
      solarSystemObjects.value.forEach(planet => {
        if (planet.mesh) {
          if (planet.mesh.geometry) planet.mesh.geometry.dispose();
          if (planet.mesh.material) {
            if (Array.isArray(planet.mesh.material)) {
              planet.mesh.material.forEach(mat => mat.dispose());
            } else {
              (planet.mesh.material as THREE.Material).dispose();
            }
          }
          if (scene) scene.remove(planet.mesh);
        }
      });
      solarSystemObjects.value = [];
    }

    // Remove light
    if (sunLight.value && scene) {
      scene.remove(sunLight.value);
}

// Remove light
if (sunLight.value && scene) {
  scene.remove(sunLight.value);
  sunLight.value = null;
}
};

return {
  sunMesh: readonly(sunMesh),
  sunLight: readonly(sunLight),
  solarSystemObjects: readonly(solarSystemObjects),
  celestialBodiesForCollision: readonly(celestialBodiesForCollision), 
  createDefaultSolarSystem,
  updatePlanetPositions,
  disposeSolarSystem,
};
}
