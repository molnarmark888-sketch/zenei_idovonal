'use client';

import { useCallback, useEffect, useRef } from 'react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config, defaultTrack, type Track } from '@/lib/config';
import { createScene } from '@/lib/three/sceneSetup';
import { createRadioDisplay } from '@/lib/three/radioDisplay';
import { createLedController } from '@/lib/three/ledController';
import { createHangSpinner } from '@/lib/three/hangSpinner';

const DRAG_THRESHOLD_PX = 4;

export function RadioExperience({ onSelectImage }: { onSelectImage?: (id: number) => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<Track>(defaultTrack);
  const ledStartRef = useRef<(() => void) | null>(null);
  const ledStopRef = useRef<(() => void) | null>(null);

  const playSrc = useCallback((src: string) => {
    const audio = audioRef.current;
    if (!audio) {
      console.warn('[radio] playSrc: no audio element');
      return;
    }
    console.log('[radio] playSrc:', src, '(current:', audio.src, 'vol:', audio.volume, 'ready:', audio.readyState, ')');
    const sameSrc = audio.src.endsWith(src);
    if (!sameSrc) {
      audio.pause();
      audio.src = src;
      audio.load();
    } else {
      audio.currentTime = 0;
    }
    const playPromise = audio.play();
    if (playPromise) {
      playPromise.then(() => console.log('[radio] playing:', src)).catch((err) => console.warn('[radio] audio.play() failed for', src, err.name, err.message));
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const { scene, camera, renderer, dispose } = createScene(canvas);
    const display = createRadioDisplay();
    const leds = createLedController({
      cycleColors: config.ledColors,
      scannerOrder: config.meshNames.kittScannerLeds,
      scannerCycleSeconds: config.kittScanner.cycleSeconds,
      scannerBaseEmissive: config.kittScanner.baseEmissive,
      scannerPeakEmissive: config.kittScanner.peakEmissive,
      scannerColor: config.kittScanner.color
    });
    const spinner = createHangSpinner();

    ledStartRef.current = leds.startKittScanner;
    ledStopRef.current = leds.stopKittScanner;

    const orbit = config.cameraOrbit;
    let radio: THREE.Group | null = null;
    let displayOverlay: THREE.Mesh | null = null;

    new GLTFLoader().load(config.radioModelPath, (gltf: GLTF) => {
      radio = gltf.scene;
      radio.scale.set(7.8, 7.8, 7.8);
      radio.position.set(0, orbit.radioY, 0);
      radio.rotation.x = 0.25;
      scene.add(radio);

      radio.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        if (child.name === config.meshNames.display) {
          child.geometry.computeBoundingBox();
          const bb = child.geometry.boundingBox;
          if (bb) {
            const w = bb.max.x - bb.min.x;
            const h = bb.max.y - bb.min.y;
            const d = bb.max.z - bb.min.z;
            const cx = (bb.max.x + bb.min.x) / 2;
            const cy = (bb.max.y + bb.min.y) / 2;
            const cz = (bb.max.z + bb.min.z) / 2;
            const overlay = new THREE.Mesh(
              new THREE.PlaneGeometry(w * 0.9, h * 1.0),
              new THREE.MeshBasicMaterial({
                map: display.texture,
                transparent: true,
                opacity: 1,
                depthTest: false
              })
            );
            overlay.position.set(cx, cy, cz + d * 0.4);
            overlay.renderOrder = 999;
            overlay.raycast = () => {};
            child.add(overlay);
            displayOverlay = overlay;
          }
          return;
        }
        if (config.meshNames.ledPattern.test(child.name)) {
          const isScanner = config.meshNames.kittScannerLeds.includes(child.name);
          leds.registerLed(child, isScanner);
        }
      });
    });

    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();

    const setPointer = (event: PointerEvent) => {
      pointer.x = (event.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(event.clientY / window.innerHeight) * 2 + 1;
    };

    const intersectRadio = (): THREE.Intersection[] => {
      if (!radio) return [];
      raycaster.setFromCamera(pointer, camera);
      return raycaster.intersectObjects(radio.children, true);
    };

    const powerOn = () => {};

    const drag = {
      active: false,
      moved: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      yaw: 0,
      pitch: 0,
      spinningHang: null as THREE.Mesh | null
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      drag.active = true;
      drag.moved = false;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;

      setPointer(event);
      const hits = intersectRadio();
      if (hits.length === 0) return;

      console.log('[radio click] hits:', hits.map((h) => h.object.name).join(' > '));

      powerOn();

      const hit = hits.find((h) => !config.meshNames.ignore.includes(h.object.name));
      if (!hit) return;
      const obj = hit.object as THREE.Mesh;
      const name = obj.name;
      console.log('aaaaaa[radio click] picked:', name);

      if (name === 'HANG1' || name === 'HANG2') {
        return;
      }
      if (name === 'Box005') {
        return;
      }
      if (!gsap.isTweening(obj.position)) {
        gsap.to(obj.position, {
          y: obj.position.y - 0.007,
          duration: 0.12,
          ease: 'power2.inOut',
          yoyo: true,
          repeat: 1
        });
      }

      if (name.startsWith('F')) {
        const id = parseInt(name.replace('F', ''));
        if (!isNaN(id)) onSelectImage?.(id);
      }

      if (name === config.meshNames.hang1 || name === config.meshNames.hang2) {
        spinner.start(obj);
        drag.spinningHang = obj;
        return;
      }

      if (name === config.meshNames.display) {
        return;
      }

      if (config.meshNames.trackBoxNames.includes(name)) {
        const track = config.trackBoxes[name];
        if (track) {
          currentTrackRef.current = track;
          display.showTrack(track);
          playSrc(track.src);
        }
        return;
      }

      if (config.meshNames.ledPattern.test(name)) {
        leds.cycleColor(obj);
        return;
      }
    };

    const onPointerMove = (event: PointerEvent) => {
      if (!drag.active) return;
      const dx = event.clientX - drag.lastX;
      const dy = event.clientY - drag.lastY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;

      if (!drag.moved) {
        const totalDx = event.clientX - drag.startX;
        const totalDy = event.clientY - drag.startY;
        if (Math.abs(totalDx) < DRAG_THRESHOLD_PX && Math.abs(totalDy) < DRAG_THRESHOLD_PX) {
          return;
        }
        drag.moved = true;
      }

      drag.yaw = clamp(drag.yaw - dx * orbit.dragSensitivity, -orbit.dragYawLimit, orbit.dragYawLimit);
      drag.pitch = clamp(drag.pitch - dy * orbit.dragSensitivity, orbit.dragPitchMin, orbit.dragPitchMax);
    };

    const onPointerUp = () => {
      drag.active = false;
      if (drag.spinningHang) {
        spinner.stop(drag.spinningHang);
        drag.spinningHang = null;
      }
    };

    window.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    window.addEventListener('pointercancel', onPointerUp);

    const cameraTarget = { z: orbit.baseZ };
    gsap.registerPlugin(ScrollTrigger);
    const camTween = gsap.to(cameraTarget, {
      z: orbit.zoomedZ,
      ease: 'none',
      scrollTrigger: {
        trigger: '#scroll-wrapper',
        start: 'center center',
        end: 'bottom bottom',
        scrub: 1
      }
    });

    const startMs = performance.now();
    let lastMs = startMs;
    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const nowMs = performance.now();
      const dt = (nowMs - lastMs) / 1000;
      lastMs = nowMs;
      const tSec = (nowMs - startMs) / 1000;
      if (radio) {
        radio.position.y = orbit.radioY + Math.sin(tSec * 2) * 0.04;
      }

      const yaw = drag.yaw + Math.sin(tSec * orbit.speedX * 2 * Math.PI) * (orbit.amplitudeX / cameraTarget.z);
      const pitch = drag.pitch + Math.cos(tSec * orbit.speedY * 2 * Math.PI) * (orbit.amplitudeY / cameraTarget.z);
      const r = cameraTarget.z + Math.sin(tSec * orbit.speedZ * 2 * Math.PI) * orbit.amplitudeZ;

      const cosPitch = Math.cos(pitch);
      camera.position.x = Math.sin(yaw) * cosPitch * r;
      camera.position.y = Math.sin(pitch) * r;
      camera.position.z = Math.cos(yaw) * cosPitch * r;
      camera.lookAt(0, orbit.lookAtY, 0);

      leds.update(dt);
      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);

      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      camTween.scrollTrigger?.kill();
      camTween.kill();
      spinner.stopAll();
      dispose();
    };
  }, [playSrc, onSelectImage]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = config.defaultMusic.volume;
    audio.loop = false;

    const onPlay = () => {
      ledStartRef.current?.();
    };
    const onPause = () => {
      ledStopRef.current?.();
    };
    const onEnded = () => {
      ledStopRef.current?.();
    };

    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);
    audio.addEventListener('ended', onEnded);
    return () => {
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
      audio.removeEventListener('ended', onEnded);
    };
  }, []);

  return (
    <>
      <canvas id='bg-canvas' ref={canvasRef} />
      <audio ref={audioRef} preload='auto' hidden />
    </>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
