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
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.anisotropy = 16;
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
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#00ff00';
    ctx.font = 'bold 60px "Courier New", Courier, monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, 256, 128);
    texture.needsUpdate = true;
  };

  const splitToTwoLines = (text: string, maxWidth: number): string[] => {
    if (ctx.measureText(text).width <= maxWidth) return [text];
    const words = text.split(' ');
    if (words.length < 2) return [text];
    let best: string[] = [text];
    let bestDiff = Infinity;
    for (let i = 1; i < words.length; i++) {
      const a = words.slice(0, i).join(' ');
      const b = words.slice(i).join(' ');
      const wA = ctx.measureText(a).width;
      const wB = ctx.measureText(b).width;
      if (wA <= maxWidth && wB <= maxWidth) {
        const diff = Math.abs(wA - wB);
        if (diff < bestDiff) {
          bestDiff = diff;
          best = [a, b];
        }
      }
    }
    return best;
  };

  const showTrack = (track: Track) => {
    fillBackground();
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const ctxAny = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    ctxAny.letterSpacing = '-4px';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 60px "Courier New", Courier, monospace';
    const titleLines = splitToTwoLines(track.title.toUpperCase(), 480);
    if (titleLines.length === 1) {
      ctx.fillText(titleLines[0], 256, 60);
    } else {
      ctx.fillText(titleLines[0], 256, 35);
      ctx.fillText(titleLines[1], 256, 95);
    }

    ctxAny.letterSpacing = '-1px';
    ctx.fillStyle = '#9bf0ff';
    ctx.font = 'bold 34px "Courier New", Courier, monospace';
    ctx.fillText(`${track.artist} · ${track.year}`, 256, 160);

    if (track.description) {
      ctxAny.letterSpacing = '0px';
      ctx.fillStyle = '#cccccc';
      ctx.font = 'italic 26px "Courier New", Courier, monospace';
      ctx.fillText(track.description, 256, 215);
    }

    ctxAny.letterSpacing = '0px';
    texture.needsUpdate = true;
  };

  const clear = () => {
    fillBackground();
    texture.needsUpdate = true;
  };

  clear();

  return { texture, material, showText, showTrack, clear };
}
