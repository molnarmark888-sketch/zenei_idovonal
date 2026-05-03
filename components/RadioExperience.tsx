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
import { createHangSpinner } from '@/lib/three/hangSpinner';

const DRAG_THRESHOLD_PX = 4;

export function RadioExperience() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [currentTrack, setCurrentTrack] = useState<Track>(defaultTrack);
  const currentTrackRef = useRef<Track>(defaultTrack);
  const ledStartRef = useRef<(() => void) | null>(null);
  const ledStopRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    currentTrackRef.current = currentTrack;
  }, [currentTrack]);

  const playSrc = useCallback((src: string) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.src.endsWith(src)) {
      audio.src = src;
    } else {
      audio.currentTime = 0;
    }
    audio.play()
      .then(() => console.log('[radio] playing:', src))
      .catch((err) => console.warn('[radio] audio.play() failed for', src, err));
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
      scannerColor: config.kittScanner.color,
    });
    const spinner = createHangSpinner();

    ledStartRef.current = leds.startKittScanner;
    ledStopRef.current = leds.stopKittScanner;

    const orbit = config.cameraOrbit;
    let radio: THREE.Group | null = null;
    let isPowerOn = false;
    let displayMesh: THREE.Mesh | null = null;

    const titleSprite = new THREE.Sprite(
      new THREE.SpriteMaterial({
        map: display.texture,
        transparent: true,
        depthTest: false,
      }),
    );
    titleSprite.scale.set(4.5, 2.25, 1);
    titleSprite.renderOrder = 999;
    titleSprite.visible = false;
    scene.add(titleSprite);

    new GLTFLoader().load(config.radioModelPath, (gltf: GLTF) => {
      radio = gltf.scene;
      radio.scale.set(7.8, 7.8, 7.8);
      radio.position.set(0, orbit.lookAtY, 0);
      radio.rotation.x = 0.25;
      scene.add(radio);

      radio.traverse((child) => {
        if (!(child instanceof THREE.Mesh)) return;

        if (child.name === config.meshNames.display) {
          child.material = display.material;
          displayMesh = child;
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

    const powerOn = () => {
      if (isPowerOn) return;
      isPowerOn = true;
      display.showText('CHRONO BOOM');
      titleSprite.visible = true;
      if (displayMesh) {
        const mat = displayMesh.material as THREE.MeshStandardMaterial;
        gsap.to(mat, { emissiveIntensity: 3.5, duration: 0.5 });
      }
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
      spinningHang: null as THREE.Mesh | null,
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
      console.log('[radio click] picked:', name);

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
          const audio = audioRef.current;
          if (audio) {
            audio.pause();
            audio.currentTime = 0;
          }
          setCurrentTrack(track);
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

    canvas.addEventListener('pointerdown', onPointerDown);
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
        scrub: 1,
      },
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
        radio.position.y = orbit.lookAtY + Math.sin(tSec * 2) * 0.04;
        titleSprite.position.set(0, radio.position.y + 3.2, 0);
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
      canvas.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      window.removeEventListener('pointercancel', onPointerUp);
      camTween.scrollTrigger?.kill();
      camTween.kill();
      spinner.stopAll();
      dispose();
    };
  }, [playSrc]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = config.defaultMusic.volume;

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

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.loop = currentTrack.src === config.defaultMusic.src ? config.defaultMusic.loop : false;
  }, [currentTrack]);

  return (
    <>
      <canvas id="bg-canvas" ref={canvasRef} />
      <audio ref={audioRef} preload="auto" hidden />
    </>
  );
}

function clamp(v: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, v));
}
