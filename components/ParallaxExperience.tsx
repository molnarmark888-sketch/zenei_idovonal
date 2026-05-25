'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '@/lib/config';

export function ParallaxExperience({ sectionId }: { sectionId: number }) {
  const triggerRef = useRef<HTMLDivElement>(null);
  const jelenetRef = useRef<HTMLDivElement>(null);
  const hatterRef = useRef<HTMLImageElement>(null);
  const stageRefs = useRef<Map<string, HTMLImageElement | null>>(new Map());

  const [isInteractive, setIsInteractive] = useState(false);

  const sectionKey = `S${sectionId}` as keyof typeof config.sections;
  const section = config.sections[sectionKey];
  const isEmpty = section.hatter === null && section.retegek.length === 0;

  useEffect(() => {
    if (isEmpty) return;
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      if (section.hatter && hatterRef.current) {
        gsap.set(hatterRef.current, {
          opacity: section.hatter.opacityBase,
          filter: section.hatter.blurRadius > 0 ? `blur(${section.hatter.blurRadius}px)` : 'none',
          scale: section.hatter.scale,
          transformOrigin: 'center center'
        });
      }

      section.retegek.forEach((reteg) => {
        const img = stageRefs.current.get(reteg.name);
        if (!img) return;

        if (reteg.oldal === 'bal') {
          gsap.set(img, { left: 0 });
        } else if (reteg.oldal === 'jobb') {
          gsap.set(img, { left: 'auto', right: 0 });
        } else {
          gsap.set(img, { left: '50%', xPercent: -50 });
        }

        let transformOrigin = 'bottom center';
        if (reteg.fuggoleges === 'fold') {
          gsap.set(img, { bottom: 0 });
          transformOrigin = 'bottom center';
        } else if (reteg.fuggoleges === 'kozep') {
          gsap.set(img, { top: '50%', yPercent: -50 });
          transformOrigin = 'center center';
        } else {
          gsap.set(img, { top: 0 });
          transformOrigin = 'top center';
        }

        gsap.set(img, {
          x: reteg.eltolas,
          y: reteg.yEltolas,
          transformOrigin,
          opacity: reteg.opacityBase,
          filter: reteg.blurRadius > 0 ? `blur(${reteg.blurRadius}px)` : 'none'
        });
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top 80%',
          toggleActions: 'play none none none'
        },
        onComplete: () => {
          setIsInteractive(true);
        }
      });

      if (section.hatter && hatterRef.current) {
        tl.fromTo(
          hatterRef.current,
          { opacity: 0, scale: section.hatter.scale + 0.05 },
          { opacity: section.hatter.opacityBase, scale: section.hatter.scale, duration: 0.8, ease: 'power2.out' },
          0
        );
      }

      [...section.retegek]
        .sort((a, b) => a.belepo.sorrend - b.belepo.sorrend)
        .forEach((reteg) => {
          const img = stageRefs.current.get(reteg.name);
          if (!img) return;
          const baseX = reteg.eltolas;
          const baseY = reteg.yEltolas;
          const b = reteg.belepo;
          tl.fromTo(
            img,
            {
              x: baseX + (b.fromX ?? 0),
              y: baseY + (b.fromY ?? 0),
              scale: b.fromScale ?? 1,
              rotate: b.fromRotate ?? 0,
              opacity: b.fromOpacity ?? 0
            },
            {
              x: baseX,
              y: baseY,
              scale: 1,
              rotate: 0,
              opacity: reteg.opacityBase,
              duration: b.duration,
              ease: b.ease
            },
            b.sorrend
          );
        });
    }, triggerRef);

    return () => ctx.revert();
  }, [sectionId, isEmpty, section]);

  useEffect(() => {
    if (isEmpty) return;

    if (!isInteractive) {
      section.retegek.forEach((reteg) => {
        const img = stageRefs.current.get(reteg.name);
        if (!img) return;
        gsap.to(img, {
          x: reteg.eltolas,
          y: reteg.yEltolas,
          filter: reteg.blurRadius > 0 ? `blur(${reteg.blurRadius}px)` : 'none',
          duration: 0.5,
          overwrite: 'auto'
        });
      });
      if (hatterRef.current) {
        gsap.to(hatterRef.current, { x: 0, y: 0, duration: 0.5, overwrite: 'auto' });
      }
      if (jelenetRef.current) {
        gsap.to(jelenetRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, overwrite: 'auto' });
      }
      return;
    }

    const TILT_MAX_Y = 12;
    const TILT_MAX_X = 6;
    const X_NEAR = 220;
    const X_FAR = 18;
    const Y_NEAR = 110;
    const Y_FAR = 10;
    const DURATION_NEAR = 0.2;
    const DURATION_FAR = 0.65;

    const moveHandler = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;

      if (jelenetRef.current) {
        gsap.to(jelenetRef.current, {
          rotateY: nx * TILT_MAX_Y,
          rotateX: -ny * TILT_MAX_X,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (hatterRef.current) {
        gsap.to(hatterRef.current, {
          x: -nx * X_FAR * 2,
          y: -ny * Y_FAR * 2,
          duration: DURATION_FAR,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }

      section.retegek.forEach((reteg) => {
        const img = stageRefs.current.get(reteg.name);
        if (!img) return;

        const depth = (100 - reteg.tavolsag) / 100;
        const maxX = X_FAR + depth * (X_NEAR - X_FAR);
        const maxY = Y_FAR + depth * (Y_NEAR - Y_FAR);

        let offsetX = -nx * maxX * reteg.parallaxIntenzitas;
        const offsetY = -ny * maxY * reteg.parallaxIntenzitas;
        if (reteg.oldal === 'bal') offsetX = Math.max(offsetX, -maxX * 0.8);
        else if (reteg.oldal === 'jobb') offsetX = Math.min(offsetX, maxX * 0.8);

        const finalX = offsetX + reteg.eltolas;
        const finalY = offsetY + reteg.yEltolas;
        const duration = DURATION_FAR - depth * (DURATION_FAR - DURATION_NEAR);
        const dynamicBlur = reteg.blurRadius + depth * Math.abs(nx) * 1.5;
        const filterVal = dynamicBlur > 0.05 ? `blur(${dynamicBlur.toFixed(2)}px)` : 'none';

        gsap.to(img, {
          x: finalX,
          y: finalY,
          filter: filterVal,
          duration,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    };

    window.addEventListener('mousemove', moveHandler, { passive: true });
    return () => window.removeEventListener('mousemove', moveHandler);
  }, [isInteractive, isEmpty, section]);

  if (isEmpty) {
    return (
      <div className='relative h-screen w-full flex items-center justify-center bg-black'>
        <p className='text-white/70 text-2xl tracking-widest uppercase'>Hamarosan</p>
      </div>
    );
  }

  return (
    <div ref={triggerRef} className='bg-black w-full'>
      <section className='relative h-screen w-full overflow-hidden'>
        <div
          ref={jelenetRef}
          className='absolute inset-0 z-0'
          style={{ perspective: '1500px', transformStyle: 'preserve-3d', willChange: 'transform' }}
        >
          {section.hatter && (
            <img
              ref={hatterRef}
              src={section.hatter.src}
              className='absolute inset-0 w-full h-full object-cover'
              style={{ willChange: 'transform' }}
              alt={`section${sectionId} háttér`}
            />
          )}
          {section.retegek.map((reteg) => (
            <img
              key={reteg.name}
              ref={(el) => {
                stageRefs.current.set(reteg.name, el);
              }}
              src={reteg.src}
              alt={reteg.name}
              className='absolute pointer-events-none'
              style={{
                zIndex: 100 - reteg.tavolsag,
                height: `${reteg.magassag}vh`,
                width: 'auto',
                maxWidth: 'none',
                willChange: 'transform, filter'
              }}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
