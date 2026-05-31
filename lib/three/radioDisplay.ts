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

  // Greedy szó-tördelés az aktuális ctx.font szerint (a hosszú címek több sorba kerülnek)
  const wrapByWidth = (text: string, maxWidth: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let current = '';
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current === '' || ctx.measureText(candidate).width <= maxWidth) {
        current = candidate;
      } else {
        lines.push(current);
        current = word;
      }
    }
    if (current) lines.push(current);
    return lines;
  };

  const showTrack = (track: Track) => {
    fillBackground();
    ctx.shadowBlur = 0;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const ctxAny = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
    ctxAny.letterSpacing = '-4px';
    ctx.fillStyle = '#ffffff';

    // Cím: a lehető legnagyobb font (≤60px), amivel max 3 sorba tördelve befér a [20,140] sávba.
    // 20px garantált felső padding; a cím-blokk a sávon belül függőlegesen középre.
    const TOP_PADDING = 20;
    const TITLE_BAND_BOTTOM = 140;
    const MAX_LINES = 3;
    const MAX_TITLE_WIDTH = 472;
    const bandHeight = TITLE_BAND_BOTTOM - TOP_PADDING;
    const titleText = track.title.toUpperCase();

    let titleFont = 60;
    let titleLines: string[] = [];
    for (; titleFont >= 28; titleFont -= 2) {
      ctx.font = `bold ${titleFont}px "Courier New", Courier, monospace`;
      titleLines = wrapByWidth(titleText, MAX_TITLE_WIDTH);
      if (titleLines.length <= MAX_LINES && titleLines.length * (titleFont * 1.08) <= bandHeight) break;
    }
    ctx.font = `bold ${titleFont}px "Courier New", Courier, monospace`;

    const titleLineHeight = titleFont * 1.08;
    const blockHeight = titleLines.length * titleLineHeight;
    const blockTop = TOP_PADDING + Math.max(0, (bandHeight - blockHeight) / 2);
    titleLines.forEach((line, i) => {
      ctx.fillText(line, 256, blockTop + i * titleLineHeight + titleLineHeight / 2);
    });

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
