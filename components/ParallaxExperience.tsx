'use client';
import { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { config } from '@/lib/config';

export function ParallaxExperience() {
  const triggerRef = useRef<HTMLDivElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);

  const bgImgRef = useRef<HTMLImageElement>(null);
  const snoopRef = useRef<HTMLImageElement>(null);
  const repRef = useRef<HTMLImageElement>(null);
  const cityRef = useRef<HTMLDivElement>(null);
  const sinBalRef = useRef<HTMLImageElement>(null);
  const sinJobbRef = useRef<HTMLImageElement>(null);
  const vonatRef = useRef<HTMLImageElement>(null);
  const firstStationRef = useRef<HTMLDivElement>(null);
  const stationBgRef = useRef<HTMLImageElement>(null);
  const lampRef = useRef<HTMLDivElement>(null);
  const stageRefs = useRef<Map<string, HTMLImageElement | null>>(new Map());

  const [isInteractive, setIsInteractive] = useState(false);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      gsap.set(repRef.current, { xPercent: -50, left: '50%', zIndex: 100 });
      gsap.set(vonatRef.current, { xPercent: -50, left: '50%', yPercent: 150, scale: 0.4, opacity: 0, zIndex: 150 });
      gsap.set(sinBalRef.current, { xPercent: -120, opacity: 0 });
      gsap.set(sinJobbRef.current, { xPercent: 120, opacity: 0 });

      gsap.set(firstStationRef.current, {
        opacity: 0,
        scale: 1
      });

      config.stageManager.forEach((entry) => {
        const img = stageRefs.current.get(entry.name);
        if (!img) return;
        if (entry.tavolsag === 100) return;

        if (entry.oldal === 'bal') {
          gsap.set(img, { left: 0 });
        } else if (entry.oldal === 'jobb') {
          gsap.set(img, { left: 'auto', right: 0 });
        } else if (entry.oldal === 'kozep') {
          gsap.set(img, { left: '50%', xPercent: -50 });
        }

        let transformOrigin = 'bottom center';
        if (entry.fuggoleges === 'fold') {
          gsap.set(img, { bottom: 0 });
          transformOrigin = 'bottom center';
        } else if (entry.fuggoleges === 'kozep') {
          gsap.set(img, { top: '50%', yPercent: -50 });
          transformOrigin = 'center center';
        } else if (entry.fuggoleges === 'felso') {
          gsap.set(img, { top: 0 });
          transformOrigin = 'top center';
        }

        gsap.set(img, {
          x: entry.eltolas,
          y: entry.yEltolas,
          transformOrigin,
          opacity: entry.opacityBase,
          filter: entry.blurRadius > 0 ? `blur(${entry.blurRadius}px)` : 'none'
        });
      });

      if (stationBgRef.current) {
        gsap.set(stationBgRef.current, {
          opacity: 0.78,
          filter: 'blur(2px)',
          scale: 1.05,
          transformOrigin: 'center center'
        });
      }

      gsap.to(lampRef.current, {
        opacity: 0.1, duration: 0.05, repeat: -1, yoyo: true, repeatDelay: 0.1,
        ease: 'rough({ strength: 2, points: 20, randomize: true })'
      });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: triggerRef.current,
          start: 'top top',
          end: '+=800%',
          pin: pinRef.current,
          scrub: 0.3,
          onUpdate: (self) => {
            setIsInteractive(self.progress > 0.6);
          }
        }
      });

      tl.fromTo(snoopRef.current, { y: 400, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6 })
        .to(snoopRef.current, { opacity: 0, scale: 1.1, duration: 0.3 }, '-=0.2')
        .fromTo(repRef.current, { yPercent: -150 }, { yPercent: 450, scale: 8, duration: 1, ease: 'power2.in' }, '<')
        .fromTo(cityRef.current, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1 }, '<')
        .to([sinBalRef.current, sinJobbRef.current], { xPercent: 0, opacity: 1, duration: 0.4 }, '-=0.3')
        .to(vonatRef.current, { yPercent: -20, scale: 1.3, opacity: 1, duration: 0.8 }, '-=0.1')
        .to(vonatRef.current, { yPercent: -500, scale: 100, duration: 1.2, ease: 'power4.in' }, '+=0.1')
        .to(firstStationRef.current, { opacity: 1, scale: 1, duration: 1.2 }, '-=2')
        .to([cityRef.current, repRef.current, sinBalRef.current, sinJobbRef.current, bgImgRef.current], { opacity: 0, duration: 0.1 }, '-=0.5')
        .to({}, { duration: 2 });
    }, triggerRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!isInteractive) {
      config.stageManager.forEach((entry) => {
        const img = stageRefs.current.get(entry.name);
        if (!img) return;
        gsap.to(img, {
          x: entry.eltolas,
          y: entry.yEltolas,
          filter: entry.blurRadius > 0 ? `blur(${entry.blurRadius}px)` : 'none',
          duration: 0.5,
          overwrite: 'auto'
        });
      });
      if (stationBgRef.current) {
        gsap.to(stationBgRef.current, { x: 0, y: 0, duration: 0.5, overwrite: 'auto' });
      }
      if (firstStationRef.current) {
        gsap.to(firstStationRef.current, { rotateX: 0, rotateY: 0, duration: 0.6, overwrite: 'auto' });
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

      if (firstStationRef.current) {
        gsap.to(firstStationRef.current, {
          rotateY: nx * TILT_MAX_Y,
          rotateX: -ny * TILT_MAX_X,
          duration: 0.8,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      }

      if (stationBgRef.current) {
        gsap.to(stationBgRef.current, {
          x: -nx * X_FAR * 2,
          y: -ny * Y_FAR * 2,
          duration: DURATION_FAR,
          ease: 'power1.out',
          overwrite: 'auto'
        });
      }

      config.stageManager.forEach((entry) => {
        const img = stageRefs.current.get(entry.name);
        if (!img) return;
        if (entry.tavolsag === 100) return;

        const depth = (100 - entry.tavolsag) / 100;
        const maxX = X_FAR + depth * (X_NEAR - X_FAR);
        const maxY = Y_FAR + depth * (Y_NEAR - Y_FAR);

        const intensity = entry.parallaxIntenzitas;
        let offsetX = -nx * maxX * intensity;
        let offsetY = -ny * maxY * intensity;
        if (entry.oldal === 'bal') offsetX = Math.max(offsetX, -maxX * 0.8);
        else if (entry.oldal === 'jobb') offsetX = Math.min(offsetX, maxX * 0.8);
        offsetX += entry.eltolas;
        offsetY += entry.yEltolas;

        const duration = DURATION_FAR - depth * (DURATION_FAR - DURATION_NEAR);
        const dynamicBlur = entry.blurRadius + depth * Math.abs(nx) * 1.5;
        const filterVal = dynamicBlur > 0.05 ? `blur(${dynamicBlur.toFixed(2)}px)` : 'none';

        gsap.to(img, {
          x: offsetX,
          y: offsetY,
          filter: filterVal,
          duration,
          ease: 'power2.out',
          overwrite: 'auto'
        });
      });
    };

    window.addEventListener('mousemove', moveHandler, { passive: true });
    return () => window.removeEventListener('mousemove', moveHandler);
  }, [isInteractive]);

  return (
    <div ref={triggerRef} className='bg-black w-full'>
      <section ref={pinRef} className='relative h-screen w-full overflow-hidden'>
        {/* FIRST STATION — interaktív zárókép, stageManager-rétegekkel */}
        <div
          ref={firstStationRef}
          className='absolute inset-0 z-0'
          style={{
            perspective: '1500px',
            transformStyle: 'preserve-3d',
            willChange: 'transform'
          }}
        >
          <img
            ref={stationBgRef}
            src='/img/stage-metro-station/station-bg.jpg'
            className='absolute inset-0 w-full h-full object-cover'
            style={{ willChange: 'transform' }}
            alt='firstStation háttér'
          />
          {config.stageManager.map((entry) => {
            if (entry.tavolsag === 100) return null;
            return (
              <img
                key={entry.name}
                ref={(el) => {
                  stageRefs.current.set(entry.name, el);
                }}
                src={`/${entry.hatter}`}
                alt={entry.name}
                className='absolute pointer-events-none'
                style={{
                  zIndex: 100 - entry.tavolsag,
                  height: `${entry.magassag}vh`,
                  width: 'auto',
                  maxWidth: 'none',
                  willChange: 'transform, filter'
                }}
              />
            );
          })}
        </div>

        {/* LÁMPA */}
        <div
          ref={lampRef}
          className='absolute right-[5%] top-[40%] w-[500px] h-[600px] bg-yellow-600/20 rounded-full blur-[130px] z-10 pointer-events-none'
          style={{ mixBlendMode: 'plus-lighter' }}
        />

        {/* ELŐZŐ JELENET RÉTEGEI */}
        <img
          id='parallax-bg'
          ref={bgImgRef}
          src='/img/bg.jpg'
          className='absolute inset-0 w-full h-full object-cover z-10'
          alt='parallax háttér'
        />

        <div className='absolute inset-0 z-20 flex items-end justify-center pointer-events-none'>
          <img ref={snoopRef} src='/img/snoop.png' className='w-auto h-[80vh] object-contain' alt='snoop' />
        </div>

        <div ref={cityRef} className='absolute inset-0 z-30 w-full h-full'>
          <img src='/img/city.jpg' className='w-full h-full object-cover' alt='city' />
          <img ref={sinBalRef} src='/img/sin.png' className='absolute left-0 top-0 h-full w-1/3 object-cover z-40 rotate-90' alt='sin bal' />
          <img ref={sinJobbRef} src='/img/sin.png' className='absolute right-0 top-25 h-full w-1/3 object-cover z-40 -rotate-90' alt='sin jobb' />
          <img ref={vonatRef} src='/img/vonat.png' className='absolute bottom-0 w-full max-w-[1000px] h-auto z-50 pointer-events-none' alt='vonat' />
        </div>

        <img ref={repRef} src='/img/rep.png' className='absolute top-0 w-[60%] h-auto z-[100] pointer-events-none' alt='rep' />
      </section>
    </div>
  );
}
