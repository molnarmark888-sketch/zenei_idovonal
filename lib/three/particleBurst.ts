import * as THREE from 'three';

type Particle = {
  active: boolean;
  age: number;
  velocity: THREE.Vector3;
};

export type ParticleBurst = {
  points: THREE.Points;
  spawn: (origin: THREE.Vector3) => void;
  update: (deltaSec: number) => void;
  dispose: () => void;
};

export type ParticleBurstOptions = {
  count: number;
  speed: number;
  lifetimeSec: number;
  color: number;
  size: number;
};

export function createParticleBurst(opts: ParticleBurstOptions): ParticleBurst {
  const positions = new Float32Array(opts.count * 3);
  const colors = new Float32Array(opts.count * 3);
  const baseColor = new THREE.Color(opts.color);

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: opts.size,
    vertexColors: true,
    transparent: true,
    opacity: 1,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  const particles: Particle[] = Array.from({ length: opts.count }, () => ({
    active: false,
    age: 0,
    velocity: new THREE.Vector3(),
  }));

  const spawn = (origin: THREE.Vector3) => {
    const half = Math.min(opts.count, Math.floor(opts.count * 0.6));
    let spawned = 0;
    for (let i = 0; i < opts.count && spawned < half; i++) {
      const p = particles[i];
      if (p.active) continue;
      p.active = true;
      p.age = 0;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      const speed = opts.speed * (0.4 + Math.random() * 0.8);
      p.velocity.set(
        Math.sin(phi) * Math.cos(theta) * speed,
        Math.cos(phi) * speed + 0.02,
        Math.sin(phi) * Math.sin(theta) * speed,
      );
      positions[i * 3] = origin.x;
      positions[i * 3 + 1] = origin.y;
      positions[i * 3 + 2] = origin.z;
      colors[i * 3] = baseColor.r;
      colors[i * 3 + 1] = baseColor.g;
      colors[i * 3 + 2] = baseColor.b;
      spawned++;
    }
    geometry.attributes.position.needsUpdate = true;
    geometry.attributes.color.needsUpdate = true;
  };

  const update = (deltaSec: number) => {
    let anyActive = false;
    for (let i = 0; i < opts.count; i++) {
      const p = particles[i];
      if (!p.active) continue;
      anyActive = true;
      p.age += deltaSec;
      if (p.age >= opts.lifetimeSec) {
        p.active = false;
        positions[i * 3] = 0;
        positions[i * 3 + 1] = -9999;
        positions[i * 3 + 2] = 0;
        colors[i * 3] = 0;
        colors[i * 3 + 1] = 0;
        colors[i * 3 + 2] = 0;
        continue;
      }
      positions[i * 3] += p.velocity.x;
      positions[i * 3 + 1] += p.velocity.y;
      positions[i * 3 + 2] += p.velocity.z;
      const life = 1 - p.age / opts.lifetimeSec;
      colors[i * 3] = baseColor.r * life;
      colors[i * 3 + 1] = baseColor.g * life;
      colors[i * 3 + 2] = baseColor.b * life;
    }
    if (anyActive) {
      geometry.attributes.position.needsUpdate = true;
      geometry.attributes.color.needsUpdate = true;
    }
  };

  const dispose = () => {
    geometry.dispose();
    material.dispose();
  };

  return { points, spawn, update, dispose };
}
