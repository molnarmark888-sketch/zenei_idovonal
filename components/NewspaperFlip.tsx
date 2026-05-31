'use client';
import { useEffect, useRef } from 'react';
import { config } from '@/lib/config';

// A lapozható évtized-újság: StPageFlip (page-flip), kész lap-képekből (oldalak).
// Egy lap = a FullHD képernyő fele (960×1080), két lap egymás mellett = teljes FullHD.
// A returnNonce NÖVELÉSÉRE (vissza-gomb) az újság visszalapoz az 1. oldalra.
export function NewspaperFlip({ sectionId, returnNonce = 0 }: { sectionId: number; returnNonce?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const pageFlipRef = useRef<import('page-flip').PageFlip | null>(null);
  const flipAudioRef = useRef<HTMLAudioElement | null>(null);

  const sectionKey = `S${sectionId}` as keyof typeof config.sections;
  const oldalak = config.sections[sectionKey].oldalak;

  useEffect(() => {
    if (oldalak.length === 0) return;
    let cancelled = false;

    (async () => {
      const { PageFlip } = await import('page-flip');
      if (cancelled || !containerRef.current) return;

      const pf = new PageFlip(containerRef.current, {
        width: config.newspaper.width,
        height: config.newspaper.height,
        size: 'stretch',
        minWidth: config.newspaper.minWidth,
        maxWidth: config.newspaper.maxWidth,
        minHeight: config.newspaper.minHeight,
        maxHeight: config.newspaper.maxHeight,
        showCover: false,
        usePortrait: false,
        flippingTime: config.newspaper.flippingTime,
        maxShadowOpacity: 0.5,
        drawShadow: true
      });

      // Lapozás-hang: a 'changeState' → 'flipping' a lapozás kezdetén szól.
      // Külön Audio elem, a fő zene (RadioExperience <audio>) közben szól tovább.
      const flipAudio = new Audio(config.newspaper.flipSound);
      flipAudio.volume = 0.6;
      flipAudioRef.current = flipAudio;

      pf.on('changeState', (e) => {
        if (e.data === 'flipping') {
          flipAudio.currentTime = 0;
          flipAudio.play().catch(() => {});
        }
      });

      pf.loadFromImages([...oldalak]);
      pageFlipRef.current = pf;
    })();

    return () => {
      cancelled = true;
      pageFlipRef.current?.destroy();
      pageFlipRef.current = null;
      flipAudioRef.current?.pause();
      flipAudioRef.current = null;
    };
  }, [sectionId, oldalak]);

  // A "Vissza a rádióhoz" gomb növeli a returnNonce-t → visszalapozás az 1. oldalra.
  // prev-ref guard: mountkor NEM lapozunk (akkor is, ha returnNonce már > 0).
  const prevReturnNonce = useRef(returnNonce);
  useEffect(() => {
    if (returnNonce > prevReturnNonce.current) {
      pageFlipRef.current?.flip(0);
    }
    prevReturnNonce.current = returnNonce;
  }, [returnNonce]);

  if (oldalak.length === 0) {
    return (
      <div className='relative h-screen w-full flex items-center justify-center bg-black'>
        <p className='text-white/60 text-xl tracking-widest uppercase'>Az újság lapjai hamarosan</p>
      </div>
    );
  }

  return (
    <div className='relative h-screen w-full flex items-center justify-center overflow-hidden bg-black'>
      <div ref={containerRef} className='newspaper-flip w-full max-w-[1920px]' />
    </div>
  );
}
