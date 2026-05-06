'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import type { GLTF } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { config, defaultTrack, type Track } from '@/lib/config';
import { createScene } from '@/lib/three/sceneSetup';
import { createRadioDisplay } from '@/lib/three/radioDisplay';
import { createLedController } from '@/lib/three/ledController';
import { useLenis } from '@/components/SmoothScrollProvider';

const DRAG_THRESHOLD_PX = 4;

type DragMode = 'idle' | 'cameraOrbit' | 'hang1' | 'hang2';
type FHoldMode = null | 'F3' | 'F4' | 'F5' | 'F6';

export function RadioExperience({ onF8Activate }: { onF8Activate?: () => void }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const currentTrackRef = useRef<Track>(defaultTrack);
  const ledStartRef = useRef<(() => void) | null>(null);
  const ledStopRef = useRef<(() => void) | null>(null);

  const volumeRef = useRef<number>(config.knob.initialVolume);
  const pitchRef = useRef<number>(config.knob.initialPitch);
  const fHoldRef = useRef<FHoldMode>(null);
  const fHoldRafRef = useRef<number>(0);
  const fHoldLastTimeRef = useRef<number>(0);

  const lenis = useLenis();
  const lenisRef = useRef(lenis);
  useEffect(() => {
    lenisRef.current = lenis;
  }, [lenis]);

  const onF8ActivateRef = useRef(onF8Activate);
  useEffect(() => {
    onF8ActivateRef.current = onF8Activate;
  }, [onF8Activate]);

  const [hudText, setHudText] = useState<string | null>(null);
  const hudTimeoutRef = useRef<number | null>(null);

  const playSrc = useCallback((src: string) => {
    const audio = audioRef.current;
    if (!audio) return;

    if (fHoldRef.current !== null) {
      cancelAnimationFrame(fHoldRafRef.current);
      fHoldRef.current = null;
    }

    const sameSrc = audio.src.endsWith(src);
    if (!sameSrc) {
      audio.pause();
      audio.src = src;
      audio.load();
    } else {
      audio.currentTime = 0;
    }

    audio.volume = volumeRef.current;
    audio.playbackRate = pitchRef.current;

    const playPromise = audio.play();
    if (playPromise) {
      playPromise.catch((err: Error) => {
        console.warn('[radio] audio.play() failed for', src, err.name, err.message);
      });
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

    ledStartRef.current = leds.startKittScanner;
    ledStopRef.current = leds.stopKittScanner;

    const orbit = config.cameraOrbit;
    let radio: THREE.Group | null = null;

    new GLTFLoader().load(config.radioModelPath, (gltf: GLTF) => {
      radio = gltf.scene;
      radio.scale.set(7.8, 7.8, 7.8);
      radio.position.set(0, orbit.radioY, 0);
      radio.rotation.x = 0.25;
      scene.add(radio);

      radio.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        if (child.name === config.meshNames.hang1 || child.name === config.meshNames.hang2) {
          child.geometry = child.geometry.clone();
          child.geometry.computeBoundingBox();
          const bb = child.geometry.boundingBox;
          if (!bb) return;

          const center = new THREE.Vector3();
          bb.getCenter(center);
          child.geometry.translate(-center.x, -center.y, -center.z);

          const oldParent = child.parent;
          if (!oldParent) return;

          const pivot = new THREE.Object3D();
          pivot.name = `${child.name}_pivot`;
          pivot.position.copy(child.position);
          pivot.position.add(center.clone().applyEuler(child.rotation));
          pivot.quaternion.copy(child.quaternion);
          pivot.scale.copy(child.scale);

          oldParent.remove(child);
          child.position.set(0, 0, 0);
          child.rotation.set(0, 0, 0);
          child.quaternion.identity();
          child.scale.set(1, 1, 1);
          pivot.add(child);
          oldParent.add(pivot);
          return;
        }

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

    const drag = {
      active: false,
      moved: false,
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      yaw: 0,
      pitch: 0,
      mode: 'idle' as DragMode,
      modeMesh: null as THREE.Mesh | null,
      pressedMesh: null as THREE.Mesh | null,
      pressedOriginalY: 0
    };

    let lastHudText: string | null = null;

    const showHud = (text: string) => {
      if (lastHudText === text) return;
      lastHudText = text;
      if (hudTimeoutRef.current !== null) {
        clearTimeout(hudTimeoutRef.current);
        hudTimeoutRef.current = null;
      }
      setHudText(text);
    };

    const hideHud = () => {
      if (hudTimeoutRef.current !== null) clearTimeout(hudTimeoutRef.current);
      hudTimeoutRef.current = window.setTimeout(() => {
        setHudText(null);
        lastHudText = null;
        hudTimeoutRef.current = null;
      }, 350);
    };

    const tickFHold = (now: number) => {
      const audio = audioRef.current;
      const mode = fHoldRef.current;
      if (!mode || !audio) return;
      const dt = (now - fHoldLastTimeRef.current) / 1000;
      fHoldLastTimeRef.current = now;
      switch (mode) {
        case 'F3':
          audio.currentTime = Math.max(0, audio.currentTime - config.audioControls.rewindSlow * dt);
          break;
        case 'F4':
          audio.currentTime = Math.max(0, audio.currentTime - config.audioControls.rewindFast * dt);
          break;
        case 'F5':
          audio.playbackRate = config.audioControls.forwardSlow;
          break;
        case 'F6':
          audio.playbackRate = config.audioControls.forwardFast;
          break;
      }
      fHoldRafRef.current = requestAnimationFrame(tickFHold);
    };

    const startFHold = (name: 'F3' | 'F4' | 'F5' | 'F6') => {
      fHoldRef.current = name;
      fHoldLastTimeRef.current = performance.now();
      fHoldRafRef.current = requestAnimationFrame(tickFHold);
    };

    const stopFHold = () => {
      if (fHoldRef.current === null) return;
      cancelAnimationFrame(fHoldRafRef.current);
      fHoldRef.current = null;
      const audio = audioRef.current;
      if (audio) audio.playbackRate = pitchRef.current;
    };

    const pressDown = (obj: THREE.Mesh) => {
      if (drag.pressedMesh) {
        pressRelease();
      }
      drag.pressedMesh = obj;
      drag.pressedOriginalY = obj.position.y;
      gsap.killTweensOf(obj.position);
      gsap.to(obj.position, {
        y: obj.position.y - 0.007,
        duration: 0.12,
        ease: 'power2.out'
      });
    };

    const pressRelease = () => {
      const obj = drag.pressedMesh;
      if (!obj) return;
      const originalY = drag.pressedOriginalY;
      drag.pressedMesh = null;
      gsap.killTweensOf(obj.position);
      gsap.to(obj.position, {
        y: originalY,
        duration: 0.12,
        ease: 'power2.in'
      });
    };

    const startF8Transition = () => {
      onF8ActivateRef.current?.();

      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          const lenisInstance = lenisRef.current;
          lenisInstance?.resize();

          const anchor = document.querySelector(config.f8Transition.parallaxAnchorSelector);
          if (!(anchor instanceof HTMLElement)) return;
          const targetY = anchor.getBoundingClientRect().top + window.scrollY;

          if (lenisInstance) {
            lenisInstance.scrollTo(targetY, { duration: config.f8Transition.duration });
          } else {
            window.scrollTo({ top: targetY, behavior: 'smooth' });
          }
        });
      });
    };

    const onPointerDown = (event: PointerEvent) => {
      if (event.button !== 0) return;

      drag.active = true;
      drag.moved = false;
      drag.startX = event.clientX;
      drag.startY = event.clientY;
      drag.lastX = event.clientX;
      drag.lastY = event.clientY;
      drag.mode = 'idle';
      drag.modeMesh = null;

      setPointer(event);
      const hits = intersectRadio();
      if (hits.length === 0) {
        drag.mode = 'cameraOrbit';
        return;
      }

      const hit = hits.find((h) => !config.meshNames.ignore.includes(h.object.name));
      if (!hit) {
        drag.mode = 'cameraOrbit';
        return;
      }
      const obj = hit.object as THREE.Mesh;
      const name = obj.name;
      const audio = audioRef.current;

      if (name === config.meshNames.hang1) {
        drag.mode = 'hang1';
        drag.modeMesh = obj;
        showHud('♪');
        return;
      }
      if (name === config.meshNames.hang2) {
        drag.mode = 'hang2';
        drag.modeMesh = obj;
        showHud('♬');
        return;
      }
      if (name === 'F8') {
        pressDown(obj);
        showHud('▶▶▶');
        startF8Transition();
        return;
      }
      if (name === config.meshNames.display) {
        return;
      }

      pressDown(obj);

      if (name === 'F1') {
        showHud('▶');
        if (audio) {
          audio.play().catch(() => {});
        }
        return;
      }
      if (name === 'F2') {
        showHud('||');
        if (audio) audio.pause();
        return;
      }
      if (name === 'F3') {
        showHud('◁');
        startFHold(name);
        return;
      }
      if (name === 'F4') {
        showHud('◁◁');
        startFHold(name);
        return;
      }
      if (name === 'F5') {
        showHud('▷');
        startFHold(name);
        return;
      }
      if (name === 'F6') {
        showHud('▷▷');
        startFHold(name);
        return;
      }
      if (name === 'F7') {
        showHud('?');
        return;
      }
      if (name === 'F9') {
        showHud('?');
        return;
      }

      if (config.meshNames.trackBoxNames.includes(name)) {
        const track = config.trackBoxes[name];
        if (track) {
          currentTrackRef.current = track;
          display.showTrack(track);
          playSrc(track.src);
          const idx = config.meshNames.trackBoxNames.indexOf(name);
          const numerals = ['①', '②', '③', '④', '⑤'];
          showHud(numerals[idx] ?? '♫');
        }
        return;
      }

      if (config.meshNames.ledPattern.test(name)) {
        leds.cycleColor(obj);
        showHud('◉');
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

      const audio = audioRef.current;

      if (drag.mode === 'hang1' && audio) {
        volumeRef.current = clamp(volumeRef.current - dy * config.knob.volumeSensitivity, 0, 1);
        audio.volume = volumeRef.current;
        if (dy < 0) showHud('♪ +');
        else if (dy > 0) showHud('♪ −');
        return;
      }

      if (drag.mode === 'hang2' && audio) {
        pitchRef.current = clamp(
          pitchRef.current - dy * config.knob.pitchSensitivity,
          config.knob.pitchMin,
          config.knob.pitchMax
        );
        if (fHoldRef.current === null) {
          audio.playbackRate = pitchRef.current;
        }
        if (dy < 0) showHud('♬ +');
        else if (dy > 0) showHud('♬ −');
        return;
      }

      if (drag.mode === 'cameraOrbit') {
        drag.yaw = clamp(drag.yaw - dx * orbit.dragSensitivity, -orbit.dragYawLimit, orbit.dragYawLimit);
        drag.pitch = clamp(drag.pitch - dy * orbit.dragSensitivity, orbit.dragPitchMin, orbit.dragPitchMax);
      }
    };

    const onPointerUp = () => {
      drag.active = false;
      drag.mode = 'idle';
      drag.modeMesh = null;
      stopFHold();
      pressRelease();
      hideHud();
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
      cancelAnimationFrame(fHoldRafRef.current);
      if (hudTimeoutRef.current !== null) {
        clearTimeout(hudTimeoutRef.current);
        hudTimeoutRef.current = null;
      }
      window.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      camTween.scrollTrigger?.kill();
      camTween.kill();
      dispose();
    };
  }, [playSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volumeRef.current;
    audio.playbackRate = pitchRef.current;
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
      {hudText !== null && (
        <div id='radio-hud' key={hudText}>
          {hudText}
        </div>
      )}
    </>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
