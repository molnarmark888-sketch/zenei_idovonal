import * as THREE from 'three';

export type LedController = {
  registerLed: (mesh: THREE.Mesh, isScanner: boolean) => void;
  cycleColor: (mesh: THREE.Mesh) => void;
  startKittScanner: () => void;
  stopKittScanner: () => void;
  update: (deltaSec: number) => void;
};

type LedState = {
  mesh: THREE.Mesh;
  material: THREE.MeshStandardMaterial;
  colorIdx: number;
  scannerIdx: number;
  baseColor: THREE.Color;
};

export type LedControllerOptions = {
  cycleColors: number[];
  scannerOrder: string[];
  scannerCycleSeconds: number;
  scannerBaseEmissive: number;
  scannerPeakEmissive: number;
  scannerColor: number;
};

export function createLedController(opts: LedControllerOptions): LedController {
  const all = new Map<THREE.Mesh, LedState>();
  const scannerLeds: LedState[] = new Array(opts.scannerOrder.length);
  let scannerActive = false;
  let scannerTime = 0;
  const scannerColor = new THREE.Color(opts.scannerColor);

  const ensureMaterial = (mesh: THREE.Mesh): THREE.MeshStandardMaterial => {
    const existing = mesh.material;
    if (Array.isArray(existing)) {
      throw new Error('Multi-material LED meshes not supported');
    }
    if (existing instanceof THREE.MeshStandardMaterial) {
      const cloned = existing.clone();
      mesh.material = cloned;
      return cloned;
    }
    const fresh = new THREE.MeshStandardMaterial({ color: 0x222222 });
    mesh.material = fresh;
    return fresh;
  };

  const registerLed = (mesh: THREE.Mesh, isScanner: boolean) => {
    const material = ensureMaterial(mesh);
    const baseColor = material.color.clone();
    const state: LedState = {
      mesh,
      material,
      colorIdx: 0,
      scannerIdx: isScanner ? opts.scannerOrder.indexOf(mesh.name) : -1,
      baseColor,
    };
    all.set(mesh, state);
    if (isScanner && state.scannerIdx >= 0) {
      scannerLeds[state.scannerIdx] = state;
      material.emissive.copy(scannerColor);
      material.emissiveIntensity = opts.scannerBaseEmissive;
    }
  };

  const cycleColor = (mesh: THREE.Mesh) => {
    const state = all.get(mesh);
    if (!state) return;
    state.colorIdx = (state.colorIdx + 1) % opts.cycleColors.length;
    const nextHex = opts.cycleColors[state.colorIdx];
    state.material.color.setHex(nextHex);
    state.material.emissive.setHex(nextHex);
    state.material.emissiveIntensity = 1.5;
  };

  const startKittScanner = () => {
    scannerActive = true;
  };

  const stopKittScanner = () => {
    scannerActive = false;
    for (const led of scannerLeds) {
      if (!led) continue;
      led.material.emissiveIntensity = 0;
      led.material.emissive.copy(led.baseColor);
    }
  };

  const update = (deltaSec: number) => {
    if (!scannerActive || scannerLeds.length === 0) return;
    scannerTime += deltaSec;
    const cycle = opts.scannerCycleSeconds;
    const phase = (scannerTime % cycle) / cycle;
    const len = scannerLeds.length;
    const pos = Math.abs((phase * 2) - 1) * (len - 1);

    for (let i = 0; i < len; i++) {
      const led = scannerLeds[i];
      if (!led) continue;
      const dist = Math.abs(i - pos);
      const closeness = Math.max(0, 1 - dist);
      const intensity =
        opts.scannerBaseEmissive +
        closeness * closeness * (opts.scannerPeakEmissive - opts.scannerBaseEmissive);
      led.material.emissive.copy(scannerColor);
      led.material.emissiveIntensity = intensity;
    }
  };

  return { registerLed, cycleColor, startKittScanner, stopKittScanner, update };
}
