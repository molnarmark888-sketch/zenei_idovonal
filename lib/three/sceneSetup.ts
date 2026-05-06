import * as THREE from 'three';

export type SceneBundle = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  dispose: () => void;
};

export function createScene(canvas: HTMLCanvasElement): SceneBundle {
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    50,
    window.innerWidth / window.innerHeight,
    0.1,
    1000,
  );
  camera.position.z = 10;

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance',
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 3));
  renderer.setSize(window.innerWidth, window.innerHeight);

  scene.add(new THREE.AmbientLight(0xffffff, 0.4));
  const l1 = new THREE.PointLight(0xffffff, 120);
  l1.position.set(-5, 5, 5);
  scene.add(l1);
  const l2 = new THREE.PointLight(0xffffff, 150);
  l2.position.set(5, 5, 5);
  scene.add(l2);
  const topLight = new THREE.SpotLight(0xffffff, 200);
  topLight.position.set(0, 8, 2);
  scene.add(topLight);
  const bottomLight = new THREE.PointLight(0xffffff, 150);
  bottomLight.position.set(0, -8, 4);
  scene.add(bottomLight);

  const onResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  };
  window.addEventListener('resize', onResize);

  const dispose = () => {
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };

  return { scene, camera, renderer, dispose };
}
