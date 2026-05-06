'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

const TITLE = 'CHRONO BOOM';

export function HeroTitle() {
  const titleRef = useRef<HTMLHeadingElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    
    const el = titleRef.current;
    if (!el) return;

    // Animáció és betűk generálása
    el.innerHTML = '';
    TITLE.split('').forEach(ch => {
      const span = document.createElement('span');
      span.textContent = ch === ' ' ? '\u00A0' : ch;
      span.className = 'chrono-char inline-block opacity-0 translate-y-10';
      el.appendChild(span);
    });

    // Belépő animáció
    gsap.to(".chrono-char", {
      opacity: 1,
      y: 0,
      stagger: 0.05,
      duration: 0.8,
      ease: "power4.out"
    });

    // Görgetésre eltűnés
    gsap.to(el, {
      opacity: 0,
      y: -100,
      scrollTrigger: {
        trigger: wrapperRef.current,
        start: "top top",
        end: "bottom center",
        scrub: true,
      }
    });
  }, []);

  return (
    <div ref={wrapperRef} className="w-full h-full flex items-center justify-center bg-black">
      <h1 ref={titleRef} className="text-white text-7xl md:text-9xl font-black tracking-tighter">
        {TITLE}
      </h1>
    </div>
  );
}
