import * as THREE from 'three';
import { gsap } from 'gsap';

export type HangSpinner = {
  start: (mesh: THREE.Mesh) => void;
  stop: (mesh: THREE.Mesh) => void;
  stopAll: () => void;
};

export function createHangSpinner(): HangSpinner {
  const active = new Set<THREE.Mesh>();

  const start = (mesh: THREE.Mesh) => {
    if (active.has(mesh)) return;
    active.add(mesh);
    gsap.to(mesh.rotation, {
      y: '+=999',
      duration: 999,
      ease: 'none',
    });
  };

  const stop = (mesh: THREE.Mesh) => {
    if (!active.has(mesh)) return;
    gsap.killTweensOf(mesh.rotation);
    active.delete(mesh);
  };

  const stopAll = () => {
    for (const mesh of active) {
      gsap.killTweensOf(mesh.rotation);
    }
    active.clear();
  };

  return { start, stop, stopAll };
}
