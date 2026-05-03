import * as THREE from 'three';
import type { Track } from '@/lib/config';

export type RadioDisplay = {
  texture: THREE.CanvasTexture;
  material: THREE.MeshStandardMaterial;
  showText: (text: string) => void;
  showTrack: (track: Track) => void;
  clear: () => void;
};

export function createRadioDisplay(): RadioDisplay {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 256;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('2D context not available');

  const texture = new THREE.CanvasTexture(canvas);
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    emissive: new THREE.Color(0x00ff00),
    emissiveIntensity: 0,
    transparent: true,
    opacity: 0.95,
  });

  const fillBackground = () => {
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, 512, 256);
  };

  const showText = (text: string) => {
    fillBackground();
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 60px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowBlur = 20;
    ctx.shadowColor = '#00ff00';
    ctx.fillText(text, 256, 128);
    texture.needsUpdate = true;
  };

  const showTrack = (track: Track) => {
    fillBackground();
    ctx.shadowBlur = 18;
    ctx.shadowColor = '#ffffff';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = 'bold 48px "Courier New", Courier, monospace';
    ctx.fillText(track.title.toUpperCase(), 256, 70);

    ctx.shadowBlur = 8;
    ctx.shadowColor = '#9bf0ff';
    ctx.fillStyle = '#9bf0ff';
    ctx.font = 'bold 28px "Courier New", Courier, monospace';
    ctx.fillText(`${track.artist} · ${track.year}`, 256, 130);

    if (track.description) {
      ctx.shadowBlur = 4;
      ctx.shadowColor = '#cccccc';
      ctx.fillStyle = '#cccccc';
      ctx.font = 'italic 22px "Courier New", Courier, monospace';
      ctx.fillText(track.description, 256, 200);
    }
    texture.needsUpdate = true;
  };

  const clear = () => {
    fillBackground();
    texture.needsUpdate = true;
  };

  clear();

  return { texture, material, showText, showTrack, clear };
}
