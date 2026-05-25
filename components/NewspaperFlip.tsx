'use client';
import { useEffect, useRef } from 'react';
import { config } from '@/lib/config';

// A lapozható évtized-újság: StPageFlip (page-flip), kész lap-képekből (oldalak).
// Egy lap = a FullHD képernyő fele (960×1080), két lap egymás mellett = teljes FullHD.
export function NewspaperFlip({ sectionId }: { sectionId: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  const sectionKey = `S${sectionId}` as keyof typeof config.sections;
  const oldalak = config.sections[sectionKey].oldalak;

  useEffect(() => {
    if (oldalak.length === 0) return;
    let pageFlip: import('page-flip').PageFlip | null = null;
    let cancelled = false;

    (async () => {
      const { PageFlip } = await import('page-flip');
      if (cancelled || !containerRef.current) return;

      pageFlip = new PageFlip(containerRef.current, {
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

      pageFlip.loadFromImages([...oldalak]);
    })();

    return () => {
      cancelled = true;
      pageFlip?.destroy();
    };
  }, [sectionId, oldalak]);

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
