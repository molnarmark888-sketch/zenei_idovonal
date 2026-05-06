'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import type { PanelMedia } from '@/lib/config';

const COORDS = [
  { x: 0, y: 0 },
  { x: 0, y: -380 },
  { x: 0, y: 380 },
  { x: -280, y: 0 },
  { x: 280, y: 0 },
];

export function ScrollPanels({ panels }: { panels: PanelMedia[] }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    gsap.registerPlugin(ScrollTrigger);

    const panelEls = Array.from(container.querySelectorAll<HTMLElement>('.gallery-panel'));
    panelEls.forEach((el) => gsap.set(el, { z: -1500, opacity: 0 }));

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: '#scroll-wrapper',
        start: 'top top',
        end: 'bottom bottom',
        scrub: 1,
      },
    });

    tl.to('#chrono-title-wrapper', { opacity: 0, scale: 0.8, duration: 1 });
    panelEls.forEach((el, i) => {
      const coord = COORDS[i % COORDS.length];
      tl.to(el, { opacity: 1, z: 0, x: coord.x, y: coord.y, duration: 2 }, '-=1.5');
    });
    tl.to(panelEls, { z: 1200, opacity: 0, stagger: 0.1, duration: 1.5 }, '+=0.5');
    tl.to('#bg-canvas', { opacity: 1, duration: 1 }, '-=0.5');

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, [panels]);

  return (
    <div id="dynamic-panels-container" ref={containerRef}>
      {panels.map((panel, i) => (
        <div className="gallery-panel" key={i}>
          {panel.kind === 'image' ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={panel.src} alt={panel.alt} />
          ) : (
            <video src={panel.src} poster={panel.poster} autoPlay muted loop playsInline />
          )}
        </div>
      ))}
    </div>
  );
}
